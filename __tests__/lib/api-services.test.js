/**
 * P3 API Service 測試
 *
 * 測試 ApiService 的所有服務類方法
 * 驗證 mock data 返回格式和業務邏輯
 *
 * 運行方式：
 *   npm run test:components
 */

import ApiService, {
    ProductApiService,
    UserApiService,
    StoreApiService,
    RatingApiService,
    OrderApiService,
    AddressApiService,
    CouponApiService,
    DashboardApiService,
    MiscApiService,
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
        expect(ApiService.User).toBe(UserApiService);
        expect(ApiService.Store).toBe(StoreApiService);
        expect(ApiService.Rating).toBe(RatingApiService);
        expect(ApiService.Order).toBe(OrderApiService);
        expect(ApiService.Address).toBe(AddressApiService);
        expect(ApiService.Coupon).toBe(CouponApiService);
        expect(ApiService.Dashboard).toBe(DashboardApiService);
        expect(ApiService.Misc).toBe(MiscApiService);
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

    it('createProduct: 未實現的方法返回錯誤', async () => {
        const response = await runWithTimers(() => ProductApiService.createProduct({}));
        expectErrorResponse(response);
        expect(response.message).toContain('Not implemented');
    });
});

// ============================================
// User API Service
// ============================================
describe('UserApiService', () => {
    it('getAllUsers: 返回用戶列表', async () => {
        const response = await runWithTimers(() => UserApiService.getAllUsers());
        expectSuccessResponse(response);
        expect(Array.isArray(response.data)).toBe(true);
    });

    it('getUser: 返回單一用戶', async () => {
        const allUsers = await runWithTimers(() => UserApiService.getAllUsers());
        const firstId = allUsers.data[0].id;

        const response = await runWithTimers(() => UserApiService.getUser(firstId));
        expectSuccessResponse(response);
        expect(response.data.id).toBe(firstId);
    });

    it('getUser: 不存在的用戶返回錯誤', async () => {
        const response = await runWithTimers(() => UserApiService.getUser('non-existent'));
        expectErrorResponse(response);
    });

    it('getCurrentUser: 返回當前用戶', async () => {
        const response = await runWithTimers(() => UserApiService.getCurrentUser());
        expectSuccessResponse(response);
        expect(response.data).toHaveProperty('id');
    });

    it('login: 未實現', async () => {
        const response = await runWithTimers(() => UserApiService.login({}));
        expectErrorResponse(response);
    });
});

// ============================================
// Store API Service
// ============================================
describe('StoreApiService', () => {
    it('getAllStores: 返回商店列表', async () => {
        const response = await runWithTimers(() => StoreApiService.getAllStores());
        expectSuccessResponse(response);
        expect(Array.isArray(response.data)).toBe(true);
    });

    it('getStore: 返回單一商店', async () => {
        const allStores = await runWithTimers(() => StoreApiService.getAllStores());
        const firstId = allStores.data[0].id;

        const response = await runWithTimers(() => StoreApiService.getStore(firstId));
        expectSuccessResponse(response);
        expect(response.data.id).toBe(firstId);
    });

    it('getStore: 不存在的商店返回錯誤', async () => {
        const response = await runWithTimers(() => StoreApiService.getStore('non-existent'));
        expectErrorResponse(response);
    });

    it('getStoreByUsername: 按用戶名查詢', async () => {
        const allStores = await runWithTimers(() => StoreApiService.getAllStores());
        const username = allStores.data[0].username;

        const response = await runWithTimers(() => StoreApiService.getStoreByUsername(username));
        expectSuccessResponse(response);
        expect(response.data.username).toBe(username);
    });
});

// ============================================
// Rating API Service
// ============================================
describe('RatingApiService', () => {
    it('getAllRatings: 返回評分列表', async () => {
        const response = await runWithTimers(() => RatingApiService.getAllRatings());
        expectSuccessResponse(response);
        expect(Array.isArray(response.data)).toBe(true);
    });

    it('getRating: 返回單一評分', async () => {
        const allRatings = await runWithTimers(() => RatingApiService.getAllRatings());
        const firstId = allRatings.data[0].id;

        const response = await runWithTimers(() => RatingApiService.getRating(firstId));
        expectSuccessResponse(response);
        expect(response.data.id).toBe(firstId);
    });

    it('getRatingsByProduct: 按商品查詢評分', async () => {
        const allRatings = await runWithTimers(() => RatingApiService.getAllRatings());
        const productId = allRatings.data[0].productId;

        const response = await runWithTimers(() => RatingApiService.getRatingsByProduct(productId));
        expectSuccessResponse(response);
        expect(Array.isArray(response.data)).toBe(true);
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

    it('createOrder: 未實現', async () => {
        const response = await runWithTimers(() => OrderApiService.createOrder({}));
        expectErrorResponse(response);
    });
});

// ============================================
// Address API Service
// ============================================
describe('AddressApiService', () => {
    it('getAddressesByUser: 按用戶查詢地址', async () => {
        const response = await runWithTimers(() => AddressApiService.getAddressesByUser('user_1'));
        expectSuccessResponse(response);
        expect(Array.isArray(response.data)).toBe(true);
    });

    it('getAddress: 不存在的地址返回錯誤', async () => {
        const response = await runWithTimers(() => AddressApiService.getAddress('non-existent'));
        expectErrorResponse(response);
    });

    it('createAddress: 未實現', async () => {
        const response = await runWithTimers(() => AddressApiService.createAddress({}));
        expectErrorResponse(response);
    });
});

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

// ============================================
// Dashboard API Service
// ============================================
describe('DashboardApiService', () => {
    it('getAdminDashboard: 返回管理後台數據', async () => {
        const response = await runWithTimers(() => DashboardApiService.getAdminDashboard());
        expectSuccessResponse(response);
    });

    it('getStoreDashboard: 返回商店後台數據', async () => {
        const response = await runWithTimers(() => DashboardApiService.getStoreDashboard('store-1'));
        expectSuccessResponse(response);
    });
});

// ============================================
// Misc API Service
// ============================================
describe('MiscApiService', () => {
    it('getOurSpecs: 返回規格數據', async () => {
        const response = await runWithTimers(() => MiscApiService.getOurSpecs());
        expectSuccessResponse(response);
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
    });

    it('uploadImage: 未實現', async () => {
        const response = await runWithTimers(() => MiscApiService.uploadImage(null));
        expectErrorResponse(response);
    });
});
