/**
 * Admin Pages Complex 測試 — Phase 2 文件 3
 * 測試 Products List / Add Product / Edit Product / Home Setting / Admins / Notifications
 * Mock 模式 D：複合型 — Auth + Firestore + Storage + Redux + 直接 Firebase SDK
 */

import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ============================================
// Mock Dependencies
// ============================================

// Mock next/navigation
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockParams = { productId: 'prod_123' }
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
        prefetch: jest.fn(),
        back: jest.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/admin',
    useParams: () => mockParams,
}))

// Mock AuthContext
let mockAuthValue = {
    user: { displayName: 'Admin', email: 'admin@test.com', uid: 'uid_admin' },
    isAdmin: true,
    isAuthenticated: true,
    loading: false,
}
jest.mock('@/lib/context/AuthContext', () => ({
    useAuth: () => mockAuthValue,
}))

// Mock react-hot-toast（named + default import）
jest.mock('react-hot-toast', () => {
    const toast = { success: jest.fn(), error: jest.fn(), loading: jest.fn() }
    return {
        toast,
        __esModule: true,
        default: toast,
    }
})

// Mock Firebase config
jest.mock('@/lib/firebase/config', () => ({
    auth: null,
    db: 'mock-db',
    storage: 'mock-storage',
}))

// Mock react-redux
const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: () => ({}),
    Provider: ({ children }) => children,
}))

// Mock productSlice
jest.mock('@/lib/features/product/productSlice', () => ({
    fetchProducts: jest.fn(() => ({ type: 'products/fetchProducts' })),
}))

// Mock FirestoreService instances（Products List / Add / Edit 用）
const mockProductGetAll = jest.fn()
const mockProductGetById = jest.fn()
const mockProductCreate = jest.fn()
const mockProductUpdate = jest.fn()
const mockProductDelete = jest.fn()
const mockCatGetAll = jest.fn()
jest.mock('@/lib/services/FirestoreService', () => ({
    productService: {
        getAll: (...args) => mockProductGetAll(...args),
        getById: (...args) => mockProductGetById(...args),
        create: (...args) => mockProductCreate(...args),
        update: (...args) => mockProductUpdate(...args),
        delete: (...args) => mockProductDelete(...args),
    },
    categoryService: {
        getAll: (...args) => mockCatGetAll(...args),
    },
    userService: {
        getAdmins: jest.fn().mockResolvedValue([
            { id: 'uid_admin', uid: 'uid_admin', displayName: 'Admin', email: 'admin@test.com' },
            { id: 'uid_other', uid: 'uid_other', displayName: 'Other Admin', email: 'other@test.com' },
        ]),
    },
}))

// Mock FirebaseFirestoreService（static — Home Setting 用）
const mockGetDocument = jest.fn()
const mockSetDocument = jest.fn()
jest.mock('@/lib/firebase/firestore', () => ({
    FirebaseFirestoreService: {
        getDocument: (...args) => mockGetDocument(...args),
        getCollection: jest.fn().mockResolvedValue({ success: true, data: [] }),
        updateDocument: jest.fn().mockResolvedValue({ success: true }),
        setDocument: (...args) => mockSetDocument(...args),
    },
}))

// Mock FirebaseStorageService（Home Setting 用）
jest.mock('@/lib/firebase/storage', () => ({
    FirebaseStorageService: {
        uploadFile: jest.fn().mockResolvedValue({ success: true, url: 'https://storage.test/uploaded.jpg' }),
    },
}))

// Mock firebase/storage SDK（Add/Edit Product 用）
jest.mock('firebase/storage', () => ({
    ref: jest.fn(),
    uploadBytes: jest.fn().mockResolvedValue({}),
    getDownloadURL: jest.fn().mockResolvedValue('https://storage.test/img.jpg'),
}))

