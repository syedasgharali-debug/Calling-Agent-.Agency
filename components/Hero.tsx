import React, { useState, useEffect } from 'react';
import { View } from '../App';
import { Sparkles, ArrowRight, Shield, Activity, HardDrive, Cpu, Terminal } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onNavigate: (view: View) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const [activeCallIdx, setActiveCallIdx] = useState(0);
  const [latencyTicks, setLatencyTicks] = useState<number[]>([]);
  const [activeLinesCount, setActiveLinesCount] = useState(148);

  // Generate simulated real-time latency jitter values (138ms - 146ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setLatencyTicks((prev) => {
        const next = [...prev, Math.floor(138 + Math.random() * 8)];
        if (next.length > 20) next.shift();
        return next;
      });
      setActiveLinesCount((prev) => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const simulatedCalls = [
    { client: "Stripe Enterprise", num: "+1 (800) 555-0199", status: "Connected", duration: "03:42", dbCommit: "CRM Committed" },
    { client: "Airbnb Concierge", num: "+1 (415) 321-4455", status: "Transcribing", duration: "01:15", dbCommit: "Booking Pending" },
    { client: "HubSpot Support", num: "+1 (617) 880-9900", status: "Streaming TTS", duration: "00:54", dbCommit: "Active Query Sync" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as any
      }
    }
  };

  return (
    <section className="relative pt-44 pb-32 px-6 overflow-hidden bg-[#000000]">
      {/* Immersive background Grid lines & Ambient Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:5rem_5rem] opacity-25 pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,#000_70%,transparent_100%)]" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/[0.04] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/[0.03] blur-[120px] pointer-events-none" />

      <motion.div 
        className="max-w-7xl mx-auto relative z-10 space-y-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* UPPER PANEL: Heading & Copywriting */}
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Subtle unboxed metadata tags instead of static rounded pills */}
          <motion.div 
            className="flex items-center justify-center gap-2 text-[10px] font-black tracking-[0.25em] text-indigo-400 uppercase font-mono"
            variants={itemVariants}
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Real-Time Voice AI</span>
            <span>·</span>
            <span>Sub-150ms Delivery</span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-[1.05] tracking-tight text-wrap-balance"
            variants={itemVariants}
          >
            Smarter AI Telephony <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">Built to Converse</span>
          </motion.h1>
          
          <motion.p 
            className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed font-semibold"
            variants={itemVariants}
          >
            CallingAgent.agency is an ultra-low latency voice orchestration engine that connects autonomous AI agents directly to secure carrier SIP trunks. Run natural inbound phone lines, schedule live bookings, and resolve database actions in sub-150ms.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-md mx-auto"
            variants={itemVariants}
          >
            <button 
              onClick={() => onNavigate('pricing')}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onNavigate('docs')}
              className="w-full sm:w-auto px-8 py-4 bg-slate-950 text-slate-350 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/5 hover:bg-slate-900 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore API Docs</span>
            </button>
          </motion.div>
        </div>

        {/* LOWER PANEL: Immersive AI Telephony Console Interface Showcase */}
        <motion.div 
          className="bg-slate-950/40 border border-white/5 rounded-[3rem] p-8 md:p-10 shadow-2xl relative grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden backdrop-blur-md"
          variants={itemVariants}
        >
          {/* Subtle top edge glow beam */}
          <div className="absolute inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

          {/* Left Block: Active Call Spectrum Monitoring */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-indigo-500 animate-ping" />
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest font-mono">TELECOM STATUS // STREAMING</span>
              </div>
              <span className="text-[10px] font-mono font-black text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded">
                Active lines: {activeLinesCount}
              </span>
            </div>

            {/* Glowing Orbit Telephony Pulse Visual */}
            <div className="relative h-64 bg-slate-900/10 border border-white/5 rounded-[2rem] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.02)_0%,transparent_75%)]" />
              
              {/* Spinning geometric carrier dashed circle */}
              <div className="absolute w-44 h-44 rounded-full border border-indigo-500/10 border-dashed animate-[spin_30s_linear_infinite]" />
              <div className="absolute w-36 h-36 rounded-full border border-purple-500/20" />

              <div className="z-10 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center mx-auto shadow-2xl relative group">
                  <Activity className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-xs font-mono uppercase tracking-widest text-slate-500">Routing Direct SIP</div>
                <div className="text-3xl font-black text-white tabular-nums tracking-tighter">
                  {simulatedCalls[activeCallIdx].duration}
                </div>
              </div>

              {/* Dynamic bottom telemetry wave */}
              <div className="absolute bottom-6 inset-x-8 flex items-end justify-between h-8 gap-0.5">
                {[12, 28, 45, 18, 54, 76, 22, 11, 40, 64, 30, 85, 90, 48, 25, 12, 60, 78, 14, 32].map((h, i) => (
                  <div 
                    key={i} 
                    className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                    style={{ height: `${Math.max(15, (h + Math.sin(Date.now() + i) * 10))}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Live SIP Route Diagnostic logs */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900/20 border border-white/5 rounded-2xl">
                <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider mb-1 flex items-center gap-1.5 font-mono">
                  <HardDrive size={10} className="text-indigo-400" />
                  VOICE ENCODER
                </div>
                <div className="text-xs font-black text-white">OPUS Wideband</div>
              </div>
              <div className="p-4 bg-slate-900/20 border border-white/5 rounded-2xl">
                <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider mb-1 flex items-center gap-1.5 font-mono">
                  <Cpu size={10} className="text-indigo-400" />
                  REASONING CORE
                </div>
                <div className="text-xs font-black text-white">Gemini Pro Inbound</div>
              </div>
              <div className="p-4 bg-slate-900/20 border border-white/5 rounded-2xl">
                <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider mb-1 flex items-center gap-1.5 font-mono">
                  <Terminal size={10} className="text-indigo-400" />
                  AVG LATENCY
                </div>
                <div className="text-xs font-black text-white">142ms</div>
              </div>
            </div>
          </div>

          {/* Right Block: Live SIP Call Stack */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Simulated Carrier Routes</div>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Monitor live audio packages transit. Click any carrier line below to inspect active routing parameters.
              </p>
            </div>

            {/* Active call queue list */}
            <div className="space-y-3">
              {simulatedCalls.map((call, i) => (
                <button
                  key={i}
                  onClick={() => setActiveCallIdx(i)}
                  className={`w-full p-5 rounded-2xl border text-left transition-all cursor-pointer flex justify-between items-center ${
                    activeCallIdx === i 
                      ? 'bg-indigo-500/10 border-indigo-500/25 shadow-lg shadow-indigo-600/5' 
                      : 'bg-white/[0.01] border-white/5 hover:bg-slate-900/20'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-xs font-black text-white flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${activeCallIdx === i ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'}`} />
                      {call.client}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500">{call.num}</div>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/15 font-mono">
                      {call.status}
                    </span>
                    <div className="text-[9px] font-semibold text-slate-500">{call.dbCommit}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Live Signal latency stream chart */}
            <div className="p-5 bg-slate-900/10 border border-white/5 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono">
                <span>Jitter Chart (ms)</span>
                <span className="text-indigo-400 font-black">Stable Route</span>
              </div>
              <div className="flex items-end justify-between h-10 gap-0.5 pt-2">
                {latencyTicks.map((tick, idx) => (
                  <div 
                    key={idx}
                    className="w-full bg-indigo-500/20 rounded-t-sm transition-all duration-300"
                    style={{ height: `${((tick - 130) / 20) * 100}%` }}
                    title={`${tick}ms`}
                  />
                ))}
              </div>
            </div>
          </div>

        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
