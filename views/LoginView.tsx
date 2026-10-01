import React, { useState, useEffect } from 'react';
import { UserRole } from '../App';
import { loginWithGoogle, loginWithGoogleRedirect, loginWithEmail, registerWithEmail, handleRedirectResult } from '../services/firebaseService';
import { ShieldCheck, Sparkles, Key, Mail, Lock } from 'lucide-react';

interface LoginViewProps {
  onLogin: (email: string, role: UserRole, fallbackUser?: any) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        setLoading(true);
        const profile = await handleRedirectResult();
        if (profile) {
          onLogin(profile.email, profile.role as UserRole, profile);
        }
      } catch (err: any) {
        console.error("Google redirect result processor failed:", err);
        let errMsg = err.message || 'Google redirect login failed';
        if (err.code === 'auth/unauthorized-domain') {
          errMsg = 'This domain is not authorized in your Firebase Console. Please add ' + window.location.hostname + ' to the Firebase Authorized Domains list.';
        }
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };
    checkRedirectResult();
  }, [onLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const adminEmails = ['syedasgharkazmii@gmail.com', 'syedasghakazmii@gmail.com', 'essadhiif@gmail.com'];
      const isAdminEmail = adminEmails.includes(email.toLowerCase().trim());
      const isAdminPassword = password === 'Ilmadhiif1$';

      if (isAdminEmail && isAdminPassword) {
        onLogin(email.toLowerCase().trim(), 'admin');
        return;
      }

      let userObj;
      if (isRegistering) {
        userObj = await registerWithEmail(email, password);
      } else {
        userObj = await loginWithEmail(email, password);
      }

      if (userObj) {
        onLogin(userObj.email, userObj.role as UserRole, userObj);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const isIframe = window.self !== window.top;

  const handleGoogleLoginUnified = async (forceRedirect: boolean = false) => {
    setLoading(true);
    setError('');
    
    if (isIframe || forceRedirect) {
      try {
        await loginWithGoogleRedirect();
      } catch (err: any) {
        let errMsg = err.message || 'Google authentication failed';
        if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('unauthorized-domain'))) {
          errMsg = 'auth/unauthorized-domain';
        }
        setError(errMsg);
        setLoading(false);
      }
      return;
    }

    try {
      const profile = await loginWithGoogle();
      if (profile) {
        onLogin(profile.email, profile.role as UserRole, profile);
      }
    } catch (err: any) {
      console.warn("Google popup failed, falling back to redirect:", err);
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        try {
          await loginWithGoogleRedirect();
        } catch (redirectErr: any) {
          let errMsg = redirectErr.message || 'Google authentication failed';
          if (redirectErr.code === 'auth/unauthorized-domain' || (redirectErr.message && redirectErr.message.includes('unauthorized-domain'))) {
            errMsg = 'auth/unauthorized-domain';
          }
          setError(errMsg);
        }
      } else {
        let errMsg = err.message || 'Google authentication failed';
        if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('unauthorized-domain'))) {
          errMsg = 'auth/unauthorized-domain';
        }
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-40 pb-32 px-6 flex items-center justify-center min-h-screen bg-[#020617] relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest font-mono">Secure Authorization</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {isRegistering ? 'Initialize Workspace' : 'Welcome Back'}
          </h1>
          <p className="text-slate-500 text-xs font-semibold">Scale your autonomous AI calling operations</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-400 text-xs font-medium space-y-2">
              {error === 'auth/unauthorized-domain' ? (
                <div className="text-left space-y-2">
                  <p className="font-bold text-red-300 text-sm">⚠️ Authorized Domain Setup Required</p>
                  <p className="text-slate-300 leading-snug">Your live domain <code className="bg-slate-950 px-1.5 py-0.5 rounded text-indigo-400 font-mono font-bold">{window.location.hostname}</code> needs to be whitelisted in your Firebase Console.</p>
                  <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-2 text-[11px] text-slate-400 font-mono leading-normal">
                    <p className="text-slate-200 font-bold mb-1">How to fix this in 60 seconds:</p>
                    <p>1. Open <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-450 underline hover:text-indigo-300">Firebase Console</a></p>
                    <p>2. Open project: <span className="text-emerald-450">gen-lang-client-0915498446</span></p>
                    <p>3. Go to <span className="text-slate-350 font-bold">Authentication</span> → <span className="text-slate-350 font-bold">Settings</span> tab</p>
                    <p>4. Under <span className="text-slate-350 font-bold">Authorized domains</span>, click <span className="text-slate-350 font-bold">Add domain</span></p>
                    <p>5. Enter: <span className="text-indigo-350 font-bold">{window.location.hostname}</span> and save</p>
                  </div>
                </div>
              ) : (
                <p className="text-center font-bold leading-relaxed">{error}</p>
              )}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-mono">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold placeholder-slate-700 transition-colors"
                  placeholder="name@company.com"
                  required
                />
                <Mail className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-mono">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold placeholder-slate-700 transition-colors"
                  placeholder="••••••••"
                  required
                />
                <Lock className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authorizing Session...' : (isRegistering ? 'Initialize Workspace' : 'Authorize Credentials')}
            </button>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
              <span className="bg-[#0b1229] px-3 text-slate-500 font-mono">Or connect via</span>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              type="button"
              onClick={() => handleGoogleLoginUnified(false)}
              disabled={loading}
              className="w-full py-3.5 bg-white hover:bg-slate-200 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Google SSO Link</span>
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => handleGoogleLoginUnified(true)}
                className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest font-mono cursor-pointer"
              >
                Popup issues? Access Direct Redirect Mode →
              </button>
            </div>
          </div>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-dashed border-white/5">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-slate-450 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            {isRegistering ? 'Already have an authorized workspace? Sign In' : 'Provision a new workspace account? Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
