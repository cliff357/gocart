# 🧪 LoyaultyClub 測試文檔

> 📅 創建日期：2026年2月5日  
> 📅 最後更新：2026年3月18日  
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
| Redux Toolkit | 2.8.x | 狀態管理（1 slice：product） |
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
   ╱      P1        ╲  UI 組件 + 頁面渲染 + 交互   — 161 tests
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
npm test                    # 運行所有 Jest 測試（205 tests）

# 只跑組件測試
npm run test:components     # 只跑 __tests__/components/（160 tests）

# Redux + API Service 測試
npx jest --testPathPatterns=lib   # 只跑 __tests__/lib/（23 tests）

# Emulator 測試（需要 Java 21+）
npm run test:emulator       # 啟動 Emulator → 跑測試 → 自動關閉（52 tests）

# E2E 測試（需要 Chromium）
npm run test:e2e            # 自動啟動 dev server → 跑 Playwright（52 tests）
npm run test:e2e:ui         # Playwright UI 模式（方便 debug）

# 全部一次跑
npm run test:all            # Jest + Emulator
```

### 九、CI/CD 規則

- **`test.yml`**：push main/dev + PR → 跑全部 205 Jest tests + 52 Emulator tests + build
- **`ci.yml`**：push/PR main/dev → lint → `test:ci` (205 Jest + coverage) → build → security audit
- 覆蓋率閾值：statements/lines ≥ 30%, branches/functions ≥ 25%
- E2E 目前只在本地跑（後續可加入 CI）
- **所有測試 + 覆蓋率通過才能 merge PR**

### 十、已知的坑（踩過的雷）

| 問題 | 解法 |
|------|------|
| `navigator.clipboard` undefined | 在測試開頭加 `Object.assign(navigator, { clipboard: { writeText: jest.fn() } })` |
| Playwright strict mode 多元素匹配 | 用 `{ exact: true }` 或 `getByRole` 代替 `getByText` |
| ApiService 測試跑 12 秒 | 用 `jest.useFakeTimers()` 跳過 `simulateDelay` |
| Jest 嘗試跑 E2E 文件報錯 | `jest.config.js` 的 `testPathIgnorePatterns` 加入 `e2e/` |
| Emulator 需要 Java | 安裝 OpenJDK 21：`brew install openjdk@21` 並加入 PATH |
| 組件測試已涵蓋 | 不需要在 E2E 重複驗證已有組件測試的功能 |
| ~~About / Contact 指向 `/`~~ | ✅ 路由已建好，E2E 已覆蓋（3/16 審計確認） |
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
| 3/12 | 🗑️ 移除 ThemeSwitcherExample.jsx — AI over-scaffolding demo，零 import | ✅ |
| 3/12 | 🗑️ 移除 Logo.examples.js — dead demo file，零 import | ✅ |
| 3/12 | 🗑️ 移除 LoginButton.jsx — 零頁面 import，admin 有獨立登入邏輯 | ✅ |
| 3/12 | 📋 完成 83 項 dead code 全面審計（#1–#83），清理 8 個 dead items | ✅ |
| 3/12 | 🔐 開始 Admin 頁面測試計劃 — 審計 12 頁面 + 4 組件，全部 0 測試 | 🔄 |
| 3/12 | ✅ Phase 1: Admin 組件測試 — AdminSidebar/Navbar/Layout/OrdersAreaChart (+16 tests) (115 Jest + 52 Emulator + 52 E2E = **219 tests**) | ✅ |
| 3/13 | 📋 Phase 2 計劃：分析 12 頁面依賴，分 4 種 mock 模式，規劃 3 個測試文件 (~51 tests) | ✅ |
| 3/13 | 📄 建立 `project-management/ADMIN_TESTING_PLAN.md` — Phase 2 詳細記錄 | ✅ |
| 3/16 | ✅ Phase 2 文件 1: `admin-pages-auth.test.jsx` — Login + Dashboard (+11 tests) (126 Jest + 52 Emulator + 52 E2E = **230 tests**) | ✅ |
| 3/16 | ✅ Phase 2 文件 2: `admin-pages-crud.test.jsx` — Categories/Reservations/Todo/About Setting (+24 tests) (150 Jest + 52 Emulator + 52 E2E = **254 tests**) | ✅ |
| 3/16 | ✅ Phase 2 文件 3: `admin-pages-complex.test.jsx` — Products×3/HomeSetting/Admins/Notifications (+33 tests) (183 Jest + 52 Emulator + 52 E2E = **287 tests**) 🎉 Phase 2 完成！ | ✅ |
| 3/16 | 🔍 全站測試覆蓋審計 — 審計 23 頁面 + 17 組件 + 15 lib 文件，識別 3 個主要 Gap（ProductDetails/Shop/About） | ✅ |
| 3/16 | ✅ Phase 3 Gap #1: `ProductDetails.test.jsx` — 圖片畫廊/折扣計算/選項選擇/相關產品/Reserve (+10 tests) (193 Jest + 52 Emulator + 52 E2E = **297 tests**) | ✅ |
| 3/17 | ✅ Phase 3 Gap #2: `ShopPage.test.jsx` — 商品列表/搜索篩選/分類篩選/分類名載入/空狀態 (+6 tests) (199 Jest + 52 Emulator + 52 E2E = **303 tests**) | ✅ |
| 3/18 | ✅ Phase 3 Gap #3: `AboutPage.test.jsx` — Hero/Timeline預設/Firestore載入/fallback/內容區/結尾 (+6 tests) (205 Jest + 52 Emulator + 52 E2E = **309 tests**) | ✅ |
| 3/18 | 🗑️ 刪除 `lib/data/MockData.js` (656 行 dead code) — `MockMiscData.getCategories()` inline 入 `ApiService.js`，移除空 `lib/data/` 目錄 | ✅ |
| 3/18 | 🔧 CI/CD 覆蓋率：啟用 `coverageThreshold` (30% stmts/lines, 25% branches/funcs)，排除 Firebase SDK wrappers，`test.yml` 改跑全部 205 Jest，`ci.yml` 擴展觸發 dev branch | ✅ |

---

### 🧪 測試結構

```
__tests__/
├── api/
│   ├── admin.test.js                # P3: 12 個 Admin API 認證測試
│   └── notifications.test.js        # P3: 9 個通知 API 測試
├── components/
│   ├── admin-components.test.jsx    # P1: 16 個 Admin 組件測試 (Sidebar/Navbar/Layout/Chart)
│   ├── admin-pages-auth.test.jsx    # P2-F1: 11 個 Admin 頁面測試 (Login/Dashboard)
│   ├── admin-pages-crud.test.jsx    # P2-F2: 24 個 Admin 頁面測試 (Categories/Reservations/Todo/About)
│   ├── admin-pages-complex.test.jsx # P2-F3: 33 個 Admin 頁面測試 (Products×3/HomeSetting/Admins/Notifications)
│   ├── Loading.test.jsx             # P1: 2 個 Loading 組件測試
│   ├── modals.test.jsx              # P1: 14 個預約彈窗測試 (ReservationModal)
│   ├── ProductDetails.test.jsx      # P3-Gap1: 10 個產品詳情測試 (畫廊/折扣/選項/相關/Reserve)
│   ├── ShopPage.test.jsx            # P3-Gap2: 6 個商品列表測試 (搜索/分類篩選/分類名載入)
│   ├── AboutPage.test.jsx           # P3-Gap3: 6 個 About 頁面測試 (Hero/Timeline/Firestore/fallback)
│   ├── ui-components.test.jsx       # P1: 9 個基礎組件測試 (Title + Logo)
│   ├── ui-components-p1.test.jsx    # P1: 18 個進階組件測試 (Navbar/Footer/Hero)
│   └── ui-components-p2.test.jsx    # P1: 12 個內容組件測試 (LatestProducts/AboutSection)
├── emulator/
│   ├── firestore-rules.test.js      # 40 個權限測試
│   └── firestore-crud.test.js       # 12 個 CRUD 測試
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
| UI 組件 + Admin 組件 (P1) | Jest + Testing Library | 71 | ~0.3s |
| Admin 頁面 (Phase 2)      | Jest + Testing Library | 68  | ~0.8s |
| Public 組件 (Phase 3)     | Jest + Testing Library | 22  | ~0.5s |
| Redux Slice (P2) | Jest | 11 | ~0.1s |
| API Service + Admin + Notification (P3) | Jest + Fake Timers | 33 | ~0.2s |
| Security Rules | Jest + Firebase Emulator | 40 | ~2s |
| CRUD 操作 | Jest + Firebase Emulator | 12 | ~1s |
| E2E (P4) | Playwright + Chromium | 52 | ~15s |
| **總計** | | **309** |

