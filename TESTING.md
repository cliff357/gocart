# 🧪 LoyaultyClub 測試文檔

> 📅 創建日期：2026年2月5日  
> 📅 最後更新：2026年2月11日  
> 👤 負責人：SA Team  
> 📦 項目：LoyaultyClub (老友賣蘿柚企劃)

---

## 📋 工作總結 (2月5-11日)

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

---

### 🧪 測試結構

```
__tests__/
├── components/
│   └── ui-components.test.jsx    # 25 個組件測試
├── emulator/
│   ├── firestore-rules.test.js   # 36 個權限測試
│   └── firestore-crud.test.js    # 18 個 CRUD 測試
└── utils/
    └── test-utils.js             # 測試工具
```

**總計：79 個測試全部通過 ✅**

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
| P0 | CI/CD 測試通過 → Merge PR | ✅ |
| P1 | 更多 UI 組件測試 (Navbar, Footer 等) | ⏳ |
| P2 | Redux Slice 測試 (cart, product 等) | ⏳ |
| P3 | API Route 測試 | ⏳ |
| P4 | E2E 測試 (Cypress/Playwright) | ⏳ |

---

## ❓ 常見問題

### Q: 為什麼不用 Mock？
A: Mock 測試只測試你的假設，不測試真實行為。如果 Firebase API 改了，Mock 不會發現問題。

### Q: Emulator 測試慢嗎？
A: 54 個測試只需 ~2.5 秒，非常快。

### Q: CI/CD 需要真實 Firebase 密鑰嗎？
A: 不需要！Emulator 使用 `demo-` 開頭的 Project ID，完全離線運行。

### Q: 如何新增測試？
A: 在 `__tests__/emulator/` 新增測試文件，參考現有格式。
