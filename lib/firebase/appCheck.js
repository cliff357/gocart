/**
 * Firebase App Check Configuration
 * 使用 reCAPTCHA v3 保護 Firebase 服務
 */

import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

let appCheck = null;

/**
 * 初始化 App Check
 * @param {FirebaseApp} app - Firebase app instance
 */
export const initAppCheck = (app) => {
    // 只在瀏覽器環境中初始化
    if (typeof window === 'undefined') {
        console.log('ℹ️ App Check skipped (server-side)');
        return null;
    }

    // 避免重複初始化
    if (appCheck) {
        console.log('ℹ️ App Check already initialized');
        return appCheck;
    }

    const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!recaptchaSiteKey) {
        console.warn('⚠️ NEXT_PUBLIC_RECAPTCHA_SITE_KEY not configured');
        console.warn('⚠️ App Check will not be initialized');
        return null;
    }

    try {
        // 開發環境可以使用 debug token
        if (process.env.NODE_ENV === 'development') {
            // 在開發環境啟用 debug mode
            // @ts-ignore
            self.FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN || true;
        }

        appCheck = initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(recaptchaSiteKey),
            isTokenAutoRefreshEnabled: true // 自動刷新 token
        });

        console.log('✅ Firebase App Check initialized with reCAPTCHA v3');
        return appCheck;
    } catch (error) {
        console.error('❌ Failed to initialize App Check:', error);
        return null;
    }
};

/**
 * 獲取 App Check instance
 */
export const getAppCheckInstance = () => appCheck;

export default initAppCheck;
