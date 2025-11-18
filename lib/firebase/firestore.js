/**
 * Firebase Firestore Database Service
 * 
 * Handles all database operations for products, stores, orders, etc.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './config';

/**
 * Firebase Firestore Service Class
 */
export class FirebaseFirestoreService {
  
  // Collections
  static COLLECTIONS = {
    USERS: 'users',
    PRODUCTS: 'products',
    STORES: 'stores',
    ORDERS: 'orders',
    RATINGS: 'ratings',
    ADDRESSES: 'addresses',
    COUPONS: 'coupons',
    CATEGORIES: 'categories'
  };
  
  /**
   * Generic CRUD Operations
   */
  
  // Create document
  static async createDocument(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return {
        success: true,
        id: docRef.id,
        data: { id: docRef.id, ...data }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Get document by ID
  static async getDocument(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          success: true,
          data: { id: docSnap.id, ...docSnap.data() }
        };
      } else {
        return {
          success: false,
          error: 'Document not found'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Update document
  static async updateDocument(collectionName, docId, data) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Delete document
  static async deleteDocument(collectionName, docId) {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Get all documents from collection
  static async getCollection(collectionName, queryOptions = {}) {
    try {
      let q = collection(db, collectionName);
      
      // Apply filters
      if (queryOptions.where) {
        queryOptions.where.forEach(([field, operator, value]) => {
          q = query(q, where(field, operator, value));
        });
      }
      
      // Apply ordering
      if (queryOptions.orderBy) {
        queryOptions.orderBy.forEach(([field, direction = 'asc']) => {
          q = query(q, orderBy(field, direction));
        });
      }
      
      // Apply limit
      if (queryOptions.limit) {
        q = query(q, limit(queryOptions.limit));
      }
      
      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      return {
        success: true,
        data: documents
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Product Operations
   */
  
  static async createProduct(productData) {
    return this.createDocument(this.COLLECTIONS.PRODUCTS, productData);
  }
  
  static async getProduct(productId) {
    return this.getDocument(this.COLLECTIONS.PRODUCTS, productId);
  }
  
  static async updateProduct(productId, productData) {
    return this.updateDocument(this.COLLECTIONS.PRODUCTS, productId, productData);
  }
  
  static async deleteProduct(productId) {
    return this.deleteDocument(this.COLLECTIONS.PRODUCTS, productId);
  }
  
  static async getProducts(filters = {}) {
    const queryOptions = {};
    
    if (filters.category) {
      queryOptions.where = [['category', '==', filters.category]];
    }
    
    if (filters.storeId) {
      queryOptions.where = queryOptions.where || [];
      queryOptions.where.push(['storeId', '==', filters.storeId]);
    }
    
    if (filters.limit) {
      queryOptions.limit = filters.limit;
    }
    
    queryOptions.orderBy = [['createdAt', 'desc']];
    
    return this.getCollection(this.COLLECTIONS.PRODUCTS, queryOptions);
  }
  
  static async searchProducts(searchTerm) {
    try {
      // Note: Firestore doesn't have full-text search, so we'll use a simple approach
      // For better search, consider using Algolia or similar service
      const products = await this.getProducts();
      
      if (products.success) {
        const filteredProducts = products.data.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        return {
          success: true,
          data: filteredProducts
        };
      }
      
      return products;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Store Operations
   */
  
  static async createStore(storeData) {
    return this.createDocument(this.COLLECTIONS.STORES, storeData);
  }
  
  static async getStore(storeId) {
    return this.getDocument(this.COLLECTIONS.STORES, storeId);
  }
  
  static async getStoreByUsername(username) {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.STORES),
        where('username', '==', username)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const storeDoc = querySnapshot.docs[0];
        return {
          success: true,
          data: { id: storeDoc.id, ...storeDoc.data() }
        };
      } else {
        return {
          success: false,
          error: 'Store not found'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  static async updateStore(storeId, storeData) {
    return this.updateDocument(this.COLLECTIONS.STORES, storeId, storeData);
  }
  
  static async deleteStore(storeId) {
    return this.deleteDocument(this.COLLECTIONS.STORES, storeId);
  }
  
  static async getStores(filters = {}) {
    const queryOptions = {};
    
    if (filters.status) {
      queryOptions.where = [['status', '==', filters.status]];
    }
    
    if (filters.userId) {
      queryOptions.where = queryOptions.where || [];
      queryOptions.where.push(['userId', '==', filters.userId]);
    }
    
    queryOptions.orderBy = [['createdAt', 'desc']];
    
    return this.getCollection(this.COLLECTIONS.STORES, queryOptions);
  }
  
  /**
   * Order Operations
   */
  
  static async createOrder(orderData) {
    return this.createDocument(this.COLLECTIONS.ORDERS, orderData);
  }
  
  static async getOrder(orderId) {
    return this.getDocument(this.COLLECTIONS.ORDERS, orderId);
  }
  
  static async updateOrder(orderId, orderData) {
    return this.updateDocument(this.COLLECTIONS.ORDERS, orderId, orderData);
  }
  
  static async getUserOrders(userId) {
    const queryOptions = {
      where: [['userId', '==', userId]],
      orderBy: [['createdAt', 'desc']]
    };
    
    return this.getCollection(this.COLLECTIONS.ORDERS, queryOptions);
  }
  
  static async getStoreOrders(storeId) {
    const queryOptions = {
      where: [['storeId', '==', storeId]],
      orderBy: [['createdAt', 'desc']]
    };
    
    return this.getCollection(this.COLLECTIONS.ORDERS, queryOptions);
  }
  
  /**
   * Rating Operations
   */
  
  static async createRating(ratingData) {
    return this.createDocument(this.COLLECTIONS.RATINGS, ratingData);
  }
  
  static async getProductRatings(productId) {
    const queryOptions = {
      where: [['productId', '==', productId]],
      orderBy: [['createdAt', 'desc']]
    };
    
    return this.getCollection(this.COLLECTIONS.RATINGS, queryOptions);
  }
  
  static async updateRating(ratingId, ratingData) {
    return this.updateDocument(this.COLLECTIONS.RATINGS, ratingId, ratingData);
  }
  
  static async deleteRating(ratingId) {
    return this.deleteDocument(this.COLLECTIONS.RATINGS, ratingId);
  }
  
  /**
   * Real-time listeners
   */
  
  static subscribeToDocument(collectionName, docId, callback) {
    const docRef = doc(db, collectionName, docId);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error in document subscription:', error);
      callback(null, error);
    });
  }
  
  static subscribeToCollection(collectionName, queryOptions, callback) {
    let q = collection(db, collectionName);
    
    // Apply query options
    if (queryOptions?.where) {
      queryOptions.where.forEach(([field, operator, value]) => {
        q = query(q, where(field, operator, value));
      });
    }
    
    if (queryOptions?.orderBy) {
      queryOptions.orderBy.forEach(([field, direction = 'asc']) => {
        q = query(q, orderBy(field, direction));
      });
    }
    
    if (queryOptions?.limit) {
      q = query(q, limit(queryOptions.limit));
    }
    
    return onSnapshot(q, (querySnapshot) => {
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      callback(documents);
    }, (error) => {
      console.error('Error in collection subscription:', error);
      callback([], error);
    });
  }
}