// Mock firebase/firestore SDK（Admins / Notifications 用）
jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    getDoc: jest.fn().mockResolvedValue({ exists: () => true, data: () => ({
        testingEmails: ['test@example.com'],
        productionEmails: ['prod@example.com'],
        enabled: true,
    }) }),
    setDoc: jest.fn().mockResolvedValue(undefined),
    deleteDoc: jest.fn().mockResolvedValue(undefined),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn().mockResolvedValue({ docs: [] }),
    Timestamp: { now: () => ({ toDate: () => new Date() }) },
}))

// Mock next/image
jest.mock('next/image', () => {
    return function MockImage(props) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img {...props} />
    }
})

// Mock next/link
jest.mock('next/link', () => {
    return function MockLink({ href, children, ...props }) {
        return <a href={href} {...props}>{children}</a>
    }
})

// Mock Loading component
jest.mock('@/components/Loading', () => {
    return function MockLoading() { return <div data-testid="loading">Loading...</div> }
})

// Mock lucide-react icons
jest.mock('lucide-react', () => {
    const icon = (name) => {
        return function MockIcon(props) {
            return <span data-testid={`icon-${name}`} {...props} />
        }
    }
    return {
        Upload: icon('upload'),
        Plus: icon('plus'),
        X: icon('x'),
        Edit: icon('edit'),
        Edit2: icon('edit2'),
        Trash2: icon('trash2'),
        Eye: icon('eye'),
        Filter: icon('filter'),
        Save: icon('save'),
        Loader2: icon('loader2'),
        Move: icon('move'),
        ImageIcon: icon('image-icon'),
        Film: icon('film'),
        UserPlus: icon('user-plus'),
        Shield: icon('shield'),
        Mail: icon('mail'),
        Clock: icon('clock'),
        CheckCircle: icon('check-circle'),
        XCircle: icon('x-circle'),
        Users: icon('users'),
        Bell: icon('bell'),
        TestTube: icon('test-tube'),
    }
})

// ============================================
// Import Pages (after mocks)
// ============================================
import AdminProductsListPage from '@/app/admin/products/list/page'
import AddProductPage from '@/app/admin/products/page'
import EditProductPage from '@/app/admin/products/edit/[productId]/page'
import HomeSettingPage from '@/app/admin/home-setting/page'
import AdminManagementPage from '@/app/admin/admins/page'
import NotificationManagement from '@/app/admin/notifications/page'

// 取得 mock toast reference
const { toast: mockToast } = require('react-hot-toast')

// ============================================
// Products List Page Tests
// ============================================
describe('AdminProductsListPage', () => {
    const mockProducts = [
        { id: 'p1', name: '陶豬相架', description: '手工製作', price: 380, mrp: 450, category: '陶器', inStock: true, bestseller: true, images: ['/img/p1.jpg'] },
        { id: 'p2', name: '迷你花瓶', description: '小巧精緻', price: 200, mrp: 200, category: '花瓶', inStock: false, bestseller: false, images: [] },
    ]
    const mockCategories = [
        { id: 'c1', name: '陶器' },
        { id: 'c2', name: '花瓶' },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        mockAuthValue = {
            user: { displayName: 'Admin', email: 'admin@test.com', uid: 'uid_admin' },
            isAdmin: true,
            isAuthenticated: true,
            loading: false,
        }
        mockProductGetAll.mockResolvedValue(mockProducts)
        mockCatGetAll.mockResolvedValue(mockCategories)
    })

    it('renders product table with product data', async () => {
        render(<AdminProductsListPage />)

        expect(await screen.findByText('陶豬相架')).toBeInTheDocument()
        expect(screen.getByText('迷你花瓶')).toBeInTheDocument()
        expect(screen.getByText('產品管理')).toBeInTheDocument()
    })

    it('renders page header with add product link', async () => {
        render(<AdminProductsListPage />)

        await screen.findByText('陶豬相架')

        expect(screen.getByText('新增產品')).toBeInTheDocument()
        // 新增產品 link should point to /admin/products
        const addLink = screen.getByText('新增產品').closest('a')
        expect(addLink).toHaveAttribute('href', '/admin/products')
    })

    it('shows category filter with options', async () => {
        render(<AdminProductsListPage />)

        await screen.findByText('陶豬相架')

        // 分類篩選 label
        expect(screen.getByText('分類篩選：')).toBeInTheDocument()

        // select with 所有分類 + categories
        const select = screen.getByRole('combobox')
        expect(select).toBeInTheDocument()
        expect(select).toHaveValue('all')
    })

    it('shows product count', async () => {
        render(<AdminProductsListPage />)

        await screen.findByText('陶豬相架')

        expect(screen.getByText(/2 個產品/)).toBeInTheDocument()
    })

    it('shows loading spinner while fetching', () => {
        mockAuthValue = { ...mockAuthValue, loading: true }

        render(<AdminProductsListPage />)

        // auth loading → spinner
        const spinner = document.querySelector('.animate-spin')
        expect(spinner).toBeInTheDocument()
    })

    it('redirects non-admin user', () => {
        mockAuthValue = { ...mockAuthValue, isAdmin: false }

        render(<AdminProductsListPage />)

        expect(mockPush).toHaveBeenCalledWith('/')
    })
})

