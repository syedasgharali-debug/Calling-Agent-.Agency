
import React from 'react';
import { View, Plan } from '../App';

interface PricingProps {
  onNavigate: (view: View) => void;
  plans: Plan[];
}

const Pricing: React.FC<PricingProps> = ({ onNavigate, plans }) => {
  const [isYearly, setIsYearly] = React.useState(false);

  return (
    <section id="pricing" className="py-16 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Pricing for <span className="text-indigo-500 underline decoration-indigo-500/30">Scale</span></h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-12">Transparent infrastructure pricing. No hidden fees. Billed as you grow your voice operation.</p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-sm font-bold transition-colors ${!isYearly ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-14 h-7 bg-slate-800 rounded-full p-1 transition-colors hover:bg-slate-700"
            >
              <div className={`w-5 h-5 bg-indigo-500 rounded-full transition-transform duration-300 transform ${isYearly ? 'translate-x-7' : 'translate-x-0'}`}></div>
            </button>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-bold transition-colors ${isYearly ? 'text-white' : 'text-slate-500'}`}>Yearly</span>
              <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Save 20%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div 
              key={idx} 
              className={`relative p-10 rounded-[2.5rem] border flex flex-col transition-all duration-500 group hover:-translate-y-2 ${
                plan.recommended 
                ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_20px_100px_rgba(79,70,229,0.15)] ring-1 ring-indigo-500/50' 
                : 'border-white/5 bg-slate-900/50 backdrop-blur-xl'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[11px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg">Most Popular</div>
              )}
              
              <div className="mb-10 text-center md:text-left">
                <h3 className="text-2xl font-black text-white mb-4 tracking-tighter">{plan.name}</h3>
                <div className="flex items-baseline justify-center md:justify-start">
                  <span className="text-6xl font-black text-white tracking-tighter">
                    ${isYearly ? Math.floor(plan.yearlyPrice / 12) : plan.price}
                  </span>
                  <span className="text-slate-500 font-bold ml-2">/month</span>
                </div>
                {isYearly && (
                  <div className="text-xs font-bold text-indigo-400 mt-2 uppercase tracking-widest">
                    Billed ${plan.yearlyPrice} annually
                  </div>
                )}
              </div>

              <ul className="space-y-5 mb-12 flex-1">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-center text-sm font-medium text-slate-300">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center mr-4 shrink-0">
                      <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => onNavigate('login')}
                className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 ${
                plan.recommended 
                ? 'bg-white text-slate-950 hover:bg-slate-200' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}>
                {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
