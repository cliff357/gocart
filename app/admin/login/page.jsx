'use client'
/**
 * Admin Login Page
 * 陶豬管理員登入頁面
 */

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { signInWithGoogle } from '@/lib/services/AuthService';
import { LogIn, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

export default function AdminLoginPage() {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // 如果已登入且是 admin，直接跳轉到 admin dashboard
        if (!loading && isAuthenticated && isAdmin) {
            router.replace('/admin');
        }
    }, [isAuthenticated, isAdmin, loading, router]);

    const handleLogin = async () => {
        const result = await signInWithGoogle();
        if (result.success) {
            // 檢查是否為 admin
            const userData = result.userDoc;
            if (userData?.isAdmin) {
                toast.success(`歡迎，陶豬管理員！`);
                // 使用 window.location 確保完整刷新
                window.location.href = '/admin';
            } else {
                toast.error('你沒有管理員權限');
            }
        } else {
            toast.error('登入失敗：' + result.error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">載入中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
                {/* Logo & Title */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <Logo size={80} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">陶豬管理員</h1>
                        <p className="text-slate-500 mt-2">LoyaultyClub Admin Portal</p>
                    </div>
                </div>

                {/* Login Card */}
                <div className="space-y-6">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-start gap-3">
                        <Shield className="text-indigo-600 mt-0.5 flex-shrink-0" size={20} />
                        <div className="text-sm text-indigo-800">
                            <p className="font-medium">管理員專用登入</p>
                            <p className="text-indigo-600 mt-1">請使用已授權的 Google 帳號登入</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogin}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-lg font-medium shadow-lg hover:shadow-xl"
                    >
                        <LogIn size={20} />
                        使用 Google 登入
                    </button>

                    <p className="text-xs text-center text-slate-500">
                        只有授權的管理員帳號才能訪問後台
                    </p>
                </div>
            </div>
        </div>
    );
}
