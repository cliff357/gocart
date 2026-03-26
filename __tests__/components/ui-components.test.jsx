/**
 * UI 組件測試 — Title + Logo
 * 
 * 測試純 UI 組件的渲染和交互
 * Loading → Loading.test.jsx, ProductCard → ProductCard.test.jsx
 * 使用 Jest + React Testing Library
 */

import React from 'react';
import { render, screen } from '@testing-library/react';


// ============================================
// Mock Next.js modules
// ============================================
jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ priority, ...props }) => {
        // eslint-disable-next-line @next/next/no-img-element
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
// Import Components (after mocks)
// ============================================
import Title from '@/components/Title';
import Logo from '@/components/Logo';

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

