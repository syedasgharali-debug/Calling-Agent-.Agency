import React, { useState } from 'react';
import { View } from '../App';
import { Plan } from '../types';
import { Check, Info, Settings, Shield, Sliders, Zap } from 'lucide-react';

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
    let baseFee = 250;
    const ratePerMin = useOwnApiKeys 
      ? 0.04 
      : entMinutes < 50000 ? 0.18 : entMinutes < 150000 ? 0.14 : entMinutes < 500000 ? 0.11 : 0.08;
      
    const minsCost = entMinutes * ratePerMin;
    const numbersCost = entNumbers * 2.00; 
    const agentsCost = entAgents * 5.00; 
    const slaCost = hasDedicatedSLA ? 150 : 0;
    
    let total = baseFee + minsCost + numbersCost + agentsCost + slaCost;
    if (isYearly) {
      total = total * 0.80; 
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
      layer: "Monthly Minutes",
      standardApi: "Pay-as-you-go",
      callingAgent: "500 - 15,000+ Mins",
      byokSupport: "Unlimited (BYOK)"
    },
    {
      layer: "Active AI Agent Slots",
      standardApi: "Per Agent/Instance Fee",
      callingAgent: "2 - 50+ Agents",
      byokSupport: "Unlimited"
    },
    {
      layer: "Included Phone Numbers",
      standardApi: "Manual Provisioning",
      callingAgent: "1 - 50 Numbers",
      byokSupport: "Unlimited"
    },
    {
      layer: "Voice Latency",
      standardApi: "Variable (>300ms)",
      callingAgent: "Ultra-low (<150ms)",
      byokSupport: "Ultra-low (<150ms)"
    },
    {
      layer: "Voice Engine",
      standardApi: "Standard TTS",
      callingAgent: "Neural Streaming TTS",
      byokSupport: "Neural Streaming TTS"
    },
    {
      layer: "Support Level",
      standardApi: "Community/Email Only",
      callingAgent: "Standard to Priority",
      byokSupport: "24/7 Dedicated"
    },
    {
      layer: "Integrations & API",
      standardApi: "Restricted",
      callingAgent: "CRM, SQL, Webhooks",
      byokSupport: "Full API & Custom"
    },
    {
      layer: "Compliance & Security",
      standardApi: "Basic",
      callingAgent: "Enterprise Grade",
      byokSupport: "Enterprise Grade + BYOK"
    }
  ];

  return (
    <section id="pricing" className="py-20 px-6 relative overflow-hidden bg-slate-950">
      <div className="max-w-7xl mx-auto relative z-10 space-y-16">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] font-mono">
            Calibrated Scaling Economics
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
            Transparent, Predictable Infrastructure Pricing
          </h2>
          <p className="text-slate-400 text-base md:text-lg font-medium leading-relaxed">
            No look-up fees. No legacy markup. Power your voice outbound channels with either our direct high-fidelity voice lines or connect your custom telephony trunks.
          </p>
          
          {/* Custom Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 pt-4">
            <span className={`text-xs font-bold transition-colors ${!isYearly ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-11 h-6 bg-slate-800 rounded-full p-1 transition-colors hover:bg-slate-700"
              aria-label="Toggle annual billing"
            >
              <div className={`w-4 h-4 bg-indigo-500 rounded-full transition-transform duration-300 transform ${isYearly ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-bold transition-colors ${isYearly ? 'text-white' : 'text-slate-500'}`}>Annually</span>
              <span className="bg-indigo-500/10 text-indigo-400 text-[9px] font-black px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-wider animate-pulse">Save 20%</span>
            </div>
          </div>
        </div>

        {/* Cohesive Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.filter(p => !p.hidden).map((plan, idx) => {
            const basePrice = isYearly ? plan.yearlyPrice : plan.price;
            const displayPrice = isYearly ? Math.floor(basePrice / 12) : basePrice;
            
            return (
              <div 
                key={idx} 
                className={`relative p-10 rounded-[2.5rem] border flex flex-col justify-between transition-all duration-300 ${
                  plan.recommended 
                  ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_30px_100px_rgba(99,102,241,0.05)]' 
                  : 'border-white/5 bg-slate-900/30'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-indigo-500/30">
                    Recommended
                  </div>
                )}
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">{plan.name}</h3>
                    <div className="flex items-baseline mt-4">
                      <span className="text-4xl md:text-5xl font-black text-white tracking-tight">
                        ${displayPrice}
                      </span>
                      <span className="text-slate-500 font-bold ml-1.5 text-xs uppercase tracking-widest">/month</span>
                    </div>
                    {isYearly && (
                      <div className="text-[10px] font-black text-indigo-400 mt-2 uppercase tracking-widest font-mono">
                        Billed ${plan.yearlyPrice} annually
                      </div>
                    )}
                    {plan.trialDays && (
                      <div className="mt-4 px-3.5 py-2.5 bg-indigo-500/10 border border-indigo-500/15 rounded-2xl text-left flex items-start space-x-2.5">
                        <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                        <div className="space-y-0.5">
                          <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-mono">{plan.trialDescription}</div>
                          <div className="text-[10px] text-slate-400 font-bold leading-none">No charge for {plan.trialDays} days</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-dashed border-white/5 pt-6">
                    <ul className="space-y-4">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-center text-xs font-semibold text-slate-350">
                          <Check className="w-4 h-4 text-indigo-500 mr-3 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-8 mt-8 border-t border-white/5">
                  <button 
                    onClick={() => onNavigate('login')}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98]"
                  >
                    Select {plan.name}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Enterprise Configurator */}
        <div className="bg-slate-900/20 border border-white/5 rounded-[3rem] p-10 md:p-12 space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-indigo-400">
                <Sliders className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest font-mono">Elastic Architect</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">Custom Plan Customizer</h3>
              <p className="text-slate-400 text-sm font-medium">Calibrate your enterprise voice pipeline in real-time to match custom requirements.</p>
            </div>
            
            <div className="text-right shrink-0">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 font-mono">Estimated Cost</div>
              <div className="text-4xl md:text-5xl font-black text-white tracking-tight">
                ${calculateEnterpriseMonthly()}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold mt-1">/month {isYearly ? '(billed annually)' : ''}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 border-t border-white/5 pt-8">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-2">
                  <span>Monthly Dialogue Minutes</span>
                  <span className="font-mono text-indigo-400 font-black">{entMinutes.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="5000" 
                  max="1000000" 
                  step="5000"
                  value={entMinutes}
                  onChange={(e) => setEntMinutes(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-2">
                  <span>Dedicated Agent Slots</span>
                  <span className="font-mono text-indigo-400 font-black">{entAgents}</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="100" 
                  step="1"
                  value={entAgents}
                  onChange={(e) => setEntAgents(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-2">
                  <span>Included Local Numbers</span>
                  <span className="font-mono text-indigo-400 font-black">{entNumbers}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  step="1"
                  value={entNumbers}
                  onChange={(e) => setEntNumbers(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              <div className="flex items-center justify-between border border-white/5 p-4 rounded-2xl bg-slate-950/30">
                <div className="space-y-1 pr-4">
                  <div className="text-xs font-black text-white">24/7 Dedicated SLA Support</div>
                  <p className="text-[10px] text-slate-500 leading-snug">Priority channels & custom deployment engineers</p>
                </div>
                <button 
                  onClick={() => setHasDedicatedSLA(!hasDedicatedSLA)}
                  className={`w-10 h-6 rounded-full p-1 transition-all ${hasDedicatedSLA ? 'bg-indigo-600' : 'bg-slate-800'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${hasDedicatedSLA ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-between space-y-6">
              <div className="flex items-center justify-between border border-white/5 p-4 rounded-2xl bg-slate-950/30">
                <div className="space-y-1 pr-4">
                  <div className="text-xs font-black text-white">Bring Your Own Keys (BYOK)</div>
                  <p className="text-[10px] text-slate-500 leading-snug">Bypass min pricing & use your Twilio/Vapi wholesale rates</p>
                </div>
                <button 
                  onClick={() => setUseOwnApiKeys(!useOwnApiKeys)}
                  className={`w-10 h-6 rounded-full p-1 transition-all ${useOwnApiKeys ? 'bg-indigo-600' : 'bg-slate-800'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${useOwnApiKeys ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
              
              <button 
                onClick={() => onNavigate('login')}
                className="w-full py-4.5 bg-white hover:bg-slate-200 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-white/5 active:scale-[0.98]"
              >
                Provision Enterprise Workspace
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Telemetry Matrix comparison list */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h4 className="text-lg font-black text-white tracking-tight">Full Capabilities Matrix</h4>
            <p className="text-xs text-slate-500 font-semibold">Examine layer-by-layer architectural comparison across modern voice stacks.</p>
          </div>
          
          <div className="border border-white/5 rounded-3xl overflow-hidden bg-slate-900/10">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">
                    <th className="p-6">Feature Layer</th>
                    <th className="p-6">Standard Voice Wrappers</th>
                    <th className="p-6 text-indigo-400">CallingAgent Bundle</th>
                    <th className="p-6">BYOK Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03] text-xs font-semibold text-slate-300">
                  {comparisonRows.map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-6 font-bold text-white whitespace-nowrap">{row.layer}</td>
                      <td className="p-6">{row.standardApi}</td>
                      <td className="p-6 text-indigo-300 font-bold">{row.callingAgent}</td>
                      <td className="p-6">{row.byokSupport}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Pricing;
