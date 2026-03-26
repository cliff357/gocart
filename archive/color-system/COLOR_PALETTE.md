# 🎨 GoCart 當前配色方案
## Current Color Palette

這個檔案展示網站目前使用的所有顏色。

---

## 主要品牌色 (Primary - Green)

用於：主要按鈕、連結、重要元素、Hero 區塊

| 色階 | 顏色代碼 | 使用場景 | Tailwind 類名 |
|------|---------|---------|--------------|
| 50  | `#f0fdf4` | 最淺綠背景 | `bg-green-50` |
| 100 | `#dcfce7` | 淺綠背景、成功訊息背景 | `bg-green-100` |
| 200 | `#bbf7d0` | Hero 區塊背景 | `bg-green-200` |
| 300 | `#86efac` | 標籤背景、新聞標籤 | `bg-green-300` |
| 400 | `#4ade80` | 評分星星 | `text-green-400` |
| **500** | **`#22c55e`** | **主按鈕、連結** ⭐ | `bg-green-500` |
| 600 | `#16a34a` | 深色按鈕、標籤文字、開關 | `bg-green-600` |
| 700 | `#15803d` | 成功狀態文字 | `text-green-700` |
| 800 | `#166534` | - | - |
| 900 | `#14532d` | - | - |

---

## 中性色系 (Neutral - Slate)

用於：文字、背景、邊框、卡片

| 色階 | 顏色代碼 | 使用場景 | Tailwind 類名 |
|------|---------|---------|--------------|
| 50  | `#f8fafc` | 卡片背景、訂單摘要背景 | `bg-slate-50` |
| 100 | `#f1f5f9` | 搜尋框背景、圖片背景 | `bg-slate-100` |
| 200 | `#e2e8f0` | 邊框、分隔線、輸入框邊框 | `border-slate-200` |
| 300 | `#cbd5e1` | 開關背景、較深分隔線 | `bg-slate-300` |
| 400 | `#94a3b8` | 輸入框邊框、圖示、地址文字 | `text-slate-400` |
| **500** | **`#64748b`** | **副文字、說明文字** ⭐ | `text-slate-500` |
| 600 | `#475569` | 深色文字、按鈕文字、導航文字 | `text-slate-600` |
| 700 | `#334155` | 標題強調、Footer 文字 | `text-slate-700` |
| **800** | **`#1e293b`** | **主要文字、主按鈕背景** ⭐ | `text-slate-800`, `bg-slate-800` |
| 900 | `#0f172a` | 深色按鈕 hover | `hover:bg-slate-900` |

---

## 次要色系 (Secondary)

### 藍色 (Blue)
用於：Hero 次要區塊

| 色階 | 顏色代碼 | 使用場景 | Tailwind 類名 |
|------|---------|---------|--------------|
| 200 | `#bfdbfe` | Hero 藍色區塊背景 | `bg-blue-200` |

---

## 灰色系 (Gray)

用於：評分、切換開關、中性元素

| 色階 | 顏色代碼 | 使用場景 | Tailwind 類名 |
|------|---------|---------|--------------|
| 300 | `#d1d5db` | 未評分星星、中性邊框 | `text-gray-300` |
| 500 | `#6b7280` | 切換按鈕 | `accent-gray-500` |
| 800 | `#1f2937` | Banner 文字 | `text-gray-800` |
| 900 | `#111827` | 深色文字 | `text-gray-900` |

---

## 狀態色 (Status Colors)

### ✅ 成功 (Success - Green)
用於：訂單完成、成功訊息

| 狀態 | 顏色代碼 | 使用場景 |
|------|---------|---------|
| 背景 | `#dcfce7` (`green-100`) | 成功訊息背景 |
| 文字 | `#15803d` (`green-700`) | 成功訊息文字 |
| 按鈕 | `#22c55e` (`green-500`) | 確認按鈕 |

**範例：**
```html
<div class="bg-green-100 text-green-700 px-4 py-2 rounded">
  訂單已成功送出！
</div>
```

---

### ⚠️ 警告 (Warning - Yellow)
用於：進行中的訂單

| 狀態 | 顏色代碼 | 使用場景 |
|------|---------|---------|
| 背景 | `#fef3c7` (`yellow-100`) | 警告訊息背景 |
| 文字 | `#eab308` (`yellow-500`) | 警告訊息文字 |

**範例：**
```html
<div class="bg-yellow-100 text-yellow-500 px-4 py-2 rounded">
  訂單處理中...
</div>
```

---

### ❌ 錯誤 (Error - Red)
用於：錯誤訊息、取消狀態

| 狀態 | 顏色代碼 | 使用場景 |
|------|---------|---------|
| 按鈕 | `#ef4444` (`red-500`) | 刪除、取消按鈕 |
| 文字 | `#b91c1c` (`red-700`) | 錯誤文字 |

**範例：**
```html
<button class="bg-red-500 text-white px-4 py-2 rounded">
  刪除
</button>
```

