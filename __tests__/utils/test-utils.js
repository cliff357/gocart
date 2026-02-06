/**
 * Test Utilities
 * 共用測試工具函數
 */

import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '@/lib/features/cart/cartSlice';
import productReducer from '@/lib/features/product/productSlice';
import addressReducer from '@/lib/features/address/addressSlice';
import ratingReducer from '@/lib/features/rating/ratingSlice';

// 創建測試用的 Redux store
export const createTestStore = (preloadedState = {}) => {
    return configureStore({
        reducer: {
            cart: cartReducer,
            product: productReducer,
            address: addressReducer,
            rating: ratingReducer,
        },
        preloadedState,
    });
};

// 自定義 render 函數，包含 Redux Provider
export const renderWithProviders = (
    ui,
    {
        preloadedState = {},
        store = createTestStore(preloadedState),
        ...renderOptions
    } = {}
) => {
    const Wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
    );

    return {
        store,
        ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    };
};

// Mock product data
export const mockProduct = {
    id: 'prod-1',
    name: 'Test Product',
    description: 'This is a test product',
    price: 100,
    mrp: 150,
    category: 'test-category',
    images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    options: [
        { name: 'Size', values: ['S', 'M', 'L'] },
    ],
    bestseller: false,
    inStock: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
};

// Mock user data
export const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    displayName: 'Test User',
    isAdmin: false,
    createdAt: '2026-01-01T00:00:00Z',
};

// Mock admin user data
export const mockAdminUser = {
    id: 'admin-1',
    email: 'admin@example.com',
    displayName: 'Admin User',
    isAdmin: true,
    createdAt: '2026-01-01T00:00:00Z',
};

// Mock category data
export const mockCategory = {
    id: 'cat-1',
    name: 'Test Category',
    parentId: null,
    createdAt: '2026-01-01T00:00:00Z',
};

// Mock order data
export const mockOrder = {
    id: 'order-1',
    userId: 'user-1',
    storeId: 'store-1',
    items: [
        { productId: 'prod-1', quantity: 2, price: 100 },
    ],
    totalAmount: 200,
    status: 'pending',
    createdAt: '2026-01-01T00:00:00Z',
};

// Mock rating data
export const mockRating = {
    id: 'rating-1',
    productId: 'prod-1',
    userId: 'user-1',
    rating: 5,
    review: 'Great product!',
    createdAt: '2026-01-01T00:00:00Z',
};

// Mock coupon data
export const mockCoupon = {
    id: 'TESTCODE',
    code: 'TESTCODE',
    discount: 10,
    isPublic: true,
    expiresAt: '2027-01-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
};

// Mock expired coupon
export const mockExpiredCoupon = {
    id: 'EXPIRED',
    code: 'EXPIRED',
    discount: 20,
    isPublic: true,
    expiresAt: '2025-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
};

// Mock address data
export const mockAddress = {
    id: 'addr-1',
    userId: 'user-1',
    name: 'Test User',
    street: '123 Test Street',
    city: 'Hong Kong',
    phone: '12345678',
    createdAt: '2026-01-01T00:00:00Z',
};

// Mock reservation data
export const mockReservation = {
    id: 'res-1',
    name: 'Test Customer',
    email: 'customer@example.com',
    phone: '12345678',
    quantity: 1,
    productId: 'prod-1',
    productName: 'Test Product',
    productPrice: 100,
    status: 'pending',
    createdAt: '2026-01-01T00:00:00Z',
};

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Re-export everything from testing-library
export * from '@testing-library/react';
