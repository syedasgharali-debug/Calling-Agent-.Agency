
import React from 'react';
import { View } from '../App';

interface FooterProps {
  onNavigate: (view: View) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="pt-32 pb-16 px-6 bg-slate-950 border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-16 mb-24">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-8 group cursor-pointer" onClick={() => onNavigate('home')}>
              <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 group-hover:scale-110 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent)]"></div>
                <svg className="w-7 h-7 text-white relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 4H9L11 9L8.5 10.5C9.57096 12.6715 11.3285 14.429 13.5 15.5L15 13L20 15V19C20 20.1046 19.1046 21 18 21C8.61116 21 1 13.3888 1 4C1 2.89543 1.89543 2 3 2H5" fill="currentColor"/>
                  <path d="M17 2L18 5L21 6L18 7L17 10L16 7L13 6L16 5L17 2Z" fill="white" className="animate-pulse" />
                </svg>
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="text-2xl font-black tracking-tighter text-white leading-none">Calling<span className="text-indigo-500">Agent</span></span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-0.5">Agency</span>
              </div>
            </div>
            <p className="text-slate-500 text-lg max-w-xs leading-relaxed font-medium">
              Revolutionizing the voice economy with sub-second agentic orchestration.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-10">Product</h4>
            <ul className="space-y-6 text-sm font-bold text-slate-500">
              <li><button onClick={() => onNavigate('home')} className="hover:text-indigo-400 transition-colors">Home</button></li>
              <li><button onClick={() => onNavigate('features')} className="hover:text-indigo-400 transition-colors">Features</button></li>
              <li><button onClick={() => onNavigate('pricing')} className="hover:text-indigo-400 transition-colors">Pricing</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-10">Company</h4>
            <ul className="space-y-6 text-sm font-bold text-slate-500">
              <li><button onClick={() => onNavigate('about')} className="hover:text-indigo-400 transition-colors">About Us</button></li>
              <li><button onClick={() => onNavigate('careers')} className="hover:text-indigo-400 transition-colors">Careers</button></li>
              <li><button onClick={() => onNavigate('privacy')} className="hover:text-indigo-400 transition-colors">Privacy</button></li>
              <li><button onClick={() => onNavigate('terms')} className="hover:text-indigo-400 transition-colors">Terms</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-10">Social</h4>
            <ul className="space-y-6 text-sm font-bold text-slate-500">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Twitter / X</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">LinkedIn</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">YouTube</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 text-sm font-bold text-slate-600">
          <p>© 2024 CallingAgent.agency Orchestration Systems Inc.</p>
          <div className="flex items-center space-x-10">
            <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">Legal</button>
            <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">Cookies</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
