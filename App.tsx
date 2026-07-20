
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeView from './views/HomeView';
import FeaturesView from './views/FeaturesView';
import PricingView from './views/PricingView';
import AboutView from './views/AboutView';
import DocsView from './views/DocsView';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import LegalView from './views/LegalView';
import CareerView from './views/CareerView';
import ChatWidget from './components/ChatWidget';
import BlogModal from './components/BlogModal';
import { auth, logoutUser, syncUserProfile } from './services/firebaseService';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

export type View = 'home' | 'features' | 'pricing' | 'about' | 'docs' | 'login' | 'dashboard' | 'privacy' | 'terms' | 'careers' | 'blog';
export type UserRole = 'customer' | 'admin' | null;

export interface Plan {
  name: string;
  price: number;
  yearlyPrice: number;
  mins: number;
  agents: number;
  numbers: number;
  features: string[];
  color: string;
  recommended?: boolean;
}

export interface Coupon {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  expiry: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  fullContent?: string;
  author: string;
  date: string;
  image: string;
}

interface UserSession {
  uid?: string;
  email: string;
  role: UserRole;
  plan?: string;
  name?: string;
  profilePic?: string;
  balance?: number;
  credits?: number;
  agents?: any[];
  clonedVoices?: any[];
  notifyLowCreditEmail?: boolean;
  notifyLowCreditSMS?: boolean;
  notifyCallFailuresEmail?: boolean;
  notifyCallFailuresSMS?: boolean;
  notificationPhoneNumber?: string;
  notificationEmail?: string;
  lowCreditThreshold?: string;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [impersonatedUser, setImpersonatedUser] = useState<UserSession | null>(null);

  const [plans, setPlans] = useState<Plan[]>([
    { 
      name: 'Starter', 
      price: 45, 
      yearlyPrice: 432, 
      mins: 100, 
      agents: 2, 
      numbers: 1,
      features: ['100 Included Mins', '$0.65/min Overage', '2 AI Agents', '1 Phone Number', 'Standard Support'],
      color: 'from-blue-600 to-indigo-600'
    },
    { 
      name: 'Pro', 
      price: 225, 
      yearlyPrice: 2160, 
      mins: 500, 
      agents: 10, 
      numbers: 5,
      features: ['500 Included Mins', '$0.65/min Overage', '10 AI Agents', '5 Phone Numbers', 'Priority Support', 'Advanced Analytics'],
      color: 'from-indigo-600 to-purple-600',
      recommended: true
    },
    { 
      name: 'Enterprise', 
      price: 1125, 
      yearlyPrice: 10800, 
      mins: 2500, 
      agents: 50, 
      numbers: 20,
      features: ['2,500 Included Mins', '$0.65/min Overage', 'Bring Your Own Key (BYOK)', 'Dedicated Account Manager', 'Full API Access', 'White-labeling'],
      color: 'from-purple-600 to-pink-600'
    }
  ]);

  const [coupons, setCoupons] = useState<Coupon[]>([
    { code: 'WELCOME10', discount: 10, type: 'percentage', expiry: '2026-12-31' }
  ]);

