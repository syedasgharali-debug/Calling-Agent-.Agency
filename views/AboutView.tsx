import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface AboutViewProps {
  theme?: 'dark' | 'light';
}

const AboutView: React.FC<AboutViewProps> = ({ theme = 'dark' }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05
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
    <div className={`pt-40 pb-32 px-6 relative overflow-hidden transition-colors duration-500 ${
      theme === 'dark' ? 'bg-[#000000] text-slate-200' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-indigo-500/[0.02] blur-[150px] rounded-full pointer-events-none" />

      <motion.div 
        className="max-w-6xl mx-auto space-y-24 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {/* Editorial Heading */}
        <motion.div className="space-y-6 max-w-4xl" variants={itemVariants}>
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3.5 py-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest font-mono">Our Genesis</span>
          </div>
          <h1 className={`text-5xl md:text-8xl font-black tracking-tighter text-wrap-balance leading-[1.05] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            The New Resonance of Voice Infrastructure.
          </h1>
          <p className={`text-sm md:text-base font-semibold leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            CallingAgent.agency started as a research project at Stanford AI Labs. Today, we are the architectural stack behind the world's most intelligent voice interactions. We believe that every customer interaction should be effortless, empathetic, and instant.
          </p>
        </motion.div>

        {/* Philosophy grid */}
        <motion.section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center" variants={itemVariants}>
          <div className="space-y-6">
            <h2 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Our Core Philosophy</h2>
            <p className={`text-sm leading-relaxed font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Legacy IVR systems have failed the consumer for decades. We are building a world where "on-hold" is a phrase of the past. By combining high-fidelity audio processing with modern large language models, we've created a stack that finally works at scale.
            </p>
            <p className={`text-sm leading-relaxed font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Our technology is built on three pillars: <b className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Zero Latency</b>, <b className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Deep Integration</b>, and <b className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Human Resonance</b>. We don't just solve tickets; we build relationships.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '99.9%', label: 'Call Success Rate' },
              { value: '140ms', label: 'Median TTS Latency' },
              { value: '24/7', label: 'Infra Monitoring' },
              { value: '10M+', label: 'Minutes Handled' }
            ].map((stat, idx) => (
              <div key={idx} className={`p-8 border rounded-3xl flex flex-col justify-center transition-all ${
                theme === 'dark' ? 'bg-slate-950/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="text-indigo-400 font-black text-4xl mb-1 tabular-nums">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Architecture Spotlight */}
        <motion.section className="space-y-12" variants={itemVariants}>
          <h2 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Our Core Technologies</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Neural Orchestration', desc: 'Our proprietary engine handles the complex dance between STT, LLM, and TTS with sub-100ms internal latency.' },
              { title: 'Global SIP Mesh', desc: 'A distributed network of telephony gateways ensuring crystal clear audio quality from any corner of the globe.' },
              { title: 'Agentic Reasoning', desc: 'Native support for tool-calling and long-term memory, allowing agents to handle complex transactional processes.' }
            ].map((item, i) => (
              <div key={i} className={`p-10 border rounded-[2.5rem] transition-all ${
                theme === 'dark' ? 'bg-slate-950/40 border-white/5 hover:border-indigo-500/15' : 'bg-white border-slate-200 shadow-sm hover:border-indigo-500/15'
              }`}>
                <h3 className={`text-lg font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                <p className={`text-xs leading-relaxed font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-650'}`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Journey Timeline */}
        <motion.section className="space-y-12" variants={itemVariants}>
          <h2 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Platform Milestones</h2>
          <div className={`space-y-12 border-l pl-8 ml-4 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
            {[
              { year: '2021', title: 'The Genesis', desc: 'Founded by a team of audio engineers and LLM researchers from Google and Stripe with a mission to fix the broken telephony industry.' },
              { year: '2022', title: 'The Million Dollar Stack', desc: 'Released our core orchestration engine, successfully bridging the gap between Vapi, Deepgram, and Cartesia for the first time.' },
              { year: '2023', title: 'Global Expansion', desc: 'Opened our European and Asian data centers to provide sub-100ms latency to a global user base.' },
              { year: '2024', title: 'Agentic Evolution', desc: 'Introduced native tool-calling, allowing AI agents to handle complex transactional workflows like insurance claims and doctor bookings.' }
            ].map((item, i) => (
              <div key={i} className="relative space-y-2">
                <div className={`absolute -left-10 top-1.5 w-4 h-4 rounded-full bg-indigo-500 border-4 ${theme === 'dark' ? 'border-[#000000]' : 'border-slate-50'}`}></div>
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-mono">{item.year}</div>
                <h3 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                <p className={`text-sm leading-relaxed max-w-2xl font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-650'}`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Meet the Team */}
        <motion.div className={`pt-20 space-y-12 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'}`} variants={itemVariants}>
          <h2 className={`text-3xl font-black tracking-tight text-center ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Meet the Pioneers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Marcus Chen', role: 'CEO & Founder', initials: 'MC', color: 'from-indigo-500/10 to-indigo-500/20 text-indigo-400 border-indigo-500/20' },
              { name: 'Sarah Miller', role: 'CTO', initials: 'SM', color: 'from-purple-500/10 to-purple-500/20 text-purple-400 border-purple-500/20' },
              { name: 'David Ross', role: 'VP Engineering', initials: 'DR', color: 'from-blue-500/10 to-blue-500/20 text-blue-400 border-blue-500/20' },
              { name: 'Aria V.', role: 'Head of Product', initials: 'AV', color: 'from-emerald-500/10 to-emerald-500/20 text-emerald-400 border-emerald-500/20' },
            ].map((member, i) => (
              <div key={i} className="text-center group space-y-4">
                <div className={`w-full aspect-square bg-gradient-to-br ${member.color} rounded-[2rem] flex items-center justify-center text-4xl font-black border transition-transform duration-500 group-hover:scale-95`}>
                  {member.initials}
                </div>
                <div>
                  <h4 className={`text-lg font-bold leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{member.name}</h4>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-mono mt-1">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AboutView;
