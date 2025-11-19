/**
 * API Service Classes for E-commerce Platform
 * 
 * These classes provide an abstraction layer for data access.
 * Now using Firebase Firestore for real-time data storage.
 */

import {
    productService,
    storeService,
    userService,
    orderService,
    ratingService,
    couponService,
    addressService
} from './FirestoreService';

// Keep MockMiscData for static content (categories, specs)
import { MockMiscData } from '@/lib/data/MockData';

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
 * Handles all product-related API calls using Firebase Firestore
 */
export class ProductApiService extends BaseApiService {
    static async getAllProducts() {
        try {
            const products = await productService.getAll();
            return this.createResponse(products);
        } catch (error) {
            console.error('Error getting all products:', error);
            return this.createResponse(null, false, 'Failed to fetch products');
        }
    }

    static async getProduct(id) {
        try {
            const product = await productService.getById(id);
            
            if (!product) {
                return this.createResponse(null, false, 'Product not found');
            }
            
            return this.createResponse(product);
        } catch (error) {
            console.error('Error getting product:', error);
            return this.createResponse(null, false, 'Failed to fetch product');
        }
    }

    static async getProductsByCategory(category) {
        try {
            const products = await productService.getByCategory(category);
            return this.createResponse(products);
        } catch (error) {
            console.error('Error getting products by category:', error);
            return this.createResponse(null, false, 'Failed to fetch products');
        }
    }

    static async getProductsByStore(storeId) {
        try {
            const products = await productService.getByStoreId(storeId);
            return this.createResponse(products);
        } catch (error) {
            console.error('Error getting products by store:', error);
            return this.createResponse(null, false, 'Failed to fetch products');
        }
    }

    static async searchProducts(query) {
        try {
            const products = await productService.search(query);
            return this.createResponse(products);
        } catch (error) {
            console.error('Error searching products:', error);
            return this.createResponse(null, false, 'Failed to search products');
        }
    }

    static async getCategories() {
        // Still using MockData for static categories
        const categories = MockMiscData.getCategories();
        return this.createResponse(categories);
    }

    // Product management methods (write operations disabled until authentication)
    static async createProduct(productData) {
        try {
            const productId = await productService.create(productData);
            return this.createResponse({ id: productId }, true, 'Product created successfully');
        } catch (error) {
            console.error('Error creating product:', error);
            return this.createResponse(null, false, 'Failed to create product - write disabled until auth');
        }
    }

    static async updateProduct(id, productData) {
        try {
            await productService.update(id, productData);
            return this.createResponse({ id }, true, 'Product updated successfully');
        } catch (error) {
            console.error('Error updating product:', error);
            return this.createResponse(null, false, 'Failed to update product - write disabled until auth');
        }
    }

    static async deleteProduct(id) {
        try {
            await productService.delete(id);
            return this.createResponse({ id }, true, 'Product deleted successfully');
        } catch (error) {
            console.error('Error deleting product:', error);
            return this.createResponse(null, false, 'Failed to delete product - write disabled until auth');
        }
    }
}

/**
 * User API Service
 * Handles all user-related API calls using Firebase Firestore
 */
export class UserApiService extends BaseApiService {
    static async getUser(id) {
        try {
            const user = await userService.getById(id);
            
            if (!user) {
                return this.createResponse(null, false, 'User not found');
            }
            
            return this.createResponse(user);
        } catch (error) {
            console.error('Error getting user:', error);
            return this.createResponse(null, false, 'Failed to fetch user');
        }
    }

    static async getAllUsers() {
        try {
            const users = await userService.getAll();
            return this.createResponse(users);
        } catch (error) {
            console.error('Error getting all users:', error);
            return this.createResponse(null, false, 'Failed to fetch users');
        }
    }

    static async getCurrentUser() {
        try {
            // For now, return first user (will be replaced with Firebase Auth)
            const users = await userService.getAll();
            const user = users.length > 0 ? users[0] : null;
            
            if (!user) {
                return this.createResponse(null, false, 'No users found');
            }
            
            return this.createResponse(user);
        } catch (error) {
            console.error('Error getting current user:', error);
            return this.createResponse(null, false, 'Failed to fetch current user');
        }
    }

    // Authentication methods (to be implemented with Firebase Auth)
    static async login(credentials) {
        return this.createResponse(null, false, 'Authentication not implemented - Firebase Auth required');
    }

    static async register(userData) {
        return this.createResponse(null, false, 'Authentication not implemented - Firebase Auth required');
    }

    static async logout() {
        return this.createResponse(null, false, 'Authentication not implemented - Firebase Auth required');
    }
}

