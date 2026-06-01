
import React from 'react';
import { View } from '../App';

interface HeroProps {
  onNavigate: (view: View) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section className="relative pt-32 pb-16 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-10 animate-fade-in">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em]">The Million Dollar Voice Stack</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-[1.05] tracking-tight max-w-5xl mx-auto italic">
          AI Telephony that <br/>
          <span className="gradient-text">works 24/7</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
          Empower your business with <b className="text-slate-100 font-bold">CallingAgent.agency</b> — the ultimate ultra-low latency AI call center platform. Deploy autonomous, native voice agents that handle support, schedule bookings, and convert leads in real-time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
          <button 
            onClick={() => onNavigate('pricing')}
            className="w-full sm:w-auto px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all transform hover:-translate-y-1 shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95"
          >
            Deploy AI Agent
          </button>
          <button 
            onClick={() => onNavigate('docs')}
            className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg border border-white/10 hover:bg-slate-800 transition-all transform hover:-translate-y-1 active:scale-95"
          >
            View API Docs
          </button>
        </div>

        {/* Dynamic Stack Visual */}
        <div className="relative max-w-6xl mx-auto group">
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-[3rem] blur-2xl opacity-50"></div>
          <div className="relative bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl p-1 md:p-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: 'TELEPHONY', value: 'Global SIP Trunk', detail: 'Secure Voice Trunks', color: 'indigo' },
                { label: 'TRANSCRIPTION', value: 'Real-Time STT', detail: 'Sub-90ms Processing', color: 'purple' },
                { label: 'REASONING', value: 'Agentic Model', detail: 'Context-Aware Flows', color: 'pink' },
                { label: 'SYNTHESIS', value: 'Neural Voices', detail: 'Human-like TTS Speech', color: 'blue' },
              ].map((item, i) => (
                <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-500 text-left group/card">
                  <div className={`text-[10px] font-black text-${item.color}-400 mb-4 tracking-[0.25em]`}>{item.label}</div>
                  <div className="text-2xl font-bold text-white mb-1">{item.value}</div>
                  <div className="text-xs text-slate-500 group-hover/card:text-slate-300 transition-colors">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
