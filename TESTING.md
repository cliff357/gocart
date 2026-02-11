# 🧪 LoyaultyClub 測試文檔

> 📅 創建日期：2026年2月5日  
> 📅 最後更新：2026年2月6日  
> 👤 負責人：SA Team  
> 📦 項目：LoyaultyClub (老友賣蘿柚企劃)

---

## 📋 兩日工作總結 (2月5-6日)

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

---

### 🧪 測試結構

```
__tests__/
├── components/
│   └── ui-components.test.jsx    # 25 個組件測試
├── emulator/
│   ├── firestore-rules.test.js   # 24 個權限測試
│   └── firestore-crud.test.js    # 25 個 CRUD 測試
└── utils/
    └── test-utils.js             # 測試工具
```

**總計：74 個測試全部通過 ✅**

---

## 🔍 測試詳解

### 1. Security Rules 測試 (firestore-rules.test.js)

測試你的 `firestore.rules` 是否正確設置權限。

#### Products (7 tests)
| 測試 | 描述 |
|------|------|
| 任何人可讀 | 未登入用戶可以讀取商品列表 |
| Admin 可寫 | 管理員可以新增/修改商品 |
| 普通用戶不可寫 | 非管理員不能修改商品 |
| 訪客不可寫 | 未登入用戶不能新增商品 |
| Admin 可刪 | 管理員可以刪除商品 |
| 非 Admin 不可刪 | 普通用戶不能刪除商品 |
| 任何人可查詢 | 可以 query 商品列表 |

#### Users (4 tests)
| 測試 | 描述 |
|------|------|
| 任何人可讀 | 可以讀取用戶資料（用於顯示用戶名等） |
| 非 Admin 不可寫 | 普通用戶不能創建用戶記錄 |
| 非 Admin 不可改 | 普通用戶不能修改用戶資料 |
| 普通用戶不可刪 | 只有 Admin 可以刪除用戶 |

#### Orders (4 tests)
| 測試 | 描述 |
|------|------|
| 任何人可讀 | 可以讀取訂單 |
| 非 Admin 不可創建 | 只有 Admin 可以創建訂單 |
| 非 Admin 不可更新 | 只有 Admin 可以更新訂單狀態 |
| 非 Admin 不可刪除 | 只有 Admin 可以刪除訂單 |

#### Reservations (5 tests)
| 測試 | 描述 |
|------|------|
| 任何人可創建 | 訪客可以創建預訂（公開功能） |
| 登入用戶可創建 | 登入用戶也可以預訂 |
| 任何人可讀 | 可以讀取預訂資料 |
| 非 Admin 不可更新 | 只有 Admin 可以確認/取消預訂 |
| 非 Admin 不可刪除 | 只有 Admin 可以刪除預訂 |

#### AdminInvites (4 tests)
| 測試 | 描述 |
|------|------|
| 任何人可讀 | 用於驗證邀請碼 |
| 非 Admin 不可創建 | 只有 Admin 可以發邀請 |
| 非 Admin 不可更新 | 只有 Admin 可以更新邀請狀態 |
| 非 Admin 不可刪除 | 只有 Admin 可以刪除邀請 |

---

### 2. Service CRUD 測試 (firestore-crud.test.js)

測試 Firestore 的 CRUD 操作是否正常運作。

#### Products CRUD (6 tests)
- 創建商品
- 讀取商品
- 更新商品
- 刪除商品
- 按分類查詢
- 限制查詢數量 (pagination)

#### Users CRUD (3 tests)
- 讀取用戶
- 按 email 查詢
- 查詢 Admin 用戶

#### Orders CRUD (3 tests)
- 創建訂單
- 訂單結構驗證
- 按狀態查詢

#### Reservations CRUD (3 tests)
- 訪客創建預訂
- 讀取預訂
- Admin 更新預訂狀態

#### Coupons CRUD (2 tests)
- 創建優惠券
- 查詢公開優惠券

#### Categories CRUD (3 tests)
- 創建分類
- 查詢根分類
- 查詢子分類

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

## 🚀 如何運行測試

### 本地運行

```bash
# 運行組件測試（快，0.4 秒）
npm run test:components

# 運行 Emulator 測試（2 秒）
npm run test:emulator

# 運行所有測試
npm run test:all
```

### CI/CD 自動運行

Push 到 GitHub 後會自動：
1. 運行 25 個組件測試
2. 啟動 Firebase Emulator
3. 運行 49 個 Emulator 測試
4. 回報結果

---

## 📁 相關文件

| 文件 | 用途 |
|------|------|
| `jest.config.js` | 組件測試配置 |
| `jest.emulator.config.js` | Emulator 測試配置 |
| `jest.emulator.setup.js` | Emulator 測試初始化 |
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

## 📈 下一步計劃

| 優先級 | 任務 | 狀態 |
|--------|------|------|
| P1 | 組件測試 (ProductCard, Navbar 等) | ⏳ |
| P2 | API Route 測試 | ⏳ |
| P3 | E2E 測試 (Cypress/Playwright) | ⏳ |

---

## ❓ 常見問題

### Q: 為什麼不用 Mock？
A: Mock 測試只測試你的假設，不測試真實行為。如果 Firebase API 改了，Mock 不會發現問題。

### Q: Emulator 測試慢嗎？
A: 49 個測試只需 ~2 秒，非常快。

### Q: CI/CD 需要真實 Firebase 密鑰嗎？
A: 不需要！Emulator 使用 `demo-` 開頭的 Project ID，完全離線運行。

### Q: 如何新增測試？
A: 在 `__tests__/emulator/` 新增測試文件，參考現有格式。
