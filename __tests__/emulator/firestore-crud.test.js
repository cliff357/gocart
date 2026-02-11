/**
 * Firestore CRUD 操作測試
 * 
 * 測試 Firestore 的基本 CRUD 操作
 * 使用 withSecurityRulesDisabled 繞過 rules 測試純粹的數據操作
 * 
 * 運行方式：
 *   npm run test:emulator
 */

const {
    initializeTestEnvironment,
} = require('@firebase/rules-unit-testing');
const { readFileSync } = require('fs');
const path = require('path');

const RULES_PATH = path.join(__dirname, '../../firestore.rules');

let testEnv;

describe('Firestore CRUD 操作測試', () => {
    beforeAll(async () => {
        testEnv = await initializeTestEnvironment({
            projectId: 'demo-gocart-crud',
            firestore: {
                rules: readFileSync(RULES_PATH, 'utf8'),
                host: 'localhost',
                port: 8080,
            },
        });
    });

    afterAll(async () => {
        if (testEnv) {
            await testEnv.cleanup();
        }
    });

    beforeEach(async () => {
        await testEnv.clearFirestore();
    });

    // ============================================
    // Helper Functions
    // ============================================
    
    async function adminDb() {
        return new Promise((resolve) => {
            testEnv.withSecurityRulesDisabled(async (context) => {
                resolve(context.firestore());
            });
        });
    }

    async function setData(docPath, data) {
        await testEnv.withSecurityRulesDisabled(async (context) => {
            await context.firestore().doc(docPath).set(data);
        });
    }

    async function getData(docPath) {
        let result = null;
        await testEnv.withSecurityRulesDisabled(async (context) => {
            const doc = await context.firestore().doc(docPath).get();
            result = doc.exists ? { id: doc.id, ...doc.data() } : null;
        });
        return result;
    }

    async function queryData(collectionPath, field, operator, value) {
        let results = [];
        await testEnv.withSecurityRulesDisabled(async (context) => {
            const snapshot = await context.firestore()
                .collection(collectionPath)
                .where(field, operator, value)
                .get();
            results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        });
        return results;
    }

    // ============================================
    // Users CRUD
    // ============================================
    describe('Users CRUD', () => {
        it('可以創建用戶', async () => {
            await setData('users/user-1', {
                email: 'test@example.com',
                username: 'testuser',
                role: 'user',
                createdAt: new Date(),
            });

            const user = await getData('users/user-1');
            expect(user).not.toBeNull();
            expect(user.email).toBe('test@example.com');
            expect(user.username).toBe('testuser');
        });

        it('可以查詢用戶', async () => {
            await setData('users/user-1', { email: 'user1@example.com', role: 'user' });
            await setData('users/user-2', { email: 'user2@example.com', role: 'admin' });

            const admins = await queryData('users', 'role', '==', 'admin');
            expect(admins.length).toBe(1);
            expect(admins[0].email).toBe('user2@example.com');
        });

        it('可以更新用戶', async () => {
            await setData('users/user-1', { username: 'oldname' });

            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().doc('users/user-1').update({
                    username: 'newname',
                });
            });

            const user = await getData('users/user-1');
            expect(user.username).toBe('newname');
        });

        it('可以刪除用戶', async () => {
            await setData('users/user-1', { email: 'delete@example.com' });

            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().doc('users/user-1').delete();
            });

            const user = await getData('users/user-1');
            expect(user).toBeNull();
        });
    });

    // ============================================
    // Stores CRUD
    // ============================================
    describe('Stores CRUD', () => {
        it('可以創建商店', async () => {
            await setData('stores/store-1', {
                name: '測試商店',
                userId: 'user-1',
                approved: false,
                createdAt: new Date(),
            });

            const store = await getData('stores/store-1');
            expect(store).not.toBeNull();
            expect(store.name).toBe('測試商店');
            expect(store.approved).toBe(false);
        });

        it('可以查詢已批准的商店', async () => {
            await setData('stores/store-1', { name: 'Store 1', approved: true });
            await setData('stores/store-2', { name: 'Store 2', approved: false });
            await setData('stores/store-3', { name: 'Store 3', approved: true });

            const approved = await queryData('stores', 'approved', '==', true);
            expect(approved.length).toBe(2);
        });
    });

    // ============================================
    // Products CRUD
    // ============================================
    describe('Products CRUD', () => {
        it('可以創建商品', async () => {
            await setData('products/prod-1', {
                name: '測試商品',
                price: 100,
                storeId: 'store-1',
                userId: 'user-1',
                createdAt: new Date(),
            });

            const product = await getData('products/prod-1');
            expect(product).not.toBeNull();
            expect(product.name).toBe('測試商品');
            expect(product.price).toBe(100);
        });

        it('可以按商店查詢商品', async () => {
            await setData('products/prod-1', { name: 'Product 1', storeId: 'store-1' });
            await setData('products/prod-2', { name: 'Product 2', storeId: 'store-1' });
            await setData('products/prod-3', { name: 'Product 3', storeId: 'store-2' });

            const products = await queryData('products', 'storeId', '==', 'store-1');
            expect(products.length).toBe(2);
        });

        it('可以更新商品價格', async () => {
            await setData('products/prod-1', { name: 'Product', price: 100 });

            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().doc('products/prod-1').update({
                    price: 150,
                });
            });

            const product = await getData('products/prod-1');
            expect(product.price).toBe(150);
        });
    });

    // ============================================
    // Orders CRUD
    // ============================================
    describe('Orders CRUD', () => {
        it('可以創建訂單', async () => {
            await setData('orders/order-1', {
                userId: 'user-1',
                items: [
                    { productId: 'prod-1', name: 'Product 1', quantity: 2, price: 50 },
                ],
                total: 100,
                status: 'pending',
                createdAt: new Date(),
            });

            const order = await getData('orders/order-1');
            expect(order).not.toBeNull();
            expect(order.items.length).toBe(1);
            expect(order.total).toBe(100);
            expect(order.status).toBe('pending');
        });

        it('可以按狀態查詢訂單', async () => {
            await setData('orders/order-1', { status: 'pending', total: 100 });
            await setData('orders/order-2', { status: 'shipped', total: 200 });
            await setData('orders/order-3', { status: 'pending', total: 150 });

            const pending = await queryData('orders', 'status', '==', 'pending');
            expect(pending.length).toBe(2);
        });

        it('可以更新訂單狀態', async () => {
            await setData('orders/order-1', { status: 'pending' });

            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().doc('orders/order-1').update({
                    status: 'shipped',
                });
            });

            const order = await getData('orders/order-1');
            expect(order.status).toBe('shipped');
        });
    });

    // ============================================
    // Ratings CRUD
    // ============================================
    describe('Ratings CRUD', () => {
        it('可以創建評分', async () => {
            await setData('ratings/rating-1', {
                productId: 'prod-1',
                userId: 'user-1',
                rating: 5,
                comment: '很好！',
                createdAt: new Date(),
            });

            const rating = await getData('ratings/rating-1');
            expect(rating).not.toBeNull();
            expect(rating.rating).toBe(5);
        });

        it('可以按商品查詢評分', async () => {
            await setData('ratings/r1', { productId: 'prod-1', rating: 5 });
            await setData('ratings/r2', { productId: 'prod-1', rating: 4 });
            await setData('ratings/r3', { productId: 'prod-2', rating: 3 });

            const ratings = await queryData('ratings', 'productId', '==', 'prod-1');
            expect(ratings.length).toBe(2);
        });

        it('可以計算平均評分', async () => {
            await setData('ratings/r1', { productId: 'prod-1', rating: 5 });
            await setData('ratings/r2', { productId: 'prod-1', rating: 4 });
            await setData('ratings/r3', { productId: 'prod-1', rating: 3 });

            const ratings = await queryData('ratings', 'productId', '==', 'prod-1');
            const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
            expect(avg).toBe(4);
        });
    });

    // ============================================
    // Coupons CRUD
    // ============================================
    describe('Coupons CRUD', () => {
        it('可以創建優惠券', async () => {
            await setData('coupons/coupon-1', {
                code: 'SAVE10',
                discount: 10,
                storeId: 'store-1',
                active: true,
                expiresAt: new Date('2026-12-31'),
            });

            const coupon = await getData('coupons/coupon-1');
            expect(coupon).not.toBeNull();
            expect(coupon.code).toBe('SAVE10');
            expect(coupon.discount).toBe(10);
        });

        it('可以查詢有效優惠券', async () => {
            await setData('coupons/c1', { code: 'ACTIVE1', active: true });
            await setData('coupons/c2', { code: 'INACTIVE', active: false });
            await setData('coupons/c3', { code: 'ACTIVE2', active: true });

            const active = await queryData('coupons', 'active', '==', true);
            expect(active.length).toBe(2);
        });
    });

    // ============================================
    // Carts CRUD
    // ============================================
    describe('Carts CRUD', () => {
        it('可以創建購物車', async () => {
            await setData('carts/user-1', {
                items: [
                    { productId: 'prod-1', quantity: 2 },
                    { productId: 'prod-2', quantity: 1 },
                ],
            });

            const cart = await getData('carts/user-1');
            expect(cart).not.toBeNull();
            expect(cart.items.length).toBe(2);
        });

        it('可以更新購物車', async () => {
            await setData('carts/user-1', { items: [{ productId: 'prod-1', quantity: 1 }] });

            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().doc('carts/user-1').update({
                    items: [
                        { productId: 'prod-1', quantity: 3 },
                        { productId: 'prod-2', quantity: 2 },
                    ],
                });
            });

            const cart = await getData('carts/user-1');
            expect(cart.items.length).toBe(2);
            expect(cart.items[0].quantity).toBe(3);
        });
    });

    // ============================================
    // Addresses CRUD
    // ============================================
    describe('Addresses CRUD', () => {
        it('可以創建地址', async () => {
            await setData('addresses/addr-1', {
                userId: 'user-1',
                street: '123 Main St',
                city: 'Test City',
                country: 'Test Country',
                isDefault: true,
            });

            const addr = await getData('addresses/addr-1');
            expect(addr).not.toBeNull();
            expect(addr.street).toBe('123 Main St');
            expect(addr.isDefault).toBe(true);
        });

        it('可以按用戶查詢地址', async () => {
            await setData('addresses/a1', { userId: 'user-1', street: 'Addr 1' });
            await setData('addresses/a2', { userId: 'user-1', street: 'Addr 2' });
            await setData('addresses/a3', { userId: 'user-2', street: 'Addr 3' });

            const addrs = await queryData('addresses', 'userId', '==', 'user-1');
            expect(addrs.length).toBe(2);
        });
    });
});
