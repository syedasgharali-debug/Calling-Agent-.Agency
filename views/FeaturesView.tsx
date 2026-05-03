
import React from 'react';
import Features from '../components/Features';
import { View } from '../App';

interface FeaturesViewProps {
  onNavigate: (view: View) => void;
}

const FeaturesView: React.FC<FeaturesViewProps> = ({ onNavigate }) => {
  return (
    <div className="pt-24 min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-20">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
            Next-Gen <span className="text-indigo-500">Voice</span> Features
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl leading-relaxed">
            CallingAgent.agency is built from the ground up to handle the complexities of real-time human conversation. 
            Explore the features that make our platform the choice for high-performance voice agents.
          </p>
        </div>
        
        <Features />

        <section className="mt-32">
          <h2 className="text-4xl font-black text-white mb-12 tracking-tight">The "Million Dollar Stack"</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Vapi Orchestration', desc: 'The backbone of our real-time voice intelligence, handling complex multi-turn logic and state management.' },
              { title: 'Deepgram STT', desc: 'World-class speech-to-text with sub-100ms latency, optimized for telephony and noisy environments.' },
              { title: 'Cartesia Sonic', desc: 'Ultra-fast, high-fidelity text-to-speech that delivers human-like emotional resonance in real-time.' },
              { title: 'Custom LLM Core', desc: 'Fine-tuned models specifically for conversational voice, ensuring natural flow and minimal latency.' }
            ].map((item, i) => (
              <div key={i} className="p-10 bg-slate-900/50 border border-white/5 rounded-[3rem] hover:border-indigo-500/30 transition-all">
                <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-32 p-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] text-center shadow-2xl shadow-indigo-500/20">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight">Ready to experience sub-second latency?</h2>
          <div className="flex flex-wrap justify-center gap-6">
            <button 
              onClick={() => onNavigate('login')}
              className="px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all active:scale-95"
            >
              Get Started Now
            </button>
            <button 
              onClick={() => onNavigate('docs')}
              className="px-10 py-5 bg-indigo-900/30 text-white border border-white/10 rounded-2xl font-black text-lg hover:bg-indigo-900/50 transition-all active:scale-95"
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
