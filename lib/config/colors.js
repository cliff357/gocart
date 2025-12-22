/**
 * 網站配色系統配置
 * Site Color System Configuration
 * 
 * 在這個檔案中統一管理所有網站顏色
 * 如需更換配色方案，只需修改此檔案即可
 */

const colors = {
  // ===== 主要品牌色 (Primary Brand Colors) =====
  primary: {
    50: '#f0fdf4',   // 最淺綠色 - 背景使用
    100: '#dcfce7',  // 淺綠色 - 背景使用
    200: '#bbf7d0',  // 淺綠色 - Hero區塊、標籤背景
    300: '#86efac',  // 中淺綠色 - 標籤、提示背景
    400: '#4ade80',  // 中綠色 - 評分星星
    500: '#22c55e',  // 標準綠色 - 主要按鈕、連結
    600: '#16a34a',  // 深綠色 - 按鈕、標籤文字
    700: '#15803d',  // 較深綠色 - 成功狀態文字
    800: '#166534',  // 深綠色 - 深色元素
    900: '#14532d',  // 最深綠色 - 深色元素
  },

  // ===== 中性色系 (Neutral Colors - Slate) =====
  neutral: {
    50: '#f8fafc',   // 最淺灰 - 卡片背景、輸入框背景
    100: '#f1f5f9',  // 淺灰 - 圖片背景、搜尋框背景
    200: '#e2e8f0',  // 淺灰 - 邊框、分隔線
    300: '#cbd5e1',  // 中淺灰 - 分隔線、開關背景
    400: '#94a3b8',  // 中灰 - 輸入框邊框、圖示
    500: '#64748b',  // 標準灰 - 副文字、圖示
    600: '#475569',  // 深灰 - 文字、按鈕文字
    700: '#334155',  // 較深灰 - 標題強調、Footer文字
    800: '#1e293b',  // 深灰 - 主要文字、按鈕背景
    900: '#0f172a',  // 最深灰 - 深色按鈕 hover
  },

  // ===== 次要配色 (Secondary Colors) =====
  secondary: {
    blue: {
      200: '#bfdbfe', // 淺藍色 - Hero區塊背景
    },
  },

  // ===== 狀態色彩 (Status Colors) =====
  status: {
    // 成功/已完成
    success: {
      light: '#dcfce7',  // 淺綠背景
      DEFAULT: '#22c55e', // 標準綠
      dark: '#15803d',    // 深綠文字
    },
    // 警告/進行中
    warning: {
      light: '#fef3c7',  // 淺黃背景
      DEFAULT: '#eab308', // 標準黃
      dark: '#a16207',    // 深黃文字
    },
    // 錯誤/取消
    error: {
      light: '#fee2e2',  // 淺紅背景
      DEFAULT: '#ef4444', // 標準紅
      dark: '#b91c1c',    // 深紅文字
    },
    // 資訊/待處理
    info: {
      light: '#dbeafe',  // 淺藍背景
      DEFAULT: '#3b82f6', // 標準藍
      dark: '#1e40af',    // 深藍文字
    },
  },

  // ===== 功能性顏色 (Functional Colors) =====
  functional: {
    // 文字顏色
    text: {
      primary: '#1e293b',   // 主要文字 (slate-800)
      secondary: '#64748b', // 次要文字 (slate-500)
      tertiary: '#94a3b8',  // 三級文字 (slate-400)
      inverse: '#ffffff',   // 反白文字
    },
    // 背景顏色
    background: {
      primary: '#ffffff',   // 主要背景
      secondary: '#f8fafc', // 次要背景 (slate-50)
      tertiary: '#f1f5f9',  // 三級背景 (slate-100)
    },
    // 邊框顏色
    border: {
      light: '#f1f5f9',     // 淺邊框 (slate-100)
      DEFAULT: '#e2e8f0',   // 標準邊框 (slate-200)
      dark: '#cbd5e1',      // 深邊框 (slate-300)
    },
  },

  // ===== 特殊用途顏色 (Special Purpose Colors) =====
  special: {
    // 評分星星
    rating: {
      active: '#4ade80',    // 已評分 (green-400)
      inactive: '#d1d5db',  // 未評分 (gray-300)
    },
    // reCAPTCHA 和其他第三方元素
    badge: {
      background: '#f1f5f9', // 標籤背景
      text: '#64748b',       // 標籤文字
    },
  },
};

/**
 * 將顏色配置轉換為 Tailwind CSS 變數格式
 * 用於 @tailwind theme 配置
 */
export const getTailwindColors = () => {
  return {
    primary: colors.primary,
    neutral: colors.neutral,
    secondary: colors.secondary.blue,
    success: colors.status.success,
    warning: colors.status.warning,
    error: colors.status.error,
    info: colors.status.info,
  };
};

/**
 * 獲取特定顏色值
 * @param {string} path - 顏色路徑，例如 'primary.500' 或 'neutral.800'
 * @returns {string} - 顏色值
 */
export const getColor = (path) => {
  const keys = path.split('.');
  let value = colors;
  
  for (const key of keys) {
    value = value[key];
    if (!value) return null;
  }
  
  return value;
};

/**
 * CSS 變數映射 (用於非 Tailwind 場景)
 * 可在純 CSS 中使用: var(--color-primary-500)
 */
export const cssVariables = {
  '--color-primary-50': colors.primary[50],
  '--color-primary-100': colors.primary[100],
  '--color-primary-200': colors.primary[200],
  '--color-primary-300': colors.primary[300],
  '--color-primary-400': colors.primary[400],
  '--color-primary-500': colors.primary[500],
  '--color-primary-600': colors.primary[600],
  '--color-primary-700': colors.primary[700],
  '--color-primary-800': colors.primary[800],
  '--color-primary-900': colors.primary[900],
  
  '--color-neutral-50': colors.neutral[50],
  '--color-neutral-100': colors.neutral[100],
  '--color-neutral-200': colors.neutral[200],
  '--color-neutral-300': colors.neutral[300],
  '--color-neutral-400': colors.neutral[400],
  '--color-neutral-500': colors.neutral[500],
  '--color-neutral-600': colors.neutral[600],
  '--color-neutral-700': colors.neutral[700],
  '--color-neutral-800': colors.neutral[800],
  '--color-neutral-900': colors.neutral[900],
  
  '--color-text-primary': colors.functional.text.primary,
  '--color-text-secondary': colors.functional.text.secondary,
  '--color-bg-primary': colors.functional.background.primary,
  '--color-bg-secondary': colors.functional.background.secondary,
};

export default colors;
