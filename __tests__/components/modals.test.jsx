/**
 * Modal 組件測試
 * 
 * 測試 ReservationModal, AddressModal
 * 
 * 📅 2026-03-02
 */

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ============================================
// Mocks
// ============================================

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
    __esModule: true,
    default: {
        success: jest.fn(),
        error: jest.fn(),
        promise: jest.fn((promise) => promise),
    },
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        promise: jest.fn((promise) => promise),
    },
}));

// Mock FirebaseFirestoreService
const mockCreateDocument = jest.fn();
jest.mock('@/lib/firebase/firestore', () => ({
    FirebaseFirestoreService: {
        createDocument: (...args) => mockCreateDocument(...args),
    },
}));

// Mock fetch for notification API
global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) }));

import toast from 'react-hot-toast';

// ============================================
// ReservationModal 組件
// ============================================

import ReservationModal from '@/components/ReservationModal';

describe('ReservationModal 組件', () => {

    const defaultProduct = {
        id: 'prod-1',
        name: 'Test Product',
        price: 100,
        images: ['https://example.com/img1.jpg'],
    };

    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        product: defaultProduct,
        selectedOptions: {},
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockCreateDocument.mockResolvedValue({ success: true, id: 'res-1' });
    });

    it('isOpen=false 時不應該渲染', () => {
        render(<ReservationModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByText('預訂產品')).not.toBeInTheDocument();
    });

    it('isOpen=true 時應該顯示表單', () => {
        render(<ReservationModal {...defaultProps} />);
        expect(screen.getByText('預訂產品')).toBeInTheDocument();
        expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    it('應該顯示所有表單欄位', () => {
        render(<ReservationModal {...defaultProps} />);
        expect(screen.getByPlaceholderText('請輸入姓名')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('example@email.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('請輸入電話號碼')).toBeInTheDocument();
    });

    it('數量預設為 1', () => {
        render(<ReservationModal {...defaultProps} />);
        const quantityInput = screen.getByDisplayValue('1');
        expect(quantityInput).toBeInTheDocument();
        expect(quantityInput).toHaveAttribute('type', 'number');
    });

    it('沒有填寫姓名時應該顯示錯誤', async () => {
        render(<ReservationModal {...defaultProps} />);
        
        // Fill email but not name
        fireEvent.change(screen.getByPlaceholderText('example@email.com'), {
            target: { value: 'test@test.com', name: 'email' },
        });
        
        fireEvent.submit(screen.getByText('確認預訂').closest('form'));
        
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('請填寫姓名');
        });
    });

    it('沒有填寫電郵或電話時應該顯示錯誤', async () => {
        render(<ReservationModal {...defaultProps} />);
        
        // Fill name but not email or phone
        fireEvent.change(screen.getByPlaceholderText('請輸入姓名'), {
            target: { value: 'Test User', name: 'name' },
        });
        
        fireEvent.submit(screen.getByText('確認預訂').closest('form'));
        
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('請填寫電郵或電話');
        });
    });

    it('填寫完整資料後應該成功提交預訂', async () => {
        render(<ReservationModal {...defaultProps} />);
        
        fireEvent.change(screen.getByPlaceholderText('請輸入姓名'), {
            target: { value: 'Test User', name: 'name' },
        });
        fireEvent.change(screen.getByPlaceholderText('example@email.com'), {
            target: { value: 'test@test.com', name: 'email' },
        });
        
        fireEvent.submit(screen.getByText('確認預訂').closest('form'));
        
        await waitFor(() => {
            expect(mockCreateDocument).toHaveBeenCalledWith('reservations', expect.objectContaining({
                name: 'Test User',
                email: 'test@test.com',
                productId: 'prod-1',
                productName: 'Test Product',
                quantity: 1,
                status: 'pending',
            }));
        });
    });

    it('提交成功後應該顯示成功畫面', async () => {
        render(<ReservationModal {...defaultProps} />);
        
        fireEvent.change(screen.getByPlaceholderText('請輸入姓名'), {
            target: { value: 'Test User', name: 'name' },
        });
        fireEvent.change(screen.getByPlaceholderText('請輸入電話號碼'), {
            target: { value: '12345678', name: 'phone' },
        });
        
        fireEvent.submit(screen.getByText('確認預訂').closest('form'));
        
        await waitFor(() => {
            expect(screen.getByText('預訂成功！')).toBeInTheDocument();
            expect(screen.getByText('我們會盡快聯絡你確認預訂。')).toBeInTheDocument();
        });
    });

    it('提交成功後應該發送 email 通知', async () => {
        render(<ReservationModal {...defaultProps} />);
        
        fireEvent.change(screen.getByPlaceholderText('請輸入姓名'), {
            target: { value: 'Test User', name: 'name' },
        });
        fireEvent.change(screen.getByPlaceholderText('example@email.com'), {
            target: { value: 'test@test.com', name: 'email' },
        });
        
        fireEvent.submit(screen.getByText('確認預訂').closest('form'));
        
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/notifications/new-order', expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }));
        });
    });

    it('應該顯示已選擇的 options', () => {
        render(<ReservationModal {...defaultProps} selectedOptions={{ Size: 'M', Color: '紅色' }} />);
        expect(screen.getByText(/Size/)).toBeInTheDocument();
        expect(screen.getByText('M')).toBeInTheDocument();
        expect(screen.getByText(/Color/)).toBeInTheDocument();
        expect(screen.getByText('紅色')).toBeInTheDocument();
    });

    it('沒有 selectedOptions 時不應該顯示選項區域', () => {
        render(<ReservationModal {...defaultProps} selectedOptions={{}} />);
        expect(screen.queryByText('已選擇：')).not.toBeInTheDocument();
    });

    it('點擊關閉按鈕應該呼叫 onClose', () => {
        render(<ReservationModal {...defaultProps} />);
        // X button is the first button in the modal
        const closeButtons = screen.getAllByRole('button');
        fireEvent.click(closeButtons[0]); // The X close button
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('提交失敗時應該顯示錯誤 toast', async () => {
        mockCreateDocument.mockRejectedValueOnce(new Error('Network error'));
        
        render(<ReservationModal {...defaultProps} />);
        
        fireEvent.change(screen.getByPlaceholderText('請輸入姓名'), {
            target: { value: 'Test User', name: 'name' },
        });
        fireEvent.change(screen.getByPlaceholderText('example@email.com'), {
            target: { value: 'test@test.com', name: 'email' },
        });
        
        fireEvent.submit(screen.getByText('確認預訂').closest('form'));
        
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('預訂失敗，請稍後再試');
        });
    });

    it('只填電話不填電郵也可以提交', async () => {
        render(<ReservationModal {...defaultProps} />);
        
        fireEvent.change(screen.getByPlaceholderText('請輸入姓名'), {
            target: { value: 'Phone User', name: 'name' },
        });
        fireEvent.change(screen.getByPlaceholderText('請輸入電話號碼'), {
            target: { value: '98765432', name: 'phone' },
        });
        
        fireEvent.submit(screen.getByText('確認預訂').closest('form'));
        
        await waitFor(() => {
            expect(mockCreateDocument).toHaveBeenCalledWith('reservations', expect.objectContaining({
                name: 'Phone User',
                phone: '98765432',
                email: null,
            }));
        });
    });
});


