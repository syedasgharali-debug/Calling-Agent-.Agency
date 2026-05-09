
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
import { auth, logoutUser, syncUserProfile } from './services/firebaseService';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

export type View = 'home' | 'features' | 'pricing' | 'about' | 'docs' | 'login' | 'dashboard' | 'privacy' | 'terms' | 'careers';
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
  author: string;
  date: string;
  image: string;
}

interface UserSession {
  email: string;
  role: UserRole;
  plan?: string;
  name?: string;
  profilePic?: string;
  balance?: number;
  credits?: number;
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
      title: 'The Future of Agentic Voice AI',
      content: 'CallingAgent.agency is leading the charge in sub-second voice orchestration. Learn how our new native engine is changing the landscape of customer support with unprecedented latency optimizations.',
      author: 'Marcus Chen',
      date: '2026-04-01',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: '2',
      title: 'Scaling Voice Operations for Global Teams',
      content: 'Moving from local testing to global deployment requires more than just a good prompt. Explore the architectural shifts needed to handle 10,000+ concurrent minutes.',
      author: 'Sarah Jenkins',
      date: '2026-04-05',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: '3',
      title: 'The Secret to Natural Sounding AI',
      content: 'Latency is only half the battle. Discover how combining RAG with low-level neural synthesis produces speech that is indistinguishable from human conversation.',
      author: 'David Vales',
      date: '2026-04-08',
      image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&q=80&w=800'
    }
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await syncUserProfile(firebaseUser);
        if (profile) {
          setUser({
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || '',
            profilePic: firebaseUser.photoURL || '',
            role: profile.role as UserRole,
            balance: (profile as any).balance || 0,
            credits: (profile as any).credits || 0,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as View;
      const validViews: View[] = ['home', 'features', 'pricing', 'about', 'docs', 'login', 'dashboard', 'privacy', 'terms', 'careers'];
      if (validViews.includes(hash)) {
        setCurrentView(hash);
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
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleLogin = (email: string, role: UserRole) => {
    if (role === 'admin') {
      setUser({
        email,
        role: 'admin',
        name: email.split('@')[0],
        balance: 0,
        credits: 0
      });
    }
    navigate('dashboard');
  };

  const handleLogout = async () => {
    if (user) {
      await logoutUser(auth.currentUser?.uid || '');
    }
    navigate('home');
  };

  const handleUpdateUser = (updates: Partial<UserSession>) => {
    if (user) {
      setUser({ ...user, ...updates });
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
        return <HomeView onNavigate={navigate} plans={plans} blogs={blogs} />;
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
      </div>
    </div>
  );
};

export default App;
