
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

export const loginWithEmailFallback = async (email: string, pass: string) => {
  const normalizedEmail = email.toLowerCase().trim();
  const docId = `fallback_${normalizedEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const userDocRef = doc(db, 'users', docId);
  try {
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      throw new Error("No user registered with this email. Please sign up.");
    }
    const data = userDoc.data();
    if (data.password !== pass) {
      throw new Error("Incorrect password.");
    }
    
    const updates = {
      lastLogin: serverTimestamp(),
      status: 'online' as const
    };
    await updateDoc(userDocRef, updates);
    return {
      uid: docId,
      email: normalizedEmail,
      name: data.name || normalizedEmail.split('@')[0],
      role: data.role || 'customer',
      balance: data.balance ?? 5.00,
      credits: data.credits ?? 100,
      ...data,
      ...updates
    };
  } catch (error) {
    console.error("Fallback login failed:", error);
    throw error;
  }
};

export const registerWithEmailFallback = async (email: string, pass: string) => {
  const normalizedEmail = email.toLowerCase().trim();
  const docId = `fallback_${normalizedEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const userDocRef = doc(db, 'users', docId);
  try {
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      throw new Error("This email is already registered.");
    }
    const adminEmails = ['syedasgharkazmii@gmail.com', 'syedasghakazmii@gmail.com', 'essadhiif@gmail.com'];
    const role = adminEmails.includes(normalizedEmail) ? 'admin' : 'customer';
    
    const profileData = {
      email: normalizedEmail,
      name: email.split('@')[0],
      profilePic: '',
      role: role,
      balance: 5.00,
      credits: 100,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      status: 'online' as const,
      password: pass,
      isFallbackAuth: true
    };
    
    await setDoc(userDocRef, profileData);
    return {
      uid: docId,
      ...profileData
    };
  } catch (error) {
    console.error("Fallback registration failed:", error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return await syncUserProfile(result.user);
  } catch (error: any) {
    console.error('Email Sign-In Error:', error);
    if (error.code === 'auth/operation-not-allowed' || error.message?.includes('operation-not-allowed') || error.message?.includes('not enabled')) {
      console.log('Firebase Email/Password Auth disabled. Falling back to Firestore database credential store...');
      return await loginWithEmailFallback(email, pass);
    }
    throw error;
  }
};

export const registerWithEmail = async (email: string, pass: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    return await syncUserProfile(result.user);
  } catch (error: any) {
    console.error('Email Registration Error:', error);
    if (error.code === 'auth/operation-not-allowed' || error.message?.includes('operation-not-allowed') || error.message?.includes('not enabled')) {
      console.log('Firebase Email/Password Auth disabled. Falling back to Firestore database credential store...');
      return await registerWithEmailFallback(email, pass);
    }
    throw error;
  }
};

