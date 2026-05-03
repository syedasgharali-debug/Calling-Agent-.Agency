
import React from 'react';

const Testimonials: React.FC = () => {
  const reviews = [
    {
      name: "Sarah Jenkins",
      role: "VP of Support at FinTech",
      text: "CallingAgent.agency reduced our ticket response time by 85%. Our customers can't even tell they're talking to an AI.",
      image: "https://picsum.photos/seed/person1/100/100"
    },
    {
      name: "Marcus Thorne",
      role: "CEO of GlobalLogistics",
      text: "Scaling during the holidays used to be a nightmare. With CallingAgent.agency, we simply turned up the capacity and handled 5x volume effortlessly.",
      image: "https://picsum.photos/seed/person2/100/100"
    },
    {
      name: "Elena Rodriguez",
      role: "Director of Ops at HealthFirst",
      text: "The emotional intelligence is scary good. It identifies frustrated callers and routes them to managers instantly.",
      image: "https://picsum.photos/seed/person3/100/100"
    }
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((item, idx) => (
            <div key={idx} className="bg-slate-900 border border-white/5 p-8 rounded-3xl relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl">"</div>
              <p className="text-slate-300 mb-8 relative z-10">{item.text}</p>
              <div className="flex items-center space-x-4">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-full border border-indigo-500/20" />
                <div>
                  <div className="text-sm font-bold text-white">{item.name}</div>
                  <div className="text-xs text-slate-500">{item.role}</div>
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
