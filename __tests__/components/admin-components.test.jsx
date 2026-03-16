/**
 * Admin Components 測試
 * 測試 AdminSidebar、AdminNavbar、AdminLayout、OrdersAreaChart
 */

import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ============================================
// Mock Dependencies
// ============================================

// Mock usePathname for AdminSidebar active link
let mockPathname = '/admin'
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => mockPathname,
}))

// Mock AuthContext
const mockLogOut = jest.fn()
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
jest.mock('@/lib/services/AuthService', () => ({
    logOut: (...args) => mockLogOut(...args),
}))

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
    toast: { success: jest.fn(), error: jest.fn() },
    __esModule: true,
    default: { success: jest.fn(), error: jest.fn() },
}))

// Mock assets
jest.mock('@/assets/assets', () => ({
    assets: {
        logo: '/test-logo.png',
    },
}))

// Mock Firebase config
jest.mock('@/lib/firebase/config', () => ({
    auth: null,
    db: null,
    storage: null,
}))

// Mock recharts (OrdersAreaChart 用到)
jest.mock('recharts', () => ({
    AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
    Area: () => <div data-testid="area" />,
    XAxis: () => <div data-testid="xaxis" />,
    YAxis: () => <div data-testid="yaxis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
}))

// ============================================
// Import Components
// ============================================
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminLayout from '@/components/admin/AdminLayout'
import OrdersAreaChart from '@/components/OrdersAreaChart'

// ============================================
// AdminSidebar Tests
// ============================================
describe('AdminSidebar', () => {
    beforeEach(() => {
        mockPathname = '/admin'
    })

    const expectedLinks = [
        { name: 'Dashboard', href: '/admin' },
        { name: 'Home Setting', href: '/admin/home-setting' },
        { name: 'About Setting', href: '/admin/about-setting' },
        { name: 'Reservations', href: '/admin/reservations' },
        { name: 'Products List', href: '/admin/products/list' },
        { name: 'Add Product', href: '/admin/products' },
        { name: 'Edit Categories', href: '/admin/categories' },
        { name: 'Manage Admins', href: '/admin/admins' },
        { name: 'Notifications', href: '/admin/notifications' },
        { name: '功能許願樹', href: '/admin/todo' },
    ]

    it('應該渲染所有 10 個側邊欄連結', () => {
        render(<AdminSidebar />)
        
        expectedLinks.forEach(link => {
            expect(screen.getByText(link.name)).toBeInTheDocument()
        })
    })

    it('每個連結應該有正確的 href', () => {
        render(<AdminSidebar />)
        
        expectedLinks.forEach(link => {
            const linkElement = screen.getByText(link.name).closest('a')
            expect(linkElement).toHaveAttribute('href', link.href)
        })
    })

    it('應該顯示 LoyaultyClub 品牌名', () => {
        render(<AdminSidebar />)
        
        expect(screen.getByText('LoyaultyClub')).toBeInTheDocument()
    })

    it('當前頁面的連結應該有 active 樣式', () => {
        mockPathname = '/admin/reservations'
        render(<AdminSidebar />)
        
        const reservationsLink = screen.getByText('Reservations').closest('a')
        expect(reservationsLink).toHaveClass('bg-slate-100')
    })

    it('非當前頁面的連結不應該有 active 樣式', () => {
        mockPathname = '/admin'
        render(<AdminSidebar />)
        
        const reservationsLink = screen.getByText('Reservations').closest('a')
        expect(reservationsLink).not.toHaveClass('bg-slate-100')
    })
})

// ============================================
// AdminNavbar Tests
// ============================================
describe('AdminNavbar', () => {
    beforeEach(() => {
        mockLogOut.mockReset()
        mockAuthValue = {
            user: { displayName: 'Admin User', email: 'admin@test.com' },
            isAdmin: true,
            isAuthenticated: true,
            loading: false,
        }
    })

    it('應該顯示陶豬管理員 badge', () => {
        render(<AdminNavbar />)
        
        expect(screen.getByText('陶豬管理員')).toBeInTheDocument()
    })

    it('應該顯示用戶 displayName', () => {
        render(<AdminNavbar />)
        
        expect(screen.getByText('Admin User')).toBeInTheDocument()
    })

    it('沒有 displayName 時應該顯示 email', () => {
        mockAuthValue = {
            ...mockAuthValue,
            user: { displayName: null, email: 'admin@test.com' },
        }
        render(<AdminNavbar />)
        
        expect(screen.getByText('admin@test.com')).toBeInTheDocument()
    })

    it('應該有登出按鈕', () => {
        render(<AdminNavbar />)
        
        expect(screen.getByText('登出')).toBeInTheDocument()
    })

    it('應該有 Logo 連結到首頁', () => {
        render(<AdminNavbar />)
        
        // Logo 的父連結指向首頁
        const homeLink = screen.getByText('陶豬管理員').closest('a')
        expect(homeLink).toHaveAttribute('href', '/')
    })
})

// ============================================
// AdminLayout Tests
// ============================================
describe('AdminLayout', () => {
    it('應該渲染 children 內容', async () => {
        render(
            <AdminLayout>
                <div>Test Content</div>
            </AdminLayout>
        )
        
        // AdminLayout 有一個 useEffect 設定 isAdmin=true，需要等待
        const content = await screen.findByText('Test Content')
        expect(content).toBeInTheDocument()
    })

    it('應該渲染 AdminNavbar', async () => {
        render(
            <AdminLayout>
                <div>Test</div>
            </AdminLayout>
        )
        
        const navbar = await screen.findByText('陶豬管理員')
        expect(navbar).toBeInTheDocument()
    })

    it('應該渲染 AdminSidebar 的連結', async () => {
        render(
            <AdminLayout>
                <div>Test</div>
            </AdminLayout>
        )
        
        const dashboard = await screen.findByText('Dashboard')
        expect(dashboard).toBeInTheDocument()
    })
})

// ============================================
// OrdersAreaChart Tests
// ============================================
describe('OrdersAreaChart', () => {
    const mockOrders = [
        { createdAt: '2026-03-01T10:00:00Z', totalAmount: 100 },
        { createdAt: '2026-03-01T14:00:00Z', totalAmount: 200 },
        { createdAt: '2026-03-02T10:00:00Z', totalAmount: 150 },
    ]

    it('應該顯示圖表標題', () => {
        render(<OrdersAreaChart allOrders={mockOrders} />)
        
        expect(screen.getByText('Day')).toBeInTheDocument()
    })

    it('應該渲染圖表容器', () => {
        render(<OrdersAreaChart allOrders={mockOrders} />)
        
        expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
        expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    })

    it('空訂單也能正常渲染', () => {
        render(<OrdersAreaChart allOrders={[]} />)
        
        expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })
})
