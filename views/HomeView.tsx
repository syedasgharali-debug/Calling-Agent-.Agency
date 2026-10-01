import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Clock, ArrowLeft, ArrowUpRight, CheckCircle2, ChevronRight, Play, Pause, ExternalLink, Zap, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Hero from '../components/Hero';
import VoiceSamples from '../components/VoiceSamples';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';
import { View, Blog } from '../App';
import { Plan } from '../types';

interface HomeViewProps {
  onNavigate: (view: View) => void;
  plans: Plan[];
  blogs: Blog[];
  selectedBlog: Blog | null;
  setSelectedBlog: (blog: Blog | null) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate, plans, blogs, selectedBlog, setSelectedBlog }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // State for the real-time AI Calling Pipeline simulation
  const [pipelineStep, setPipelineStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPipelineStep((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const faqs = [
    {
      q: 'How does latency compare to human response time?',
      a: 'Human conversational response time is roughly 200-300ms. CallingAgent.agency achieves a median latency of 140ms, making it faster and more fluid than standard human interaction.'
    },
    {
      q: 'Can I use my existing phone numbers?',
      a: 'Yes. CallingAgent.agency is built on open SIP standards. You can point your existing carrier, Twilio, Vonage, or Telnyx trunks to our orchestration nodes in seconds.'
    },
    {
      q: 'Is my customer data secure?',
      a: 'CallingAgent.agency is SOC2 Type II compliant. We offer HIPAA-compliant instances for healthcare providers and private cloud deployments for enterprise clients.'
    },
    {
      q: 'Does the AI support non-English languages?',
      a: 'We currently support 24 languages including Spanish, French, German, Mandarin, and Japanese with native-sounding regional accents.'
    }
  ];

  return (
    <div className="bg-[#000000] text-[#f8fafc] font-sans antialiased min-h-screen selection:bg-indigo-500/30 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-0 w-full h-[60rem] bg-gradient-to-b from-indigo-950/10 via-[#000000] to-transparent pointer-events-none z-0" />
      <div className="absolute top-[30rem] left-1/2 -translate-x-1/2 w-[80rem] h-[30rem] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.02)_0%,transparent_70%)] pointer-events-none z-0" />

      <div className="relative z-10 space-y-32">
        {/* Modern Hero & Overview Section */}
        <Hero onNavigate={onNavigate} />
        
        {/* Credibility / Social Proof */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="py-8 border-y border-white/5 bg-slate-950/20 backdrop-blur-sm rounded-[2rem] px-8">
            <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-6 opacity-30 grayscale hover:opacity-80 transition-all duration-700">
              <span className="text-sm font-black tracking-[0.2em] text-white font-mono">STRIPE</span>
              <span className="text-sm font-black tracking-[0.2em] text-white font-mono">REVOLUT</span>
              <span className="text-sm font-black tracking-[0.2em] text-white font-mono">AIRBNB</span>
              <span className="text-sm font-black tracking-[0.2em] text-white font-mono">HUBSPOT</span>
              <span className="text-sm font-black tracking-[0.2em] text-white font-mono">SALESFORCE</span>
            </div>
          </div>
        </section>

        {/* Live Interactive Voice Playground */}
        <VoiceSamples />

        {/* Core Product Features Grid */}
        <Features />

        {/* AI Calling Visualization / The Orchestration Workflow Demonstration */}
        <section className="py-12 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-mono">Real-Time Core Pipeline</span>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight text-wrap-balance">
                Sub-Second Telephony Orchestration
              </h2>
              <p className="text-slate-400 text-sm md:text-base font-semibold leading-relaxed">
                We don't wrap slow APIs. We run a private global edge grid with custom SIP ingestion bridges to manage user audio and agent dialog with lightning speed.
              </p>
              <div className="space-y-4 pt-4">
                {[
                  'Global Low-Latency SIP Trunk Routing',
                  'Predictive Streaming Token Generation Pipeline',
                  'Advanced Echo Cancellation & Interruption VAD'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-350">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* The Live Interactive Pipeline Board */}
            <div className="lg:col-span-7 bg-slate-950/40 border border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-8 relative overflow-hidden">
              <div className="absolute inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent" />
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Active Signal Track</span>
                <span className="text-[10px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE METRICS: 140MS MEDIAN
                </span>
              </div>

              {/* Graphical Node Connectors (Pure CSS with custom glowing motion paths) */}
              <div className="grid grid-cols-4 gap-2 md:gap-4 relative py-6">
                
                {/* Node 1: User Ingestion */}
                <div className={`p-4 rounded-2xl border text-center transition-all duration-500 ${pipelineStep === 0 ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/[0.01] border-white/5'}`}>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/5 mx-auto flex items-center justify-center mb-2.5 text-indigo-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-wide font-mono">01 // Ingestion</div>
                  <div className="text-xs font-bold text-white mt-1">Caller Input</div>
                </div>

                {/* Node 2: STT & Intelligence */}
                <div className={`p-4 rounded-2xl border text-center transition-all duration-500 ${pipelineStep === 1 ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/[0.01] border-white/5'}`}>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/5 mx-auto flex items-center justify-center mb-2.5 text-indigo-400">
                    <Zap className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-wide font-mono">02 // Decision</div>
                  <div className="text-xs font-bold text-white mt-1">AI Reasoning</div>
                </div>

                {/* Node 3: Synthesis */}
                <div className={`p-4 rounded-2xl border text-center transition-all duration-500 ${pipelineStep === 2 ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/[0.01] border-white/5'}`}>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/5 mx-auto flex items-center justify-center mb-2.5 text-indigo-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-wide font-mono">03 // Voice</div>
                  <div className="text-xs font-bold text-white mt-1">Stream TTS</div>
                </div>

                {/* Node 4: Telecom SIP */}
                <div className={`p-4 rounded-2xl border text-center transition-all duration-500 ${pipelineStep === 3 ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/[0.01] border-white/5'}`}>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/5 mx-auto flex items-center justify-center mb-2.5 text-indigo-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-wide font-mono">04 // SIP Gate</div>
                  <div className="text-xs font-bold text-white mt-1">Carrier Delivery</div>
                </div>

              </div>

              {/* Active Pipeline Status Message card */}
              <div className="p-6 bg-slate-900/30 border border-white/5 rounded-2xl space-y-2">
                <span className="text-[9px] font-mono font-black text-indigo-400 uppercase tracking-widest">Pipeline Operational Status</span>
                <AnimatePresence mode="wait">
                  {pipelineStep === 0 && (
                    <motion.div key="st-0" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-xs font-semibold text-slate-300">
                      Incoming voice signal received over low-jitter SIP trunk. Executing immediate Voice Activity Detection (VAD) within <span className="text-white font-black">20ms</span>.
                    </motion.div>
                  )}
                  {pipelineStep === 1 && (
                    <motion.div key="st-1" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-xs font-semibold text-slate-300">
                      Neural router processes conversational context and maps custom tool calls. Response instruction computed instantly.
                    </motion.div>
                  )}
                  {pipelineStep === 2 && (
                    <motion.div key="st-2" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-xs font-semibold text-slate-300">
                      Custom synthesizer streams synthetic audio blocks fragment-by-fragment. Pacing, breathing, and regional pitch parameters loaded.
                    </motion.div>
                  )}
                  {pipelineStep === 3 && (
                    <motion.div key="st-3" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-xs font-semibold text-slate-300">
                      Synthesized voice signal bridged back into the secure telecom trunk line, completing the loop with a median latency of <span className="text-emerald-400 font-black">140ms</span>.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </section>

        {/* Dynamic Trust / Testimonials */}
        <Testimonials />

        {/* Pricing Matrix Preview */}
        <Pricing onNavigate={onNavigate} plans={plans} />

        {/* Premium FAQ Section */}
        <section className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-4 mb-12">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-mono">Platform FAQ</span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((item, i) => (
              <div 
                key={i} 
                className="bg-slate-950/40 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <span className="text-base font-bold text-white pr-4">{item.q}</span>
                  <ChevronRight 
                    className={`w-5 h-5 text-slate-500 transition-transform duration-300 shrink-0 ${activeFaq === i ? 'rotate-90 text-indigo-400' : ''}`} 
                  />
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 border-t border-white/5 text-sm text-slate-400 leading-relaxed font-semibold">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Comprehensive Editorial Blog */}
        <section id="blog" className="max-w-7xl mx-auto px-6 scroll-mt-32 pb-24">
          <div className="text-center space-y-4 mb-16">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-mono">Expert Analysis</span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Voice Intelligence Newsroom</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm font-semibold leading-relaxed">
              Updates, blueprints, and strategies for orchestrating scalable enterprise-grade voice services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog, bIdx) => (
              <div 
                key={blog.id} 
                onClick={() => setSelectedBlog(blog)}
                className="bg-slate-950/40 border border-white/5 rounded-3xl overflow-hidden group hover:border-indigo-500/15 hover:bg-slate-900/5 transition-all duration-300 cursor-pointer flex flex-col h-full"
              >
                {/* Unique premium custom-tailored telemetry graphic banner for each blog card */}
                <div className="h-48 relative overflow-hidden bg-slate-950 flex items-center justify-center shrink-0 border-b border-white/5">
                  <div className="absolute inset-0 bg-grid-white/[0.02]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-950/20 to-transparent z-10" />
                  
                  {bIdx % 3 === 0 ? (
                    // Blog 1: Sub-Second Latency Soundwave Grid
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute w-32 h-32 rounded-full bg-indigo-500/5 blur-2xl animate-pulse" />
                      <div className="flex items-end gap-1.5 h-16 z-0">
                        {[15, 30, 48, 12, 55, 80, 22, 10, 44, 60, 25, 90, 40, 20, 10, 68].map((h, i) => (
                          <div 
                            key={i} 
                            className="w-1 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-full animate-[pulse_1s_ease-in-out_infinite]"
                            style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : bIdx % 3 === 1 ? (
                    // Blog 2: Connected SIP Trunk Mesh
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute w-32 h-32 rounded-full bg-purple-500/5 blur-2xl animate-pulse" />
                      <div className="relative w-44 h-24 flex items-center justify-between z-0">
                        <div className="w-4 h-4 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-[8px] font-mono font-black text-purple-400">SIP</div>
                        <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 relative">
                          <div className="absolute w-2 h-2 rounded-full bg-pink-500 animate-[ping_2s_infinite] top-1/2 -translate-y-1/2 left-1/3" />
                        </div>
                        <div className="w-4 h-4 rounded-lg bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-[8px] font-mono font-black text-pink-400">CORE</div>
                        <div className="flex-1 h-0.5 bg-gradient-to-r from-pink-500/20 to-indigo-500/20 relative">
                          <div className="absolute w-2 h-2 rounded-full bg-indigo-500 animate-[ping_2s_infinite] top-1/2 -translate-y-1/2 left-2/3" style={{ animationDelay: '0.6s' }} />
                        </div>
                        <div className="w-4 h-4 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-[8px] font-mono font-black text-indigo-400">SIP</div>
                      </div>
                    </div>
                  ) : (
                    // Blog 3: Calm Empathy Wave (Healthcare)
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl animate-pulse" />
                      <svg className="w-44 h-16 text-emerald-500/30 z-0" viewBox="0 0 100 30" fill="none">
                        <path 
                          d="M0 15 H40 L43 5 L46 25 L49 12 L52 17 L55 15 H100" 
                          stroke="currentColor" 
                          strokeWidth="1.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className="animate-[dash_3s_linear_infinite]"
                        />
                      </svg>
                    </div>
                  )}

                  <div className="w-10 h-10 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center text-indigo-400 z-20 group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                    <Play className="w-4 h-4 fill-indigo-500/10 ml-0.5" />
                  </div>
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 text-[8px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/25 font-mono">
                    Research Paper
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-grow justify-between">
                  <div className="space-y-4">
                    <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 font-mono">
                      <span>{blog.author}</span>
                      <span>·</span>
                      <span>{blog.date}</span>
                    </div>
                    <h3 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors leading-tight line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-slate-450 text-slate-400 text-xs font-semibold leading-relaxed line-clamp-3">
                      {blog.content}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-6">
                    <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest flex items-center group-hover:gap-1.5 transition-all">
                      <span>Examine Case</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomeView;
