/**
 * Jest Setup - Firebase Emulator 測試
 * 
 * 為 Emulator 測試設置環境
 */

// Polyfill for fetch (Node.js 18+ has native fetch, but just in case)
if (typeof global.fetch === 'undefined') {
    global.fetch = require('node-fetch');
}

// 設置測試超時
jest.setTimeout(30000);

// 抑制 Firebase 警告
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
    console.warn = (...args) => {
        const message = args[0]?.toString() || '';
        if (!message.includes('Firebase') && !message.includes('⚠️')) {
            originalWarn(...args);
        }
    };
    console.error = (...args) => {
        const message = args[0]?.toString() || '';
        if (!message.includes('Firebase') && !message.includes('❌')) {
            originalError(...args);
        }
    };
});

afterAll(() => {
    console.warn = originalWarn;
    console.error = originalError;
});
