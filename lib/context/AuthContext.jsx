'use client'
/**
 * Auth Context
 * 提供全局的用戶認證狀態管理
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange } from '@/lib/services/AuthService';
import { userService } from '@/lib/services/FirestoreService';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userDoc, setUserDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChange(async (firebaseUser) => {
            console.log('🔐 Auth state changed:', firebaseUser?.email || 'Not logged in');
            setAuthError(null);
            
            if (firebaseUser) {
                setUser(firebaseUser);
                
                // 從 Firestore 獲取用戶完整資料 - 直接用 UID 讀取
                try {
                    console.log('📄 Fetching user doc for UID:', firebaseUser.uid);
                    
                    // 方法1：直接用 UID 讀取文檔（更可靠）
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    
                    if (userDocSnap.exists()) {
                        const userData = { id: userDocSnap.id, ...userDocSnap.data() };
                        setUserDoc(userData);
                        console.log('✅ User doc found by UID:', userData);
                    } else {
                        console.warn('⚠️ No user doc found by UID, trying email query...');
                        
                        // 方法2：fallback 用 email 查詢
                        const userData = await userService.getByEmail(firebaseUser.email);
                        if (userData) {
                            setUserDoc(userData);
                            console.log('✅ User doc found by email:', userData);
                        } else {
                            console.error('❌ No user document found for:', firebaseUser.email, firebaseUser.uid);
                            setUserDoc(null);
                            setAuthError('用戶文檔不存在');
                        }
                    }
                } catch (error) {
                    console.error('❌ Failed to load user data:', error);
                    console.error('Error code:', error.code);
                    console.error('Error message:', error.message);
                    setUserDoc(null);
                    setAuthError(error.message || '讀取用戶資料失敗');
                }
            } else {
                setUser(null);
                setUserDoc(null);
            }
            
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = {
        user,           // Firebase Auth User
        userDoc,        // Firestore User Document
        loading,
        authError,      // 認證錯誤訊息
        isAdmin: userDoc?.isAdmin || false,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
