
import React, { useEffect, useState } from 'react';
import { X, Calendar, User, Clock, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Hero from '../components/Hero';
import VoiceSamples from '../components/VoiceSamples';
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
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  const renderBlogContent = (text: string) => {
    return text.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('### ')) {
        return (
          <h4 key={index} className="text-2xl font-black text-white mt-8 mb-4 tracking-tight border-l-4 border-indigo-500 pl-4">
            {paragraph.slice(4)}
          </h4>
        );
      }
      if (paragraph.startsWith('## ')) {
        return (
          <h3 key={index} className="text-3xl font-black text-white mt-10 mb-6 tracking-tight">
            {paragraph.slice(3)}
          </h3>
        );
      }
      return (
        <p key={index} className="text-slate-300 text-lg leading-relaxed mb-6 font-medium">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="animate-fade-in">
      <Hero onNavigate={onNavigate} />
      
      {/* Social Proof Bar */}
      <div className="py-8 border-y border-white/5 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
          <span className="text-xl font-black tracking-tighter text-white">STRIPE</span>
          <span className="text-xl font-black tracking-tighter text-white">REVOLUT</span>
          <span className="text-xl font-black tracking-tighter text-white">AIRBNB</span>
          <span className="text-xl font-black tracking-tighter text-white">HUBSPOT</span>
          <span className="text-xl font-black tracking-tighter text-white">SALESFORCE</span>
        </div>
      </div>

      <VoiceSamples />

      <Features />

      {/* The "How it Works" Long Section */}
      <section className="py-16 px-6 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
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
                title: 'CallingAgent Neural Synthesis', 
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
      <section className="py-16 px-6 bg-slate-900/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black text-white mb-10 tracking-tighter text-center">Frequently Asked <span className="text-indigo-500">Questions</span></h2>
          <div className="space-y-6">
            {[
              { q: 'How does latency compare to human response time?', a: 'Human conversational response time is roughly 200-300ms. CallingAgent.agency achieves a median latency of 140ms, making it faster and more fluid than standard human interaction.' },
              { q: 'Can I use my existing phone numbers?', a: 'Yes. CallingAgent.agency is built on open SIP standards. You can point your existing carrier, Twilio, Vonage, or Telnyx trunks to our orchestration nodes in seconds.' },
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
      <section className="py-16 px-6 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">Latest from the <span className="text-indigo-500">CallingAgent.agency</span> Blog</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium">Insights, updates, and deep-dives from the team building the future of ultra-low latency voice AI.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {blogs.map((blog) => (
              <div 
                key={blog.id} 
                onClick={() => setSelectedBlog(blog)}
                className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-indigo-500/50 transition-all duration-500 cursor-pointer flex flex-col h-full"
              >
                <div className="h-64 relative overflow-hidden shrink-0">
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
                </div>
                <div className="p-10 flex flex-col flex-grow justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">AI Telephony</span>
                      <span className="text-xs font-bold text-slate-500">{blog.date}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 line-clamp-2 group-hover:text-indigo-400 transition-colors pointer-events-none">{blog.title}</h3>
                    <p className="text-slate-400 font-medium leading-relaxed mb-8 line-clamp-3 pointer-events-none">{blog.content}</p>
                  </div>
                  <div className="flex items-center justify-between pt-8 border-t border-white/5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-black text-white">
                        {blog.author[0]}
                      </div>
                      <span className="text-sm font-bold text-white">{blog.author}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBlog(blog);
                      }}
                      className="text-indigo-500 font-black text-sm hover:text-indigo-400 transition-colors"
                    >
                      Read More →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Modal Overlay */}
      <AnimatePresence>
        {selectedBlog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-50 overflow-y-auto px-4 py-8 md:p-12 flex justify-center"
            onClick={() => setSelectedBlog(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl relative my-auto text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-[25rem] w-full">
                <img src={selectedBlog.image} alt={selectedBlog.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                
                {/* Close button top right */}
                <button 
                  onClick={() => setSelectedBlog(null)}
                  className="absolute top-6 right-6 p-4 rounded-full bg-slate-950/80 border border-white/10 text-white hover:bg-white hover:text-slate-950 transition-all shadow-xl hover:scale-105 z-10"
                  title="Close article"
                >
                  <X size={24} />
                </button>

                {/* Post Header on Cover */}
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                  <span className="px-4 py-1.5 bg-indigo-600/30 text-indigo-400 text-xs font-black uppercase tracking-widest rounded-full border border-indigo-500/30 mb-4 inline-block">
                    AI Telephony Updates
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6">
                    {selectedBlog.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-6 text-slate-400 font-bold text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-black text-white">
                        {selectedBlog.author[0]}
                      </div>
                      <span className="text-white">{selectedBlog.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-indigo-400" />
                      <span>{selectedBlog.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={16} className="text-indigo-400" />
                      <span>5 min read</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-8 md:p-12 md:pt-16">
                <article className="prose prose-invert max-w-none text-left">
                  {renderBlogContent(selectedBlog.fullContent || selectedBlog.content)}
                </article>
                
                <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button 
                    onClick={() => setSelectedBlog(null)}
                    className="flex items-center space-x-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/5 font-black text-white hover:bg-white/10 hover:border-indigo-500/20 transition-all"
                  >
                    <ArrowLeft size={18} />
                    <span>Back to Articles</span>
                  </button>
                  <span className="text-slate-500 text-sm font-black tracking-widest uppercase">
                    CallingAgent.agency © 2026
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeView;
