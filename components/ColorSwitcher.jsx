'use client'
/**
 * Color Switcher Component
 * 設計師用顏色切換器 - 即時 Color Picker + Firebase Remote Config
 */

import React, { useState, useEffect } from 'react';
import { Palette, X, RotateCcw, Upload, Check, RefreshCw } from 'lucide-react';

// 預設顏色
const defaultColors = {
    background: '#f5f0e8',
    text: '#4a3c30',
    searchBar: '#e8dfd2',
    dropdown: '#f8f5f0',
};

// 顏色標籤
const colorLabels = {
    background: '網站底色',
    text: '文字顏色',
    searchBar: '搜索欄',
    dropdown: '下拉菜單',
};

export default function ColorSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const [colors, setColors] = useState(defaultColors);
    const [isDebugMode, setIsDebugMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState(''); // 'success' | 'error' | ''

    // 檢查是否為 debug 模式
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const debugParam = urlParams.get('debug');
            const loyauParam = urlParams.get('loyau');
            const debugStorage = localStorage.getItem('debug_mode');
            const isDev = process.env.NODE_ENV === 'development';
            
            // Production 需要 debug=true AND loyau=true
            // Development 只需要 debug=true 或自動開啟
            if (debugParam === 'true' && loyauParam === 'true') {
                // Production 模式：需要雙重驗證
                setIsDebugMode(true);
                localStorage.setItem('debug_mode', 'true');
                localStorage.setItem('loyau_mode', 'true');
            } else if (debugParam === 'false') {
                setIsDebugMode(false);
                localStorage.removeItem('debug_mode');
                localStorage.removeItem('loyau_mode');
            } else if (isDev) {
                // 開發環境自動開啟
                setIsDebugMode(true);
            } else if (debugStorage === 'true' && localStorage.getItem('loyau_mode') === 'true') {
                // Production：從 localStorage 恢復（需要雙重驗證）
                setIsDebugMode(true);
            }

            // 載入顏色
            loadColors();
        }
    }, []);

    // 從 API 讀取 Remote Config 顏色
    const loadColors = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/remote-config');
            const data = await response.json();
            
            if (data.success && data.colors) {
                console.log('✅ 從 Remote Config 載入顏色:', data.colors);
                setColors(data.colors);
                applyColors(data.colors);
                // 也保存到 localStorage
                localStorage.setItem('custom_colors', JSON.stringify(data.colors));
            } else {
                // 備用：從 localStorage 讀取
                const savedColors = localStorage.getItem('custom_colors');
                if (savedColors) {
                    const parsed = JSON.parse(savedColors);
                    setColors(parsed);
                    applyColors(parsed);
                }
            }
        } catch (err) {
            console.log('Remote Config 載入失敗，使用 localStorage:', err);
            const savedColors = localStorage.getItem('custom_colors');
            if (savedColors) {
                const parsed = JSON.parse(savedColors);
                setColors(parsed);
                applyColors(parsed);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // 應用顏色到 CSS 變數
    const applyColors = (colorObj) => {
        const root = document.documentElement;
        root.style.setProperty('--color-background', colorObj.background);
        root.style.setProperty('--color-text', colorObj.text);
        root.style.setProperty('--color-search-bar', colorObj.searchBar);
        root.style.setProperty('--color-dropdown', colorObj.dropdown);
    };

    // 處理顏色變更
    const handleColorChange = (key, value) => {
        const newColors = { ...colors, [key]: value };
        setColors(newColors);
        applyColors(newColors);
        localStorage.setItem('custom_colors', JSON.stringify(newColors));
        setSaveStatus(''); // 清除保存狀態
    };

    // 重置為預設顏色
    const handleReset = () => {
        setColors(defaultColors);
        applyColors(defaultColors);
        localStorage.removeItem('custom_colors');
        setSaveStatus('');
    };

    // 保存到 Firebase Remote Config（通過 API）
    const handleSaveToRemoteConfig = async () => {
        setIsSaving(true);
        setSaveStatus('');
        
        try {
            const response = await fetch('/api/admin/remote-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ colors }),
            });
            
            if (response.ok) {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus(''), 3000);
            } else {
                const data = await response.json();
                throw new Error(data.error || '保存失敗');
            }
        } catch (err) {
            console.error('保存到 Remote Config 失敗:', err);
            setSaveStatus('error');
            alert('保存失敗: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // 複製 CSS 變數
    const handleCopyCSS = () => {
        const css = `:root {
    --color-background: ${colors.background};
    --color-text: ${colors.text};
    --color-search-bar: ${colors.searchBar};
    --color-dropdown: ${colors.dropdown};
}`;
        navigator.clipboard.writeText(css);
        alert('CSS 變數已複製到剪貼板！');
    };

    if (!isDebugMode) return null;

    return (
        <>
            {/* 浮動按鈕 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
                    isOpen 
                        ? 'bg-slate-800 text-white rotate-180' 
                        : 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white hover:scale-110'
                }`}
                title="顏色切換器"
            >
                {isOpen ? <X size={24} /> : <Palette size={24} />}
            </button>

            {/* 顏色選擇面板 */}
            <div className={`fixed bottom-6 right-24 z-50 transition-all duration-300 ${
                isOpen 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 translate-x-10 pointer-events-none'
            }`}>
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-72">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Palette size={20} className="text-purple-500" />
                            Color Picker
                        </h3>
                        <div className="flex gap-1">
                            <button
                                onClick={loadColors}
                                disabled={isLoading}
                                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-600 px-2 py-1 rounded-full flex items-center gap-1"
                                title="從 Remote Config 重新載入"
                            >
                                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                            </button>
                            <button
                                onClick={handleReset}
                                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-full flex items-center gap-1"
                                title="重置為預設"
                            >
                                <RotateCcw size={12} />
                            </button>
                        </div>
                    </div>

                    {/* Color Pickers */}
                    <div className="space-y-3">
                        {Object.entries(colors).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                                <label className="text-sm text-slate-600">
                                    {colorLabels[key]}
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={value}
                                        onChange={(e) => handleColorChange(key, e.target.value)}
                                        className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => handleColorChange(key, e.target.value)}
                                        className="w-20 text-xs font-mono bg-slate-50 border border-slate-200 rounded px-2 py-1"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 保存到 Remote Config 按鈕 */}
                    <button
                        onClick={handleSaveToRemoteConfig}
                        disabled={isSaving}
                        className={`w-full mt-4 text-white text-sm py-2 rounded-lg transition flex items-center justify-center gap-2 ${
                            saveStatus === 'success' 
                                ? 'bg-green-500' 
                                : 'bg-blue-600 hover:bg-blue-700'
                        } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSaving ? (
                            '保存中...'
                        ) : saveStatus === 'success' ? (
                            <>
                                <Check size={16} />
                                已保存！
                            </>
                        ) : (
                            <>
                                <Upload size={16} />
                                確認並推送配色
                            </>
                        )}
                    </button>

                    {/* 複製 CSS 按鈕 */}
                    <button
                        onClick={handleCopyCSS}
                        className="w-full mt-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm py-2 rounded-lg transition"
                    >
                        📋 複製 CSS 變數
                    </button>

                    {/* 說明 */}
                    <p className="text-xs text-slate-400 text-center mt-3">
                        💡 推送後全網站即時生效
                    </p>
                </div>
            </div>
        </>
    );
}
