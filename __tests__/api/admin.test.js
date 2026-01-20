/**
 * API Routes 測試
 * 測試 Admin API 的認證和功能
 */

// 直接 mock 整個 auth/server 模組
jest.mock('@/lib/auth/server', () => {
    // 預設返回未認證
    let mockAuthResult = {
        success: false,
        error: '未提供認證 token',
        status: 401
    };

    return {
        __setMockAuthResult: (result) => { mockAuthResult = result; },
        __resetMockAuthResult: () => { 
            mockAuthResult = { success: false, error: '未提供認證 token', status: 401 }; 
        },
        verifyAdminRequest: jest.fn(async () => mockAuthResult),
        verifyIdToken: jest.fn(async (token) => mockAuthResult),
        withAdminAuth: jest.fn((handler) => handler),
        __getMockAuthResult: () => mockAuthResult
    };
});

import { 
    __setMockAuthResult, 
    __resetMockAuthResult, 
    verifyAdminRequest,
    __getMockAuthResult
} from '@/lib/auth/server';

// 設置環境變數
const originalEnv = process.env

beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    __resetMockAuthResult()
})

afterEach(() => {
    process.env = originalEnv
    jest.restoreAllMocks()
})

/**
 * ==========================================
 * 安全性測試 - 認證中間件
 * ==========================================
 */
describe('API 認證測試 (Security)', () => {
    describe('Admin Invite API - 認證檢查', () => {
        let POST

        beforeEach(async () => {
            jest.resetModules()
            const module = await import('@/app/api/admin/invite/route')
            POST = module.POST
        })

        it('應該在沒有 Authorization header 時返回 401', async () => {
            __setMockAuthResult({
                success: false,
                error: '未提供認證 token',
                status: 401
            })

            const request = new Request('http://localhost/api/admin/invite', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com' })
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(401)
            expect(data.error).toContain('認證')
        })

        it('應該在 token 無效時返回 401', async () => {
            __setMockAuthResult({
                success: false,
                error: '認證失敗',
                status: 401
            })

            const request = new Request('http://localhost/api/admin/invite', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer invalid_token' },
                body: JSON.stringify({ email: 'test@example.com' })
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(401)
            expect(data.error).toBeDefined()
        })

        it('應該在用戶非 admin 時返回 403', async () => {
            __setMockAuthResult({
                success: false,
                error: '需要管理員權限',
                status: 403
            })

            const request = new Request('http://localhost/api/admin/invite', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer valid_user_token' },
                body: JSON.stringify({ email: 'test@example.com' })
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(403)
            expect(data.error).toContain('管理員')
        })

        it('應該允許有效 admin 的請求通過認證', async () => {
            __setMockAuthResult({
                success: true,
                user: {
                    uid: 'admin_123',
                    email: 'admin@test.com',
                    isAdmin: true
                }
            })

            // 但會因為缺少 email 而返回 400 (業務邏輯錯誤，不是認證錯誤)
            const request = new Request('http://localhost/api/admin/invite', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer valid_admin_token' },
                body: JSON.stringify({})
            })

            const response = await POST(request)

            // 400 = 業務邏輯錯誤 (缺少 email)，代表已通過認證
            expect(response.status).toBe(400)
        })
    })

    describe('Remote Config API - 認證檢查', () => {
        let POST

        beforeEach(async () => {
            jest.resetModules()
            const module = await import('@/app/api/admin/remote-config/route')
            POST = module.POST
        })

        it('應該在沒有認證時返回 401', async () => {
            __setMockAuthResult({
                success: false,
                error: '未提供認證 token',
                status: 401
            })

            const request = new Request('http://localhost/api/admin/remote-config', {
                method: 'POST',
                body: JSON.stringify({ colors: { primary: '#000' } })
            })

            const response = await POST(request)

            expect(response.status).toBe(401)
        })

        it('應該在非 admin 時返回 403', async () => {
            __setMockAuthResult({
                success: false,
                error: '需要管理員權限',
                status: 403
            })

            const request = new Request('http://localhost/api/admin/remote-config', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer valid_user_token' },
                body: JSON.stringify({ colors: { primary: '#000' } })
            })

            const response = await POST(request)

            expect(response.status).toBe(403)
        })
    })
})

/**
 * ==========================================
 * 功能測試 - Admin Invite API
 * ==========================================
 */
describe('Admin Invite API (/api/admin/invite)', () => {
    let POST

    beforeEach(async () => {
        jest.resetModules()
        
        // 設置為已認證的 admin
        __setMockAuthResult({
            success: true,
            user: { uid: 'admin_123', email: 'admin@test.com', isAdmin: true }
        })
        
        const module = await import('@/app/api/admin/invite/route')
        POST = module.POST
    })

    describe('驗證 (Validation)', () => {
        it('應該在缺少 email 時返回 400', async () => {
            const request = new Request('http://localhost/api/admin/invite', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer valid_admin_token' },
                body: JSON.stringify({})
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBeDefined()
        })

        it('應該在 RESEND_API_KEY 未配置時返回 500', async () => {
            delete process.env.RESEND_API_KEY

            const request = new Request('http://localhost/api/admin/invite', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer valid_admin_token' },
                body: JSON.stringify({ email: 'test@example.com' })
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(500)
            expect(data.error).toContain('Email 服務未配置')
        })
    })

    describe('功能測試 (Functionality)', () => {
        beforeEach(() => {
            process.env.RESEND_API_KEY = 'test_resend_key'
            process.env.NEXT_PUBLIC_SITE_URL = 'https://test.com'
            
            // Mock fetch
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ id: 'email_123' })
                })
            )
        })

        it('應該成功發送邀請郵件', async () => {
            const request = new Request('http://localhost/api/admin/invite', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer valid_admin_token' },
                body: JSON.stringify({ 
                    email: 'newadmin@example.com',
                    invitedBy: 'Admin User'
                })
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.resend.com/emails',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer test_resend_key'
                    })
                })
            )
        })

        it('應該在郵件發送失敗時返回錯誤', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: false,
                    json: () => Promise.resolve({ error: 'Rate limit exceeded' })
                })
            )

            const request = new Request('http://localhost/api/admin/invite', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer valid_admin_token' },
                body: JSON.stringify({ email: 'test@example.com' })
            })

            const response = await POST(request)
            
            expect(response.status).toBe(500)
        })
    })
})

