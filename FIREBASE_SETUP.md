# Environment Variables Configuration

## 本地開發環境配置

### 步驟 1：創建 `.env.local` 文件

```bash
# 在項目根目錄執行
cp .env.example .env.local
```

`.env.local` 文件將包含您的 Firebase 配置（從 `.env.example` 複製）：

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_from_firebase_console
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CURRENCY_SYMBOL=$
NEXT_PUBLIC_APP_NAME=MyLoYau

# Admin Configuration (Server-side only - 需要生成)
ADMIN_SECRET_KEY=your_admin_secret_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

**⚠️ 重要：請從你的 Firebase Console 獲取實際配置值，不要使用文檔中的示例值。**

### 步驟 2：生成服務器端 Secrets

```bash
# 生成 ADMIN_SECRET_KEY
openssl rand -base64 32

# 生成 NEXTAUTH_SECRET
openssl rand -base64 32
```

將生成的值複製到 `.env.local` 文件中。

### ⚠️ 安全提醒

- ✅ `.env.local` 已在 `.gitignore` 中，不會被提交到 Git
- ✅ `.env.example` 可以提交，用作範本
- ❌ **絕對不要**將 `.env.local` 提交到 Git
- ❌ **絕對不要**在代碼中硬編碼 API Keys

---

## GitHub Secrets 配置（用於 CI/CD）

### 方法 1：使用 GitHub Web 介面

#### 步驟 1：前往 GitHub Repository 設置

```
https://github.com/cliff357/gocart/settings/secrets/actions
```

或手動導航：
1. 打開你的 GitHub repository
2. 點擊 **Settings**
3. 左側菜單選擇 **Secrets and variables** → **Actions**
4. 點擊 **New repository secret**

#### 步驟 2：添加以下 Secrets

**Firebase Configuration Secrets**（公開配置，可暴露給客戶端）：

| Secret Name | Value (從 Firebase Console 獲取) |
|------------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | 從 Firebase Console → Project Settings → General → Your apps |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | 你的 Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | 你的 Messaging Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | 你的 Firebase App ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | 你的 Google Analytics Measurement ID |

**App Configuration Secrets**：

| Secret Name | Value |
|------------|-------|
| `NEXT_PUBLIC_APP_NAME` | `MyLoYau` |
| `NEXT_PUBLIC_CURRENCY_SYMBOL` | `$` |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.com` *(生產環境 URL)* |

**Server-Side Secrets**（敏感配置，僅服務器端使用）：

| Secret Name | Value |
|------------|-------|
| `ADMIN_SECRET_KEY` | *(使用 `openssl rand -base64 32` 生成)* |
| `NEXTAUTH_SECRET` | *(使用 `openssl rand -base64 32` 生成)* |
| `NEXTAUTH_URL` | `https://your-domain.com` |

### 方法 2：使用 GitHub CLI（推薦）

```bash
# 安裝 GitHub CLI（如果未安裝）
brew install gh  # macOS
# 或 apt install gh  # Ubuntu

# 登入 GitHub
gh auth login

# 設置 Firebase Secrets（替換為你的實際值）
gh secret set NEXT_PUBLIC_FIREBASE_API_KEY -b "your_api_key_here"
gh secret set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN -b "your-project.firebaseapp.com"
gh secret set NEXT_PUBLIC_FIREBASE_PROJECT_ID -b "your-project-id"
gh secret set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET -b "your-project.appspot.com"
gh secret set NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID -b "your_sender_id"
gh secret set NEXT_PUBLIC_FIREBASE_APP_ID -b "your_app_id"
gh secret set NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID -b "your_measurement_id"

# 設置 App Configuration
gh secret set NEXT_PUBLIC_APP_NAME -b "MyLoYau"
gh secret set NEXT_PUBLIC_CURRENCY_SYMBOL -b "$"

# 生成並設置 Server-Side Secrets
gh secret set ADMIN_SECRET_KEY -b "$(openssl rand -base64 32)"
gh secret set NEXTAUTH_SECRET -b "$(openssl rand -base64 32)"

# 驗證設置
gh secret list
```

### 方法 3：使用自動化腳本

創建 `scripts/setup-github-secrets.sh`：