> 💡 Jest 測試（205 個 × 16 suites）在 ~1.8 秒內完成！

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

### 4c. P1 預約彈窗測試 (modals.test.jsx)

> 🆕 **3月2日新增**：測試 ReservationModal 互動彈窗（AddressModal 已於 3/5 移除）

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

### 4d. Phase 3 產品詳情測試 (ProductDetails.test.jsx)

> 🆕 **3月16日新增**：Phase 3 Gap #1 — 全站最複雜用戶面向組件，259 行此前零覆蓋

#### ProductDetails (10 tests)
- 顯示產品名稱、價格、描述
- Back to Shop 連結 + Shipping info
- Reserve 按鈕渲染
- 多圖模式 — grid + thumbnails
- 單圖模式 — 隱藏 thumbnails
- 有折扣 → 原價刪除線 + Save % badge
- 無折扣 → 隱藏 badge
- 點擊選項按鈕切換 selectedOptions
- 載入 relatedProducts → Other Styles links
- 點 Reserve → 打開 ReservationModal + 傳遞 selectedOptions

---

### 4e. Phase 3 商店頁面測試 (ShopPage.test.jsx)

> 🆕 **3月17日新增**：Phase 3 Gap #2 — 核心購物頁面，78 行，Redux useSelector + 搜索/分類篩選

