/**
 * Mock for @/lib/auth/server
 * 用於測試 API Routes 的認證邏輯
 */

// 預設返回未認證
let mockAuthResult = {
    success: false,
    error: '未提供認證 token',
    status: 401
};

// 設置 mock 認證結果
const __setMockAuthResult = (result) => {
    mockAuthResult = result;
};

// 重置為預設
const __resetMockAuthResult = () => {
    mockAuthResult = {
        success: false,
        error: '未提供認證 token',
        status: 401
    };
};

// Mock verifyAdminRequest
const verifyAdminRequest = async () => mockAuthResult;

// Mock verifyIdToken
const verifyIdToken = async (token) => {
    if (!token) {
        return { success: false, error: 'No token provided' };
    }
    if (token === 'valid_admin_token') {
        return {
            success: true,
            user: {
                uid: 'admin_123',
                email: 'admin@test.com',
                isAdmin: true
            }
        };
    }
    if (token === 'valid_user_token') {
        return {
            success: true,
            user: {
                uid: 'user_123',
                email: 'user@test.com',
                isAdmin: false
            }
        };
    }
    return { success: false, error: 'Invalid token' };
};

// Mock withAdminAuth wrapper
const withAdminAuth = (handler) => {
    return async (request, context) => {
        const authResult = await verifyAdminRequest(request);
        if (!authResult.success) {
            const { NextResponse } = require('next/server');
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status || 401 }
            );
        }
        return handler(request, context, authResult.user);
    };
};

module.exports = {
    __setMockAuthResult,
    __resetMockAuthResult,
    verifyAdminRequest,
    verifyIdToken,
    withAdminAuth
};
