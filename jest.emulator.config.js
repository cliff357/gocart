/**
 * Jest 配置 - Firebase Emulator 測試
 * 
 * 這個配置用於運行連接到真實 Firebase Emulator 的整合測試
 * 不使用 mock，而是連接到本地 Emulator
 */

const nextJest = require('next/jest')

const createJestConfig = nextJest({
    dir: './',
})

const customJestConfig = {
    // 使用 Node 環境（不是 jsdom）因為這是整合測試
    testEnvironment: 'node',
    
    // 只運行 emulator 測試
    testMatch: [
        '**/__tests__/emulator/**/*.test.[jt]s?(x)',
    ],
    
    // 忽略的路徑
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/.next/',
    ],
    
    // 路徑別名（不包含 Firebase mock）
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    
    // 測試超時（Emulator 需要更長時間）
    testTimeout: 30000,
    
    // 設置文件
    setupFilesAfterEnv: ['<rootDir>/jest.emulator.setup.js'],
    
    // 序列運行（避免並發問題）
    maxWorkers: 1,
}

module.exports = createJestConfig(customJestConfig)