#### ShopPage (6 tests)
- 顯示 "All Products" 標題 + 完整商品列表
- `?search=green` → 只顯示名稱匹配的商品
- 搜索模式 → 顯示返回箭頭圖標
- `?category=cat-accessories` → categoryService 載入分類名
- 分類名載入失敗 → 顯示 fallback category ID
- 空商品狀態 → 顯示提示訊息

---

### 4f. Phase 3 About 頁面測試 (AboutPage.test.jsx)

> 🆕 **3月18日新增**：Phase 3 Gap #3 — Firestore 動態 timeline 載入，192 行，IntersectionObserver 動畫

#### AboutPage (6 tests)
- Hero 渲染 — 標題「老友賣蘿柚企劃」+ 副標題
- 預設 Timeline — 4 項全部顯示（日期 + 標題 + icon）
- Firestore 成功載入 — 自定義 timeline 覆蓋預設
- Firestore 失敗 — fallback 保留 DEFAULT_TIMELINE
- 「關於我哋」內容區 — 三段文字
- 結尾提示 — 「更多故事，陸續更新...」

---

### 4g. Dead Code 清理：MockData.js 刪除記錄

> 📅 **3月18日執行**
> 📋 來源：Phase 3 Gap 審計（3/16）發現 `lib/data/MockData.js` 全站零 import

#### 背景

`MockData.js`（656 行）係專案早期用嘅假數據文件，包含 8 個 class：
`MockUserData`、`MockStoreData`、`MockRatingData`、`MockProductData`、`MockAddressData`、`MockCouponData`、`MockOrderData`、`MockDashboardData`、`MockMiscData`

