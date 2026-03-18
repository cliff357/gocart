/**
 * About Page Tests
 * 
 * 測試 About 頁面：Hero 渲染、Timeline 預設/動態載入、Firestore fallback、內容區
 * 
 * 📅 2026-03-18
 * 📋 Phase 3 Gap #3 — 192 行，Firestore 動態 timeline + DEFAULT_TIMELINE fallback
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

// ============================================
// Mocks
// ============================================

// Mock IntersectionObserver (jsdom 沒有)
const mockObserve = jest.fn();
const mockUnobserve = jest.fn();

beforeAll(() => {
    global.IntersectionObserver = class {
        constructor(callback) {
            // 立即觸發 isIntersecting 讓動畫內容可見
            this._callback = callback;
        }
        observe(el) {
            mockObserve(el);
            // 模擬元素進入視窗
            this._callback([{ isIntersecting: true, target: el }]);
        }
        unobserve = mockUnobserve;
        disconnect() {}
    };
});

// Mock FirebaseFirestoreService
const mockGetDocument = jest.fn();

jest.mock('@/lib/firebase/firestore', () => ({
    FirebaseFirestoreService: {
        getDocument: (...args) => mockGetDocument(...args),
    },
}));

// ============================================
// Tests
// ============================================

describe('About Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // 預設：Firestore 返回空（用 DEFAULT_TIMELINE）
        mockGetDocument.mockResolvedValue({ success: true, data: null });
    });

    // ① Hero Section — 標題 + 副標題
    it('顯示 Hero 標題同副標題', async () => {
        const AboutPage = (await import('@/app/(public)/about/page')).default;
        render(<AboutPage />);

        await waitFor(() => {
            expect(screen.getByText('老友賣蘿柚企劃')).toBeInTheDocument();
        });
        expect(screen.getByText('一個專注於本土手作同創意設計嘅平台')).toBeInTheDocument();
    });

    // ② 預設 Timeline — 4 項全部顯示
    it('顯示預設 Timeline 4 項（日期 + 標題 + icon）', async () => {
        const AboutPage = (await import('@/app/(public)/about/page')).default;
        render(<AboutPage />);

        await waitFor(() => {
            expect(screen.getByText('Studio 成立')).toBeInTheDocument();
        });

        // 4 個 timeline items
        expect(screen.getByText('2024年1月')).toBeInTheDocument();
        expect(screen.getByText('第一件作品完成')).toBeInTheDocument();
        expect(screen.getByText('網站上線')).toBeInTheDocument();
        expect(screen.getByText('第一次擺市集')).toBeInTheDocument();

        // icons
        expect(screen.getByText('🏠')).toBeInTheDocument();
        expect(screen.getByText('🎨')).toBeInTheDocument();
        expect(screen.getByText('💻')).toBeInTheDocument();
        expect(screen.getByText('🎪')).toBeInTheDocument();
    });

    // ③ Firestore 成功載入 — 自定義 timeline 覆蓋預設
    it('Firestore 返回自定義 timeline 時覆蓋預設', async () => {
        const customTimeline = [
            { id: 99, date: '2025年12月', title: '海外擴展', description: '進軍海外市場', icon: '🌍' },
        ];
        mockGetDocument.mockResolvedValue({
            success: true,
            data: { timeline: customTimeline },
        });

        const AboutPage = (await import('@/app/(public)/about/page')).default;
        render(<AboutPage />);

        await waitFor(() => {
            expect(screen.getByText('海外擴展')).toBeInTheDocument();
        });
        expect(screen.getByText('2025年12月')).toBeInTheDocument();
        expect(screen.getByText('🌍')).toBeInTheDocument();

        // 預設項目應該被覆蓋
        expect(screen.queryByText('Studio 成立')).not.toBeInTheDocument();
    });

    // ④ Firestore 失敗 — fallback 用 DEFAULT_TIMELINE
    it('Firestore 載入失敗時 fallback 顯示預設 timeline', async () => {
        mockGetDocument.mockRejectedValue(new Error('Network error'));

        const AboutPage = (await import('@/app/(public)/about/page')).default;
        render(<AboutPage />);

        await waitFor(() => {
            expect(screen.getByText('Studio 成立')).toBeInTheDocument();
        });
        expect(screen.getByText('第一件作品完成')).toBeInTheDocument();
        expect(screen.getByText('網站上線')).toBeInTheDocument();
        expect(screen.getByText('第一次擺市集')).toBeInTheDocument();
    });

    // ⑤ About Content — 「關於我哋」三段文字
    it('顯示「關於我哋」內容區三段文字', async () => {
        const AboutPage = (await import('@/app/(public)/about/page')).default;
        render(<AboutPage />);

        await waitFor(() => {
            expect(screen.getByText('關於我哋')).toBeInTheDocument();
        });

        expect(screen.getAllByText(/專注於本土手作同創意設計嘅平台/)).toHaveLength(2); // Hero + About
        expect(screen.getByText(/將香港本地創作者嘅心血帶俾每一位支持者/)).toBeInTheDocument();
        expect(screen.getByText(/連結更多志同道合嘅朋友/)).toBeInTheDocument();
    });

    // ⑥ 結尾提示 — 「更多故事，陸續更新...」
    it('顯示結尾提示「更多故事，陸續更新...」', async () => {
        const AboutPage = (await import('@/app/(public)/about/page')).default;
        render(<AboutPage />);

        await waitFor(() => {
            expect(screen.getByText('更多故事，陸續更新...')).toBeInTheDocument();
        });
    });
});
