
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Mic2, 
  Phone, 
  BarChart3, 
  CreditCard, 
  MessageSquare,
  Zap,
  ShieldCheck,
  PlayCircle,
  Settings2,
  ChevronRight,
  Sparkles,
  Globe,
  Headphones
} from 'lucide-react';

const DocsView: React.FC = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', label: 'Getting Started', icon: PlayCircle },
    { id: 'ai-agents', label: 'AI Voice Agents', icon: Mic2 },
    { id: 'telephony', label: 'Phone Numbers', icon: Phone },
    { id: 'call-logs', label: 'Call Analytics', icon: BarChart3 },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'support', label: 'Customer Support', icon: MessageSquare },
  ];

  return (
    <div className="pt-40 pb-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 font-sans">
      {/* Sidebar Navigation */}
      <aside className="lg:col-span-3 space-y-8 h-fit lg:sticky lg:top-40">
        <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md shadow-2xl">
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em] opacity-50">User Guide</h4>
          </div>
          <ul className="space-y-2">
            {sections.map(s => (
              <li key={s.id}>
                <button 
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold transition-all group ${
                    activeSection === s.id 
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <s.icon className={`w-4 h-4 ${activeSection === s.id ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                    <span>{s.label}</span>
                  </div>
                  {activeSection === s.id && <ChevronRight className="w-4 h-4 opacity-50" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Content Area */}
      <div className="lg:col-span-9 max-w-4xl">
        {activeSection === 'getting-started' && (
          <div className="animate-fade-in space-y-16">
            <div className="relative">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px]"></div>
              <h1 className="text-6xl font-black text-white mb-8 tracking-tighter leading-none">
                Master the <span className="text-indigo-500">CallingAgent.agency</span> Dashboard
              </h1>
              <p className="text-xl text-slate-400 font-light leading-relaxed max-w-2xl">
                Welcome to the future of voice automation. This documentation is designed to help you leverage the full power of CallingAgent.agency to transform your customer interactions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 hover:border-indigo-500/30 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-8 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Instant Deployment</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">Deploy human-grade AI agents in under 60 seconds. Our platform handles the complex orchestration so you can focus on your business logic.</p>
              </div>
              <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 hover:border-emerald-500/30 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-8 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Enterprise Security</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">Every call is encrypted and every transcript is stored with bank-grade security. Your privacy is our highest priority.</p>
              </div>
            </div>

            <section className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-12">
              <h3 className="text-3xl font-black text-white mb-6 tracking-tight">Platform Navigation</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Your dashboard is divided into several key areas, each designed for a specific part of your voice infrastructure management:
              </p>
              <div className="space-y-4">
                {[
                  { title: 'Overview', desc: 'Real-time statistics on minutes used, active agents, and total call volume.' },
                  { title: 'My Agents', desc: 'The command center for creating, editing, and testing your AI voice assistants.' },
                  { title: 'Phone Numbers', desc: 'Manage your global telephony assets and link them to your agents.' },
                  { title: 'Analytics', desc: 'Deep-dive into call logs, transcripts, and performance metrics.' },
                  { title: 'Billing', desc: 'Manage your subscription, invoices, and promotional coupons.' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-4 p-5 bg-slate-950 rounded-2xl border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <div>
                      <span className="text-white font-bold text-sm block">{item.title}</span>
                      <span className="text-slate-500 text-xs">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeSection === 'ai-agents' && (
          <div className="animate-fade-in space-y-16">
            <div>
              <h1 className="text-5xl font-black text-white mb-6 tracking-tighter">AI Voice Agents</h1>
              <p className="text-xl text-slate-400 font-light leading-relaxed">
                Your digital workforce, available 24/7. Learn how to configure agents that sound and act exactly like your best employees.
              </p>
            </div>

            <div className="space-y-10">
              <section className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl"></div>
                <h3 className="text-3xl font-black text-white mb-10 tracking-tight flex items-center space-x-4">
                  <Sparkles className="w-8 h-8 text-indigo-500" />
                  <span>The Creation Process</span>
                </h3>
                <div className="space-y-10">
                  <div className="flex items-start space-x-6">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-sm font-black shrink-0 shadow-lg shadow-indigo-600/20">1</div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">Select Your Engine</h4>
                      <p className="text-slate-400 text-sm leading-relaxed font-medium">Choose our <strong>Standard Low-Latency Engine</strong> for instant response times or the <strong>Universal Agent Engine</strong> for complex multi-turn logic, custom state machines, and long-term memory.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-6">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-sm font-black shrink-0 shadow-lg shadow-indigo-600/20">2</div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">Voice Personalization</h4>
                      <p className="text-slate-400 text-sm leading-relaxed font-medium">Select from our library of state-of-the-art neural voices. We support premium high-fidelity voice synthesis and high-accuracy speech recognition pipelines. You can adjust pitch and speed to match your brand's voice.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-6">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-sm font-black shrink-0 shadow-lg shadow-indigo-600/20">3</div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">Logic Orchestration</h4>
                      <p className="text-slate-400 text-sm leading-relaxed font-medium">Connect your agent to your existing tools. Use <strong>Make.com</strong>, <strong>FastAPI</strong>, or <strong>Custom Webhooks</strong> to allow your agent to take real actions during a call, such as booking appointments or checking order status.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-12">
                <h3 className="text-3xl font-black text-white mb-8 tracking-tight flex items-center space-x-4">
                  <PlayCircle className="w-8 h-8 text-purple-500" />
                  <span>Testing & Deployment</span>
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Before going live, you can test your agent in our interactive sandbox. This environment simulates a real call, allowing you to:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Verify prompt adherence and personality.',
                    'Test webhook integrations and data flow.',
                    'Evaluate voice clarity and response latency.',
                    'Debug complex conversation paths.'
                  ].map((text, i) => (
                    <li key={i} className="flex items-center space-x-3 p-4 bg-slate-950 rounded-2xl border border-white/5 text-slate-400 text-xs font-bold">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[2.5rem] p-10">
                <h4 className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-4">Pro Tip</h4>
                <p className="text-slate-300 text-sm leading-relaxed italic">"Use the <strong>Interactive Sandbox</strong> to talk to your agent before assigning it to a phone number. This ensures your prompts are perfect and the logic is sound."</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'telephony' && (
          <div className="animate-fade-in space-y-16">
            <div>
              <h1 className="text-5xl font-black text-white mb-6 tracking-tighter">Phone Numbers</h1>
              <p className="text-xl text-slate-400 font-light leading-relaxed">
                Seamlessly bridge the gap between AI and the global PSTN network.
              </p>
            </div>

            <div className="space-y-8">
              <section className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-12">
                <h3 className="text-3xl font-black text-white mb-8 tracking-tight flex items-center space-x-4">
                  <Globe className="w-8 h-8 text-emerald-500" />
                  <span>Global Connectivity</span>
                </h3>
                <p className="text-slate-400 text-lg leading-relaxed mb-10 font-medium">
                  Your agents can be reached from anywhere in the world. Manage your fleet of numbers with ease.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-slate-950 rounded-3xl border border-white/5">
                    <h4 className="text-white font-bold mb-3">Agent Assignment</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">Instantly link any agent to any number. You can swap agents in real-time without changing your customer-facing number.</p>
                  </div>
                  <div className="p-8 bg-slate-950 rounded-3xl border border-white/5">
                    <h4 className="text-white font-bold mb-3">Local Presence</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">Acquire numbers in specific area codes to increase answer rates and build trust with local customers.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeSection === 'call-logs' && (
          <div className="animate-fade-in space-y-16">
            <div>
              <h1 className="text-5xl font-black text-white mb-6 tracking-tighter">Call Analytics</h1>
              <p className="text-xl text-slate-400 font-light leading-relaxed">
                Turn every conversation into actionable data. Our analytics suite provides deep insights into your customer interactions.
              </p>
            </div>

            <section className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-12">
              <h3 className="text-3xl font-black text-white mb-10 tracking-tight">Intelligence at Scale</h3>
              <div className="space-y-6">
                {[
                  { title: 'Neural Transcription', desc: 'Every call is transcribed with 99% accuracy using our proprietary neural models.' },
                  { title: 'Sentiment Analysis', desc: 'Understand the emotional tone of your customers automatically.' },
                  { title: 'Outcome Tracking', desc: 'Categorize calls based on success, resolution, or follow-up requirements.' },
                  { title: 'Duration & Cost', desc: 'Monitor your ROI with detailed breakdown of call lengths and associated costs.' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-slate-950 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                    <div>
                      <h4 className="text-white font-bold mb-1">{item.title}</h4>
                      <p className="text-slate-500 text-xs">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-indigo-500 transition-colors" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeSection === 'billing' && (
          <div className="animate-fade-in space-y-16">
            <div>
              <h1 className="text-5xl font-black text-white mb-6 tracking-tighter">Billing & Plans</h1>
              <p className="text-xl text-slate-400 font-light leading-relaxed">
                Scale your voice infrastructure as your business grows. Simple, transparent, and secure.
              </p>
            </div>

            <div className="space-y-10">
              <section className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-12">
                <h3 className="text-3xl font-black text-white mb-8 tracking-tight">Subscription Management</h3>
                <p className="text-slate-400 text-lg leading-relaxed mb-10 font-medium">
                  Upgrade your plan to unlock more minutes, additional agents, and premium features.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 bg-slate-950 rounded-3xl border border-white/5">
                    <h4 className="text-white font-bold mb-4">Secure Checkout</h4>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">We utilize industry-leading payment processors to ensure your transactions are safe.</p>
                    <div className="flex space-x-4">
                      <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">Stripe</div>
                      <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">PayPal</div>
                    </div>
                  </div>
                  <div className="p-8 bg-slate-950 rounded-3xl border border-white/5">
                    <h4 className="text-white font-bold mb-4">Promotional Coupons</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">Apply valid coupon codes during the upgrade process to receive immediate discounts on your monthly subscription.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeSection === 'support' && (
          <div className="animate-fade-in space-y-16">
            <div>
              <h1 className="text-5xl font-black text-white mb-6 tracking-tighter">Customer Support</h1>
              <p className="text-xl text-slate-400 font-light leading-relaxed">
                Our mission is your success. If you have questions or technical challenges, our expert team is ready to assist.
              </p>
            </div>

            <section className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-12">
              <h3 className="text-3xl font-black text-white mb-10 tracking-tight flex items-center space-x-4">
                <Headphones className="w-8 h-8 text-indigo-500" />
                <span>Support Tickets</span>
              </h3>
              <div className="space-y-8">
                <p className="text-slate-400 text-lg leading-relaxed font-medium">
                  The integrated ticket system allows you to communicate directly with our engineering team.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-slate-950 rounded-3xl border border-white/5">
                    <h4 className="text-white font-bold mb-3">Priority Levels</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">Flag your issues as Low, Medium, or High priority to ensure critical problems are addressed immediately.</p>
                  </div>
                  <div className="p-8 bg-slate-950 rounded-3xl border border-white/5">
                    <h4 className="text-white font-bold mb-3">Real-time Updates</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">Track the status of your tickets (Open, In Progress, Resolved) and receive notifications for every reply.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

const BookOpen = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

export default DocsView;
