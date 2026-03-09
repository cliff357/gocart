# 🧪 LoyaultyClub 測試文檔

> 📅 創建日期：2026年2月5日  
> 📅 最後更新：2026年3月3日  
> 👤 負責人：SA Team  
> 📦 項目：LoyaultyClub (老友賣蘿柚企劃)

---

## 🚨 開發守則（新 AI / 新電腦必讀）

> **任何新代碼，必須附帶對應的測試，否則不能 merge。**  
> 以下是本項目的所有約定規則，新的 AI 或開發者在動手前務必完整閱讀。

### 一、項目技術棧

| 技術 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.1.6 | 前端框架（App Router） |
| React | 19.x | UI 組件 |
| Redux Toolkit | 2.8.x | 狀態管理（3 slices：cart、product、address） |
| Firebase | 12.x | Auth、Firestore、Storage |
| Tailwind CSS | 4.x | 樣式 |
| Jest | 30.x | 單元 / 整合測試 |
| @testing-library/react | — | 組件測試 |
| Playwright | 1.58.x | E2E 端到端測試 |
| @firebase/rules-unit-testing | 5.x | Firebase Security Rules 測試 |

### 二、Git 分支策略

```
feature/* ──→ dev ──→ main
```

| 分支 | 用途 | 規則 |
|------|------|------|
| `main` | 正式版本 | 只從 dev merge，不直接 push |
| `dev` | 開發整合 | 功能完成後 merge 到此 |
| `feature/*` | 功能開發 | 從 dev 開出，完成後 PR merge 回 dev |
| `add_cicd_test` | CI/CD（歷史） | 已 merge |

**Commit 訊息格式**：`feat:` / `fix:` / `docs:` / `test:` / `refactor:`

### 三、測試分層與規則

本項目採用**測試金字塔**策略，分為 4 個優先級：

```
          ╱╲
         ╱ P4 ╲     E2E 端到端 (Playwright)       — 52 tests
        ╱──────╲
       ╱  P3    ╲    API / Service / Admin         — 33 tests
      ╱──────────╲
     ╱    P2      ╲   Redux Slice / State          — 11 tests
    ╱──────────────╲
   ╱      P1        ╲  UI 組件渲染 + 交互          — 55 tests
  ╱──────────────────╲
 ╱   P0 (Emulator)    ╲ Security Rules + CRUD      — 52 tests
╱────────────────────────╲
```

### 四、寫新代碼時的測試要求

#### 📦 新增 React 組件

| 必須測試 | 範例 |
|----------|------|
| 組件可以渲染（不 crash） | `render(<MyComponent />)` |
| 顯示正確的文字 / 內容 | `expect(screen.getByText('...')).toBeVisible()` |
| 用戶互動（如有按鈕、輸入框） | `await userEvent.click(...)` |
| Props 的預設值和自定義值 | 分別測 default 和自定義 |
| 條件渲染（如有 if/ternary） | 分別測 true 和 false |

**文件命名**：`__tests__/components/xxxx.test.jsx`  
**必須使用 `renderWithProviders`**（來自 `test-utils.js`）如果組件用到 Redux  
**Mock 規則**：
- `next/navigation` → 用 `jest.mock('next/navigation', ...)`
- `next/image` → 自動轉 `<img>` （已在 jest.config.js 設定）
- `navigator.clipboard` → `Object.assign(navigator, { clipboard: { writeText: jest.fn() } })`
- `react-hot-toast` → `jest.mock('react-hot-toast', ...)`

#### 🔧 新增 / 修改 Redux Slice

| 必須測試 | 範例 |
|----------|------|
| 初始狀態正確 | `reducer(undefined, { type: 'unknown' })` |
| 每一個 action（reducer） | `reducer(state, actionCreator(payload))` |
| Async Thunk 的 3 個狀態 | `pending` / `fulfilled` / `rejected` |
| 邊界情況 | 空 payload、不存在的 item、重複操作 |

**文件命名**：`__tests__/lib/xxxx.test.js`  
**直接 import reducer 和 action**，不需要 render

#### 🌐 新增 / 修改 API Service

| 必須測試 | 範例 |
|----------|------|
| 成功返回正確格式 | `{ success: true, data: ... }` |
| 錯誤返回正確格式 | `{ success: false, error: '...' }` |
| 不存在的資源返回錯誤 | ID 不存在時 |
| 未實現的方法返回提示 | `'Not implemented - connect to real API'` |

**文件命名**：`__tests__/lib/xxxx.test.js`  
**必須用 Fake Timers**（因為 ApiService 有 `simulateDelay`）：
```javascript
beforeEach(() => { jest.useFakeTimers(); });
afterEach(() => { jest.useRealTimers(); });

// 包裝 async call
const runWithTimers = async (promise) => {
    const result = promise;
    await jest.runAllTimersAsync();
    return result;
};
```

#### 🔒 修改 Firestore Security Rules (`firestore.rules`)