2/26 merge 時，`ApiService.js` 已經改用 `FirestoreService` 做真實數據存取，但 `MockMiscData` 仲有一個用途殘留：`getCategories()` 提供靜態分類列表俾 `ProductApiService.getCategories()`。

#### 清理原因

1. **656 行中 649 行係 dead code** — 8 個 class 只有 `MockMiscData` 被 import
2. **`MockMiscData.getCategories()` 只返回一個靜態 array** — 完全可以 inline
3. **`getOurSpecs()` 已無任何引用** — `OurSpec.jsx` 組件喺 3/5 已刪除
4. **維護負擔** — 文件 import 咗 `assets`、圖片、icons 等依賴，增加打包體積
5. **誤導性** — 新開發者可能以為 MockData 仲有用途

#### 修改清單

| # | 文件 | 操作 | 詳情 |
|---|------|------|------|
| 1 | `lib/services/ApiService.js` | ✏️ 修改 | 移除 `import { MockMiscData } from '@/lib/data/MockData'`，新增 `const PRODUCT_CATEGORIES = ['Headphones', 'Speakers', 'Watch', 'Earbuds', 'Mouse', 'Decoration']`，`getCategories()` 改用 inline 常量 |
| 2 | `__tests__/components/ui-components-p1.test.jsx` | ✏️ 修改 | 移除 `jest.mock('@/lib/data/MockData', ...)` mock 區塊（22 行），因為被測組件已不再 import MockData |
| 3 | `lib/data/MockData.js` | 🗑️ 刪除 | 656 行全部移除 |
| 4 | `lib/data/` 目錄 | 🗑️ 刪除 | 空目錄移除 |

#### 驗證

- ✅ `grep -r "MockData" --include="*.js" --include="*.jsx"` — 源碼零引用（只剩 `API_ARCHITECTURE.md` 文檔參考）
- ✅ 全套 205 Jest × 16 suites 通過 — 零影響
- ✅ `.next/` build cache 中嘅舊引用會喺下次 build 自動清除

#### 未修改的文檔參考

`lib/API_ARCHITECTURE.md` 仍有 5 處 `import { Mock...Data } from '@/lib/data/MockData'` — 屬於歷史架構文檔，記錄遷移前嘅設計，保留作參考用途。

---

### 4h. CI/CD + 覆蓋率報告

> 📅 **完成日期：2026年3月18日**
> 📋 來源：Phase 3 Gap 審計 Action List #5 — 最後一項待完成任務

#### 背景

專案已有兩個 GitHub Actions workflow，但存在 5 個問題需要修正。

#### 覆蓋率數據（排除 Firebase SDK wrappers 前後）

| 指標 | 排除前 | 排除後 | 說明 |
|------|--------|--------|------|
| Statements | 36.49% | **43.06%** | `lib/firebase/` 5 files × 0% 大幅拉低 |
| Branches | 35.78% | **42.13%** | Firebase SDK wrappers 用 Emulator 測試覆蓋 |
| Functions | 31.53% | **36.41%** | 排除後更準確反映 unit test 覆蓋 |
| Lines | 37.44% | **44.13%** | |

#### 修改清單

| # | 文件 | 操作 | 詳情 |
|---|------|------|------|
| 1 | `jest.config.js` | ✏️ 修改 | 排除 `lib/firebase/**`、`lib/config/colors.js`、`lib/config/themes.js`、`lib/store.js` 出覆蓋率統計 |
| 2 | `jest.config.js` | ✏️ 修改 | 啟用 `coverageThreshold`：statements/lines ≥ 30%, branches/functions ≥ 25% |
| 3 | `.github/workflows/test.yml` | ✏️ 修改 | `npm run test:components` → `npm test`（跑全部 205 Jest），加測試用環境變數 |
| 4 | `.github/workflows/ci.yml` | ✏️ 修改 | 觸發條件從 `[main]` 擴展到 `[main, dev]` |

