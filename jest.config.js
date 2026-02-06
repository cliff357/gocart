const nextJest = require('next/jest')

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
    ],
    
    // 設置測試前的全局配置
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    
    // 覆蓋率閾值 (可選，之後可以逐步提高)
    // coverageThreshold: {
    //     global: {
    //         branches: 50,
    //         functions: 50,
    //         lines: 50,
    //         statements: 50,
    //     },
    // },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