| 必須測試 | 範例 |
|----------|------|
| 允許的操作確實允許 | `assertSucceeds(...)` |
| 拒絕的操作確實拒絕 | `assertFails(...)` |
| Admin 權限 | 用 `role: 'admin'` 的 custom claims |
| Owner 權限 | 驗證 `isOwner()` 商店擁有權 |
| 數據驗證規則 | 如欄位必填檢查 |

**文件命名**：`__tests__/emulator/xxxx.test.js`  
**必須用 Emulator**：`npm run test:emulator`  
**Project ID**：`demo-loyaultyclub`（`demo-` 開頭，不需要真實密鑰）

#### 🖥️ 新增頁面 / 重大 UI 變更

| 必須測試 | 範例 |
|----------|------|
| 頁面可訪問（HTTP 200） | `expect(response.status()).toBe(200)` |
| 關鍵元素可見 | `await expect(page.getByText('...')).toBeVisible()` |
| 導航正確 | `await expect(page).toHaveURL(...)` |
| 響應式設計（如適用） | 測試 mobile (375px) 和 desktop (1280px) |

**文件命名**：`e2e/xxxx.spec.js`  
**框架**：Playwright + Chromium  
**注意事項**：
- 避免用不穩定的 text selector（如 regex 匹配到多個元素）
- 優先用 `getByRole`、`getByText({ exact: true })`
- Navbar 的 About / Contact 連結目前指向 `/`，不是獨立頁面

### 五、測試文件位置規則

```
新文件放哪裡？
│
├─ React 組件？     → __tests__/components/xxxx.test.jsx
├─ Redux Slice？    → __tests__/lib/xxxx.test.js
├─ API Service？    → __tests__/lib/xxxx.test.js
├─ Security Rules？ → __tests__/emulator/xxxx.test.js
├─ E2E 頁面流程？   → e2e/xxxx.spec.js
└─ 測試工具/Mock？  → __tests__/utils/
```

### 六、測試工具（test-utils.js）

`__tests__/utils/test-utils.js` 提供以下工具：

| 工具 | 用途 |
|------|------|
| `renderWithProviders(ui, options)` | 渲染組件時自動包裹 Redux Provider |
| `createTestStore(preloadedState)` | 創建測試用 Redux Store |
| `mockProduct` | 標準商品 mock 數據 |
| `mockUser` / `mockAdminUser` | 標準用戶 / 管理員 mock 數據 |
| `mockOrder` | 標準訂單 mock 數據 |
| `mockCoupon` / `mockExpiredCoupon` | 優惠券 mock 數據 |
| `mockAddress` | 地址 mock 數據 |
| `mockReservation` | 預約 mock 數據 |
| `waitForAsync()` | 等待 async 操作完成 |

> ⚠️ **統一用這裡的 mock 數據，不要在每個測試自己隨意捏造。** 如果需要新的 mock 資料類型，加到這個文件。

### 七、全局 Mock 設定（jest.setup.js）

以下 mock 已在 `jest.setup.js` 中全局設定，不需要在每個測試重複：

| Mock | 原因 |
|------|------|
| `fetch` | Firebase Auth 在 Node.js 需要 |
| `TextEncoder` / `TextDecoder` | jsdom 缺少的 polyfill |
| `window.matchMedia` | CSS media query |
| `IntersectionObserver` | 懶加載 / 無限滾動 |
| `ResizeObserver` | 組件尺寸偵測 |
| `console.log/error/warn` 過濾 | 壓制 Firebase 噪音日誌 |
| `Reservation error` / `Failed to load notification` / `Resend API error` 過濾 | 壓制測試預期的錯誤日誌 |

### 八、運行測試命令速查

```bash
# 日常開發（最常用，~0.9s）
npm test                    # 運行所愉 Jest 測試（132 tests）

# 只跑組件測試
npm run test:components     # 只跑 __tests__/components/（105 tests）

# Redux + API Service 測試
npx jest --testPathPatterns=lib   # 只跑 __tests__/lib/（50 tests）

# Emulator 測試（需要 Java 21+）
npm run test:emulator       # 啟動 Emulator → 跑測試 → 自動關閉（52 tests）

# E2E 測試（需要 Chromium）
npm run test:e2e            # 自動啟動 dev server → 跑 Playwright（52 tests）
npm run test:e2e:ui         # Playwright UI 模式（方便 debug）

# 全部一次跑
npm run test:all            # Jest + Emulator
```

### 九、CI/CD 規則

- GitHub Actions 在每次 push 自動運行（`.github/workflows/test.yml`）
- CI 跑的測試：Jest 99 tests + Emulator 52 tests
- E2E 目前只在本地跑（後續可加入 CI）
- **所有測試通過才能 merge PR**

### 十、已知的坑（踩過的雷）

