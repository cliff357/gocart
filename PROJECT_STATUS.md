# LoyaultyClub 網站功能清單

> 📅 最後更新：2026年2月2日
> 📦 項目名稱：LoyaultyClub (老友賣蘿柚企劃)
> 🛠️ 技術棧：Next.js 15.3.8 + Firebase + Tailwind CSS

---

## 📊 項目總覽

| 類別 | 數量 |
|------|------|
| 公開頁面 | 10 個 |
| 管理員頁面 | 12 個 |
| API Routes | 4 條 |
| 組件 | 35+ 個 |
| Redux Slices | 4 個 |
| Firebase 服務 | Auth, Firestore, Storage, App Check |
| 服務層 | FirestoreService, ApiService, AuthService |

---

## 🌐 公開頁面功能 (Public)

### 1. 首頁 `/`
- **Hero Banner** - 可配置的主橫幅圖片，支持位置調整
- **CategoriesMarquee** - 關鍵字跑馬燈動畫
- **Latest Products** - 顯示最新 4 件產品 (按 createdAt 排序)
- **Best Selling** - 顯示熱賣 8 件產品 (按評分數量排序)
- **About Section** - 關於我們區塊，支持影片/GIF/圖片
- **Our Specs** - 服務特色展示區塊 (手作/本土製作等)
- **Newsletter** - 訂閱區塊 (UI only)

### 2. 商店頁 `/shop`
- **產品列表** - 顯示所有產品，從 Redux store 讀取
- **搜索功能** - 支持 `?search=關鍵字` URL 參數
- **分類篩選** - 支持 `?category=分類ID` URL 參數
- **分類名稱解析** - 從 Firestore 載入分類名稱
- **響應式佈局** - 2列(手機) / flex wrap(桌面)

### 3. 產品詳情頁 `/product/[productId]`
- **產品圖片庫** - 多圖切換，桌面 2x2 grid / 手機橫向滾動
- **單圖優化** - 只有一張圖時使用更好的佈局
- **產品選項** - 尺寸/顏色等選項選擇 (動態從產品載入)
- **關聯產品** - 顯示相關產品連結
- **預訂功能** - 開啟預訂 Modal
- **價格顯示** - 支持原價/折扣價對比

### 4. 關於我們 `/about`
- **時間線** - 可配置的里程碑時間線
- **滾動動畫** - Intersection Observer 動畫效果
- **從 Firestore 載入** - 動態內容

### 5. 聯絡我們 `/contact`
- **Email 連結** - loyaultyclub@gmail.com
- **地址信息** - 實體地址
- **社交媒體** - Instagram、Threads 連結

### 6. 購物車 `/cart`
- ⚠️ **Coming Soon** - 功能尚未實現

### 7. 訂單 `/orders`
- ⚠️ **Coming Soon** - 功能尚未實現

### 8. 定價 `/pricing`
- ⚠️ **空白頁面** - 尚未實現

### 9. 私隱政策 `/privacy-policy`
- **靜態頁面** - 完整的私隱政策內容

### 10. 服務條款 `/terms-of-service`
- **靜態頁面** - 完整的服務條款內容

---

## 🧭 導航組件

### Navbar 功能
- **Logo** - 自定義 SVG Logo 組件
- **桌面選單** - Home, Shop (下拉), About
- **分類下拉** - 從 Firestore 載入分類
- **搜索欄** - 搜索產品 (桌面版)
- **響應式** - 自動偵測手機/桌面
- **手機選單** - 漢堡選單 + 抽屜

### Footer 功能
- **分類連結** - 從 Firestore 載入所有分類
- **快速連結** - Home, Shop, About
- **政策連結** - Privacy Policy, Terms of Service
- **社交媒體** - Instagram, Threads, Email

---

## 🔐 管理員後台功能 (Admin)

### 1. Dashboard `/admin`
- **總產品數** - 從 Firestore 獲取
- **總收入** - 從訂單計算
- **總訂單數** - 從 Firestore 獲取
- **訂單圖表** - Area Chart 顯示趨勢
- **權限保護** - 只有 Admin 可訪問

### 2. 產品管理 `/admin/products`
- **新增產品** - 表單輸入產品資料
- **圖片上傳** - 多圖上傳到 Firebase Storage (最多6張)
- **分類選擇** - 從 Firestore 載入分類
- **產品選項** - 添加尺寸/顏色等選項 (name + values)
- **關聯產品** - 搜索並選擇相關產品
- **Bestseller 標記** - 熱賣標籤

