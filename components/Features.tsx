import React from 'react';
import { Shield, Sparkles, Zap, Smartphone, Key, LineChart } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      title: "Vocal Provisioner",
      description: "Configure custom AI agents, fine-tune conversational prompts, choose neural voice models, and assign behavioral profiles directly through your dashboard interface.",
      icon: Sparkles
    },
    {
      title: "Telephony Bridging",
      description: "Instantly buy and configure dedicated digital phone numbers from major international carrier pipelines and bind them immediately to your active agents.",
      icon: Smartphone
    },
    {
      title: "Custom Trunk Integration",
      description: "Seamless integration with Vapi private lines and Twilio channels. Update Account SIDs, Auth Tokens, and line routes without writing any backend scripts.",
      icon: Key
    },
    {
      title: "Live Conversational Analytics",
      description: "Monitor continuous operational metrics, average speech latency logs, agent call durations, MTD expenditures, and automated transcript sentiment analyses.",
      icon: LineChart
    },
    {
      title: "Stripe & PayPal Ledger",
      description: "Self-serve billing portals powered safely by integrated Stripe checkout frameworks, PayPal subscription pools, and valid promotional coupon triggers.",
      icon: Shield
    },
    {
      title: "Multi-Engine Dispatch",
      description: "A fully built-in helpdesk ticket desk where users can file high-priority inquiries, review feedback queues, and sync updates from administration staff.",
      icon: Zap
    }
  ];

  return (
    <section id="features" className="py-24 px-6 bg-[#000000] relative overflow-hidden">
      {/* Background glow lines in the style of dark.magicproject.ai */}
      <div className="absolute top-[10%] left-[-10%] w-[35rem] h-[35rem] bg-indigo-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[35rem] h-[35rem] bg-violet-500/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.25em] font-mono">
            Platform Capabilities
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter text-wrap-balance leading-[1.1]">
            Architected for Sub-Second Conversational Scale
          </h2>
          <p className="text-slate-400 text-sm md:text-base font-semibold leading-relaxed">
            Don't settle for high-latency wrappers. Use our integrated carrier stack designed specifically to run voice agents with lightning-fast speeds.
          </p>
        </div>
        
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={idx} 
                className="group p-10 rounded-[2.5rem] border border-white/5 bg-slate-950/40 hover:bg-slate-900/10 hover:border-indigo-500/15 transition-all duration-300 flex flex-col justify-between h-80 relative"
              >
                {/* Thin overlay top lighting glow */}
                <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div>
                  <div className="w-12 h-12 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center mb-8 text-slate-450 group-hover:text-indigo-400 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight mb-3">{feature.title}</h3>
                  <p className="text-slate-450 text-slate-400 text-sm leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </div>
                
                <div className="text-[10px] font-mono font-black text-slate-500 tracking-wider pt-4 border-t border-white/[0.03] uppercase">
                  Capability 0{idx + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
