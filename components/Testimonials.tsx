import React from 'react';
import { Quote } from 'lucide-react';

interface TestimonialsProps {
  theme?: 'dark' | 'light';
}

const Testimonials: React.FC<TestimonialsProps> = ({ theme = 'dark' }) => {
  const reviews = [
    {
      name: "Sarah Jenkins",
      role: "VP of Support at FinTech",
      text: "CallingAgent.agency reduced our ticket response time by 85%. Our customers can't even tell they're talking to an AI.",
      initials: "SJ",
      color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
    },
    {
      name: "Marcus Thorne",
      role: "CEO of GlobalLogistics",
      text: "Scaling during the holidays used to be a nightmare. With CallingAgent.agency, we simply turned up the capacity and handled 5x volume effortlessly.",
      initials: "MT",
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20"
    },
    {
      name: "Elena Rodriguez",
      role: "Director of Ops at HealthFirst",
      text: "The emotional intelligence is scary good. It identifies frustrated callers and routes them to managers instantly.",
      initials: "ER",
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    }
  ];

  return (
    <section className={`py-24 px-6 relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#000000]' : 'bg-[#ffffff]'}`}>
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.25em] font-mono">
            Social Validation
          </span>
          <h2 className={`text-4xl md:text-5xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Acclaimed by Operations Leaders
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((item, idx) => (
            <div 
              key={idx} 
              className={`p-10 rounded-[2.5rem] relative group transition-all duration-300 flex flex-col justify-between h-80 border ${theme === 'dark' ? 'bg-slate-950/40 border-white/5 hover:border-white/10' : 'bg-slate-50 border-slate-200 hover:border-slate-350 shadow-sm'}`}
            >
              <div className="space-y-6">
                <div className="text-slate-600 group-hover:text-indigo-400 transition-colors">
                  <Quote className="w-6 h-6 fill-transparent" strokeWidth={1.5} />
                </div>
                <p className={`text-sm font-medium leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  {item.text}
                </p>
              </div>

              <div className={`flex items-center space-x-4 pt-6 border-t ${theme === 'dark' ? 'border-white/[0.03]' : 'border-slate-100'}`}>
                {/* Clean inline avatar template to prevent external image dependency breaks */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border ${item.color}`}>
                  {item.initials}
                </div>
                <div>
                  <div className={`text-sm font-bold leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.name}</div>
                  <div className="text-[11px] text-slate-500 font-semibold">{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
