# 🚀 Firebase Hosting 部署指南

## 📋 前置準備

你已經完成：
- ✅ 在 GitHub 加入了 Firebase 配置 Secrets

還需要：
- 🔑 添加 Firebase Service Account 密鑰（用於自動部署）

---

## 🔑 步驟 1: 獲取 Firebase Service Account Key

### 方法 1: 使用 Firebase CLI（推薦）

```bash
# 1. 安裝 Firebase CLI（如果未安裝）
npm install -g firebase-tools

# 2. 登入 Firebase
firebase login

# 3. 初始化 Firebase Hosting
cd /Users/dinglo/Library/Mobile\ Documents/com~apple~CloudDocs/Project/ecommerce/gocart
firebase init hosting

# 選擇：
# - 使用現有的 project (myloyau)
# - Public directory: out (Next.js static export)
# - Configure as single-page app: Yes
# - Set up automatic builds with GitHub: Yes (這會自動創建 Service Account)
```

### 方法 2: 手動從 Firebase Console 獲取

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇你的項目 `myloyau`
3. 點擊左上角齒輪 ⚙️ → **Project settings**
4. 切換到 **Service accounts** 標籤
5. 點擊 **Generate new private key**
6. 下載 JSON 檔案（⚠️ 保密，不要上傳到 GitHub）

---

## 🔐 步驟 2: 添加 FIREBASE_SERVICE_ACCOUNT Secret

### 使用 GitHub CLI（快速）

```bash
# 1. 如果使用方法2下載了 JSON，讀取檔案內容
cat ~/Downloads/myloyau-xxxxx.json | gh secret set FIREBASE_SERVICE_ACCOUNT -R cliff357/gocart

# 2. 驗證
gh secret list -R cliff357/gocart
```

### 使用 GitHub 網頁介面

1. 前往 https://github.com/cliff357/gocart/settings/secrets/actions
2. 點擊 **New repository secret**
3. Name: `FIREBASE_SERVICE_ACCOUNT`
4. Value: 貼上整個 JSON 檔案內容
5. 點擊 **Add secret**

---

## 📦 步驟 3: 更新 firebase.json 配置

確保 `firebase.json` 配置正確：

```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

## 🚀 步驟 4: 部署到 Firebase Hosting

### 選項 A: 透過 GitHub Actions 自動部署（推薦）

```bash
# 1. Commit 所有變更
git add .
git commit -m "Add Firebase Hosting deployment workflow"

# 2. Push 到 GitHub（會自動觸發部署）
git push origin dev
```

然後：
1. 前往 https://github.com/cliff357/gocart/actions
2. 查看 **Deploy to Firebase Hosting** workflow
3. 等待建置完成（約 3-5 分鐘）
4. 部署完成後，訪問你的網站：https://myloyau.web.app

### 選項 B: 手動部署（測試用）

```bash
# 1. 安裝依賴
npm install

# 2. 建置 Next.js
npm run build

# 3. 部署到 Firebase
firebase deploy --only hosting
```

---

## ✅ 驗證部署

部署成功後：

1. **訪問網站**: https://myloyau.web.app 或 https://myloyau.firebaseapp.com
2. **檢查 Console**: 
   - 按 F12 開啟開發者工具
   - 查看 Console 是否有 Firebase 初始化訊息：
     ```
     ✅ Firebase initialized successfully
     📦 Project: myloyau
     ```
3. **測試功能**:
   - 註冊/登入功能
   - 瀏覽商品
   - 購物車操作

---

## 🔧 故障排除

### 問題 1: GitHub Actions 失敗

**檢查 Secrets 是否完整：**
```bash
gh secret list -R cliff357/gocart
```

應該看到：
- FIREBASE_SERVICE_ACCOUNT
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

### 問題 2: Firebase 初始化失敗

檢查 `lib/firebase/config.js` 的 console 輸出：
```javascript
// 應該看到：
✅ Using Firebase Hosting auto-injected config
✅ Firebase initialized successfully
```

### 問題 3: 404 錯誤

確保 `firebase.json` 的 `public` 設定為 `out`：
```json
{
  "hosting": {
    "public": "out"
  }
}
```

---

## 📊 監控和管理

### Firebase Console

1. **Hosting Dashboard**: https://console.firebase.google.com/project/myloyau/hosting
   - 查看部署歷史
   - 流量統計
   - 域名設定

2. **Usage & Billing**: https://console.firebase.google.com/project/myloyau/usage
   - 監控配額使用
   - 設定預算警報

### GitHub Actions

1. **Workflow 運行記錄**: https://github.com/cliff357/gocart/actions
2. **查看 logs**: 點擊任何 workflow run 查看詳細日誌

---

## 🎯 下一步

部署成功後：

1. ✅ 部署 Firestore Security Rules
2. ✅ 部署 Storage Security Rules  
3. ✅ 啟用 Firebase Authentication
4. ✅ 設定自訂域名（可選）
5. ✅ 啟用 App Check（建議）

詳見 `FIREBASE_SETUP.md` 的後續步驟。

---

## 🆘 需要幫助？

- Firebase 文檔: https://firebase.google.com/docs/hosting
- GitHub Actions 文檔: https://docs.github.com/en/actions
- Next.js 部署: https://nextjs.org/docs/deployment

