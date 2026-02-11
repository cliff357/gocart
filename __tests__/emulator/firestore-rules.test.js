/**
 * Firestore Security Rules 測試
 * 
 * 使用 @firebase/rules-unit-testing 測試真實的 Security Rules
 * 匹配 dev 分支的 firestore.rules
 * 
 * 運行方式：
 *   npm run test:emulator
 */

const {
    initializeTestEnvironment,
    assertSucceeds,
    assertFails,
} = require('@firebase/rules-unit-testing');
const { readFileSync } = require('fs');
const path = require('path');

const RULES_PATH = path.join(__dirname, '../../firestore.rules');

let testEnv;

describe('Firestore Security Rules 測試', () => {
    beforeAll(async () => {
        testEnv = await initializeTestEnvironment({
            projectId: 'demo-gocart-test',
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
    
    function getUnauthenticatedDb() {
        return testEnv.unauthenticatedContext().firestore();
    }

    function getAuthenticatedDb(uid, email = 'test@example.com') {
        return testEnv.authenticatedContext(uid, { email }).firestore();
    }

    async function setAdminData(docPath, data) {
        await testEnv.withSecurityRulesDisabled(async (context) => {
            await context.firestore().doc(docPath).set(data);
        });
    }

    // ============================================
    // Users Collection Tests
    // 新 Rules: 
    // - create: 自己的 profile，需要 email, username, createdAt
    // - read: 自己或 admin
    // - update: 自己（不能改 email）
    // - delete: 只有 admin
    // ============================================
    describe('Users Collection', () => {
        it('用戶可以創建自己的 profile', async () => {
            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertSucceeds(
                db.collection('users').doc('user-1').set({
                    email: 'user@example.com',
                    username: 'testuser',
                    createdAt: new Date(),
                })
            );
        });

        it('用戶不能創建其他人的 profile', async () => {
            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertFails(
                db.collection('users').doc('user-2').set({
                    email: 'other@example.com',
                    username: 'other',
                    createdAt: new Date(),
                })
            );
        });

        it('用戶可以讀取自己的 profile', async () => {
            await setAdminData('users/user-1', {
                email: 'user@example.com',
                username: 'testuser',
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertSucceeds(db.collection('users').doc('user-1').get());
        });

        it('用戶不能讀取其他人的 profile', async () => {
            await setAdminData('users/user-2', {
                email: 'other@example.com',
                username: 'other',
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertFails(db.collection('users').doc('user-2').get());
        });

        it('Admin 可以讀取任何用戶', async () => {
            await setAdminData('users/admin-1', {
                email: 'admin@example.com',
                role: 'admin',
            });
            await setAdminData('users/user-1', {
                email: 'user@example.com',
                username: 'testuser',
            });

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
            await assertSucceeds(db.collection('users').doc('user-1').get());
        });

        it('用戶可以更新自己的 profile（不改 email）', async () => {
            await setAdminData('users/user-1', {
                email: 'user@example.com',
                username: 'oldname',
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertSucceeds(
                db.collection('users').doc('user-1').update({
                    username: 'newname',
                    email: 'user@example.com', // 保持不變
                })
            );
        });

        it('用戶不能更新其他人的 profile', async () => {
            await setAdminData('users/user-2', {
                email: 'other@example.com',
                username: 'other',
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertFails(
                db.collection('users').doc('user-2').update({
                    username: 'hacked',
                    email: 'other@example.com',
                })
            );
        });

        it('只有 Admin 可以刪除用戶', async () => {
            await setAdminData('users/admin-1', {
                email: 'admin@example.com',
                role: 'admin',
            });
            await setAdminData('users/user-1', {
                email: 'user@example.com',
            });

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
            await assertSucceeds(db.collection('users').doc('user-1').delete());
        });

        it('普通用戶不能刪除其他用戶', async () => {
            await setAdminData('users/user-1', { email: 'user1@example.com' });
            await setAdminData('users/user-2', { email: 'user2@example.com' });

            const db = getAuthenticatedDb('user-1', 'user1@example.com');
            await assertFails(db.collection('users').doc('user-2').delete());
        });
    });

    // ============================================
    // Products Collection Tests
    // 新 Rules:
    // - read: 任何人
    // - create: 自己的商品，需要 name, price, storeId, userId, createdAt
    // - update/delete: 商品擁有者或 admin
    // ============================================
    describe('Products Collection', () => {
        beforeEach(async () => {
            // 創建測試 store
            await setAdminData('stores/store-1', {
                name: '測試商店',
                userId: 'user-1',
                approved: true,
            });
        });

        it('任何人都可以讀取商品', async () => {
            await setAdminData('products/prod-1', {
                name: '測試商品',
                price: 100,
                storeId: 'store-1',
                userId: 'user-1',
            });

            const db = getUnauthenticatedDb();
            await assertSucceeds(db.collection('products').doc('prod-1').get());
        });

        it('商店擁有者可以創建商品', async () => {
            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertSucceeds(
                db.collection('products').add({
                    name: '新商品',
                    price: 50,
                    storeId: 'store-1',
                    userId: 'user-1',
                    createdAt: new Date(),
                })
            );
        });

        it('不能為其他人的商店創建商品', async () => {
            const db = getAuthenticatedDb('user-2', 'user2@example.com');
            await assertFails(
                db.collection('products').add({
                    name: '新商品',
                    price: 50,
                    storeId: 'store-1',
                    userId: 'user-2', // 不是 store 擁有者
                    createdAt: new Date(),
                })
            );
        });

        it('商品擁有者可以更新商品', async () => {
            await setAdminData('products/prod-1', {
                name: '原始商品',
                price: 100,
                storeId: 'store-1',
                userId: 'user-1',
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertSucceeds(
                db.collection('products').doc('prod-1').update({
                    price: 120,
                })
            );
        });

        it('其他用戶不能更新商品', async () => {
            await setAdminData('products/prod-1', {
                name: '原始商品',
                price: 100,
                storeId: 'store-1',
                userId: 'user-1',
            });

            const db = getAuthenticatedDb('user-2', 'user2@example.com');
            await assertFails(
                db.collection('products').doc('prod-1').update({
                    price: 999,
                })
            );
        });

        it('商品擁有者可以刪除商品', async () => {
            await setAdminData('products/prod-1', {
                name: '待刪除',
                userId: 'user-1',
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertSucceeds(db.collection('products').doc('prod-1').delete());
        });

        it('Admin 可以刪除任何商品', async () => {
            await setAdminData('users/admin-1', {
                email: 'admin@example.com',
                role: 'admin',
            });
            await setAdminData('products/prod-1', {
                name: '待刪除',
                userId: 'user-1',
            });

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
            await assertSucceeds(db.collection('products').doc('prod-1').delete());
        });
    });

    // ============================================
    // Orders Collection Tests
    // 新 Rules:
    // - read: 訂單擁有者, 商店擁有者, 或 admin
    // - create: 自己的訂單，需要 userId, items, total, status, createdAt
    // - update: 訂單擁有者（限 pending/cancelled），商店擁有者（更多狀態），admin
    // - delete: 只有 admin
    // ============================================
    describe('Orders Collection', () => {
        it('用戶可以創建自己的訂單', async () => {
            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertSucceeds(
                db.collection('orders').add({
                    userId: 'user-1',
                    items: [{ productId: 'prod-1', quantity: 1 }],
                    total: 100,
                    status: 'pending',
                    createdAt: new Date(),
                })
            );
        });

        it('不能創建其他人的訂單', async () => {
            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertFails(
                db.collection('orders').add({
                    userId: 'user-2', // 不是自己
                    items: [{ productId: 'prod-1', quantity: 1 }],
                    total: 100,
                    status: 'pending',
                    createdAt: new Date(),
                })
            );
        });

        it('用戶可以讀取自己的訂單', async () => {
            await setAdminData('orders/order-1', {
                userId: 'user-1',
                total: 100,
                status: 'pending',
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertSucceeds(db.collection('orders').doc('order-1').get());
        });

        it('用戶不能讀取其他人的訂單', async () => {
            await setAdminData('orders/order-1', {
                userId: 'user-2',
                total: 100,
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertFails(db.collection('orders').doc('order-1').get());
        });

        it('只有 Admin 可以刪除訂單', async () => {
            await setAdminData('users/admin-1', {
                email: 'admin@example.com',
                role: 'admin',
            });
            await setAdminData('orders/order-1', {
                userId: 'user-1',
                total: 100,
            });

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
            await assertSucceeds(db.collection('orders').doc('order-1').delete());
        });
    });

    // ============================================
    // Ratings Collection Tests
    // 新 Rules:
    // - read: 任何人
    // - create: 自己的評分，需要 productId, userId, rating, createdAt
    // - update: 自己的評分
    // - delete: 自己或 admin
    // ============================================
    describe('Ratings Collection', () => {
        beforeEach(async () => {
            await setAdminData('products/prod-1', {
                name: '測試商品',
                price: 100,
            });
        });

        it('任何人都可以讀取評分', async () => {
            await setAdminData('ratings/rating-1', {
                productId: 'prod-1',
                userId: 'user-1',
                rating: 5,
            });

            const db = getUnauthenticatedDb();
            await assertSucceeds(db.collection('ratings').doc('rating-1').get());
        });

        it('用戶可以創建自己的評分', async () => {
            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertSucceeds(
                db.collection('ratings').add({
                    productId: 'prod-1',
                    userId: 'user-1',
                    rating: 5,
                    createdAt: new Date(),
                })
            );
        });

        it('評分必須在 1-5 之間', async () => {
            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertFails(
                db.collection('ratings').add({
                    productId: 'prod-1',
                    userId: 'user-1',
                    rating: 6, // 超出範圍
                    createdAt: new Date(),
                })
            );
        });

        it('用戶可以刪除自己的評分', async () => {
            await setAdminData('ratings/rating-1', {
                productId: 'prod-1',
                userId: 'user-1',
                rating: 5,
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertSucceeds(db.collection('ratings').doc('rating-1').delete());
        });
    });

    // ============================================
    // Carts Collection Tests
    // 新 Rules: 用戶只能訪問自己的購物車
    // ============================================
    describe('Carts Collection', () => {
        it('用戶可以讀寫自己的購物車', async () => {
            const db = getAuthenticatedDb('user-1', 'user@example.com');
            
            await assertSucceeds(
                db.collection('carts').doc('user-1').set({
                    items: [{ productId: 'prod-1', quantity: 2 }],
                })
            );

            await assertSucceeds(db.collection('carts').doc('user-1').get());
        });

        it('用戶不能訪問其他人的購物車', async () => {
            await setAdminData('carts/user-2', {
                items: [{ productId: 'prod-1', quantity: 2 }],
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertFails(db.collection('carts').doc('user-2').get());
        });
    });

    // ============================================
    // Addresses Collection Tests
    // 新 Rules: 用戶只能訪問自己的地址
    // ============================================
    describe('Addresses Collection', () => {
        it('用戶可以創建自己的地址', async () => {
            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertSucceeds(
                db.collection('addresses').add({
                    userId: 'user-1',
                    street: '123 Test St',
                    city: 'Test City',
                    country: 'Test Country',
                })
            );
        });

        it('用戶可以讀取自己的地址', async () => {
            await setAdminData('addresses/addr-1', {
                userId: 'user-1',
                street: '123 Test St',
                city: 'Test City',
                country: 'Test Country',
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertSucceeds(db.collection('addresses').doc('addr-1').get());
        });

        it('用戶不能讀取其他人的地址', async () => {
            await setAdminData('addresses/addr-1', {
                userId: 'user-2',
                street: '456 Other St',
                city: 'Other City',
                country: 'Other Country',
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertFails(db.collection('addresses').doc('addr-1').get());
        });
    });

    // ============================================
    // Admin Collection Tests
    // 新 Rules: 只有 admin 可以訪問
    // ============================================
    describe('Admin Collection', () => {
        it('Admin 可以讀寫 admin collection', async () => {
            await setAdminData('users/admin-1', {
                email: 'admin@example.com',
                role: 'admin',
            });

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
            await assertSucceeds(
                db.collection('admin').doc('settings').set({
                    siteName: 'GoCart',
                })
            );
        });

        it('普通用戶不能訪問 admin collection', async () => {
            await setAdminData('users/user-1', {
                email: 'user@example.com',
                role: 'user',
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertFails(
                db.collection('admin').doc('settings').get()
            );
        });
    });

    // ============================================
    // Default Deny Tests
    // ============================================
    describe('Default Deny', () => {
        it('未定義的 collection 應該被拒絕', async () => {
            const db = getUnauthenticatedDb();
            await assertFails(
                db.collection('unknown_collection').doc('doc-1').get()
            );
        });
    });
});