### 2.1. 產品列表 `/admin/products/list`
- **所有產品** - 顯示產品表格
- **分類篩選** - 按分類過濾
- **編輯** - 跳轉到編輯頁
- **刪除** - 刪除產品

### 2.2. 編輯產品 `/admin/products/edit/[productId]`
- **載入現有資料** - 從 Firestore 獲取
- **更新產品** - 修改並儲存
- **圖片管理** - 刪除舊圖/添加新圖

### 3. 分類管理 `/admin/categories`
- **新增分類** - 創建主分類
- **子分類** - 支持父子分類結構 (parentId)
- **編輯/刪除** - CRUD 操作
- **樹狀結構** - 視覺化顯示嵌套結構
- **父分類選擇** - 新增時可選父分類

### 4. 預訂管理 `/admin/reservations`
- **預訂列表** - 顯示所有預訂
- **狀態篩選** - pending/confirmed/paid/shipped
- **狀態更新** - 下拉選單更新狀態
- **客戶信息** - 姓名、電郵、電話
- **產品詳情** - 產品名稱、圖片、價格、數量
- **選項顯示** - 顯示客戶選擇的選項
- **工作流程說明** - 顯示狀態流程圖

### 5. 優惠券管理 `/admin/coupons`
- **新增優惠券** - Code、折扣、過期日
- **優惠券類型** - 新用戶/會員/公開
- **刪除優惠券** - CRUD 操作

### 6. 首頁設定 `/admin/home-setting`
- **主橫幅** - 上傳/更換 Banner 圖片
- **位置調整** - 調整圖片焦點位置
- **關於媒體** - 上傳關於區塊的影片/圖片
- **儲存到 Firestore** - 持久化設定

### 7. 關於頁設定 `/admin/about-setting`
- **時間線管理** - 新增/編輯/刪除里程碑
- **順序調整** - 上下移動項目
- **Emoji 選擇** - 為事件選擇圖標
- **即時儲存** - 自動同步 Firestore

### 8. 管理員管理 `/admin/admins`
- **管理員列表** - 顯示所有管理員
- **邀請管理員** - 發送邀請郵件
- **待處理邀請** - 顯示待接受的邀請
- **移除管理員** - 取消管理員權限
- **取消邀請** - 刪除待處理邀請

### 9. 通知設定 `/admin/notifications`
- **收件人管理** - 設定測試/生產環境郵件
- **啟用/停用** - 開關通知功能
- **測試郵件** - 發送測試郵件

### 10. Todo 管理 `/admin/todo`
- **任務列表** - 待辦事項管理 (功能許願樹)
- **分類** - feature/report/improvement/other
- **優先級** - high/medium/low
- **完成狀態** - 標記完成
- **拖拉排序** - 可拖拉重新排序
- **預設任務** - Claim錢功能、Monthly Report 等

### 11. 登入頁 `/admin/login`
- **Google 登入** - Firebase Auth
- **權限檢查** - 驗證 Admin 身份
- **邀請處理** - 自動處理管理員邀請

---

## 🔌 API Routes

### 1. `/api/admin/invite` (POST)
- **用途**: 發送管理員邀請郵件
- **認證**: 🔐 Admin Token (Firebase ID Token)
- **功能**: 使用 Resend API 發送邀請郵件

### 2. `/api/admin/remote-config` (GET/POST)
- **用途**: 網站顏色配置
- **認證**: GET 公開，POST 需要 🔐 Admin Token
- **功能**: 讀取/更新 Firebase Remote Config 顏色

### 3. `/api/notifications/new-order` (POST)
- **用途**: 新訂單通知郵件
- **認證**: 無（內部調用）
- **功能**: 預訂成功時發送郵件給管理員

### 4. `/api/notifications/test` (POST)
- **用途**: 測試郵件發送
- **認證**: 無
- **功能**: 發送測試郵件驗證設定

---

## 🏗️ 服務層架構

### FirestoreService (`lib/services/FirestoreService.js`)
提供 Firestore 數據庫的抽象層

| Service | 功能 |
|---------|------|
| `productService` | 產品 CRUD + 搜索 + 最新 + 有庫存 |
| `categoryService` | 分類 CRUD + 樹狀結構 + 父子關係 |
| `userService` | 用戶 CRUD + 管理員查詢 |
| `orderService` | 訂單 CRUD |
| `ratingService` | 評分 CRUD + 產品評分豐富化 |
| `couponService` | 優惠券 CRUD + 驗證 |
| `addressService` | 地址 CRUD |