#### 修正前後對比

| 問題 | 修正前 | 修正後 |
|------|--------|--------|
| `test.yml` 測試範圍 | `test:components`（只跑 160 tests） | `npm test`（跑全部 205 tests） |
| `coverageThreshold` | 被註解，冇保護 | ✅ 啟用 30%/25% 底線 |
| `ci.yml` 觸發條件 | 只 main | main + dev |
| 覆蓋率統計範圍 | 含 Firebase SDK (0%) | ✅ 排除不適合 unit test 嘅文件 |

#### 不做的項目（暫時）

| 項目 | 原因 |
|------|------|
| CI 加入 E2E (Playwright) | 需要 Chromium 安裝 + dev server，CI 運行時間大增，暫時本地跑 |
| Codecov badge / PR comment | 已有 `codecov-action@v4` upload，但 Codecov 帳號設定需要另外做 |
| 合併兩個 workflow 成一個 | 改動較大，風險高，暫時保持分開但各自完善 |

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
# 運行所有 Jest 測試（205 tests，~1.8s）
npm test

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
1. 運行 205 個 Jest 測試（組件 + Redux + API + Admin + Notification + Public）
2. 啟動 Firebase Emulator
3. 運行 52 個 Emulator 測試
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
| — | 🔐 Admin Phase 1+2：組件 4 個 + 頁面 12 個 (+84 tests) | ✅ 完成 (3/12–3/16) |
| P5 | 🔍 全站 Gap 審計：23 頁面 + 17 組件 + 15 lib，發現 3 個主要 Gap | ✅ 完成 (3/16) |
| P5 | 🗑️ MockData.js 清理：656 行 dead code 刪除 + categories inline | ✅ 完成 (3/18) |
| P6 | 🔧 CI/CD + 覆蓋率報告：啟用 threshold + 統一 workflow 測試範圍 | ✅ 完成 (3/18) |

### 🎯 後續可改進方向

| 優先 | 任務 | 說明 |
|------|------|------|
| ~~🔴 高~~ | ~~真實 API 替換 MockData~~ | ✅ 已完成 — ApiService 已改用 FirestoreService（2/26 merge） |
| ~~🔴 高~~ | ~~About / Contact 頁面~~ | ✅ 路由已建好 + E2E 已覆蓋（3/16 審計確認） |
| ~~🔴 高~~ | ~~`ProductDetails.jsx` Jest 測試~~ | ✅ 完成 (3/16) — 10 tests 覆蓋畫廊/折扣/選項/相關產品/Reserve |
| ~~🟡 中~~ | ~~`Shop` 頁面 Jest 測試~~ | ✅ 完成 (3/17) — 6 tests 覆蓋搜索/分類篩選/分類名載入/空狀態 |
| ~~🟡 中~~ | ~~`About` 頁面 Jest 測試~~ | ✅ 完成 (3/18) — 6 tests 覆蓋 Hero/Timeline 預設+動態/Firestore fallback/內容區 |
| ~~🟡 中~~ | ~~CI/CD E2E 集成~~ | ✅ CI 已跑全部 Jest + Emulator；E2E 暫本地跑 |
| ~~🟡 中~~ | ~~覆蓋率報告~~ | ✅ 完成 (3/18) — threshold 30%/25%，排除 Firebase SDK |
| 🟢 低 | 登入 / 下單 E2E 流程 | 模擬完整用戶購物旅程 |
| 🟢 低 | 視覺回歸測試 | Playwright screenshot comparison |
| 🟢 低 | 性能測試 | Lighthouse CI |
| 🟢 低 | `ColorSwitcher` / `FirebaseStatus` | Debug/Dev 工具，非用戶面向，優先級最低 |
| ~~⚪ 清理~~ | ~~`data/MockData.js` (656 行)~~ | ✅ 已刪除 (3/18) — categories inline 入 ApiService.js，移除空 `lib/data/` 目錄 |

