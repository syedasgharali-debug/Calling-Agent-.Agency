
import React, { useState, useEffect } from 'react';
import { View, UserRole } from '../App';
import { Sun, Moon } from 'lucide-react';

interface NavbarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  user: { email: string; role: UserRole } | null;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, user, onLogout, theme, onThemeToggle }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { label: string; view: View }[] = [
    { label: 'Home', view: 'home' },
    { label: 'Features', view: 'features' },
    { label: 'Pricing', view: 'pricing' },
    { label: 'Blog', view: 'blog' as any },
    { label: 'Company', view: 'about' },
    { label: 'Docs', view: 'docs' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      scrolled || isMobileMenuOpen 
        ? theme === 'dark' 
          ? 'bg-slate-950/90 backdrop-blur-xl border-b border-white/5 py-4' 
          : 'bg-white/90 backdrop-blur-xl border-b border-slate-200 py-4 shadow-sm'
        : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div 
          className="flex items-center space-x-3 cursor-pointer group" 
          onClick={() => {
            onNavigate('home');
            setIsMobileMenuOpen(false);
          }}
        >
          <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 group-hover:scale-110 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent)]"></div>
            <svg className="w-6 h-6 md:w-7 md:h-7 text-white relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 4H9L11 9L8.5 10.5C9.57096 12.6715 11.3285 14.429 13.5 15.5L15 13L20 15V19C20 20.1046 19.1046 21 18 21C8.61116 21 1 13.3888 1 4C1 2.89543 1.89543 2 3 2H5" fill="currentColor"/>
              <path d="M17 2L18 5L21 6L18 7L17 10L16 7L13 6L16 5L17 2Z" fill="white" className="animate-pulse" />
            </svg>
          </div>
          <div className="flex flex-col -space-y-1">
            <span className={`text-xl md:text-2xl font-black tracking-tighter leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Calling<span className="text-indigo-500">Agent</span>
            </span>
            <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-0.5">Agency</span>
          </div>
        </div>

        <div className={`hidden lg:flex items-center space-x-1 rounded-full p-1 border ${
          theme === 'dark' 
            ? 'bg-white/5 border-white/5' 
            : 'bg-slate-100 border-slate-200'
        }`}>
          {navLinks.map((link) => (
            <button
              key={link.view}
              onClick={() => onNavigate(link.view)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                currentView === link.view 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : theme === 'dark'
                    ? 'text-slate-400 hover:text-white hover:bg-white/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle Button */}
          <button
            onClick={onThemeToggle}
            className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center border ${
              theme === 'dark'
                ? 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200 shadow-sm'
            }`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
          </button>

          <div className="hidden sm:flex items-center space-x-4">
            {user ? (
              <>
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className={`text-sm font-bold transition-colors ${
                    currentView === 'dashboard' 
                      ? 'text-indigo-500' 
                      : theme === 'dark' 
                        ? 'text-slate-300 hover:text-white' 
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={onLogout}
                  className="text-sm font-bold text-red-500 hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => onNavigate('login')}
                  className={`text-sm font-bold transition-colors ${
                    theme === 'dark' 
                      ? 'text-slate-300 hover:text-white' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Login
                </button>
                <button 
                  onClick={() => onNavigate('login')}
                  className="relative group overflow-hidden bg-indigo-600 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border ${
              theme === 'dark'
                ? 'text-white bg-white/5 border-white/10'
                : 'text-slate-900 bg-slate-100 border-slate-200'
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isMobileMenuOpen && (
        <div className={`lg:hidden absolute top-full left-0 w-full backdrop-blur-2xl border-b p-6 animate-in fade-in slide-in-from-top-4 duration-300 ${
          theme === 'dark'
            ? 'bg-slate-950/95 border-white/5'
            : 'bg-white/95 border-slate-200 shadow-lg'
        }`}>
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <button
                key={link.view}
                onClick={() => {
                  onNavigate(link.view);
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left px-4 py-3 rounded-xl text-lg font-bold transition-all ${
                  currentView === link.view 
                    ? 'bg-indigo-600 text-white' 
                    : theme === 'dark'
                      ? 'text-slate-400 hover:text-white hover:bg-white/5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className={`pt-4 border-t flex flex-col space-y-4 ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
              {user ? (
                <>
                  <button 
                    onClick={() => {
                      onNavigate('dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left px-4 py-3 rounded-xl text-lg font-bold text-indigo-500 hover:bg-indigo-500/10"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left px-4 py-3 rounded-xl text-lg font-bold text-red-500 hover:bg-red-500/10"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      onNavigate('login');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`text-left px-4 py-3 rounded-xl text-lg font-bold ${
                      theme === 'dark' 
                        ? 'text-slate-300 hover:text-white hover:bg-white/5' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => {
                      onNavigate('login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-indigo-600 text-white text-lg font-bold py-4 rounded-xl shadow-xl shadow-indigo-500/20"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
