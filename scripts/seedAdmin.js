/**
 * Seed Admin User Script
 * 為開發環境添加管理員用戶
 * 
 * 使用方法：npm run seed:admin
 */

// 載入環境變數
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, Timestamp } = require('firebase/firestore');

// Firebase 配置（從 .env.local 讀取）
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔥 Initializing Firebase...');
console.log('📦 Project:', firebaseConfig.projectId);

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Admin 用戶資料
const adminUsers = [
    {
        uid: 'Ewpa3rID7iV5NCD9k4rL6GpBfAT2',
        email: 'cliffchan1993@gmail.com',
        username: 'cliff',
        displayName: 'Cliff Chan',
        isAdmin: true,
        role: 'admin',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    }
];

async function seedAdminUsers() {
    try {
        console.log('\n📝 Starting admin user seeding...\n');

        for (const admin of adminUsers) {
            console.log(`➡️  Adding admin: ${admin.email} (UID: ${admin.uid})`);
            
            // 使用 setDoc 而不是 addDoc，因為我們要指定 document ID (UID)
            const userRef = doc(db, 'users', admin.uid);
            await setDoc(userRef, admin);
            
            console.log(`✅ Successfully added: ${admin.email}\n`);
        }

        console.log('🎉 Admin user seeding completed!\n');
        console.log('📊 Summary:');
        console.log(`   - Total admins added: ${adminUsers.length}`);
        console.log(`   - Collection: users`);
        console.log(`   - Project: ${firebaseConfig.projectId}\n`);

        // 提示下一步
        console.log('🔐 Next steps:');
        console.log('   1. 使用 cliffchan1993@gmail.com 登入');
        console.log('   2. 訪問 /admin 頁面');
        console.log('   3. 開始管理產品\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin users:', error);
        console.error('\n💡 Troubleshooting:');
        console.error('   - 確保 Firestore rules 已開放寫入權限');
        console.error('   - 檢查 .env.local 配置是否正確');
        console.error('   - 確認 Firebase 項目已啟用 Firestore\n');
        process.exit(1);
    }
}

// 執行 seeding
console.log('🚀 Starting seed script...\n');
seedAdminUsers();
