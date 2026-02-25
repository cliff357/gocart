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
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
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

jest.mock('@/lib/data/MockData', () => ({
    MockMiscData: {
        getCategories: () => ['Headphones', 'Speakers', 'Watch', 'Earbuds'],
        getOurSpecs: () => [
            {
                title: 'Free Shipping',
                description: 'Enjoy fast, free delivery',
                icon: () => <span data-testid="spec-icon">icon</span>,
                accent: '#05DF72',
            },
            {
                title: '7 Days easy Return',
                description: 'Return any item within 7 days',
                icon: () => <span data-testid="spec-icon">icon</span>,
                accent: '#FF8904',
            },
            {
                title: '24/7 Customer Support',
                description: 'Get expert help',
                icon: () => <span data-testid="spec-icon">icon</span>,
                accent: '#A684FF',
            },
        ],
    },
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
import Banner from '@/components/Banner';
import Hero from '@/components/Hero';
import PageTitle from '@/components/PageTitle';
import Newsletter from '@/components/Newsletter';
import OurSpecs from '@/components/OurSpec';
import CategoriesMarquee from '@/components/CategoriesMarquee';

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

    it('應該有 Login 按鈕', () => {
        render(<Navbar />);
        const loginButtons = screen.getAllByText('Login');
        expect(loginButtons.length).toBeGreaterThan(0);
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
        expect(screen.getByText(/Copyright.*MyLoYau/i)).toBeInTheDocument();
    });

    it('應該有 PRODUCTS 區塊', () => {
        render(<Footer />);
        expect(screen.getByText('PRODUCTS')).toBeInTheDocument();
    });

    it('應該有 CONTACT 區塊', () => {
        render(<Footer />);
        expect(screen.getByText('CONTACT')).toBeInTheDocument();
    });

    it('應該有社交媒體連結', () => {
        render(<Footer />);
        const socialLinks = document.querySelectorAll('a[href*="facebook"], a[href*="instagram"], a[href*="twitter"], a[href*="linkedin"]');
        expect(socialLinks.length).toBe(4);
    });

    it('應該有產品分類連結', () => {
        render(<Footer />);
        expect(screen.getByText('Earphones')).toBeInTheDocument();
        expect(screen.getByText('Headphones')).toBeInTheDocument();
    });

    it('應該有聯絡資訊', () => {
        render(<Footer />);
        expect(screen.getByText('contact@example.com')).toBeInTheDocument();
    });

    it('應該有 Privacy Policy 連結', () => {
        render(<Footer />);
        expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    });
});

// ============================================
// Banner Component Tests
// ============================================
describe('Banner 組件', () => {
    beforeEach(() => {
        // jsdom 沒有 navigator.clipboard，需要 mock
        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn().mockResolvedValue(undefined),
            },
        });
    });

    it('應該顯示促銷文字', () => {
        render(<Banner />);
        expect(screen.getByText(/20% OFF/i)).toBeInTheDocument();
    });

    it('應該有 Claim Offer 按鈕', () => {
        render(<Banner />);
        expect(screen.getByText('Claim Offer')).toBeInTheDocument();
    });

    it('點擊關閉按鈕後應該隱藏 Banner', () => {
        render(<Banner />);
        // Banner 有兩個按鈕：Claim Offer 和關閉 (svg)
        const buttons = document.querySelectorAll('button');
        // 最後一個是關閉按鈕
        const closeButton = buttons[buttons.length - 1];
        fireEvent.click(closeButton);

        expect(screen.queryByText(/20% OFF/i)).not.toBeInTheDocument();
    });

    it('點擊 Claim Offer 應該隱藏 Banner', () => {
        render(<Banner />);
        fireEvent.click(screen.getByText('Claim Offer'));
        expect(screen.queryByText(/20% OFF/i)).not.toBeInTheDocument();
    });

    it('點擊 Claim Offer 應該觸發 toast', () => {
        const toast = require('react-hot-toast');
        render(<Banner />);
        fireEvent.click(screen.getByText('Claim Offer'));
        expect(toast.success).toHaveBeenCalledWith('Coupon copied to clipboard!');
    });
});

