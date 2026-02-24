# 🧪 LoyaultyClub 測試文檔

> 📅 創建日期：2026年2月5日  
> 📅 最後更新：2026年2月24日  
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
| Redux Toolkit | 2.8.x | 狀態管理（4 slices：cart、product、address、rating） |
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
         ╱ P4 ╲     E2E 端到端 (Playwright)       — 16 tests
        ╱──────╲
       ╱  P3    ╲    API / Service 邏輯            — 35 tests
      ╱──────────╲
     ╱    P2      ╲   Redux Slice / State          — 27 tests
    ╱──────────────╲
   ╱      P1        ╲  UI 組件渲染 + 交互          — 71 tests
  ╱──────────────────╲
 ╱   P0 (Emulator)    ╲ Security Rules + CRUD      — 54 tests
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
| 數據驗證規則 | 如 rating 必須 1-5 |

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
- Banner 已被註釋掉（`layout.jsx` 中 `{/* <Banner /> */}`），不要測它的頁面可見性
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
| `mockRating` | 標準評分 mock 數據 |
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

### 八、運行測試命令速查

```bash
# 日常開發（最常用，0.6s）
npm test                    # 運行所有 Jest 測試（133 tests）

# 只跑組件測試
npm run test:components     # 只跑 __tests__/components/（71 tests）

# Redux + API Service 測試
npx jest --testPathPatterns=lib   # 只跑 __tests__/lib/（62 tests）

# Emulator 測試（需要 Java 21+）
npm run test:emulator       # 啟動 Emulator → 跑測試 → 自動關閉（54 tests）

# E2E 測試（需要 Chromium）
npm run test:e2e            # 自動啟動 dev server → 跑 Playwright（16 tests）
npm run test:e2e:ui         # Playwright UI 模式（方便 debug）

# 全部一次跑
npm run test:all            # Jest + Emulator
```

### 九、CI/CD 規則

- GitHub Actions 在每次 push 自動運行（`.github/workflows/test.yml`）
- CI 跑的測試：Jest 133 tests + Emulator 54 tests
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
| `Banner` 被註釋掉 | 不要寫 E2E 測試去驗證 Banner 在頁面顯示 |
| About / Contact 指向 `/` | 這些頁面路由不存在，Navbar 連結都指向首頁 |

---

## 📋 工作總結 (2月5日 — 2月24日)

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

---

### 🧪 測試結構

```
__tests__/
├── components/
│   ├── ui-components.test.jsx       # P0: 25 個基礎組件測試
│   └── ui-components-p1.test.jsx    # P1: 46 個進階組件測試
├── emulator/
│   ├── firestore-rules.test.js      # 36 個權限測試
│   └── firestore-crud.test.js       # 18 個 CRUD 測試
├── lib/
│   ├── redux-slices.test.js         # P2: 27 個 Redux Slice 測試
│   └── api-services.test.js         # P3: 35 個 API Service 測試
└── utils/
    └── test-utils.js                # 測試工具

e2e/
└── app.spec.js                      # P4: 16 個 E2E 測試 (Playwright)
```

### 📊 測試統計

| 類型 | 框架 | 數量 | 運行時間 |
|------|------|------|----------|
| UI 組件 (P0+P1) | Jest + Testing Library | 71 | ~0.3s |
| Redux Slice (P2) | Jest | 27 | ~0.1s |
| API Service (P3) | Jest + Fake Timers | 35 | ~0.2s |
| Security Rules | Jest + Firebase Emulator | 36 | ~2s |
| CRUD 操作 | Jest + Firebase Emulator | 18 | ~1s |
| E2E (P4) | Playwright + Chromium | 16 | ~6s |
| **總計** | | **203** | |

> 💡 Jest 測試（133 個）在 0.6 秒內完成！

---

## 🔒 2月11日安全修復

### 1. Next.js CVE-2025-66478
- **問題**：Next.js 15.3.5 存在安全漏洞
- **解決**：升級至 Next.js 16.1.6

