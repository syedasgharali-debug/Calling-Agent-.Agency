import React from 'react';
import Features from '../components/Features';
import { View } from '../App';
import { Sparkles, ArrowRight } from 'lucide-react';

interface FeaturesViewProps {
  onNavigate: (view: View) => void;
  theme?: 'dark' | 'light';
}

const FeaturesView: React.FC<FeaturesViewProps> = ({ onNavigate, theme = 'dark' }) => {
  return (
    <div className={`pt-32 min-h-screen relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#000000]' : 'bg-[#ffffff]'}`}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-indigo-500/[0.02] blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-20 space-y-24 relative z-10">
        
        {/* Header */}
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3.5 py-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest font-mono">Platform Capability</span>
          </div>
          <h1 className={`text-5xl md:text-8xl font-black tracking-tighter text-wrap-balance leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Next-Gen Voice Intelligence
          </h1>
          <p className={`text-sm md:text-base font-semibold leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-650'}`}>
            CallingAgent.agency is engineered from the ground up to orchestrate complex real-time conversations. Explore the sub-second pipeline features built for scale.
          </p>
        </div>
        
        {/* Core Capabilities Component */}
        <Features theme={theme} />

        {/* Dynamic Architectural Section */}
        <section className="space-y-12">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] font-mono">Core Stack Blueprint</span>
            <h2 className={`text-3xl md:text-5xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>The Telephony Engineering Layers</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Autonomous Orchestration', desc: 'The state-driven brain routing complex multi-turn logic and capturing variables context-aware.' },
              { title: 'Real-Time STT Processing', desc: 'Custom Speech-to-Text pipelines with sub-90ms processing speeds specifically optimized for noisy voice networks.' },
              { title: 'Dynamic TTS Generation', desc: 'Ultra-fast neural text-to-speech engine carrying human-like breathing rhythms, pacing, and dynamic intonation.' },
              { title: 'Specialized LLM Context', desc: 'Fine-tuned conversational logic graphs optimized strictly for telephone dialogue flows to eliminate drift.' }
            ].map((item, i) => (
              <div 
                key={i} 
                className={`p-10 border rounded-[2.5rem] hover:border-indigo-500/15 transition-all duration-300 flex flex-col justify-between h-72 ${
                  theme === 'dark' ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50 border-slate-200 shadow-sm'
                }`}
              >
                <div className="text-[10px] font-mono font-black text-indigo-400 bg-indigo-500/5 border border-indigo-500/15 w-8 h-8 rounded-xl flex items-center justify-center">
                  0{i + 1}
                </div>
                <div className="space-y-2">
                  <h3 className={`text-lg font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                  <p className={`text-xs font-semibold leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Bounded Box */}
        <div className={`p-12 md:p-16 border rounded-[3rem] text-center space-y-8 relative overflow-hidden ${
          theme === 'dark' ? 'bg-gradient-to-br from-indigo-500/10 via-slate-950 to-emerald-500/5 border-white/5' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="absolute inset-0 bg-grid-white/5 pointer-events-none" />
          <h2 className={`text-3xl md:text-5xl font-black tracking-tighter max-w-2xl mx-auto ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Ready to experience sub-second latency?
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <button 
              onClick={() => onNavigate('login')}
              className="px-8 py-4 bg-white hover:bg-slate-200 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-md"
            >
              Get Started Now
            </button>
            <button 
              onClick={() => onNavigate('docs')}
              className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all active:scale-95 ${
                theme === 'dark' ? 'bg-slate-900 hover:bg-slate-800 text-slate-350 hover:text-white border-white/5' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
              }`}
            >
              Read Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesView;
