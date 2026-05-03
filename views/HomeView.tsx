
import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';
import { View, Plan, Blog } from '../App';

interface HomeViewProps {
  onNavigate: (view: View) => void;
  plans: Plan[];
  blogs: Blog[];
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate, plans, blogs }) => {
  return (
    <div className="animate-fade-in">
      <Hero onNavigate={onNavigate} />
      
      {/* Social Proof Bar */}
      <div className="py-12 border-y border-white/5 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
          <span className="text-xl font-black tracking-tighter text-white">STRIPE</span>
          <span className="text-xl font-black tracking-tighter text-white">REVOLUT</span>
          <span className="text-xl font-black tracking-tighter text-white">AIRBNB</span>
          <span className="text-xl font-black tracking-tighter text-white">HUBSPOT</span>
          <span className="text-xl font-black tracking-tighter text-white">SALESFORCE</span>
        </div>
      </div>

      <Features />

      {/* The "How it Works" Long Section */}
      <section className="py-32 px-6 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 text-center">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">Engineered for <span className="text-indigo-500">Sub-Second</span> Success</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">We don't just wrap APIs; we orchestrate a global network of high-performance audio nodes.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              { 
                step: '01', 
                title: 'High-Density SIP Ingestion', 
                desc: 'Our telephony stack handles thousands of concurrent WebRTC and SIP connections globally, ensuring zero jitter and human-grade audio quality from the first millisecond.'
              },
              { 
                step: '02', 
                title: 'Agentic Intelligence Loop', 
                desc: 'Unlike standard chatbots, our agents reason in real-time. They execute parallel tool calls to your backend, check availability, and process context mid-sentence.'
              },
              { 
                step: '03', 
                title: 'Cartesia Voice Synthesis', 
                desc: 'We utilize state-of-the-art neural synthesis to generate speech that includes natural pauses, intonation changes, and emotional nuance, eliminating the uncanny valley.'
              }
            ].map((item, i) => (
              <div key={i} className="relative p-10 bg-slate-900/50 border border-white/5 rounded-[2.5rem] group hover:border-indigo-500/50 transition-all duration-500">
                <div className="text-6xl font-black text-white/5 absolute top-6 right-8 group-hover:text-indigo-500/20 transition-colors">{item.step}</div>
                <h3 className="text-2xl font-bold text-white mb-6 pr-12">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      {/* FAQ Section */}
      <section className="py-32 px-6 bg-slate-900/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black text-white mb-16 tracking-tighter text-center">Frequently Asked <span className="text-indigo-500">Questions</span></h2>
          <div className="space-y-6">
            {[
              { q: 'How does latency compare to human response time?', a: 'Human conversational response time is roughly 200-300ms. CallingAgent.agency achieves a median latency of 140ms, making it faster and more fluid than standard human interaction.' },
              { q: 'Can I use my existing Twilio numbers?', a: 'Yes. CallingAgent.agency is built on open SIP standards. You can point your existing Twilio, Vonage, or Telnyx trunks to our orchestration nodes in seconds.' },
              { q: 'Is my customer data secure?', a: 'CallingAgent.agency is SOC2 Type II compliant. We offer HIPAA-compliant instances for healthcare providers and private cloud deployments for enterprise clients.' },
              { q: 'Does the AI support non-English languages?', a: 'We currently support 24 languages including Spanish, French, German, Mandarin, and Japanese with native-sounding regional accents.' }
            ].map((item, i) => (
              <div key={i} className="p-8 bg-slate-900 border border-white/5 rounded-3xl">
                <h4 className="text-lg font-bold text-white mb-3">{item.q}</h4>
                <p className="text-slate-400 font-medium leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Pricing onNavigate={onNavigate} plans={plans} />

      {/* Blog Section */}
      <section className="py-32 px-6 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 text-center">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">Latest from the <span className="text-indigo-500">CallingAgent.agency</span> Blog</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Insights, updates, and tutorials from the team building the future of voice.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {blogs.map((blog) => (
              <div key={blog.id} className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-indigo-500/50 transition-all duration-500">
                <div className="h-64 relative overflow-hidden">
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
                </div>
                <div className="p-10">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">Updates</span>
                    <span className="text-xs font-bold text-slate-500">{blog.date}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 line-clamp-2 group-hover:text-indigo-400 transition-colors">{blog.title}</h3>
                  <p className="text-slate-400 font-medium leading-relaxed mb-8 line-clamp-3">{blog.content}</p>
                  <div className="flex items-center justify-between pt-8 border-t border-white/5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-black text-white">
                        {blog.author[0]}
                      </div>
                      <span className="text-sm font-bold text-white">{blog.author}</span>
                    </div>
                    <button className="text-indigo-500 font-black text-sm hover:text-indigo-400 transition-colors">Read More →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeView;
