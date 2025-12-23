'use client'
/**
 * Admin Login Page
 * 陶豬管理員登入頁面
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { signInWithGoogle } from '@/lib/services/AuthService';
import { LogIn, Shield, Info, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import Logo from '@/components/Logo';

export default function AdminLoginPage() {
    const { isAuthenticated, isAdmin, loading, user, userDoc } = useAuth();
    const router = useRouter();
    const [showDebug, setShowDebug] = useState(false);

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
                router.push('/admin');
            } else {
                toast.error('你沒有管理員權限');
                // 可選：自動登出非管理員用戶
                // await logOut();
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
            {/* Debug Panel - Full Width */}
            {showDebug && (
                <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-gray-50 border-b border-gray-200 shadow-lg max-h-96 overflow-y-auto">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="text-blue-600" size={20} />
                            <h2 className="text-lg font-medium text-gray-800">🔥 Firebase Debug Information</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            {/* Firebase Configuration */}
                            <div className="p-3 bg-white rounded border">
                                <h3 className="font-medium text-gray-800 mb-2">📋 Firebase Configuration</h3>
                                <div className="space-y-1 font-mono text-xs">
                                    <div><span className="text-blue-600">Project ID:</span> {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}</div>
                                    <div><span className="text-blue-600">Auth Domain:</span> {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}</div>
                                    <div><span className="text-blue-600">API Key:</span> {process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.slice(0, 20)}...</div>
                                </div>
                            </div>

                            {/* Current User Status */}
                            <div className="p-3 bg-white rounded border">
                                <h3 className="font-medium text-gray-800 mb-2">👤 Current User Status</h3>
                                <div className="space-y-1 font-mono text-xs">
                                    <div><span className="text-blue-600">Authenticated:</span> {user ? '✅ Yes' : '❌ No'}</div>
                                    <div><span className="text-blue-600">Email:</span> {user?.email || 'N/A'}</div>
                                    <div><span className="text-blue-600">UID:</span> {user?.uid?.slice(0, 8) || 'N/A'}...</div>
                                    <div><span className="text-blue-600">Is Admin:</span> {isAdmin ? '✅ Yes' : '❌ No'}</div>
                                </div>
                            </div>

                            {/* User Document */}
                            <div className="p-3 bg-white rounded border">
                                <h3 className="font-medium text-gray-800 mb-2">📄 User Document</h3>
                                <div className="space-y-1 font-mono text-xs">
                                    {userDoc ? (
                                        <>
                                            <div><span className="text-blue-600">Document Found:</span> ✅ Yes</div>
                                            <div><span className="text-blue-600">isAdmin Field:</span> {userDoc.isAdmin ? '✅ true' : '❌ false'}</div>
                                            <div><span className="text-blue-600">Role Field:</span> {userDoc.role || 'N/A'}</div>
                                            <div><span className="text-blue-600">Email Match:</span> {userDoc.email === user?.email ? '✅ Match' : '⚠️ Mismatch'}</div>
                                        </>
                                    ) : (
                                        <div><span className="text-red-600">Document Found:</span> ❌ No (This is the problem!)</div>
                                    )}
                                </div>
                            </div>

                            {/* Runtime Information */}
                            <div className="p-3 bg-white rounded border">
                                <h3 className="font-medium text-gray-800 mb-2">⚡ Runtime Information</h3>
                                <div className="space-y-1 font-mono text-xs">
                                    <div><span className="text-blue-600">Auth Loading:</span> {loading ? '⏳ Loading' : '✅ Loaded'}</div>
                                    <div><span className="text-blue-600">Current URL:</span> {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}</div>
                                    <div><span className="text-blue-600">Firebase App:</span> {auth?.app?.name || 'N/A'}</div>
                                    <div><span className="text-blue-600">Timestamp:</span> {new Date().toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        {/* Raw Data */}
                        <details className="mt-4">
                            <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">🔍 Raw Data (Click to expand)</summary>
                            <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-32">
                                <div><strong>User Object:</strong></div>
                                <pre className="whitespace-pre-wrap">{JSON.stringify(user, null, 2)}</pre>
                                <div className="mt-2"><strong>User Document:</strong></div>
                                <pre className="whitespace-pre-wrap">{JSON.stringify(userDoc, null, 2)}</pre>
                            </div>
                        </details>
                    </div>
                </div>
            )}

            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
                {/* Debug Toggle Button */}
                <div className="text-center">
                    <button
                        onClick={() => setShowDebug(!showDebug)}
                        className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition text-slate-600 hover:text-slate-800"
                    >
                        {showDebug ? <EyeOff size={14} /> : <Eye size={14} />}
                        {showDebug ? 'Hide' : 'Show'} Debug Info
                    </button>
                </div>

                {/* Logo & Title */
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <Logo size={80} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">陶豬管理員</h1>
                        <p className="text-slate-500 mt-2">MyLoYau Admin Portal</p>
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
