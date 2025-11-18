/**
 * Firebase Authentication Service
 * 
 * Handles user authentication, registration, and session management
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateEmail,
  updatePassword,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';

/**
 * Firebase Authentication Service Class
 */
export class FirebaseAuthService {
  
  /**
   * Register new user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {object} userData - Additional user data
   * @returns {Promise<object>} User data
   */
  static async registerUser(email, password, userData = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile
      await updateProfile(user, {
        displayName: userData.name || userData.displayName,
      });
      
      // Create user document in Firestore
      const userDoc = {
        uid: user.uid,
        email: user.email,
        name: userData.name || userData.displayName || '',
        image: userData.image || '',
        cart: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...userData
      };
      
      await setDoc(doc(db, 'users', user.uid), userDoc);
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          ...userDoc
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }
  
  /**
   * Sign in user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<object>} User data
   */
  static async signInUser(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          ...userData
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }
  
  /**
   * Sign in with Google
   * @returns {Promise<object>} User data
   */
  static async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create new user document
        const userData = {
          uid: user.uid,
          email: user.email,
          name: user.displayName || '',
          image: user.photoURL || '',
          cart: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await setDoc(doc(db, 'users', user.uid), userData);
      }
      
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          ...userData
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }
  
  /**
   * Sign out current user
   * @returns {Promise<object>} Result
   */
  static async signOutUser() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Send password reset email
   * @param {string} email - User email
   * @returns {Promise<object>} Result
   */
  static async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { 
        success: true, 
        message: 'Password reset email sent' 
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Update user profile
   * @param {object} userData - Updated user data
   * @returns {Promise<object>} Result
   */
  static async updateUserProfile(userData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        return {
          success: false,
          error: 'No authenticated user'
        };
      }
      
      // Update Firebase Auth profile
      if (userData.displayName) {
        await updateProfile(user, {
          displayName: userData.displayName
        });
      }
      
      // Update email if provided
      if (userData.email && userData.email !== user.email) {
        await updateEmail(user, userData.email);
      }
      
      // Update Firestore document
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...userData,
        updatedAt: new Date().toISOString()
      });
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Update user password
   * @param {string} newPassword - New password
   * @returns {Promise<object>} Result
   */
  static async updateUserPassword(newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) {
        return {
          success: false,
          error: 'No authenticated user'
        };
      }
      
      await updatePassword(user, newPassword);
      return { 
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Delete user account
   * @returns {Promise<object>} Result
   */
  static async deleteUserAccount() {
    try {
      const user = auth.currentUser;
      if (!user) {
        return {
          success: false,
          error: 'No authenticated user'
        };
      }
      
      // Delete user document from Firestore
      await deleteDoc(doc(db, 'users', user.uid));
      
      // Delete Firebase Auth user
      await deleteUser(user);
      
      return { 
        success: true,
        message: 'Account deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Get current user data
   * @returns {Promise<object>} User data
   */
  static async getCurrentUser() {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, user: null };
      }
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          ...userData
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Listen to authentication state changes
   * @param {function} callback - Callback function
   * @returns {function} Unsubscribe function
   */
  static onAuthStateChange(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          ...userData
        });
      } else {
        callback(null);
      }
    });
  }
}