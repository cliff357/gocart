/**
 * UI Components 測試 - P2
 * 
 * 測試 LatestProducts, BestSelling, ProductDescription, AboutSection
 * 
 * 📅 2026-03-02
 */

import React from 'react';
import '@testing-library/jest-dom';
import { renderWithProviders, mockProduct } from '../utils/test-utils';
import { screen, fireEvent } from '@testing-library/react';

// ============================================
// Mocks
// ============================================

// Mock next/link
jest.mock('next/link', () => {
    return ({ children, href, ...props }) => <a href={href} {...props}>{children}</a>;
});

// Mock next/image
jest.mock('next/image', () => {
    return (props) => <img {...props} />;
});

// Mock FirebaseFirestoreService
jest.mock('@/lib/firebase/firestore', () => ({
    FirebaseFirestoreService: {
        getDocument: jest.fn().mockResolvedValue({ success: true, data: null }),
    }
}));

// ============================================
// Test Data
// ============================================

const mockProducts = [
    {
        ...mockProduct,
        id: 'prod-1',
        name: '最新產品 A',
        price: 100,
        createdAt: '2026-02-01T00:00:00Z',
        totalRatings: 10,
        rating: [5, 4, 3, 4, 5, 5, 4, 3, 5, 4],
    },
    {
        ...mockProduct,
        id: 'prod-2',
        name: '最新產品 B',
        price: 200,
        createdAt: '2026-02-15T00:00:00Z',
        totalRatings: 5,
        rating: [5, 4, 3, 5, 4],
    },
    {
        ...mockProduct,
        id: 'prod-3',
        name: '最新產品 C',
        price: 300,
        createdAt: '2026-02-20T00:00:00Z',
        totalRatings: 20,
        rating: [],
    },
    {
        ...mockProduct,
        id: 'prod-4',
        name: '最新產品 D',
        price: 150,
        createdAt: '2026-01-01T00:00:00Z',
        totalRatings: 0,
        rating: [],
    },
    {
        ...mockProduct,
        id: 'prod-5',
        name: '最新產品 E',
        price: 500,
        createdAt: '2026-03-01T00:00:00Z',
        totalRatings: 15,
        rating: [5, 5, 5],
    },
];

const preloadedState = {
    product: {
        list: mockProducts,
        currentProduct: null,
        searchResults: [],
        loading: false,
        error: null,
    },
    cart: { cartItems: {}, totalItems: 0 },
    address: { list: [] },
};

// ============================================
// LatestProducts 組件
// ============================================

import LatestProducts from '@/components/LatestProducts';

describe('LatestProducts 組件', () => {

    it('應該顯示 Latest Products 標題', () => {
        renderWithProviders(<LatestProducts />, { preloadedState });
        expect(screen.getByText('Latest Products')).toBeInTheDocument();
    });

    it('應該最多顯示 4 件產品', () => {
        renderWithProviders(<LatestProducts />, { preloadedState });
        // 5 products in store, but only 4 should display
        const links = screen.getAllByRole('link').filter(a => a.getAttribute('href')?.startsWith('/product/'));
        expect(links.length).toBeLessThanOrEqual(4);
    });

    it('應該按 createdAt 降序排列（最新在前）', () => {
        renderWithProviders(<LatestProducts />, { preloadedState });
        // prod-5 (2026-03-01) should be first, then prod-3 (2026-02-20), prod-2 (2026-02-15), prod-1 (2026-02-01)
        const productNames = screen.getAllByText(/最新產品/).map(el => el.textContent);
        expect(productNames[0]).toBe('最新產品 E'); // most recent
        expect(productNames[1]).toBe('最新產品 C');
        expect(productNames[2]).toBe('最新產品 B');
        expect(productNames[3]).toBe('最新產品 A');
    });

    it('不應該顯示第 5 件產品', () => {
        renderWithProviders(<LatestProducts />, { preloadedState });
        // prod-4 is the oldest, should be excluded
        // But we need to check the displayed count, not specific names (prod-4 might not show)
        const productLinks = screen.getAllByRole('link').filter(a => a.getAttribute('href')?.startsWith('/product/'));
        expect(productLinks).toHaveLength(4);
    });

    it('應該顯示 View more 連結到 /shop', () => {
        renderWithProviders(<LatestProducts />, { preloadedState });
        const viewMore = screen.getByText('View more');
        expect(viewMore.closest('a')).toHaveAttribute('href', '/shop');
    });

    it('應該顯示正確的產品數量描述', () => {
        renderWithProviders(<LatestProducts />, { preloadedState });
        expect(screen.getByText(/Showing 4 of 5 products/)).toBeInTheDocument();
    });

    it('產品數量少於 4 時應該全部顯示', () => {
        const smallState = {
            ...preloadedState,
            product: { ...preloadedState.product, list: mockProducts.slice(0, 2) },
        };
        renderWithProviders(<LatestProducts />, { preloadedState: smallState });
        expect(screen.getByText(/Showing 2 of 2 products/)).toBeInTheDocument();
    });
});

// ============================================
// AboutSection 組件
// ============================================

import AboutSection from '@/components/AboutSection';

describe('AboutSection 組件', () => {

    it('應該顯示 About LoyaultyClub 標題', () => {
        renderWithProviders(<AboutSection />);
        expect(screen.getByText('About LoyaultyClub')).toBeInTheDocument();
    });

    it('應該顯示品牌名稱', () => {
        renderWithProviders(<AboutSection />);
        expect(screen.getByText('老友賣蘿柚企劃')).toBeInTheDocument();
    });

    it('應該顯示品牌描述文字', () => {
        renderWithProviders(<AboutSection />);
        expect(screen.getByText(/專注於本土手作同創意設計/)).toBeInTheDocument();
    });

    it('應該顯示第二段描述文字', () => {
        renderWithProviders(<AboutSection />);
        expect(screen.getByText(/每一件作品都承載住創作者/)).toBeInTheDocument();
    });

    it('預設應該渲染 video 元素', () => {
        const { container } = renderWithProviders(<AboutSection />);
        const video = container.querySelector('video');
        expect(video).toBeInTheDocument();
        expect(video).toHaveAttribute('src', '/about_us.mov');
    });
});