| 問題 | 解法 |
|------|------|
| `navigator.clipboard` undefined | 在測試開頭加 `Object.assign(navigator, { clipboard: { writeText: jest.fn() } })` |
| Playwright strict mode 多元素匹配 | 用 `{ exact: true }` 或 `getByRole` 代替 `getByText` |
| ApiService 測試跑 12 秒 | 用 `jest.useFakeTimers()` 跳過 `simulateDelay` |
| Jest 嘗試跑 E2E 文件報錯 | `jest.config.js` 的 `testPathIgnorePatterns` 加入 `e2e/` |
| Emulator 需要 Java | 安裝 OpenJDK 21：`brew install openjdk@21` 並加入 PATH |
| 組件測試已涵蓋 | 不需要在 E2E 重複驗證已有組件測試的功能 |
| About / Contact 指向 `/` | 這些頁面路由不存在，Navbar 連結都指向首頁 |
| `jest.resetModules()` 破壞 mock closure | 不要在 `beforeEach` 中使用 `jest.resetModules()`，改用 `beforeAll` 匯入 module，`beforeEach` 只重置 mock state |
| Next.js 16 `RangeError: Maximum call stack size exceeded` | 全部測試一起跑時 `unhandled-rejection.tsx` 會觸發遞歸。使用 `--forceExit` 或分開跑各 suite |
| ApiService mock Firestore | API Service 已改用 FirestoreService，測試需要 `jest.mock('@/lib/services/FirestoreService')` 提供 mock 數據 |
| Firebase config 在測試 OOM | P1 組件測試需要 mock `@/lib/firebase/firestore` 避免 Firebase SDK 初始化導致記憶體溢出 |

---

## 📋 工作總結 (2月5日 — 2月26日)

### 🎯 為什麼要做這些改動？

#### 原本的問題：
1. **Mock 測試不可靠** - 用假數據測試，無法確保真實 Firebase 行為正確
2. **Security Rules 沒有測試** - 權限規則從未被測試過，可能有安全漏洞
3. **維護成本高** - Mock 文件需要與真實 API 同步更新，容易過時
4. **CI/CD 不完整** - 沒有自動化測試流程

#### 解決方案：
採用 **Firebase Emulator** 進行真實環境測試：
- ✅ 使用真實的 Firestore 邏輯
- ✅ 測試真實的 Security Rules
- ✅ 不需要維護 Mock 文件
- ✅ 可以在 CI/CD 中自動運行

---

### 📊 完成的工作

