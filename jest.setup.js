// Jest 測試環境設置
import '@testing-library/jest-dom'

// Polyfill for TextEncoder/TextDecoder
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Polyfill for fetch (required by Firebase Auth in Node.js environment)
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
        ok: true,
        status: 200,
    })
)
global.Headers = jest.fn()
global.Request = jest.fn()
global.Response = jest.fn()

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

// Suppress Firebase/Firestore logging during tests
beforeAll(() => {
    console.log = (...args) => {
        const message = args[0]?.toString() || ''
        // Suppress Firestore and Firebase logs
        if (!message.includes('🔥') && !message.includes('Firestore') && !message.includes('Firebase')) {
            originalConsoleLog(...args)
        }
    }
    console.error = (...args) => {
        const message = args[0]?.toString() || ''
        // Suppress Firebase configuration warnings during tests
        if (!message.includes('Firebase') && !message.includes('❌') && !message.includes('💡')) {
            originalConsoleError(...args)
        }
    }
    console.warn = (...args) => {
        const message = args[0]?.toString() || ''
        // Suppress Firebase configuration warnings
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
