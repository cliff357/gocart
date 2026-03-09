/**
 * Firestore Security Rules 測試
 * 
 * 使用 @firebase/rules-unit-testing 測試真實的 Security Rules
 * 匹配 add_test_module 分支的 firestore.rules (單管理員模型)
 * 
 * 📅 2026-02-27 更新：收緊安全規則，每個 collection 明確定義權限
 * 
 * 新 Rules 架構要點：
 * - isAdmin() 透過 users/{uid}.isAdmin == true 判斷
 * - Users create 需要 hasPendingInvite()（adminInvites collection）
 * - 公開讀取：products, categories, ratings, settings
 * - 需要登入：addresses
 * - Admin 專用：orders, coupons, stores, reservations(read)
 * - 訪客可建：reservations(create)
 * - 默認 wildcard：deny all（拒絕未定義的 collection）
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

    /**
     * 設置一個 admin 用戶（isAdmin: true）
     * 新 rules 用 isAdmin field 而不是 role field
     */
    async function setupAdmin(uid = 'admin-1', email = 'admin@example.com') {
        await setAdminData(`users/${uid}`, {
            email,
            isAdmin: true,
        });
    }

    /**
     * 設置 adminInvite（讓用戶可以創建 profile）
     * 新 rules 的 users create 需要 hasPendingInvite()
     */
    async function setupInvite(email) {
        await setAdminData(`adminInvites/${email}`, {
            email,
            invitedBy: 'admin@example.com',
            createdAt: new Date(),
        });
    }

    // ============================================
    // Users Collection Tests
    // 新 Rules (add_test_module):
    // - read: if true（全公開）
    // - create: auth + uid == userId + hasPendingInvite()
    // - update: isAdmin() 或 (auth + uid == userId)
    // - delete: isAdmin()
    // ============================================
    describe('Users Collection', () => {
        it('用戶有邀請時可以創建自己的 profile', async () => {
            // 先設置邀請
            await setupInvite('user@example.com');

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertSucceeds(
                db.collection('users').doc('user-1').set({
                    email: 'user@example.com',
                    username: 'testuser',
                    createdAt: new Date(),
                })
            );
        });

        it('用戶沒有邀請時不能創建 profile', async () => {
            // 沒有 setupInvite
            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertFails(
                db.collection('users').doc('user-1').set({
                    email: 'user@example.com',
                    username: 'testuser',
                    createdAt: new Date(),
                })
            );
        });

        it('用戶不能創建其他人的 profile', async () => {
            await setupInvite('user@example.com');
            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertFails(
                db.collection('users').doc('user-2').set({
                    email: 'other@example.com',
                    username: 'other',
                    createdAt: new Date(),
                })
            );
        });

        it('任何人都可以讀取用戶資料（公開）', async () => {
            await setAdminData('users/user-1', {
                email: 'user@example.com',
                username: 'testuser',
            });

            // 即使是未登入用戶也能讀
            const db = getUnauthenticatedDb();
            await assertSucceeds(db.collection('users').doc('user-1').get());
        });

        it('已登入用戶可以讀取其他人的資料（公開）', async () => {
            await setAdminData('users/user-2', {
                email: 'other@example.com',
                username: 'other',
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertSucceeds(db.collection('users').doc('user-2').get());
        });

        it('用戶可以更新自己的 profile', async () => {
            await setAdminData('users/user-1', {
                email: 'user@example.com',
                username: 'oldname',
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertSucceeds(
                db.collection('users').doc('user-1').update({
                    username: 'newname',
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
                })
            );
        });

        it('只有 Admin 可以刪除用戶', async () => {
            await setupAdmin('admin-1');
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
    // - 有專門 match
    // - read: if true（全公開）
    // - write: if isAdmin()（只有 admin 可寫）
    // ============================================
    describe('Products Collection', () => {
        it('任何人都可以讀取商品', async () => {
            await setAdminData('products/prod-1', {
                name: '測試商品',
                price: 100,
            });

            const db = getUnauthenticatedDb();
            await assertSucceeds(db.collection('products').doc('prod-1').get());
        });

        it('Admin 可以創建商品', async () => {
            await setupAdmin('admin-1');

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
            await assertSucceeds(
                db.collection('products').add({
                    name: '新商品',
                    price: 50,
                    createdAt: new Date(),
                })
            );
        });

        it('普通用戶不能創建商品', async () => {
            await setAdminData('users/user-1', {
                email: 'user@example.com',
                isAdmin: false,
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertFails(
                db.collection('products').add({
                    name: '新商品',
                    price: 50,
                    createdAt: new Date(),
                })
            );
        });

        it('Admin 可以更新商品', async () => {
            await setupAdmin('admin-1');
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

        it('普通用戶不能更新商品', async () => {
            await setAdminData('users/user-1', {
                email: 'user@example.com',
                isAdmin: false,
            });
            await setAdminData('products/prod-1', {
                name: '原始商品',
                price: 100,
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertFails(
                db.collection('products').doc('prod-1').update({
                    price: 999,
                })
            );
        });

        it('Admin 可以刪除任何商品', async () => {
            await setupAdmin('admin-1');
            await setAdminData('products/prod-1', {
                name: '待刪除',
            });

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
            await assertSucceeds(db.collection('products').doc('prod-1').delete());
        });

        it('普通用戶不能刪除商品', async () => {
            await setAdminData('users/user-1', {
                email: 'user@example.com',
                isAdmin: false,
            });
            await setAdminData('products/prod-1', {
                name: '待刪除',
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertFails(db.collection('products').doc('prod-1').delete());
        });
    });

    // ============================================
    // Orders Collection Tests
    // 新 Rules:
    // - 有專門 match
    // - read, write: if isAdmin()（只有 admin 可讀寫）
    // ============================================
    describe('Orders Collection', () => {
        it('未登入用戶不能讀取訂單', async () => {
            await setAdminData('orders/order-1', {
                userId: 'user-1',
                total: 100,
                status: 'pending',
            });

            const db = getUnauthenticatedDb();
            await assertFails(db.collection('orders').doc('order-1').get());
        });

        it('普通用戶不能讀取訂單', async () => {
            await setAdminData('users/user-1', {
                email: 'user@example.com',
                isAdmin: false,
            });
            await setAdminData('orders/order-1', {
                userId: 'user-2',
                total: 100,
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertFails(db.collection('orders').doc('order-1').get());
        });

        it('Admin 可以讀取訂單', async () => {
            await setupAdmin('admin-1');
            await setAdminData('orders/order-1', {
                userId: 'user-1',
                total: 100,
                status: 'pending',
            });

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
            await assertSucceeds(db.collection('orders').doc('order-1').get());
        });

        it('Admin 可以創建訂單', async () => {
            await setupAdmin('admin-1');

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
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

        it('普通用戶不能創建訂單', async () => {
            await setAdminData('users/user-1', {
                email: 'user@example.com',
                isAdmin: false,
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertFails(
                db.collection('orders').add({
                    userId: 'user-1',
                    items: [{ productId: 'prod-1', quantity: 1 }],
                    total: 100,
                    status: 'pending',
                    createdAt: new Date(),
                })
            );
        });

        it('Admin 可以刪除訂單', async () => {
            await setupAdmin('admin-1');
            await setAdminData('orders/order-1', {
                userId: 'user-1',
                total: 100,
            });

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
            await assertSucceeds(db.collection('orders').doc('order-1').delete());
        });
    });

    // ============================================
    // Admin Collection Tests
    // 新 Rules:
    // - 無專門 match，由 wildcard 拒絕
    // - read, write: if false（全部拒絕）
    // ============================================
    describe('Admin Collection', () => {
        it('Admin 也不能寫入 admin collection（無明確規則）', async () => {
            await setupAdmin('admin-1');

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
            await assertFails(
                db.collection('admin').doc('settings').set({
                    siteName: 'GoCart',
                })
            );
        });

        it('未登入用戶不能讀取 admin collection', async () => {
            await setAdminData('admin/settings', {
                siteName: 'GoCart',
            });

            const db = getUnauthenticatedDb();
            await assertFails(
                db.collection('admin').doc('settings').get()
            );
        });

        it('普通用戶不能讀取 admin collection', async () => {
            await setAdminData('users/user-1', {
                email: 'user@example.com',
                isAdmin: false,
            });
            await setAdminData('admin/settings', {
                siteName: 'GoCart',
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertFails(
                db.collection('admin').doc('settings').get()
            );
        });
    });

    // ============================================
    // Reservations Collection Tests
    // 新 Rules:
    // - read: if isAdmin()（只有 admin 可讀）
    // - create: if true（訪客可預訂）
    // - update, delete: isAdmin()
    // ============================================
    describe('Reservations Collection', () => {
        it('任何人都可以創建預訂（訪客預訂）', async () => {
            const db = getUnauthenticatedDb();
            await assertSucceeds(
                db.collection('reservations').add({
                    name: '訪客',
                    phone: '12345678',
                    date: new Date(),
                })
            );
        });

        it('未登入用戶不能讀取預訂', async () => {
            await setAdminData('reservations/res-1', {
                name: '訪客',
                phone: '12345678',
            });

            const db = getUnauthenticatedDb();
            await assertFails(db.collection('reservations').doc('res-1').get());
        });

        it('Admin 可以讀取預訂', async () => {
            await setupAdmin('admin-1');
            await setAdminData('reservations/res-1', {
                name: '訪客',
                phone: '12345678',
            });

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
            await assertSucceeds(db.collection('reservations').doc('res-1').get());
        });

        it('Admin 可以刪除預訂', async () => {
            await setupAdmin('admin-1');
            await setAdminData('reservations/res-1', {
                name: '訪客',
                phone: '12345678',
            });

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
            await assertSucceeds(db.collection('reservations').doc('res-1').delete());
        });

        it('普通用戶不能刪除預訂', async () => {
            await setAdminData('users/user-1', {
                email: 'user@example.com',
                isAdmin: false,
            });
            await setAdminData('reservations/res-1', {
                name: '訪客',
                phone: '12345678',
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertFails(db.collection('reservations').doc('res-1').delete());
        });
    });

    // ============================================
    // AdminInvites Collection Tests (新增)
    // 新 Rules (add_test_module):
    // - read: if true
    // - create: isAdmin()
    // - delete: isAdmin() 或被邀請人自己
    // ============================================
    describe('AdminInvites Collection', () => {
        it('Admin 可以創建邀請', async () => {
            await setupAdmin('admin-1');

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
            await assertSucceeds(
                db.collection('adminInvites').doc('newuser@example.com').set({
                    email: 'newuser@example.com',
                    invitedBy: 'admin@example.com',
                    createdAt: new Date(),
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
                db.collection('adminInvites').doc('newuser@example.com').set({
                    email: 'newuser@example.com',
                    invitedBy: 'user@example.com',
                })
            );
        });

        it('被邀請人可以刪除自己的邀請（接受邀請）', async () => {
            await setAdminData('adminInvites/invited@example.com', {
                email: 'invited@example.com',
                invitedBy: 'admin@example.com',
            });

            const db = getAuthenticatedDb('user-1', 'invited@example.com');
            await assertSucceeds(
                db.collection('adminInvites').doc('invited@example.com').delete()
            );
        });
    });

    // ============================================
    // Settings Collection Tests (新增)
    // 新 Rules (add_test_module):
    // - read: if true
    // - write: isAdmin()
    // ============================================
    describe('Settings Collection', () => {
        it('任何人都可以讀取設定', async () => {
            await setAdminData('settings/home', {
                banners: { main: 'banner.jpg' },
            });

            const db = getUnauthenticatedDb();
            await assertSucceeds(db.collection('settings').doc('home').get());
        });

        it('Admin 可以更新設定', async () => {
            await setupAdmin('admin-1');
            await setAdminData('settings/home', {
                banners: { main: 'old.jpg' },
            });

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
            await assertSucceeds(
                db.collection('settings').doc('home').update({
                    banners: { main: 'new.jpg' },
                })
            );
        });

        it('普通用戶不能修改設定', async () => {
            await setAdminData('users/user-1', {
                email: 'user@example.com',
                isAdmin: false,
            });
            await setAdminData('settings/home', {
                banners: { main: 'banner.jpg' },
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertFails(
                db.collection('settings').doc('home').update({
                    banners: { main: 'hacked.jpg' },
                })
            );
        });
    });

    // ============================================
    // Default Rules Tests (Wildcard)
    // 新 Rules: match /{document=**}
    // - read: if false（全部拒絕）
    // - write: if false（全部拒絕）
    // 未定義的 collection 完全無法訪問
    // ============================================
    describe('Wildcard Default Rules', () => {
        it('未定義的 collection 不能被任何人讀取', async () => {
            await setAdminData('unknown_collection/doc-1', {
                data: 'test',
            });

            const db = getUnauthenticatedDb();
            await assertFails(
                db.collection('unknown_collection').doc('doc-1').get()
            );
        });

        it('Admin 也不能讀寫未定義的 collection', async () => {
            await setupAdmin('admin-1');

            const db = getAuthenticatedDb('admin-1', 'admin@example.com');
            await assertFails(
                db.collection('unknown_collection').doc('doc-1').set({
                    data: 'test',
                })
            );
        });

        it('普通用戶不能寫入未定義的 collection', async () => {
            await setAdminData('users/user-1', {
                email: 'user@example.com',
                isAdmin: false,
            });

            const db = getAuthenticatedDb('user-1', 'user@example.com');
            await assertFails(
                db.collection('unknown_collection').doc('doc-1').set({
                    data: 'hacked',
                })
            );
        });

        it('未登入用戶不能寫入任何 collection', async () => {
            const db = getUnauthenticatedDb();
            await assertFails(
                db.collection('some_collection').doc('doc-1').set({
                    data: 'anonymous',
                })
            );
        });
    });
});
