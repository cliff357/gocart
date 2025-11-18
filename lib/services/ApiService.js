/**
 * API Service Classes for E-commerce Platform
 * 
 * These classes provide an abstraction layer for data access.
 * Currently using mock data, but can be easily switched to real APIs
 * by updating the implementation of these methods.
 */

import {
    MockUserData,
    MockStoreData,
    MockRatingData,
    MockProductData,
    MockAddressData,
    MockCouponData,
    MockOrderData,
    MockDashboardData,
    MockMiscData
} from '@/lib/data/MockData';

/**
 * Base API Service Class
 * Contains common functionality for all API services
 */
class BaseApiService {
    // Simulate API delay for realistic behavior
    static async simulateDelay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Simulate API response structure
    static createResponse(data, success = true, message = null) {
        return {
            success,
            data,
            message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Product API Service
 * Handles all product-related API calls
 */
export class ProductApiService extends BaseApiService {
    static async getAllProducts() {
        await this.simulateDelay(300);
        const products = MockProductData.getAllProducts();
        return this.createResponse(products);
    }

    static async getProduct(id) {
        await this.simulateDelay(200);
        const product = MockProductData.getProduct(id);
        
        if (!product) {
            return this.createResponse(null, false, 'Product not found');
        }
        
        return this.createResponse(product);
    }

    static async getProductsByCategory(category) {
        await this.simulateDelay(250);
        const products = MockProductData.getProductsByCategory(category);
        return this.createResponse(products);
    }

    static async getProductsByStore(storeId) {
        await this.simulateDelay(250);
        const products = MockProductData.getProductsByStoreId(storeId);
        return this.createResponse(products);
    }

    static async searchProducts(query) {
        await this.simulateDelay(300);
        const products = MockProductData.searchProducts(query);
        return this.createResponse(products);
    }

    static async getCategories() {
        await this.simulateDelay(100);
        const categories = MockMiscData.getCategories();
        return this.createResponse(categories);
    }

    // Future method for creating products (when real API is connected)
    static async createProduct(productData) {
        await this.simulateDelay(500);
        // This would make a POST request to real API
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }

    // Future method for updating products
    static async updateProduct(id, productData) {
        await this.simulateDelay(500);
        // This would make a PUT request to real API
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }

    // Future method for deleting products
    static async deleteProduct(id) {
        await this.simulateDelay(300);
        // This would make a DELETE request to real API
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }
}

/**
 * User API Service
 * Handles all user-related API calls
 */
export class UserApiService extends BaseApiService {
    static async getUser(id) {
        await this.simulateDelay(200);
        const user = MockUserData.getUser(id);
        
        if (!user) {
            return this.createResponse(null, false, 'User not found');
        }
        
        return this.createResponse(user);
    }

    static async getAllUsers() {
        await this.simulateDelay(300);
        const users = MockUserData.getAllUsers();
        return this.createResponse(users);
    }

    static async getCurrentUser() {
        await this.simulateDelay(200);
        const user = MockUserData.getDefaultUser();
        return this.createResponse(user);
    }

    // Future authentication methods
    static async login(credentials) {
        await this.simulateDelay(800);
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }

    static async register(userData) {
        await this.simulateDelay(800);
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }

    static async logout() {
        await this.simulateDelay(300);
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }
}

/**
 * Store API Service
 * Handles all store-related API calls
 */
export class StoreApiService extends BaseApiService {
    static async getStore(id) {
        await this.simulateDelay(200);
        const store = MockStoreData.getStore(id);
        
        if (!store) {
            return this.createResponse(null, false, 'Store not found');
        }
        
        return this.createResponse(store);
    }

    static async getStoreByUsername(username) {
        await this.simulateDelay(200);
        const store = MockStoreData.getStoreByUsername(username);
        
        if (!store) {
            return this.createResponse(null, false, 'Store not found');
        }
        
        return this.createResponse(store);
    }

    static async getAllStores() {
        await this.simulateDelay(300);
        const stores = MockStoreData.getAllStores();
        return this.createResponse(stores);
    }

    // Future store management methods
    static async createStore(storeData) {
        await this.simulateDelay(500);
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }

    static async updateStore(id, storeData) {
        await this.simulateDelay(500);
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }

    static async deleteStore(id) {
        await this.simulateDelay(300);
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }
}

/**
 * Rating API Service
 * Handles all rating/review-related API calls
 */
export class RatingApiService extends BaseApiService {
    static async getRating(id) {
        await this.simulateDelay(150);
        const rating = MockRatingData.getRating(id);
        
        if (!rating) {
            return this.createResponse(null, false, 'Rating not found');
        }
        
        return this.createResponse(rating);
    }

    static async getRatingsByProduct(productId) {
        await this.simulateDelay(250);
        const ratings = MockRatingData.getRatingsByProductId(productId);
        return this.createResponse(ratings);
    }

    static async getAllRatings() {
        await this.simulateDelay(300);
        const ratings = MockRatingData.getAllRatings();
        return this.createResponse(ratings);
    }

    // Future rating management methods
    static async createRating(ratingData) {
        await this.simulateDelay(400);
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }

    static async updateRating(id, ratingData) {
        await this.simulateDelay(400);
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }

    static async deleteRating(id) {
        await this.simulateDelay(300);
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }
}

/**
 * Order API Service
 * Handles all order-related API calls
 */
export class OrderApiService extends BaseApiService {
    static async getOrder(id) {
        await this.simulateDelay(200);
        const order = MockOrderData.getOrder(id);
        
        if (!order) {
            return this.createResponse(null, false, 'Order not found');
        }
        
        return this.createResponse(order);
    }

    static async getOrdersByUser(userId) {
        await this.simulateDelay(300);
        const orders = MockOrderData.getOrdersByUserId(userId);
        return this.createResponse(orders);
    }

    static async getOrdersByStore(storeId) {
        await this.simulateDelay(300);
        const orders = MockOrderData.getOrdersByStoreId(storeId);
        return this.createResponse(orders);
    }

    static async getAllOrders() {
        await this.simulateDelay(400);
        const orders = MockOrderData.getAllOrders();
        return this.createResponse(orders);
    }

    // Future order management methods
    static async createOrder(orderData) {
        await this.simulateDelay(600);
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }

    static async updateOrderStatus(id, status) {
        await this.simulateDelay(400);
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }

    static async cancelOrder(id) {
        await this.simulateDelay(400);
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }
}

/**
 * Address API Service
 * Handles all address-related API calls
 */
export class AddressApiService extends BaseApiService {
    static async getAddress(id) {
        await this.simulateDelay(150);
        const address = MockAddressData.getAddress(id);
        
        if (!address) {
            return this.createResponse(null, false, 'Address not found');
        }
        
        return this.createResponse(address);
    }

    static async getAddressesByUser(userId) {
        await this.simulateDelay(200);
        const addresses = MockAddressData.getAddressesByUserId(userId);
        return this.createResponse(addresses);
    }

    // Future address management methods
    static async createAddress(addressData) {
        await this.simulateDelay(400);
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }

    static async updateAddress(id, addressData) {
        await this.simulateDelay(400);
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }

    static async deleteAddress(id) {
        await this.simulateDelay(300);
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }
}

/**
 * Coupon API Service
 * Handles all coupon-related API calls
 */
export class CouponApiService extends BaseApiService {
    static async getCoupon(code) {
        await this.simulateDelay(200);
        const coupon = MockCouponData.getCoupon(code);
        
        if (!coupon) {
            return this.createResponse(null, false, 'Coupon not found');
        }
        
        return this.createResponse(coupon);
    }

    static async getPublicCoupons() {
        await this.simulateDelay(250);
        const coupons = MockCouponData.getPublicCoupons();
        return this.createResponse(coupons);
    }

    static async getAllCoupons() {
        await this.simulateDelay(300);
        const coupons = MockCouponData.getAllCoupons();
        return this.createResponse(coupons);
    }

    // Future coupon management methods
    static async createCoupon(couponData) {
        await this.simulateDelay(400);
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }

    static async updateCoupon(code, couponData) {
        await this.simulateDelay(400);
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }

    static async deleteCoupon(code) {
        await this.simulateDelay(300);
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }

    static async validateCoupon(code, userId, orderTotal) {
        await this.simulateDelay(300);
        const coupon = MockCouponData.getCoupon(code);
        
        if (!coupon) {
            return this.createResponse(null, false, 'Invalid coupon code');
        }

        // Basic validation logic (can be expanded)
        const isExpired = new Date(coupon.expiresAt) < new Date();
        if (isExpired) {
            return this.createResponse(null, false, 'Coupon has expired');
        }

        return this.createResponse(coupon, true, 'Coupon is valid');
    }
}

/**
 * Dashboard API Service
 * Handles all dashboard-related API calls
 */
export class DashboardApiService extends BaseApiService {
    static async getAdminDashboard() {
        await this.simulateDelay(500);
        const data = MockDashboardData.getAdminDashboardData();
        return this.createResponse(data);
    }

    static async getStoreDashboard(storeId) {
        await this.simulateDelay(400);
        const data = MockDashboardData.getStoreDashboardData();
        return this.createResponse(data);
    }

    static async getAnalytics(dateRange, storeId = null) {
        await this.simulateDelay(600);
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }
}

/**
 * Miscellaneous API Service
 * Handles other utility API calls
 */
export class MiscApiService extends BaseApiService {
    static async getOurSpecs() {
        await this.simulateDelay(100);
        const specs = MockMiscData.getOurSpecs();
        return this.createResponse(specs);
    }

    static async uploadImage(file) {
        await this.simulateDelay(1000);
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }

    static async sendContactForm(formData) {
        await this.simulateDelay(800);
        return this.createResponse(null, false, 'Not implemented - connect to real API');
    }
}

/**
 * Main API Service
 * Central hub for all API services
 */
export class ApiService {
    static Product = ProductApiService;
    static User = UserApiService;
    static Store = StoreApiService;
    static Rating = RatingApiService;
    static Order = OrderApiService;
    static Address = AddressApiService;
    static Coupon = CouponApiService;
    static Dashboard = DashboardApiService;
    static Misc = MiscApiService;
}

// Default export for convenience
export default ApiService;