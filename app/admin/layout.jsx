'use client'
/**
 * Admin Layout
 * 管理員專區保護層
 */

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import AdminLayout from "@/components/admin/AdminLayout";

export default function RootAdminLayout({ children }) {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // 如果在 login 頁面，不做任何重定向
        if (pathname === '/admin/login') {
            return;
        }

        // 等待載入完成後檢查權限
        if (!loading) {
            if (!isAuthenticated || !isAdmin) {
                // 未登入或非管理員，跳轉到登入頁
                router.replace('/admin/login');
            }
        }
    }, [isAuthenticated, isAdmin, loading, router, pathname]);

    // 如果在 login 頁面，直接顯示（不套用 AdminLayout）
    if (pathname === '/admin/login') {
        return children;
    }

    // Loading 狀態
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">載入中...</p>
                </div>
            </div>
        );
    }

    // 未授權訪問
    if (!isAuthenticated || !isAdmin) {
        return null; // 等待重定向
    }

    // 已授權，顯示 Admin Layout
    return (
        <AdminLayout>
            {children}
        </AdminLayout>
    );
}
