/**
 * Mock Data Classes for E-commerce Platform
 * 
 * This file contains all mock data organized into classes for better structure
 * and easier maintenance. Future real API integration will only require
 * updating the API service classes.
 */

import { 
    assets
} from '@/assets/assets';
import gs_logo from '@/assets/gs_logo.jpg';
import happy_store from '@/assets/happy_store.webp';
import profile_pic1 from '@/assets/profile_pic1.jpg';
import profile_pic2 from '@/assets/profile_pic2.jpg';
import profile_pic3 from '@/assets/profile_pic3.jpg';
import { 
    ClockFadingIcon, 
    HeadsetIcon, 
    SendIcon 
} from "lucide-react";

/**
 * User Mock Data Class
 */
export class MockUserData {
    static users = [
        {
            id: "user_31dQbH27HVtovbs13X2cmqefddM",
            name: "GreatStack",
            email: "greatstack@example.com",
            image: gs_logo,
            cart: {}
        },
        {
            id: "user_31dOriXqC4TATvc0brIhlYbwwc5",
            name: "Great Stack",
            email: "user.greatstack@gmail.com",
            image: gs_logo,
        }
    ];

    static getUser(id) {
        return this.users.find(user => user.id === id);
    }

    static getAllUsers() {
        return this.users;
    }

    static getDefaultUser() {
        return this.users[0];
    }
}

/**
 * Store Mock Data Class
 */
export class MockStoreData {
    static stores = [
        {
            id: "cmemkb98v0001tat8r1hiyxhn",
            userId: "user_31dOriXqC4TATvc0brIhlYbwwc5",
            name: "GreatStack",
            description: "GreatStack is the education marketplace where you can buy goodies related to coding and tech",
            username: "greatstack",
            address: "123 Maplewood Drive Springfield, IL 62704 USA",
            status: "approved",
            isActive: true,
            logo: gs_logo,
            email: "greatstack@example.com",
            contact: "+0 1234567890",
            createdAt: "2025-08-22T08:22:16.189Z",
            updatedAt: "2025-08-22T08:22:44.273Z",
        },
        {
            id: "cmemkqnzm000htat8u7n8cpte",
            userId: "user_31dQbH27HVtovbs13X2cmqefddM",
            name: "Happy Shop",
            description: "At Happy Shop, we believe shopping should be simple, smart, and satisfying. Whether you're hunting for the latest fashion trends, top-notch electronics, home essentials, or unique lifestyle products — we've got it all under one digital roof.",
            username: "happyshop",
            address: "3rd Floor, Happy Shop , New Building, 123 street , c sector , NY, US",
            status: "approved",
            isActive: true,
            logo: happy_store,
            email: "happyshop@example.com",
            contact: "+0 123456789",
            createdAt: "2025-08-22T08:34:15.155Z",
            updatedAt: "2025-08-22T08:34:47.162Z",
        }
    ];

    // Lazy loading of user references to avoid circular dependencies
    static getStoreWithUser(storeId) {
        const store = this.getStore(storeId);
        if (store) {
            return {
                ...store,
                user: MockUserData.getUser(store.userId)
            };
        }
        return null;
    }

    static getStore(id) {
        return this.stores.find(store => store.id === id);
    }

    static getStoreByUsername(username) {
        return this.stores.find(store => store.username === username);
    }

    static getAllStores() {
        return this.stores.map(store => ({
            ...store,
            user: MockUserData.getUser(store.userId)
        }));
    }

    static getDefaultStore() {
        return this.stores[1]; // Happy Shop as default
    }
}

/**
 * Rating/Review Mock Data Class
 */