// ============================================
// Add Product Page Tests
// ============================================
describe('AddProductPage', () => {
    const mockCategories = [
        { id: 'c1', name: '陶器' },
        { id: 'c2', name: '花瓶' },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        mockAuthValue = {
            user: { displayName: 'Admin', email: 'admin@test.com', uid: 'uid_admin' },
            isAdmin: true,
            isAuthenticated: true,
            loading: false,
        }
        mockCatGetAll.mockResolvedValue(mockCategories)
        mockProductGetAll.mockResolvedValue([])
    })

    it('renders form with all required fields', async () => {
        render(<AddProductPage />)

        expect(await screen.findByText('添加新產品')).toBeInTheDocument()
        expect(screen.getByText('填寫產品資訊並上傳圖片')).toBeInTheDocument()

        // Form fields
        expect(screen.getByPlaceholderText('輸入產品名稱')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('輸入產品描述')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('請輸入售價')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('請輸入原價')).toBeInTheDocument()

        // Labels
        expect(screen.getByText('產品名稱 *')).toBeInTheDocument()
        expect(screen.getByText('產品描述 *')).toBeInTheDocument()
        expect(screen.getByText('售價 (HKD) *')).toBeInTheDocument()
        expect(screen.getByText('產品圖片 *')).toBeInTheDocument()
    })

    it('renders submit and cancel buttons', async () => {
        render(<AddProductPage />)

        await screen.findByText('添加新產品')

        expect(screen.getByText('添加產品')).toBeInTheDocument()
        expect(screen.getByText('取消')).toBeInTheDocument()
    })

    it('shows bestseller checkbox', async () => {
        render(<AddProductPage />)

        await screen.findByText('添加新產品')

        expect(screen.getByText('標記為熱銷產品')).toBeInTheDocument()
        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).not.toBeChecked()
    })

    it('shows validation error when submitting without images', async () => {
        const user = userEvent.setup()
        render(<AddProductPage />)

        await screen.findByText('添加新產品')

        // Fill required text fields so HTML5 validation passes
        await user.type(screen.getByPlaceholderText('輸入產品名稱'), '測試產品')
        await user.type(screen.getByPlaceholderText('輸入產品描述'), '測試描述')
        await user.type(screen.getByPlaceholderText('請輸入售價'), '100')

        // Submit without images — JS validation should catch it
        const submitButton = screen.getByText('添加產品').closest('button')
        await user.click(submitButton)

        expect(mockToast.error).toHaveBeenCalledWith('請選擇至少一張產品圖片')
    })

    it('redirects non-admin user', () => {
        mockAuthValue = { ...mockAuthValue, isAdmin: false }

        render(<AddProductPage />)

        expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('shows loading spinner when auth is loading', () => {
        mockAuthValue = { ...mockAuthValue, loading: true }

        render(<AddProductPage />)

        const spinner = document.querySelector('.animate-spin')
        expect(spinner).toBeInTheDocument()
    })
})

