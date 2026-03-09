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
});
