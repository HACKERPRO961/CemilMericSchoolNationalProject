// auth-improved.js - Improved authentication module
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from './firebase-config-secure.js';
import { config } from './env.js';

// Error messages
const ERROR_MESSAGES = {
  'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanılmaktadır.',
  'auth/weak-password': 'Şifre en az 6 karakter olmalıdır.',
  'auth/invalid-email': 'Geçersiz e-posta adresi.',
  'auth/user-not-found': 'Kullanıcı bulunamadı.',
  'auth/wrong-password': 'Yanlış şifre.',
  'auth/account-exists-with-different-credential': 'Bu e-posta adresine farklı bir hesap bağlıdır.',
  'auth/user-disabled': 'Bu hesap devre dışı bırakılmıştır.',
};

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} username - User display name
 * @param {string} adminCode - Admin code for special privileges
 * @returns {Promise} Registration result
 */
export async function registerUser(email, password, username, adminCode = '') {
  try {
    // Validate inputs
    if (!email || !password || !username) {
      return { success: false, error: 'Tüm alanlar zorunludur.' };
    }

    if (password.length < 6) {
      return { success: false, error: ERROR_MESSAGES['auth/weak-password'] };
    }

    // Create user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile
    await updateProfile(user, { displayName: username });

    // Determine role
    const role = adminCode === config.site.adminCode ? 'admin' : 'user';

    // Save to Firestore
    const userData = {
      uid: user.uid,
      email: user.email,
      username: username,
      role: role,
      isBanned: false,
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
      emailVerified: false
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    return {
      success: true,
      user: userData,
      message: 'Hesap başarıyla oluşturuldu.'
    };
  } catch (error) {
    const errorMessage = ERROR_MESSAGES[error.code] || error.message;
    return { success: false, error: errorMessage };
  }
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Login result
 */
export async function loginUser(email, password) {
  try {
    // Validate inputs
    if (!email || !password) {
      return { success: false, error: 'E-posta ve şifre gereklidir.' };
    }

    // Sign in
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user data
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (!userDoc.exists()) {
      await signOut(auth);
      return { success: false, error: 'Kullanıcı bulunamadı.' };
    }

    const userData = userDoc.data();

    // Check if user is banned
    if (userData.isBanned) {
      await signOut(auth);
      return { success: false, error: 'Bu hesap engellenmiştir.' };
    }

    // Update last login
    await updateDoc(doc(db, 'users', user.uid), {
      lastLogin: Timestamp.now()
    });

    return {
      success: true,
      user: userData,
      message: 'Başarıyla giriş yaptınız.'
    };
  } catch (error) {
    const errorMessage = ERROR_MESSAGES[error.code] || error.message;
    return { success: false, error: errorMessage };
  }
}

/**
 * Logout user
 * @returns {Promise} Logout result
 */
export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true, message: 'Başarıyla çıkış yaptınız.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Listen to auth state changes
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          callback({ user: userDoc.data(), authenticated: true });
        } else {
          callback({ user: null, authenticated: false });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        callback({ user: null, authenticated: false });
      }
    } else {
      callback({ user: null, authenticated: false });
    }
  });
}

/**
 * Get all users (admin only)
 * @returns {Promise} Users list
 */
export async function getAllUsers() {
  try {
    const users = [];
    const querySnapshot = await getDocs(collection(db, 'users'));
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, users };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Update user role (admin only)
 * @param {string} userId - User ID
 * @param {string} newRole - New role
 * @returns {Promise} Update result
 */
export async function updateUserRole(userId, newRole) {
  try {
    if (!['admin', 'user', 'moderator'].includes(newRole)) {
      return { success: false, error: 'Geçersiz rol.' };
    }

    await updateDoc(doc(db, 'users', userId), { role: newRole });
    return { success: true, message: 'Rol başarıyla güncellendi.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Ban/unban user (admin only)
 * @param {string} userId - User ID
 * @param {boolean} isBanned - Ban status
 * @returns {Promise} Update result
 */
export async function toggleUserBan(userId, isBanned) {
  try {
    await updateDoc(doc(db, 'users', userId), {
      isBanned: isBanned,
      bannedAt: isBanned ? Timestamp.now() : null
    });
    return {
      success: true,
      message: isBanned ? 'Kullanıcı engellenmiştir.' : 'Kullanıcı engeli kaldırılmıştır.'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get current user
 * @returns {Promise} Current user data
 */
export async function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        resolve(userDoc.exists() ? userDoc.data() : null);
      } else {
        resolve(null);
      }
    });
  });
}