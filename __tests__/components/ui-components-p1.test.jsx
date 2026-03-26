/**
 * P1 UI 組件測試（第二批）
 *
 * 測試 Navbar, Footer, Banner, Hero, PageTitle,
 * Newsletter, OurSpecs, CategoriesMarquee 組件
 *
 * 運行方式：
 *   npm run test:components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// ============================================
// Mock Next.js modules
// ============================================
jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ priority, fill, ...props }) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img {...props} data-priority={priority ? 'true' : undefined} />;
    },
}));

jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href, ...rest }) => <a href={href} {...rest}>{children}</a>,
}));

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    }),
}));

jest.mock('@/assets/assets', () => ({
    assets: {
        logo: '/test-logo.png',
        hero_model_img: '/hero-model.png',
        hero_product_img1: '/hero-product1.png',
        hero_product_img2: '/hero-product2.png',
    },
}));

jest.mock('react-hot-toast', () => ({
    success: jest.fn(),
}));

// ============================================
// Import Components (after mocks)
// ============================================

// Mock FirestoreService to prevent Firebase calls
jest.mock('@/lib/services/FirestoreService', () => ({
    categoryService: {
        getAll: jest.fn().mockResolvedValue([]),
        getTree: jest.fn().mockResolvedValue([]),
    },
    productService: {
        getAll: jest.fn().mockResolvedValue([]),
    },
}));

// Mock lib/firebase/firestore — Hero.jsx imports FirebaseFirestoreService from here.
// Without this mock, the real firebase/firestore SDK (~500KB+) loads and causes OOM.
jest.mock('@/lib/firebase/firestore', () => ({
    FirebaseFirestoreService: {
        getDocument: jest.fn().mockResolvedValue({ success: false, data: null }),
        getCollection: jest.fn().mockResolvedValue({ success: false, data: [] }),
        addDocument: jest.fn().mockResolvedValue({ success: false }),
        updateDocument: jest.fn().mockResolvedValue({ success: false }),
        deleteDocument: jest.fn().mockResolvedValue({ success: false }),
        queryDocuments: jest.fn().mockResolvedValue({ success: false, data: [] }),
        COLLECTIONS: {
            USERS: 'users',
            PRODUCTS: 'products',
            STORES: 'stores',
            ORDERS: 'orders',
            RATINGS: 'ratings',
            ADDRESSES: 'addresses',
            COUPONS: 'coupons',
            CATEGORIES: 'categories',
        },
    },
}));

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';

// ============================================
// Navbar Component Tests
// ============================================
describe('Navbar 組件', () => {
    it('應該渲染 Logo', () => {
        render(<Navbar />);
        const logo = document.querySelector('img');
        expect(logo).toBeInTheDocument();
    });

    it('應該有首頁連結', () => {
        render(<Navbar />);
        const homeLinks = screen.getAllByText('Home');
        expect(homeLinks.length).toBeGreaterThan(0);
    });

    it('應該有 Shop 連結', () => {
        render(<Navbar />);
        const shopLinks = screen.getAllByText('Shop');
        expect(shopLinks.length).toBeGreaterThan(0);
    });

    it('應該有搜尋輸入框', () => {
        render(<Navbar />);
        const searchInput = screen.getByPlaceholderText('Search products');
        expect(searchInput).toBeInTheDocument();
    });

    it('應該有 About 連結', () => {
        render(<Navbar />);
        const aboutLinks = screen.getAllByText('About');
        expect(aboutLinks.length).toBeGreaterThan(0);
    });

    it('搜尋輸入框可以輸入文字', () => {
        render(<Navbar />);
        const searchInput = screen.getByPlaceholderText('Search products');
        fireEvent.change(searchInput, { target: { value: 'headphones' } });
        expect(searchInput.value).toBe('headphones');
    });

    it('應該有導航分隔線', () => {
        render(<Navbar />);
        const hr = document.querySelector('hr');
        expect(hr).toBeInTheDocument();
    });
});

// ============================================
// Footer Component Tests
// ============================================
describe('Footer 組件', () => {
    it('應該渲染 footer 元素', () => {
        render(<Footer />);
        const footer = document.querySelector('footer');
        expect(footer).toBeInTheDocument();
    });

    it('應該顯示版權資訊', () => {
        render(<Footer />);
        expect(screen.getByText(/LOYAULTYCLUB.*All Rights Reserved/i)).toBeInTheDocument();
    });

    it('應該有 CATEGORIES 區塊', () => {
        render(<Footer />);
        expect(screen.getByText('CATEGORIES')).toBeInTheDocument();
    });

    it('應該有 FOLLOW US 區塊', () => {
        render(<Footer />);
        expect(screen.getByText('FOLLOW US')).toBeInTheDocument();
    });

    it('應該有社交媒體連結', () => {
        render(<Footer />);
        const socialLinks = document.querySelectorAll('a[href*="instagram"], a[href*="threads"], a[href*="mailto:"]');
        expect(socialLinks.length).toBe(3);
    });

    it('應該有 QUICK LINKS 區塊', () => {
        render(<Footer />);
        expect(screen.getByText('QUICK LINKS')).toBeInTheDocument();
        expect(screen.getByText('Shop')).toBeInTheDocument();
    });

    it('應該有聯絡資訊', () => {
        render(<Footer />);
        const mailLink = document.querySelector('a[href="mailto:loyaultyclub@gmail.com"]');
        expect(mailLink).toBeInTheDocument();
    });

    it('應該有 Privacy Policy 連結', () => {
        render(<Footer />);
        expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    });
});

// ============================================
// Hero Component Tests
// ============================================
describe('Hero 組件', () => {
    it('應該渲染 banner 容器', () => {
        render(<Hero />);
        const container = document.querySelector('.rounded-3xl');
        expect(container).toBeInTheDocument();
    });

    it('容器應有最小高度', () => {
        render(<Hero />);
        const container = document.querySelector('[style*="min-height"]');
        expect(container).toBeInTheDocument();
    });

    it('沒有 banner 時不應渲染圖片', () => {
        render(<Hero />);
        const images = document.querySelectorAll('img');
        expect(images.length).toBe(0);
    });
});

