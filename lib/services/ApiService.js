/**
 * API Service Classes for E-commerce Platform
 * 
 * These classes provide an abstraction layer for data access.
 * Now using Firebase Firestore for real-time data storage.
 */

import {
    productService,
    orderService,
} from './FirestoreService';

// Keep MockMiscData for static content (categories, specs)
import { MockMiscData } from '@/lib/data/MockData';

/**
 * Base API Service Class
 * Contains common functionality for all API services
 */
class BaseApiService {
    // API 日誌
    static log(service, method, details) {
        const timestamp = new Date().toISOString();
        console.log(
            `📡 [${timestamp}] API [${service}] ${method}:`,
            details
        );
    }

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
            this.log('Product', 'getAllProducts', 'Fetching all products');
            const products = await productService.getAll();
            this.log('Product', 'getAllProducts', `✅ Fetched ${products.length} products`);
            return this.createResponse(products);
        } catch (error) {
            console.error('❌ Error getting all products:', error);
            return this.createResponse(null, false, 'Failed to fetch products');
        }
    }

    static async getProduct(id) {
        try {
            this.log('Product', 'getProduct', `Fetching product: ${id}`);
            const product = await productService.getById(id);
            
            if (!product) {
                this.log('Product', 'getProduct', `⚠️ Product not found: ${id}`);
                return this.createResponse(null, false, 'Product not found');
            }
            
            this.log('Product', 'getProduct', `✅ Fetched product: ${id}`);
            return this.createResponse(product);
        } catch (error) {
            console.error('❌ Error getting product:', error);
            return this.createResponse(null, false, 'Failed to fetch product');
        }
    }

    static async getProductsByCategory(category) {
        try {
            this.log('Product', 'getProductsByCategory', `Fetching category: ${category}`);
            const products = await productService.getByCategory(category);
            this.log('Product', 'getProductsByCategory', `✅ Fetched ${products.length} products`);
            return this.createResponse(products);
        } catch (error) {
            console.error('❌ Error getting products by category:', error);
            return this.createResponse(null, false, 'Failed to fetch products');
        }
    }

    static async getProductsByStore(storeId) {
        try {
            this.log('Product', 'getProductsByStore', `Fetching products for store: ${storeId}`);
            const products = await productService.getByStoreId(storeId);
            this.log('Product', 'getProductsByStore', `✅ Fetched ${products.length} products`);
            return this.createResponse(products);
        } catch (error) {
            console.error('❌ Error getting products by store:', error);
            return this.createResponse(null, false, 'Failed to fetch products');
        }
    }

    static async searchProducts(query) {
        try {
            this.log('Product', 'searchProducts', `Searching: "${query}"`);
            const products = await productService.search(query);
            this.log('Product', 'searchProducts', `✅ Found ${products.length} products`);
            return this.createResponse(products);
        } catch (error) {
            console.error('❌ Error searching products:', error);
            return this.createResponse(null, false, 'Failed to search products');
        }
    }

    static async getCategories() {
        this.log('Product', 'getCategories', 'Fetching categories (MockData)');
        const categories = MockMiscData.getCategories();
        return this.createResponse(categories);
    }

    // Product management methods
    static async createProduct(productData) {
        try {
            this.log('Product', 'createProduct', 'Creating new product');
            const productId = await productService.create(productData);
            this.log('Product', 'createProduct', `✅ Created product: ${productId}`);
            return this.createResponse({ id: productId }, true, 'Product created successfully');
        } catch (error) {
            console.error('❌ Error creating product:', error);
            return this.createResponse(null, false, 'Failed to create product');
        }
    }

    static async updateProduct(id, productData) {
        try {
            this.log('Product', 'updateProduct', `Updating product: ${id}`);
            await productService.update(id, productData);
            this.log('Product', 'updateProduct', `✅ Updated product: ${id}`);
            return this.createResponse({ id }, true, 'Product updated successfully');
        } catch (error) {
            console.error('❌ Error updating product:', error);
            return this.createResponse(null, false, 'Failed to update product');
        }
    }

    static async deleteProduct(id) {
        try {
            this.log('Product', 'deleteProduct', `Deleting product: ${id}`);
            await productService.delete(id);
            this.log('Product', 'deleteProduct', `✅ Deleted product: ${id}`);
            return this.createResponse({ id }, true, 'Product deleted successfully');
        } catch (error) {
            console.error('❌ Error deleting product:', error);
            return this.createResponse(null, false, 'Failed to delete product - write disabled until auth');
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
 * Main API Service
 * Central hub for all API services
 */
export class ApiService {
    static Product = ProductApiService;
    static Order = OrderApiService;
}

// Default export for convenience
export default ApiService;