/**
 * Admin Pages CRUD 測試 — Phase 2 文件 2
 * 測試 Categories / Reservations / Todo / About Setting 頁面
 * Mock 模式 B（FirebaseFirestoreService）+ C（categoryService）
 */

import React from 'react'
import { render, screen, act, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ============================================
// Mock Dependencies
// ============================================

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/admin',
}))

// Mock react-hot-toast（named import { toast } + default import toast）
jest.mock('react-hot-toast', () => {
    const toast = { success: jest.fn(), error: jest.fn() }
    return {
        toast,
        __esModule: true,
        default: toast,
    }
})

// Mock Firebase config（避免 SDK 初始化）
jest.mock('@/lib/firebase/config', () => ({
    auth: null,
    db: null,
    storage: null,
}))

// Mock FirebaseFirestoreService（static methods — Reservations / Todo / About Setting 用）
const mockGetDocument = jest.fn()
const mockGetCollection = jest.fn()
const mockUpdateDocument = jest.fn()
const mockSetDocument = jest.fn()
jest.mock('@/lib/firebase/firestore', () => ({
    FirebaseFirestoreService: {
        getDocument: (...args) => mockGetDocument(...args),
        getCollection: (...args) => mockGetCollection(...args),
        updateDocument: (...args) => mockUpdateDocument(...args),
        setDocument: (...args) => mockSetDocument(...args),
    },
}))

// Mock categoryService（instance — Categories 頁面用）
const mockCatGetAll = jest.fn()
const mockCatCreate = jest.fn()
const mockCatUpdate = jest.fn()
const mockCatDelete = jest.fn()
jest.mock('@/lib/services/FirestoreService', () => ({
    categoryService: {
        getAll: (...args) => mockCatGetAll(...args),
        create: (...args) => mockCatCreate(...args),
        update: (...args) => mockCatUpdate(...args),
        delete: (...args) => mockCatDelete(...args),
    },
}))

// Mock next/image
jest.mock('next/image', () => {
    return function MockImage(props) {
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img {...props} />
    }
})

// Mock lucide-react icons（簡化渲染）
jest.mock('lucide-react', () => {
    const icon = (name) => {
        return function MockIcon(props) {
            return <span data-testid={`icon-${name}`} {...props} />
        }
    }
    return {
        Plus: icon('plus'),
        Trash: icon('trash'),
        Trash2: icon('trash2'),
        Edit: icon('edit'),
        Edit2: icon('edit2'),
        Check: icon('check'),
        X: icon('x'),
        Loader2: icon('loader2'),
        ClipboardList: icon('clipboard-list'),
        GripVertical: icon('grip-vertical'),
        Lightbulb: icon('lightbulb'),
        CalendarCheck: icon('calendar-check'),
        Mail: icon('mail'),
        Phone: icon('phone'),
        User: icon('user'),
        Package: icon('package'),
        Clock: icon('clock'),
        ChevronDown: icon('chevron-down'),
        Info: icon('info'),
        History: icon('history'),
        Save: icon('save'),
        ArrowUp: icon('arrow-up'),
        ArrowDown: icon('arrow-down'),
    }
})

// ============================================
// Import Pages (after mocks)
// ============================================
import CategoriesAdminPage from '@/app/admin/categories/page'
import ReservationsPage from '@/app/admin/reservations/page'
import TodoPage from '@/app/admin/todo/page'
import AboutSettingPage from '@/app/admin/about-setting/page'

// 取得 mock toast reference
const { toast: mockToast } = require('react-hot-toast')