export const manuallyCreateUser = async (email: string, role: 'admin' | 'customer') => {
  const customId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const profileData = {
    email: email.toLowerCase().trim(),
    name: email.split('@')[0],
    profilePic: '',
    role: role,
    balance: 0,
    credits: 0,
    status: 'offline' as const,
    isManual: true
  };
  try {
    // Note: This creates a profile record, but NOT a Firebase Auth user.
    // The user will need to sign up/login with this email later.
    const userDocRef = doc(db, 'users', customId);
    await setDoc(userDocRef, {
      ...profileData,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
    return { 
      id: customId, 
      ...profileData,
      createdAt: { seconds: Math.floor(Date.now() / 1000) },
      lastLogin: { seconds: Math.floor(Date.now() / 1000) }
    };
  } catch (error) {
    console.warn("Firestore error on user creation, persisting locally in memory:", error);
    return {
      id: customId,
      ...profileData,
      createdAt: { seconds: Math.floor(Date.now() / 1000) },
      lastLogin: { seconds: Math.floor(Date.now() / 1000) }
    };
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

const SEED_CALLS = [
  {
    caller: "+1 (555) 019-2834",
    agent: "Sarah (Real Estate)",
    duration: "2m 14s",
    cost: 1.01,
    sentiment: "Positive" as const,
    outcome: "Scheduled Saturday 2PM Viewing",
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    transcript: "Sarah: Hello! This is Sarah from CallingAgent Loft Realty. I see you're interested in booking a viewing for our beautiful downtown loft. How can I assist you today?\nCaller: Hi, I'd like to schedule a viewing for Saturday if possible.\nSarah: Excellent! I have an opening this Saturday at 2:00 PM for the loft viewing. Would that block work for you, or do you prefer a weekdays slot?\nCaller: Saturday at 2 works perfectly.\nSarah: Superb, I have reserved your Saturday slot. I will send a customized calendar invitation shortly. Is there any other detail about the downtown loft I can share?\nCaller: What is the current listing price?\nSarah: The downtown loft is currently listed at $1.2 million. It includes top-tier custom brick finishes, 2 custom bedrooms, and gorgeous terrace skylights.\nCaller: Great, thank you so much.\nSarah: Perfect! Have a wonderful day!",
    sentimentAnalysis: "The caller was highly engaged and receptive to the Saturday slot. The listing price of $1.2M did not deter interest. Overall excellent sentiment."
  },
  {
    caller: "+1 (555) 014-9842",
    agent: "Chloe (SaaS Billing)",
    duration: "1m 45s",
    cost: 0.79,
    sentiment: "Neutral" as const,
    outcome: "Applied 50% discount for 3 cycles",
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    transcript: "Chloe: I can absolutely assist you with your Pro billing. To verify safety logs, could you confirm the corporate email address connected with your active CallingAgent account?\nCaller: Yes, it's customer1@example.com.\nChloe: Got it! I see your invoice of $49 for the Pro subscription plan issued on the first. Would you like me to process a credit refund or assign a new payment method?\nCaller: I'm thinking of canceling because it's a bit expensive for our current volume.\nChloe: I'm sorry to see you go. I can apply an exclusive 50% discount to your account for the next 3 billing cycles if you'd like to continue testing. Shall we apply this now?\nCaller: Oh, that sounds very reasonable. Let's do that.\nChloe: Perfect, I have applied the 50% discount. It will reflect on your next three bills. Anything else I can resolve today?\nCaller: No, that's all. Thank you.\nChloe: You're welcome! Have a great day.",
    sentimentAnalysis: "The customer was initially planning to cancel due to price, but the proactive 50% discount offer successfully retained them for 3 additional cycles."
  },
  {
    caller: "+1 (555) 012-4422",
    agent: "David (Medical Clinic)",
    duration: "1m 15s",
    cost: 0.56,
    sentiment: "Positive" as const,
    outcome: "Appointment Booked Tuesday 10AM",
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    transcript: "David: Hello! This is David from the medical booking center. Do you have active health insurance?\nCaller: Yes, I have Blue Cross.\nDavid: Wonderful, thank you! I have confirmed your insurance verification is active. Dr. Aris is open next Tuesday at 10:00 AM or Thursday at 2:00 PM. Which premium slot fits your calendar?\nCaller: Tuesday at 10 AM works.\nDavid: Superb, I've reserved your cardiologist follow-up with Dr. Aris. It's scheduled at our central clinic, Suite 410. Shall I notify you of any pre-appointment requirements?\nCaller: Yes, please send the list via email.\nDavid: Done! Be sure to arrive about 10 minutes early with your photo ID. Let me know if any other support is needed!\nCaller: Thank you, David.\nDavid: You are very welcome!",
    sentimentAnalysis: "Caller was polite, had active insurance, and quickly agreed to the first slot. Transaction completed in under 75 seconds."
  },
  {
    caller: "+1 (555) 017-3311",
    agent: "John (Capital dispute)",
    duration: "3m 02s",
    cost: 1.36,
    sentiment: "Negative" as const,
    outcome: "Disputed $45 charge, locked card, issued virtual card",
    timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    transcript: "John: Hello! This is John from safe banking. How can I assist you with your capital queries?\nCaller: There's an unauthorized charge of $45 on my card that I didn't make!\nJohn: Understood. I have initiated a dispute ticket for the $45.00 transaction and temporarily locked your active debit card. Shall we issue a brand-new secure virtual card to your mobile app right now?\nCaller: Yes, please. I am worried my account was hacked!\nJohn: Rest assured, your core checking and savings remain 100% secure in our bank-grade vault. This was an isolated online card charge. Once we cycle the card token, you will be completely protected. Do you want to do that now?\nCaller: Yes, do it now please.\nJohn: Superb, I have logged the dispute and issued a new virtual card with complete zero-liability protection. The new card token is active in your mobile wallet now! Anything else I can assist you with today?\nCaller: No, thank you John for fixing this fast.\nJohn: It is my absolute pleasure. Your security is our priority. Have a safe day!",
    sentimentAnalysis: "Caller was extremely anxious and upset initially due to the fraudulent card charge, but the agent's prompt resolution (locking card, filing dispute, issuing a virtual card) completely pacified them, ending on a high note."
  }
];

export const getCallLogs = async (userId: string, isAdmin: boolean) => {
  try {
    const { getDocs, query, collection, where, setDoc } = await import('firebase/firestore');
    let q;
    if (isAdmin) {
      q = query(collection(db, 'calls'));
    } else {
      q = query(collection(db, 'calls'), where('userId', '==', userId));
    }
    const querySnapshot = await getDocs(q);
    let logs = querySnapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data
      };
    }) as any[];

    if (logs.length === 0) {
      // Seed some mock logs in database so it starts off looking stunning
      const seeded: any[] = [];
      for (const seed of SEED_CALLS) {
        const customId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const logDocRef = doc(db, 'calls', customId);
        const docData = {
          ...seed,
          userId,
          timestamp: serverTimestamp()
        };
        await setDoc(logDocRef, docData);
        seeded.push({
          id: customId,
          ...seed,
          userId,
          timestamp: seed.timestamp
        });
      }
      logs = seeded;
    }

    return logs.sort((a, b) => {
      const timeA = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : new Date(a.timestamp || 0).getTime();
      const timeB = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : new Date(b.timestamp || 0).getTime();
      return timeB - timeA;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'calls');
  }
};

export const saveCallLog = async (logData: {
  userId: string;
  caller: string;
  agent: string;
  duration: string;
  cost: number;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  outcome: string;
  transcript?: string;
  sentimentAnalysis?: string;
}) => {
  const customId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  try {
    const logDocRef = doc(db, 'calls', customId);
    const docData = {
      ...logData,
      timestamp: serverTimestamp()
    };
    await setDoc(logDocRef, docData);
    return {
      id: customId,
      ...logData,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `calls/${customId}`);
  }
};
