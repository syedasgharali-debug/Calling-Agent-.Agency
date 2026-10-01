import React, { useState } from 'react';
import { View } from '../App';
import { Plan } from '../types';
import { Check, Info, Settings, Shield, Sliders, Zap, Sparkles, Star, Award, ShieldAlert, Cpu, Heart, CheckCircle2 } from 'lucide-react';

interface PricingProps {
  onNavigate: (view: View) => void;
  plans: Plan[];
}

const Pricing: React.FC<PricingProps> = ({ onNavigate, plans }) => {
  const [isYearly, setIsYearly] = useState(false);
  
  // Custom Enterprise Plan Builder State
  const [entMinutes, setEntMinutes] = useState(50000);
  const [entAgents, setEntAgents] = useState(25);
  const [entNumbers, setEntNumbers] = useState(8);
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
      layer: "Monthly Included Minutes",
      standardApi: "Pay-as-you-go (No bundled mins)",
      callingAgent: "Up to 6,000 Premium Mins included",
      byokSupport: "Unlimited (Use wholesale carriers)"
    },
    {
      layer: "Active AI Voice Channels",
      standardApi: "Restricted concurrency limits",
      callingAgent: "High concurrency (Up to 50 concurrent lines)",
      byokSupport: "Unlimited concurrency"
    },
    {
      layer: "Voice Stream Latency",
      standardApi: "Variable (often > 350ms on mobile)",
      callingAgent: "Ultra-low streaming (< 130ms average)",
      byokSupport: "Edge-routed ultra-low (< 120ms)"
    },
    {
      layer: "Carrier Network Connection",
      standardApi: "Standard VoIP/SIP routes",
      callingAgent: "Premium Direct Carrier Twilio SIP trunks",
      byokSupport: "Private dedicated carrier trunks"
    },
    {
      layer: "Security & Ledger Compliance",
      standardApi: "Basic encryption",
      callingAgent: "HIPAA, SOC2, and GDPR certified secure ledger",
      byokSupport: "On-premise custom security policies"
    },
    {
      layer: "CRM & Workflow Integrations",
      standardApi: "None / Manual API dev",
      callingAgent: "HubSpot, Salesforce, Zapier & custom Webhooks",
      byokSupport: "Unlimited customized integration pipelines"
    },
    {
      layer: "Dedicated Engineer SLA",
      standardApi: "Ticket-based email support (3+ business days)",
      callingAgent: "Premium priority Slack / Zoom support",
      byokSupport: "24/7/365 Dedicated Systems Engineer"
    }
  ];

  // Modern enhanced details to map to default plans for marketing persuasiveness
  const planDesignAdditions: Record<string, { badge: string; icon: any; tagline: string; customGrad: string; focusColor: string }> = {
    starter: {
      badge: "SOLOPRENEUR SEED",
      icon: Zap,
      tagline: "Unleash human-grade support on autopilot for small campaigns.",
      customGrad: "from-amber-500/20 via-orange-600/5 to-transparent",
      focusColor: "text-amber-400"
    },
    pro: {
      badge: "MOST POPULAR HYPER-SCALE",
      icon: Sparkles,
      tagline: "Engineered for scaling enterprises requiring high-availability.",
      customGrad: "from-indigo-500/20 via-purple-600/5 to-transparent",
      focusColor: "text-indigo-400"
    },
    business: {
      badge: "PREMIUM CONCIERGE FLEET",
      icon: Award,
      tagline: "Complete multi-agent custom setup with priority queueing.",
      customGrad: "from-emerald-500/20 via-teal-600/5 to-transparent",
      focusColor: "text-emerald-400"
    }
  };

  return (
    <div className="space-y-24">
      {/* Cohesive Billing Switcher Header */}
      <div className="text-center space-y-5">
        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 backdrop-blur-md">
          <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-mono">
            CALIBRATED SCALE ECONOMICS
          </span>
        </div>
        <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
          Calibrate Your Scaling Velocity
        </h3>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto font-semibold leading-relaxed">
          Unlock maximum operational efficiency. Choose a pre-configured tier or craft your own custom high-volume trunking package below.
        </p>

        {/* Dynamic Billing Toggle Card */}
        <div className="inline-flex items-center p-1.5 bg-slate-900/60 border border-white/5 rounded-2xl backdrop-blur-xl shadow-2xl mt-4">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              !isYearly 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
              isYearly 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Annually</span>
            <span className="text-[9px] font-black bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md uppercase tracking-widest leading-none">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Modern, Highly Creative Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.filter(p => !p.hidden).map((plan, idx) => {
          const basePrice = isYearly ? plan.yearlyPrice : plan.price;
          const displayPrice = isYearly ? Math.floor(basePrice / 12) : basePrice;
          const details = planDesignAdditions[plan.id] || {
            badge: "COMMERCIAL",
            icon: Star,
            tagline: "Tailored calling infrastructure.",
            customGrad: "from-slate-500/10 via-slate-600/5 to-transparent",
            focusColor: "text-slate-400"
          };
          
          const IconComponent = details.icon;

          return (
            <div 
              key={idx} 
              className={`group relative rounded-[2.5rem] border transition-all duration-500 ease-out overflow-hidden flex flex-col justify-between ${
                plan.recommended 
                  ? 'border-indigo-500/80 bg-slate-950/90 shadow-[0_30px_100px_rgba(99,102,241,0.18)] scale-[1.03] md:-translate-y-2 hover:scale-[1.06] hover:border-indigo-400 hover:shadow-[0_45px_120px_rgba(99,102,241,0.28)]' 
                  : 'border-white/[0.08] bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.04] hover:border-white/20 hover:scale-[1.04] hover:shadow-[0_30px_80px_rgba(0,0,0,0.6)]'
              }`}
            >
              {/* Premium Glow Overlay */}
              <div className={`absolute -inset-px bg-gradient-to-b ${details.customGrad} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
              
              {/* Animated Floating Glow behind the primary plan */}
              {plan.recommended && (
                <div className="absolute top-0 right-1/4 w-32 h-32 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
              )}

              <div className="p-10 space-y-8 relative z-10">
                {/* Upper Metadata Ribbon */}
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] font-black uppercase tracking-widest font-mono px-3 py-1 rounded-full bg-white/5 border border-white/5 ${details.focusColor}`}>
                    {details.badge}
                  </span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 ${details.focusColor}`}>
                    <IconComponent className="w-4 h-4 shrink-0" />
                  </div>
                </div>

                {/* Plan Naming & Dynamics Pricing */}
                <div className="space-y-4">
                  <h4 className="text-2xl font-black text-white tracking-tight">{plan.name}</h4>
                  <p className="text-xs text-slate-400 font-bold leading-relaxed">{details.tagline}</p>
                  
                  <div className="flex items-baseline pt-4 border-t border-white/[0.04]">
                    <span className="text-5xl font-black text-white tracking-tighter">
                      ${displayPrice}
                    </span>
                    <span className="text-slate-500 font-black ml-2 text-xs uppercase tracking-widest">/ month</span>
                  </div>

                  {isYearly ? (
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Billed ${plan.yearlyPrice} USD Annually</span>
                    </div>
                  ) : (
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                      Flexible month-to-month contracts
                    </div>
                  )}
                </div>

                {/* High-Converting Feature Blueprint */}
                <div className="space-y-5 border-t border-dashed border-white/10 pt-6">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">
                    Bundled Feature Architecture:
                  </div>
                  <ul className="space-y-3.5">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start text-xs font-semibold text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 mr-3 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Secure Trial Callout Module */}
                {plan.trialDays && (
                  <div className="bg-indigo-500/[0.04] border border-indigo-500/10 rounded-2xl p-4 flex items-start space-x-3.5">
                    <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-mono leading-none">
                        {plan.trialDescription} Enabled
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold leading-normal">
                        Test out our live voice relays completely free of cost for 7 days.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button Deck */}
              <div className="p-10 pt-0 relative z-10">
                <button 
                  onClick={() => onNavigate('login')}
                  className={`w-full py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-[0.98] ${
                    plan.recommended
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-600/20 hover:shadow-indigo-600/35 hover:-translate-y-0.5'
                      : 'bg-white hover:bg-slate-200 text-slate-950 shadow-white/5 hover:-translate-y-0.5'
                  }`}
                >
                  Configure & Checkout {plan.name}
                </button>
                <div className="text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-3.5 leading-none">
                  Instant deployment • Cancel anytime with 1 click
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Enterprise Configurator */}
      <div className="bg-slate-900/15 border border-white/5 rounded-[3rem] p-10 md:p-14 space-y-12 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/[0.04] pb-8">
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2 text-indigo-400">
              <Sliders className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest font-mono">ELASTIC BUNDLE BUILDER</span>
            </div>
            <h3 className="text-3xl font-black text-white tracking-tight">Custom Plan Customizer</h3>
            <p className="text-slate-400 text-xs md:text-sm font-semibold max-w-xl leading-relaxed">
              Calculate your wholesale operational costs instantly. Adjust minutes, concurrently active AI agent bots, and phone numbers in real-time.
            </p>
          </div>
          
          <div className="bg-slate-950/80 border border-white/5 p-6 rounded-3xl text-right shrink-0 shadow-2xl relative min-w-[240px]">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 font-mono">Estimated Investment</div>
            <div className="text-4xl md:text-5xl font-black text-white tracking-tight tabular-nums">
              ${calculateEnterpriseMonthly()}
            </div>
            <div className="text-[9px] text-emerald-400 font-black uppercase tracking-widest font-mono mt-1">
              / month {isYearly ? '(billed annually)' : '(contract-free)'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Sliders Area */}
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-slate-300">
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
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
              />
              <div className="flex justify-between text-[8px] text-slate-500 font-black uppercase tracking-widest font-mono">
                <span>5k Mins</span>
                <span>1 Million Mins</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-slate-300">
                <span>Concurrent Active Agent Slots</span>
                <span className="font-mono text-indigo-400 font-black">{entAgents}</span>
              </div>
              <input 
                type="range" 
                min="2" 
                max="100" 
                step="1"
                value={entAgents}
                onChange={(e) => setEntAgents(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
              />
              <div className="flex justify-between text-[8px] text-slate-500 font-black uppercase tracking-widest font-mono">
                <span>2 Agents</span>
                <span>100 Agents Slots</span>
              </div>
            </div>
          </div>

          {/* Toggle and SLA Area */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-slate-300">
                <span>Real Carrier Phone Lines</span>
                <span className="font-mono text-indigo-400 font-black">{entNumbers} Lines</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                step="1"
                value={entNumbers}
                onChange={(e) => setEntNumbers(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
              />
              <div className="flex justify-between text-[8px] text-slate-500 font-black uppercase tracking-widest font-mono">
                <span>1 Line</span>
                <span>50 Lines</span>
              </div>
            </div>

            {/* SLA Priority Switcher */}
            <div className="flex items-center justify-between border border-white/5 p-4.5 rounded-2xl bg-slate-950/30">
              <div className="space-y-1 pr-4">
                <div className="text-xs font-black text-white uppercase tracking-wider">24/7 Dedicated SLA Support</div>
                <p className="text-[10px] text-slate-500 leading-snug font-semibold">Priority developer channels & custom deployment engineers</p>
              </div>
              <button 
                onClick={() => setHasDedicatedSLA(!hasDedicatedSLA)}
                className={`w-10 h-6 shrink-0 rounded-full p-1 transition-all ${hasDedicatedSLA ? 'bg-indigo-600' : 'bg-slate-800'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${hasDedicatedSLA ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Checkout & BYOK Module */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between border border-white/5 p-4.5 rounded-2xl bg-slate-950/30">
              <div className="space-y-1 pr-4">
                <div className="text-xs font-black text-white uppercase tracking-wider">Bring Your Own Keys (BYOK)</div>
                <p className="text-[10px] text-slate-500 leading-snug font-semibold">Use custom Twilio/Vapi wholesale rates with $0 template markups</p>
              </div>
              <button 
                onClick={() => setUseOwnApiKeys(!useOwnApiKeys)}
                className={`w-10 h-6 shrink-0 rounded-full p-1 transition-all ${useOwnApiKeys ? 'bg-indigo-600' : 'bg-slate-800'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${useOwnApiKeys ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
            
            <button 
              onClick={() => onNavigate('login')}
              className="w-full py-4.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/10 active:scale-[0.98]"
            >
              Provision Custom Workspace
            </button>
          </div>
        </div>
      </div>

      {/* Comprehensive Capabilities Table */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h4 className="text-xl font-black text-white tracking-tight">Full Capabilities Matrix</h4>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest font-mono">Architectural Telephony Stack Comparison</p>
        </div>
        
        <div className="border border-white/5 rounded-3xl overflow-hidden bg-slate-900/10 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono bg-slate-950/40">
                  <th className="p-6">Feature Layer</th>
                  <th className="p-6">Standard Voice Wrappers</th>
                  <th className="p-6 text-indigo-400">CallingAgent Bundle</th>
                  <th className="p-6">BYOK Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02] text-xs font-semibold text-slate-350">
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-6 font-bold text-white whitespace-nowrap">{row.layer}</td>
                    <td className="p-6 text-slate-400">{row.standardApi}</td>
                    <td className="p-6 text-indigo-300 font-bold">{row.callingAgent}</td>
                    <td className="p-6 text-slate-300">{row.byokSupport}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