| 日期 | 工作項目 | 狀態 |
|------|----------|------|
| 2/5 | 安裝 Jest + Testing Library | ✅ |
| 2/5 | 創建 Mock 測試 (31 tests) | ✅ → 後刪除 |
| 2/5 | 安裝 Java (Emulator 需要) | ✅ |
| 2/5 | 配置 Firebase Emulator | ✅ |
| 2/5 | 安裝 @firebase/rules-unit-testing | ✅ |
| 2/5 | 創建 Security Rules 測試 (24 tests) | ✅ |
| 2/6 | 刪除所有 Mock 文件 | ✅ |
| 2/6 | 創建 Service CRUD 測試 (25 tests) | ✅ |
| 2/6 | 創建 GitHub Actions CI/CD | ✅ |
| 2/6 | 創建 UI 組件測試 (25 tests) | ✅ |
| 2/11 | 修復 Next.js 安全漏洞 (CVE-2025-66478) | ✅ |
| 2/11 | 重寫測試配合新 firestore.rules | ✅ |
| 2/11 | 修復 firestore.rules 安全漏洞 | ✅ |
| 2/11 | 所有測試通過 (79 tests) | ✅ |
| 2/24 | P1: 新增 UI 組件測試 — Navbar, Footer, Banner, Hero 等 (46 tests) | ✅ |
| 2/24 | P2: 新增 Redux Slice 測試 — cart, product, address, rating (27 tests) | ✅ |
| 2/24 | P3: 新增 API Service 測試 — 9 個 Service 類別 (35 tests) | ✅ |
| 2/24 | P4: 安裝 Playwright + 新增 E2E 測試 (16 tests) | ✅ |
| 2/24 | 所有測試通過 (133 Jest + 16 E2E = **149 tests**) | ✅ |
| 2/26 | Merge dev → add_test_module，修復 53 個測試失敗 | ✅ |
| 2/26 | P1: 更新組件測試配合 merge 後的新組件 (46→41 tests) | ✅ |
| 2/26 | P3: 重構 API Service 測試 — 移除 StoreApiService，改用 FirestoreService mock (35→30 tests) | ✅ |
| 2/26 | P3: 修復 Admin API 測試 — jest.resetModules() mock closure 問題 (12 tests) | ✅ |
| 2/26 | 所有測試通過 (137 Jest + 16 E2E = **153 tests**) | ✅ |
| 3/2 | 🔒 修復 4 個 Critical 安全漏洞（firestore.rules / storage.rules / .env / auth.js） | ✅ |
| 3/2 | P0: 更新 Emulator 測試配合新 Security Rules (54→72 tests) | ✅ |
| 3/2 | P1: 新增內容組件測試 — LatestProducts, BestSelling, ProductDescription, AboutSection (22 tests) | ✅ |
| 3/2 | P1: 新增彈窗組件測試 — ReservationModal, RatingModal, AddressModal (26 tests → Rating 3/3 移除, AddressModal 3/5 移除) | ✅ |
| 3/2 | P3: 新增通知 API 測試 — new-order, test notification (9 tests) | ✅ |
| 3/2 | P4: 重寫 E2E 測試覆蓋所有頁面 (16→52 tests) | ✅ |
| 3/2 | 所有測試通過 (194 Jest + 72 Emulator + 52 E2E = **318 tests**) | ✅ |
| 3/3 | 🗑️ 移除 Rating 功能（死 code）— 刪除 Rating.jsx, RatingModal.jsx, OrderItem.jsx, ratingSlice, RatingApiService, RatingFirestoreService 及對應測試 (-18 tests) | ✅ |
| 3/3 | 所有測試通過 (176 Jest + 72 Emulator + 52 E2E = **300 tests**) | ✅ |
| 3/5 | 移除死代碼 (Counter/Banner/PageTitle/Newsletter/OurSpec/CategoriesMarquee/BestSelling/ProductDescription)，清理重複測試 (132 Jest + 72 Emulator + 52 E2E = **256 tests**) | ✅ |
| 3/5 | 🗑️ 移除死代碼鏈 (AddressModal + OrderSummary) — 兩者均無頁面使用 (-6 tests) (126 Jest + 72 Emulator + 52 E2E = **250 tests**) | ✅ |
| 3/5 | 🗑️ 移除死 Redux Slices (cartSlice + addressSlice) — 無組件使用 (-12 tests) (114 Jest + 72 Emulator + 52 E2E = **238 tests**) | ✅ |
| 3/5 | 🗑️ 移除 UserApiService — 已用 Firebase Auth + AuthContext 取代 (-5 tests) (109 Jest + 72 Emulator + 52 E2E = **233 tests**) | ✅ |
| 3/5 | 🗑️ 移除 AddressApiService — AddressModal 已刪，無消費者 (-3 tests) (106 Jest + 72 Emulator + 52 E2E = **230 tests**) | ✅ |
| 3/5 | 🗑️ 移除 DashboardApiService + MiscApiService — 無頁面使用 (-3 tests) (103 Jest + 72 Emulator + 52 E2E = **227 tests**) | ✅ |
| 3/9 | 🗑️ 移除 Ratings rules + 測試 — Rating 功能已刪，rules 無存在必要 (-4 emulator tests) (103 Jest + 68 Emulator + 52 E2E = **223 tests**) | ✅ |
| 3/9 | 🗑️ 移除 Carts rules tests — 購物車停用，與 wildcard deny 重疊 (-3 emulator tests) (103 Jest + 65 Emulator + 52 E2E = **220 tests**) | ✅ |
| 3/9 | 🗑️ 移除 Addresses rules + 測試 — 地址功能已刪，rules 回落 default deny (-4 emulator tests) (103 Jest + 61 Emulator + 52 E2E = **216 tests**) | ✅ |
| 3/9 | 🗑️ 移除 Ratings CRUD tests — Rating 功能已全部清除 (-3 emulator tests) (103 Jest + 58 Emulator + 52 E2E = **213 tests**) | ✅ |
| 3/9 | 🗑️ 移除 Coupon 全條鏈 — 頁面/ApiService/FirestoreService/Rules/Tests (-4 Jest, -2 emulator) (99 Jest + 56 Emulator + 52 E2E = **207 tests**) | ✅ |
| 3/9 | 🗑️ 移除 Carts CRUD tests — 購物車停用 (-2 emulator tests) (99 Jest + 54 Emulator + 52 E2E = **205 tests**) | ✅ |
| 3/9 | 🗑️ 移除 Addresses CRUD tests — 地址功能已刪 (-2 emulator tests) (99 Jest + 52 Emulator + 52 E2E = **203 tests**) | ✅ |

---

### 🧪 測試結構

```
__tests__/
├── api/
│   ├── admin.test.js                # P3: 12 個 Admin API 認證測試
│   └── notifications.test.js        # P3: 9 個通知 API 測試
├── components/
│   ├── Loading.test.jsx             # P1: 2 個 Loading 組件測試
│   ├── modals.test.jsx              # P1: 20 個彈窗組件測試 (預約/地址)
│   ├── ui-components.test.jsx       # P1: 9 個基礎組件測試 (Title + Logo)
│   ├── ui-components-p1.test.jsx    # P1: 41 個進階組件測試
│   └── ui-components-p2.test.jsx    # P1: 22 個內容組件測試 (最新/暢銷/描述/關於)
├── emulator/
│   ├── firestore-rules.test.js      # 51 個權限測試
│   └── firestore-crud.test.js       # 21 個 CRUD 測試
├── lib/
│   ├── redux-slices.test.js         # P2: 11 個 Redux Slice 測試
│   └── api-services.test.js         # P3: 12 個 API Service 測試
└── utils/
    └── test-utils.js                # 測試工具

e2e/
└── app.spec.js                      # P4: 52 個 E2E 測試 (Playwright)
```