---

## 🔐 Admin 頁面測試計劃

> 📅 創建日期：2026年3月12日
> 📋 來源：83 項 dead code 審計完成後，發現 admin 區域測試覆蓋為零

### 現狀審計

**12 個 Admin 頁面 — 全部 0 測試：**

| # | 頁面 | 路徑 | 行數 | Jest | E2E |
|---|------|------|------|------|-----|
| 1 | Dashboard | `/admin` | ~120 | ❌ | ❌ |
| 2 | Add Product | `/admin/products` | 598 | ❌ | ❌ |
| 3 | Products List | `/admin/products/list` | 266 | ❌ | ❌ |
| 4 | Edit Product | `/admin/products/edit/[id]` | 695 | ❌ | ❌ |
| 5 | Categories | `/admin/categories` | 179 | ❌ | ❌ |
| 6 | Reservations | `/admin/reservations` | 285 | ❌ | ❌ |
| 7 | Home Setting | `/admin/home-setting` | 500 | ❌ | ❌ |
| 8 | About Setting | `/admin/about-setting` | 436 | ❌ | ❌ |
| 9 | Manage Admins | `/admin/admins` | 329 | ❌ | ❌ |
| 10 | Notifications | `/admin/notifications` | 318 | ❌ | ❌ |
| 11 | Todo | `/admin/todo` | 500 | ❌ | ❌ |
| 12 | Login | `/admin/login` | 94 | ❌ | ❌ |

**4 個 Admin 組件 — 全部 0 測試：**

| # | 組件 | 用途 | Jest |
|---|------|------|------|
| A | AdminSidebar | 側邊欄 10 個連結 | ❌ |
| B | AdminNavbar | 用戶名 + 登出按鈕 | ❌ |
| C | AdminLayout | 包裹 Sidebar + Navbar + children | ❌ |
| D | OrdersAreaChart | 訂單趨勢圖表 | ❌ |

**已有測試（API Routes）：**
- ✅ `/api/admin/invite` — 7 tests（admin.test.js）
- ✅ `/api/admin/remote-config` — 4 tests（admin.test.js）
- ✅ `/api/notifications/*` — 9 tests（notifications.test.js）

### 測試計劃

**Phase 1: Admin 組件（Jest + RTL）**

| 組件 | 預計 | 測試內容 | 狀態 |
|------|------|---------|------|
| AdminSidebar | 5 | 渲染 10 個連結、href 正確、active state、品牌名 | ✅ |
| AdminNavbar | 5 | Logo、用戶名顯示、登出按鈕、陶豬管理員 badge | ✅ |
| AdminLayout | 3 | 渲染 Sidebar + Navbar + children、loading state | ✅ |
| OrdersAreaChart | 3 | 圖表標題、空數據、日期分組 | ✅ |

**Phase 2: Admin 頁面（Jest + RTL, mock Firebase）— 3 個文件，按複雜度分層**

> 📄 詳細記錄：`project-management/ADMIN_TESTING_PLAN.md`

**文件 1：`admin-pages-auth.test.jsx`（Mock 模式 A：Auth + API）**

| 頁面 | 預計 | 測試內容 | 狀態 |
|------|------|---------|------|
| Login (94行)       | ~4 | Google 登入按鈕渲染、loading spinner、已登入自動 redirect、登入失敗 toast | ✅ |
| Dashboard (120行)  | ~4 | 3 張統計卡片、OrdersAreaChart 渲染、loading state、非 admin redirect | ✅ |

**文件 2：`admin-pages-crud.test.jsx`（Mock 模式 B/C：FirebaseFirestoreService / FirestoreService）**