  const [blogs, setBlogs] = useState<Blog[]>([
    {
      id: '1',
      title: 'The Future of Agentic Voice AI and Sub-Second Latency',
      content: 'CallingAgent.agency is leading the charge in sub-second voice orchestration. Learn how our new native engine is changing the landscape of customer support with unprecedented latency optimizations.',
      fullContent: `At CallingAgent.agency, we believe the next frontier of human-computer interaction is voice. Traditional Interactive Voice Response (IVR) systems are clunky, static, and frustrating for users. They rely on rigid button-press menus that offer zero flexibility. On the other hand, traditional LLM-based voice solutions are plagued by high latency, verbal drift, and an inability to handle natural human interruptions.

### The Sub-Second Latency Challenge

For a voice conversation to feel natural, the round-trip latency must be under 300 milliseconds. Most API-driven voice systems require several seconds to convert speech to text, route it to an LLM, wait for a text response, and then synthetically verbalize the output. This results in awkward pauses and a thoroughly artificial feel.

CallingAgent.agency solves this by implementing an ultra-low latency conversational orchestrator. By routing audio directly via secure SIP trunks to our native engine, we run transcription, intelligence models, and neural speech synthesis in a continuous, fully parallelized streaming workflow. The moment a user stops speaking, our Voice Activity Detection (VAD) triggers an immediate response from our domain-fine-tuned models, achieving a sub-150ms latency that outperforms standard human-to-human conversational reaction times.

### Deep Technological Stack Integrations

Our sub-second latency is not just a byproduct of fast servers—it is a result of structural optimizations across the entire telecommunications and telemetry stack:

1. **Direct SIP Stream Trunks:** We bypass middle-man API gateways. Audio streams directly from carriers via Session Border Controllers (SBC) using the RTP protocol straight into our memory-mapped voice runners.
2. **Predictive Token TTS Pipeline:** Rather than waiting for the entire LLM generation, our modern text-to-speech stream begins synthesis upon the very first token generated by the reasoning engine. 
3. **Optimized Voice Activity Detection (VAD):** Standard VADs introduce 200ms of lag just to ensure you have finished your utterance. Our custom VAD evaluates speech patterns, intonations, and breathing tracks to detect a terminal query in under 40ms with 98.7% accuracy.

### Elevating the Customer Experience

By utilizing intelligent call routing and deep integration with CRM systems like Salesforce, HubSpot, and custom SQL databases, our autonomous voice agents do more than chat—they execute actions. They can check product inventory in real-time, update ticket statuses, process subscription upgrades, and schedule calendar appointments without any human supervision, completely transforming the voice support landscape. Your enterprise can now operate a high-performance, responsive support line that answers every call on the first ring, understands context instantly, and moves customer requests forward flawlessly.`,
      author: 'Marcus Chen',
      date: '2026-04-01',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: '2',
      title: 'Scaling AI Voice Operations for Global Telephony Systems',
      content: 'Moving from local testing to global deployment requires more than just a good prompt. Explore the architectural shifts needed to handle 10,000+ concurrent minutes.',
      fullContent: `Taking an AI voice agent from a local development environment to a production call center handling thousands of concurrent calls requires robust, enterprise-grade telecommunication architecture. Standard APIs and single-threaded structures fail instantly when exposed to the high loads of global campaigns.

### The Physics of Real-Time Voice

Unlike web APIs or text chats, real-time voice is highly sensitive to network jitter and packet loss. A simple 50ms delay in network packets can distort a voice streaming over WebRTC or SIP, causing stuttering and breaking conversational continuity. 

CallingAgent.agency operates on an advanced global cluster with point-of-presence (PoP) edge nodes distributed worldwide. We establish direct peer-to-peer SIP connections with major carriers, ensuring that phone traffic is routed over dedicated fiber networks with minimal hop counts and ultra-low route distances.

### Load Balancing and Concurrent Orchestration

When scaling to 10,000+ concurrent call minutes, system utilization spikes. If an LLM response is delayed even slightly, the calling carrier may interpret the silence as a dropped call.

Our orchestration layer uses a highly scalable actor-model framework that dynamically balances calls across regional nodes:

* **Dynamic Regional Clustering:** If a particular European server experiences a heavy load spike, calls are shifted to neighboring continental edge nodes instantly with zero interruption to the ongoing conversation.
* **Decoupled VoIP Signaling:** By decoupling network-level VoIP signaling from LLM executing engines, we guarantee 99.99% conversation uptime and stellar audio quality even under peak traffic volumes.
* **Persistent Cache Layers:** User session profiles, dialogue context, and custom instructions are cached in low-latency key-value stores to avoid re-fetching delays during live voice streams.

### Dynamic Carrier Routing and Resiliency

Our platform dynamically monitors call quality metrics (including packet loss, latency, and MOS scores) in real-time. If a carrier network shows signs of degradation, our automated SIP trunking protocol routes subsequent traffic through alternative global telecom partners instantly, keeping your call center running flawlessly. This geographic redundancy eliminates single points of failure, making CallingAgent.agency the most dependable partner for global enterprises executing mission-critical call campaigns.`,
      author: 'Sarah Jenkins',
      date: '2026-04-05',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: '3',
      title: 'The Secret to Natural Sounding AI: Dynamic Turn-Taking and Neural Synthesis',
      content: 'Latency is only half the battle. Discover how combining VAD with low-level neural synthesis produces speech that is indistinguishable from human conversation.',
      fullContent: `Have you ever spoken to a voice assistant and felt an immediate sense of artificiality? This is often referred to as the 'uncanny valley' of voice. It is caused by three key elements: unnatural pauses, monotonous intonation, and an inability to handle conversational interruption.

### Beyond Text-To-Speech (TTS)

Standard text-to-speech (TTS) engines take static paragraphs and turn them into voice streams. This works fine for reading audiobooks, but fails completely in a fluid voice dialogue where sentences are shaped by context, feedback, and turn-taking.

At CallingAgent.agency, we utilize a custom streaming neural voice synthesis pipeline. Instead of waiting for full sentences to generate, our synthesis engine streams audio fragments word-by-word with rich intonation models. This allows our voice agents to hum, pause, and adjust their inflection dynamically based on user reactions.

### Mastering Interruptions with Advanced Voice Activity Detection (VAD)

Humans interrupt each other constantly in physical or business conversations. In a standard voice bot, if a user speaks while the bot is talking, the bot will speak over them or awkwardly freeze. 

CallingAgent.agency utilizes advanced digital signal processing (DSP) to separate user audio from the bot’s synthetic feedback on the fly:

* **Instant Interrupt Detection:** When the customer starts talking, our voice synthesis stream is cut off in less than 50 milliseconds, and the user's input is immediately routed back into the reasoning core.
* **Overlapped Dialogue Handling:** If the user just says "Mmhmm" or "Okay" confirming comprehension, our system evaluates whether they are trying to take the turn or just providing affirmative feedback, permitting natural continuous speech.

### Adaptive Intonation and Emotional Intelligence

Our voice stack models the speaker's emotional state by analyzing voice acoustics, tone, and speech rate. If a caller is frustrated, our agents automatically lower their pitch, speak slower, and use reassuring, compassionate language patterns. If a caller is excited, the agent matches their energy, creating a feedback loop that builds immense trust and brand affinity.`,
      author: 'David Vales',
      date: '2026-04-08',
      image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&q=80&w=800'
    }
  ]);

  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  useEffect(() => {
    // Attempt to load any active fallback database session on mount
    const savedSession = localStorage.getItem('fallback_user_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setUser(parsed);

        // Fetch latest details from Firestore to keep dashboard synchronized
        if (parsed.uid) {
          const fetchLatest = async () => {
            try {
              const { doc, getDoc } = await import('firebase/firestore');
              const { db } = await import('./services/firebaseService');
              const snapshot = await getDoc(doc(db, 'users', parsed.uid));
              if (snapshot.exists()) {
                const data = snapshot.data();
                const freshUser = {
                  ...parsed,
                  name: data.name || parsed.name,
                  profilePic: data.profilePic || parsed.profilePic,
                  role: data.role || parsed.role,
                  balance: data.balance !== undefined ? data.balance : parsed.balance,
                  credits: data.credits !== undefined ? data.credits : parsed.credits,
                  plan: data.plan !== undefined ? data.plan : parsed.plan || 'Free',
                  agents: data.agents || parsed.agents,
                  clonedVoices: data.clonedVoices || parsed.clonedVoices || [],
                  notifyLowCreditEmail: data.notifyLowCreditEmail !== undefined ? data.notifyLowCreditEmail : parsed.notifyLowCreditEmail,
                  notifyLowCreditSMS: data.notifyLowCreditSMS !== undefined ? data.notifyLowCreditSMS : parsed.notifyLowCreditSMS,
                  notifyCallFailuresEmail: data.notifyCallFailuresEmail !== undefined ? data.notifyCallFailuresEmail : parsed.notifyCallFailuresEmail,
                  notifyCallFailuresSMS: data.notifyCallFailuresSMS !== undefined ? data.notifyCallFailuresSMS : parsed.notifyCallFailuresSMS,
                  notificationPhoneNumber: data.notificationPhoneNumber !== undefined ? data.notificationPhoneNumber : parsed.notificationPhoneNumber,
                  notificationEmail: data.notificationEmail !== undefined ? data.notificationEmail : parsed.notificationEmail,
                  lowCreditThreshold: data.lowCreditThreshold !== undefined ? data.lowCreditThreshold : parsed.lowCreditThreshold,
                };
                setUser(freshUser);
                localStorage.setItem('fallback_user_session', JSON.stringify(freshUser));
                console.log("Successfully loaded fresh user session from database.");
              }
            } catch (err) {
              console.warn("Could not refresh user session from Firestore on mount:", err);
            }
          };
          fetchLatest();
        }
      } catch (e) {
        console.error("Failed to parse fallback session:", e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await syncUserProfile(firebaseUser);
        if (profile) {
          const u = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: (profile as any).name || firebaseUser.displayName || '',
            profilePic: (profile as any).profilePic || firebaseUser.photoURL || '',
            role: profile.role as UserRole,
            balance: (profile as any).balance !== undefined ? (profile as any).balance : 5.00,
            credits: (profile as any).credits !== undefined ? (profile as any).credits : 100,
            plan: (profile as any).plan || 'Free',
            agents: (profile as any).agents || null,
            clonedVoices: (profile as any).clonedVoices || [],
            notifyLowCreditEmail: (profile as any).notifyLowCreditEmail !== undefined ? (profile as any).notifyLowCreditEmail : true,
            notifyLowCreditSMS: (profile as any).notifyLowCreditSMS !== undefined ? (profile as any).notifyLowCreditSMS : false,
            notifyCallFailuresEmail: (profile as any).notifyCallFailuresEmail !== undefined ? (profile as any).notifyCallFailuresEmail : true,
            notifyCallFailuresSMS: (profile as any).notifyCallFailuresSMS !== undefined ? (profile as any).notifyCallFailuresSMS : true,
            notificationPhoneNumber: (profile as any).notificationPhoneNumber || '',
            notificationEmail: (profile as any).notificationEmail || firebaseUser.email || '',
            lowCreditThreshold: (profile as any).lowCreditThreshold || '20',
          };
          setUser(u);
          localStorage.setItem('fallback_user_session', JSON.stringify(u));
          
          // Redirect to dashboard if the user is currently on the login screen
          const currentHash = window.location.hash.replace('#', '');
          if (currentHash === 'login' || currentHash === '') {
            navigate('dashboard');
          }
        }
      } else {
        // Only clear user state if we do not have a fallback session active in local storage
        if (!localStorage.getItem('fallback_user_session')) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as View;
      const validViews: View[] = ['home', 'features', 'pricing', 'about', 'docs', 'login', 'dashboard', 'privacy', 'terms', 'careers'];
      if (validViews.includes(hash)) {
        setCurrentView(hash);
      } else if (hash === 'blog') {
        setCurrentView('home');
        setTimeout(() => {
          const element = document.getElementById('blog');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    
    return () => {
      window.removeEventListener('hashchange', handleHash);
      unsubscribe();
    };
  }, []);

  const navigate = (view: View) => {
    window.location.hash = view;
    if (view === 'blog') {
      setCurrentView('home');
      setTimeout(() => {
        const element = document.getElementById('blog');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
      return;
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleLogin = async (email: string, role: UserRole, fallbackUser?: any) => {
    let sessionUser: UserSession;
    if (fallbackUser) {
      sessionUser = {
        uid: fallbackUser.uid,
        email: fallbackUser.email,
        role: fallbackUser.role,
        name: fallbackUser.name || email.split('@')[0],
        balance: fallbackUser.balance !== undefined ? fallbackUser.balance : (role === 'admin' ? 0 : 5.00),
        credits: fallbackUser.credits !== undefined ? fallbackUser.credits : (role === 'admin' ? 0 : 100),
        plan: fallbackUser.plan || 'Free',
        agents: fallbackUser.agents || null,
        clonedVoices: fallbackUser.clonedVoices || [],
        profilePic: fallbackUser.profilePic || ''
      };
    } else {
      const docId = `fallback_${email.toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, '_')}`;
      sessionUser = {
        uid: docId,
        email: email.toLowerCase().trim(),
        role: role,
        name: email.split('@')[0],
        balance: role === 'admin' ? 0 : 5.00,
        credits: role === 'admin' ? 0 : 100,
        plan: 'Free',
        agents: null,
        clonedVoices: [],
        profilePic: ''
      };
    }
    setUser(sessionUser);
    localStorage.setItem('fallback_user_session', JSON.stringify(sessionUser));
    
    // Sync to Firestore to ensure their account details are persistent in the database
    if (sessionUser.uid) {
      try {
        const { doc, setDoc, getDoc } = await import('firebase/firestore');
        const { db } = await import('./services/firebaseService');
        const userDocRef = doc(db, 'users', sessionUser.uid);
        const existingSnap = await getDoc(userDocRef);
        if (!existingSnap.exists()) {
          await setDoc(userDocRef, {
            email: sessionUser.email,
            role: sessionUser.role,
            name: sessionUser.name,
            balance: sessionUser.balance,
            credits: sessionUser.credits,
            plan: sessionUser.plan || 'Free',
            agents: sessionUser.agents,
            profilePic: sessionUser.profilePic,
            createdAt: new Date().toISOString()
          });
          console.log("Created database record for fallback/admin user:", sessionUser.uid);
        } else {
          // Merge existing Firestore database values to state to avoid resetting anything to zero
          const data = existingSnap.data();
          const mergedUser = {
            ...sessionUser,
            name: data.name || sessionUser.name,
            profilePic: data.profilePic || sessionUser.profilePic,
            balance: data.balance !== undefined ? data.balance : sessionUser.balance,
            credits: data.credits !== undefined ? data.credits : sessionUser.credits,
            plan: data.plan !== undefined ? data.plan : sessionUser.plan,
            agents: data.agents || sessionUser.agents,
            clonedVoices: data.clonedVoices || sessionUser.clonedVoices || [],
            notifyLowCreditEmail: data.notifyLowCreditEmail !== undefined ? data.notifyLowCreditEmail : sessionUser.notifyLowCreditEmail,
            notifyLowCreditSMS: data.notifyLowCreditSMS !== undefined ? data.notifyLowCreditSMS : sessionUser.notifyLowCreditSMS,
            notifyCallFailuresEmail: data.notifyCallFailuresEmail !== undefined ? data.notifyCallFailuresEmail : sessionUser.notifyCallFailuresEmail,
            notifyCallFailuresSMS: data.notifyCallFailuresSMS !== undefined ? data.notifyCallFailuresSMS : sessionUser.notifyCallFailuresSMS,
            notificationPhoneNumber: data.notificationPhoneNumber !== undefined ? data.notificationPhoneNumber : sessionUser.notificationPhoneNumber,
            notificationEmail: data.notificationEmail !== undefined ? data.notificationEmail : sessionUser.notificationEmail,
            lowCreditThreshold: data.lowCreditThreshold !== undefined ? data.lowCreditThreshold : sessionUser.lowCreditThreshold,
          };
          setUser(mergedUser);
          localStorage.setItem('fallback_user_session', JSON.stringify(mergedUser));
        }
      } catch (err) {
        console.warn("Could not synchronize fallback session user in Firestore:", err);
      }
    }
    
    navigate('dashboard');
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('fallback_user_session');
      if (user && auth.currentUser) {
        await logoutUser(auth.currentUser.uid);
      } else {
        await auth.signOut();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setImpersonatedUser(null);
      navigate('home');
      // Force reload to clear any residual state/loops
      window.location.reload();
    }
  };

  const handleUpdateUser = async (updates: Partial<UserSession>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('fallback_user_session', JSON.stringify(updatedUser));
      
      const userId = user.uid || (auth.currentUser ? auth.currentUser.uid : null);
      if (userId) {
        try {
          const { doc, setDoc } = await import('firebase/firestore');
          const { db } = await import('./services/firebaseService');
          await setDoc(doc(db, 'users', userId), updates, { merge: true });
          console.log("Successfully saved updates to user profile inside Firestore:", userId);
        } catch (e) {
          console.warn("Failed to persist user updates in Firestore:", e);
        }
      }
    }
  };

  const handleImpersonate = (email: string) => {
    setImpersonatedUser({ email, role: 'customer' });
    navigate('dashboard');
  };

  const renderContent = () => {
    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;

    switch (currentView) {
      case 'about':
        return <AboutView />;
      case 'docs':
        return <DocsView />;
      case 'login':
        return <LoginView onLogin={handleLogin} />;
      case 'dashboard':
        return user ? (
          <DashboardView 
            user={impersonatedUser || user} 
            isAdmin={user.role === 'admin'}
            isImpersonating={!!impersonatedUser}
            onLogout={handleLogout} 
            onUpdateUser={handleUpdateUser}
            onImpersonate={handleImpersonate}
            onStopImpersonating={() => setImpersonatedUser(null)}
            plans={plans}
            setPlans={setPlans}
            coupons={coupons}
            setCoupons={setCoupons}
            blogs={blogs}
            setBlogs={setBlogs}
          />
        ) : <LoginView onLogin={handleLogin} />;
      case 'privacy':
      case 'terms':
        return <LegalView type={currentView} />;
      case 'careers':
        return <CareerView />;
      case 'features':
        return <FeaturesView onNavigate={navigate} />;
      case 'pricing':
        return <PricingView onNavigate={navigate} plans={plans} />;
      case 'home':
      default:
        return (
          <HomeView 
            onNavigate={navigate} 
            plans={plans} 
            blogs={blogs} 
            selectedBlog={selectedBlog} 
            setSelectedBlog={setSelectedBlog} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-indigo-500/30 text-slate-200">
      <style>{`
        * { font-style: normal !important; }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {currentView !== 'dashboard' && <Navbar currentView={currentView} onNavigate={navigate} user={user} onLogout={handleLogout} />}
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
        {currentView !== 'dashboard' && <Footer onNavigate={navigate} />}
        <ChatWidget />
      </div>

      <AnimatePresence>
        {selectedBlog && (
          <BlogModal blog={selectedBlog} onClose={() => setSelectedBlog(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