### 📊 測試統計

| 類型 | 框架 | 數量 | 運行時間 |
|------|------|------|----------|
| UI 組件 (P1) | Jest + Testing Library | 105 | ~0.4s |
| Redux Slice (P2) | Jest | 23 | ~0.1s |
| API Service + Admin + Notification (P3) | Jest + Fake Timers | 44 | ~0.2s |
| Security Rules | Jest + Firebase Emulator | 51 | ~2s |
| CRUD 操作 | Jest + Firebase Emulator | 21 | ~1s |
| E2E (P4) | Playwright + Chromium | 52 | ~15s |
| **總計** | | **300** | |

> 💡 Jest 測試（132 個）在 0.9 秒內完成！

---

## 🔒 2月11日安全修復

### 1. Next.js CVE-2025-66478
- **問題**：Next.js 15.3.5 存在安全漏洞
- **解決**：升級至 Next.js 16.1.6

### 2. Firestore Rules - 商品創建漏洞
- **問題**：任何用戶可以為任何商店創建商品（缺少擁有權檢查）
- **解決**：添加 `get(...).data.userId == request.auth.uid` 驗證商店擁有權

---

## 🔒 3月2日安全修復

### 1. Firestore Rules - Wildcard 公開讀取漏洞
- **問題**：`allow read: if true` 在 wildcard 規則中，任何人可讀取所有集合（包括 orders、addresses、admin）
- **嚴重性**：🔴 Critical
- **解決**：改為逐集合明確授權，wildcard 改為 `allow read: if false`

### 2. Storage Rules - 刪除權限漏洞
- **問題**：`isAuthenticated() || isAdmin()` 任何登入用戶都可刪除 Storage 文件
- **嚴重性**：🔴 Critical
- **解決**：刪除權限改為 `isAdmin()` 僅管理員

### 3. 環境變量暴露
- **問題**：`.env.local` 中 `NEXT_PUBLIC_INTERNAL_API_SECRET` 使用 `NEXT_PUBLIC_` 前綴，Secret 暴露到客戶端
- **嚴重性**：🔴 Critical
- **解決**：移除該環境變量

### 4. 缺少 deleteDoc Import
- **問題**：`lib/firebase/auth.js` 使用 `deleteDoc` 但未 import
- **嚴重性**：🟡 Medium
- **解決**：添加 `deleteDoc` 到 Firestore import

---

## 🔍 測試詳解

### 1. Security Rules 測試 (firestore-rules.test.js)

測試你的 `firestore.rules` 是否正確設置權限。

> ⚠️ **3月2日更新**：修復 4 個 Critical 安全漏洞後，重寫所有權限測試
> - Wildcard `allow read: if true` → 改為逐集合明確授權
> - 新增 Reservations、AdminInvites、Settings 集合測試
> - Carts / Addresses / Orders 改為更嚴格的權限

#### Users Collection (9 tests)
| 測試 | 描述 |
|------|------|
| 有邀請的用戶可創建自己的 profile | 邀請制註冊 |
| 沒有邀請不能創建 profile | 防止未受邀用戶 |
| 不能為別人創建 profile | 不能冒充其他用戶 |
| 任何人可讀取用戶資料 | 用戶資料公開 |
| 已登入用戶可讀取其他人的資料 | 公開資料 |
| 用戶可更新自己的 profile | 允許修改個人資料 |
| 用戶不能更新別人的 profile | 防止越權修改 |
| Admin 可刪除用戶 | 管理員權限 |
| 普通用戶不能刪除用戶 | 防止越權刪除 |

#### Products Collection (7 tests)
| 測試 | 描述 |
|------|------|
| 任何人可讀商品 | 商品列表公開 |
| Admin 可創建商品 | 管理員權限 |
| 普通用戶不能創建商品 | 權限控制 |
| Admin 可更新商品 | 管理員權限 |
| 普通用戶不能更新商品 | 防止越權修改 |
| Admin 可刪除任何商品 | 管理員權限 |
| 普通用戶不能刪除商品 | 防止越權刪除 |

#### Orders Collection (6 tests)
| 測試 | 描述 |
|------|------|
| 未登入用戶不能讀取訂單 | 訂單隱私 |
| 普通用戶不能讀取訂單 | 僅 Admin 可讀 |
| Admin 可讀取訂單 | 管理員權限 |
| Admin 可創建訂單 | 管理員權限 |
| 普通用戶不能創建訂單 | 權限控制 |
| Admin 可刪除訂單 | 管理員權限 |

#### Admin Collection (3 tests)
| 測試 | 描述 |
|------|------|
| Admin 也不能寫入 admin collection | 無寫入規則 |
| 未登入用戶不能讀取 admin collection | 防止越權 |
| 普通用戶不能讀取 admin collection | 防止越權 |

