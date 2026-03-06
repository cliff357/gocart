/**
 * P3 API Service 測試
 *
 * 測試 ApiService 的所有服務類方法
 * 驗證 Firestore-backed 服務的返回格式和業務邏輯
 *
 * 運行方式：
 *   npm run test:components
 */

// ============================================
// Mock FirestoreService (避免真實 Firebase 調用)
// ============================================
const mockProducts = [
    { id: 'prod-1', name: 'Wireless Headphones', price: 99.99, category: 'Electronics', storeId: 'store-1', userId: 'user-1' },
    { id: 'prod-2', name: 'Bluetooth Speaker', price: 49.99, category: 'Electronics', storeId: 'store-1', userId: 'user-1' },
];
const mockUsers = [
    { id: 'user-1', email: 'alice@test.com', username: 'alice' },
    { id: 'user-2', email: 'bob@test.com', username: 'bob' },
];
const mockOrders = [
    { id: 'order-1', userId: 'user-1', status: 'pending', totalAmount: 149.98, items: [], createdAt: '2025-01-01' },
];
const mockAddresses = [
    { id: 'addr-1', userId: 'user-1', street: '123 Main St', city: 'HK', country: 'HK' },
];
const mockCoupons = [
    { id: 'coupon-1', code: 'SAVE10', discount: 10, isPublic: true, active: true, expiresAt: '2026-12-31', usageCount: 0, usageLimit: 100 },
];

jest.mock('@/lib/services/FirestoreService', () => ({
    productService: {
        getAll: jest.fn(() => Promise.resolve(mockProducts)),
        getById: jest.fn((id) => Promise.resolve(mockProducts.find(p => p.id === id) || null)),
        getByCategory: jest.fn((cat) => Promise.resolve(mockProducts.filter(p => p.category === cat))),
        getByStoreId: jest.fn(() => Promise.resolve(mockProducts)),
        search: jest.fn((q) => Promise.resolve(mockProducts.filter(p => p.name.toLowerCase().includes(q.toLowerCase())))),
        create: jest.fn(() => Promise.resolve('new-prod-id')),
        update: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
    },
    userService: {
        getAll: jest.fn(() => Promise.resolve(mockUsers)),
        getById: jest.fn((id) => Promise.resolve(mockUsers.find(u => u.id === id) || null)),
    },
    orderService: {
        getAll: jest.fn(() => Promise.resolve(mockOrders)),
        getById: jest.fn((id) => Promise.resolve(mockOrders.find(o => o.id === id) || null)),
        create: jest.fn(() => Promise.resolve('new-order-id')),
    },
    addressService: {
        getAll: jest.fn(() => Promise.resolve(mockAddresses)),
        getById: jest.fn((id) => Promise.resolve(mockAddresses.find(a => a.id === id) || null)),
        getByUserId: jest.fn((uid) => Promise.resolve(mockAddresses.filter(a => a.userId === uid))),
        create: jest.fn(() => Promise.resolve('new-addr-id')),
    },
    couponService: {
        getAll: jest.fn(() => Promise.resolve(mockCoupons)),
        getById: jest.fn((id) => Promise.resolve(mockCoupons.find(c => c.id === id) || null)),
        getByCode: jest.fn((code) => Promise.resolve(mockCoupons.find(c => c.code === code) || null)),
        getPublic: jest.fn(() => Promise.resolve(mockCoupons.filter(c => c.isPublic))),
        validate: jest.fn((code) => {
            const coupon = mockCoupons.find(c => c.code === code);
            if (!coupon) return Promise.resolve({ valid: false, message: 'Invalid coupon code' });
            return Promise.resolve({ valid: true, coupon });
        }),
    },
    categoryService: {
        getAll: jest.fn(() => Promise.resolve([])),
        getTree: jest.fn(() => Promise.resolve([])),
    },
}));

import ApiService, {
    ProductApiService,
    OrderApiService,
    CouponApiService,
} from '@/lib/services/ApiService';

// 加速測試：用 jest fake timers 跳過 simulateDelay
beforeAll(() => {
    jest.useFakeTimers();
});

afterAll(() => {
    jest.useRealTimers();
});

// Helper: 執行 async 函數並快進所有 timer
const runWithTimers = async (fn) => {
    const promise = fn();
    jest.runAllTimers();
    return promise;
};

// ============================================
// Helper: 驗證標準 API 響應格式
// ============================================
const expectSuccessResponse = (response) => {
    expect(response).toHaveProperty('success', true);
    expect(response).toHaveProperty('data');
    expect(response).toHaveProperty('timestamp');
    expect(response.data).not.toBeNull();
};

