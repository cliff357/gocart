# 🎨 GoCart 配色系統
## Centralized Color Configuration System

完整的網站配色管理系統，讓你可以輕鬆更換整個網站的配色方案。

---

## ✨ 功能特點

- ✅ **集中管理**：所有顏色都在一個檔案中定義
- ✅ **快速切換**：提供 8+ 種預設主題，一鍵切換
- ✅ **向後兼容**：不會破壞現有代碼，可逐步遷移
- ✅ **完整文檔**：詳細的使用指南和範例
- ✅ **類型安全**：支援 JavaScript/TypeScript
- ✅ **易於維護**：清晰的結構和註釋

---

## 📁 檔案結構

```
gocart/
├── lib/config/
│   ├── colors.js              # ⭐ 主配色檔案（主要編輯這個）
│   ├── themes.js              # 8+ 種預設主題方案
│   └── COLOR_GUIDE.md         # 完整使用指南（30+ 頁）
│
├── tailwind.config.js         # Tailwind CSS 配置（已更新）
│
├── components/
│   └── ThemeSwitcherExample.jsx  # 主題切換器範例組件
│
├── QUICK_COLOR_REFERENCE.md   # 快速參考手冊
└── README_COLOR_SYSTEM.md     # 本檔案
```

---

## 🚀 快速開始

### 1️⃣ 使用預設主題（推薦）

**只需 3 步驟：**

```javascript
// 1. 打開 lib/config/colors.js
import { getTheme } from './themes.js';

// 2. 選擇一個主題
const selectedTheme = getTheme('professionalBlue');

// 3. 套用主題
const colors = {
  primary: selectedTheme.primary,
  neutral: selectedTheme.neutral,
  // ... 其他保持不變
};
```

然後重啟開發伺服器：
```bash
npm run dev
```

---

### 2️⃣ 自訂主色

如果只想改主色調，更簡單：

```javascript
// lib/config/colors.js
const colors = {
  primary: {
    // ... 其他不變
    500: '#你的顏色代碼',  // 只改這行！
    // ... 其他不變
  },
};
```

---

## 🎨 可用主題

| 主題名稱 | 代碼 | 適合場景 |
|---------|------|---------|
| 🌿 清新綠色 | `freshGreen` | 環保、健康、自然（目前使用）|
| 🔥 活力橙色 | `vibrantOrange` | 食品、運動、娛樂 |
| 💼 專業藍色 | `professionalBlue` | 科技、金融、企業 |
| 💎 優雅紫色 | `elegantPurple` | 美妝、時尚、創意 |
| ❤️ 溫暖紅色 | `warmRed` | 餐飲、慶典、熱情品牌 |
| 🌙 深邃靛藍 | `deepIndigo` | 奢侈品、高端品牌 |
| 💧 清新青色 | `freshCyan` | 醫療、清潔、水資源 |
| 🎀 溫柔粉色 | `softPink` | 女性產品、美妝、婚禮 |

---

## 📖 文檔導覽

### 新手入門
👉 **先看：** `QUICK_COLOR_REFERENCE.md` （5 分鐘快速參考）

### 詳細教學
👉 **再看：** `lib/config/COLOR_GUIDE.md` （完整使用指南）

### 實作範例
👉 **參考：** `components/ThemeSwitcherExample.jsx` （可視化主題切換器）

### 主題庫
👉 **選擇：** `lib/config/themes.js` （8+ 種預設主題）

---

## 💡 使用範例

### 在 React 組件中

```jsx
// 方法 1: 使用 Tailwind 類名（推薦）
<button className="bg-green-500 text-white hover:bg-green-600">
  按鈕
</button>

// 方法 2: 使用新的配色名稱
<button className="bg-primary-500 text-white hover:bg-primary-600">
  按鈕
</button>

// 方法 3: 程式碼中直接使用
import { getColor } from '@/lib/config/colors';

const MyComponent = () => {
  const primaryColor = getColor('primary.500');
  return <div style={{ backgroundColor: primaryColor }}>內容</div>;
};
```