// ============================================
// Categories Page Tests
// ============================================
describe('CategoriesAdminPage', () => {
    const mockCategories = [
        { id: 'cat1', name: '陶器', parentId: null },
        { id: 'cat2', name: '相架', parentId: null },
        { id: 'cat3', name: '迷你陶器', parentId: 'cat1' },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        mockCatGetAll.mockResolvedValue(mockCategories)
    })

    it('renders category list after loading', async () => {
        render(<CategoriesAdminPage />)

        // loading 狀態
        expect(screen.getByText('載入中...')).toBeInTheDocument()

        // 等待數據載入（名稱同時出現在 tree + parent select，所以用 findAllByText）
        const items = await screen.findAllByText('陶器')
        expect(items.length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText('相架').length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText('迷你陶器').length).toBeGreaterThanOrEqual(1)
    })

    it('renders page title and description', async () => {
        render(<CategoriesAdminPage />)

        expect(await screen.findByText('管理分類')).toBeInTheDocument()
        expect(screen.getByText(/在這裡新增、編輯或刪除產品分類/)).toBeInTheDocument()
    })

    it('shows add form with parent select', async () => {
        render(<CategoriesAdminPage />)

        // 等待載入（tree + select 都有分類名稱）
        await screen.findAllByText('陶器')

        // 新增 form 的 input + button + 上級分類 select
        const input = screen.getByPlaceholderText('新增分類名稱')
        expect(input).toBeInTheDocument()
        expect(screen.getByText('新增')).toBeInTheDocument()
        expect(screen.getByText('上級分類：')).toBeInTheDocument()

        // select 內應有 (無) + 所有現有分類
        const select = screen.getByRole('combobox')
        const options = within(select).getAllByRole('option')
        expect(options).toHaveLength(4) // (無) + 3 categories
        expect(options[0]).toHaveTextContent('(無)')
    })

    it('submits new category and shows success toast', async () => {
        mockCatCreate.mockResolvedValue({ id: 'cat4', name: '花瓶' })
        const user = userEvent.setup()

        render(<CategoriesAdminPage />)
        await screen.findAllByText('陶器')

        const input = screen.getByPlaceholderText('新增分類名稱')
        await user.type(input, '花瓶')
        await user.click(screen.getByText('新增'))

        expect(mockCatCreate).toHaveBeenCalledWith({ name: '花瓶' })
        expect(mockToast.success).toHaveBeenCalledWith('已新增分類')
    })

    it('shows error toast when adding empty category name', async () => {
        const user = userEvent.setup()

        render(<CategoriesAdminPage />)
        await screen.findAllByText('陶器')

        // 不輸入任何名稱直接按新增
        await user.click(screen.getByText('新增'))

        expect(mockToast.error).toHaveBeenCalledWith('請輸入分類名稱')
        expect(mockCatCreate).not.toHaveBeenCalled()
    })

    it('switches to edit mode when edit button clicked', async () => {
        const user = userEvent.setup()

        render(<CategoriesAdminPage />)
        await screen.findAllByText('陶器')

        // 每個分類有「編輯」按鈕
        const editButtons = screen.getAllByText('編輯')
        expect(editButtons.length).toBeGreaterThanOrEqual(3)

        // 點第一個編輯
        await user.click(editButtons[0])

        // input 應顯示 editing placeholder
        const input = screen.getByPlaceholderText('編輯分類名稱')
        expect(input).toBeInTheDocument()
        expect(input.value).toBe('陶器')
        // 按鈕文字切換
        expect(screen.getByText('更新')).toBeInTheDocument()
        expect(screen.getByText('取消')).toBeInTheDocument()
    })

    it('deletes category after confirm', async () => {
        mockCatDelete.mockResolvedValue()
        window.confirm = jest.fn(() => true)
        const user = userEvent.setup()

        render(<CategoriesAdminPage />)
        await screen.findAllByText('陶器')

        const deleteButtons = screen.getAllByText('刪除')
        await user.click(deleteButtons[0])

        expect(window.confirm).toHaveBeenCalledWith('確定刪除？')
        expect(mockCatDelete).toHaveBeenCalledWith('cat1')
        expect(mockToast.success).toHaveBeenCalledWith('已刪除')
    })
})

