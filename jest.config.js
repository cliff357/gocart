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
        // General path alias
        '^@/(.*)$': '<rootDir>/$1',
        // Mock next/server for API routes
        '^next/server$': '<rootDir>/__mocks__/next-server.js',
    },
    
    // 測試文件匹配模式
    testMatch: [
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)+(spec|test).[jt]s?(x)'
    ],
    
    // 忽略的路徑
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/.next/',
        '<rootDir>/functions/',
    ],
    
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
