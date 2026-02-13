// firebase-config-secure.js - Secure Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { config } from './env.js';

// Validate config
if (!config.firebase.apiKey) {
  console.error('Firebase configuration is missing. Please check your .env file.');
}

// Initialize Firebase
const app = initializeApp(config.firebase);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence
import { enableIndexedDbPersistence } from 'firebase/firestore';

try {
  enableIndexedDbPersistence(db);
} catch (err) {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open - offline persistence disabled');
  } else if (err.code === 'unimplemented') {
    console.warn('Browser does not support offline persistence');
  }
}

export default app;