#### Reservations Collection (5 tests)
| 測試 | 描述 |
|------|------|
| 任何人都可以創建預訂 | 訪客預訂功能 |
| 未登入用戶不能讀取預訂 | 預訂隱私 |
| Admin 可以讀取預訂 | 管理員權限 |
| Admin 可以刪除預訂 | 管理員權限 |
| 普通用戶不能刪除預訂 | 防止越權刪除 |

#### AdminInvites Collection (3 tests)
| 測試 | 描述 |
|------|------|
| Admin 可以創建邀請 | 管理員邀請功能 |
| 普通用戶不能創建邀請 | 權限控制 |
| 被邀請人可以刪除自己的邀請 | 接受邀請流程 |

#### Settings Collection (3 tests)
| 測試 | 描述 |
|------|------|
| 任何人都可以讀取設定 | 公開設定 |
| Admin 可以更新設定 | 管理員權限 |
| 普通用戶不能修改設定 | 防止越權修改 |

#### Wildcard Default Deny (1 test)
| 測試 | 描述 |
|------|------|
| 未定義的 collection 拒絕訪問 | 默認安全 |

---

### 2. Service CRUD 測試 (firestore-crud.test.js)

測試 Firestore 的 CRUD 操作是否正常運作。使用 `withSecurityRulesDisabled` 繞過權限測試純數據操作。

#### Users CRUD (4 tests)
- 創建用戶
- 按 role 查詢
- 更新用戶
- 刪除用戶

#### Stores CRUD (2 tests)
- 創建商店
- 查詢已批准商店

#### Products CRUD (3 tests)
- 創建商品
- 按商店查詢
- 更新價格

#### Orders CRUD (3 tests)
- 創建訂單
- 按狀態查詢
- 更新狀態

---

### 3. UI 組件測試 (ui-components.test.jsx)

測試 React 組件的渲染和交互。

#### Loading (2 tests)
- 渲染 spinner
- 全屏高度

#### Title (5 tests)
- 顯示標題和描述
- View more 按鈕顯示/隱藏
- href 連結正確

#### Logo (4 tests)
- 渲染圖片
- 預設/自定義 size
- 自定義 className

#### ProductCard (4 tests)
- 顯示商品名稱和價格
- 連結到產品頁
- 顯示商品圖片

---

### 4. P1 進階 UI 組件測試 (ui-components-p1.test.jsx)

測試更多核心 UI 組件，覆蓋 Navbar、Footer、Hero 等主要區塊。

> ⚠️ **2月26日更新**：配合 merge 後的組件變更，更新了所有測試斷言

#### Navbar (7 tests)
- 渲染 Logo、首頁連結、Shop 連結
- 搜尋輸入框功能
- About 連結、導航分隔線

#### Footer (8 tests)
- 版權資訊（LOYAULTYCLUB. All Rights Reserved）
- CATEGORIES / FOLLOW US 區塊
- 社交媒體連結（Instagram、Threads、Email — 共 3 個）
- QUICK LINKS 區塊、Privacy Policy 連結

#### Hero (3 tests)
- 渲染 banner 容器
- 容器有最小高度（min-height: 400px）
- 沒有 banner 時不渲染圖片

> 💡 Hero 組件已從富內容佈局改為簡單的 Firestore 驅動 banner

---

### 4b. P1 內容組件測試 (ui-components-p2.test.jsx)

> 🆕 **3月2日新增**：測試 LatestProducts、AboutSection 兩個內容區塊組件

#### LatestProducts (7 tests)
- 顯示 Latest Products 標題
- 最多顯示 4 件產品
- 按 createdAt 降序排列（最新在前）
- 不顯示超出限制的產品
- View more 連結指向 /shop
- 正確渲染商品描述
- 少於 4 件商品也能正常顯示

#### AboutSection (5 tests)
- 顯示 About Us 標題
- 品牌名稱（LOYAULTYCLUB）
- 品牌說明文字
- 描述文字內容
- 預設顯示 video 元素

---

### 4c. P1 彈窗組件測試 (modals.test.jsx)

> 🆕 **3月2日新增**：測試 ReservationModal 互動彈窗

#### ReservationModal (14 tests)
- 打開/關閉狀態正確
- 顯示所有表單欄位（姓名、電話、電郵、日期、時間、人數）
- 人數預設為 1
- 姓名驗證（不能留空）
- 電郵/電話驗證（至少填一個）
- 成功提交預約
- 成功後顯示確認畫面
- 發送電郵通知
- 顯示商品選項
- 關閉按鈕功能
- 錯誤處理
- 只填電話也能提交

---

### 5. P2 Redux Slice 測試 (redux-slices.test.js)

測試 productSlice 的 reducer 邏輯。

#### productSlice (11 tests)
- 初始狀態（空列表 loading=false）
- `setProduct` / `clearProduct`：設置/清空商品列表
- `setCurrentProduct` / `clearCurrentProduct`：設置/清除當前商品
- `setSearchResults` / `clearSearchResults`：設置/清除搜尋結果
- `clearError`：清除錯誤
- `fetchProducts` async thunk：pending/fulfilled/rejected 三種狀態

