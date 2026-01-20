# GoCart 開發進度與待辦事項

> 最後更新：2026年1月20日
> 目的：追蹤 Code Review 修復進度和待辦事項

---

## 📊 總體進度

| 類別 | 完成 | 進行中 | 未開始 |
|------|------|--------|--------|
| 測試基礎設施 | ✅ | | |
| CI/CD | ✅ | | |
| API 安全性 | | 🔄 | |
| 其他 Review 問題 | | | ⏳ |

---

## ✅ 已完成

### 1. 測試基礎設施
- [x] 安裝 Jest 和 Testing Library
- [x] 配置 `jest.config.js`
- [x] 配置 `jest.setup.js`
- [x] 創建 `__mocks__/next-server.js` (Next.js Response/Request mock)
- [x] 創建示例組件測試 (`Loading.test.jsx`)
- [x] 創建 API Route 測試 (`admin.test.js`)
- [x] 更新 `package.json` 添加 test scripts

### 2. CI/CD Pipeline
- [x] 創建 `.github/workflows/ci.yml`
- [x] 配置 test job (lint + test + coverage)
- [x] 配置 build job
- [x] 設置 Codecov 整合

### 3. 認證模塊
- [x] 創建 `lib/auth/server.js` (服務端認證工具)
- [x] 實現 `verifyIdToken()` 函數
- [x] 實現 `verifyAdminRequest()` 函數
- [x] 實現 Firebase Admin 單例初始化

### 4. API Route 修改
- [x] 更新 `/api/admin/invite` 添加認證檢查
- [x] 更新 `/api/admin/remote-config` POST 添加認證檢查

---

## 🔄 進行中

### 1. 測試 Mock 調試
**問題**: `__resetMockAuthResult is not a function`

**可能原因**:
1. Jest moduleNameMapper 優先順序問題
2. next/jest 覆蓋自定義配置
3. ESM/CommonJS 混合問題

**下一步**:
1. 檢查 `jest.config.js` 中 moduleNameMapper 順序
2. 嘗試用 `jest.mock()` 手動 mock
3. 或者改用 `jest.doMock()` 在 `beforeEach` 中

**相關檔案**:
- `__mocks__/lib/auth/server.js`
- `__tests__/api/admin.test.js`
- `jest.config.js`

### 2. 前端認證整合
**需要做**:
- 在 admin 頁面調用 API 時添加 Authorization header
- 從 Firebase Auth 獲取 ID token
- 處理 401/403 錯誤

---

## ⏳ 未開始 (根據 CODE_REVIEW_REPORT.md)

### 🔴 高優先級

#### 1. Firebase Admin SDK 單例優化
**問題**: 每個 API route 可能重複初始化
**解決方案**: 確保所有 route 使用 `lib/auth/server.js` 的單例

**涉及檔案**:
- `app/api/admin/remote-config/route.js`
- `app/api/notifications/send/route.js`

#### 2. 敏感資料過濾
**問題**: API 可能返回過多用戶資料
**解決方案**: 創建 DTO/sanitizer 函數

**涉及檔案**:
- 所有返回用戶資料的 API

#### 3. 其他 Admin API 認證
**需要添加認證的 API**:
- [ ] `/api/notifications/send`
- [ ] 其他 admin-only endpoints

### 🟡 中優先級

#### 4. 輸入驗證
**問題**: 缺乏統一的輸入驗證
**解決方案**: 使用 Zod 或 Yup 進行 schema 驗證

**步驟**:
1. 安裝 Zod: `npm install zod`
2. 為每個 API 創建 schema
3. 在 handler 開頭驗證

#### 5. Error Handling 統一
**問題**: 錯誤處理方式不一致
**解決方案**: 創建統一的 error handler

```javascript
// lib/api/errorHandler.js
export function handleApiError(error) {
    console.error(error)
    if (error.code === 'permission-denied') {
        return NextResponse.json({ error: '權限不足' }, { status: 403 })
    }
    // ...
}
```

#### 6. Rate Limiting
**問題**: API 沒有速率限制
**解決方案**: 使用 `@upstash/ratelimit` 或類似庫

### 🟢 低優先級

#### 7. 代碼重複清理
- 提取共用的 Firebase 查詢邏輯
- 創建共用的 UI 組件

#### 8. TypeScript 遷移
- 逐步將 `.js/.jsx` 改為 `.ts/.tsx`
- 添加類型定義

#### 9. Console.log 清理
- 搜索並移除所有 `console.log`
- 改用 proper logging library

---

## 📁 重要檔案參考

### 測試相關
```
gocart/
├── jest.config.js           # Jest 主配置
├── jest.setup.js             # 測試全局設置
├── __mocks__/
│   ├── next-server.js        # Next.js mock
│   └── lib/
│       └── auth/
│           └── server.js     # 認證 mock
└── __tests__/
    ├── api/
    │   └── admin.test.js     # API 測試
    └── components/
        └── Loading.test.jsx  # 組件測試
```

### 認證相關
```
gocart/
├── lib/
│   └── auth/
│       └── server.js         # 服務端認證工具
└── app/
    └── api/
        └── admin/
            ├── invite/
            │   └── route.js  # 已添加認證
            └── remote-config/
                └── route.js  # 已添加認證
```

### CI/CD
```
gocart/
└── .github/
    └── workflows/
        └── ci.yml            # GitHub Actions 工作流程
```

---

## 🔧 調試命令

### 運行所有測試
```bash
npm test
```

### 運行特定測試
```bash
npm test -- --testPathPatterns="admin"
```

### 運行測試並查看覆蓋率
```bash
npm run test:coverage
```

### 監聽模式
```bash
npm run test:watch
```

---

## 📝 下次繼續的步驟

1. **修復 Mock 問題**
   - 打開 `__tests__/api/admin.test.js`
   - 嘗試用 `jest.mock('@/lib/auth/server', () => require('../../__mocks__/lib/auth/server'))` 
   - 運行 `npm test` 確認

2. **驗證認證功能**
   - 確保所有 12 個測試通過
   - 特別是 6 個安全性測試

3. **前端整合**
   - 更新 admin 頁面的 API 調用
   - 添加 Authorization header

4. **繼續其他 Review 問題**
   - 按優先級處理 CODE_REVIEW_REPORT.md 中的問題

---

## 📚 相關文檔

- [CODE_REVIEW_REPORT.md](../CODE_REVIEW_REPORT.md) - 完整代碼審查報告
- [SESSION_LOG.md](./SESSION_LOG.md) - 詳細對話記錄
- [README.md](../README.md) - 項目說明
