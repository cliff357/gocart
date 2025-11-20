'use client'
/**
 * Login Button Component
 * 顯示登入/用戶菜單
 */

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { signInWithGoogle, logOut } from '@/lib/services/AuthService';
import { LogIn, LogOut, User, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function LoginButton() {
    const { user, userDoc, isAdmin, isAuthenticated, loading } = useAuth();
    const [showMenu, setShowMenu] = useState(false);

    const handleLogin = async () => {
        const result = await signInWithGoogle();
        if (result.success) {
            toast.success(`歡迎，${result.user.displayName || result.user.email}！`);
        } else {
            toast.error('登入失敗：' + result.error);
        }
    };

    const handleLogout = async () => {
        const result = await logOut();
        if (result.success) {
            toast.success('已登出');
            setShowMenu(false);
        } else {
            toast.error('登出失敗');
        }
    };

    if (loading) {
        return (
            <div className="px-8 py-2 bg-gray-200 animate-pulse rounded-full">
                <span className="text-transparent">Loading</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <button
                onClick={handleLogin}
                className="flex items-center gap-2 px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full"
            >
                <LogIn size={18} />
                登入
            </button>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 transition text-slate-700 rounded-full"
            >
                <User size={18} />
                <span className="hidden sm:inline">{user.displayName || user.email}</span>
                {isAdmin && <Shield size={16} className="text-indigo-500" />}
            </button>

            {showMenu && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-slate-200">
                            <p className="text-sm font-medium text-slate-800">{user.displayName}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                            {isAdmin && (
                                <p className="text-xs text-indigo-600 mt-1 flex items-center gap-1">
                                    <Shield size={12} /> 管理員
                                </p>
                            )}
                        </div>

                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                onClick={() => setShowMenu(false)}
                            >
                                <Shield size={16} />
                                管理後台
                            </Link>
                        )}

                        <Link
                            href="/orders"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            onClick={() => setShowMenu(false)}
                        >
                            我的訂單
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                            <LogOut size={16} />
                            登出
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