// ============================================
// Edit Product Page Tests
// ============================================
describe('EditProductPage', () => {
    const mockProduct = {
        id: 'prod_123',
        name: '陶豬相架 A',
        description: '手工製作既陶瓷相架',
        price: 380,
        mrp: 450,
        category: '陶器',
        bestseller: true,
        images: ['/img/existing.jpg'],
        relatedProducts: [],
        options: [],
    }
    const mockCategories = [
        { id: 'c1', name: '陶器' },
        { id: 'c2', name: '花瓶' },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        mockAuthValue = {
            user: { displayName: 'Admin', email: 'admin@test.com', uid: 'uid_admin' },
            isAdmin: true,
            isAuthenticated: true,
            loading: false,
        }
        mockProductGetById.mockResolvedValue(mockProduct)
        mockCatGetAll.mockResolvedValue(mockCategories)
        mockProductGetAll.mockResolvedValue([mockProduct])
    })

    it('loads and renders product data in form', async () => {
        render(<EditProductPage />)

        // 等待產品資料載入
        expect(await screen.findByDisplayValue('陶豬相架 A')).toBeInTheDocument()
        expect(screen.getByDisplayValue('手工製作既陶瓷相架')).toBeInTheDocument()
        expect(screen.getByDisplayValue('380')).toBeInTheDocument()
        expect(screen.getByDisplayValue('450')).toBeInTheDocument()
    })

    it('shows page loading state', () => {
        mockAuthValue = { ...mockAuthValue, loading: true }

        render(<EditProductPage />)

        const spinner = document.querySelector('.animate-spin')
        expect(spinner).toBeInTheDocument()
    })

    it('redirects non-admin user', () => {
        mockAuthValue = { ...mockAuthValue, isAdmin: false }

        render(<EditProductPage />)

        expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('redirects when product not found', async () => {
        mockProductGetById.mockResolvedValue(null)

        render(<EditProductPage />)

        await waitFor(() => {
            expect(mockToast.error).toHaveBeenCalledWith('產品不存在')
        })
        expect(mockPush).toHaveBeenCalledWith('/admin/products/list')
    })
})

// ============================================
// Home Setting Page Tests
// ============================================
describe('HomeSettingPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockGetDocument.mockResolvedValue({
            success: true,
            data: {
                banners: { main: 'https://storage.test/banner.jpg' },
                positions: { main: { x: 50, y: 50 } },
                aboutMedia: { url: 'https://storage.test/about.mp4', type: 'video' },
            },
        })
        mockSetDocument.mockResolvedValue({ success: true })
    })

    it('renders page title and save button', async () => {
        render(<HomeSettingPage />)

        expect(await screen.findByText('Home Page Settings')).toBeInTheDocument()
        expect(screen.getByText(/Manage the main banner and about section media/)).toBeInTheDocument()
        expect(screen.getByText('Save Changes')).toBeInTheDocument()
    })

    it('renders main banner and about sections', async () => {
        render(<HomeSettingPage />)

        await screen.findByText('Home Page Settings')

        // 'Main Banner' appears in both settings section and live preview
        expect(screen.getAllByText('Main Banner').length).toBeGreaterThanOrEqual(1)
        expect(screen.getByText(/About LoyaultyClub - Media/)).toBeInTheDocument()
    })

    it('shows live preview section', async () => {
        render(<HomeSettingPage />)

        await screen.findByText('Home Page Settings')

        expect(screen.getByText('Live Preview')).toBeInTheDocument()
    })

    it('loads existing settings from Firestore', async () => {
        render(<HomeSettingPage />)

        await screen.findByText('Home Page Settings')

        expect(mockGetDocument).toHaveBeenCalledWith('settings', 'home')
    })
})

