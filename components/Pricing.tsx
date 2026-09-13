import React, { useState } from 'react';
import { View, Plan } from '../App';

interface PricingProps {
  onNavigate: (view: View) => void;
  plans: Plan[];
}

const Pricing: React.FC<PricingProps> = ({ onNavigate, plans }) => {
  const [isYearly, setIsYearly] = useState(false);
  
  // Custom Enterprise Plan Builder State
  const [entMinutes, setEntMinutes] = useState(25000);
  const [entAgents, setEntAgents] = useState(15);
  const [entNumbers, setEntNumbers] = useState(5);
  const [hasDedicatedSLA, setHasDedicatedSLA] = useState(true);
  const [useOwnApiKeys, setUseOwnApiKeys] = useState(false);

  // Dynamic calculations for customizable Enterprise plan
  const calculateEnterpriseMonthly = () => {
    // Base platform access fee
    let baseFee = 250;
    
    // Per-minute fee depending on volume and if they use own keys
    const ratePerMin = useOwnApiKeys 
      ? 0.04 // pure infrastructure cost
      : entMinutes < 50000 ? 0.18 : entMinutes < 150000 ? 0.14 : entMinutes < 500000 ? 0.11 : 0.08;
      
    const minsCost = entMinutes * ratePerMin;
    
    // Numbers cost
    const numbersCost = entNumbers * 2.00; // $2 per local number
    
    // Agents cost
    const agentsCost = entAgents * 5.00; // $5 per agent slot
    
    // SLA addon
    const slaCost = hasDedicatedSLA ? 150 : 0;
    
    let total = baseFee + minsCost + numbersCost + agentsCost + slaCost;
    if (isYearly) {
      total = total * 0.80; // 20% off for commitment
    }
    return Math.round(total);
  };

  const getEnterpriseOverageRate = () => {
    if (useOwnApiKeys) return "Your Provider Wholesale Rate";
    if (entMinutes < 50000) return "$0.19/min";
    if (entMinutes < 150000) return "$0.15/min";
    if (entMinutes < 500000) return "$0.11/min";
    return "$0.08/min";
  };

  // Stack Comparison Data
  const comparisonRows = [
    {
      layer: "LLM / Voice Logic",
      standardApi: "OpenAI GPT-4o API (Avg. $0.03/min input/output token delay)",
      callingAgent: "Direct LLM pipelines with sub-100ms caching (Included)",
      byokSupport: "Yes, plug in your own OpenAI/Anthropic/Gemini keys"
    },
    {
      layer: "Speech-to-Text (STT)",
      standardApi: "Deepgram Nova-2 ($0.013/min + custom streaming VAD labor)",
      callingAgent: "Native micro-VAD with sub-second text packetizer (Included)",
      byokSupport: "Yes, plug in your own Deepgram or Groq keys"
    },
    {
      layer: "Text-to-Speech (TTS)",
      standardApi: "ElevenLabs / Cartesia ($0.15 to $0.24/min neural stream)",
      callingAgent: "Fully optimized low-latency ultra-realistic models (Included)",
      byokSupport: "Yes, plug in your own ElevenLabs/Play.ht keys"
    },
    {
      layer: "Telephony Carrier",
      standardApi: "Twilio/Plivo ($0.013/min inbound + $0.021/min outbound + number)",
      callingAgent: "Dedicated global SIP trunks + custom webhooks (Included)",
      byokSupport: "Yes, connect your own Twilio, Telnyx, or Plivo keys"
    },
    {
      layer: "System Orchestrator",
      standardApi: "Vapi/Retell ($0.05 to $0.10/min baseline platform markup)",
      callingAgent: "Fully unified CallingAgent engine (Zero platform markups)",
      byokSupport: "Completely customizable parameters per agent"
    }
  ];

  return (
    <section id="pricing" className="py-16 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest rounded-full mb-4 inline-block">
            High Density Telephony Pricing
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Transparent Pricing for <span className="text-indigo-500 underline decoration-indigo-500/30">Scale</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-10 font-medium">
            No lookup fees. No hidden setup fees. Scale your outbound caller pipeline with either our bundled platform plans or plug in your own API keys.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-sm font-bold transition-colors ${!isYearly ? 'text-white' : 'text-slate-500'}`}>Monthly Billing</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-14 h-7 bg-slate-800 rounded-full p-1 transition-colors hover:bg-slate-700"
              aria-label="Toggle annual billing"
            >
              <div className={`w-5 h-5 bg-indigo-500 rounded-full transition-transform duration-300 transform ${isYearly ? 'translate-x-7' : 'translate-x-0'}`}></div>
            </button>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-bold transition-colors ${isYearly ? 'text-white' : 'text-slate-500'}`}>Yearly (Commitment)</span>
              <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Save 20%</span>
            </div>
          </div>
        </div>

        {/* 4 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan, idx) => {
            const displayPrice = isYearly ? Math.floor(plan.yearlyPrice / 12) : plan.price;
            return (
              <div 
                key={idx} 
                className={`relative p-8 rounded-[2rem] border flex flex-col transition-all duration-300 group hover:-translate-y-2 ${
                  plan.recommended 
                  ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_20px_100px_rgba(79,70,229,0.12)] ring-1 ring-indigo-500/50' 
                  : 'border-white/5 bg-slate-900/50 backdrop-blur-xl'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                    Recommended
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-xl font-black text-white mb-2 tracking-tight">{plan.name}</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl md:text-5xl font-black text-white tracking-tight">
                      ${displayPrice}
                    </span>
                    <span className="text-slate-500 font-bold ml-1.5 text-sm">/mo</span>
                  </div>
                  {isYearly && (
                    <div className="text-[10px] font-bold text-indigo-400 mt-1 uppercase tracking-wider">
                      Billed ${plan.yearlyPrice}/yr
                    </div>
                  )}
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start text-xs font-medium text-slate-300 leading-normal">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-indigo-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-300">{feat}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => onNavigate('login')}
                  className={`w-full py-4 rounded-xl font-black text-sm transition-all active:scale-[0.98] ${
                    plan.recommended 
                    ? 'bg-white text-slate-950 hover:bg-slate-200' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                  }`}
                >
                  {plan.name.includes('Enterprise') ? 'Design Custom Plan' : 'Select Plan'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Dynamic & Customizable Enterprise Plan Builder */}
        <div className="p-8 md:p-12 bg-slate-900/40 border border-white/5 rounded-[3rem] backdrop-blur-2xl relative overflow-hidden mb-16">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left sliders */}
            <div className="space-y-6">
              <span className="px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                Interactive Plan Configurator
              </span>
              <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none">
                Customize Your <span className="text-indigo-400">Enterprise SLA</span>
              </h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-lg">
                Drag the controls below to configure your custom calling capacity. Real-time platform rates are calculated dynamically depending on your Bring Your Own Key (BYOK) parameters.
              </p>

              <div className="space-y-6 pt-4">
                {/* Sliders for limits */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Estimated Monthly Minutes</span>
                    <span className="font-mono font-black text-white text-sm">{entMinutes.toLocaleString()} mins</span>
                  </div>
                  <input 
                    type="range"
                    min="5000"
                    max="500000"
                    step="5000"
                    value={entMinutes}
                    onChange={(e) => setEntMinutes(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono font-extrabold text-slate-600 uppercase tracking-widest">
                    <span>5k</span>
                    <span>100k</span>
                    <span>250k</span>
                    <span>500k mins</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Dedicated AI Agent Templates</span>
                    <span className="font-mono font-black text-white text-sm">{entAgents} Agents</span>
                  </div>
                  <input 
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={entAgents}
                    onChange={(e) => setEntAgents(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Local & Toll-Free Phone Numbers</span>
                    <span className="font-mono font-black text-white text-sm">{entNumbers} Numbers</span>
                  </div>
                  <input 
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={entNumbers}
                    onChange={(e) => setEntNumbers(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Toggles */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <label className="flex items-center space-x-3 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={hasDedicatedSLA}
                      onChange={(e) => setHasDedicatedSLA(e.target.checked)}
                      className="rounded border-white/10 bg-slate-950 text-indigo-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-slate-300">Dedicated SLA & 24/7 Priority Channel (+$150/mo)</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={useOwnApiKeys}
                      onChange={(e) => setUseOwnApiKeys(e.target.checked)}
                      className="rounded border-white/10 bg-slate-950 text-indigo-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-indigo-400">Bring Your Own Key (BYOK) Pricing Model</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Quote calculator results */}
            <div className="p-8 bg-slate-950/60 border border-white/5 rounded-[2rem] space-y-6 relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-[2rem]"></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/30 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-1">Infrastructure Tier Rate</p>
                  <p className="text-xl md:text-2xl font-mono font-black text-indigo-400">
                    {useOwnApiKeys ? "BYOK Mode" : `$${(entMinutes < 50000 ? 0.18 : entMinutes < 150000 ? 0.14 : entMinutes < 500000 ? 0.11 : 0.08).toFixed(2)}`}<span className="text-xs text-slate-500">{useOwnApiKeys ? "" : "/min"}</span>
                  </p>
                </div>

                <div className="p-4 bg-slate-900/30 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-1">Overage Call Rate</p>
                  <p className="text-xl md:text-2xl font-mono font-black text-white">{getEnterpriseOverageRate()}</p>
                </div>
              </div>

              <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex flex-col items-center justify-center text-center">
                <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest mb-1">ESTIMATED CUSTOM MONTHLY QUOTE</p>
                <p className="text-5xl font-mono font-black text-white mb-2">${calculateEnterpriseMonthly().toLocaleString()}<span className="text-xs text-slate-500 font-sans">/mo</span></p>
                <span className="text-[10px] text-slate-400 font-medium">
                  {isYearly ? "Annual package saves 20% compared to month-to-month" : "Toggle Annual billing above to save an extra 20%"}
                </span>
              </div>

              <button 
                onClick={() => onNavigate('login')}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-black text-sm tracking-wide shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all"
              >
                Provision Custom Enterprise Capacity →
              </button>
            </div>

          </div>
        </div>

        {/* Competition & Custom API Key Comparison Chart */}
        <div className="p-8 md:p-12 bg-slate-900/40 border border-white/5 rounded-[3rem] backdrop-blur-2xl">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <span className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-3 inline-block">
              Market Architecture Transparency
            </span>
            <h3 className="text-3xl font-black text-white tracking-tight mb-3">
              CallingAgent vs. Traditional API Stacks
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Building a voice agent manually requires configuring several independent API vendors, dealing with cold-starts, latency drift, and multiple complex billing systems. Here is how we compare.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="pb-4 pt-2">Infrastructure Layer</th>
                  <th className="pb-4 pt-2">Building Directly with Custom APIs</th>
                  <th className="pb-4 pt-2 text-indigo-400">CallingAgent.agency (Bundled Engine)</th>
                  <th className="pb-4 pt-2 text-emerald-400">Bring Your Own Key (BYOK)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 font-bold text-white">{row.layer}</td>
                    <td className="py-4 pr-4 text-slate-400 leading-relaxed">{row.standardApi}</td>
                    <td className="py-4 pr-4 font-semibold text-indigo-300 leading-relaxed">{row.callingAgent}</td>
                    <td className="py-4 font-semibold text-emerald-400 leading-relaxed">{row.byokSupport}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 p-6 bg-slate-950/40 border border-white/5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-1">
              <h4 className="text-sm font-black text-white">Why Supporting Bring Your Own Key (BYOK) Matters</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Unlike closed ecosystems that lock you into proprietary markups, we allow you to plug in your own developer credentials. You only pay us a flat $0.04/min orchestration fee, retaining your direct wholesale carrier volume tier pricing.
              </p>
            </div>
            <div className="text-right">
              <button 
                onClick={() => onNavigate('login')}
                className="w-full md:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all"
              >
                Connect My API Keys
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Pricing;
