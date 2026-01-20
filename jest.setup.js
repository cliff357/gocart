// Jest 測試環境設置
import '@testing-library/jest-dom'

// Polyfill for Next.js API Routes
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Request class with proper json method
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

// Mock Response class with static json method
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

// 清理 console 錯誤 (可選)
const originalError = console.error
beforeAll(() => {
    console.error = (...args) => {
        if (
            typeof args[0] === 'string' &&
            (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
             args[0].includes('RESEND_API_KEY not configured'))
        ) {
            return
        }
        originalError.call(console, ...args)
    }
})

afterAll(() => {
    console.error = originalError
})