### 2. Firestore Rules - 商品創建漏洞
- **問題**：任何用戶可以為任何商店創建商品（缺少擁有權檢查）
- **解決**：添加 `get(...).data.userId == request.auth.uid` 驗證商店擁有權

---

## 🔍 測試詳解

### 1. Security Rules 測試 (firestore-rules.test.js)

測試你的 `firestore.rules` 是否正確設置權限。

> ⚠️ **2月11日更新**：測試已重寫以配合新的 store-based 多商戶架構
> - 使用 `role: 'admin'` 而非 `isAdmin: true`
> - 添加 `isOwner()` 商店擁有權檢查

#### Users Collection (9 tests)
| 測試 | 描述 |
|------|------|
| 已登入用戶可創建自己的 profile | 用戶可以創建自己的資料 |
| 不能為別人創建 profile | 不能冒充其他用戶 |
| 用戶可讀取自己的資料 | 基本隱私保護 |
| 用戶不能讀取其他人的資料 | 用戶資料不公開 |
| Admin 可讀取所有用戶 | 管理員權限 |
| 用戶可更新自己的資料 | 允許修改個人資料 |
| 用戶不能更新別人的資料 | 防止越權修改 |
| Admin 可刪除用戶 | 管理員可管理用戶 |
| 普通用戶不能刪除用戶 | 防止越權刪除 |

#### Products Collection (7 tests)
| 測試 | 描述 |
|------|------|
| 任何人可讀商品 | 商品列表公開 |
| 商店擁有者可創建商品 | 只有自己商店的商品 |
| 不能為別人的商店創建商品 | 🆕 修復的安全漏洞 |
| 商品擁有者可更新商品 | 允許修改自己的商品 |
| 非擁有者不能更新商品 | 防止越權修改 |
| 商品擁有者可刪除商品 | 允許刪除自己的商品 |
| Admin 可刪除任何商品 | 管理員權限 |

#### Orders Collection (5 tests)
| 測試 | 描述 |
|------|------|
| 用戶可創建訂單 | 購物功能 |
| 用戶可讀自己的訂單 | 訂單歷史 |
| 不能讀別人的訂單 | 訂單隱私 |
| Admin 可讀所有訂單 | 管理員權限 |
| Admin 可刪除訂單 | 管理員權限 |

#### Ratings Collection (4 tests)
| 測試 | 描述 |
|------|------|
| 任何人可讀評分 | 評分公開 |
| 登入用戶可創建評分 | 評分功能 |
| 評分必須 1-5 分 | 數據驗證 |
| Admin 可刪除評分 | 管理員權限 |

#### Carts Collection (2 tests)
| 測試 | 描述 |
|------|------|
| 用戶可讀寫自己的購物車 | 購物車功能 |
| 不能讀寫別人的購物車 | 購物車隱私 |

#### Addresses Collection (3 tests)
| 測試 | 描述 |
|------|------|
| 用戶可創建自己的地址 | 地址管理 |
| 用戶可讀自己的地址 | 地址查詢 |
| 不能讀別人的地址 | 地址隱私 |

#### Admin Collection (2 tests)
| 測試 | 描述 |
|------|------|
| Admin 可讀 admin 集合 | 管理員設定 |
| 普通用戶不能讀 admin 集合 | 防止越權 |

#### Default Deny (1 test)
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

#### Ratings CRUD (3 tests)
- 創建評分
- 按商品查詢
- 計算平均評分

#### Coupons CRUD (2 tests)
- 創建優惠券
- 查詢有效優惠券

#### Carts CRUD (2 tests)
- 創建購物車
- 更新購物車

#### Addresses CRUD (2 tests)
- 創建地址
- 按用戶查詢

#### Ratings CRUD (3 tests)
- 創建評分
- 按商品查詢評分
- 計算平均評分

#### Addresses CRUD (2 tests)
- 創建地址
- 按用戶查詢地址

---

### 3. UI 組件測試 (ui-components.test.jsx)

測試 React 組件的渲染和交互。