export class MockRatingData {
    static ratings = [
        { 
            id: "rat_1", 
            rating: 4.2, 
            review: "I was a bit skeptical at first, but this product turned out to be even better than I imagined. The quality feels premium, it's easy to use, and it delivers exactly what was promised. I've already recommended it to friends and will definitely purchase again in the future.", 
            user: { name: 'Kristin Watson', image: profile_pic1 }, 
            productId: "prod_1", 
            createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', 
            updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)'
        },
        { 
            id: "rat_2", 
            rating: 5.0, 
            review: "This product is great. I love it!  You made it so simple. My new site is so much faster and easier to work with than my old site.", 
            user: { name: 'Jenny Wilson', image: profile_pic2 }, 
            productId: "prod_1", 
            createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', 
            updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)'
        },
        { 
            id: "rat_3", 
            rating: 4.1, 
            review: "This product is amazing. I love it!  You made it so simple. My new site is so much faster and easier to work with than my old site.", 
            user: { name: 'Bessie Cooper', image: profile_pic3 }, 
            productId: "prod_2", 
            createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', 
            updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)'
        },
        { 
            id: "rat_4", 
            rating: 5.0, 
            review: "This product is great. I love it!  You made it so simple. My new site is so much faster and easier to work with than my old site.", 
            user: { name: 'Kristin Watson', image: profile_pic1 }, 
            productId: "prod_3", 
            createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', 
            updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)'
        },
        { 
            id: "rat_5", 
            rating: 4.3, 
            review: "Overall, I'm very happy with this purchase. It works as described and feels durable. The only reason I didn't give it five stars is because of a small issue (such as setup taking a bit longer than expected, or packaging being slightly damaged). Still, highly recommend it for anyone looking for a reliable option.", 
            user: { name: 'Jenny Wilson', image: profile_pic2 }, 
            productId: "prod_4", 
            createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', 
            updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)'
        },
        { 
            id: "rat_6", 
            rating: 5.0, 
            review: "This product is great. I love it!  You made it so simple. My new site is so much faster and easier to work with than my old site.", 
            user: { name: 'Bessie Cooper', image: profile_pic3 }, 
            productId: "prod_5", 
            createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', 
            updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)'
        },
    ];

    static getRating(id) {
        return this.ratings.find(rating => rating.id === id);
    }

    static getRatingsByProductId(productId) {
        const productRatings = this.ratings.filter(rating => rating.productId === productId);
        // If no ratings for specific product, return some default ratings
        return productRatings.length > 0 ? productRatings : this.ratings.slice(0, 2);
    }

    static getAllRatings() {
        return this.ratings;
    }

    static getDefaultRatings() {
        return this.ratings.slice(0, 2);
    }
}

/**
 * Product Mock Data Class
 */
