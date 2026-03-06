# 🎨 配色系統快速參考
## Quick Color Reference Guide

---

## 📍 關鍵檔案位置

```
gocart/
├── lib/config/
│   ├── colors.js           # 主配色檔案 ⭐ 主要編輯這個
│   ├── themes.js           # 預設主題方案
│   └── COLOR_GUIDE.md      # 完整使用指南
├── tailwind.config.js      # Tailwind 配置
└── components/
    └── ThemeSwitcherExample.jsx  # 主題切換器範例
```

---
 
## ⚡ 5分鐘快速更換配色

### 方法 A：使用預設主題（最簡單）

1. 打開 `lib/config/colors.js`
2. 在檔案頂部加入：
```javascript
import { getTheme } from './themes.js';
const selectedTheme = getTheme('professionalBlue'); // 選擇你要的主題
```
3. 修改 `primary` 和 `neutral`：
```javascript
const colors = {
  primary: selectedTheme.primary,
  neutral: selectedTheme.neutral,
  // ... 保留其他配置
};
```
4. 儲存，重啟伺服器：`npm run dev`

**可用主題：**
- `freshGreen` - 清新綠色 🌿（目前）
- `vibrantOrange` - 活力橙色 🔥
- `professionalBlue` - 專業藍色 💼
- `elegantPurple` - 優雅紫色 💎
- `warmRed` - 溫暖紅色 ❤️
- `deepIndigo` - 深邃靛藍 🌙
- `freshCyan` - 清新青色 💧
- `softPink` - 溫柔粉色 🎀

---

### 方法 B：只改主色（更快）

1. 打開 `lib/config/colors.js`
2. 找到第 16 行左右的 `primary` 物件
3. 只改 `500` 這個值：

```javascript
primary: {
  // ... 其他不變
  500: '#ef4444',  // 改成你要的顏色！
  // ... 其他不變
}
```

4. 儲存，重啟：`npm run dev`

---

## 🎯 常用顏色代碼

### 主要品牌色
```
bg-green-500    背景：主要按鈕
text-green-500  文字：連結、成功訊息
border-green-500 邊框：強調邊框
```

### 中性色（文字和背景）
```
text-slate-800  深色文字（主要內容）
text-slate-600  中色文字（副標題）
text-slate-500  淺色文字（說明文字）
text-slate-400  更淺文字（次要資訊）

bg-slate-50     最淺背景（卡片）
bg-slate-100    淺背景（搜尋框）
bg-slate-800    深背景（按鈕）
```

### 狀態色
```
bg-green-100 text-green-700   成功 ✅
bg-yellow-100 text-yellow-500 警告 ⚠️
bg-red-500 text-white         錯誤 ❌
```

---

## 🖌️ 推薦的主色搭配

### 如果你想要...

**更年輕活力** → `#f97316` (橙色)  
**更專業商務** → `#3b82f6` (藍色)  
**更優雅時尚** → `#a855f7` (紫色)  
**更溫暖親切** → `#ef4444` (紅色)  
**更科技感** → `#6366f1` (靛藍)  
**更清新** → `#06b6d4` (青色)  
**更甜美** → `#ec4899` (粉色)  

---

## 📝 修改檢查清單

完成配色更換後，檢查這些地方：

- [ ] 首頁 Hero 區塊顏色正確
- [ ] 按鈕顏色正確（主按鈕、次要按鈕）
- [ ] 連結文字顏色正確
- [ ] 導航列樣式正確
- [ ] 產品卡片樣式正確
- [ ] 表單輸入框樣式正確
- [ ] Footer 樣式正確
- [ ] 管理後台樣式正確
- [ ] 手機版/平板版顯示正常
- [ ] 文字對比度足夠（可閱讀性）

---

## 🔧 常見問題速查

### ❌ 改了沒變化？
→ 重啟開發伺服器：`npm run dev`

### ❌ 有些地方顏色沒變？
→ 清除瀏覽器快取：`Cmd + Shift + R` (Mac) 或 `Ctrl + F5` (Windows)

### ❌ 顏色太淺/太深看不清楚？
→ 調整色階：500 是標準色，600/700 更深，400/300 更淺

### ❌ 不知道選什麼顏色？
→ 用工具生成：https://uicolors.app/create

---

## 💡 專業提示

1. **保持對比度**：主色和背景對比度至少 4.5:1
2. **測試深淺模式**：確保兩種模式都好看
3. **少即是多**：不要使用超過 3 種主要顏色
4. **品牌一致性**：配色要符合品牌形象

---

## 🚀 進階功能

### 動態切換主題（未來功能）

目前配色是靜態的，需要重啟才生效。如果需要動態切換：

1. 使用 CSS 變數
2. 搭配 React Context
3. 儲存用戶偏好到 localStorage

參考 `components/ThemeSwitcherExample.jsx` 範例。

---

## 📞 需要協助？

1. 查看完整指南：`lib/config/COLOR_GUIDE.md`
2. 查看主題範例：`lib/config/themes.js`
3. 查看配色配置：`lib/config/colors.js`

---

**最後更新：** 2024-12-22  
**版本：** 1.0.0
