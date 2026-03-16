# 🔐 Admin 頁面測試計劃 — Phase 2 詳細記錄

> 📅 創建日期：2026年3月13日  
> 📋 來源：83 項 dead code 審計完成後，發現 admin 區域測試覆蓋為零  
> 📦 項目：LoyaultyClub (老友賣蘿柚企劃)

## 📖 本文檔簡介

**呢份文檔係咩？**  
呢份係 Admin 頁面 Jest 測試既完整計劃書，記錄咗 12 個 admin 頁面既依賴分析、mock 模式分類、測試文件結構、同執行順序。

**點解會有呢份文檔？**  
3月12日完成 83 項 dead code 全面審計（`#1`–`#83`）之後，觸發咗一次 admin 區域測試覆蓋檢查，發現 **12 個 admin 頁面 + 4 個 admin 組件全部 0 測試**。Phase 1 即日寫咗 4 個組件既 16 個測試（已通過），Phase 2 就需要一份詳細計劃去處理剩餘 12 個頁面 — 即係呢份文檔。

**相關文檔：**  
- 測試總覽 → [TESTING.md](TESTING.md) 入面既 `🔐 Admin 頁面測試計劃` section  
- Phase 1 測試代碼 → `__tests__/components/admin-components.test.jsx`

---

## 📊 背景

### 事件經過

| 日期  | 事件                                       | 結果                                       |
|-------|--------------------------------------------|--------------------------------------------||
| 3/12  | 完成 83 項 dead code 全面審計（#1–#83）    | 清理 8 個 dead items                       |
| 3/12  | 審計觸發 admin 區域測試覆蓋檢查            | 發現 12 頁面 + 4 組件 = **全部 0 測試**    |
| 3/12  | Phase 1: 寫 admin 組件測試                 | ✅ 16 tests，全部通過                      |
| 3/13  | Phase 2 計劃：分析 12 個 admin 頁面依賴    | 本文檔                                     |
| 3/16  | Phase 2 文件 1: Login + Dashboard 測試      | ✅ 11 tests，全部通過                      |
| 3/16  | Phase 2 文件 2: CRUD 頁面測試                | ✅ 24 tests，全部通過                      |
| 3/16  | Phase 2 文件 3: Complex 頁面測試              | ✅ 33 tests，全部通過。Phase 2 完成！  |

### 審計前後對比

| 指標             | 審計前 | Phase 1 後 | 文件 1 後  | 文件 2 後  | 文件 3 後 ✅ |
|------------------|--------|------------|------------|------------|-------------- |
| Admin 組件測試   | 0      | 16 ✅      | 16         | 16         | 16             |
| Admin 頁面測試   | 0      | 0          | 11 ✅      | 35 ✅      | **68** ✅      |
| Admin API 測試   | 21     | 21         | 21         | 21         | 21             |
| Jest 總數        | 99     | 115        | 126        | 150        | **183**        |

---

## 🔍 Phase 2 依賴分析

### 12 個 Admin 頁面 Import 分析

每個頁面都是 `'use client'`，需要不同程度的 mock。

#### Login (`app/admin/login/page.jsx` — 94 行)
```
useAuth ← @/lib/context/AuthContext
signInWithGoogle ← @/lib/services/AuthService
useRouter ← next/navigation
toast ← react-hot-toast
Logo ← @/components/Logo
```

#### Dashboard (`app/admin/page.jsx` — 120 行)
```
useAuth ← @/lib/context/AuthContext
ProductApiService, OrderApiService ← @/lib/services/ApiService
useRouter ← next/navigation
toast ← react-hot-toast
Loading ← @/components/Loading
OrdersAreaChart ← @/components/OrdersAreaChart
```

#### Categories (`app/admin/categories/page.jsx` — 179 行)
```
categoryService ← @/lib/services/FirestoreService
toast ← react-hot-toast
```

#### Reservations (`app/admin/reservations/page.jsx` — 285 行)
```
FirebaseFirestoreService ← @/lib/firebase/firestore
toast ← react-hot-toast
Image ← next/image
```

#### Todo (`app/admin/todo/page.jsx` — 500 行)
```
FirebaseFirestoreService ← @/lib/firebase/firestore
toast ← react-hot-toast
```

#### About Setting (`app/admin/about-setting/page.jsx` — 436 行)
```
FirebaseFirestoreService ← @/lib/firebase/firestore
toast ← react-hot-toast
```

#### Home Setting (`app/admin/home-setting/page.jsx` — 500 行)
```
FirebaseStorageService ← @/lib/firebase/storage
FirebaseFirestoreService ← @/lib/firebase/firestore
toast ← react-hot-toast
```