### ApiService (`lib/services/ApiService.js`)
API 層包裝，為未來 REST API 做準備

| Service | 功能 |
|---------|------|
| `ProductApiService` | 產品 API 操作 |
| `OrderApiService` | 訂單 API 操作 |
| `CouponApiService` | 優惠券驗證 |
| `DashboardApiService` | Dashboard 數據 + 分析 |
| `MiscApiService` | 規格數據 + 圖片上傳 + 聯絡表單 |

### AuthService (`lib/auth/server.js`)
伺服器端認證工具

| Function | 功能 |
|----------|------|
| `verifyIdToken()` | 驗證 Firebase ID Token |
| `verifyAdminRequest()` | 驗證請求是否來自 Admin |
| `withAdminAuth()` | API Route wrapper，自動驗證 Admin |

### AuthService (`lib/services/AuthService.js`)
客戶端認證工具

| Function | 功能 |
|----------|------|
| `signInWithGoogle()` | Google 登入 |
| `signOutUser()` | 登出 |
| `onAuthStateChange()` | 監聽認證狀態 |
| `getCurrentUser()` | 獲取當前用戶 |

---

## 🧩 主要組件

### 公開組件
| 組件 | 功能 |
|------|------|
| `Navbar` | 導航欄 + 分類下拉 + 搜索 + 響應式 |
| `Footer` | 頁腳 + 分類連結 + 社交媒體 |
| `Hero` | 首頁主橫幅 (從 Firestore 載入) |
| `ProductCard` | 產品卡片 (圖片 + 價格 + 評分) |
| `ProductDetails` | 產品詳情頁主體 |
| `ProductDescription` | 產品描述 + Reviews 標籤頁 |
| `ReservationModal` | 預訂表單彈窗 |
| `LatestProducts` | 最新產品區塊 |
| `BestSelling` | 熱賣產品區塊 |
| `AboutSection` | 關於我們區塊 (支持影片) |
| `CategoriesMarquee` | 關鍵字跑馬燈 |
| `OurSpec` | 服務特色區塊 |
| `Newsletter` | 訂閱區塊 |
| `Logo` | 品牌 Logo (SVG) |
| `Rating` | 評分星星 |
| `Counter` | 數量選擇器 |
| `Title` | 區塊標題 |
| `Banner` | 通用橫幅 |
| `Loading` | 載入動畫 |
| `PageTitle` | 頁面標題 |
| `RatingModal` | 評分彈窗 (未完成) |
| `AddressModal` | 地址表單彈窗 (未完成) |
| `OrderItem` | 訂單項目 (未使用) |
| `OrderSummary` | 訂單摘要 (未使用) |

### 管理員組件
| 組件 | 功能 |
|------|------|
| `AdminLayout` | 管理員佈局 |
| `AdminNavbar` | 管理員導航 |
| `AdminSidebar` | 側邊欄選單 |
| `OrdersAreaChart` | 訂單圖表 |
| `LoginButton` | 登入按鈕 |

### 開發組件
| 組件 | 功能 |
|------|------|
| `ColorSwitcher` | Debug 顏色切換器 |
| `FirebaseStatus` | Firebase 連線狀態指示 |
| `ThemeSwitcherExample` | 主題切換示例 |
| `Logo.examples.js` | Logo 使用範例 |

---

## 🎨 主題系統

### 預設主題 (`lib/config/themes.js`)
| 主題 | 描述 |
|------|------|
| `freshGreenTheme` | 清新綠色 - 環保、健康產品 |
| `vibrantOrangeTheme` | 活力橙色 - 食品、運動產品 |
| `classicBlueTheme` | 經典藍色 - 科技、專業服務 |
| `elegantPurpleTheme` | 優雅紫色 - 美容、時尚產品 |
| `warmBrownTheme` | 溫暖棕色 - 咖啡、手工藝品 |
| `freshTealTheme` | 清新青綠 - 健康、環保產品 |

### 顏色配置 (`lib/config/colors.js`)
- **Primary** - 品牌主色 (50-900 色階)
- **Neutral** - 中性灰色 (50-900 色階)
- **Secondary** - 輔助色
- **Status** - 狀態色 (success/warning/error/info)
- **Functional** - 功能性顏色 (text/background/border)

---

## 🛠️ Debug 模式功能

