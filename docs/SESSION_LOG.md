# GoCart 開發會話記錄

> 記錄日期：2026年1月20日
> 目的：記錄 Code Review 和 Testing 設置的完整對話歷史

---

## 1. 綜合代碼審查要求

### 用戶要求
用戶要求對整個 codebase 進行全面審查，識別潛在問題和改進建議。

### 執行方式
啟動 3 個 subagent 並行分析：
- **Agent 1**: 分析 `app/` 目錄 (API Routes, Pages, Layouts)
- **Agent 2**: 分析 `components/` 目錄 (React Components)
- **Agent 3**: 分析 `lib/` 目錄 (Services, Config, Firebase)

### 產出
生成了 `CODE_REVIEW_REPORT.md`，識別出以下主要問題：

#### 🔴 高優先級問題
1. **API Routes 缺乏認證** - Admin API 沒有驗證用戶身份
2. **Firebase Admin SDK 初始化問題** - 每次請求都重新初始化
3. **敏感資料暴露** - API 返回過多用戶資料

#### 🟡 中優先級問題
4. 缺乏輸入驗證和 sanitization
5. Error handling 不一致
6. 沒有 rate limiting

#### 🟢 低優先級問題
7. 代碼重複
8. 缺少 TypeScript
9. Console.log 殘留

---

## 2. 測試基礎設施設置

### 用戶要求
設置 Jest 測試環境，配合 GitHub Actions CI/CD，用於 merge to main 時的自動化測試。

### 完成的工作

#### 2.1 安裝測試依賴
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

#### 2.2 創建 Jest 配置
**檔案**: `jest.config.js`
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
    dir: './',
})

const customJestConfig = {
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^next/server$': '<rootDir>/__mocks__/next-server.js',
    },
    testMatch: [
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)+(spec|test).[jt]s?(x)'
    ],
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/.next/',
        '<rootDir>/functions/',
    ],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
}

module.exports = createJestConfig(customJestConfig)
```

#### 2.3 創建 Jest Setup
**檔案**: `jest.setup.js`
```javascript
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}))

// Mock Firebase
jest.mock('@/lib/firebase/config', () => ({
    app: {},
    db: {},
    auth: {},
    storage: {},
}))
```

#### 2.4 創建 Next.js Server Mock
**檔案**: `__mocks__/next-server.js`
```javascript
class NextResponse extends Response {
    static json(body, init = {}) {
        return new Response(JSON.stringify(body), {
            ...init,
            headers: { 'Content-Type': 'application/json', ...init.headers }
        })
    }
    static redirect(url, status = 307) {
        return new Response(null, { status, headers: { Location: url.toString() } })
    }
}

class NextRequest extends Request {
    constructor(input, init) {
        super(input, init)
        this.nextUrl = new URL(typeof input === 'string' ? input : input.url)
    }
}

module.exports = { NextResponse, NextRequest }
```

#### 2.5 創建示例測試
**檔案**: `__tests__/components/Loading.test.jsx`
- 測試 Loading 組件渲染
- 2 個測試通過

**檔案**: `__tests__/api/admin.test.js`
- 測試 Admin Invite API
- 測試 Remote Config API
- 測試驗證邏輯和功能

#### 2.6 更新 package.json
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 3. GitHub Actions CI/CD 設置

### 創建的工作流程
**檔案**: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
        if: github.event_name == 'push'

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

---

## 4. API Routes 安全性修復

### 問題
Admin API routes (`/api/admin/*`) 沒有任何認證檢查，任何人都可以調用。

### 解決方案

#### 4.1 創建認證工具
**檔案**: `lib/auth/server.js`
```javascript
import admin from 'firebase-admin'

// 初始化 Firebase Admin (單例模式)
function getFirebaseAdmin() {
    if (admin.apps.length === 0) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}')
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        })
    }
    return admin
}

// 驗證 ID Token
export async function verifyIdToken(token) {
    try {
        const adminInstance = getFirebaseAdmin()
        const decodedToken = await adminInstance.auth().verifyIdToken(token)
        return { success: true, user: decodedToken }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

// 驗證 Admin 請求
export async function verifyAdminRequest(request) {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
        return { success: false, error: '未提供認證 token', status: 401 }
    }
    
    const token = authHeader.split('Bearer ')[1]
    const result = await verifyIdToken(token)
    
    if (!result.success) {
        return { success: false, error: '認證失敗', status: 401 }
    }
    
    // 檢查 isAdmin
    const adminInstance = getFirebaseAdmin()
    const userDoc = await adminInstance.firestore()
        .collection('users')
        .doc(result.user.uid)
        .get()
    
    if (!userDoc.exists || !userDoc.data()?.isAdmin) {
        return { success: false, error: '需要管理員權限', status: 403 }
    }
    
    return { success: true, user: { ...result.user, isAdmin: true } }
}
```

#### 4.2 更新 API Routes
**修改的檔案**:
- `app/api/admin/invite/route.js` - 添加認證檢查
- `app/api/admin/remote-config/route.js` - POST 添加認證檢查

**修改方式**:
```javascript
import { verifyAdminRequest } from '@/lib/auth/server'

export async function POST(request) {
    // 驗證 admin 權限
    const authResult = await verifyAdminRequest(request)
    if (!authResult.success) {
        return NextResponse.json(
            { error: authResult.error },
            { status: authResult.status }
        )
    }
    
    // ... 原有邏輯
}
```

---

## 5. 測試 Mock 設置

### 創建的 Mock 檔案
**檔案**: `__mocks__/lib/auth/server.js`

用於測試時模擬認證結果，支援：
- `__setMockAuthResult()` - 設置 mock 認證結果
- `__resetMockAuthResult()` - 重置為預設 (401)
- `verifyAdminRequest()` - 返回 mock 結果

### 測試場景
1. 沒有 Authorization header → 401
2. Token 無效 → 401
3. 用戶非 admin → 403
4. 有效 admin → 通過認證

---

## 6. 遇到的問題和解決方案

### 問題 1: Jest moduleNameMapper 與 next/jest 衝突
**症狀**: `__resetMockAuthResult is not a function`
**原因**: next/jest 可能覆蓋了 moduleNameMapper 設置
**狀態**: 進行中

### 問題 2: ESM vs CommonJS
**症狀**: Mock 文件用 ESM export，但 Jest 可能期望 CommonJS
**解決**: 將 mock 文件改為 CommonJS (`module.exports`)

---

## 7. 測試執行結果

### 最後一次運行 (進行中)
```
npm test -- --testPathPatterns="admin.test"
```

部分測試通過，認證 mock 仍在調試中。

---

## 附錄：創建/修改的檔案列表

### 新創建
- `jest.config.js`
- `jest.setup.js`
- `__mocks__/next-server.js`
- `__mocks__/lib/auth/server.js`
- `__tests__/api/admin.test.js`
- `__tests__/components/Loading.test.jsx`
- `.github/workflows/ci.yml`
- `lib/auth/server.js`
- `CODE_REVIEW_REPORT.md`

### 已修改
- `package.json` (添加 test scripts)
- `app/api/admin/invite/route.js` (添加認證)
- `app/api/admin/remote-config/route.js` (添加認證)
