/**
 * Set Admin User Script
 * 將指定用戶設置為管理員
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// 載入環境變數
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setAdmin() {
    const userId = 'HTO9Jr0NGIehqzb4UpzNg1umV9o1';
    const email = 'cliffchan1993@gmail.com';

    try {
        console.log('🔧 Setting up admin user...');
        console.log('📧 Email:', email);
        console.log('🆔 UID:', userId);

        const userRef = doc(db, 'users', userId);
        
        // 檢查用戶是否已存在
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            console.log('👤 User document exists, updating...');
            await setDoc(userRef, {
                ...userSnap.data(),
                isAdmin: true,
                updatedAt: new Date()
            }, { merge: true });
        } else {
            console.log('➕ Creating new user document...');
            await setDoc(userRef, {
                email: email,
                name: 'Cliff Chan',
                isAdmin: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        console.log('✅ User successfully set as admin!');
        console.log('🔄 Please refresh your browser to see the changes.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting admin:', error);
        process.exit(1);
    }
}

setAdmin();
