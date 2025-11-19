/**
 * Firebase Data Seeder
 * 將 mock data 導入到 Firebase Firestore
 * 
 * 使用方法：
 * node scripts/seedFirebase.js
 */

// 使用 Node.js 環境的 Firebase Admin SDK
const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

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
      description: "At Happy Shop, we believe shopping should be simple, smart, and satisfying. Whether you're hunting for the latest fashion trends, top-notch electronics, home essentials, or unique lifestyle products — we've got it all under one digital roof.",
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
      description: "Modern table lamp with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
      mrp: 40,
      price: 29,
      images: [], // 圖片稍後上傳
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
      description: "Smart speaker with a sleek design. It's perfect for any room.",
      mrp: 50,
      price: 29,
      images: [],
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
      description: "Smart watch with a sleek design.",
      mrp: 60,
      price: 29,
      images: [],
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
      description: "Wireless headphones with premium sound quality.",
      mrp: 70,
      price: 29,
      images: [],
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
      description: "Premium smart watch with health tracking.",
      mrp: 49,
      price: 29,
      images: [],
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
    }
  ]
};

// 初始化 Firebase Admin
function initFirebase() {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
  };

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  return admin.firestore();
}

// 導入數據
async function seedData() {
  try {
    console.log('🚀 開始導入數據到 Firebase...\n');
    const db = initFirebase();

    // 1. 導入用戶
    console.log('👤 導入用戶數據...');
    for (const user of mockData.users) {
      await db.collection('users').doc(user.id).set(user);
      console.log(`   ✅ ${user.name}`);
    }

    // 2. 導入商店
    console.log('\n🏪 導入商店數據...');
    for (const store of mockData.stores) {
      await db.collection('stores').doc(store.id).set(store);
      console.log(`   ✅ ${store.name}`);
    }

    // 3. 導入商品
    console.log('\n📦 導入商品數據...');
    for (const product of mockData.products) {
      await db.collection('products').doc(product.id).set(product);
      console.log(`   ✅ ${product.name}`);
    }

    // 4. 導入優惠券
    console.log('\n🎟️  導入優惠券數據...');
    for (const coupon of mockData.coupons) {
      await db.collection('coupons').doc(coupon.code).set(coupon);
      console.log(`   ✅ ${coupon.code} - ${coupon.description}`);
    }

    console.log('\n✨ 數據導入完成！');
    console.log('\n📊 統計:');
    console.log(`   用戶: ${mockData.users.length}`);
    console.log(`   商店: ${mockData.stores.length}`);
    console.log(`   商品: ${mockData.products.length}`);
    console.log(`   優惠券: ${mockData.coupons.length}`);
    console.log('\n💡 提示: 商品圖片需要手動上傳到 Firebase Storage');
    console.log('   路徑: products/{productId}/image_{index}.png\n');

  } catch (error) {
    console.error('❌ 導入失敗:', error);
    process.exit(1);
  }
}

// 清空數據（可選）
async function clearData() {
  try {
    console.log('🗑️  清空現有數據...\n');
    const db = initFirebase();

    const collections = ['users', 'stores', 'products', 'coupons'];
    
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      const batch = db.batch();
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log(`   ✅ 已清空 ${collectionName} (${snapshot.size} 條)`);
    }
    
    console.log('\n✨ 數據清空完成！\n');
  } catch (error) {
    console.error('❌ 清空失敗:', error);
    process.exit(1);
  }
}

// 主程序
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--clear')) {
    await clearData();
  }
  
  if (!args.includes('--clear-only')) {
    await seedData();
  }
  
  process.exit(0);
}

// 執行
main();
