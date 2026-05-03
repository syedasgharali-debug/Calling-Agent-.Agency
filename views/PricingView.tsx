
import React from 'react';
import Pricing from '../components/Pricing';
import { View, Plan } from '../App';

interface PricingViewProps {
  onNavigate: (view: View) => void;
  plans: Plan[];
}

const PricingView: React.FC<PricingViewProps> = ({ onNavigate, plans }) => {
  return (
    <div className="pt-24 min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
            Simple, <span className="text-indigo-500 underline decoration-indigo-500/30">Transparent</span> Pricing
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Choose the plan that fits your scale. From startups to global enterprises, 
            CallingAgent.agency provides the infrastructure you need to grow your voice operations.
          </p>
        </div>
        
        <Pricing onNavigate={onNavigate} plans={plans} />

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="p-10 bg-slate-900/50 border border-white/5 rounded-[2.5rem]">
            <h3 className="text-2xl font-bold text-white mb-4">Enterprise Customization</h3>
            <p className="text-slate-400 mb-8">Need a custom deployment or high-volume discounts? Our enterprise team can help you build a tailored solution.</p>
            <button 
              onClick={() => onNavigate('login')}
              className="text-indigo-400 font-bold hover:text-indigo-300 flex items-center"
            >
              Talk to Enterprise Sales
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
          <div className="p-10 bg-slate-900/50 border border-white/5 rounded-[2.5rem]">
            <h3 className="text-2xl font-bold text-white mb-4">Developer Friendly</h3>
            <p className="text-slate-400 mb-8">Start building for free in our sandbox environment. No credit card required to explore our API and documentation.</p>
            <button 
              onClick={() => onNavigate('docs')}
              className="text-indigo-400 font-bold hover:text-indigo-300 flex items-center"
            >
              Explore API Docs
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingView;
