// auth.js
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc
} from 'firebase/firestore';

// Firebase yapılandırması
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Kullanıcı kayıt fonksiyonu
export async function registerUser(email, password, username, adminCode = '') {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Kullanıcıyı Firestore'a kaydet
    const userData = {
      uid: user.uid,
      email: user.email,
      username: username,
      role: adminCode === '3535' ? 'admin' : 'user',
      isBanned: false,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', user.uid), userData);
    return { success: true, user: userData };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Giriş yapma fonksiyonu
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Kullanıcı bilgilerini Firestore'dan al
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      await signOut(auth);
      return { success: false, error: 'Kullanıcı bulunamadı' };
    }
    
    const userData = userDoc.data();
    
    if (userData.isBanned) {
      await signOut(auth);
      return { success: false, error: 'Bu hesap engellenmiştir' };
    }
    
    return { success: true, user: userData };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Çıkış yapma fonksiyonu
export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Kullanıcı durumunu dinleme
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        callback({ user: userDoc.data() });
      } else {
        callback({ user: null });
      }
    } else {
      callback({ user: null });
    }
  });
}

// Tüm kullanıcıları getir (sadece admin)
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

// Kullanıcı rolünü güncelle (sadece admin)
export async function updateUserRole(userId, newRole) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: newRole });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Kullanıcıyı banla/banı kaldır (sadece admin)
export async function toggleUserBan(userId, isBanned) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { isBanned });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
