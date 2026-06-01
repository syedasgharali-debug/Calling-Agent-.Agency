
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
          <h2 className="text-4xl font-black text-white mb-12 tracking-tight">The CallingAgent AI Telephony Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Autonomous Orchestrator', desc: 'The intellectual core of our real-time voice stack, routing multi-turn logic and managing persistent states instantly.' },
              { title: 'CallingAgent Speech-to-Text', desc: 'Proprietary speech-to-text with sub-90ms latency, specifically optimized for public telephony and noisy environments.' },
              { title: 'CallingAgent Voice Synthesis', desc: 'Ultra-fast, high-fidelity neural text-to-speech that speaks with natural breathing rhythms and emotional context.' },
              { title: 'Domain-Fine-Tuned LLMs', desc: 'Fine-tuned, custom model architectures specializing in real-time dialog flow with zero verbal drift or latency.' }
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
