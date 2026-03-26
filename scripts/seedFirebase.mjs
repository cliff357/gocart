/**
 * Firebase Data Seeder (Client SDK版本)
 * 使用 Firebase Client SDK 將 mock data 導入到 Firestore
 * 
 * 使用方法：
 * 1. 確保 .env.local 已配置
 * 2. npm run seed
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

// Firebase 配置
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mock data
const mockData = {
  users: [
    {
      id: "user_31dOriXqC4TATvc0brIhlYbwwc5",
      name: "Great Stack",
      email: "user.greatstack@gmail.com",
      emailVerified: false,
      isAdmin: false,
      cart: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "user_31dQbH27HVtovbs13X2cmqefddM",
      name: "GreatStack",
      email: "greatstack@example.com",
      emailVerified: false,
      isAdmin: true,
      cart: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],

  stores: [
    {
      id: "store_1",
      userId: "user_31dOriXqC4TATvc0brIhlYbwwc5",
      name: "GreatStack",
      description: "GreatStack is the education marketplace where you can buy goodies related to coding and tech",
      username: "greatstack",
      address: "123 Maplewood Drive Springfield, IL 62704 USA",
      status: "approved",
      isActive: true,
      email: "greatstack@example.com",
      contact: "+0 1234567890",
      createdAt: "2025-08-22T08:22:16.189Z",
      updatedAt: "2025-08-22T08:22:44.273Z"
    },
    {
      id: "store_2",
      userId: "user_31dQbH27HVtovbs13X2cmqefddM",
      name: "Happy Shop",
      description: "At Happy Shop, we believe shopping should be simple, smart, and satisfying.",
      username: "happyshop",
      address: "3rd Floor, Happy Shop , New Building, 123 street , c sector , NY, US",
      status: "approved",
      isActive: true,
      email: "happyshop@example.com",
      contact: "+0 123456789",
      createdAt: "2025-08-22T08:34:15.155Z",
      updatedAt: "2025-08-22T08:34:47.162Z"
    }
  ],

  products: [
    {
      id: "prod_1",
      name: "Modern table lamp",
      description: "Modern table lamp with a sleek design. Perfect for any room with lifetime warranty.",
      mrp: 40,
      price: 29,
      images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c'],
      category: "Decoration",
      storeId: "store_1",
      userId: "user_31dOriXqC4TATvc0brIhlYbwwc5",
      inStock: true,
      createdAt: "2025-07-29T14:51:25.000Z",
      updatedAt: "2025-07-29T14:51:25.000Z"
    },
    {
      id: "prod_2",
      name: "Smart speaker gray",
      description: "Smart speaker with premium sound quality and voice assistant.",
      mrp: 50,
      price: 39,
      images: ['https://images.unsplash.com/photo-1589003077984-894e133dabab'],
      category: "Speakers",
      storeId: "store_1",
      userId: "user_31dOriXqC4TATvc0brIhlYbwwc5",
      inStock: true,
      createdAt: "2025-07-28T14:51:25.000Z",
      updatedAt: "2025-07-28T14:51:25.000Z"
    },
    {
      id: "prod_3",
      name: "Smart watch white",
      description: "Modern smart watch with health tracking and notifications.",
      mrp: 60,
      price: 45,
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30'],
      category: "Watch",
      storeId: "store_1",
      userId: "user_31dOriXqC4TATvc0brIhlYbwwc5",
      inStock: true,
      createdAt: "2025-07-27T14:51:25.000Z",
      updatedAt: "2025-07-27T14:51:25.000Z"
    },
    {
      id: "prod_4",
      name: "Wireless headphones",
      description: "Premium wireless headphones with noise cancellation.",
      mrp: 70,
      price: 55,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e'],
      category: "Headphones",
      storeId: "store_1",
      userId: "user_31dOriXqC4TATvc0brIhlYbwwc5",
      inStock: true,
      createdAt: "2025-07-26T14:51:25.000Z",
      updatedAt: "2025-07-26T14:51:25.000Z"
    },
    {
      id: "prod_5",
      name: "Smart watch black",
      description: "Sleek black smart watch with fitness tracking.",
      mrp: 49,
      price: 35,
      images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a'],
      category: "Watch",
      storeId: "store_2",
      userId: "user_31dQbH27HVtovbs13X2cmqefddM",
      inStock: true,
      createdAt: "2025-07-25T14:51:25.000Z",
      updatedAt: "2025-07-25T14:51:25.000Z"
    }
  ],

  coupons: [
    {
      code: "NEW20",
      description: "20% Off for New Users",
      discount: 20,
      forNewUser: true,
      forMember: false,
      isPublic: false,
      expiresAt: "2026-12-31T00:00:00.000Z",
      createdAt: "2025-08-22T08:35:31.183Z"
    },
    {
      code: "OFF20",
      description: "20% Off for All Users",
      discount: 20,
      forNewUser: false,
      forMember: false,
      isPublic: true,
      expiresAt: "2026-12-31T00:00:00.000Z",
      createdAt: "2025-08-22T08:42:00.811Z"
    },
    {
      code: "OFF10",
      description: "10% Off for All Users",
      discount: 10,
      forNewUser: false,
      forMember: false,
      isPublic: true,
      expiresAt: "2026-12-31T00:00:00.000Z",
      createdAt: "2025-08-22T08:42:21.279Z"
    }
  ]
};

// 導入數據到 Firestore
async function seedData() {
  try {
    console.log('🚀 開始導入數據到 Firebase Firestore...\n');

    // 1. 導入用戶
    console.log('👤 導入用戶數據...');
    for (const user of mockData.users) {
      await setDoc(doc(db, 'users', user.id), user);
      console.log(`   ✅ ${user.name}`);
    }

    // 2. 導入商店
    console.log('\n🏪 導入商店數據...');
    for (const store of mockData.stores) {
      await setDoc(doc(db, 'stores', store.id), store);
      console.log(`   ✅ ${store.name}`);
    }

    // 3. 導入商品
    console.log('\n📦 導入商品數據...');
    for (const product of mockData.products) {
      await setDoc(doc(db, 'products', product.id), product);
      console.log(`   ✅ ${product.name} - ${product.category}`);
    }

    // 4. 導入優惠券
    console.log('\n🎟️  導入優惠券數據...');
    for (const coupon of mockData.coupons) {
      await setDoc(doc(db, 'coupons', coupon.code), coupon);
      console.log(`   ✅ ${coupon.code} - ${coupon.description}`);
    }

    console.log('\n✨ 數據導入完成！');
    console.log('\n📊 統計:');
    console.log(`   用戶: ${mockData.users.length}`);
    console.log(`   商店: ${mockData.stores.length}`);
    console.log(`   商品: ${mockData.products.length}`);
    console.log(`   優惠券: ${mockData.coupons.length}`);
    console.log('\n🎉 可以在 Firebase Console 查看數據了！');
    console.log(`   https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore\n`);

  } catch (error) {
    console.error('❌ 導入失敗:', error);
    throw error;
  }
}

// 清空數據（可選）
async function clearData() {
  try {
    console.log('🗑️  清空現有數據...\n');

    const collections = ['users', 'stores', 'products', 'coupons'];
    
    for (const collectionName of collections) {
      const querySnapshot = await getDocs(collection(db, collectionName));
      let count = 0;
      
      for (const document of querySnapshot.docs) {
        await deleteDoc(doc(db, collectionName, document.id));
        count++;
      }
      
      console.log(`   ✅ 已清空 ${collectionName} (${count} 條)`);
    }
    
    console.log('\n✨ 數據清空完成！\n');
  } catch (error) {
    console.error('❌ 清空失敗:', error);
    throw error;
  }
}

// 主程序
async function main() {
  const args = process.argv.slice(2);
  
  try {
    if (args.includes('--clear')) {
      await clearData();
    }
    
    if (!args.includes('--clear-only')) {
      await seedData();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 執行失敗:', error.message);
    process.exit(1);
  }
}

// 執行
main();