### 1. FirebaseStatus 狀態指示器
- **位置**: 右下角綠色/紅色圓點
- **條件**: 只在開發環境顯示
- **功能**:
  - 顯示 Firebase 初始化狀態
  - 顯示專案 ID
  - 顯示配置來源
  - 顯示 Auth/Firestore/Storage 連線狀態
  - 顯示缺少的配置項
  - 點擊展開詳細資訊

### 2. ColorSwitcher 顏色切換器
- **位置**: 右下角彩色調色盤按鈕
- **啟用條件**:
  - 開發環境: 自動啟用
  - 生產環境: 需要 `?debug=true&loyau=true` URL 參數
- **功能**:
  - 即時修改網站顏色 (背景、文字、搜索欄、下拉選單)
  - Color Picker 選色
  - 重置為預設顏色
  - 儲存到 Firebase Remote Config (需要 Admin 登入)
  - 從 Remote Config 載入顏色
  - 複製 CSS 變數到剪貼板
  - 顯示當前載入狀態

### 3. Firebase App Check Debug
- **開發環境**: 自動使用 Debug Token
- **功能**:
  - 設定 `NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN` 環境變數
  - 或自動生成新的 Debug Token
  - Console 輸出 Token 供 Firebase Console 註冊

### 4. Console 日誌
- **Firestore 操作**: 所有 CRUD 操作都有日誌
- **API 調用**: 所有 API 請求都有日誌
- **Firebase 初始化**: 顯示配置來源和狀態

---

## 📦 Redux State

### 1. `cart` Slice
```js
{
  total: 0,
  cartItems: {}  // { productId: quantity }
}
```
⚠️ 購物車功能暫時停用

### 2. `product` Slice
```js
{
  list: [],           // 所有產品
  currentProduct: null,
  searchResults: [],
  loading: false,
  error: null
}
```

### 3. `address` Slice
```js
{
  addresses: [],
  selectedAddress: null
}
```

### 4. `rating` Slice
```js
{
  ratings: {},
  averages: {}
}
```

---

## 🔥 Firebase 服務

### 1. Authentication
- Google 登入
- 用戶狀態管理 (onAuthStateChange)
- Admin 權限檢查 (userDoc.isAdmin)
- Firebase ID Token 驗證

### 2. Firestore Collections
| Collection | 用途 | 主要欄位 |
|------------|------|----------|
| `products` | 產品資料 | name, price, mrp, category, images[], options[] |
| `categories` | 分類資料 | name, parentId |
| `reservations` | 預訂記錄 | customerName, productId, status, quantity |
| `users` | 用戶資料 | email, displayName, isAdmin |
| `adminInvites` | 管理員邀請 | email, status, invitedBy |
| `coupons` | 優惠券 | code, discount, expiryDate |
| `orders` | 訂單 | (未使用) |
| `ratings` | 評分 | (未使用) |
| `addresses` | 地址 | (未使用) |
| `settings.home` | 首頁設定 | banners, positions, aboutMedia |
| `settings.about` | 關於頁設定 | timeline[] |
| `settings.notifications` | 通知設定 | testingEmails, productionEmails |
| `settings.todoList` | 待辦事項 | items[] |

### 3. Storage
- 產品圖片上傳 (`products/`)
- Banner 圖片上傳 (`banners/`)
- 關於頁媒體上傳 (`about/`)

### 4. App Check
- reCAPTCHA v3 保護
- 開發環境 Debug Token

### 5. Firebase Low-Level Service (`lib/firebase/firestore.js`)
- `createDocument()` / `getDocument()` / `updateDocument()` / `deleteDocument()`
- `getCollection()` - 支持 where, orderBy, limit
- `searchProducts()` - 簡單搜索
- `subscribeToDocument()` / `subscribeToCollection()` - 實時監聽

---

## 🎨 顏色系統

### CSS 變數
```css
--color-background  /* 網站底色 */
--color-text        /* 文字顏色 */
--color-search-bar  /* 搜索欄背景 */
--color-dropdown    /* 下拉選單背景 */
```

### ColorSwitcher (Debug Mode)
- 開發環境自動啟用
- 生產環境需要 `?debug=true&loyau=true`
- 支持保存到 Remote Config

---

## 📧 Email 服務 (Resend)

### 郵件類型
1. **管理員邀請** - 邀請新管理員
2. **新訂單通知** - 通知管理員有新預訂
3. **測試郵件** - 驗證設定

### 收件人設定
- 測試環境: `testingEmails` array
- 生產環境: `productionEmails` array
- 可在 `/admin/notifications` 設定

---

