/**
 * Firebase Authentication Service
 * 提供登入、登出、用戶狀態管理等功能
 */

import { auth } from '@/lib/firebase/config';
import {
    signInWithPopup,
    signOut,
    GoogleAuthProvider,
    onAuthStateChanged
} from 'firebase/auth';

// Google 登入 Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Google 登入
 */
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log('✅ 登入成功:', result.user.email);
        
        // 動態導入 userService 以獲取用戶資料
        const { userService } = await import('./FirestoreService');
        let userDoc = null;
        
        try {
            userDoc = await userService.getByEmail(result.user.email);
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