#### Rating (5 tests)
- 渲染 5 顆星星
- 根據 value 顯示填滿的星星
- value=0/5 邊界測試
- 預設值測試

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

#### Counter (5 tests)
- 顯示當前數量
- 增加/減少按鈕
- 點擊更新 Redux state

#### ProductCard (4 tests)
- 顯示商品名稱和價格
- 連結到產品頁
- 顯示商品圖片

---

### 4. P1 進階 UI 組件測試 (ui-components-p1.test.jsx)

測試更多核心 UI 組件，覆蓋 Navbar、Footer、Banner、Hero 等主要區塊。

#### Navbar (7 tests)
- 渲染 Logo、首頁連結、Shop 連結
- 搜尋輸入框功能
- Login 按鈕、導航分隔線

#### Footer (8 tests)
- 版權資訊、PRODUCTS/CONTACT 區塊
- 社交媒體連結、產品分類連結
- 聯絡資訊、Privacy Policy 連結

#### Banner (5 tests)
- 促銷文字、Claim Offer 按鈕
- 關閉按鈕隱藏 Banner
- Claim Offer 觸發 toast

#### Hero (8 tests)
- 主標題、起始價格
- LEARN MORE 按鈕、NEWS 標籤
- Best products / 20% discounts 區塊
- View more 連結、hero 圖片

#### PageTitle (5 tests)
- 標題、說明文字、連結文字
- 預設/自定義 path

#### Newsletter (4 tests)
- Join Newsletter 標題
- email 輸入框功能
- Get Updates 按鈕

#### OurSpecs (5 tests)
- Our Specifications 標題
- Free Shipping / 7 Days Return / 24/7 Support
- 3 個 spec 項目渲染

#### CategoriesMarquee (4 tests)
- 分類名稱顯示
- 多個分類、按鈕元素
- 重複的分類（marquee 效果）

---

### 5. P2 Redux Slice 測試 (redux-slices.test.js)

測試所有 4 個 Redux Slice 的 reducer 邏輯。

#### cartSlice (9 tests)
- 初始狀態（空購物車 total=0）
- `addToCart`：添加新商品、已存在商品數量 +1、多種商品
- `removeFromCart`：減少數量、數量為 0 時移除
- `deleteItemFromCart`：完全移除、刪除不存在的商品不影響 total
- `clearCart`：清空購物車

#### productSlice (11 tests)
- 初始狀態（空列表 loading=false）
- `setProduct` / `clearProduct`：設置/清空商品列表
- `setCurrentProduct` / `clearCurrentProduct`：設置/清除當前商品
- `setSearchResults` / `clearSearchResults`：設置/清除搜尋結果
- `clearError`：清除錯誤
- `fetchProducts` async thunk：pending/fulfilled/rejected 三種狀態

#### addressSlice (3 tests)
- 初始狀態（有 addressDummyData）
- `addAddress`：添加新地址、添加多個地址

#### ratingSlice (4 tests)
- 初始狀態（空陣列）
- `addRating`：添加評分、多個評分、保留完整資料

---

### 6. P3 API Service 測試 (api-services.test.js)

測試所有 9 個 ApiService 類別。使用 `jest.useFakeTimers()` 跳過 `simulateDelay`，將測試時間從 12.8s 優化至 0.19s。

#### ApiService 中央入口 (1 test)
- 包含所有 9 個服務

#### ProductApiService (7 tests)
- getAllProducts / getProduct / getProductsByCategory
- searchProducts / getCategories
- createProduct（未實現方法返回錯誤）

#### UserApiService (5 tests)
- getAllUsers / getUser / getCurrentUser
- 不存在的用戶返回錯誤
- login（未實現）

#### StoreApiService (4 tests)
- getAllStores / getStore / getStoreByUsername
- 不存在的商店返回錯誤

#### RatingApiService (3 tests)
- getAllRatings / getRating / getRatingsByProduct

#### OrderApiService (4 tests)
- getAllOrders / getOrder
- 不存在的訂單返回錯誤
- createOrder（未實現）

