/**
 * Firestore Security Rules 測試
 * 
 * 使用 @firebase/rules-unit-testing 測試真實的 Security Rules
 * 不放鬆任何 rules，而是模擬不同用戶角色來驗證 rules 是否正確
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

// 讀取真實的 firestore.rules
const RULES_PATH = path.join(__dirname, '../../firestore.rules');

let testEnv;

describe('Firestore Security Rules 測試', () => {
    beforeAll(async () => {
        // 初始化測試環境，載入真實的 rules
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
        // 每個測試前清除數據
        await testEnv.clearFirestore();
    });

    // ============================================
    // Helper Functions
    // ============================================
    
    /**
     * 創建未認證用戶的 Firestore 實例
     */
    function getUnauthenticatedDb() {
        return testEnv.unauthenticatedContext().firestore();
    }

    /**
     * 創建已認證用戶的 Firestore 實例
     */
    function getAuthenticatedDb(uid, email = 'test@example.com') {
        return testEnv.authenticatedContext(uid, { email }).firestore();
    }

    /**
     * 用 Admin SDK 直接寫入數據（繞過 rules）
     * 用於設置測試數據
     */
    async function setAdminData(path, data) {
        await testEnv.withSecurityRulesDisabled(async (context) => {
            const db = context.firestore();
            await db.doc(path).set(data);
        });
    }

    // ============================================
    // Products Collection Tests
    // ============================================
    describe('Products Collection', () => {
        it('任何人都可以讀取商品', async () => {
            // Arrange - 用 admin 創建商品
            await setAdminData('products/prod-1', {
                name: '測試商品',
                price: 100,
            });

            // Act & Assert - 未認證用戶可以讀取
            const db = getUnauthenticatedDb();
            await assertSucceeds(db.collection('products').doc('prod-1').get());
        });

        it('未認證用戶不能創建商品', async () => {
            const db = getUnauthenticatedDb();
            await assertFails(
                db.collection('products').add({
                    name: '新商品',
                    price: 50,
                })
            );
        });

        it('普通用戶不能創建商品', async () => {
            // Arrange - 創建普通用戶（非 admin）
            await setAdminData('users/user-1', {
                email: 'user@example.com',
                isAdmin: false,
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertFails(
                db.collection('products').add({
                    name: '新商品',
                    price: 50,
                })
            );
        });

        it('Admin 可以創建商品', async () => {
            // Arrange - 創建 admin 用戶
            await setAdminData('users/admin-1', {
                email: 'admin@example.com',
                isAdmin: true,
            });

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
            await assertSucceeds(
                db.collection('products').add({
                    name: '新商品',
                    price: 50,
                })
            );
        });

        it('Admin 可以更新商品', async () => {
            // Arrange
            await setAdminData('users/admin-1', {
                email: 'admin@example.com',
                isAdmin: true,
            });
            await setAdminData('products/prod-1', {
                name: '原始商品',
                price: 100,
            });

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
            await assertSucceeds(
                db.collection('products').doc('prod-1').update({
                    price: 120,
                })
            );
        });

        it('Admin 可以刪除商品', async () => {
            // Arrange
            await setAdminData('users/admin-1', {
                email: 'admin@example.com',
                isAdmin: true,
            });
            await setAdminData('products/prod-1', {
                name: '待刪除商品',
            });

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
            await assertSucceeds(
                db.collection('products').doc('prod-1').delete()
            );
        });
    });

    // ============================================
    // Users Collection Tests
    // ============================================
    describe('Users Collection', () => {
        it('任何人都可以讀取用戶資料', async () => {
            await setAdminData('users/user-1', {
                email: 'user@example.com',
                displayName: '測試用戶',
            });

            const db = getUnauthenticatedDb();
            await assertSucceeds(db.collection('users').doc('user-1').get());
        });

        it('未認證用戶不能創建用戶', async () => {
            const db = getUnauthenticatedDb();
            await assertFails(
                db.collection('users').doc('new-user').set({
                    email: 'new@example.com',
                })
            );
        });

        it('用戶可以更新自己的資料', async () => {
            // Arrange - 創建用戶和 admin 邀請（如果 rules 需要）
            await setAdminData('users/user-1', {
                email: 'user@example.com',
                displayName: '原始名稱',
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertSucceeds(
                db.collection('users').doc('user-1').update({
                    displayName: '新名稱',
                })
            );
        });

        it('用戶不能更新其他人的資料', async () => {
            await setAdminData('users/user-1', {
                email: 'user1@example.com',
            });
            await setAdminData('users/user-2', {
                email: 'user2@example.com',
            });

            const db = getAuthenticatedDb('user-1', 'user1@example.com');
            await assertFails(
                db.collection('users').doc('user-2').update({
                    displayName: '惡意修改',
                })
            );
        });

        it('Admin 可以更新任何用戶', async () => {
            await setAdminData('users/admin-1', {
                email: 'admin@example.com',
                isAdmin: true,
            });
            await setAdminData('users/user-1', {
                email: 'user@example.com',
            });

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
            await assertSucceeds(
                db.collection('users').doc('user-1').update({
                    displayName: 'Admin 修改',
                })
            );
        });
    });

    // ============================================
    // Orders Collection Tests  
    // 根據 firestore.rules：沒有專門規則，使用通用規則
    // 只有 Admin 可以寫入
    // ============================================
    describe('Orders Collection', () => {
        it('只有 Admin 可以創建訂單', async () => {
            await setAdminData('users/admin-1', {
                email: 'admin@example.com',
                isAdmin: true,
            });

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
            await assertSucceeds(
                db.collection('orders').add({
                    userId: 'user-1',
                    items: [{ productId: 'prod-1', quantity: 2 }],
                    total: 200,
                })
            );
        });

        it('普通用戶不能創建訂單', async () => {
            await setAdminData('users/user-1', {
                email: 'user@example.com',
                isAdmin: false,
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertFails(
                db.collection('orders').add({
                    userId: 'user-1',
                    items: [{ productId: 'prod-1', quantity: 2 }],
                    total: 200,
                })
            );
        });

        it('未認證用戶不能創建訂單', async () => {
            const db = getUnauthenticatedDb();
            await assertFails(
                db.collection('orders').add({
                    userId: 'unknown',
                    total: 100,
                })
            );
        });

        it('任何人可以讀取訂單', async () => {
            await setAdminData('orders/order-1', {
                userId: 'user-1',
                total: 100,
            });

            const db = getUnauthenticatedDb();
            await assertSucceeds(
                db.collection('orders').doc('order-1').get()
            );
        });
    });

    // ============================================
    // Reservations Collection Tests
    // 根據 firestore.rules：任何人都可以讀取和創建
    // ============================================
    describe('Reservations Collection', () => {
        it('任何人都可以創建預訂（訪客功能）', async () => {
            const db = getUnauthenticatedDb();
            await assertSucceeds(
                db.collection('reservations').add({
                    name: '訪客',
                    phone: '12345678',
                    date: '2026-02-10',
                })
            );
        });

        it('任何人都可以讀取預訂（設計如此）', async () => {
            await setAdminData('reservations/res-1', {
                name: '某訪客',
            });

            const db = getUnauthenticatedDb();
            await assertSucceeds(
                db.collection('reservations').doc('res-1').get()
            );
        });

        it('未認證用戶不能更新預訂', async () => {
            await setAdminData('reservations/res-1', {
                name: '某訪客',
            });

            const db = getUnauthenticatedDb();
            await assertFails(
                db.collection('reservations').doc('res-1').update({
                    status: 'confirmed',
                })
            );
        });

        it('未認證用戶不能刪除預訂', async () => {
            await setAdminData('reservations/res-1', {
                name: '某訪客',
            });

            const db = getUnauthenticatedDb();
            await assertFails(
                db.collection('reservations').doc('res-1').delete()
            );
        });

        it('Admin 可以更新預訂', async () => {
            await setAdminData('users/admin-1', {
                email: 'admin@example.com',
                isAdmin: true,
            });
            await setAdminData('reservations/res-1', {
                name: '某訪客',
            });

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
            await assertSucceeds(
                db.collection('reservations').doc('res-1').update({
                    status: 'confirmed',
                })
            );
        });

        it('Admin 可以刪除預訂', async () => {
            await setAdminData('users/admin-1', {
                email: 'admin@example.com',
                isAdmin: true,
            });
            await setAdminData('reservations/res-1', {
                name: '某訪客',
            });

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
            await assertSucceeds(
                db.collection('reservations').doc('res-1').delete()
            );
        });
    });

    // ============================================
    // Admin Invites Collection Tests
    // ============================================
    describe('AdminInvites Collection', () => {
        it('任何人都可以讀取邀請（檢查是否被邀請）', async () => {
            await setAdminData('adminInvites/invite@example.com', {
                email: 'invite@example.com',
                invitedBy: 'admin-1',
            });

            const db = getUnauthenticatedDb();
            await assertSucceeds(
                db.collection('adminInvites').doc('invite@example.com').get()
            );
        });

        it('只有 Admin 可以創建邀請', async () => {
            await setAdminData('users/admin-1', {
                email: 'admin@example.com',
                isAdmin: true,
            });

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
            await assertSucceeds(
                db.collection('adminInvites').doc('new@example.com').set({
                    email: 'new@example.com',
                    invitedBy: 'admin-1',
                })
            );
        });

        it('普通用戶不能創建邀請', async () => {
            await setAdminData('users/user-1', {
                email: 'user@example.com',
                isAdmin: false,
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertFails(
                db.collection('adminInvites').doc('new@example.com').set({
                    email: 'new@example.com',
                })
            );
        });
    });
});
