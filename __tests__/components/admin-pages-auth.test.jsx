/**
 * Admin Pages Auth 測試 — Phase 2 文件 1
 * 測試 Login 頁面 + Dashboard 頁面（Mock 模式 A：Auth + API）
 */

import React from 'react'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ============================================
// Mock Dependencies
// ============================================

// Mock next/navigation
const mockPush = jest.fn()
const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
        prefetch: jest.fn(),
        back: jest.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/admin',
}))

// Mock AuthContext — let variable 控制每個 test 的 auth 狀態
let mockAuthValue = {
    user: { displayName: 'Admin User', email: 'admin@test.com' },
    isAdmin: true,
    isAuthenticated: true,
    loading: false,
}
jest.mock('@/lib/context/AuthContext', () => ({
    useAuth: () => mockAuthValue,
}))

// Mock AuthService
const mockSignInWithGoogle = jest.fn()
jest.mock('@/lib/services/AuthService', () => ({
    signInWithGoogle: (...args) => mockSignInWithGoogle(...args),
}))

// Mock ApiService
const mockGetAllProducts = jest.fn()
const mockGetAllOrders = jest.fn()
jest.mock('@/lib/services/ApiService', () => ({
    ProductApiService: {
        getAllProducts: (...args) => mockGetAllProducts(...args),
    },
    OrderApiService: {
        getAllOrders: (...args) => mockGetAllOrders(...args),
    },
}))

// Mock react-hot-toast（Login 用 named import { toast }，Dashboard 用 default import）
jest.mock('react-hot-toast', () => {
    const toast = { success: jest.fn(), error: jest.fn() }
    return {
        toast,
        __esModule: true,
        default: toast,
    }
})

// Mock child components（避免深層依賴）
jest.mock('@/components/Logo', () => {
    return function MockLogo() { return <div data-testid="logo">Logo</div> }
})
jest.mock('@/components/Loading', () => {
    return function MockLoading() { return <div data-testid="loading">Loading...</div> }
})
jest.mock('@/components/OrdersAreaChart', () => {
    return function MockChart({ allOrders }) {
        return <div data-testid="orders-chart">Chart ({allOrders?.length || 0} orders)</div>
    }
})

// Mock Firebase config（避免 SDK 初始化）
jest.mock('@/lib/firebase/config', () => ({
    auth: null,
    db: null,
    storage: null,
}))

// ============================================
// Import Pages (after mocks)
// ============================================
import AdminLoginPage from '@/app/admin/login/page'
import AdminDashboard from '@/app/admin/page'

// 取得 mock toast reference（因為 jest.mock hoisting，不能用 const 在外面）
const { toast: mockToast } = require('react-hot-toast')

// ============================================
// Login Page Tests
// ============================================
describe('AdminLoginPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // 預設：未登入狀態
        mockAuthValue = {
            user: null,
            isAdmin: false,
            isAuthenticated: false,
            loading: false,
        }
    })

    it('renders Google login button and title', () => {
        render(<AdminLoginPage />)

        expect(screen.getByText('陶豬管理員')).toBeInTheDocument()
        expect(screen.getByText('LoyaultyClub Admin Portal')).toBeInTheDocument()
        expect(screen.getByText('使用 Google 登入')).toBeInTheDocument()
        expect(screen.getByText('管理員專用登入')).toBeInTheDocument()
        expect(screen.getByTestId('logo')).toBeInTheDocument()
    })

    it('shows loading spinner when auth is loading', () => {
        mockAuthValue = { ...mockAuthValue, loading: true }

        render(<AdminLoginPage />)

        expect(screen.getByText('載入中...')).toBeInTheDocument()
        expect(screen.queryByText('使用 Google 登入')).not.toBeInTheDocument()
    })

    it('redirects to /admin when already authenticated as admin', () => {
        mockAuthValue = {
            user: { displayName: 'Admin', email: 'admin@test.com' },
            isAdmin: true,
            isAuthenticated: true,
            loading: false,
        }

        render(<AdminLoginPage />)

        expect(mockReplace).toHaveBeenCalledWith('/admin')
    })

    it('shows error toast when login fails', async () => {
        mockSignInWithGoogle.mockResolvedValue({
            success: false,
            error: '網路錯誤',
        })

        const user = userEvent.setup()
        render(<AdminLoginPage />)

        await user.click(screen.getByText('使用 Google 登入'))

        expect(mockSignInWithGoogle).toHaveBeenCalled()
        expect(mockToast.error).toHaveBeenCalledWith('登入失敗：網路錯誤')
    })

    it('shows error toast when user is not admin', async () => {
        mockSignInWithGoogle.mockResolvedValue({
            success: true,
            userDoc: { isAdmin: false },
        })

        const user = userEvent.setup()
        render(<AdminLoginPage />)

        await user.click(screen.getByText('使用 Google 登入'))

        expect(mockToast.error).toHaveBeenCalledWith('你沒有管理員權限')
    })
})

// ============================================
// Dashboard Page Tests
// ============================================
describe('AdminDashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // 預設：已登入 admin
        mockAuthValue = {
            user: { displayName: 'Admin User', email: 'admin@test.com' },
            isAdmin: true,
            isAuthenticated: true,
            loading: false,
        }
        // 預設 API 回傳
        mockGetAllProducts.mockResolvedValue({
            data: [
                { id: '1', name: 'Product A', price: 100 },
                { id: '2', name: 'Product B', price: 200 },
            ],
        })
        mockGetAllOrders.mockResolvedValue({
            data: [
                { id: 'o1', totalAmount: 500 },
                { id: 'o2', totalAmount: 300 },
                { id: 'o3', totalAmount: 200 },
            ],
        })
    })

    it('shows loading state while fetching data', () => {
        // API 永遠 pending，不會 resolve
        mockGetAllProducts.mockReturnValue(new Promise(() => {}))
        mockGetAllOrders.mockReturnValue(new Promise(() => {}))

        render(<AdminDashboard />)

        expect(screen.getByTestId('loading')).toBeInTheDocument()
    })

    it('renders dashboard cards with correct data after loading', async () => {
        render(<AdminDashboard />)

        // 等待 API 數據加載完成
        expect(await screen.findByText('Total Products')).toBeInTheDocument()
        expect(screen.getByText('Total Revenue')).toBeInTheDocument()
        expect(screen.getByText('Total Orders')).toBeInTheDocument()

        // 驗證數據：2 products, $1000 revenue, 3 orders
        expect(screen.getByText('2')).toBeInTheDocument()
        expect(screen.getByText('$1000')).toBeInTheDocument()
        expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('renders OrdersAreaChart with order data', async () => {
        render(<AdminDashboard />)

        const chart = await screen.findByTestId('orders-chart')
        expect(chart).toBeInTheDocument()
        expect(chart).toHaveTextContent('3 orders')
    })

    it('redirects non-admin users to home page', () => {
        mockAuthValue = {
            user: { displayName: 'User', email: 'user@test.com' },
            isAdmin: false,
            isAuthenticated: true,
            loading: false,
        }

        render(<AdminDashboard />)

        expect(mockPush).toHaveBeenCalledWith('/')
        expect(mockToast.error).toHaveBeenCalledWith('需要管理員權限才能訪問此頁面')
    })

    it('shows loading when auth is still checking', () => {
        mockAuthValue = { ...mockAuthValue, loading: true }

        render(<AdminDashboard />)

        // authLoading = true → return <Loading />
        expect(screen.getByTestId('loading')).toBeInTheDocument()
    })

    it('renders page title correctly', async () => {
        render(<AdminDashboard />)

        expect(await screen.findByText('Dashboard')).toBeInTheDocument()
    })
})
