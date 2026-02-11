/**
 * UI 組件測試
 * 
 * 測試純 UI 組件的渲染和交互
 * 使用 Jest + React Testing Library
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '@/lib/features/cart/cartSlice';

// ============================================
// Mock Next.js modules
// ============================================
jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ priority, ...props }) => {
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img {...props} data-priority={priority ? 'true' : undefined} />;
    },
}));

jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href }) => <a href={href}>{children}</a>,
}));

jest.mock('@/assets/assets', () => ({
    assets: {
        logo: '/test-logo.png',
    },
}));

// ============================================
// Helper: Create Test Store
// ============================================
const createTestStore = (preloadedState = {}) => {
    return configureStore({
        reducer: {
            cart: cartReducer,
        },
        preloadedState,
    });
};

// ============================================
// Import Components (after mocks)
// ============================================
import Rating from '@/components/Rating';
import Loading from '@/components/Loading';
import Title from '@/components/Title';
import Logo from '@/components/Logo';
import Counter from '@/components/Counter';
import ProductCard from '@/components/ProductCard';

// ============================================
// Rating Component Tests
// ============================================
describe('Rating 組件', () => {
    it('應該渲染 5 顆星星', () => {
        render(<Rating value={3} />);
        const stars = document.querySelectorAll('svg');
        expect(stars.length).toBe(5);
    });

    it('應該根據 value 顯示填滿的星星', () => {
        render(<Rating value={4} />);
        const stars = document.querySelectorAll('svg');
        
        // 前 4 顆應該是綠色（填滿）
        const filledStars = Array.from(stars).filter(star => 
            star.classList.contains('text-green-400')
        );
        expect(filledStars.length).toBe(4);
    });

    it('value=0 時應該沒有填滿的星星', () => {
        render(<Rating value={0} />);
        const filledStars = document.querySelectorAll('.text-green-400');
        expect(filledStars.length).toBe(0);
    });

    it('value=5 時應該全部填滿', () => {
        render(<Rating value={5} />);
        const filledStars = document.querySelectorAll('.text-green-400');
        expect(filledStars.length).toBe(5);
    });

    it('預設值應該是 4', () => {
        render(<Rating />);
        const filledStars = document.querySelectorAll('.text-green-400');
        expect(filledStars.length).toBe(4);
    });
});

// ============================================
// Loading Component Tests
// ============================================
describe('Loading 組件', () => {
    it('應該渲染 spinner', () => {
        render(<Loading />);
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
    });

    it('應該是全屏高度', () => {
        render(<Loading />);
        const container = document.querySelector('.h-screen');
        expect(container).toBeInTheDocument();
    });
});

// ============================================
// Title Component Tests
// ============================================
describe('Title 組件', () => {
    it('應該顯示標題', () => {
        render(<Title title="測試標題" description="測試描述" />);
        expect(screen.getByText('測試標題')).toBeInTheDocument();
    });

    it('應該顯示描述', () => {
        render(<Title title="標題" description="這是描述文字" />);
        expect(screen.getByText('這是描述文字')).toBeInTheDocument();
    });

    it('visibleButton=true 時應該顯示 View more', () => {
        render(<Title title="標題" description="描述" visibleButton={true} />);
        expect(screen.getByText('View more')).toBeInTheDocument();
    });

    it('visibleButton=false 時不應該顯示 View more', () => {
        render(<Title title="標題" description="描述" visibleButton={false} />);
        expect(screen.queryByText('View more')).not.toBeInTheDocument();
    });

    it('應該使用正確的 href', () => {
        render(<Title title="標題" description="描述" href="/shop" />);
        const link = document.querySelector('a[href="/shop"]');
        expect(link).toBeInTheDocument();
    });
});

// ============================================
// Logo Component Tests
// ============================================
describe('Logo 組件', () => {
    it('應該渲染圖片', () => {
        render(<Logo />);
        const img = document.querySelector('img');
        expect(img).toBeInTheDocument();
    });

    it('應該使用預設 size=48', () => {
        render(<Logo />);
        const img = document.querySelector('img');
        expect(img).toHaveAttribute('width', '48');
        expect(img).toHaveAttribute('height', '48');
    });

    it('應該接受自定義 size', () => {
        render(<Logo size={100} />);
        const img = document.querySelector('img');
        expect(img).toHaveAttribute('width', '100');
        expect(img).toHaveAttribute('height', '100');
    });

    it('應該接受自定義 className', () => {
        render(<Logo className="custom-class" />);
        const img = document.querySelector('img');
        expect(img.className).toContain('custom-class');
    });
});

// ============================================
// Counter Component Tests
// ============================================
describe('Counter 組件', () => {
    const renderCounter = (cartItems = {}) => {
        const store = createTestStore({
            cart: { cartItems },
        });
        return render(
            <Provider store={store}>
                <Counter productId="prod-1" />
            </Provider>
        );
    };

    it('應該顯示當前數量', () => {
        renderCounter({ 'prod-1': 3 });
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('應該有增加按鈕', () => {
        renderCounter({ 'prod-1': 1 });
        expect(screen.getByText('+')).toBeInTheDocument();
    });

    it('應該有減少按鈕', () => {
        renderCounter({ 'prod-1': 1 });
        expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('點擊 + 應該增加數量', () => {
        const store = createTestStore({
            cart: { cartItems: { 'prod-1': 1 } },
        });
        render(
            <Provider store={store}>
                <Counter productId="prod-1" />
            </Provider>
        );

        fireEvent.click(screen.getByText('+'));
        
        // 檢查 store 是否更新
        expect(store.getState().cart.cartItems['prod-1']).toBe(2);
    });

    it('點擊 - 應該減少數量', () => {
        const store = createTestStore({
            cart: { cartItems: { 'prod-1': 3 } },
        });
        render(
            <Provider store={store}>
                <Counter productId="prod-1" />
            </Provider>
        );

        fireEvent.click(screen.getByText('-'));
        
        expect(store.getState().cart.cartItems['prod-1']).toBe(2);
    });
});

// ============================================
// ProductCard Component Tests
// ============================================
describe('ProductCard 組件', () => {
    const mockProduct = {
        id: 'prod-123',
        name: '測試商品',
        price: 100,
        images: ['/test-image.jpg'],
        rating: [
            { rating: 5 },
            { rating: 4 },
        ],
    };

    it('應該顯示商品名稱', () => {
        render(<ProductCard product={mockProduct} />);
        expect(screen.getByText('測試商品')).toBeInTheDocument();
    });

    it('應該顯示價格', () => {
        render(<ProductCard product={mockProduct} />);
        expect(screen.getByText('$100')).toBeInTheDocument();
    });

    it('應該連結到產品頁', () => {
        render(<ProductCard product={mockProduct} />);
        const link = document.querySelector('a[href="/product/prod-123"]');
        expect(link).toBeInTheDocument();
    });

    it('應該顯示商品圖片', () => {
        render(<ProductCard product={mockProduct} />);
        const img = document.querySelector('img[src="/test-image.jpg"]');
        expect(img).toBeInTheDocument();
    });
});