| 頁面 | 預計 | 測試內容 | 狀態 |
|------|------|---------|------|
| Categories (179行) | ~5 | 分類列表渲染、新增表單提交、編輯切換、刪除確認、父分類 select | ✅ |
| Reservations (285行) | ~5 | 預訂列表、狀態篩選 (4種)、狀態更新 dropdown、日期格式化、loading | ✅ |
| Todo (500行) | ~4 | 任務列表渲染、新增任務、完成切換、分類 + 優先級標籤 | ✅ |
| About Setting (436行) | ~4 | 時間線列表、新增項目、編輯表單、上下移動順序 | ✅ |

**文件 3：`admin-pages-complex.test.jsx`（Mock 模式 D：複合型 — Firestore + Storage + Redux）**

| 頁面 | 預計 | 測試內容 | 狀態 |
|------|------|---------|------|
| Products List (266行) | 6 | 產品表格渲染、分類篩選、產品計數、loading spinner、新增產品 link、非 admin redirect | ✅ |
| Add Product (598行) | 6 | 表單欄位渲染、提交/取消按鈕、暢銷 checkbox、圖片驗證錯誤、非 admin redirect、auth loading | ✅ |
| Edit Product (695行) | 4 | 載入現有資料填入表單、loading state、非 admin redirect、產品不存在 redirect | ✅ |
| Home Setting (500行) | 4 | 頁面標題+儲存按鈕、Banner+About sections、即時預覽、Firestore 載入 | ✅ |
| Manage Admins (329行) | 7 | 標題+邀請表單、Admin 列表、"you" badge、auth loading、空 email 錯誤、重複 admin 錯誤、how-to section | ✅ |
| Notifications (318行) | 6 | 標題+設定區塊、email sections、enable/disable toggle、測試區塊、已載入 emails、環境資訊 | ✅ |

### 技術方案

所有 Admin 頁面都是 `'use client'`，Mock 按 4 種模式分類：

| Mock 模式 | 頁面 | 核心依賴 |
|-----------|------|----------|
| **A. Auth + API** | Login, Dashboard | `useAuth`, `AuthService`, `ApiService` |
| **B. FirebaseFirestoreService** | Reservations, Todo, About Setting | `FirebaseFirestoreService` static methods |
| **C. FirestoreService instances** | Categories | `categoryService` instance methods |
| **D. 複合型** | Products ×3, Home Setting, Admins, Notifications | Firestore + Storage + Redux + 直接 Firebase SDK |

**共用 Mock（所有文件）：**
- `next/navigation` → 已在 jest.setup.js 全局 mock
- `react-hot-toast` → `jest.fn()`
- `useAuth()` → `{ isAdmin: true, user: mockAdminUser }`

**模式 B/C 額外 Mock：**
- `FirebaseFirestoreService` → `getDocument` / `getCollection` / `updateDocument` / `setDocument`
- `categoryService` → `getAll` / `create` / `update` / `delete`

**模式 D 額外 Mock：**
- `FirebaseStorageService.uploadFile` → resolved `{ success, url }`
- `firebase/storage` → `ref` / `uploadBytes` / `getDownloadURL`
- `firebase/firestore` → `doc` / `getDoc` / `setDoc` / `deleteDoc` / `collection` / `query` / `getDocs`
- `@/lib/firebase/config` → `{ db: {}, storage: {} }`
- `react-redux` → `useDispatch`
- `productSlice` → `fetchProducts`

### Phase 2 最終成果 ✅

| 指標 | 開始前 | 完成後 |
|------|--------|--------|
| Admin 頁面覆蓋 | 0/12 | **12/12** ✅ |
| 新增測試文件 | 0 | **3** |
| 新增測試數量 | 0 | **68** |
| Jest 總數 | 99 | **183** |
| 全部測試總數 | 203 | **287** |

---

## 🔍 Phase 3：全站測試覆蓋 Gap Analysis

> 📅 審計日期：2026年3月16日
> 📋 觸發原因：Phase 2 Admin 測試完成後，對全站做完整覆蓋檢查，找出剩餘盲點
> 🔬 方法：逐一檢查 23 頁面 + 17 組件 + 15 lib 文件 + 4 API 路由，交叉比對現有 16 個測試文件