// ============================================
// Admin Management Page Tests
// ============================================
describe('AdminManagementPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockAuthValue = {
            user: { displayName: 'Admin', email: 'admin@test.com', uid: 'uid_admin' },
            isAdmin: true,
            isAuthenticated: true,
            loading: false,
        }
    })

    it('renders page title and invite form', async () => {
        render(<AdminManagementPage />)

        expect(await screen.findByText('管理員管理')).toBeInTheDocument()
        expect(screen.getByText('邀請新管理員')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('輸入電子郵件地址')).toBeInTheDocument()
        expect(screen.getByText('發送邀請')).toBeInTheDocument()
    })

    it('renders existing admin list', async () => {
        render(<AdminManagementPage />)

        // userService.getAdmins returns 2 admins
        expect(await screen.findByText('admin@test.com')).toBeInTheDocument()
        expect(screen.getByText('other@test.com')).toBeInTheDocument()

        // 現有管理員 header
        expect(screen.getByText(/現有管理員/)).toBeInTheDocument()
    })

    it('shows "you" badge for current user', async () => {
        render(<AdminManagementPage />)

        expect(await screen.findByText('你自己')).toBeInTheDocument()
    })

    it('shows auth loading state', () => {
        mockAuthValue = { ...mockAuthValue, loading: true }

        render(<AdminManagementPage />)

        expect(screen.getByTestId('loading')).toBeInTheDocument()
    })

    it('shows empty email validation error', async () => {
        const user = userEvent.setup()
        render(<AdminManagementPage />)

        await screen.findByText('管理員管理')

        // Submit empty form
        await user.click(screen.getByText('發送邀請'))

        expect(mockToast.error).toHaveBeenCalledWith('請輸入電子郵件')
    })

    it('shows duplicate admin error when inviting existing admin', async () => {
        const user = userEvent.setup()
        render(<AdminManagementPage />)

        await screen.findByText('管理員管理')

        // Type an email that's already an admin
        const input = screen.getByPlaceholderText('輸入電子郵件地址')
        await user.type(input, 'admin@test.com')
        await user.click(screen.getByText('發送邀請'))

        expect(mockToast.error).toHaveBeenCalledWith('此用戶已經是管理員')
    })

    it('shows how-to section', async () => {
        render(<AdminManagementPage />)

        expect(await screen.findByText('📌 如何邀請管理員？')).toBeInTheDocument()
    })
})

// ============================================
// Notification Management Page Tests
// ============================================
describe('NotificationManagement', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // getDoc is mocked at the top level to return settings data
    })

    it('renders page title and settings sections', async () => {
        render(<NotificationManagement />)

        expect(await screen.findByText('Notification Management')).toBeInTheDocument()
        expect(screen.getByText(/Configure email notifications for new orders/)).toBeInTheDocument()
        expect(screen.getByText('Save Settings')).toBeInTheDocument()
    })

    it('renders email sections for both environments', async () => {
        render(<NotificationManagement />)

        await screen.findByText('Notification Management')

        expect(screen.getByText('Testing Environment Emails')).toBeInTheDocument()
        expect(screen.getByText('Production Environment Emails')).toBeInTheDocument()
    })

    it('renders enable/disable toggle', async () => {
        render(<NotificationManagement />)

        await screen.findByText('Notification Management')

        expect(screen.getByText('Email Notifications')).toBeInTheDocument()
        // checkbox toggle
        const toggle = screen.getByRole('checkbox')
        expect(toggle).toBeChecked()
    })

    it('renders test notification section', async () => {
        render(<NotificationManagement />)

        await screen.findByText('Notification Management')

        expect(screen.getByText('Test Notification')).toBeInTheDocument()
        expect(screen.getByText('Send Test Email')).toBeInTheDocument()
    })

    it('shows loaded email addresses', async () => {
        render(<NotificationManagement />)

        expect(await screen.findByText('test@example.com')).toBeInTheDocument()
        expect(screen.getByText('prod@example.com')).toBeInTheDocument()
    })

    it('shows current environment info', async () => {
        render(<NotificationManagement />)

        await screen.findByText('Notification Management')

        expect(screen.getByText('Current Environment')).toBeInTheDocument()
    })
})
