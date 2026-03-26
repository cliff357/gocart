/**
 * ProductDetails Component Tests
 * 
 * 測試產品詳情頁核心組件：圖片畫廊、價格折扣、選項選擇、相關產品、Reserve 流程
 * 
 * 📅 2026-03-16
 * 📋 Phase 3 Gap #1 — 全站最複雜用戶面向組件，259 行，此前零覆蓋
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductDetails from '@/components/ProductDetails';
import { mockProduct } from '../utils/test-utils';

// ============================================
// Mocks
// ============================================

// Mock next/image
jest.mock('next/image', () => {
    return (props) => <img {...props} />;
});

// Mock next/link
jest.mock('next/link', () => {
    return ({ children, href }) => <a href={href}>{children}</a>;
});

// Mock ReservationModal — 已有獨立測試，這裡只驗證 props 傳遞
const mockReservationModal = jest.fn(() => null);
jest.mock('@/components/ReservationModal', () => {
    return (props) => {
        mockReservationModal(props);
        if (!props.isOpen) return null;
        return <div data-testid="reservation-modal">ReservationModal</div>;
    };
});

// Mock productService
const mockGetById = jest.fn();
jest.mock('@/lib/services/FirestoreService', () => ({
    productService: {
        getById: (...args) => mockGetById(...args),
    },
}));

// ============================================
// Test Data
// ============================================

// 基於 test-utils mockProduct，擴展 relatedProducts 字段
const baseProduct = {
    ...mockProduct,
    // mockProduct 已有: id, name, description, price:100, mrp:150, images:[img1,img2], options:[Size:S/M/L]
};

const singleImageProduct = {
    ...baseProduct,
    images: ['https://example.com/single.jpg'],
};

const noDiscountProduct = {
    ...baseProduct,
    mrp: 100, // mrp === price → 無折扣
};

const noOptionsProduct = {
    ...baseProduct,
    options: [],
};

const productWithRelated = {
    ...baseProduct,
    relatedProducts: ['related-1', 'related-2'],
};

const relatedProduct1 = {
    id: 'related-1',
    name: 'Related Style A',
    images: ['https://example.com/related1.jpg'],
};

const relatedProduct2 = {
    id: 'related-2',
    name: 'Related Style B',
    images: ['https://example.com/related2.jpg'],
};

// ============================================
// Tests
// ============================================

describe('ProductDetails 組件', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        // Default: 無 currency env
        delete process.env.NEXT_PUBLIC_CURRENCY_SYMBOL;
    });

    // ------------------------------------------
    // 基本渲染
    // ------------------------------------------

    it('顯示產品名稱、價格、描述', () => {
        render(<ProductDetails product={baseProduct} />);

        expect(screen.getByText(baseProduct.name)).toBeInTheDocument();
        expect(screen.getByText(`$${baseProduct.price}`)).toBeInTheDocument();
        expect(screen.getByText(baseProduct.description)).toBeInTheDocument();
    });

    it('顯示 Back to Shop link 和 Shipping info', () => {
        render(<ProductDetails product={baseProduct} />);

        const backLink = screen.getByText('Back to Shop');
        expect(backLink.closest('a')).toHaveAttribute('href', '/shop');
        expect(screen.getByText('Free shipping on orders over $300')).toBeInTheDocument();
    });

    it('顯示 Reserve 按鈕', () => {
        render(<ProductDetails product={baseProduct} />);

        const reserveBtn = screen.getByRole('button', { name: /reserve/i });
        expect(reserveBtn).toBeInTheDocument();
    });

    // ------------------------------------------
    // 圖片畫廊
    // ------------------------------------------

    it('多圖模式 — 顯示所有圖片和縮略圖', () => {
        const { container } = render(<ProductDetails product={baseProduct} />);

        // baseProduct 有 2 張圖 → 應有多個 img 元素
        const images = container.querySelectorAll('img');
        // Desktop grid (2) + Mobile main (1) + Mobile thumbnails (2) = 5
        expect(images.length).toBeGreaterThanOrEqual(4);
    });

    it('單圖模式 — 隱藏縮略圖列', () => {
        const { container } = render(<ProductDetails product={singleImageProduct} />);

        // 單圖：Desktop (1) + Mobile main (1) = 2 img
        const images = container.querySelectorAll('img');
        expect(images.length).toBe(2);
    });

    // ------------------------------------------
    // 價格 / 折扣
    // ------------------------------------------

    it('有折扣 → 顯示原價刪除線 + Save % badge', () => {
        render(<ProductDetails product={baseProduct} />);

        // price: 100, mrp: 150 → Save 33%
        expect(screen.getByText(`$${baseProduct.price}`)).toBeInTheDocument();
        expect(screen.getByText(`$${baseProduct.mrp}`)).toBeInTheDocument();
        expect(screen.getByText(/Save 33%/)).toBeInTheDocument();
    });

    it('無折扣 → 唔顯示原價同 Save badge', () => {
        render(<ProductDetails product={noDiscountProduct} />);

        expect(screen.getByText(`$${noDiscountProduct.price}`)).toBeInTheDocument();
        expect(screen.queryByText(/Save/)).not.toBeInTheDocument();
    });

    // ------------------------------------------
    // 產品選項
    // ------------------------------------------

    it('點擊選項按鈕切換 selectedOptions', async () => {
        const user = userEvent.setup();
        render(<ProductDetails product={baseProduct} />);

        // 預設選中第一個: S
        const sizeM = screen.getByRole('button', { name: 'M' });
        await user.click(sizeM);

        // 驗證 M 按鈕有 active style (border-green-600)
        expect(sizeM.className).toContain('border-green-600');

        // S 應該失去 active style
        const sizeS = screen.getByRole('button', { name: 'S' });
        expect(sizeS.className).not.toContain('border-green-600');
    });

    // ------------------------------------------
    // 相關產品
    // ------------------------------------------

    it('載入 relatedProducts → 顯示 Other Styles links', async () => {
        mockGetById
            .mockResolvedValueOnce(relatedProduct1)
            .mockResolvedValueOnce(relatedProduct2);

        render(<ProductDetails product={productWithRelated} />);

        await waitFor(() => {
            expect(screen.getByText('Other Styles')).toBeInTheDocument();
        });

        expect(screen.getByText('Related Style A')).toBeInTheDocument();
        expect(screen.getByText('Related Style B')).toBeInTheDocument();

        // 確認連結正確
        const linkA = screen.getByText('Related Style A').closest('a');
        expect(linkA).toHaveAttribute('href', '/product/related-1');

        // 確認 getById 被呼叫
        expect(mockGetById).toHaveBeenCalledWith('related-1');
        expect(mockGetById).toHaveBeenCalledWith('related-2');
    });

    // ------------------------------------------
    // Reserve Modal
    // ------------------------------------------

    it('點 Reserve → 打開 ReservationModal，傳遞 selectedOptions', async () => {
        const user = userEvent.setup();
        render(<ProductDetails product={baseProduct} />);

        // Modal 初始不顯示
        expect(screen.queryByTestId('reservation-modal')).not.toBeInTheDocument();

        // 點 Reserve
        await user.click(screen.getByRole('button', { name: /reserve/i }));

        // Modal 顯示
        expect(screen.getByTestId('reservation-modal')).toBeInTheDocument();

        // 驗證傳入 props
        const lastCall = mockReservationModal.mock.calls[mockReservationModal.mock.calls.length - 1][0];
        expect(lastCall.isOpen).toBe(true);
        expect(lastCall.product).toEqual(baseProduct);
        expect(lastCall.selectedOptions).toEqual({ Size: 'S' }); // 預設選第一個
    });
});
