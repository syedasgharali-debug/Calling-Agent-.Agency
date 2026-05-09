
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
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
      const role = (firebaseUser.email === 'syedasgharkazmii@gmail.com' || firebaseUser.email === 'essadhiif@gmail.com') ? 'admin' : 'customer';
      profileData = {
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || '',
        profilePic: firebaseUser.photoURL || '',
        role: role,
        balance: 5.00,
        credits: 100,
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
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      status: 'offline'
    });
    await auth.signOut();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
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