/**
 * Store API Service
 * Handles all store-related API calls using Firebase Firestore
 */
export class StoreApiService extends BaseApiService {
    static async getStore(id) {
        try {
            const store = await storeService.getById(id);
            
            if (!store) {
                return this.createResponse(null, false, 'Store not found');
            }
            
            return this.createResponse(store);
        } catch (error) {
            console.error('Error getting store:', error);
            return this.createResponse(null, false, 'Failed to fetch store');
        }
    }

    static async getStoreByUsername(username) {
        try {
            const store = await storeService.getByUsername(username);
            
            if (!store) {
                return this.createResponse(null, false, 'Store not found');
            }
            
            return this.createResponse(store);
        } catch (error) {
            console.error('Error getting store by username:', error);
            return this.createResponse(null, false, 'Failed to fetch store');
        }
    }

    static async getAllStores() {
        try {
            const stores = await storeService.getAll();
            return this.createResponse(stores);
        } catch (error) {
            console.error('Error getting all stores:', error);
            return this.createResponse(null, false, 'Failed to fetch stores');
        }
    }

    // Store management methods (write operations disabled until authentication)
    static async createStore(storeData) {
        try {
            const storeId = await storeService.create(storeData);
            return this.createResponse({ id: storeId }, true, 'Store created successfully');
        } catch (error) {
            console.error('Error creating store:', error);
            return this.createResponse(null, false, 'Failed to create store - write disabled until auth');
        }
    }

    static async updateStore(id, storeData) {
        try {
            await storeService.update(id, storeData);
            return this.createResponse({ id }, true, 'Store updated successfully');
        } catch (error) {
            console.error('Error updating store:', error);
            return this.createResponse(null, false, 'Failed to update store - write disabled until auth');
        }
    }

    static async deleteStore(id) {
        try {
            await storeService.delete(id);
            return this.createResponse({ id }, true, 'Store deleted successfully');
        } catch (error) {
            console.error('Error deleting store:', error);
            return this.createResponse(null, false, 'Failed to delete store - write disabled until auth');
        }
    }
}

/**
 * Rating API Service
 * Handles all rating/review-related API calls using Firebase Firestore
 */
export class RatingApiService extends BaseApiService {
    static async getRating(id) {
        try {
            const rating = await ratingService.getById(id);
            
            if (!rating) {
                return this.createResponse(null, false, 'Rating not found');
            }
            
            return this.createResponse(rating);
        } catch (error) {
            console.error('Error getting rating:', error);
            return this.createResponse(null, false, 'Failed to fetch rating');
        }
    }

    static async getRatingsByProduct(productId) {
        try {
            const ratings = await ratingService.getByProductId(productId);
            return this.createResponse(ratings);
        } catch (error) {
            console.error('Error getting ratings by product:', error);
            return this.createResponse(null, false, 'Failed to fetch ratings');
        }
    }

    static async getAllRatings() {
        try {
            const ratings = await ratingService.getAll();
            return this.createResponse(ratings);
        } catch (error) {
            console.error('Error getting all ratings:', error);
            return this.createResponse(null, false, 'Failed to fetch ratings');
        }
    }

    // Rating management methods (write operations disabled until authentication)
    static async createRating(ratingData) {
        try {
            const ratingId = await ratingService.create(ratingData);
            return this.createResponse({ id: ratingId }, true, 'Rating created successfully');
        } catch (error) {
            console.error('Error creating rating:', error);
            return this.createResponse(null, false, 'Failed to create rating - write disabled until auth');
        }
    }

    static async updateRating(id, ratingData) {
        try {
            await ratingService.update(id, ratingData);
            return this.createResponse({ id }, true, 'Rating updated successfully');
        } catch (error) {
            console.error('Error updating rating:', error);
            return this.createResponse(null, false, 'Failed to update rating - write disabled until auth');
        }
    }

    static async deleteRating(id) {
        try {
            await ratingService.delete(id);
            return this.createResponse({ id }, true, 'Rating deleted successfully');
        } catch (error) {
            console.error('Error deleting rating:', error);
            return this.createResponse(null, false, 'Failed to delete rating - write disabled until auth');
        }
    }
}

/**
 * Order API Service
 * Handles all order-related API calls using Firebase Firestore
 */
export class OrderApiService extends BaseApiService {
    static async getOrder(id) {
        try {
            const order = await orderService.getById(id);
            
            if (!order) {
                return this.createResponse(null, false, 'Order not found');
            }
            
            return this.createResponse(order);
        } catch (error) {
            console.error('Error getting order:', error);
            return this.createResponse(null, false, 'Failed to fetch order');
        }
    }