### 覆蓋率總覽

| 類別 | 總數 | 已測試 | 覆蓋率 | 備註 |
|------|------|--------|--------|------|
| Admin 頁面 | 12 | 12 | **100%** ✅ | Phase 1+2 完成 |
| Public 頁面 | 11 | 11（E2E + Shop/About Jest） | **100%** ✅ | 全部頁面已覆蓋 |
| 組件 | 17 | 15 | **88%** | ~~ProductDetails~~ ✅ / ColorSwitcher/FirebaseStatus 未測 |
| API 路由 | 4 | 4 | **100%** ✅ | admin + notifications |
| Services/Lib | 15 | 11（6 直測 + 5 mock） | **~73%** | appCheck/colors/themes/store 未測 |

### Gap 優先級

| 優先 | 組件/頁面 | 行數 | 現有覆蓋 | Gap 描述 | 建議測試 |
|------|-----------|------|----------|----------|----------|
| ~~🔴~~ | ~~`ProductDetails.jsx`~~ | ~~259~~ | ✅ **10 Jest** | ~~圖片畫廊、折扣計算、選項選擇、Reserve、相關產品~~ | ✅ 完成 (3/16) |
| ~~🟡~~ | ~~`(public)/shop/page.jsx`~~ | ~~78~~ | ✅ **6 Jest** | ~~Redux useSelector、搜索/分類篩選、categoryService~~ | ✅ 完成 (3/17) |
| ~~🟡~~ | ~~`(public)/about/page.jsx`~~ | ~~191~~ | ✅ **6 Jest** | ~~Firestore timeline 載入、IntersectionObserver、DEFAULT_TIMELINE fallback~~ | ✅ 完成 (3/18) |
| 🟢 | `ColorSwitcher.jsx` | 282 | 零 | Remote Config API + localStorage + CSS 變數切換。Debug 工具，非用戶面向 | 低優先 |
| 🟢 | `FirebaseStatus.jsx` | 138 | 零 | Dev-only 狀態指示器，production 返回 `null` | 低優先 |

### Dead Code 發現

| 文件 | 行數 | 問題 | 建議 |
|------|------|------|------|
| ~~`lib/data/MockData.js`~~ | ~~656~~ | ~~全站零 import~~ | ✅ 已刪除 (3/18) — `MockMiscData.getCategories()` inline 入 `ApiService.js` |

### 未覆蓋但低風險的 Lib

| 文件 | 原因 |
|------|------|
| `lib/firebase/appCheck.js` | 環境初始化，無業務邏輯 |
| `lib/config/colors.js` | 靜態配置 |
| `lib/config/themes.js` | 靜態配置 |
| `lib/store.js` | Redux store 設定，組件測試間接覆蓋 |

### 下一步行動

1. ~~**🔴 ProductDetails 測試**~~ ✅ 完成 (3/16) — 10 tests，覆蓋全部 6 功能區
2. ~~**🟡 Shop 頁面測試**~~ ✅ 完成 (3/17) — 6 tests，搜索/分類篩選/空狀態
3. ~~**🟡 About 頁面測試**~~ ✅ 完成 (3/18) — 6 tests，Hero/Timeline/Firestore/fallback
4. ~~**🗑️ 清理 MockData.js**~~ ✅ 完成 (3/18) — 656 行已刪除，categories inline 入 ApiService
5. ~~**🟡 CI/CD + 覆蓋率報告**~~ ✅ 完成 (3/18) — threshold 啟用 + workflow 修正

---

## ❓ 常見問題

### Q: 為什麼不用 Mock？
A: Mock 測試只測試你的假設，不測試真實行為。如果 Firebase API 改了，Mock 不會發現問題。

### Q: Emulator 測試慢嗎？
A: 52 個測試只需 ~3 秒，非常快。

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