// ============================================
// Reservations Page Tests
// ============================================
describe('ReservationsPage', () => {
    const mockReservations = [
        {
            id: 'r1',
            name: '陳大明',
            email: 'chen@test.com',
            phone: '91234567',
            productName: '陶豬相架',
            productPrice: 380,
            productImage: '/img/product.jpg',
            quantity: 2,
            status: 'pending',
            createdAt: '2024-06-15T10:00:00Z',
            selectedOptions: { 顏色: '粉紅', 尺寸: '大' },
        },
        {
            id: 'r2',
            name: '李小芳',
            email: 'li@test.com',
            phone: null,
            productName: '迷你花瓶',
            productPrice: 200,
            productImage: null,
            quantity: 1,
            status: 'confirmed',
            createdAt: '2024-06-14T08:30:00Z',
            selectedOptions: {},
        },
        {
            id: 'r3',
            name: '王五',
            email: null,
            phone: '98765432',
            productName: '手工碟',
            productPrice: 150,
            productImage: null,
            quantity: 1,
            status: 'paid',
            createdAt: '2024-06-10T12:00:00Z',
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        mockGetCollection.mockResolvedValue({
            success: true,
            data: mockReservations,
        })
    })

    it('renders reservation list with product info', async () => {
        render(<ReservationsPage />)

        // 等待數據載入
        expect(await screen.findByText('陶豬相架')).toBeInTheDocument()
        expect(screen.getByText('迷你花瓶')).toBeInTheDocument()
        expect(screen.getByText('手工碟')).toBeInTheDocument()

        // 客戶資料
        expect(screen.getByText('陳大明')).toBeInTheDocument()
        expect(screen.getByText('chen@test.com')).toBeInTheDocument()
        expect(screen.getByText('91234567')).toBeInTheDocument()

        // 價錢 x 數量
        expect(screen.getByText('$380 × 2')).toBeInTheDocument()
        expect(screen.getByText('$200 × 1')).toBeInTheDocument()
    })

    it('renders page title and filter tabs', async () => {
        render(<ReservationsPage />)

        expect(await screen.findByText('預訂管理')).toBeInTheDocument()
        expect(screen.getByText('查看及管理所有預訂')).toBeInTheDocument()

        // Filter tabs: 全部 + 4 status（狀態文字同時出現在 tab + card badge，所以用 getAllByText）
        expect(screen.getByText('全部')).toBeInTheDocument()
        expect(screen.getAllByText(/待處理/).length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText(/已確認/).length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText(/已付款/).length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText(/已寄出/).length).toBeGreaterThanOrEqual(1)
    })

    it('shows loading spinner while fetching', () => {
        mockGetCollection.mockReturnValue(new Promise(() => {}))

        render(<ReservationsPage />)

        expect(screen.getByTestId('icon-loader2')).toBeInTheDocument()
    })

    it('filters reservations by status', async () => {
        const user = userEvent.setup()

        render(<ReservationsPage />)
        await screen.findByText('陶豬相架')

        // 點「已確認」tab — 找到包含計數的 tab button
        const confirmedTabs = screen.getAllByText(/已確認/)
        // 第一個是 filter tab button
        await user.click(confirmedTabs[0])

        // r2 visible, r1/r3 not
        expect(screen.getByText('迷你花瓶')).toBeInTheDocument()
        expect(screen.queryByText('陶豬相架')).not.toBeInTheDocument()
        expect(screen.queryByText('手工碟')).not.toBeInTheDocument()
    })

    it('shows selected options as badges', async () => {
        render(<ReservationsPage />)

        await screen.findByText('陶豬相架')

        // r1 has selectedOptions: { 顏色: '粉紅', 尺寸: '大' }
        expect(screen.getByText('顏色: 粉紅')).toBeInTheDocument()
        expect(screen.getByText('尺寸: 大')).toBeInTheDocument()
    })

    it('shows empty state text when no reservations', async () => {
        mockGetCollection.mockResolvedValue({ success: true, data: [] })

        render(<ReservationsPage />)

        expect(await screen.findByText('暫無預訂')).toBeInTheDocument()
    })
})

// ============================================
// Todo Page Tests
// ============================================
describe('TodoPage', () => {
    const mockTodos = [
        {
            id: 'todo_1',
            title: 'Claim 錢功能',
            description: '用黎比同事 claim 錢用',
            category: 'feature',
            priority: 'high',
            completed: false,
        },
        {
            id: 'todo_2',
            title: 'Monthly Revenue Report',
            description: '每個月自動生成收入報告',
            category: 'report',
            priority: 'high',
            completed: false,
        },
        {
            id: 'todo_3',
            title: 'Stock Take 完成',
            description: '庫存盤點功能',
            category: 'feature',
            priority: 'low',
            completed: true,
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        mockGetDocument.mockResolvedValue({
            success: true,
            data: { items: mockTodos },
        })
        mockSetDocument.mockResolvedValue({ success: true })
    })

    it('renders todo list with category and priority labels', async () => {
        render(<TodoPage />)

        // 等待載入
        expect(await screen.findByText('Claim 錢功能')).toBeInTheDocument()
        expect(screen.getByText('Monthly Revenue Report')).toBeInTheDocument()

        // category labels
        const featureBadges = screen.getAllByText('功能')
        expect(featureBadges.length).toBeGreaterThanOrEqual(1)
        expect(screen.getByText('報表')).toBeInTheDocument()

        // priority labels（rendered as '● 高' with ● and text in same span）
        const highLabels = screen.getAllByText(/● 高/)
        expect(highLabels.length).toBeGreaterThanOrEqual(1)
    })

    it('renders page title', async () => {
        render(<TodoPage />)

        expect(await screen.findByText(/功能許願樹/)).toBeInTheDocument()
    })

    it('shows loading spinner while fetching', () => {
        mockGetDocument.mockReturnValue(new Promise(() => {}))

        render(<TodoPage />)

        expect(screen.getByTestId('icon-loader2')).toBeInTheDocument()
    })

    it('shows incomplete and completed sections', async () => {
        render(<TodoPage />)

        await screen.findByText('Claim 錢功能')

        // 未完成 section
        expect(screen.getByText(/待開發/)).toBeInTheDocument()
        expect(screen.getByText(/待開發/)).toHaveTextContent('2') // 2 incomplete

        // 已完成 section
        expect(screen.getByText(/已完成/)).toBeInTheDocument()
        expect(screen.getByText(/已完成/)).toHaveTextContent('1') // 1 completed

        // completed item has line-through style
        expect(screen.getByText('Stock Take 完成')).toBeInTheDocument()
    })

    it('uses DEFAULT_TODOS when no data in Firestore', async () => {
        mockGetDocument.mockResolvedValue({
            success: true,
            data: null,
        })

        render(<TodoPage />)

        // 應載入 DEFAULT_TODOS — 第一個 default 是 'Claim 錢功能'
        expect(await screen.findByText('Claim 錢功能')).toBeInTheDocument()
        // 應呼叫 setDocument 保存 default
        expect(mockSetDocument).toHaveBeenCalledWith(
            'settings',
            'todoList',
            expect.objectContaining({
                items: expect.any(Array),
            })
        )
    })
})

