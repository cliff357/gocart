/**
 * Server-side Authentication Utilities
 * 用於 API Routes 的認證驗證
 */

import admin from 'firebase-admin';

// 初始化 Firebase Admin SDK (如果尚未初始化)
function getAdminApp() {
    if (admin.apps.length > 0) {
        return admin.apps[0];
    }
    
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountKey) {
        console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY 環境變數未設置');
        return null;
    }
    
    try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
        
        return admin.apps[0];
    } catch (err) {
        console.error('❌ Firebase Admin SDK 初始化失敗:', err.message);
        return null;
    }
}

/**
 * 驗證 Firebase ID Token
 * @param {string} token - Firebase ID Token (from Authorization header)
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function verifyIdToken(token) {
    if (!token) {
        return { success: false, error: 'No token provided' };
    }

    const app = getAdminApp();
    if (!app) {
        return { success: false, error: 'Firebase Admin not configured' };
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // 從 Firestore 獲取用戶資料（包括 isAdmin）
        const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.exists ? userDoc.data() : {};

        return {
            success: true,
            user: {
                uid: decodedToken.uid,
                email: decodedToken.email,
                name: decodedToken.name || userData.name,
                isAdmin: userData.isAdmin === true,
                ...userData
            }
        };
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * 驗證請求是否來自已認證的 Admin
 * @param {Request} request - Next.js Request object
 * @returns {Promise<{success: boolean, user?: object, error?: string, status?: number}>}
 */
export async function verifyAdminRequest(request) {
    // 從 Authorization header 獲取 token
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { 
            success: false, 
            error: '未提供認證 token',
            status: 401 
        };
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前綴
    const result = await verifyIdToken(token);

    if (!result.success) {
        return { 
            success: false, 
            error: result.error || '認證失敗',
            status: 401 
        };
    }

    if (!result.user.isAdmin) {
        return { 
            success: false, 
            error: '需要管理員權限',
            status: 403 
        };
    }

    return {
        success: true,
        user: result.user
    };
}

/**
 * API Route 認證 Wrapper
 * 包裝 API handler，自動驗證 admin 權限
 * 
 * @example
 * export const POST = withAdminAuth(async (request, { user }) => {
 *     // user 已經驗證為 admin
 *     return NextResponse.json({ success: true });
 * });
 */
export function withAdminAuth(handler) {
    return async (request, context) => {
        const { NextResponse } = await import('next/server');
        
        const authResult = await verifyAdminRequest(request);
        
        if (!authResult.success) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        // 將 user 資訊傳給 handler
        return handler(request, { ...context, user: authResult.user });
    };
}