## ⚠️ 未完成功能

1. **購物車系統** - 已有 Redux slice，但功能停用
2. **訂單系統** - 需要完整的下單流程
3. **付款整合** - PayMe / FPS
4. **評分系統** - 已有 slice + Modal，未接入後端
5. **地址管理** - 已有 slice + Modal，未接入後端
6. **Newsletter** - UI 已有，後端未實現
7. **Reviews 標籤頁** - 產品詳情頁 Reviews tab 顯示 "Coming soon"
8. **搜索功能** - 手機版無搜索欄

---

## 🧪 測試

### Jest + Testing Library
- 組件測試: `__tests__/components/`
- 整合測試: `__tests__/integration/`
- API 測試: `__tests__/api/`
- Service 測試: `__tests__/lib/`

### 執行測試
```bash
npm test          # 運行所有測試
npm run test:watch # 監視模式
npm run test:coverage # 覆蓋率報告
```

---

## 📁 文件結構

```
gocart/
├── app/
│   ├── (public)/          # 公開頁面
│   │   ├── page.jsx       # 首頁
│   │   ├── shop/          # 商店
│   │   ├── product/       # 產品詳情
│   │   ├── about/         # 關於我們
│   │   ├── contact/       # 聯絡我們
│   │   ├── cart/          # 購物車 (Coming Soon)
│   │   ├── orders/        # 訂單 (Coming Soon)
│   │   ├── pricing/       # 定價
│   │   ├── privacy-policy/
│   │   └── terms-of-service/
│   ├── admin/             # 管理員頁面
│   │   ├── page.jsx       # Dashboard
│   │   ├── products/      # 產品管理
│   │   ├── categories/    # 分類管理
│   │   ├── reservations/  # 預訂管理
│   │   ├── coupons/       # 優惠券
│   │   ├── home-setting/  # 首頁設定
│   │   ├── about-setting/ # 關於頁設定
│   │   ├── admins/        # 管理員管理
│   │   ├── notifications/ # 通知設定
│   │   ├── todo/          # 待辦事項
│   │   └── login/         # 登入
│   └── api/               # API Routes
│       ├── admin/
│       └── notifications/
├── components/            # React 組件
│   └── admin/             # Admin 專用組件
├── lib/
│   ├── auth/              # Server-side 認證
│   ├── config/            # 顏色/主題配置
│   ├── context/           # React Context (AuthContext)
│   ├── data/              # Mock Data
│   ├── features/          # Redux Slices
│   │   ├── cart/
│   │   ├── product/
│   │   ├── address/
│   │   └── rating/
│   ├── firebase/          # Firebase 服務
│   │   ├── config.js      # 初始化
│   │   ├── firestore.js   # Firestore 操作
│   │   ├── storage.js     # Storage 操作
│   │   ├── auth.js        # Auth helpers
│   │   └── appCheck.js    # App Check
│   └── services/          # 服務層
│       ├── FirestoreService.js
│       ├── ApiService.js
│       └── AuthService.js
├── assets/                # 靜態資源配置
├── public/                # 靜態檔案
├── __tests__/             # 測試文件
└── scripts/               # 腳本工具
    ├── seedFirebase.mjs   # 種子數據
    ├── setAdmin.mjs       # 設定管理員
    └── deleteStoresCollection.mjs
```

---

## 🚀 部署

### 環境
- **開發**: `npm run dev` (Turbopack)
- **生產**: Vercel 部署

### 環境變數
- Firebase 配置 (NEXT_PUBLIC_FIREBASE_*)
- Firebase Admin SDK (FIREBASE_ADMIN_*)
- Resend API Key (RESEND_API_KEY)
- INTERNAL_API_SECRET

詳見 `.env.example`

---

## 📝 相關文檔

| 文檔 | 描述 |
|------|------|
| `README.md` | 項目簡介 |
| `TESTING.md` | 測試指南 |
| `MIGRATION_GUIDE.md` | 遷移指南 |
| `VERCEL_DEPLOYMENT.md` | Vercel 部署指南 |
| `README_COLOR_SYSTEM.md` | 顏色系統說明 |
| `COLOR_PALETTE.md` | 調色板參考 |
| `COLOR_SYSTEM_INDEX.md` | 顏色系統索引 |
| `QUICK_COLOR_REFERENCE.md` | 快速顏色參考 |
| `lib/config/COLOR_GUIDE.md` | 顏色配置指南 |
| `lib/API_ARCHITECTURE.md` | API 架構說明 |