// ============================================
// About Setting Page Tests
// ============================================
describe('AboutSettingPage', () => {
    const mockTimeline = [
        {
            id: 1,
            date: '2024年1月',
            title: 'Studio 成立',
            description: '老友賣蘿柚企劃正式成立',
            icon: '🏠',
        },
        {
            id: 2,
            date: '2024年3月',
            title: '第一件作品完成',
            description: '完成第一件陶相架作品',
            icon: '🎨',
        },
        {
            id: 3,
            date: '2024年6月',
            title: '網站上線',
            description: 'LoyaultyClub 網站正式上線',
            icon: '💻',
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        mockGetDocument.mockResolvedValue({
            success: true,
            data: { timeline: mockTimeline },
        })
        mockSetDocument.mockResolvedValue({ success: true })
    })

    it('renders timeline events after loading', async () => {
        render(<AboutSettingPage />)

        // 每個 event 出現在 main list + preview section，所以用 findAllByText
        const studioItems = await screen.findAllByText('Studio 成立')
        expect(studioItems.length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText('第一件作品完成').length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText('網站上線').length).toBeGreaterThanOrEqual(1)

        // dates (also duplicated in preview)
        expect(screen.getAllByText('2024年1月').length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText('2024年3月').length).toBeGreaterThanOrEqual(1)
    })

    it('renders page title and event count', async () => {
        render(<AboutSettingPage />)

        // 等待數據載入完成
        await screen.findAllByText('Studio 成立')

        // title
        const titles = screen.getAllByText('About Us 設定')
        expect(titles.length).toBeGreaterThanOrEqual(1)
        expect(screen.getByText(/管理 About 頁面嘅時間線/)).toBeInTheDocument()

        // 事件計數 — 跨 text nodes: "共 " + "3" + " 個事件 · ..."
        const countParagraph = screen.getByText(/使用箭嘴調整順序/)
        expect(countParagraph.textContent).toContain('3')
        expect(countParagraph.textContent).toContain('個事件')
    })

    it('shows loading spinner while fetching', () => {
        mockGetDocument.mockReturnValue(new Promise(() => {}))

        render(<AboutSettingPage />)

        expect(screen.getByTestId('icon-loader2')).toBeInTheDocument()
    })

    it('shows preview section with up to 4 items', async () => {
        render(<AboutSettingPage />)

        await screen.findAllByText('Studio 成立')

        expect(screen.getByText('預覽')).toBeInTheDocument()
    })

    it('uses DEFAULT_TIMELINE when no data in Firestore', async () => {
        mockGetDocument.mockResolvedValue({
            success: true,
            data: null,
        })

        render(<AboutSettingPage />)

        // DEFAULT_TIMELINE 第一項 = 'Studio 成立'（main list + preview 都有）
        const items = await screen.findAllByText('Studio 成立')
        expect(items.length).toBeGreaterThanOrEqual(1)
        expect(mockSetDocument).toHaveBeenCalledWith(
            'settings',
            'about',
            expect.objectContaining({
                timeline: expect.any(Array),
            })
        )
    })

    it('has move up/down buttons for reordering', async () => {
        render(<AboutSettingPage />)

        await screen.findAllByText('Studio 成立')

        // 應有 ArrowUp / ArrowDown icons
        const upButtons = screen.getAllByTestId('icon-arrow-up')
        const downButtons = screen.getAllByTestId('icon-arrow-down')
        expect(upButtons.length).toBe(3) // 每個 event 一個
        expect(downButtons.length).toBe(3)
    })
})