#### Products List (`app/admin/products/list/page.jsx` — 266 行)
```
useAuth ← @/lib/context/AuthContext
useRouter ← next/navigation
useDispatch ← react-redux
fetchProducts ← @/lib/features/product/productSlice
productService, categoryService ← @/lib/services/FirestoreService
toast ← react-hot-toast
Image ← next/image
Link ← next/link
```

#### Add Product (`app/admin/products/page.jsx` — 598 行)
```
useAuth ← @/lib/context/AuthContext
useRouter ← next/navigation
useDispatch ← react-redux
fetchProducts ← @/lib/features/product/productSlice
productService, categoryService ← @/lib/services/FirestoreService
storage ← @/lib/firebase/config
ref, uploadBytes, getDownloadURL ← firebase/storage
toast ← react-hot-toast
Image ← next/image
```

#### Edit Product (`app/admin/products/edit/[productId]/page.jsx` — 695 行)
```
useAuth ← @/lib/context/AuthContext
useRouter, useParams ← next/navigation
useDispatch ← react-redux
fetchProducts ← @/lib/features/product/productSlice
productService, categoryService ← @/lib/services/FirestoreService
storage ← @/lib/firebase/config
ref, uploadBytes, getDownloadURL ← firebase/storage
toast ← react-hot-toast
Image ← next/image
```

#### Manage Admins (`app/admin/admins/page.jsx` — 329 行)
```
useAuth ← @/lib/context/AuthContext
useRouter ← next/navigation
userService ← @/lib/services/FirestoreService
db ← @/lib/firebase/config
doc, setDoc, deleteDoc, collection, query, where, getDocs, Timestamp ← firebase/firestore
Loading ← @/components/Loading
toast ← react-hot-toast
```

#### Notifications (`app/admin/notifications/page.jsx` — 318 行)
```
doc, getDoc, setDoc ← firebase/firestore
db ← @/lib/firebase/config
```

---

## 📐 Mock 模式分組

分析完 12 個頁面，可歸納為 4 種 mock 模式：

### 模式 A：Auth + API（最簡單）
**頁面**：Login, Dashboard  
**核心 Mock**：`useAuth`, `AuthService`, `ApiService`  
**特點**：不直接操作 Firestore，透過 Service 層或 Context

### 模式 B：FirebaseFirestoreService（中等）
**頁面**：Reservations, Todo, About Setting  
**核心 Mock**：`FirebaseFirestoreService` (static class methods)  
**特點**：用 `getDocument`/`getCollection`/`updateDocument`/`setDocument`

### 模式 C：FirestoreService instances（中等）
**頁面**：Categories  
**核心 Mock**：`categoryService` (instance methods: `getAll`, `create`, `update`, `delete`)  
**特點**：用 Service instance 而非 static class

### 模式 D：複合型（最複雜）
**頁面**：Products List, Add Product, Edit Product, Home Setting, Manage Admins, Notifications  
**核心 Mock**：混合多種 — Firestore + Storage + Redux + 直接 Firebase SDK  
**特點**：需要 mock 5+ 個 module

---

## 📋 Phase 2 文件結構計劃

按複雜度分 3 個測試文件，由簡到繁：

### 文件 1：`admin-pages-auth.test.jsx`（11 tests）✅

| 頁面               | Tests | Mock 模式 | 測試重點                                                                                      |
|--------------------|-------|-----------|-----------------------------------------------------------------------------------------------|
| Login (94行)       | 5     | A         | Google 登入按鈕渲染、loading spinner、已登入自動 redirect、登入失敗 toast、非 admin toast      |
| Dashboard (120行)  | 6     | A         | 3 張統計卡片、OrdersAreaChart 渲染、loading state、非 admin redirect、auth loading、頁面標題   |

**Mock 清單**：
- `useAuth()` → `{ isAdmin, isAuthenticated, loading, user }`
- `AuthService.signInWithGoogle` → resolved `{ success, userDoc }`
- `ProductApiService.getAllProducts` → resolved `{ data: [...] }`
- `OrderApiService.getAllOrders` → resolved `{ data: [...] }`
- `next/navigation` (useRouter) → 已全局 mock
- `react-hot-toast` → `jest.fn()`
- `@/components/Loading` → 簡單 div
- `@/components/OrdersAreaChart` → 簡單 div
- `@/components/Logo` → 簡單 div

### 文件 2：`admin-pages-crud.test.jsx`（~18 tests）