    static async getOrdersByUser(userId) {
        try {
            const orders = await orderService.getByUserId(userId);
            return this.createResponse(orders);
        } catch (error) {
            console.error('Error getting orders by user:', error);
            return this.createResponse(null, false, 'Failed to fetch orders');
        }
    }

    static async getOrdersByStore(storeId) {
        try {
            const orders = await orderService.getByStoreId(storeId);
            return this.createResponse(orders);
        } catch (error) {
            console.error('Error getting orders by store:', error);
            return this.createResponse(null, false, 'Failed to fetch orders');
        }
    }

    static async getAllOrders() {
        try {
            const orders = await orderService.getAll();
            return this.createResponse(orders);
        } catch (error) {
            console.error('Error getting all orders:', error);
            return this.createResponse(null, false, 'Failed to fetch orders');
        }
    }

    // Order management methods (write operations disabled until authentication)
    static async createOrder(orderData) {
        try {
            const orderId = await orderService.create(orderData);
            return this.createResponse({ id: orderId }, true, 'Order created successfully');
        } catch (error) {
            console.error('Error creating order:', error);
            return this.createResponse(null, false, 'Failed to create order - write disabled until auth');
        }
    }

    static async updateOrderStatus(id, status) {
        try {
            await orderService.update(id, { status });
            return this.createResponse({ id, status }, true, 'Order status updated successfully');
        } catch (error) {
            console.error('Error updating order status:', error);
            return this.createResponse(null, false, 'Failed to update order - write disabled until auth');
        }
    }

    static async cancelOrder(id) {
        try {
            await orderService.update(id, { status: 'cancelled' });
            return this.createResponse({ id }, true, 'Order cancelled successfully');
        } catch (error) {
            console.error('Error cancelling order:', error);
            return this.createResponse(null, false, 'Failed to cancel order - write disabled until auth');
        }
    }
}

/**
 * Address API Service
 * Handles all address-related API calls using Firebase Firestore
 */
export class AddressApiService extends BaseApiService {
    static async getAddress(id) {
        try {
            const address = await addressService.getById(id);
            
            if (!address) {
                return this.createResponse(null, false, 'Address not found');
            }
            
            return this.createResponse(address);
        } catch (error) {
            console.error('Error getting address:', error);
            return this.createResponse(null, false, 'Failed to fetch address');
        }
    }

    static async getAddressesByUser(userId) {
        try {
            const addresses = await addressService.getByUserId(userId);
            return this.createResponse(addresses);
        } catch (error) {
            console.error('Error getting addresses by user:', error);
            return this.createResponse(null, false, 'Failed to fetch addresses');
        }
    }

    // Address management methods (write operations disabled until authentication)
    static async createAddress(addressData) {
        try {
            const addressId = await addressService.create(addressData);
            return this.createResponse({ id: addressId }, true, 'Address created successfully');
        } catch (error) {
            console.error('Error creating address:', error);
            return this.createResponse(null, false, 'Failed to create address - write disabled until auth');
        }
    }

    static async updateAddress(id, addressData) {
        try {
            await addressService.update(id, addressData);
            return this.createResponse({ id }, true, 'Address updated successfully');
        } catch (error) {
            console.error('Error updating address:', error);
            return this.createResponse(null, false, 'Failed to update address - write disabled until auth');
        }
    }

    static async deleteAddress(id) {
        try {
            await addressService.delete(id);
            return this.createResponse({ id }, true, 'Address deleted successfully');
        } catch (error) {
            console.error('Error deleting address:', error);
            return this.createResponse(null, false, 'Failed to delete address - write disabled until auth');
        }
    }
}

/**
 * Coupon API Service
 * Handles all coupon-related API calls using Firebase Firestore
 */
export class CouponApiService extends BaseApiService {
    static async getCoupon(code) {
        try {
            const coupon = await couponService.getByCode(code);
            
            if (!coupon) {
                return this.createResponse(null, false, 'Coupon not found');
            }
            
            return this.createResponse(coupon);
        } catch (error) {
            console.error('Error getting coupon:', error);
            return this.createResponse(null, false, 'Failed to fetch coupon');
        }
    }

    static async getPublicCoupons() {
        try {
            const coupons = await couponService.getPublic();
            return this.createResponse(coupons);
        } catch (error) {
            console.error('Error getting public coupons:', error);
            return this.createResponse(null, false, 'Failed to fetch coupons');
        }
    }