// ============================================
// Hero Component Tests
// ============================================
describe('Hero 組件', () => {
    it('應該渲染主標題', () => {
        render(<Hero />);
        expect(screen.getByText(/Gadgets you'll love/i)).toBeInTheDocument();
    });

    it('應該顯示起始價格', () => {
        render(<Hero />);
        expect(screen.getByText('$4.90')).toBeInTheDocument();
    });

    it('應該有 LEARN MORE 按鈕', () => {
        render(<Hero />);
        expect(screen.getByText('LEARN MORE')).toBeInTheDocument();
    });

    it('應該顯示 NEWS 標籤', () => {
        render(<Hero />);
        expect(screen.getByText('NEWS')).toBeInTheDocument();
    });

    it('應該有 Best products 區塊', () => {
        render(<Hero />);
        expect(screen.getByText('Best products')).toBeInTheDocument();
    });

    it('應該有 20% discounts 區塊', () => {
        render(<Hero />);
        expect(screen.getByText('20% discounts')).toBeInTheDocument();
    });

    it('應該有 View more 連結', () => {
        render(<Hero />);
        const viewMore = screen.getAllByText('View more');
        expect(viewMore.length).toBe(2);
    });

    it('應該渲染 hero 圖片', () => {
        render(<Hero />);
        const images = document.querySelectorAll('img');
        expect(images.length).toBeGreaterThanOrEqual(3);
    });
});

// ============================================
// PageTitle Component Tests
// ============================================
describe('PageTitle 組件', () => {
    it('應該顯示標題', () => {
        render(<PageTitle heading="購物車" text="管理你的購物車" linkText="繼續購物" />);
        expect(screen.getByText('購物車')).toBeInTheDocument();
    });

    it('應該顯示說明文字', () => {
        render(<PageTitle heading="購物車" text="管理你的購物車" linkText="繼續購物" />);
        expect(screen.getByText('管理你的購物車')).toBeInTheDocument();
    });

    it('應該顯示連結文字', () => {
        render(<PageTitle heading="購物車" text="描述" linkText="繼續購物" />);
        expect(screen.getByText('繼續購物')).toBeInTheDocument();
    });

    it('應該使用預設 path="/"', () => {
        render(<PageTitle heading="標題" text="文字" linkText="連結" />);
        const link = document.querySelector('a[href="/"]');
        expect(link).toBeInTheDocument();
    });

    it('應該接受自定義 path', () => {
        render(<PageTitle heading="標題" text="文字" linkText="連結" path="/shop" />);
        const link = document.querySelector('a[href="/shop"]');
        expect(link).toBeInTheDocument();
    });
});

// ============================================
// Newsletter Component Tests
// ============================================
describe('Newsletter 組件', () => {
    it('應該顯示 Join Newsletter 標題', () => {
        render(<Newsletter />);
        expect(screen.getByText('Join Newsletter')).toBeInTheDocument();
    });

    it('應該有 email 輸入框', () => {
        render(<Newsletter />);
        const input = screen.getByPlaceholderText('Enter your email address');
        expect(input).toBeInTheDocument();
    });

    it('應該有 Get Updates 按鈕', () => {
        render(<Newsletter />);
        expect(screen.getByText('Get Updates')).toBeInTheDocument();
    });

    it('email 輸入框可以輸入文字', () => {
        render(<Newsletter />);
        const input = screen.getByPlaceholderText('Enter your email address');
        fireEvent.change(input, { target: { value: 'test@example.com' } });
        expect(input.value).toBe('test@example.com');
    });
});

// ============================================
// OurSpecs Component Tests
// ============================================
describe('OurSpecs 組件', () => {
    it('應該顯示 Our Specifications 標題', () => {
        render(<OurSpecs />);
        expect(screen.getByText('Our Specifications')).toBeInTheDocument();
    });

    it('應該顯示 Free Shipping', () => {
        render(<OurSpecs />);
        expect(screen.getByText('Free Shipping')).toBeInTheDocument();
    });

    it('應該顯示 7 Days easy Return', () => {
        render(<OurSpecs />);
        expect(screen.getByText('7 Days easy Return')).toBeInTheDocument();
    });

    it('應該顯示 24/7 Customer Support', () => {
        render(<OurSpecs />);
        expect(screen.getByText('24/7 Customer Support')).toBeInTheDocument();
    });

    it('應該渲染 3 個 spec 項目', () => {
        render(<OurSpecs />);
        const icons = screen.getAllByTestId('spec-icon');
        expect(icons.length).toBe(3);
    });
});

// ============================================
// CategoriesMarquee Component Tests
// ============================================
describe('CategoriesMarquee 組件', () => {
    it('應該顯示分類名稱', () => {
        render(<CategoriesMarquee />);
        const headphones = screen.getAllByText('Headphones');
        expect(headphones.length).toBeGreaterThan(0);
    });

    it('應該顯示多個分類', () => {
        render(<CategoriesMarquee />);
        expect(screen.getAllByText('Speakers').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Watch').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Earbuds').length).toBeGreaterThan(0);
    });

    it('分類應該是按鈕', () => {
        render(<CategoriesMarquee />);
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBeGreaterThan(0);
    });

    it('應該有重複的分類（marquee 效果）', () => {
        render(<CategoriesMarquee />);
        // 4 categories × 4 repeats = 16
        const headphones = screen.getAllByText('Headphones');
        expect(headphones.length).toBeGreaterThan(1);
    });
});
