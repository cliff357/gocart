/**
 * Firebase Configuration
 * 
 * Multi-source configuration loader with priority:
 * 1. Firebase Hosting auto-inject (window.__FIREBASE_CONFIG__)
 * 2. Environment variables (development/production)
 * 3. Remote config API (fallback - requires implementation)
 * 
 * Security: All credentials should be stored as GitHub secrets or .env.local
 * Never commit .env.local to version control
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { initAppCheck } from './appCheck';

/**
 * Get Firebase config from multiple sources
 */
function loadFirebaseConfig() {
  // Method 1: Firebase Hosting auto-inject (production)
  if (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__) {
    console.log('✅ Using Firebase Hosting auto-injected config');
    return window.__FIREBASE_CONFIG__;
  }
  
  // Method 2: Environment variables
  const envConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  };
  
  if (envConfig.apiKey && envConfig.projectId) {
    console.log('✅ Using environment variables config');
    return envConfig;
  }
  
  console.warn('⚠️ No Firebase configuration found');
  return null;
}

// Load configuration
const firebaseConfig = loadFirebaseConfig();

// Validate configuration
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig || !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.error('❌ Missing Firebase configuration keys:', missingKeys);
  console.error('💡 Setup instructions:');
  console.error('   1. Create .env.local with your Firebase config');
  console.error('   2. Or set up GitHub secrets for CI/CD');
  console.error('   3. See FIREBASE_SETUP.md for details');
}

// Initialize Firebase app (avoid re-initialization)
let app;
let appCheck;
try {
  if (firebaseConfig && missingKeys.length === 0) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase initialized successfully');
      console.log(`📦 Project: ${firebaseConfig.projectId}`);
      
      // Initialize App Check after Firebase app
      appCheck = initAppCheck(app);
    } else {
      app = getApps()[0];
      console.log('✅ Using existing Firebase app instance');
    }
  } else {
    console.error('❌ Firebase initialization skipped due to missing configuration');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

// Initialize Firebase services
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

// Initialize Analytics only on client side and when supported
export let analytics;
if (typeof window !== 'undefined' && app) {
  // Only initialize analytics in production or if measurement ID is configured
  if (firebaseConfig?.measurementId && process.env.NODE_ENV === 'production') {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log('✅ Firebase Analytics initialized');
      } else {
        console.log('ℹ️ Firebase Analytics not supported');
      }
    }).catch(error => {
      console.warn('⚠️ Analytics initialization failed:', error.message);
    });
  } else {
    console.log('ℹ️ Firebase Analytics skipped (development mode)');
  }
}

// Export the app instance and appCheck
export default app;
export { appCheck };

// Helper function to check if Firebase is initialized
export const isFirebaseInitialized = () => {
  return !!app && !!auth && !!db && !!storage;
};

// Export configuration status (for debugging - no sensitive data)
export const getFirebaseStatus = () => ({
  initialized: isFirebaseInitialized(),
  projectId: firebaseConfig?.projectId || 'Not configured',
  authDomain: firebaseConfig?.authDomain || 'Not configured',
  hasAuth: !!auth,
  hasDb: !!db,
  hasStorage: !!storage,
  hasAnalytics: !!analytics,
  hasAppCheck: !!appCheck,
  configSource: typeof window !== 'undefined' && window.__FIREBASE_CONFIG__ 
    ? 'Firebase Hosting' 
    : firebaseConfig 
    ? 'Environment Variables' 
    : 'None',
  missingKeys: missingKeys
});