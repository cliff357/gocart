/**
 * Shop Page Tests
 * 
 * 測試商店頁面：商品列表、搜索篩選、分類篩選、分類名載入
 * 
 * 📅 2026-03-17
 * 📋 Phase 3 Gap #2 — 78 行，核心購物頁面，此前只有 E2E 基本 render
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import productReducer from '@/lib/features/product/productSlice';

// ============================================
// Mocks
// ============================================

// Mock next/navigation — useSearchParams + useRouter
const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
    useSearchParams: () => mockSearchParams,
}));

// Mock next/link
jest.mock('next/link', () => {
    return ({ children, href }) => <a href={href}>{children}</a>;
});

// Mock next/image
jest.mock('next/image', () => {
    return (props) => <img {...props} />;
});

// Mock categoryService
const mockGetById = jest.fn();
jest.mock('@/lib/services/FirestoreService', () => ({
    categoryService: {
        getById: (...args) => mockGetById(...args),
    },
}));

// Import after mocks
import Shop from '@/app/(public)/shop/page';

// ============================================
// Helpers
// ============================================

const mockProducts = [
    {
        id: 'p1',
        name: 'Green Tea',
        price: 50,
        category: 'cat-drinks',
        images: ['https://example.com/tea.jpg'],
    },
    {
        id: 'p2',
        name: 'Red Scarf',
        price: 120,
        category: 'cat-accessories',
        images: ['https://example.com/scarf.jpg'],
    },
    {
        id: 'p3',
        name: 'Green Bag',
        price: 200,
        category: 'cat-accessories',
        images: ['https://example.com/bag.jpg'],
    },
];

const createStore = (products = mockProducts) =>
    configureStore({
        reducer: { product: productReducer },
        preloadedState: {
            product: { list: products, loading: false, error: null, currentProduct: null, searchResults: [] },
        },
    });

const renderShop = (products = mockProducts) =>
    render(
        <Provider store={createStore(products)}>
            <Shop />
        </Provider>
    );

// ============================================
// Tests
// ============================================

describe('Shop 頁面', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockSearchParams = new URLSearchParams();
    });

    // ------------------------------------------
    // 基本渲染
    // ------------------------------------------

    it('顯示 "All Products" 標題和所有商品', () => {
        renderShop();

        expect(screen.getByText('All')).toBeInTheDocument();
        expect(screen.getByText('Products')).toBeInTheDocument();
        expect(screen.getByText('Green Tea')).toBeInTheDocument();
        expect(screen.getByText('Red Scarf')).toBeInTheDocument();
        expect(screen.getByText('Green Bag')).toBeInTheDocument();
    });

    // ------------------------------------------
    // 搜索篩選
    // ------------------------------------------

    it('?search=green → 只顯示名稱匹配的商品', () => {
        mockSearchParams = new URLSearchParams('search=green');
        renderShop();

        expect(screen.getByText('Green Tea')).toBeInTheDocument();
        expect(screen.getByText('Green Bag')).toBeInTheDocument();
        expect(screen.queryByText('Red Scarf')).not.toBeInTheDocument();
    });

    it('搜索時顯示返回箭頭圖標', () => {
        mockSearchParams = new URLSearchParams('search=green');
        const { container } = renderShop();

        // MoveLeftIcon renders as an SVG
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    // ------------------------------------------
    // 分類篩選
    // ------------------------------------------

    it('?category=cat-accessories → 只顯示該分類商品 + 載入分類名', async () => {
        mockSearchParams = new URLSearchParams('category=cat-accessories');
        mockGetById.mockResolvedValueOnce({ name: 'Accessories' });

        renderShop();

        // 篩選結果
        expect(screen.getByText('Red Scarf')).toBeInTheDocument();
        expect(screen.getByText('Green Bag')).toBeInTheDocument();
        expect(screen.queryByText('Green Tea')).not.toBeInTheDocument();

        // 分類名載入
        await waitFor(() => {
            expect(screen.getByText('Accessories')).toBeInTheDocument();
        });
        expect(screen.getByText('Category:')).toBeInTheDocument();
        expect(mockGetById).toHaveBeenCalledWith('cat-accessories');
    });

    it('分類名載入失敗 → fallback 顯示 category ID', async () => {
        mockSearchParams = new URLSearchParams('category=cat-unknown');
        mockGetById.mockRejectedValueOnce(new Error('Not found'));

        renderShop();

        await waitFor(() => {
            expect(screen.getByText('cat-unknown')).toBeInTheDocument();
        });
    });

    // ------------------------------------------
    // 空狀態
    // ------------------------------------------

    it('商品列表為空時不 crash', () => {
        renderShop([]);

        expect(screen.getByText('All')).toBeInTheDocument();
        expect(screen.getByText('Products')).toBeInTheDocument();
    });
});