### 在 CSS 中

```css
.my-button {
  background-color: var(--color-primary-500);
  color: var(--color-text-inverse);
}

.my-button:hover {
  background-color: var(--color-primary-600);
}
```

---

## 🎯 配色組成

### 主要色系
```
primary.500   主品牌色（最常用）
primary.600   深一階（hover 狀態）
primary.400   淺一階（背景、標籤）
```

### 中性色系
```
neutral.800   主要文字
neutral.600   副文字
neutral.500   三級文字
neutral.200   邊框
neutral.100   背景
neutral.50    卡片背景
```

### 狀態色
```
success.DEFAULT   成功/已完成
warning.DEFAULT   警告/進行中
error.DEFAULT     錯誤/取消
info.DEFAULT      資訊/待處理
```

---

## 🔧 常見使用場景

### 場景 1：更換整個網站配色
```javascript
// lib/config/colors.js
import { getTheme } from './themes.js';
const colors = getTheme('professionalBlue'); // 改這裡
```

### 場景 2：只改主色
```javascript
// lib/config/colors.js
primary: { 500: '#ef4444' } // 改這裡
```

### 場景 3：微調某個色階
```javascript
// lib/config/colors.js
primary: {
  // ... 其他不變
  600: '#dc2626', // 調整深色版本
}
```

### 場景 4：新增自訂顏色
```javascript
// lib/config/colors.js
const colors = {
  // ... 現有配色
  custom: {
    accent: '#ff6b6b',
    highlight: '#ffd93d',
  }
};
```

---

## ⚠️ 注意事項

1. **重啟伺服器**：修改配色檔案後需要重啟 `npm run dev`
2. **清除快取**：瀏覽器可能需要清除快取才能看到變化
3. **對比度**：確保文字與背景對比度至少 4.5:1（無障礙要求）
4. **測試**：在不同設備和瀏覽器上測試新配色
5. **一致性**：避免使用超過 3 種主要顏色

---

## 🛠️ 開發建議

### 最佳實踐
- ✅ 使用語意化的顏色名稱（primary, neutral）
- ✅ 在組件中使用 Tailwind 類名
- ✅ 保持配色系統的一致性
- ✅ 定期檢查色彩對比度

### 避免
- ❌ 直接在組件中寫死色碼（如 `#22c55e`）
- ❌ 使用過多不同的顏色
- ❌ 忽略深色模式的適配
- ❌ 不測試就直接上線

---

## 📊 配色來源

目前系統中的配色基於以下分析：

- 分析了 **100+ 處** Tailwind 類名使用
- 識別出 **8 種主要色系**
- 建立了 **150+ 個顏色定義**
- 提供 **8+ 個預設主題**

---

## 🔄 版本歷史

### v1.0.0 (2024-12-22)
- ✅ 初始版本發布
- ✅ 建立集中式配色系統
- ✅ 新增 8+ 種預設主題
- ✅ 完整文檔和範例
- ✅ 向後兼容現有代碼

---

## 🤝 貢獻

如果你建立了好看的主題配色，歡迎加入到 `lib/config/themes.js`！

---

## 📞 獲取幫助

- 📖 查看 **QUICK_COLOR_REFERENCE.md** - 快速參考
- 📚 閱讀 **lib/config/COLOR_GUIDE.md** - 詳細指南
- 💻 參考 **components/ThemeSwitcherExample.jsx** - 實作範例
- 🎨 使用 [UIColors](https://uicolors.app/create) - 生成色階

---

## 📝 授權

與主專案相同授權。

---

**建立日期：** 2024-12-22  
**維護者：** GoCart Team  
**版本：** 1.0.0

---

## 🎉 開始使用

1. 閱讀 `QUICK_COLOR_REFERENCE.md`
2. 選擇一個主題或自訂顏色
3. 修改 `lib/config/colors.js`
4. 重啟伺服器並查看效果！

**祝你打造出美麗的網站配色！** 🎨✨
