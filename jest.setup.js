// Jest 測試環境設置
import '@testing-library/jest-dom'

// Polyfill for Next.js API Routes & TextEncoder/TextDecoder
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Request class with proper json method (for API route testing)
global.Request = class Request {
    constructor(url, options = {}) {
        this.url = url
        this.method = options.method || 'GET'
        this.headers = new Map(Object.entries(options.headers || {}))
        this._body = options.body
    }

    async json() {
        if (!this._body) return {}
        return typeof this._body === 'string' ? JSON.parse(this._body) : this._body
    }

    async text() {
        return typeof this._body === 'string' ? this._body : JSON.stringify(this._body)
    }
}

// Mock Response class with static json method (for NextResponse.json())
global.Response = class Response {
    constructor(body, options = {}) {
        this._body = body
        this.status = options.status || 200
        this.statusText = options.statusText || ''
        this.ok = this.status >= 200 && this.status < 300
        this.headers = new Map(Object.entries(options.headers || {}))
    }

    async json() {
        if (!this._body) return {}
        return typeof this._body === 'string' ? JSON.parse(this._body) : this._body
    }

    async text() {
        return typeof this._body === 'string' ? this._body : JSON.stringify(this._body)
    }

    // Static json method for NextResponse.json()
    static json(data, options = {}) {
        const response = new Response(JSON.stringify(data), {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        })
        response._jsonData = data
        response.json = async () => data
        return response
    }
}

global.Headers = class Headers {
    constructor(init = {}) {
        this._headers = new Map()
        if (init) {
            Object.entries(init).forEach(([key, value]) => {
                this._headers.set(key.toLowerCase(), value)
            })
        }
    }
    get(name) { return this._headers.get(name.toLowerCase()) || null }
    set(name, value) { this._headers.set(name.toLowerCase(), value) }
    has(name) { return this._headers.has(name.toLowerCase()) }
    delete(name) { this._headers.delete(name.toLowerCase()) }
    forEach(callback) { this._headers.forEach(callback) }
}

// Polyfill for fetch (required by Firebase Auth in Node.js environment)
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
        ok: true,
        status: 200,
    })
)

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
}))

// Mock Firebase (避免真實 API 調用)
jest.mock('@/lib/firebase/config', () => ({
    auth: null,
    db: null,
    storage: null,
    isFirebaseInitialized: () => false,
}))

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

// Suppress Firebase/Firestore logging during tests
beforeAll(() => {
    console.log = (...args) => {
        const message = args[0]?.toString() || ''
        if (!message.includes('🔥') && !message.includes('Firestore') && !message.includes('Firebase')) {
            originalConsoleLog(...args)
        }
    }
    console.error = (...args) => {
        const message = args[0]?.toString() || ''
        if (
            !message.includes('Firebase') && 
            !message.includes('FirebaseError') &&
            !message.includes('FirestoreService') &&
            !message.includes('❌') && 
            !message.includes('💡') &&
            !message.includes('Warning: ReactDOM.render is no longer supported') &&
            !message.includes('RESEND_API_KEY not configured') &&
            !message.includes('Failed to load category') &&
            !message.includes('Failed to load categories') &&
            !message.includes('Error getting all categories')
        ) {
            originalConsoleError(...args)
        }
    }
    console.warn = (...args) => {
        const message = args[0]?.toString() || ''
        if (!message.includes('Firebase') && !message.includes('⚠️')) {
            originalConsoleWarn(...args)
        }
    }
})

afterAll(() => {
    console.log = originalConsoleLog
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
})

// Mock IntersectionObserver
class MockIntersectionObserver {
    constructor(callback) {
        this.callback = callback
    }
    observe() { return null }
    unobserve() { return null }
    disconnect() { return null }
}

global.IntersectionObserver = MockIntersectionObserver

// Mock ResizeObserver
class MockResizeObserver {
    observe() { return null }
    unobserve() { return null }
    disconnect() { return null }
}

global.ResizeObserver = MockResizeObserver
