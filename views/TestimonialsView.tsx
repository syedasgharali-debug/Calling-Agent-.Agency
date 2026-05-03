
import React from 'react';

const TestimonialsView: React.FC = () => {
  return (
    <div className="pt-40 pb-32 px-6 max-w-5xl mx-auto">
      <h1 className="text-6xl font-black text-white mb-12 tracking-tighter">Wall of <span className="text-indigo-500">Love</span>.</h1>
      <p className="text-xl text-slate-400 mb-16 leading-relaxed font-light">
        Join over 1,000+ companies scaling their voice operations with CallingAgent.agency.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { name: "FinTech Corp", quote: "The sub-200ms transcription changed our customer journey forever.", author: "Marcus T., CTO" },
          { name: "Global Health", quote: "Our agents now handle scheduling better than our human receptionists.", author: "Elena R., Operations" },
          { name: "SaaS Rocket", quote: "Scale was our bottleneck. CallingAgent.agency solved it in a weekend deployment.", author: "David K., Founder" }
        ].map((t, i) => (
          <div key={i} className="bg-slate-900 border border-white/5 p-8 rounded-3xl">
            <div className="text-indigo-500 text-4xl font-serif mb-4">“</div>
            <p className="text-lg text-white mb-6 font-medium">{t.quote}</p>
            <div className="text-sm font-bold text-slate-500">— {t.author}, {t.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsView;