    static async getAllCoupons() {
        try {
            const coupons = await couponService.getAll();
            return this.createResponse(coupons);
        } catch (error) {
            console.error('Error getting all coupons:', error);
            return this.createResponse(null, false, 'Failed to fetch coupons');
        }
    }

    // Coupon management methods (write operations disabled until authentication)
    static async createCoupon(couponData) {
        try {
            const couponId = await couponService.create(couponData);
            return this.createResponse({ id: couponId }, true, 'Coupon created successfully');
        } catch (error) {
            console.error('Error creating coupon:', error);
            return this.createResponse(null, false, 'Failed to create coupon - write disabled until auth');
        }
    }

    static async updateCoupon(code, couponData) {
        try {
            await couponService.update(code, couponData);
            return this.createResponse({ code }, true, 'Coupon updated successfully');
        } catch (error) {
            console.error('Error updating coupon:', error);
            return this.createResponse(null, false, 'Failed to update coupon - write disabled until auth');
        }
    }

    static async deleteCoupon(code) {
        try {
            await couponService.delete(code);
            return this.createResponse({ code }, true, 'Coupon deleted successfully');
        } catch (error) {
            console.error('Error deleting coupon:', error);
            return this.createResponse(null, false, 'Failed to delete coupon - write disabled until auth');
        }
    }

    static async validateCoupon(code, userId, orderTotal) {
        try {
            const result = await couponService.validate(code);
            
            if (!result.valid) {
                return this.createResponse(null, false, result.message);
            }
            
            return this.createResponse(result.coupon, true, 'Coupon is valid');
        } catch (error) {
            console.error('Error validating coupon:', error);
            return this.createResponse(null, false, 'Failed to validate coupon');
        }
    }
}

/**
 * Dashboard API Service
 * Handles all dashboard-related API calls using Firebase Firestore
 */
export class DashboardApiService extends BaseApiService {
    static async getAdminDashboard() {
        try {
            // Aggregate data from multiple collections
            const [stores, products, orders, users] = await Promise.all([
                storeService.getAll(),
                productService.getAll(),
                orderService.getAll(),
                userService.getAll()
            ]);

            // Calculate dashboard metrics
            const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            const pendingStores = stores.filter(s => s.status === 'pending').length;

            const dashboardData = {
                totalStores: stores.length,
                totalProducts: products.length,
                totalOrders: orders.length,
                totalUsers: users.length,
                totalRevenue,
                pendingStores,
                recentOrders: orders.slice(0, 10),
                recentStores: stores.slice(0, 5)
            };

            return this.createResponse(dashboardData);
        } catch (error) {
            console.error('Error getting admin dashboard:', error);
            return this.createResponse(null, false, 'Failed to fetch dashboard data');
        }
    }

    static async getStoreDashboard(storeId) {
        try {
            // Get store-specific data
            const [store, products, orders] = await Promise.all([
                storeService.getById(storeId),
                productService.getByStoreId(storeId),
                orderService.getByStoreId(storeId)
            ]);

            if (!store) {
                return this.createResponse(null, false, 'Store not found');
            }

            // Calculate metrics
            const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            const pendingOrders = orders.filter(o => o.status === 'pending').length;

            const dashboardData = {
                store,
                totalProducts: products.length,
                totalOrders: orders.length,
                totalRevenue,
                pendingOrders,
                recentOrders: orders.slice(0, 10),
                topProducts: products.slice(0, 5)
            };

            return this.createResponse(dashboardData);
        } catch (error) {
            console.error('Error getting store dashboard:', error);
            return this.createResponse(null, false, 'Failed to fetch dashboard data');
        }
    }

    static async getAnalytics(dateRange, storeId = null) {
        try {
            // Get orders within date range
            let orders = await orderService.getAll();
            
            if (storeId) {
                orders = orders.filter(o => o.storeId === storeId);
            }

            // Filter by date range if provided
            if (dateRange) {
                const { start, end } = dateRange;
                orders = orders.filter(o => {
                    const orderDate = new Date(o.createdAt);
                    return orderDate >= new Date(start) && orderDate <= new Date(end);
                });
            }

            // Calculate analytics
            const analytics = {
                totalOrders: orders.length,
                totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
                averageOrderValue: orders.length > 0 
                    ? orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) / orders.length 
                    : 0,
                ordersByStatus: orders.reduce((acc, o) => {
                    acc[o.status] = (acc[o.status] || 0) + 1;
                    return acc;
                }, {})
            };

            return this.createResponse(analytics);
        } catch (error) {
            console.error('Error getting analytics:', error);
            return this.createResponse(null, false, 'Failed to fetch analytics');
        }
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