---

### 6. P3 API Service 測試 (api-services.test.js)

測試所有 7 個 ApiService 類別。使用 `jest.useFakeTimers()` 跳過 `simulateDelay`。
使用 `jest.mock('@/lib/services/FirestoreService')` mock 所有 Firestore 服務。

> ⚠️ **2月26日更新**：
> - 移除 StoreApiService（多商戶架構已移除）
> - createProduct / createOrder / createAddress 已實現（改用 FirestoreService）
> - 移除 getStoreDashboard（不再存在）

#### ApiService 中央入口 (1 test)
- 包含所有服務（Product, Order）

#### ProductApiService (7 tests)
- getAllProducts / getProduct / getProductsByCategory
- searchProducts / getCategories
- createProduct：成功創建商品

#### OrderApiService (4 tests)
- getAllOrders / getOrder
- 不存在的訂單返回錯誤
- createOrder：建立訂單

---

### 6b. P3 Admin API 測試 (admin.test.js)

測試 Admin API Routes 的認證和功能。直接 mock `@/lib/auth/server` 模組控制認證結果。

> ⚠️ **2月26日更新**：修復 `jest.resetModules()` 導致 mock closure 失效的問題，改用 `beforeAll` 匯入 route module

#### Admin Invite API - 認證檢查 (4 tests)
- 沒有 Authorization header → 401
- Token 無效 → 401
- 用戶非 admin → 403
- 有效 admin → 通過認證（返回 400 業務邏輯錯誤）

#### Remote Config API - 認證檢查 (2 tests)
- 沒有認證 → 401
- 非 admin → 403

#### Admin Invite - 驗證 (2 tests)
- 缺少 email → 400
- RESEND_API_KEY 未配置 → 500

#### Admin Invite - 功能 (2 tests)
- 成功發送邀請郵件
- 郵件發送失敗返回錯誤

#### Remote Config - 更新配色 (2 tests)
- 缺少 colors → 400
- Firebase Admin 未配置 → 500

---

### 6c. P3 通知 API 測試 (notifications.test.js)

> 🆕 **3月2日新增**：測試 `/api/notifications/new-order` 和 `/api/notifications/test` 兩個通知端點

#### New Order Notification API (6 tests)
- 缺少 productName → 400
- 缺少 customerName → 400
- RESEND_API_KEY 未配置 → 500
- 通知停用 → 返回 success + skipped
- 成功發送郵件（呼叫 Resend API）
- Firestore 讀取失敗時使用預設收件人

#### Test Notification API (3 tests)
- RESEND_API_KEY 未配置 → 500
- 通知停用 → 400
- 成功發送測試郵件

---

### 7. P4 E2E 測試 (e2e/app.spec.js)

使用 Playwright + Chromium 進行端到端測試，自動啟動 Next.js dev server。

> ⚠️ **3月2日更新**：E2E 測試完全重寫，覆蓋所有公開頁面（16→52 tests）

#### 首頁 (6 tests)
- 正確載入首頁（title 檢查）
- Banner 圖片顯示
- Latest Products 區塊
- View more 連結到 /shop
- 至少顯示 1 件商品
- About LoyaultyClub 區塊

#### Navbar (4 tests)
- Logo 和主要導航連結
- 點擊 Shop 導航到商店頁面
- 點擊 About 導航到 About 頁面
- 點擊 Logo 回到首頁

#### Footer (5 tests)
- 版權資訊
- CATEGORIES / QUICK LINKS / OUR POLICY 區塊
- FOLLOW US 社交媒體連結

#### 商店頁面 (4 tests)
- 商品列表標題
- 商品列表（帶價錢）
- 商品可點擊進入詳情頁
- 直接訪問返回 200

#### 商品詳情頁 (6 tests)
- 商品名稱和價錢
- 商品描述
- Shipping 資訊
- Reserve 按鈕
- Back to Shop 連結
- Breadcrumb 導航

#### About 頁面 (4 tests)
- 頁面標題
- 「我哋嘅故事」時間線
- 「關於我哋」介紹文字
- 頁面返回 200

#### Contact 頁面 (4 tests)
- CONTACT 標題
- 聯絡電郵
- 社交媒體連結
- 頁面返回 200

#### 購物車頁面 (2 tests)
- 顯示購物車即將推出
- 瀏覽產品連結導航至 /shop

#### 訂單頁面 (2 tests)
- 顯示訂單即將推出
- 瀏覽產品連結導航至 /shop

#### Privacy Policy 頁面 (4 tests)
- Privacy Policy 標題
- 主要條款區塊
- 返回首頁連結
- 頁面返回 200

#### Terms of Service 頁面 (4 tests)
- Terms of Service 標題
- 主要條款區塊
- 返回首頁連結
- 頁面返回 200

#### 頁面載入 (2 tests)
- 首頁有正確的 viewport meta tag
- 所有公開頁面都返回 200

