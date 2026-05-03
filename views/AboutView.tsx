
import React from 'react';

const AboutView: React.FC = () => {
  return (
    <div className="pt-40 pb-32 px-6 max-w-6xl mx-auto font-sans animate-fade-in">
      <div className="mb-24 text-center md:text-left">
        <h1 className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-none">
          The <span className="text-indigo-500">Voice</span> of the Future.
        </h1>
        <p className="text-2xl text-slate-400 max-w-4xl font-light leading-relaxed">
          CallingAgent.agency started as a research project at Stanford AI Labs. Today, we are the infrastructure behind the world's most intelligent voice interactions. 
          We believe that every customer interaction should be effortless, empathetic, and instant.
        </p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-32">
        <div className="space-y-8">
          <h2 className="text-3xl font-black text-white tracking-tight">Our Core Philosophy</h2>
          <p className="text-lg text-slate-400 leading-relaxed font-light">
            Legacy IVR systems have failed the consumer for decades. We are building a world where "on-hold" is a phrase of the past. 
            By combining high-fidelity audio processing with modern large language models, we've created a stack that finally works at scale.
          </p>
          <p className="text-lg text-slate-400 leading-relaxed font-light">
            Our technology is built on three pillars: <b className="text-white">Zero Latency</b>, <b className="text-white">Deep Integration</b>, and <b className="text-white">Human Resonance</b>. 
            We don't just solve tickets; we build relationships.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] flex flex-col justify-center">
            <div className="text-indigo-500 font-black text-5xl mb-2">99.9%</div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Call Success Rate</div>
          </div>
          <div className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] flex flex-col justify-center">
            <div className="text-indigo-500 font-black text-5xl mb-2">140ms</div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Median TTS Latency</div>
          </div>
          <div className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] flex flex-col justify-center">
            <div className="text-indigo-500 font-black text-5xl mb-2">24/7</div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Infrastructure Support</div>
          </div>
          <div className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] flex flex-col justify-center">
            <div className="text-indigo-500 font-black text-5xl mb-2">10M+</div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Minutes Processed</div>
          </div>
        </div>
      </section>

      <section className="mb-32">
        <h2 className="text-4xl font-black text-white mb-12 tracking-tight">Our Technology Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Neural Orchestration', desc: 'Our proprietary engine handles the complex dance between STT, LLM, and TTS with sub-100ms internal latency.' },
            { title: 'Global SIP Mesh', desc: 'A distributed network of telephony gateways ensuring crystal clear audio quality from any corner of the globe.' },
            { title: 'Agentic Reasoning', desc: 'Native support for tool-calling and long-term memory, allowing agents to handle multi-step business processes.' }
          ].map((item, i) => (
            <div key={i} className="p-10 bg-slate-900/50 border border-white/5 rounded-[3rem] hover:border-indigo-500/30 transition-all">
              <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-32">
        <h2 className="text-4xl font-black text-white mb-12 tracking-tight">Our Journey</h2>
        <div className="space-y-12 border-l border-white/10 pl-8 ml-4">
          {[
            { year: '2021', title: 'The Genesis', desc: 'Founded by a team of audio engineers and LLM researchers from Google and Stripe with a mission to fix the broken telephony industry.' },
            { year: '2022', title: 'The Million Dollar Stack', desc: 'Released our core orchestration engine, successfully bridging the gap between Vapi, Deepgram, and Cartesia for the first time.' },
            { year: '2023', title: 'Global Expansion', desc: 'Opened our European and Asian data centers to provide sub-100ms latency to a global user base.' },
            { year: '2024', title: 'Agentic Evolution', desc: 'Introduced native tool-calling, allowing AI agents to handle complex transactional workflows like insurance claims and doctor bookings.' }
          ].map((item, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-10 top-2 w-4 h-4 rounded-full bg-indigo-500 border-4 border-slate-950"></div>
              <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-1">{item.year}</h4>
              <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed max-w-2xl font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-white/5 pt-20">
        <h2 className="text-4xl font-black text-white mb-16 tracking-tight text-center">Meet the Pioneers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { name: 'Marcus Chen', role: 'CEO & Founder', bio: 'Former Head of AI at Stripe and Stanford PhD researcher focused on real-time neural networks.' },
            { name: 'Sarah Miller', role: 'CTO', bio: 'Architected high-throughput voice protocols at Google Cloud. Expert in distributed systems and SIP.' },
            { name: 'David Ross', role: 'VP Engineering', bio: '15+ years experience in VoIP at Twilio. Ensuring our telephony stack is bulletproof and scalable.' },
            { name: 'Aria V.', role: 'Head of Product', bio: 'Former Lead Designer at Airbnb. Obsessed with making AI feel helpful, empathetic, and human.' },
          ].map((member, i) => (
            <div key={i} className="text-center group">
              <div className="w-full aspect-square bg-slate-800 rounded-[3rem] mb-6 grayscale group-hover:grayscale-0 transition-all duration-700 overflow-hidden shadow-2xl">
                <img src={`https://picsum.photos/seed/voxmember${i}/500/500`} alt={member.name} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" />
              </div>
              <h4 className="text-xl font-bold text-white mb-1">{member.name}</h4>
              <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4">{member.role}</p>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutView;
