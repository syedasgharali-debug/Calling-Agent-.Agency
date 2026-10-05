import React from 'react';
import { View } from '../App';

interface FooterProps {
  onNavigate: (view: View) => void;
  theme?: 'dark' | 'light';
}

const Footer: React.FC<FooterProps> = ({ onNavigate, theme = 'dark' }) => {
  return (
    <footer className={`pt-32 pb-16 px-6 relative overflow-hidden border-t transition-colors duration-500 ${
      theme === 'dark' ? 'bg-slate-950 border-white/5' : 'bg-slate-100 border-slate-200'
    }`}>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-16 mb-24">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-8 group cursor-pointer" onClick={() => onNavigate('home')}>
              <div className={`relative w-12 h-12 border rounded-2xl flex items-center justify-center transition-all duration-500 overflow-hidden shrink-0 ${
                theme === 'dark' ? 'bg-slate-950 border-white/10 shadow-[0_0_20px_rgba(99,102,241,0.15)] group-hover:border-indigo-500/30' : 'bg-white border-slate-250 shadow-sm group-hover:border-indigo-500/30'
              }`}>
                {/* Soft inner radial gradient glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/5" />
                <svg className="w-6 h-6 text-indigo-400 relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Telephony Ring Paths */}
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 4" className="opacity-30" />
                  <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="16 4" className="opacity-80" />
                  
                  {/* Voice Waves */}
                  <path d="M9 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M12 7V17" stroke={theme === 'dark' ? '#ffffff' : '#0f172a'} strokeWidth="2" strokeLinecap="round" />
                  <path d="M15 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex flex-col -space-y-1">
                <span className={`text-2xl font-black tracking-tighter leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Calling<span className="text-indigo-500">Agent</span></span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-0.5">Agency</span>
              </div>
            </div>
            <p className={`text-lg max-w-xs leading-relaxed font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
              Revolutionizing the voice economy with sub-second agentic orchestration.
            </p>
          </div>
          
          <div>
            <h4 className={`font-black text-xs uppercase tracking-[0.3em] mb-10 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Product</h4>
            <ul className={`space-y-6 text-sm font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
              <li><button onClick={() => onNavigate('home')} className="hover:text-indigo-500 transition-colors cursor-pointer">Home</button></li>
              <li><button onClick={() => onNavigate('features')} className="hover:text-indigo-500 transition-colors cursor-pointer">Features</button></li>
              <li><button onClick={() => onNavigate('pricing')} className="hover:text-indigo-500 transition-colors cursor-pointer">Pricing</button></li>
              <li><button onClick={() => onNavigate('blog' as any)} className="hover:text-indigo-500 transition-colors cursor-pointer">Blog</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className={`font-black text-xs uppercase tracking-[0.3em] mb-10 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Company</h4>
            <ul className={`space-y-6 text-sm font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
              <li><button onClick={() => onNavigate('about')} className="hover:text-indigo-500 transition-colors cursor-pointer">About Us</button></li>
              <li><button onClick={() => onNavigate('careers')} className="hover:text-indigo-500 transition-colors cursor-pointer">Careers</button></li>
              <li><button onClick={() => onNavigate('privacy')} className="hover:text-indigo-500 transition-colors cursor-pointer">Privacy</button></li>
              <li><button onClick={() => onNavigate('terms')} className="hover:text-indigo-500 transition-colors cursor-pointer">Terms</button></li>
            </ul>
          </div>

          <div>
            <h4 className={`font-black text-xs uppercase tracking-[0.3em] mb-10 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Social</h4>
            <ul className={`space-y-6 text-sm font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Twitter / X</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">LinkedIn</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">YouTube</a></li>
            </ul>
          </div>
        </div>
        
        <div className={`pt-12 border-t flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 text-sm font-bold ${
          theme === 'dark' ? 'border-white/5 text-slate-600' : 'border-slate-200 text-slate-500'
        }`}>
          <p>© 2024 CallingAgent.agency Orchestration Systems Inc.</p>
          <div className="flex items-center space-x-10">
            <button onClick={() => onNavigate('terms')} className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:text-white' : 'hover:text-slate-900'}`}>Legal</button>
            <button onClick={() => onNavigate('privacy')} className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:text-white' : 'hover:text-slate-900'}`}>Cookies</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