#### 響應式設計 (2 tests)
- 桌面版本（1280px）顯示完整導航
- 手機版本（375px）顯示漢堡選單

#### 用戶流程 (3 tests)
- 首頁 → 商店 → 商品詳情 → 返回商店
- Footer Privacy Policy 連結正確導航
- Footer Terms of Service 連結正確導航

---

## 🚀 如何運行測試

### 本地運行

```bash
# 運行所有 Jest 測試（組件 + Redux + API + Admin + Notification，194 tests，~0.9s）
npm run test:components

# 運行 Emulator 測試（52 tests，~3s）
npm run test:emulator

# 運行 E2E 測試（52 tests，~15s，自動啟動 dev server）
npm run test:e2e

# 運行 E2E 測試（帶 UI 模式）
npm run test:e2e:ui

# 運行所有測試
npm run test:all
```

### CI/CD 自動運行

Push 到 GitHub 後會自動：
1. 運行 194 個 Jest 測試（組件 + Redux + API + Admin + Notification）
2. 啟動 Firebase Emulator
3. 運行 72 個 Emulator 測試
4. 回報結果

> 💡 E2E 測試目前只在本地運行，CI/CD 集成可在後續加入

---

## 📁 相關文件

| 文件 | 用途 |
|------|------|
| `jest.config.js` | Jest 主配置（排除 emulator/ 和 e2e/） |
| `jest.emulator.config.js` | Emulator 測試配置 |
| `jest.emulator.setup.js` | Emulator 測試初始化 |
| `playwright.config.js` | Playwright E2E 測試配置 |
| `firebase.json` | Emulator 端口配置 |
| `.github/workflows/test.yml` | GitHub Actions CI/CD |

---

## 🔧 Emulator 端口

| 服務 | 端口 |
|------|------|
| Auth | 9099 |
| Firestore | 8080 |
| Storage | 9199 |
| Emulator UI | 4000 |

---

## 📈 測試計劃進度

| 優先級 | 任務 | 狀態 |
|--------|------|------|
| P0 | CI/CD 測試通過 → Merge PR | ✅ 完成 |
| P1 | UI 組件測試 (Navbar, Footer, Hero 等 89 tests) | ✅ 完成 |
| P2 | Redux Slice 測試 (product 11 tests) | ✅ 完成 |
| P3 | API Service 測試 (7 個 Service 類別 27 tests) + Admin API (12 tests) + Notification (9 tests) | ✅ 完成 |
| P4 | E2E 測試 (Playwright + Chromium 52 tests) | ✅ 完成 |
| — | Merge 修復：dev → add_test_module 合併後 53 個測試失敗 | ✅ 已修復 (2/26) |
| — | 🔒 安全修復：4 個 Critical 漏洞 + Emulator 測試更新 (54→72 tests) | ✅ 已修復 (3/2) |

### 🎯 後續可改進方向

| 優先 | 任務 | 說明 |
|------|------|------|
| ~~🔴 高~~ | ~~真實 API 替換 MockData~~ | ✅ 已完成 — ApiService 已改用 FirestoreService（2/26 merge） |
| 🔴 高 | About / Contact 頁面 | 目前路由不存在，建好後要加 E2E 測試 |
| 🟡 中 | CI/CD E2E 集成 | 在 GitHub Actions 加入 Playwright 測試 |
| 🟡 中 | 覆蓋率報告 | 啟用 Jest coverage threshold（目標 60%+） |
| 🟢 低 | 登入 / 下單 E2E 流程 | 模擬完整用戶購物旅程 |
| 🟢 低 | 視覺回歸測試 | Playwright screenshot comparison |
| 🟢 低 | 性能測試 | Lighthouse CI |

---

## ❓ 常見問題

### Q: 為什麼不用 Mock？
A: Mock 測試只測試你的假設，不測試真實行為。如果 Firebase API 改了，Mock 不會發現問題。

### Q: Emulator 測試慢嗎？
A: 72 個測試只需 ~3 秒，非常快。

### Q: CI/CD 需要真實 Firebase 密鑰嗎？
A: 不需要！Emulator 使用 `demo-` 開頭的 Project ID，完全離線運行。

### Q: 如何新增測試？
A: 
- **組件測試**：在 `__tests__/components/` 新增 `.test.jsx` 文件
- **Redux 測試**：在 `__tests__/lib/` 新增 `.test.js` 文件
- **Emulator 測試**：在 `__tests__/emulator/` 新增（使用 `jest.emulator.config.js`）
- **E2E 測試**：在 `e2e/` 新增 `.spec.js` 文件

### Q: API Service 測試為什麼用 Fake Timers？
A: ApiService 使用 `simulateDelay` 模擬網路延遲。使用 `jest.useFakeTimers()` 可以跳過等待，將 27 個測試從 12.8 秒降至 0.19 秒。

### Q: E2E 測試需要什麼環境？
A: 需要安裝 Playwright 和 Chromium (`npx playwright install chromium`)。測試會自動啟動 Next.js dev server。
