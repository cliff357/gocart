/**
 * Firestore Service
 * 提供 Firestore 數據庫操作的統一接口
 */

import { db } from '@/lib/firebase/config';
import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit,
    addDoc,
    updateDoc,
    deleteDoc,
    Timestamp
} from 'firebase/firestore';

/**
 * 基礎 Firestore Service
 */
class BaseFirestoreService {
    constructor(collectionName) {
        this.collectionName = collectionName;
        // 在所有環境都啟用日誌
        this.enableLogging = true;
    }

    // Firestore 操作日誌（所有環境）
    log(action, details) {
        if (this.enableLogging) {
            const timestamp = new Date().toISOString();
            console.log(
                `🔥 [${timestamp}] Firestore [${this.collectionName}] ${action}:`,
                details
            );
        }
    }

    // 獲取集合引用
    getCollectionRef() {
        return collection(db, this.collectionName);
    }

    // 獲取文檔引用
    getDocRef(id) {
        return doc(db, this.collectionName, id);
    }

    // 將 Firestore 文檔轉換為 JS 對象
    docToObject(docSnap) {
        if (!docSnap.exists()) return null;
        
        const data = docSnap.data();
        
        // 將 Firestore Timestamp 轉換為 ISO string（Redux serializable）
        const serializedData = {};
        for (const [key, value] of Object.entries(data)) {
            if (value && typeof value.toDate === 'function') {
                // Firestore Timestamp
                serializedData[key] = value.toDate().toISOString();
            } else {
                serializedData[key] = value;
            }
        }
        
        return {
            id: docSnap.id,
            ...serializedData
        };
    }

    // 獲取所有文檔
    async getAll() {
        try {
            this.log('GET_ALL', 'Fetching all documents...');
            const querySnapshot = await getDocs(this.getCollectionRef());
            const results = querySnapshot.docs.map(doc => this.docToObject(doc));
            this.log('GET_ALL', `✅ Retrieved ${results.length} documents`);
            return results;
        } catch (error) {
            console.error(`Error getting all ${this.collectionName}:`, error);
            throw error;
        }
    }

    // 根據 ID 獲取單個文檔
    async getById(id) {
        try {
            this.log('GET_BY_ID', `Fetching document: ${id}`);
            const docSnap = await getDoc(this.getDocRef(id));
            const result = this.docToObject(docSnap);
            if (result) {
                this.log('GET_BY_ID', `✅ Retrieved document: ${id}`);
            } else {
                this.log('GET_BY_ID', `⚠️ Document not found: ${id}`);
            }
            return result;
        } catch (error) {
            console.error(`Error getting ${this.collectionName} by ID:`, error);
            throw error;
        }
    }

    // 根據條件查詢
    async queryDocs(conditions = [], orderByField = null, limitCount = null) {
        try {
            const queryInfo = {
                conditions: conditions.map(c => `${c.field} ${c.operator} ${c.value}`),
                orderBy: orderByField || 'none',
                limit: limitCount || 'none'
            };
            this.log('QUERY', queryInfo);
            
            let q = this.getCollectionRef();
            
            // 添加查詢條件
            conditions.forEach(condition => {
                q = query(q, where(condition.field, condition.operator, condition.value));
            });

            // 添加排序
            if (orderByField) {
                q = query(q, orderBy(orderByField, 'desc'));
            }

            // 添加限制
            if (limitCount) {
                q = query(q, limit(limitCount));
            }

            const querySnapshot = await getDocs(q);
            const results = querySnapshot.docs.map(doc => this.docToObject(doc));
            this.log('QUERY', `✅ Retrieved ${results.length} documents`);
            return results;
        } catch (error) {
            console.error(`Error querying ${this.collectionName}:`, error);
            throw error;
        }
    }

