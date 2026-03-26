// ============================================
// Fix Next.js 16 RangeError: Maximum call stack size exceeded
// require('next/jest') 會載入 unhandled-rejection.tsx，佢會：
// 1. 加一個 unhandledRejection listener（呼叫 patched setImmediate → 無限遞歸）
// 2. Patch process.removeAllListeners / process.on / process.addListener
// 但 process.removeListener 冇被 patch，可以用嚟移除 listener。
// 必須喺呢度做，因為 setupFilesAfterEnv 已經太遲。
// ============================================
process.env.NEXT_UNHANDLED_REJECTION_FILTER = 'silent'

const nextJest = require('next/jest')

// 移除 Next.js 的 unhandledRejection listener（佢會造成 setImmediate 無限遞歸）
const __nextListeners = process.rawListeners('unhandledRejection')
for (const __l of __nextListeners) {
    process.removeListener('unhandledRejection', __l)
}

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files
    dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
    // 設置測試環境
    testEnvironment: 'jest-environment-jsdom',
    
    // 設置路徑別名 (與 jsconfig.json 一致)
    moduleNameMapper: {
        // Mock next/server for API routes
        '^next/server$': '<rootDir>/__mocks__/next-server.js',
        // General path alias (catch-all)
        '^@/(.*)$': '<rootDir>/$1',
    },
    
    // 測試文件匹配模式 - 只匹配 .test.js 或 .spec.js 文件
    testMatch: [
        '**/__tests__/**/*.test.[jt]s?(x)',
        '**/__tests__/**/*.spec.[jt]s?(x)',
        '**/?(*.)+(spec|test).[jt]s?(x)'
    ],
    
    // 忽略的路徑 - Emulator 測試用專門的 config
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/.next/',
        '<rootDir>/functions/',
        '<rootDir>/__tests__/utils/',
        '<rootDir>/__tests__/emulator/',  // Emulator 測試用 jest.emulator.config.js
        '<rootDir>/e2e/',                 // E2E 測試用 Playwright
    ],
    
    // 測試超時設置（Emulator 測試可能需要更長時間）
    testTimeout: 10000,
    
    // 收集覆蓋率的文件
    collectCoverageFrom: [
        'app/**/*.{js,jsx}',
        'components/**/*.{js,jsx}',
        'lib/**/*.{js,jsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        // 排除 Firebase SDK wrappers — 呢啲文件用 Emulator 測試覆蓋，唔適合 unit test mock
        '!lib/firebase/**',
        // 排除靜態配置文件 — 無業務邏輯
        '!lib/config/colors.js',
        '!lib/config/themes.js',
        // 排除 Redux store 設定 — 組件測試間接覆蓋
        '!lib/store.js',
    ],
    
    // 設置測試前的全局配置
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    
    // 覆蓋率閾值 — 防止覆蓋率倒退
    // 排除 Firebase SDK wrappers 後，真實覆蓋率約 45-50%
    // 設 30% 作為底線，後續可逐步提高
    coverageThreshold: {
        global: {
            branches: 25,
            functions: 25,
            lines: 30,
            statements: 30,
        },
    },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
