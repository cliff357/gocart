'use client'
/**
 * Auth Context
 * 提供全局的用戶認證狀態管理
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange } from '@/lib/services/AuthService';
import { userService } from '@/lib/services/FirestoreService';

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

    useEffect(() => {
        const unsubscribe = onAuthStateChange(async (firebaseUser) => {
            console.log('🔐 Auth state changed:', firebaseUser?.email || 'Not logged in');
            
            if (firebaseUser) {
                setUser(firebaseUser);
                
                // 從 Firestore 獲取用戶完整資料
                try {
                    const userData = await userService.getByEmail(firebaseUser.email);
                    setUserDoc(userData);
                    console.log('👤 User data loaded:', userData);
                } catch (error) {
                    console.error('Failed to load user data:', error);
                    setUserDoc(null);
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
        isAdmin: userDoc?.isAdmin || false,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
