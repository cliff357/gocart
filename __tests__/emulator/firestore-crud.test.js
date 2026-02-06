/**
 * Firestore Service CRUD 測試
 * 
 * 使用 Firebase Emulator 測試真實的 Firestore 行為
 * 包含所有 Service 的 CRUD 操作測試
 * 
 * 運行方式：
 *   npm run emulator:test
 */

const {
    initializeTestEnvironment,
    assertSucceeds,
} = require('@firebase/rules-unit-testing');
const { readFileSync } = require('fs');
const path = require('path');

const RULES_PATH = path.join(__dirname, '../../firestore.rules');

let testEnv;

describe('Firestore Service CRUD 測試', () => {
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
    
    /**
     * 獲取 Admin 用戶的 Firestore（可以執行所有操作）
     */
    async function getAdminDb() {
        // 先創建 admin 用戶記錄
        await testEnv.withSecurityRulesDisabled(async (context) => {
            await context.firestore().doc('users/admin-1').set({
                email: 'admin@test.com',
                isAdmin: true,
            });
        });
        return testEnv.authenticatedContext('admin-1', { email: 'admin@test.com' }).firestore();
    }

    /**
     * 用 Admin SDK 直接寫入數據（繞過 rules）
     */
    async function setAdminData(docPath, data) {
        await testEnv.withSecurityRulesDisabled(async (context) => {
            await context.firestore().doc(docPath).set(data);
        });
    }

    /**
     * 用 Admin SDK 直接讀取數據（繞過 rules）
     */
    async function getAdminData(docPath) {
        let result = null;
        await testEnv.withSecurityRulesDisabled(async (context) => {
            const doc = await context.firestore().doc(docPath).get();
            result = doc.exists ? { id: doc.id, ...doc.data() } : null;
        });
        return result;
    }

    // ============================================
    // Products CRUD Tests
    // ============================================
    describe('Products CRUD', () => {
        it('應該能創建商品', async () => {
            const db = await getAdminDb();
            
            const docRef = await assertSucceeds(
                db.collection('products').add({
                    name: '測試商品',
                    price: 100,
                    category: 'test',
                    createdAt: new Date(),
                })
            );

            expect(docRef.id).toBeDefined();
        });

        it('應該能讀取商品', async () => {
            // Arrange
            await setAdminData('products/prod-1', {
                name: '測試商品',
                price: 100,
            });

            // Act - 任何人都可以讀
            const db = testEnv.unauthenticatedContext().firestore();
            const doc = await db.collection('products').doc('prod-1').get();

            // Assert
            expect(doc.exists).toBe(true);
            expect(doc.data().name).toBe('測試商品');
            expect(doc.data().price).toBe(100);
        });

        it('應該能更新商品', async () => {
            // Arrange
            await setAdminData('products/prod-1', {
                name: '原始名稱',
                price: 100,
            });

            // Act
            const db = await getAdminDb();
            await assertSucceeds(
                db.collection('products').doc('prod-1').update({
                    name: '更新名稱',
                    price: 150,
                })
            );

            // Assert
            const updated = await getAdminData('products/prod-1');
            expect(updated.name).toBe('更新名稱');
            expect(updated.price).toBe(150);
        });

        it('應該能刪除商品', async () => {
            // Arrange
            await setAdminData('products/prod-1', { name: '待刪除' });

            // Act
            const db = await getAdminDb();
            await assertSucceeds(
                db.collection('products').doc('prod-1').delete()
            );

            // Assert
            const deleted = await getAdminData('products/prod-1');
            expect(deleted).toBeNull();
        });

        it('應該能按分類查詢商品', async () => {
            // Arrange
            await setAdminData('products/prod-1', { name: '蘋果', category: 'fruit' });
            await setAdminData('products/prod-2', { name: '香蕉', category: 'fruit' });
            await setAdminData('products/prod-3', { name: '牛奶', category: 'dairy' });

            // Act
            const db = testEnv.unauthenticatedContext().firestore();
            const snapshot = await db.collection('products')
                .where('category', '==', 'fruit')
                .get();

            // Assert
            expect(snapshot.size).toBe(2);
            const names = snapshot.docs.map(d => d.data().name);
            expect(names).toContain('蘋果');
            expect(names).toContain('香蕉');
        });

        it('應該能限制查詢結果數量', async () => {
            // Arrange
            await setAdminData('products/prod-1', { name: '商品1' });
            await setAdminData('products/prod-2', { name: '商品2' });
            await setAdminData('products/prod-3', { name: '商品3' });

            // Act
            const db = testEnv.unauthenticatedContext().firestore();
            const snapshot = await db.collection('products').limit(2).get();

            // Assert
            expect(snapshot.size).toBe(2);
        });
    });

    // ============================================
    // Users CRUD Tests
    // ============================================
    describe('Users CRUD', () => {
        it('應該能讀取用戶', async () => {
            await setAdminData('users/user-1', {
                email: 'test@example.com',
                displayName: '測試用戶',
            });

            const db = testEnv.unauthenticatedContext().firestore();
            const doc = await db.collection('users').doc('user-1').get();

            expect(doc.exists).toBe(true);
            expect(doc.data().email).toBe('test@example.com');
        });

        it('應該能按 email 查詢用戶', async () => {
            await setAdminData('users/user-1', { email: 'find@example.com' });
            await setAdminData('users/user-2', { email: 'other@example.com' });

            const db = testEnv.unauthenticatedContext().firestore();
            const snapshot = await db.collection('users')
                .where('email', '==', 'find@example.com')
                .get();

            expect(snapshot.size).toBe(1);
            expect(snapshot.docs[0].data().email).toBe('find@example.com');
        });

        it('應該能查詢 Admin 用戶', async () => {
            await setAdminData('users/admin-1', { email: 'admin@example.com', isAdmin: true });
            await setAdminData('users/user-1', { email: 'user@example.com', isAdmin: false });

            const db = testEnv.unauthenticatedContext().firestore();
            const snapshot = await db.collection('users')
                .where('isAdmin', '==', true)
                .get();

            expect(snapshot.size).toBe(1);
            expect(snapshot.docs[0].data().email).toBe('admin@example.com');
        });
    });

    // ============================================
    // Orders CRUD Tests
    // ============================================
    describe('Orders CRUD', () => {
        it('應該能創建訂單', async () => {
            const db = await getAdminDb();
            
            const docRef = await assertSucceeds(
                db.collection('orders').add({
                    userId: 'user-1',
                    items: [
                        { productId: 'prod-1', name: '蘋果', quantity: 2, price: 30 },
                    ],
                    total: 60,
                    status: 'pending',
                    createdAt: new Date(),
                })
            );

            expect(docRef.id).toBeDefined();
        });

        it('訂單應該有正確的結構', async () => {
            await setAdminData('orders/order-1', {
                userId: 'user-1',
                storeId: 'store-1',
                items: [
                    { productId: 'prod-1', name: '蘋果', quantity: 2, price: 30 },
                    { productId: 'prod-2', name: '香蕉', quantity: 3, price: 20 },
                ],
                subtotal: 120,
                discount: 10,
                total: 110,
                status: 'pending',
                paymentMethod: 'cash',
            });

            const order = await getAdminData('orders/order-1');

            expect(order).toHaveProperty('userId');
            expect(order).toHaveProperty('items');
            expect(order.items).toBeInstanceOf(Array);
            expect(order.items.length).toBe(2);
            expect(order.items[0]).toHaveProperty('productId');
            expect(order.items[0]).toHaveProperty('quantity');
            expect(order).toHaveProperty('total');
            expect(order).toHaveProperty('status');
        });

        it('應該能按狀態查詢訂單', async () => {
            await setAdminData('orders/order-1', { status: 'pending', total: 100 });
            await setAdminData('orders/order-2', { status: 'completed', total: 200 });
            await setAdminData('orders/order-3', { status: 'pending', total: 150 });

            const db = testEnv.unauthenticatedContext().firestore();
            const snapshot = await db.collection('orders')
                .where('status', '==', 'pending')
                .get();

            expect(snapshot.size).toBe(2);
        });
    });

    // ============================================
    // Reservations CRUD Tests
    // ============================================
    describe('Reservations CRUD', () => {
        it('應該能創建預訂（訪客）', async () => {
            const db = testEnv.unauthenticatedContext().firestore();
            
            const docRef = await assertSucceeds(
                db.collection('reservations').add({
                    name: '訪客名稱',
                    phone: '12345678',
                    date: '2026-02-10',
                    time: '14:00',
                    guests: 4,
                    createdAt: new Date(),
                })
            );

            expect(docRef.id).toBeDefined();
        });

        it('應該能讀取預訂', async () => {
            await setAdminData('reservations/res-1', {
                name: '測試預訂',
                phone: '12345678',
            });

            const db = testEnv.unauthenticatedContext().firestore();
            const doc = await db.collection('reservations').doc('res-1').get();

            expect(doc.exists).toBe(true);
            expect(doc.data().name).toBe('測試預訂');
        });

        it('Admin 應該能更新預訂狀態', async () => {
            await setAdminData('reservations/res-1', {
                name: '測試預訂',
                status: 'pending',
            });

            const db = await getAdminDb();
            await assertSucceeds(
                db.collection('reservations').doc('res-1').update({
                    status: 'confirmed',
                })
            );

            const updated = await getAdminData('reservations/res-1');
            expect(updated.status).toBe('confirmed');
        });
    });

    // ============================================
    // Coupons CRUD Tests
    // ============================================
    describe('Coupons CRUD', () => {
        it('應該能創建優惠券', async () => {
            const db = await getAdminDb();
            
            await assertSucceeds(
                db.collection('coupons').doc('SAVE10').set({
                    code: 'SAVE10',
                    discount: 10,
                    discountType: 'percentage',
                    isPublic: true,
                    expiresAt: new Date('2026-12-31'),
                })
            );

            const coupon = await getAdminData('coupons/SAVE10');
            expect(coupon.discount).toBe(10);
        });

        it('應該能查詢公開優惠券', async () => {
            await setAdminData('coupons/PUBLIC1', { code: 'PUBLIC1', isPublic: true });
            await setAdminData('coupons/PRIVATE1', { code: 'PRIVATE1', isPublic: false });

            const db = testEnv.unauthenticatedContext().firestore();
            const snapshot = await db.collection('coupons')
                .where('isPublic', '==', true)
                .get();

            expect(snapshot.size).toBe(1);
            expect(snapshot.docs[0].data().code).toBe('PUBLIC1');
        });
    });

    // ============================================
    // Categories CRUD Tests
    // ============================================
    describe('Categories CRUD', () => {
        it('應該能創建分類', async () => {
            const db = await getAdminDb();
            
            await assertSucceeds(
                db.collection('categories').doc('cat-1').set({
                    name: '水果',
                    parentId: null,
                    order: 1,
                })
            );

            const category = await getAdminData('categories/cat-1');
            expect(category.name).toBe('水果');
        });

        it('應該能查詢根分類', async () => {
            await setAdminData('categories/cat-1', { name: '水果', parentId: null });
            await setAdminData('categories/cat-2', { name: '蔬菜', parentId: null });
            await setAdminData('categories/cat-3', { name: '蘋果', parentId: 'cat-1' });

            const db = testEnv.unauthenticatedContext().firestore();
            const snapshot = await db.collection('categories')
                .where('parentId', '==', null)
                .get();

            expect(snapshot.size).toBe(2);
        });

        it('應該能查詢子分類', async () => {
            await setAdminData('categories/cat-1', { name: '水果', parentId: null });
            await setAdminData('categories/cat-2', { name: '蘋果', parentId: 'cat-1' });
            await setAdminData('categories/cat-3', { name: '香蕉', parentId: 'cat-1' });

            const db = testEnv.unauthenticatedContext().firestore();
            const snapshot = await db.collection('categories')
                .where('parentId', '==', 'cat-1')
                .get();

            expect(snapshot.size).toBe(2);
        });
    });

    // ============================================
    // Ratings CRUD Tests
    // ============================================
    describe('Ratings CRUD', () => {
        it('應該能創建評分', async () => {
            const db = await getAdminDb();
            
            await assertSucceeds(
                db.collection('ratings').add({
                    productId: 'prod-1',
                    userId: 'user-1',
                    rating: 5,
                    comment: '很好！',
                    createdAt: new Date(),
                })
            );
        });

        it('應該能按商品查詢評分', async () => {
            await setAdminData('ratings/rate-1', { productId: 'prod-1', rating: 5 });
            await setAdminData('ratings/rate-2', { productId: 'prod-1', rating: 4 });
            await setAdminData('ratings/rate-3', { productId: 'prod-2', rating: 3 });

            const db = testEnv.unauthenticatedContext().firestore();
            const snapshot = await db.collection('ratings')
                .where('productId', '==', 'prod-1')
                .get();

            expect(snapshot.size).toBe(2);
        });

        it('應該能計算平均評分', async () => {
            await setAdminData('ratings/rate-1', { productId: 'prod-1', rating: 5 });
            await setAdminData('ratings/rate-2', { productId: 'prod-1', rating: 4 });
            await setAdminData('ratings/rate-3', { productId: 'prod-1', rating: 3 });

            const db = testEnv.unauthenticatedContext().firestore();
            const snapshot = await db.collection('ratings')
                .where('productId', '==', 'prod-1')
                .get();

            const ratings = snapshot.docs.map(d => d.data().rating);
            const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;

            expect(average).toBe(4);
        });
    });

    // ============================================
    // Addresses CRUD Tests
    // ============================================
    describe('Addresses CRUD', () => {
        it('應該能創建地址', async () => {
            const db = await getAdminDb();
            
            await assertSucceeds(
                db.collection('addresses').add({
                    userId: 'user-1',
                    name: '家',
                    address: '香港九龍某街1號',
                    isDefault: true,
                })
            );
        });

        it('應該能按用戶查詢地址', async () => {
            await setAdminData('addresses/addr-1', { userId: 'user-1', name: '家' });
            await setAdminData('addresses/addr-2', { userId: 'user-1', name: '公司' });
            await setAdminData('addresses/addr-3', { userId: 'user-2', name: '家' });

            const db = testEnv.unauthenticatedContext().firestore();
            const snapshot = await db.collection('addresses')
                .where('userId', '==', 'user-1')
                .get();

            expect(snapshot.size).toBe(2);
        });
    });
});
