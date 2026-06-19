
import React from 'react';
import { View, Plan } from '../App';

interface PricingProps {
  onNavigate: (view: View) => void;
  plans: Plan[];
}

const Pricing: React.FC<PricingProps> = ({ onNavigate, plans }) => {
  const [isYearly, setIsYearly] = React.useState(false);
  const [interactiveMins, setInteractiveMins] = React.useState(100000);

  // Dynamic volume rates per minute
  const getSimulatedRate = (mins: number) => {
    if (mins < 10000) return 0.15;
    if (mins < 50000) return 0.12;
    if (mins < 150000) return 0.10;
    if (mins < 500000) return 0.08;
    return 0.05;
  };

  const getSimulatedTraditionalCost = (mins: number) => {
    // Standard outsourced human call center agent rate ~ $1.25/min loaded
    return mins * 1.25;
  };

  const getSimulatedCallingAgentCost = (mins: number) => {
    return mins * getSimulatedRate(mins);
  };

  return (
    <section id="pricing" className="py-16 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Pricing for <span className="text-indigo-500 underline decoration-indigo-500/30">Scale</span></h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-12 font-medium">Transparent infrastructure pricing. No hidden lookup fees. Unlimited concurrent lines. Billed as your pipeline expands.</p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-sm font-bold transition-colors ${!isYearly ? 'text-white' : 'text-slate-500'}`}>Monthly Billing</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-14 h-7 bg-slate-800 rounded-full p-1 transition-colors hover:bg-slate-700"
            >
              <div className={`w-5 h-5 bg-indigo-500 rounded-full transition-transform duration-300 transform ${isYearly ? 'translate-x-7' : 'translate-x-0'}`}></div>
            </button>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-bold transition-colors ${isYearly ? 'text-white' : 'text-slate-500'}`}>Yearly (Commitment)</span>
              <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Save 20%</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, idx) => {
            const displayPrice = isYearly ? Math.floor(plan.yearlyPrice / 12) : plan.price;
            return (
              <div 
                key={idx} 
                className={`relative p-10 rounded-[2.5rem] border flex flex-col transition-all duration-500 group hover:-translate-y-2 ${
                  plan.recommended 
                  ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_20px_100px_rgba(79,70,229,0.15)] ring-1 ring-indigo-500/50' 
                  : 'border-white/5 bg-slate-900/50 backdrop-blur-xl'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[11px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg">Most Popular</div>
                )}
                
                <div className="mb-10 text-center md:text-left">
                  <h3 className="text-2xl font-black text-white mb-2 tracking-tighter">{plan.name}</h3>
                  <div className="flex items-baseline justify-center md:justify-start">
                    <span className="text-6xl font-black text-white tracking-tighter">
                      ${displayPrice}
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
                  }`}
                >
                  {plan.name === 'Enterprise' ? 'Design Enterprise Plan' : 'Get Started'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Live Estimator Interactive Calculator Banner */}
        <div className="p-10 md:p-12 bg-slate-900/40 border border-white/5 rounded-[3rem] backdrop-blur-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Interactive Control Area */}
            <div className="space-y-6">
              <span className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                Interactive Enterprise Savings Calculator
              </span>
              <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-tight">
                Simulate Your <span className="text-indigo-400">Outbound ROI</span> Instantly
              </h3>
              <p className="text-slate-400 font-medium leading-relaxed max-w-lg">
                Drag the interactive slider to align with your monthly caller outbound minutes. Instantly unlock deep volume-tier discounts from our high-density telecommunication gateway.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Monthly Desired Minutes</span>
                  <span className="text-lg font-mono font-black text-white">{interactiveMins.toLocaleString()} mins</span>
                </div>
                
                <input 
                  type="range"
                  min="10000"
                  max="1000000"
                  step="10000"
                  value={interactiveMins}
                  onChange={(e) => setInteractiveMins(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                
                <div className="flex justify-between text-[10px] font-mono font-extrabold text-slate-600 uppercase tracking-widest">
                  <span>10,000 mins</span>
                  <span>500,000 mins</span>
                  <span>1,000,000 mins</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Live ROI Panel */}
            <div className="p-8 bg-slate-950/60 border border-white/5 rounded-[2.5rem] space-y-6 relative">
              <div className="grid grid-cols-2 gap-4">
                
                <div className="p-4 bg-slate-900/40 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-1">Outbound Rate</p>
                  <p className="text-2xl font-mono font-black text-indigo-400">${getSimulatedRate(interactiveMins).toFixed(2)}<span className="text-xs text-slate-500">/min</span></p>
                </div>

                <div className="p-4 bg-slate-900/40 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-1">Estimated Monthly Cost</p>
                  <p className="text-2xl font-mono font-black text-white">${getSimulatedCallingAgentCost(interactiveMins).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>

              </div>

              <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Estimated Human Telephony Cost</p>
                  <p className="text-sm font-mono font-bold text-slate-400 line-through">${getSimulatedTraditionalCost(interactiveMins).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-emerald-300 font-bold">Total Operations Savings</p>
                  <p className="text-2xl font-mono font-black text-emerald-400">
                    +${(getSimulatedTraditionalCost(interactiveMins) - getSimulatedCallingAgentCost(interactiveMins)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => onNavigate('login')}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-black text-sm tracking-wide shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all"
                >
                  Configure Enterprise Outbound Capacity
                </button>
                <div className="text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    *Based on $1.25/min average loaded human wage rate.
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default Pricing;
