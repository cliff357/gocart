/**
 * 主題切換器範例組件
 * Theme Switcher Example Component
 * 
 * 這是一個示範如何實作主題切換功能的範例
 * 可以將這個組件加入到網站的設定頁面或管理後台
 */

'use client';

import { useState } from 'react';
import { themePreview } from '@/lib/config/themes';

export default function ThemeSwitcherExample() {
  const [selectedTheme, setSelectedTheme] = useState('freshGreen');

  const handleThemeChange = (themeId) => {
    setSelectedTheme(themeId);
    
    // 實際使用時，這裡需要：
    // 1. 更新 colors.js 中的配色
    // 2. 重新載入 Tailwind CSS
    // 3. 或使用 CSS 變數動態更換
    
    console.log(`切換到主題: ${themeId}`);
    
    // 範例：儲存到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedTheme', themeId);
    }
    
    // 提示用戶
    alert(`主題已切換到: ${themePreview.find(t => t.id === themeId)?.name}\n\n實際使用時需要重新載入頁面或動態更新 CSS 變數`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          🎨 主題切換器範例
        </h2>
        <p className="text-slate-600 mb-8">
          選擇一個主題來預覽配色效果
        </p>

        {/* 主題選擇網格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {themePreview.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`
                relative p-6 rounded-lg border-2 transition-all
                hover:scale-105 active:scale-95
                ${selectedTheme === theme.id 
                  ? 'border-slate-800 bg-slate-50' 
                  : 'border-slate-200 bg-white'
                }
              `}
            >
              {/* 選中標記 */}
              {selectedTheme === theme.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {/* 主題圖示和顏色 */}
              <div className="flex flex-col items-center gap-3">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-md"
                  style={{ backgroundColor: theme.color }}
                >
                  {theme.icon}
                </div>
                <span className="font-medium text-slate-800 text-center">
                  {theme.name}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* 顏色預覽 */}
        <div className="border-t border-slate-200 pt-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            當前主題預覽：{themePreview.find(t => t.id === selectedTheme)?.name}
          </h3>
          
          {/* 按鈕範例 */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-2">按鈕樣式：</p>
              <div className="flex flex-wrap gap-3">
                <button 
                  className="px-6 py-2 rounded-lg font-medium text-white transition"
                  style={{ backgroundColor: themePreview.find(t => t.id === selectedTheme)?.color }}
                >
                  主要按鈕
                </button>
                <button className="px-6 py-2 rounded-lg font-medium bg-slate-800 text-white hover:bg-slate-900 transition">
                  次要按鈕
                </button>
                <button className="px-6 py-2 rounded-lg font-medium border-2 border-slate-300 text-slate-700 hover:bg-slate-50 transition">
                  邊框按鈕
                </button>
              </div>
            </div>

            {/* 文字範例 */}
            <div>
              <p className="text-sm text-slate-600 mb-2">文字樣式：</p>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-slate-800">主要標題文字</h4>
                <p className="text-slate-600">這是副文字內容，用於描述和說明</p>
                <p className="text-slate-400">這是三級文字，用於不太重要的資訊</p>
              </div>
            </div>

            {/* 卡片範例 */}
            <div>
              <p className="text-sm text-slate-600 mb-2">卡片樣式：</p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <h5 className="font-semibold text-slate-800 mb-2">產品卡片範例</h5>
                <p className="text-slate-600 text-sm mb-4">這是一個使用當前主題配色的卡片元件</p>
                <button 
                  className="w-full py-2 rounded-lg font-medium text-white transition"
                  style={{ backgroundColor: themePreview.find(t => t.id === selectedTheme)?.color }}
                >
                  查看詳情
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 使用說明 */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            ℹ️ 如何實際應用
          </h4>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>打開 <code className="bg-blue-100 px-2 py-0.5 rounded">lib/config/colors.js</code></li>
            <li>從 <code className="bg-blue-100 px-2 py-0.5 rounded">lib/config/themes.js</code> 導入你選擇的主題</li>
            <li>將主題的顏色值替換到 colors.js 中</li>
            <li>重新啟動開發伺服器：<code className="bg-blue-100 px-2 py-0.5 rounded">npm run dev</code></li>
            <li>整個網站的配色就會更新！</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

/**
 * 使用方式：
 * 
 * 在任何頁面中導入並使用這個組件：
 * 
 * import ThemeSwitcherExample from '@/components/ThemeSwitcherExample';
 * 
 * export default function SettingsPage() {
 *   return (
 *     <div>
 *       <ThemeSwitcherExample />
 *     </div>
 *   );
 * }
 */
