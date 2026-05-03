
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
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [user, setUser] = useState<UserSession | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<UserSession | null>(null);

  const [plans, setPlans] = useState<Plan[]>([
    { 
      name: 'Starter', 
      price: 29, 
      yearlyPrice: 280, 
      mins: 100, 
      agents: 2, 
      numbers: 1,
      features: ['100 Included Mins', '$0.25/min Overage', '2 AI Agents', '1 Phone Number', 'Standard Support'],
      color: 'from-blue-600 to-indigo-600'
    },
    { 
      name: 'Pro', 
      price: 99, 
      yearlyPrice: 950, 
      mins: 500, 
      agents: 10, 
      numbers: 5,
      features: ['500 Included Mins', '$0.18/min Overage', '10 AI Agents', '5 Phone Numbers', 'Priority Support', 'Advanced Analytics'],
      color: 'from-indigo-600 to-purple-600',
      recommended: true
    },
    { 
      name: 'Enterprise', 
      price: 399, 
      yearlyPrice: 3800, 
      mins: 2500, 
      agents: 50, 
      numbers: 20,
      features: ['2,500 Included Mins', 'Bring Your Own Key (BYOK)', 'Dedicated Account Manager', 'Full API Access', 'White-labeling'],
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
      content: 'CallingAgent.agency is leading the charge in sub-second voice orchestration. Learn how our new native engine is changing the landscape of customer support.',
      author: 'Marcus Chen',
      date: '2026-04-01',
      image: 'https://picsum.photos/seed/callingagent/800/400'
    }
  ]);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as View;
      const validViews: View[] = ['home', 'features', 'pricing', 'about', 'docs', 'login', 'dashboard', 'privacy', 'terms', 'careers'];
      if (validViews.includes(hash)) {
        setCurrentView(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    
    const savedUser = localStorage.getItem('callingagent_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigate = (view: View) => {
    setCurrentView(view);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (email: string, role: UserRole) => {
    const newUser = { email, role };
    setUser(newUser);
    setImpersonatedUser(null);
    localStorage.setItem('callingagent_user', JSON.stringify(newUser));
    navigate('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setImpersonatedUser(null);
    localStorage.removeItem('callingagent_user');
    navigate('home');
  };

  const handleUpdateUser = (updates: Partial<UserSession>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('callingagent_user', JSON.stringify(updatedUser));
    }
  };

  const handleImpersonate = (email: string) => {
    setImpersonatedUser({ email, role: 'customer' });
    navigate('dashboard');
  };

  const renderContent = () => {
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
          {renderContent()}
        </main>
        {currentView !== 'dashboard' && <Footer onNavigate={navigate} />}
      </div>
    </div>
  );
};

export default App;