```bash
#!/bin/bash

echo "🔐 設置 GitHub Secrets..."

# 檢查 gh CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI 未安裝，請先執行: brew install gh"
    exit 1
fi

# 檢查登入狀態
if ! gh auth status &> /dev/null; then
    echo "❌ 請先登入 GitHub: gh auth login"
    exit 1
fi

# Firebase Secrets - 從你的 Firebase Console 獲取這些值
echo "📦 設置 Firebase 配置..."
echo "⚠️ 請手動替換以下值為你的實際 Firebase 配置"

# 方式 1: 手動輸入每個值
read -p "NEXT_PUBLIC_FIREBASE_API_KEY: " FIREBASE_API_KEY
read -p "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: " FIREBASE_AUTH_DOMAIN
read -p "NEXT_PUBLIC_FIREBASE_PROJECT_ID: " FIREBASE_PROJECT_ID
read -p "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: " FIREBASE_STORAGE_BUCKET
read -p "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: " FIREBASE_MESSAGING_SENDER_ID
read -p "NEXT_PUBLIC_FIREBASE_APP_ID: " FIREBASE_APP_ID
read -p "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: " FIREBASE_MEASUREMENT_ID

gh secret set NEXT_PUBLIC_FIREBASE_API_KEY -b "$FIREBASE_API_KEY"
gh secret set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN -b "$FIREBASE_AUTH_DOMAIN"
gh secret set NEXT_PUBLIC_FIREBASE_PROJECT_ID -b "$FIREBASE_PROJECT_ID"
gh secret set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET -b "$FIREBASE_STORAGE_BUCKET"
gh secret set NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID -b "$FIREBASE_MESSAGING_SENDER_ID"
gh secret set NEXT_PUBLIC_FIREBASE_APP_ID -b "$FIREBASE_APP_ID"
gh secret set NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID -b "$FIREBASE_MEASUREMENT_ID"

# App Configuration
echo "⚙️ 設置應用配置..."
gh secret set NEXT_PUBLIC_APP_NAME -b "MyLoYau"
gh secret set NEXT_PUBLIC_CURRENCY_SYMBOL -b "$"

# Server-Side Secrets
echo "🔒 生成服務器端 Secrets..."
ADMIN_SECRET=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

gh secret set ADMIN_SECRET_KEY -b "$ADMIN_SECRET"
gh secret set NEXTAUTH_SECRET -b "$NEXTAUTH_SECRET"

echo ""
echo "✅ GitHub Secrets 設置完成！"
echo ""
echo "📋 已設置的 Secrets："
gh secret list

echo ""
echo "💡 記得更新 .env.local 中的服務器端 Secrets："
echo "ADMIN_SECRET_KEY=$ADMIN_SECRET"
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
```

執行腳本：

```bash
chmod +x scripts/setup-github-secrets.sh
./scripts/setup-github-secrets.sh
```

---

## Vercel 部署配置（可選）

如果使用 Vercel 部署，需要在 Vercel 項目設置中添加相同的環境變數：

### 方法 1：使用 Vercel CLI

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入 Vercel
vercel login

# 設置環境變數
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
# 輸入值: AIzaSyAcn8EeoVP11FyRWeS71IaMCw2Z8_VqMXg

# 重複以上步驟添加所有變數
```

### 方法 2：使用 Vercel Web 介面

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇你的項目
3. 點擊 **Settings** → **Environment Variables**
4. 添加所有 `NEXT_PUBLIC_*` 變數
5. 選擇環境：Production, Preview, Development

---

## 驗證配置

### 本地驗證

```bash
# 啟動開發服務器
npm run dev

# 查看控制台輸出
# 應該看到：
# ✅ Using environment variables config
# ✅ Firebase initialized successfully
# 📦 Project: myloyau
```

### 生產環境驗證

```bash
# 構建應用
npm run build

# 檢查構建輸出
# 確保沒有 Firebase 配置相關錯誤
```

### GitHub Actions 驗證

創建 `.github/workflows/verify-firebase.yml`：

```yaml
name: Verify Firebase Configuration

on:
  push:
    branches: [dev, main]
  pull_request:
    branches: [dev, main]

jobs:
  verify:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Verify Firebase Config
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }}
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}
          NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_APP_ID }}
          NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID }}
        run: |
          echo "Checking Firebase configuration..."
          npm run build
          
      - name: Check Firebase Status
        run: |
          node -e "
          const { getFirebaseStatus } = require('./lib/firebase/config');
          const status = getFirebaseStatus();
          console.log('Firebase Status:', JSON.stringify(status, null, 2));
          if (!status.initialized) {
            console.error('❌ Firebase not initialized');
            process.exit(1);
          }
          console.log('✅ Firebase initialized successfully');
          "