const expectErrorResponse = (response) => {
    expect(response).toHaveProperty('success', false);
    expect(response).toHaveProperty('message');
};

// ============================================
// ApiService 中央入口
// ============================================
describe('ApiService 中央入口', () => {
    it('應該包含所有服務', () => {
        expect(ApiService.Product).toBe(ProductApiService);
        expect(ApiService.Order).toBe(OrderApiService);
        expect(ApiService.Coupon).toBe(CouponApiService);
    });
});

// ============================================
// Product API Service
// ============================================
describe('ProductApiService', () => {
    it('getAllProducts: 返回商品列表', async () => {
        const response = await runWithTimers(() => ProductApiService.getAllProducts());
        expectSuccessResponse(response);
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
    });

    it('getProduct: 返回單一商品', async () => {
        const allProducts = await runWithTimers(() => ProductApiService.getAllProducts());
        const firstId = allProducts.data[0].id;

        const response = await runWithTimers(() => ProductApiService.getProduct(firstId));
        expectSuccessResponse(response);
        expect(response.data.id).toBe(firstId);
    });

    it('getProduct: 不存在的商品返回錯誤', async () => {
        const response = await runWithTimers(() => ProductApiService.getProduct('non-existent-id'));
        expectErrorResponse(response);
        expect(response.message).toContain('not found');
    });

    it('getProductsByCategory: 按分類查詢', async () => {
        const response = await runWithTimers(() => ProductApiService.getProductsByCategory('Electronics'));
        expectSuccessResponse(response);
        expect(Array.isArray(response.data)).toBe(true);
    });

    it('searchProducts: 搜尋商品', async () => {
        const response = await runWithTimers(() => ProductApiService.searchProducts('Bluetooth'));
        expectSuccessResponse(response);
        expect(Array.isArray(response.data)).toBe(true);
    });

    it('getCategories: 返回分類列表', async () => {
        const response = await runWithTimers(() => ProductApiService.getCategories());
        expectSuccessResponse(response);
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
    });

    it('createProduct: 成功創建商品', async () => {
        const response = await runWithTimers(() => ProductApiService.createProduct({ name: 'Test' }));
        expectSuccessResponse(response);
        expect(response.data).toHaveProperty('id');
    });
});

// ============================================
// Order API Service
// ============================================
describe('OrderApiService', () => {
    it('getAllOrders: 返回訂單列表', async () => {
        const response = await runWithTimers(() => OrderApiService.getAllOrders());
        expectSuccessResponse(response);
        expect(Array.isArray(response.data)).toBe(true);
    });

    it('getOrder: 返回單一訂單', async () => {
        const allOrders = await runWithTimers(() => OrderApiService.getAllOrders());
        if (allOrders.data.length > 0) {
            const firstId = allOrders.data[0].id;
            const response = await runWithTimers(() => OrderApiService.getOrder(firstId));
            expectSuccessResponse(response);
            expect(response.data.id).toBe(firstId);
        }
    });

    it('getOrder: 不存在的訂單返回錯誤', async () => {
        const response = await runWithTimers(() => OrderApiService.getOrder('non-existent'));
        expectErrorResponse(response);
    });

    it('createOrder: 建立訂單', async () => {
        const response = await runWithTimers(() => OrderApiService.createOrder({ userId: 'user_1', items: [] }));
        expectSuccessResponse(response);
        expect(response.data).toHaveProperty('id');
    });
});

// ============================================
// Address API Service
// ============================================
// Coupon API Service
// ============================================
describe('CouponApiService', () => {
    it('getAllCoupons: 返回優惠券列表', async () => {
        const response = await runWithTimers(() => CouponApiService.getAllCoupons());
        expectSuccessResponse(response);
        expect(Array.isArray(response.data)).toBe(true);
    });

    it('getPublicCoupons: 返回公開優惠券', async () => {
        const response = await runWithTimers(() => CouponApiService.getPublicCoupons());
        expectSuccessResponse(response);
        expect(Array.isArray(response.data)).toBe(true);
    });

    it('getCoupon: 不存在的優惠券返回錯誤', async () => {
        const response = await runWithTimers(() => CouponApiService.getCoupon('INVALID'));
        expectErrorResponse(response);
        expect(response.message).toContain('not found');
    });

    it('validateCoupon: 不存在的優惠券驗證失敗', async () => {
        const response = await runWithTimers(() => CouponApiService.validateCoupon('FAKE', 'user-1', 100));
        expectErrorResponse(response);
        expect(response.message).toContain('Invalid');
    });
});


