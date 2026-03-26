/**
 * Notification API Routes 測試
 * 
 * 測試 /api/notifications/new-order 和 /api/notifications/test
 * 
 * 📅 2026-03-02
 */

// ============================================
// Mocks
// ============================================

// Mock Firebase config
jest.mock('@/lib/firebase/config', () => ({
    db: {},
}));

// Mock Firestore
const mockGetDoc = jest.fn();
jest.mock('firebase/firestore', () => ({
    doc: jest.fn(() => 'mock-doc-ref'),
    getDoc: (...args) => mockGetDoc(...args),
}));

// Mock fetch (for Resend API)
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Store original env
const originalEnv = process.env;

// ============================================
// Test Helpers
// ============================================

function createRequest(body, method = 'POST') {
    return {
        json: jest.fn().mockResolvedValue(body),
        method,
    };
}

// ============================================
// /api/notifications/new-order
// ============================================

describe('New Order Notification API (/api/notifications/new-order)', () => {
    let POST;

    beforeAll(async () => {
        const mod = await import('@/app/api/notifications/new-order/route');
        POST = mod.POST;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv, RESEND_API_KEY: 'test-resend-key' };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('缺少 productName 時應該返回 400', async () => {
        const request = createRequest({ customerName: 'Test' });
        const response = await POST(request);
        const data = await response.json();
        
        expect(response.status).toBe(400);
        expect(data.error).toBe('缺少必要參數');
    });

    it('缺少 customerName 時應該返回 400', async () => {
        const request = createRequest({ productName: 'Test Product' });
        const response = await POST(request);
        const data = await response.json();
        
        expect(response.status).toBe(400);
        expect(data.error).toBe('缺少必要參數');
    });

    it('RESEND_API_KEY 未配置時應該返回 500', async () => {
        delete process.env.RESEND_API_KEY;
        
        const request = createRequest({
            productName: 'Test Product',
            customerName: 'Test User',
        });
        const response = await POST(request);
        const data = await response.json();
        
        expect(response.status).toBe(500);
        expect(data.error).toBe('Email 服務未配置');
    });

    it('通知停用時應該返回 success + skipped', async () => {
        mockGetDoc.mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ enabled: false }),
        });
        
        const request = createRequest({
            productName: 'Test Product',
            customerName: 'Test User',
        });
        const response = await POST(request);
        const data = await response.json();
        
        expect(data.success).toBe(true);
        expect(data.skipped).toBe(true);
    });

    it('成功發送郵件時應該呼叫 Resend API', async () => {
        mockGetDoc.mockResolvedValueOnce({
            exists: () => true,
            data: () => ({
                enabled: true,
                testingEmails: ['test@example.com'],
            }),
        });
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ id: 'email-1' }),
        });
        
        const request = createRequest({
            productName: 'Test Product',
            productPrice: 100,
            quantity: 2,
            customerName: 'Test User',
            customerEmail: 'customer@test.com',
            customerPhone: '12345678',
        });
        const response = await POST(request);
        
        expect(mockFetch).toHaveBeenCalledWith(
            'https://api.resend.com/emails',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer test-resend-key',
                }),
            })
        );
    });

    it('Firestore 讀取失敗時應該使用預設收件人', async () => {
        mockGetDoc.mockRejectedValueOnce(new Error('Firestore error'));
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ id: 'email-1' }),
        });
        
        const request = createRequest({
            productName: 'Test Product',
            customerName: 'Test User',
        });
        
        const response = await POST(request);
        // Should still send email (not fail)
        expect(mockFetch).toHaveBeenCalled();
    });
});

// ============================================
// /api/notifications/test
// ============================================

describe('Test Notification API (/api/notifications/test)', () => {
    let POST;

    beforeAll(async () => {
        const mod = await import('@/app/api/notifications/test/route');
        POST = mod.POST;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv, RESEND_API_KEY: 'test-resend-key' };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('RESEND_API_KEY 未配置時應該返回 500', async () => {
        delete process.env.RESEND_API_KEY;
        
        const request = createRequest({});
        const response = await POST(request);
        const data = await response.json();
        
        expect(response.status).toBe(500);
        expect(data.error).toBe('Email service not configured');
    });

    it('通知停用時應該返回 400', async () => {
        mockGetDoc.mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ enabled: false }),
        });
        
        const request = createRequest({});
        const response = await POST(request);
        const data = await response.json();
        
        expect(response.status).toBe(400);
        expect(data.error).toBe('Email notifications are disabled');
    });

    it('成功發送測試郵件', async () => {
        mockGetDoc.mockResolvedValueOnce({
            exists: () => true,
            data: () => ({
                enabled: true,
                testingEmails: ['test@example.com'],
            }),
        });
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ id: 'email-1' }),
        });
        
        const request = createRequest({});
        const response = await POST(request);
        
        expect(mockFetch).toHaveBeenCalledWith(
            'https://api.resend.com/emails',
            expect.objectContaining({
                method: 'POST',
            })
        );
    });
});