```

---

## 常見問題排查

### 問題 1：本地開發環境無法載入配置

**檢查清單**：
- [ ] `.env.local` 文件是否存在？
- [ ] 變數名稱是否正確（包括 `NEXT_PUBLIC_` 前綴）？
- [ ] 重啟開發服務器（`npm run dev`）

### 問題 2：GitHub Actions 構建失敗

**檢查清單**：
- [ ] 所有 Secrets 是否已添加到 GitHub？
- [ ] Secret 名稱是否與 workflow 中的匹配？
- [ ] 使用 `gh secret list` 驗證

### 問題 3：Vercel 部署後配置錯誤

**檢查清單**：
- [ ] 環境變數是否添加到 Vercel 項目設置？
- [ ] 選擇的環境（Production/Preview/Development）是否正確？
- [ ] 重新部署項目

## Firebase 項目設置步驟

### 1. 創建 Firebase 項目
1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊 "Add project" 或 "創建項目"
3. 輸入項目名稱 (例如: "myloyau-ecommerce")
4. 選擇是否啟用 Google Analytics
5. 創建項目

### 2. 設置 Web App
1. 在項目概覽中，點擊 "Add app" 圖標 (`</>`)
2. 輸入 App 暱稱 (例如: "MyLoYau Web")
3. 選擇是否設置 Firebase Hosting
4. 註冊 app
5. 複製 Firebase SDK 配置信息

### 3. 啟用所需服務

#### Authentication
1. 前往 Authentication → Get started
2. 在 Sign-in method 標籤中啟用：
   - Email/Password
   - Google (推薦)
   - 其他您需要的方法

#### Firestore Database
1. 前往 Firestore Database → Create database
2. 選擇 "Start in test mode" (稍後可修改規則)
3. 選擇最近的位置

#### Storage
1. 前往 Storage → Get started
2. 選擇 "Start in test mode" (稍後可修改規則)
3. 選擇最近的位置

### 4. 配置安全規則

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products are readable by all, writable by store owners
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && (
        request.auth.uid == resource.data.userId || 
        hasAdminRole()
      );
    }
    
    // Stores are readable by all, writable by owners
    match /stores/{storeId} {
      allow read: if true;
      allow write: if request.auth != null && (
        request.auth.uid == resource.data.userId ||
        hasAdminRole()
      );
    }
    
    // Orders are readable/writable by users and store owners
    match /orders/{orderId} {
      allow read, write: if request.auth != null && (
        request.auth.uid == resource.data.userId ||
        request.auth.uid == resource.data.storeUserId ||
        hasAdminRole()
      );
    }
    
    // Ratings are readable by all, writable by authenticated users
    match /ratings/{ratingId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Admin function
    function hasAdminRole() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Products images - readable by all, writable by authenticated users
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Store images - readable by all, writable by store owners
    match /stores/{storeId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && (
        request.auth.uid == getStoreOwner(storeId) ||
        hasAdminRole()
      );
    }
    
    // User images - readable by all, writable by user
    match /users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Temporary files - writable by authenticated users
    match /temp/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    // Helper functions
    function getStoreOwner(storeId) {
      return firestore.get(/databases/(default)/documents/stores/$(storeId)).data.userId;
    }
    
    function hasAdminRole() {
      return request.auth != null && 
             firestore.exists(/databases/(default)/documents/users/$(request.auth.uid)) &&
             firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 環境變數獲取方式

### Firebase 配置信息位置：
1. 在 Firebase Console 中
2. 前往 Project settings (齒輪圖標)
3. 在 "Your apps" 部分選擇您的 Web app
4. 在 "SDK setup and configuration" 中找到配置對象

### 配置格式示例：
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyX...", // → NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "project.firebaseapp.com", // → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "project-id", // → NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "project.appspot.com", // → NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789", // → NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc", // → NEXT_PUBLIC_FIREBASE_APP_ID
  measurementId: "G-ABCDEFGHIJ" // → NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
```

## 安全性注意事項

1. **NEXT_PUBLIC_** 前綴的變數會暴露給客戶端，確保不包含敏感信息
2. 服務器端敏感變數（如 ADMIN_SECRET_KEY）不要加 NEXT_PUBLIC_ 前綴
3. 在 Firebase 控制台中正確配置安全規則
4. 定期輪換 API keys 和 secrets
5. 在生產環境中禁用 Firebase 的測試模式

## 部署前檢查清單

- [ ] Firebase 項目已創建並配置
- [ ] 所有必要的 Firebase 服務已啟用
- [ ] 安全規則已正確設置
- [ ] 所有環境變數已添加到 GitHub Secrets
- [ ] 本地 .env.local 文件已創建並測試
- [ ] Firebase SDK 版本與項目兼容
- [ ] 域名已在 Firebase Authentication 中授權