export class MockProductData {
    static products = [
        {
            id: "prod_1",
            name: "Modern table lamp",
            description: "Modern table lamp with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty. Enhance your audio experience with this earbuds. Indulge yourself in a world of pure sound with 50 hours of uninterrupted playtime. Equipped with the cutting-edge Zen Mode Tech ENC and BoomX Tech, prepare to be enthralled by a symphony of crystal-clear melodies.",
            mrp: 40,
            price: 29,
            images: [assets.product_img1, assets.product_img2, assets.product_img3, assets.product_img4],
            category: "Decoration",
            storeId: "cmemkqnzm000htat8u7n8cpte",
            inStock: true,
            createdAt: 'Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)',
            updatedAt: 'Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)',
        },
        {
            id: "prod_2",
            name: "Smart speaker gray",
            description: "Smart speaker with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
            mrp: 50,
            price: 29,
            images: [assets.product_img2],
            storeId: "cmemkqnzm000htat8u7n8cpte",
            inStock: true,
            category: "Speakers",
            createdAt: 'Sat Jul 28 2025 14:51:25 GMT+0530 (India Standard Time)',
            updatedAt: 'Sat Jul 28 2025 14:51:25 GMT+0530 (India Standard Time)',
        },
        {
            id: "prod_3",
            name: "Smart watch white",
            description: "Smart watch with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
            mrp: 60,
            price: 29,
            images: [assets.product_img3],
            storeId: "cmemkqnzm000htat8u7n8cpte",
            inStock: true,
            category: "Watch",
            createdAt: 'Sat Jul 27 2025 14:51:25 GMT+0530 (India Standard Time)',
            updatedAt: 'Sat Jul 27 2025 14:51:25 GMT+0530 (India Standard Time)',
        },
        {
            id: "prod_4",
            name: "Wireless headphones",
            description: "Wireless headphones with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
            mrp: 70,
            price: 29,
            images: [assets.product_img4],
            storeId: "cmemkqnzm000htat8u7n8cpte",
            inStock: true,
            category: "Headphones",
            createdAt: 'Sat Jul 26 2025 14:51:25 GMT+0530 (India Standard Time)',
            updatedAt: 'Sat Jul 26 2025 14:51:25 GMT+0530 (India Standard Time)',
        },
        {
            id: "prod_5",
            name: "Smart watch black",
            description: "Smart watch with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
            mrp: 49,
            price: 29,
            images: [assets.product_img5],
            storeId: "cmemkqnzm000htat8u7n8cpte",
            inStock: true,
            category: "Watch",
            createdAt: 'Sat Jul 25 2025 14:51:25 GMT+0530 (India Standard Time)',
            updatedAt: 'Sat Jul 25 2025 14:51:25 GMT+0530 (India Standard Time)',
        },
        {
            id: "prod_6",
            name: "Security Camera",
            description: "Security Camera with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
            mrp: 59,
            price: 29,
            images: [assets.product_img6],
            storeId: "cmemkqnzm000htat8u7n8cpte",
            inStock: true,
            category: "Camera",
            createdAt: 'Sat Jul 25 2025 14:51:25 GMT+0530 (India Standard Time)',
            updatedAt: 'Sat Jul 25 2025 14:51:25 GMT+0530 (India Standard Time)',
        },
        {
            id: "prod_7",
            name: "Smart Pen for iPad",
            description: "Smart Pen for iPad with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
            mrp: 89,
            price: 29,
            images: [assets.product_img7],
            storeId: "cmemkqnzm000htat8u7n8cpte",
            inStock: true,
            category: "Pen",
            createdAt: 'Sat Jul 24 2025 14:51:25 GMT+0530 (India Standard Time)',
            updatedAt: 'Sat Jul 24 2025 14:51:25 GMT+0530 (India Standard Time)',
        },
        {
            id: "prod_8",
            name: "Home Theater",
            description: "Home Theater with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
            mrp: 99,
            price: 29,
            images: [assets.product_img8],
            storeId: "cmemkqnzm000htat8u7n8cpte",
            inStock: true,
            category: "Theater",
            createdAt: 'Sat Jul 23 2025 14:51:25 GMT+0530 (India Standard Time)',
            updatedAt: 'Sat Jul 23 2025 14:51:25 GMT+0530 (India Standard Time)',
        },
        {
            id: "prod_9",
            name: "Apple Wireless Earbuds",
            description: "Apple Wireless Earbuds with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
            mrp: 89,
            price: 29,
            images: [assets.product_img9],
            storeId: "cmemkqnzm000htat8u7n8cpte",
            inStock: true,
            category: "Earbuds",
            createdAt: 'Sat Jul 22 2025 14:51:25 GMT+0530 (India Standard Time)',
            updatedAt: 'Sat Jul 22 2025 14:51:25 GMT+0530 (India Standard Time)',
        },
        {
            id: "prod_10",
            name: "Apple Smart Watch",
            description: "Apple Smart Watch with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
            mrp: 179,
            price: 29,
            images: [assets.product_img10],
            storeId: "cmemkqnzm000htat8u7n8cpte",
            inStock: true,
            category: "Watch",
            createdAt: 'Sat Jul 21 2025 14:51:25 GMT+0530 (India Standard Time)',
            updatedAt: 'Sat Jul 21 2025 14:51:25 GMT+0530 (India Standard Time)',
        },
        {
            id: "prod_11",
            name: "RGB Gaming Mouse",
            description: "RGB Gaming Mouse with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
            mrp: 39,
            price: 29,
            images: [assets.product_img11],
            storeId: "cmemkqnzm000htat8u7n8cpte",
            inStock: true,
            category: "Mouse",
            createdAt: 'Sat Jul 20 2025 14:51:25 GMT+0530 (India Standard Time)',
            updatedAt: 'Sat Jul 20 2025 14:51:25 GMT+0530 (India Standard Time)',
        },
        {
            id: "prod_12",
            name: "Smart Home Cleaner",
            description: "Smart Home Cleaner with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
            mrp: 199,
            price: 29,
            images: [assets.product_img12],
            storeId: "cmemkqnzm000htat8u7n8cpte",
            inStock: true,
            category: "Cleaner",
            createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)',
            updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)',
        }
    ];

    // Methods to get products with related data loaded dynamically
    static getProduct(id) {
        const product = this.products.find(product => product.id === id);
        if (product) {
            return {
                ...product,
                store: MockStoreData.getStore(product.storeId),
                rating: MockRatingData.getRatingsByProductId(product.id)
            };
        }
        return null;
    }

    // Method to get raw product data without relations (used internally to prevent circular calls)
    static getRawProduct(id) {
        return this.products.find(product => product.id === id);
    }

    static getProductsByCategory(category) {
        return this.products
            .filter(product => product.category === category)
            .map(product => ({
                ...product,
                store: MockStoreData.getStore(product.storeId),
                rating: MockRatingData.getRatingsByProductId(product.id)
            }));
    }

    static getProductsByStoreId(storeId) {
        return this.products
            .filter(product => product.storeId === storeId)
            .map(product => ({
                ...product,
                store: MockStoreData.getStore(product.storeId),
                rating: MockRatingData.getRatingsByProductId(product.id)
            }));
    }

    static getAllProducts() {
        return this.products.map(product => ({
            ...product,
            store: MockStoreData.getStore(product.storeId),
            rating: MockRatingData.getRatingsByProductId(product.id)
        }));
    }

    static searchProducts(query) {
        return this.products
            .filter(product => 
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.description.toLowerCase().includes(query.toLowerCase()) ||
                product.category.toLowerCase().includes(query.toLowerCase())
            )
            .map(product => ({
                ...product,
                store: MockStoreData.getStore(product.storeId),
                rating: MockRatingData.getRatingsByProductId(product.id)
            }));
    }
}

