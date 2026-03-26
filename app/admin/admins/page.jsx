'use client'
/**
 * Admin Management Page
 * 管理員管理頁面 - 邀請和管理管理員
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { userService } from '@/lib/services/FirestoreService';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, deleteDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { UserPlus, Shield, Trash2, Mail, Clock, CheckCircle, XCircle, Users } from 'lucide-react';
import Loading from '@/components/Loading';
import toast from 'react-hot-toast';

export default function AdminManagementPage() {
    const { isAdmin, loading: authLoading, user } = useAuth();
    const router = useRouter();

    const [admins, setAdmins] = useState([]);
    const [pendingInvites, setPendingInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviting, setInviting] = useState(false);

    // 獲取所有管理員
    const fetchAdmins = async () => {
        try {
            const adminList = await userService.getAdmins();
            setAdmins(adminList);
        } catch (error) {
            console.error('Failed to fetch admins:', error);
            toast.error('無法獲取管理員列表');
        }
    };

    // 獲取待接受的邀請
    const fetchPendingInvites = async () => {
        try {
            const invitesRef = collection(db, 'adminInvites');
            const q = query(invitesRef, where('status', '==', 'pending'));
            const snapshot = await getDocs(q);
            const invites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPendingInvites(invites);
        } catch (error) {
            console.error('Failed to fetch invites:', error);
        }
    };

    // 初始化
    useEffect(() => {
        const init = async () => {
            await Promise.all([fetchAdmins(), fetchPendingInvites()]);
            setLoading(false);
        };
        init();
    }, []);

    // 權限檢查
    useEffect(() => {
        if (!authLoading && !isAdmin) {
            toast.error('需要管理員權限');
            router.push('/');
        }
    }, [authLoading, isAdmin, router]);

    // 邀請新管理員
    const handleInvite = async (e) => {
        e.preventDefault();
        
        if (!inviteEmail.trim()) {
            toast.error('請輸入電子郵件');
            return;
        }

        // 驗證 email 格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inviteEmail)) {
            toast.error('請輸入有效的電子郵件地址');
            return;
        }

        // 檢查是否已經是管理員
        const existingAdmin = admins.find(a => a.email === inviteEmail);
        if (existingAdmin) {
            toast.error('此用戶已經是管理員');
            return;
        }

        // 檢查是否已有待處理的邀請
        const existingInvite = pendingInvites.find(i => i.email === inviteEmail);
        if (existingInvite) {
            toast.error('已有待處理的邀請給此用戶');
            return;
        }

        setInviting(true);

        try {
            const emailToInvite = inviteEmail.toLowerCase().trim();
            
            // 創建邀請記錄 - 使用 email 作為 Document ID
            const inviteRef = doc(db, 'adminInvites', emailToInvite);
            await setDoc(inviteRef, {
                email: emailToInvite,
                invitedBy: user.email,
                invitedByUid: user.uid,
                status: 'pending',
                createdAt: Timestamp.now(),
            });

            // 發送邀請郵件
            try {
                const emailResponse = await fetch('/api/admin/invite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: emailToInvite,
                        invitedBy: user.email,
                    }),
                });
                
                if (emailResponse.ok) {
                    toast.success(`邀請郵件已發送給 ${emailToInvite}`);
                } else {
                    // 邀請記錄已創建，但郵件發送失敗
                    toast.success(`邀請已創建，但郵件發送失敗。請手動通知 ${emailToInvite}`);
                }
            } catch (emailError) {
                console.error('Failed to send invite email:', emailError);
                toast.success(`邀請已創建，但郵件發送失敗。請手動通知 ${emailToInvite}`);
            }

            setInviteEmail('');
            await fetchPendingInvites();
        } catch (error) {
            console.error('Failed to create invite:', error);
            toast.error('邀請失敗：' + error.message);
        } finally {
            setInviting(false);
        }
    };

    // 取消邀請
    const handleCancelInvite = async (inviteId) => {
        if (!confirm('確定要取消此邀請嗎？')) return;

        try {
            await deleteDoc(doc(db, 'adminInvites', inviteId));
            toast.success('邀請已取消');
            await fetchPendingInvites();
        } catch (error) {
            console.error('Failed to cancel invite:', error);
            toast.error('取消邀請失敗');
        }
    };

    // 移除管理員權限
    const handleRemoveAdmin = async (adminUser) => {
        // 不能移除自己
        if (adminUser.uid === user.uid) {
            toast.error('不能移除自己的管理員權限');
            return;
        }

        if (!confirm(`確定要移除 ${adminUser.email} 的管理員權限嗎？`)) return;

        try {
            const userDocRef = doc(db, 'users', adminUser.uid || adminUser.id);
            await setDoc(userDocRef, {
                isAdmin: false,
                role: 'user',
                updatedAt: Timestamp.now(),
            }, { merge: true });

            toast.success(`已移除 ${adminUser.email} 的管理員權限`);
            await fetchAdmins();
        } catch (error) {
            console.error('Failed to remove admin:', error);
            toast.error('移除失敗：' + error.message);
        }
    };

    // 等待權限檢查
    if (authLoading) return <Loading />;
    if (!isAdmin) return null;
    if (loading) return <Loading />;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <Users className="text-indigo-600" size={28} />
                <h1 className="text-2xl font-bold text-slate-800">管理員管理</h1>
            </div>

            {/* 邀請新管理員 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <UserPlus className="text-green-600" size={20} />
                    <h2 className="text-lg font-semibold text-slate-700">邀請新管理員</h2>
                </div>
                
                <form onSubmit={handleInvite} className="flex gap-3">
                    <div className="flex-1">
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="輸入電子郵件地址"
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={inviting}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                    >
                        <Mail size={18} />
                        {inviting ? '發送中...' : '發送邀請'}
                    </button>
                </form>

                <p className="mt-3 text-sm text-slate-500">
                    💡 被邀請的用戶使用此 Email 的 Google 帳號登入後，將自動獲得管理員權限
                </p>
            </div>

            {/* 待接受的邀請 */}
            {pendingInvites.length > 0 && (
                <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="text-yellow-600" size={20} />
                        <h2 className="text-lg font-semibold text-yellow-800">待接受的邀請 ({pendingInvites.length})</h2>
                    </div>
                    
                    <div className="space-y-3">
                        {pendingInvites.map((invite) => (
                            <div 
                                key={invite.id} 
                                className="flex items-center justify-between bg-white p-4 rounded-lg border border-yellow-200"
                            >
                                <div>
                                    <p className="font-medium text-slate-700">{invite.email}</p>
                                    <p className="text-sm text-slate-500">
                                        由 {invite.invitedBy} 邀請 · {invite.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleCancelInvite(invite.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                    title="取消邀請"
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 現有管理員列表 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Shield className="text-indigo-600" size={20} />
                    <h2 className="text-lg font-semibold text-slate-700">現有管理員 ({admins.length})</h2>
                </div>

                {admins.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">沒有找到管理員</p>
                ) : (
                    <div className="space-y-3">
                        {admins.map((admin) => (
                            <div 
                                key={admin.id || admin.uid} 
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <span className="text-indigo-600 font-medium">
                                            {admin.displayName?.[0] || admin.email?.[0]?.toUpperCase() || '?'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-700">
                                            {admin.displayName || '未設置名稱'}
                                            {admin.uid === user.uid && (
                                                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                    你自己
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-sm text-slate-500">{admin.email}</p>
                                    </div>
                                </div>

                                {admin.uid !== user.uid && (
                                    <button
                                        onClick={() => handleRemoveAdmin(admin)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                        title="移除管理員權限"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 說明 */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">📌 如何邀請管理員？</h3>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>輸入朋友的 Email 地址並發送邀請</li>
                    <li>朋友會收到一封邀請郵件，內含登入連結</li>
                    <li>朋友點擊連結並用 <strong>該 Email 的 Google 帳號</strong> 登入</li>
                    <li>系統會自動創建用戶資料並授予管理員權限</li>
                </ol>
                <p className="text-xs text-blue-600 mt-3">
                    ⚠️ 注意：朋友必須使用被邀請的 Email 登入，使用其他帳號登入將不會獲得權限
                </p>
            </div>
        </div>
    );
}
