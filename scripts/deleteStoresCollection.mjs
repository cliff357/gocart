/**
 * Delete Stores Collection Script
 * 刪除 Firestore 中的 stores collection
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
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

async function deleteStoresCollection() {
    try {
        console.log('🗑️  Starting to delete stores collection...');
        
        const storesRef = collection(db, 'stores');
        const snapshot = await getDocs(storesRef);
        
        if (snapshot.empty) {
            console.log('✅ Stores collection is already empty or does not exist.');
            process.exit(0);
        }
        
        console.log(`📦 Found ${snapshot.size} store(s) to delete...`);
        
        const deletePromises = snapshot.docs.map(docSnapshot => 
            deleteDoc(doc(db, 'stores', docSnapshot.id))
        );
        
        await Promise.all(deletePromises);
        
        console.log('✅ Successfully deleted all stores from Firestore!');
        console.log(`🗑️  Total deleted: ${snapshot.size} store(s)`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error deleting stores collection:', error);
        process.exit(1);
    }
}

deleteStoresCollection();