---

## 組件配色範例

### 主要按鈕 (Primary Button)
```html
<button class="bg-slate-800 text-white hover:bg-slate-900 active:scale-95">
  點擊我
</button>
```
- 背景：`slate-800` (#1e293b)
- 文字：`white`
- Hover：`slate-900` (#0f172a)

---

### 次要按鈕 (Secondary Button)
```html
<button class="bg-green-500 text-white hover:bg-green-600">
  確認
</button>
```
- 背景：`green-500` (#22c55e)
- 文字：`white`
- Hover：`green-600` (#16a34a)

---

### 邊框按鈕 (Outline Button)
```html
<button class="border-2 border-slate-200 text-slate-600 hover:bg-slate-50">
  取消
</button>
```
- 邊框：`slate-200` (#e2e8f0)
- 文字：`slate-600` (#475569)
- Hover：`slate-50` (#f8fafc)

---

### 連結 (Links)
```html
<a href="#" class="text-green-500 hover:underline">
  查看更多
</a>
```
- 文字：`green-500` (#22c55e)
- Hover：加底線

---

### 卡片 (Cards)
```html
<div class="bg-slate-50 border border-slate-200 rounded-lg p-6">
  <h3 class="text-slate-800 font-semibold">標題</h3>
  <p class="text-slate-600">內容</p>
</div>
```
- 背景：`slate-50` (#f8fafc)
- 邊框：`slate-200` (#e2e8f0)
- 標題：`slate-800` (#1e293b)
- 內容：`slate-600` (#475569)

---

### 輸入框 (Input Fields)
```html
<input 
  type="text"
  class="border border-slate-200 outline-slate-400 p-2 rounded"
  placeholder="請輸入..."
/>
```
- 邊框：`slate-200` (#e2e8f0)
- Focus：`slate-400` (#94a3b8)

---

### 標籤 (Tags/Badges)
```html
<!-- 綠色標籤 -->
<span class="bg-green-300 text-green-600 px-3 py-1 rounded-full">
  新品
</span>

<!-- 灰色標籤 -->
<span class="bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
  一般
</span>
```

---

## 頁面配色分佈

### 首頁 (Homepage)
- **Hero 主區塊**：`green-200` 背景
- **Hero 次區塊**：`blue-200` 背景
- **標籤按鈕**：`green-600` 背景，`white` 文字
- **主按鈕**：`slate-800` 背景

### 產品頁面
- **圖片背景**：`slate-100`
- **產品名稱**：`slate-800`
- **價格**：`slate-800`
- **原價（劃線）**：`slate-500`
- **加入購物車按鈕**：`slate-800`

### 導航列 (Navbar)
- **背景**：`white`
- **連結文字**：`slate-600`
- **搜尋框背景**：`slate-100`
- **搜尋圖示**：`slate-600`

### Footer
- **背景**：`white`
- **標題**：`slate-700`
- **連結文字**：`slate-500`
- **分隔線**：`slate-500/30` (透明度 30%)

### 管理後台
- **側邊欄背景**：`slate-800`
- **輸入框邊框**：`slate-200`
- **按鈕背景**：`slate-700`
- **開關已開啟**：`green-600`
- **開關未開啟**：`slate-300`

---

## 色彩使用統計

根據代碼分析：

| 顏色系列 | 使用次數 | 主要用途 |
|---------|---------|---------|
| Slate (中性色) | ~70% | 文字、背景、邊框 |
| Green (品牌色) | ~20% | 按鈕、連結、強調 |
| Gray (灰色) | ~5% | 評分、中性元素 |
| 其他 (藍、黃、紅) | ~5% | 特殊區塊、狀態 |

---

## 色彩對比度檢查

確保無障礙性（WCAG AA 標準：4.5:1）

| 組合 | 對比度 | 狀態 |
|------|--------|------|
| `slate-800` 文字 on `white` 背景 | 14.1:1 | ✅ 優秀 |
| `slate-600` 文字 on `white` 背景 | 7.4:1 | ✅ 優秀 |
| `slate-500` 文字 on `white` 背景 | 4.6:1 | ✅ 通過 |
| `white` 文字 on `green-500` 背景 | 3.0:1 | ⚠️ 需要加粗 |
| `white` 文字 on `slate-800` 背景 | 14.1:1 | ✅ 優秀 |

---

## 快速參考

### 最常用的 10 個顏色

1. `text-slate-800` - 主要文字
2. `text-slate-600` - 副文字
3. `text-slate-500` - 說明文字
4. `bg-slate-100` - 淺背景
5. `bg-slate-50` - 卡片背景
6. `border-slate-200` - 邊框
7. `bg-green-500` - 主色按鈕
8. `text-green-500` - 連結
9. `bg-slate-800` - 深色按鈕
10. `bg-green-200` - Hero 背景

---

**最後更新：** 2024-12-22  
**色彩分析基於：** 100+ 組件分析  
**版本：** 1.0.0