    // 創建新文檔
    async create(data) {
        try {
            this.log('CREATE', 'Creating new document...');
            const docRef = await addDoc(this.getCollectionRef(), {
                ...data,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
            this.log('CREATE', `✅ Created document: ${docRef.id}`);
            return docRef.id;
        } catch (error) {
            console.error(`Error creating ${this.collectionName}:`, error);
            throw error;
        }
    }

    // 更新文檔
    async update(id, data) {
        try {
            this.log('UPDATE', `Updating document: ${id}`);
            await updateDoc(this.getDocRef(id), {
                ...data,
                updatedAt: Timestamp.now()
            });
            this.log('UPDATE', `✅ Updated document: ${id}`);
            return true;
        } catch (error) {
            console.error(`Error updating ${this.collectionName}:`, error);
            throw error;
        }
    }

    // 刪除文檔
    async delete(id) {
        try {
            this.log('DELETE', `Deleting document: ${id}`);
            await deleteDoc(this.getDocRef(id));
            this.log('DELETE', `✅ Deleted document: ${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting ${this.collectionName}:`, error);
            throw error;
        }
    }
}

/**
 * Product Firestore Service
 */
export class ProductFirestoreService extends BaseFirestoreService {
    constructor() {
        super('products');
    }

    // 增強產品數據，添加評分信息
    async enrichProductWithRatings(product) {
        try {
            this.log('ENRICH_RATINGS', `Fetching ratings for product: ${product.id}`);
            const ratingsCol = collection(db, 'ratings');
            const q = query(ratingsCol, where('productId', '==', product.id));
            const ratingsSnapshot = await getDocs(q);
            
            const ratings = ratingsSnapshot.docs.map(doc => doc.data());
            
            if (ratings.length > 0) {
                const totalRating = ratings.reduce((sum, r) => sum + (r.rating || 0), 0);
                product.averageRating = totalRating / ratings.length;
                product.totalRatings = ratings.length;
                product.rating = ratings; // 保持兼容性
                this.log('ENRICH_RATINGS', `✅ Added ${ratings.length} ratings (avg: ${product.averageRating.toFixed(1)})`);
            } else {
                product.averageRating = 0;
                product.totalRatings = 0;
                product.rating = [];
                this.log('ENRICH_RATINGS', '⚠️ No ratings found');
            }
            
            return product;
        } catch (error) {
            console.error('Error enriching product with ratings:', error);
            // 返回沒有評分的產品
            product.averageRating = 0;
            product.totalRatings = 0;
            product.rating = [];
            return product;
        }
    }

    // 重寫 getAll 以包含評分
    async getAll() {
        const products = await super.getAll();
        // 為性能考慮，初始加載不獲取評分，讓組件處理缺失的評分
        return products;
    }

    // 重寫 getById 以包含評分
    async getById(id) {
        const product = await super.getById(id);
        if (!product) return null;
        return this.enrichProductWithRatings(product);
    }

    // 根據分類獲取商品
    async getByCategory(category) {
        return this.queryDocs([
            { field: 'category', operator: '==', value: category }
        ]);
    }

    // 根據商店 ID 獲取商品
    async getByStoreId(storeId) {
        return this.queryDocs([
            { field: 'storeId', operator: '==', value: storeId }
        ]);
    }

    // 搜索商品（按名稱）
    async search(searchTerm) {
        try {
            const allProducts = await this.getAll();
            const lowerSearch = searchTerm.toLowerCase();
            return allProducts.filter(product => 
                product.name.toLowerCase().includes(lowerSearch) ||
                product.description?.toLowerCase().includes(lowerSearch)
            );
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    }

    // 獲取最新商品
    async getLatest(count = 10) {
        return this.queryDocs([], 'createdAt', count);
    }

    // 獲取有貨商品
    async getInStock() {
        return this.queryDocs([
            { field: 'inStock', operator: '==', value: true }
        ]);
    }
}

/**
 * Store Firestore Service
 */
export class StoreFirestoreService extends BaseFirestoreService {
    constructor() {
        super('stores');
    }

    // 根據用戶名獲取商店
    async getByUsername(username) {
        const results = await this.queryDocs([
            { field: 'username', operator: '==', value: username }
        ]);
        return results.length > 0 ? results[0] : null;
    }

    // 根據用戶 ID 獲取商店
    async getByUserId(userId) {
        const results = await this.queryDocs([
            { field: 'userId', operator: '==', value: userId }
        ]);
        return results.length > 0 ? results[0] : null;
    }

    // 獲取已批准的商店
    async getApproved() {
        return this.queryDocs([
            { field: 'status', operator: '==', value: 'approved' }
        ]);
    }

    // 獲取待審批的商店
    async getPending() {
        return this.queryDocs([
            { field: 'status', operator: '==', value: 'pending' }
        ]);
    }
}

/**
 * User Firestore Service
 */
export class UserFirestoreService extends BaseFirestoreService {
    constructor() {
        super('users');
    }

    // 根據 email 獲取用戶
    async getByEmail(email) {
        const results = await this.queryDocs([
            { field: 'email', operator: '==', value: email }
        ]);
        return results.length > 0 ? results[0] : null;
    }

    // 獲取管理員
    async getAdmins() {
        return this.queryDocs([
            { field: 'isAdmin', operator: '==', value: true }
        ]);
    }
}

/**
 * Order Firestore Service
 */
export class OrderFirestoreService extends BaseFirestoreService {
    constructor() {
        super('orders');
    }

    // 根據用戶 ID 獲取訂單
    async getByUserId(userId) {
        return this.queryDocs([
            { field: 'userId', operator: '==', value: userId }
        ], 'createdAt');
    }

    // 根據商店 ID 獲取訂單
    async getByStoreId(storeId) {
        return this.queryDocs([
            { field: 'storeId', operator: '==', value: storeId }
        ], 'createdAt');
    }

    // 根據狀態獲取訂單
    async getByStatus(status) {
        return this.queryDocs([
            { field: 'status', operator: '==', value: status }
        ], 'createdAt');
    }
}

/**
 * Rating Firestore Service
 */
export class RatingFirestoreService extends BaseFirestoreService {
    constructor() {
        super('ratings');
    }

    // 根據商品 ID 獲取評分
    async getByProductId(productId) {
        return this.queryDocs([
            { field: 'productId', operator: '==', value: productId }
        ], 'createdAt');
    }

    // 根據用戶 ID 獲取評分
    async getByUserId(userId) {
        return this.queryDocs([
            { field: 'userId', operator: '==', value: userId }
        ], 'createdAt');
    }
}

/**
 * Coupon Firestore Service
 */
export class CouponFirestoreService extends BaseFirestoreService {
    constructor() {
        super('coupons');
    }

    // 根據優惠券代碼獲取
    async getByCode(code) {
        return this.getById(code); // 假設 code 就是文檔 ID
    }

    // 獲取公開的優惠券
    async getPublic() {
        return this.queryDocs([
            { field: 'isPublic', operator: '==', value: true }
        ]);
    }

    // 驗證優惠券
    async validate(code) {
        try {
            const coupon = await this.getByCode(code);
            if (!coupon) return { valid: false, message: '優惠券不存在' };

            const now = new Date();
            const expiresAt = new Date(coupon.expiresAt);
            
            if (expiresAt < now) {
                return { valid: false, message: '優惠券已過期' };
            }

            return { valid: true, coupon };
        } catch (error) {
            console.error('Error validating coupon:', error);
            return { valid: false, message: '驗證失敗' };
        }
    }
}

/**
 * Address Firestore Service
 */
export class AddressFirestoreService extends BaseFirestoreService {
    constructor() {
        super('addresses');
    }

    // 根據用戶 ID 獲取地址
    async getByUserId(userId) {
        return this.queryDocs([
            { field: 'userId', operator: '==', value: userId }
        ]);
    }
}

// 導出服務實例
export const productService = new ProductFirestoreService();
export const storeService = new StoreFirestoreService();
export const userService = new UserFirestoreService();
export const orderService = new OrderFirestoreService();
export const ratingService = new RatingFirestoreService();
export const couponService = new CouponFirestoreService();
export const addressService = new AddressFirestoreService();

// 默認導出所有服務
export default {
    product: productService,
    store: storeService,
    user: userService,
    order: orderService,
    rating: ratingService,
    coupon: couponService,
    address: addressService
};
