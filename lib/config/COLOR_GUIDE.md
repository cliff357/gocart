# 🎨 網站配色系統使用指南
## Color System Usage Guide

## 📋 目錄 (Table of Contents)

1. [系統概述](#系統概述)
2. [配色結構](#配色結構)
3. [如何更換配色](#如何更換配色)
4. [使用範例](#使用範例)
5. [配色方案建議](#配色方案建議)
6. [常見問題](#常見問題)

---

## 系統概述

所有網站顏色都集中在 `lib/config/colors.js` 配置檔案中。透過這個系統，你可以：

- ✅ 一次性更換整個網站的配色
- ✅ 維護配色一致性
- ✅ 快速建立不同的主題方案
- ✅ 輕鬆管理品牌色彩

---

## 配色結構

### 主要色系 (Primary Colors)

**用途：** 主要品牌色、按鈕、連結、重要元素

```javascript
primary: {
  50: '#f0fdf4',   // 最淺 - 背景
  100: '#dcfce7',  // 淺色 - 背景
  200: '#bbf7d0',  // Hero 區塊
  300: '#86efac',  // 標籤背景
  400: '#4ade80',  // 評分星星
  500: '#22c55e',  // 主按鈕 ⭐ 最常用
  600: '#16a34a',  // 深色按鈕
  700: '#15803d',  // 成功狀態
}
```

**使用位置：**
- 主要 CTA 按鈕
- 連結文字
- Hero 區塊背景
- 成功訊息
- 評分星星

---

### 中性色系 (Neutral Colors)

**用途：** 文字、背景、邊框、卡片

```javascript
neutral: {
  50: '#f8fafc',   // 最淺 - 卡片背景
  100: '#f1f5f9',  // 搜尋框背景
  200: '#e2e8f0',  // 邊框
  300: '#cbd5e1',  // 分隔線
  500: '#64748b',  // 副文字 ⭐ 最常用
  800: '#1e293b',  // 主要文字 ⭐ 最常用
  900: '#0f172a',  // 深色按鈕 hover
}
```

**使用位置：**
- 文字內容
- 卡片背景
- 輸入框
- 邊框和分隔線

---

### 狀態色彩 (Status Colors)

```javascript
status: {
  success: '#22c55e',  // 成功/已完成 ✅
  warning: '#eab308',  // 警告/進行中 ⚠️
  error: '#ef4444',    // 錯誤/取消 ❌
  info: '#3b82f6',     // 資訊/待處理 ℹ️
}
```

---

## 如何更換配色

### 方法一：快速更換主品牌色 (推薦)

只需修改 `lib/config/colors.js` 中的 `primary` 色系：

```javascript
primary: {
  50: '#fef2f2',   // 改成紅色系
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444',  // 主要紅色
  600: '#dc2626',
  700: '#b91c1c',
}
```

### 方法二：完整主題更換

創建一個新的配色方案：

```javascript
// lib/config/themes/dark-theme.js
export const darkTheme = {
  primary: {
    500: '#6366f1',  // 靛藍色主題
    // ... 其他色階
  },
  neutral: {
    800: '#f9fafb',  // 深色模式下文字變亮
    // ... 其他調整
  }
}
```

然後在 `lib/config/colors.js` 中導入並使用：

```javascript
import { darkTheme } from './themes/dark-theme.js';

const colors = darkTheme; // 或根據條件切換
```

### 方法三：使用 CSS 變數（進階）

在 `app/globals.css` 中覆寫：

```css
:root {
  --color-primary-500: #ef4444; /* 改成紅色 */
  --color-neutral-800: #1f2937; /* 改變文字顏色 */
}
```

---

## 使用範例

### 在 React 組件中使用

```jsx
// 方法 1: 使用 Tailwind 類名 (推薦)
<button className="bg-green-500 text-white hover:bg-green-600">
  點擊按鈕
</button>

// 方法 2: 使用配置中的新名稱
<button className="bg-primary-500 text-white hover:bg-primary-600">
  點擊按鈕
</button>

// 方法 3: 直接引用顏色值
import { getColor } from '@/lib/config/colors';

const MyComponent = () => {
  const primaryColor = getColor('primary.500');
  
  return (
    <div style={{ backgroundColor: primaryColor }}>
      自訂背景色
    </div>
  );
};
```

### 在純 CSS 中使用

```css
.custom-button {
  background-color: var(--color-primary-500);
  color: var(--color-text-inverse);
}

.custom-button:hover {
  background-color: var(--color-primary-600);
}
```

---

## 配色方案建議

### 🌿 清新自然 (目前使用)
- 主色：綠色 (#22c55e)
- 適合：環保、健康、自然產品

### 🔥 熱情活力
```javascript
primary: { 500: '#f97316' } // 橙色
```
- 適合：食品、運動、娛樂

### 💎 專業商務
```javascript
primary: { 500: '#3b82f6' } // 藍色
```
- 適合：科技、金融、企業

### 🎀 優雅時尚
```javascript
primary: { 500: '#ec4899' } // 粉色
```
- 適合：美妝、時尚、女性產品

### 🌙 沉穩深邃
```javascript
primary: { 500: '#6366f1' } // 靛藍
```
- 適合：高端品牌、奢侈品

---

## 常見問題

### Q1: 更換配色後需要重新啟動開發伺服器嗎？

**A:** 是的。修改 `tailwind.config.js` 或 `lib/config/colors.js` 後，需要重新啟動：

```bash
npm run dev
```

### Q2: 如何確保配色無障礙 (Accessibility)？

**A:** 使用對比度檢查工具：
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- 確保文字與背景對比度至少達到 4.5:1

### Q3: 可以為不同頁面設定不同配色嗎？

**A:** 可以！建立多個主題配置，然後根據路由或狀態動態切換：

```javascript
// 在 layout.jsx 或組件中
const theme = route === '/admin' ? adminColors : publicColors;
```

### Q4: 如何保持既有代碼運作的同時逐步遷移？

**A:** `tailwind.config.js` 已經配置了向後兼容：
- `bg-green-500` 和 `bg-primary-500` 都指向相同顏色
- 可以逐步替換，不會破壞現有樣式

### Q5: 配色更新會影響已部署的網站嗎？

**A:** 只有重新構建和部署後才會生效：

```bash
npm run build
# 然後部署到 Vercel 或其他平台
```

---

## 🎯 快速開始

### 立即更換網站主色調：

1. 打開 `lib/config/colors.js`
2. 找到 `primary.500` 這一行
3. 改成你想要的顏色（例如：`'#ef4444'` 變紅色）
4. 儲存檔案
5. 重新啟動開發伺服器：`npm run dev`
6. 查看變化！🎉

---

## 📞 需要幫助？

如果在配色調整上遇到問題：

1. 檢查瀏覽器控制台是否有錯誤
2. 確認 Tailwind CSS 配置正確載入
3. 驗證顏色值格式正確（HEX 格式：`#RRGGBB`）
4. 清除瀏覽器快取並重新載入

---

## 🎨 色彩資源

推薦的配色工具：
- [Coolors.co](https://coolors.co/) - 配色靈感生成器
- [Adobe Color](https://color.adobe.com/) - 專業配色工具
- [Tailwind Color Shades Generator](https://uicolors.app/create) - 生成完整色階

---

**最後更新：** 2024年12月22日  
**版本：** 1.0.0  
**維護者：** GoCart Team