/**
 * Address Mock Data Class
 */
export class MockAddressData {
    static addresses = [
        {
            id: "addr_1",
            userId: "user_1",
            name: "John Doe",
            email: "johndoe@example.com",
            street: "123 Main St",
            city: "New York",
            state: "NY",
            zip: "10001",
            country: "USA",
            phone: "1234567890",
            createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)',
        }
    ];

    static getAddress(id) {
        return this.addresses.find(address => address.id === id);
    }

    static getAddressesByUserId(userId) {
        return this.addresses.filter(address => address.userId === userId);
    }

    static getDefaultAddress() {
        return this.addresses[0];
    }
}

/**
 * Coupon Mock Data Class
 */
export class MockCouponData {
    static coupons = [
        { code: "NEW20", description: "20% Off for New Users", discount: 20, forNewUser: true, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:35:31.183Z" },
        { code: "NEW10", description: "10% Off for New Users", discount: 10, forNewUser: true, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:35:50.653Z" },
        { code: "OFF20", description: "20% Off for All Users", discount: 20, forNewUser: false, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:42:00.811Z" },
        { code: "OFF10", description: "10% Off for All Users", discount: 10, forNewUser: false, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:42:21.279Z" },
        { code: "PLUS10", description: "20% Off for Members", discount: 10, forNewUser: false, forMember: true, isPublic: false, expiresAt: "2027-03-06T00:00:00.000Z", createdAt: "2025-08-22T11:38:20.194Z" }
    ];

    static getCoupon(code) {
        return this.coupons.find(coupon => coupon.code === code);
    }

    static getPublicCoupons() {
        return this.coupons.filter(coupon => coupon.isPublic);
    }

    static getAllCoupons() {
        return this.coupons;
    }
}

/**
 * Order Mock Data Class
 */
export class MockOrderData {
    static orders = [
        {
            id: "cmemm75h5001jtat89016h1p3",
            total: 214.2,
            status: "DELIVERED",
            userId: "user_31dQbH27HVtovbs13X2cmqefddM",
            storeId: "cmemkqnzm000htat8u7n8cpte",
            addressId: "addr_1",
            isPaid: false,
            paymentMethod: "COD",
            createdAt: "2025-08-22T09:15:03.929Z",
            updatedAt: "2025-08-22T09:15:50.723Z",
            isCouponUsed: true,
            couponCode: "OFF20",
            orderItems: [
                { orderId: "cmemm75h5001jtat89016h1p3", productId: "prod_1", quantity: 1, price: 89 },
                { orderId: "cmemm75h5001jtat89016h1p3", productId: "prod_2", quantity: 1, price: 149 }
            ]
        },
        {
            id: "cmemm6jv7001htat8vmm3gxaf",
            total: 421.6,
            status: "DELIVERED",
            userId: "user_31dQbH27HVtovbs13X2cmqefddM",
            storeId: "cmemkqnzm000htat8u7n8cpte",
            addressId: "addr_1",
            isPaid: false,
            paymentMethod: "COD",
            createdAt: "2025-08-22T09:14:35.923Z",
            updatedAt: "2025-08-22T09:15:52.535Z",
            isCouponUsed: true,
            couponCode: "NEW20",
            orderItems: [
                { orderId: "cmemm6jv7001htat8vmm3gxaf", productId: "prod_3", quantity: 1, price: 229 },
                { orderId: "cmemm6jv7001htat8vmm3gxaf", productId: "prod_4", quantity: 1, price: 99 },
                { orderId: "cmemm6jv7001htat8vmm3gxaf", productId: "prod_5", quantity: 1, price: 199 }
            ]
        }
    ];

    static getOrder(id) {
        const order = this.orders.find(order => order.id === id);
        if (order) {
            return {
                ...order,
                address: MockAddressData.getAddress(order.addressId),
                user: MockUserData.getUser(order.userId),
                coupon: order.couponCode ? MockCouponData.getCoupon(order.couponCode) : null,
                orderItems: order.orderItems.map(item => ({
                    ...item,
                    product: MockProductData.getRawProduct(item.productId)
                }))
            };
        }
        return null;
    }

    static getOrdersByUserId(userId) {
        return this.orders
            .filter(order => order.userId === userId)
            .map(order => ({
                ...order,
                address: MockAddressData.getAddress(order.addressId),
                user: MockUserData.getUser(order.userId),
                coupon: order.couponCode ? MockCouponData.getCoupon(order.couponCode) : null,
                orderItems: order.orderItems.map(item => ({
                    ...item,
                    product: MockProductData.getRawProduct(item.productId)
                }))
            }));
    }

    static getOrdersByStoreId(storeId) {
        return this.orders
            .filter(order => order.storeId === storeId)
            .map(order => ({
                ...order,
                address: MockAddressData.getAddress(order.addressId),
                user: MockUserData.getUser(order.userId),
                coupon: order.couponCode ? MockCouponData.getCoupon(order.couponCode) : null,
                orderItems: order.orderItems.map(item => ({
                    ...item,
                    product: MockProductData.getRawProduct(item.productId)
                }))
            }));
    }

    static getAllOrders() {
        return this.orders.map(order => ({
            ...order,
            address: MockAddressData.getAddress(order.addressId),
            user: MockUserData.getUser(order.userId),
            coupon: order.couponCode ? MockCouponData.getCoupon(order.couponCode) : null,
            orderItems: order.orderItems.map(item => ({
                ...item,
                product: MockProductData.getRawProduct(item.productId)
            }))
        }));
    }
}

/**
 * Dashboard Mock Data Class
 */
export class MockDashboardData {
    static adminDashboard = {
        "orders": 6,
        "stores": 2,
        "products": 12,
        "revenue": "959.10",
        "allOrders": [
            { "createdAt": "2025-08-20T08:46:58.239Z", "total": 145.6 },
            { "createdAt": "2025-08-22T08:46:21.818Z", "total": 97.2 },
            { "createdAt": "2025-08-22T08:45:59.587Z", "total": 54.4 },
            { "createdAt": "2025-08-23T09:15:03.929Z", "total": 214.2 },
            { "createdAt": "2025-08-23T09:14:35.923Z", "total": 421.6 },
            { "createdAt": "2025-08-23T11:44:29.713Z", "total": 26.1 },
            { "createdAt": "2025-08-24T09:15:03.929Z", "total": 214.2 },
            { "createdAt": "2025-08-24T09:14:35.923Z", "total": 421.6 },
            { "createdAt": "2025-08-24T11:44:29.713Z", "total": 26.1 },
            { "createdAt": "2025-08-24T11:56:29.713Z", "total": 36.1 },
            { "createdAt": "2025-08-25T11:44:29.713Z", "total": 26.1 },
            { "createdAt": "2025-08-25T09:15:03.929Z", "total": 214.2 },
            { "createdAt": "2025-08-25T09:14:35.923Z", "total": 421.6 },
            { "createdAt": "2025-08-25T11:44:29.713Z", "total": 26.1 },
            { "createdAt": "2025-08-25T11:56:29.713Z", "total": 36.1 },
            { "createdAt": "2025-08-25T11:30:29.713Z", "total": 110.1 }
        ]
    };

    static storeDashboard = {
        "totalOrders": 2,
        "totalEarnings": 636,
        "totalProducts": 5
    };

    static getAdminDashboardData() {
        return this.adminDashboard;
    }

    static getStoreDashboardData() {
        return {
            ...this.storeDashboard,
            ratings: MockRatingData.getAllRatings()
        };
    }
}

/**
 * Miscellaneous Mock Data Class
 */
export class MockMiscData {
    static categories = ["Headphones", "Speakers", "Watch", "Earbuds", "Mouse", "Decoration"];

    static ourSpecs = [
        { title: "Free Shipping", description: "Free delivery on orders over $300. Shop more, save more!", icon: SendIcon, accent: '#05DF72' },
        { title: "24/7 Customer Support", description: "We're here for you. Get expert help with our customer support.", icon: HeadsetIcon, accent: '#A684FF' }
    ];

    static getCategories() {
        return this.categories;
    }

    static getOurSpecs() {
        return this.ourSpecs;
    }
}