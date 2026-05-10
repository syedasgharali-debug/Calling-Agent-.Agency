
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const syncUserProfile = async (firebaseUser: FirebaseUser) => {
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  try {
    const userDoc = await getDoc(userDocRef);
    let profileData;
    if (!userDoc.exists()) {
      // First time login
      const role = (
        firebaseUser.email === 'syedasgharkazmii@gmail.com' || 
        firebaseUser.email === 'syedasghakazmii@gmail.com' || 
        firebaseUser.email === 'essadhiif@gmail.com'
      ) ? 'admin' : 'customer';
      profileData = {
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || '',
        profilePic: firebaseUser.photoURL || '',
        role: role,
        balance: 5.00,
        credits: 100,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        status: 'online' as const
      };
      await setDoc(userDocRef, profileData);
    } else {
      // Update existing user
      const existingData = userDoc.data();
      const updates = {
        lastLogin: serverTimestamp(),
        status: 'online' as const
      };
      await updateDoc(userDocRef, updates);
      profileData = { ...existingData, ...updates };
    }
    return profileData as { email: string; role: string; name?: string; profilePic?: string };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
  }
};

export const getAllUsers = async () => {
  try {
    const { getDocs, collection } = await import('firebase/firestore');
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
  }
};

export const logoutUser = async (userId: string) => {
  try {
    if (userId) {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        status: 'offline'
      }).catch(err => console.warn("Failed to update status to offline:", err));
    }
    await auth.signOut();
  } catch (error) {
    console.error("Logout error in service:", error);
    await auth.signOut(); // Ensure we still sign out locally
  }
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return await syncUserProfile(result.user);
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return await syncUserProfile(result.user);
  } catch (error) {
    console.error('Email Sign-In Error:', error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, pass: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    return await syncUserProfile(result.user);
  } catch (error) {
    console.error('Email Registration Error:', error);
    throw error;
  }
};

export const manuallyCreateUser = async (email: string, role: 'admin' | 'customer') => {
  try {
    // Note: This creates a profile record, but NOT a Firebase Auth user.
    // The user will need to sign up/login with this email later.
    const customId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userDocRef = doc(db, 'users', customId);
    const profileData = {
      email: email.toLowerCase().trim(),
      name: email.split('@')[0],
      profilePic: '',
      role: role,
      balance: 0,
      credits: 0,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      status: 'offline' as const,
      isManual: true
    };
    await setDoc(userDocRef, profileData);
    return { id: customId, ...profileData };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'users');
  }
};

export const deleteUserDoc = async (userId: string) => {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
  }
};

export const updateUserBalance = async (userId: string, newBalance: number) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      balance: newBalance
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
};