#### AddressApiService (3 tests)
- getAddressesByUser
- 不存在的地址返回錯誤
- createAddress（未實現）

#### CouponApiService (4 tests)
- getAllCoupons / getPublicCoupons
- 不存在的優惠券返回錯誤
- validateCoupon 驗證失敗

#### DashboardApiService (2 tests)
- getAdminDashboard / getStoreDashboard

#### MiscApiService (2 tests)
- getOurSpecs
- uploadImage（未實現）

---

### 7. P4 E2E 測試 (e2e/app.spec.js)

使用 Playwright + Chromium 進行端到端測試，自動啟動 Next.js dev server。

#### 首頁 (6 tests)
- 正確載入首頁（title 檢查）
- Hero 區塊顯示
- Navbar 導航連結
- Our Specifications 區塊
- Newsletter 區塊
- Footer 顯示

#### 導航 (2 tests)
- 點擊 Shop 導航到商店頁面
- 點擊 Logo 回到首頁

#### 商店頁面 (2 tests)
- 顯示商品列表
- 搜尋功能過濾商品

#### 購物車頁面 (2 tests)
- 顯示購物車即將推出
- 瀏覽產品連結導航至 /shop

#### 頁面載入 (2 tests)
- 首頁有正確的 viewport meta tag
- 商店頁面可直接訪問（HTTP 200）

#### 響應式設計 (2 tests)
- 桌面版本（1280px）顯示完整導航
- 手機版本（375px）顯示 Login 按鈕

---

## 🚀 如何運行測試

### 本地運行

```bash
# 運行所有 Jest 測試（組件 + Redux + API Service，133 tests，~0.6s）
npm run test:components

# 運行 Emulator 測試（54 tests，~2.5s）
npm run test:emulator

# 運行 E2E 測試（16 tests，~6s，自動啟動 dev server）
npm run test:e2e

# 運行 E2E 測試（帶 UI 模式）
npm run test:e2e:ui

# 運行所有測試
npm run test:all
```

### CI/CD 自動運行

Push 到 GitHub 後會自動：
1. 運行 133 個 Jest 測試（組件 + Redux + API）
2. 啟動 Firebase Emulator
3. 運行 54 個 Emulator 測試
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
| P1 | UI 組件測試 (Navbar, Footer, Banner, Hero 等 46 tests) | ✅ 完成 |
| P2 | Redux Slice 測試 (cart, product, address, rating 27 tests) | ✅ 完成 |
| P3 | API Service 測試 (9 個 Service 類別 35 tests) | ✅ 完成 |
| P4 | E2E 測試 (Playwright + Chromium 16 tests) | ✅ 完成 |

### 🎯 後續可改進方向

| 優先 | 任務 | 說明 |
|------|------|------|
| 🔴 高 | 真實 API 替換 MockData | ApiService 目前用 MockData，接真實 Firebase 後要更新測試 |
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
A: 54 個測試只需 ~2.5 秒，非常快。

### Q: CI/CD 需要真實 Firebase 密鑰嗎？
A: 不需要！Emulator 使用 `demo-` 開頭的 Project ID，完全離線運行。

### Q: 如何新增測試？
A: 
- **組件測試**：在 `__tests__/components/` 新增 `.test.jsx` 文件
- **Redux 測試**：在 `__tests__/lib/` 新增 `.test.js` 文件
- **Emulator 測試**：在 `__tests__/emulator/` 新增（使用 `jest.emulator.config.js`）
- **E2E 測試**：在 `e2e/` 新增 `.spec.js` 文件

### Q: API Service 測試為什麼用 Fake Timers？
A: ApiService 使用 `simulateDelay` 模擬網路延遲。使用 `jest.useFakeTimers()` 可以跳過等待，將 35 個測試從 12.8 秒降至 0.19 秒。

### Q: E2E 測試需要什麼環境？
A: 需要安裝 Playwright 和 Chromium (`npx playwright install chromium`)。測試會自動啟動 Next.js dev server。
