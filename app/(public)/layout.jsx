'use client'
import { useEffect } from "react";
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ColorSwitcher from "@/components/ColorSwitcher";

// 載入 Remote Config 配色
async function loadRemoteColors() {
    try {
        const response = await fetch('/api/admin/remote-config');
        const data = await response.json();
        
        if (data.success && data.colors) {
            const root = document.documentElement;
            root.style.setProperty('--color-background', data.colors.background);
            root.style.setProperty('--color-text', data.colors.text);
            root.style.setProperty('--color-search-bar', data.colors.searchBar);
            root.style.setProperty('--color-dropdown', data.colors.dropdown);
            console.log('✅ 已載入 Remote Config 配色');
        }
    } catch (err) {
        console.log('Remote Config 載入失敗，使用預設配色');
    }
}

export default function PublicLayout({ children }) {

    // 頁面載入時讀取 Remote Config 配色
    useEffect(() => {
        loadRemoteColors();
    }, []);

    return (
        <>
            {/* Banner temporarily hidden */}
            {/* <Banner /> */}
            <Navbar />
            {children}
            <Footer />
            
            {/* Designer 配色切換器 (debug 模式) */}
            <ColorSwitcher />
        </>
    );
}