| 頁面                    | Tests | Mock 模式 | 測試重點                                                                   |
|-------------------------|-------|-----------|----------------------------------------------------------------------------|
| Categories (179行)      | ~5    | C         | 分類列表渲染、新增表單提交、編輯切換、刪除確認、父分類 select              |
| Reservations (285行)    | ~5    | B         | 預訂列表、狀態篩選 (4種 status)、狀態更新 dropdown、日期格式化、loading    |
| Todo (500行)            | ~4    | B         | 任務列表渲染、新增任務、完成切換、分類 + 優先級標籤                        |
| About Setting (436行)   | ~4    | B         | 時間線列表、新增項目、編輯表單、上下移動順序                               |

**Mock 清單**：
- `FirebaseFirestoreService.getDocument` → resolved `{ success, data }`
- `FirebaseFirestoreService.getCollection` → resolved `{ success, data: [...] }`
- `FirebaseFirestoreService.updateDocument` → resolved `{ success }`
- `FirebaseFirestoreService.setDocument` → resolved `{ success }`
- `categoryService.getAll` → resolved `[...]`
- `categoryService.create` / `update` / `delete` → resolved
- `react-hot-toast` → `jest.fn()`
- `next/image` → 已在 jest.config.js 全局 mock

### 文件 3：`admin-pages-complex.test.jsx`（~25 tests）

| 頁面                      | Tests | Mock 模式 | 測試重點                                                                   |
|---------------------------|-------|-----------|----------------------------------------------------------------------------|
| Products List (266行)     | ~4    | D         | 產品表格渲染、分類篩選、刪除確認 dialog、edit/view link                    |
| Add Product (598行)       | ~5    | D         | 表單欄位渲染、必填驗證、圖片 preview、分類 select、提交                    |
| Edit Product (695行)      | ~4    | D         | 載入現有資料填入表單、更新提交、圖片增刪、`useParams`                      |
| Home Setting (500行)      | ~3    | D         | Banner 列表、圖片上傳 mock、儲存按鈕                                       |
| Manage Admins (329行)     | ~5    | D         | Admin 列表、邀請表單 email 驗證、pending invites、移除確認、auth guard      |
| Notifications (318行)     | ~4    | D         | 收件人列表、新增/移除 email、enable/disable toggle、test send               |

**Mock 清單**（包含文件 1+2 所有 mock，額外加）：
- `FirebaseStorageService.uploadFile` → resolved `{ success, url }`
- `firebase/storage` → `{ ref, uploadBytes, getDownloadURL }`
- `firebase/firestore` → `{ doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs, Timestamp }`
- `@/lib/firebase/config` → `{ db: {}, storage: {} }`
- `react-redux` → `{ useDispatch: () => mockDispatch }`
- `@/lib/features/product/productSlice` → `{ fetchProducts: jest.fn() }`
- `userService.getAdmins` → resolved `[...]`

---

## ✅ 最終成果

| 指標             | 開始前 | 完成後      |
|------------------|--------|-------------|
| Admin 頁面覆蓋   | 0/12   | **12/12**   |
| 新增測試文件     | 0      | **3**       |
| 新增測試數量     | 0      | **68**      |
| Jest 總數        | 99     | **183**     |
| 全部測試總數     | 203    | **287**     |

---

## ⚡ 執行順序

1. ~~**文件 1** `admin-pages-auth.test.jsx`~~ ✅ 完成（11 tests, 3/16）
2. ~~**文件 2** `admin-pages-crud.test.jsx`~~ ✅ 完成（24 tests, 3/16）
3. ~~**文件 3** `admin-pages-complex.test.jsx`~~ ✅ 完成（33 tests, 3/16）

> 🎉 Phase 2 全部完成！共 68 個 admin 頁面測試，12/12 頁面覆蓋。

---

## 📝 Archive 文檔參考

檢查過以下 archive 文檔，**無既有 admin page testing 計劃**：

| 文檔                                                | 內容                               | 與 Phase 2 關係                                                          |
|-----------------------------------------------------|------------------------------------|---------------------------------------------------------------------------|
| `archive/project-management/PROGRESS_AND_TODO.md`   | 1月歷史進度（測試基建、CI/CD）     | ❌ 無 admin page testing                                                 |
| `archive/project-management/CODE_REVIEW_REPORT.md`  | 1月代碼審查（安全、組件拆分建議）  | 📋 提到 products page 598行應拆分 — 但係重構建議，唔係測試計劃           |
| `archive/project-management/SESSION_LOG.md`          | 1月 session 記錄                   | ❌ 只有 `admin.test.js` API 測試記錄                                     |

---

> ✅ Phase 2 已完成，本文檔封存。
