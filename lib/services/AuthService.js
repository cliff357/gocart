/**
 * Firebase Authentication Service
 * 提供登入、登出、用戶狀態管理等功能
 */

import { auth, db } from '@/lib/firebase/config';
import {
    signInWithPopup,
    signOut,
    GoogleAuthProvider,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';

// Google 登入 Provider
const googleProvider = new GoogleAuthProvider();

/**
 * 檢查並處理管理員邀請
 */
const checkAndProcessInvite = async (user) => {
    try {
        console.log('🔍 檢查邀請，用戶 Email:', user.email);
        const userEmailLower = user.email.toLowerCase();
        
        // 直接用 email 作為 Document ID 查詢
        const inviteDocRef = doc(db, 'adminInvites', userEmailLower);
        const inviteSnap = await getDoc(inviteDocRef);
        
        console.log('📋 邀請存在:', inviteSnap.exists());
        
        if (inviteSnap.exists() && inviteSnap.data().status === 'pending') {
            console.log('📨 找到待處理的管理員邀請');
            
            // 更新或創建用戶文檔，設為管理員
            const userDocRef = doc(db, 'users', user.uid);
            const newUserData = {
                email: user.email,
                displayName: user.displayName || '',
                uid: user.uid,
                isAdmin: true,
                role: 'admin',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                inviteAcceptedAt: Timestamp.now(),
            };
            
            console.log('📝 創建用戶文檔:', user.uid);
            await setDoc(userDocRef, newUserData, { merge: true });
            console.log('✅ 用戶文檔已創建');
            
            // 刪除邀請記錄
            console.log('🗑️ 刪除邀請:', userEmailLower);
            await deleteDoc(inviteDocRef);
            
            console.log('✅ 管理員權限已授予');
            return true;
        } else {
            console.log('⚠️ 沒有找到該用戶的待處理邀請');
        }
        return false;
    } catch (error) {
        console.error('❌ 處理邀請時出錯:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        return false;
    }
};

/**
 * Google 登入
 */
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log('✅ 登入成功:', result.user.email);
        
        // 檢查並處理管理員邀請
        const inviteProcessed = await checkAndProcessInvite(result.user);
        
        // 獲取用戶資料
        let userDoc = null;
        try {
            const userDocRef = doc(db, 'users', result.user.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
                userDoc = { id: userDocSnap.id, ...userDocSnap.data() };
            } else if (!inviteProcessed) {
                // 如果用戶文檔不存在且沒有處理邀請，創建普通用戶
                const newUserData = {
                    email: result.user.email,
                    displayName: result.user.displayName || '',
                    uid: result.user.uid,
                    isAdmin: false,
                    role: 'user',
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                };
                await setDoc(userDocRef, newUserData);
                userDoc = { id: result.user.uid, ...newUserData };
            } else {
                // 邀請處理後重新讀取
                const refreshedDoc = await getDoc(userDocRef);
                userDoc = { id: refreshedDoc.id, ...refreshedDoc.data() };
            }
        } catch (error) {
            console.warn('⚠️ 無法獲取用戶資料:', error);
        }
        
        return { success: true, user: result.user, userDoc };
    } catch (error) {
        console.error('❌ 登入失敗:', error);
        return { success: false, error: error.message };
    }
};

/**
 * 登出
 */
export const logOut = async () => {
    try {
        await signOut(auth);
        console.log('✅ 已登出');
        return { success: true };
    } catch (error) {
        console.error('❌ 登出失敗:', error);
        return { success: false, error: error.message };
    }
};

/**
 * 監聽用戶狀態變化
 */
export const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

/**
 * 獲取當前用戶
 */
export const getCurrentUser = () => {
    return auth.currentUser;
};