/**
 * ==========================================
 * 功能測試 - Remote Config API
 * ==========================================
 */
describe('Remote Config API (/api/admin/remote-config)', () => {
    describe('POST - 更新配色', () => {
        let POST

        beforeEach(async () => {
            jest.resetModules()
            
            // 設置為已認證的 admin
            __setMockAuthResult({
                success: true,
                user: { uid: 'admin_123', email: 'admin@test.com', isAdmin: true }
            })
            
            // Mock firebase-admin
            jest.doMock('firebase-admin', () => ({
                apps: [],
                initializeApp: jest.fn(),
                credential: {
                    cert: jest.fn()
                },
                remoteConfig: jest.fn(() => ({
                    getTemplate: jest.fn(() => Promise.resolve({ parameters: {} })),
                    publishTemplate: jest.fn(() => Promise.resolve())
                }))
            }))

            const module = await import('@/app/api/admin/remote-config/route')
            POST = module.POST
        })

        it('應該在缺少 colors 時返回 400', async () => {
            const request = new Request('http://localhost/api/admin/remote-config', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer valid_admin_token' },
                body: JSON.stringify({})
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toContain('缺少顏色資料')
        })

        it('應該在 Firebase Admin 未配置時返回 500', async () => {
            delete process.env.FIREBASE_SERVICE_ACCOUNT_KEY

            const request = new Request('http://localhost/api/admin/remote-config', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer valid_admin_token' },
                body: JSON.stringify({ 
                    colors: { primary: '#000000' } 
                })
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(500)
            expect(data.error).toContain('Firebase Admin SDK')
        })
    })
})
