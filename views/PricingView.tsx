import React from 'react';
import Pricing from '../components/Pricing';
import { View } from '../App';
import { Plan } from '../types';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface PricingViewProps {
  onNavigate: (view: View) => void;
  plans: Plan[];
  theme?: 'dark' | 'light';
}

const PricingView: React.FC<PricingViewProps> = ({ onNavigate, plans, theme = 'dark' }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <div className={`pt-32 min-h-screen relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#000000]' : 'bg-[#ffffff]'}`}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-indigo-500/[0.02] blur-[150px] rounded-full pointer-events-none" />

      <motion.div 
        className="max-w-7xl mx-auto px-6 py-20 space-y-20 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {/* Editorial Heading */}
        <motion.div className="text-center space-y-6 max-w-3xl mx-auto" variants={itemVariants}>
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3.5 py-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest font-mono">Elastic Telephony Pricing</span>
          </div>
          <h1 className={`text-5xl md:text-8xl font-black tracking-tighter text-wrap-balance leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            High Density Platform Pricing
          </h1>
          <p className={`text-sm md:text-base font-semibold leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-650'}`}>
            Choose the plan that matches your scale. From startups to global enterprises, CallingAgent.agency provides the infrastructure you need to grow your voice operations.
          </p>
        </motion.div>
        
        {/* Core Pricing Grid */}
        <motion.div variants={itemVariants}>
          <Pricing onNavigate={onNavigate} plans={plans} theme={theme} />
        </motion.div>

        {/* Feature Highlights Grid */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10" variants={itemVariants}>
          <div className={`p-12 border rounded-[2.5rem] flex flex-col justify-between h-72 group hover:border-indigo-500/15 transition-all duration-300 ${theme === 'dark' ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
            <div className="space-y-3">
              <h3 className={`text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Enterprise Customization</h3>
              <p className={`text-sm font-semibold leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Need a custom deployment, dedicated server instances, or bulk volume discounts? Our enterprise infrastructure team can build a tailored solution.</p>
            </div>
            <button 
              onClick={() => onNavigate('login')}
              className="text-indigo-400 hover:text-indigo-300 font-bold text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer"
            >
              <span>Talk to Enterprise Sales</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className={`p-12 border rounded-[2.5rem] flex flex-col justify-between h-72 group hover:border-indigo-500/15 transition-all duration-300 ${theme === 'dark' ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
            <div className="space-y-3">
              <h3 className={`text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Developer Sandbox</h3>
              <p className={`text-sm font-semibold leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Start building for free in our sandbox environment. No credit card required to explore our comprehensive API and documentation resources.</p>
            </div>
            <button 
              onClick={() => onNavigate('docs')}
              className="text-indigo-400 hover:text-indigo-300 font-bold text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Developer Docs</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PricingView;
