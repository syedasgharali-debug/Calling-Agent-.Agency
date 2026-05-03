
import React from 'react';

const CareerView: React.FC = () => {
  const jobs = [
    { 
      title: 'Senior Audio Engineer', 
      department: 'Infrastructure', 
      location: 'Remote / Palo Alto', 
      type: 'Full-time',
      desc: 'Help us build the next generation of low-latency audio pipelines. You will work on SIP trunking, WebRTC orchestration, and PCM stream optimization.'
    },
    { 
      title: 'Machine Learning Researcher (LLMs)', 
      department: 'Intelligence', 
      location: 'Remote / New York', 
      type: 'Full-time',
      desc: 'Fine-tune large language models specifically for conversational speech, focus on emotional nuance, barge-in detection, and state tracking.'
    },
    { 
      title: 'Frontend Engineer (React/WebRTC)', 
      department: 'Product', 
      location: 'Remote', 
      type: 'Full-time',
      desc: 'Craft the world-class dashboard that our users use to monitor millions of calls. Expert knowledge of React and real-time data viz required.'
    },
    { 
      title: 'Account Executive', 
      department: 'Sales', 
      location: 'London', 
      type: 'Full-time',
      desc: 'Own relationships with Fortune 500 companies looking to modernize their support stacks. You should have a deep understanding of the B2B SaaS landscape.'
    }
  ];

  return (
    <div className="pt-40 pb-32 px-6 max-w-6xl mx-auto font-sans animate-fade-in">
      <div className="text-center mb-32">
        <h1 className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter">Join the <span className="text-indigo-500">Mission</span></h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
          We are a team of researchers, engineers, and designers building the foundational infrastructure for the AI-first voice economy. We move fast, take big swings, and value technical excellence above all else.
        </p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-32">
        <div className="space-y-10">
          <h2 className="text-4xl font-black text-white tracking-tight">Our Values</h2>
          <div className="space-y-8">
            <div>
              <h4 className="text-indigo-500 font-black uppercase tracking-widest text-xs mb-3">01. Velocity</h4>
              <p className="text-slate-400 font-medium leading-relaxed">We ship every single day. We prefer speed of execution over perfect consensus. We learn by building.</p>
            </div>
            <div>
              <h4 className="text-indigo-500 font-black uppercase tracking-widest text-xs mb-3">02. Deep Craft</h4>
              <p className="text-slate-400 font-medium leading-relaxed">Whether it is a line of Rust or a customer support email, we care about the details. Excellence is our only baseline.</p>
            </div>
            <div>
              <h4 className="text-indigo-500 font-black uppercase tracking-widest text-xs mb-3">03. High Trust</h4>
              <p className="text-slate-400 font-medium leading-relaxed">We hire adults and treat them as such. We are a remote-first company that values outcome over activity.</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-12 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-6">Life at CallingAgent.agency</h3>
          <ul className="space-y-6 text-slate-400 font-medium">
            <li className="flex items-start space-x-4">
              <span className="text-indigo-500">•</span>
              <span>Fully remote culture with yearly company-wide retreats in places like Bali, Iceland, and Chamonix.</span>
            </li>
            <li className="flex items-start space-x-4">
              <span className="text-indigo-500">•</span>
              <span>Competitive salary + high-upside equity packages for every early team member.</span>
            </li>
            <li className="flex items-start space-x-4">
              <span className="text-indigo-500">•</span>
              <span>Full health, dental, and vision for you and your family, regardless of where you live.</span>
            </li>
            <li className="flex items-start space-x-4">
              <span className="text-indigo-500">•</span>
              <span>Unlimited budget for books, learning courses, and home office setups.</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-32">
        <h2 className="text-4xl font-black text-white mb-12 tracking-tight">The Hiring Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: '01', title: 'Application', desc: 'Submit your resume and a short note about why you want to build the future of voice.' },
            { step: '02', title: 'Initial Chat', desc: 'A 30-minute conversation with a team member to discuss your background and our mission.' },
            { step: '03', title: 'Technical Deep Dive', desc: 'A hands-on session where we build something together or solve a complex architectural problem.' },
            { step: '04', title: 'Founders Call', desc: 'A final conversation with our founders to ensure alignment on vision and culture.' }
          ].map((item, i) => (
            <div key={i} className="p-8 bg-slate-900/50 border border-white/5 rounded-3xl">
              <span className="text-indigo-500 font-black text-xs mb-4 block tracking-widest">{item.step}</span>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-10">
        <h2 className="text-4xl font-black text-white tracking-tight mb-16">Open Positions</h2>
        <div className="grid grid-cols-1 gap-8">
          {jobs.map((job, i) => (
            <div key={i} className="group bg-slate-900 border border-white/5 p-12 rounded-[2.5rem] flex flex-col lg:flex-row lg:items-center justify-between hover:border-indigo-500/30 transition-all cursor-pointer shadow-xl">
              <div className="max-w-2xl">
                <div className="flex items-center space-x-4 mb-3">
                  <h4 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">{job.title}</h4>
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest">{job.type}</span>
                </div>
                <div className="flex items-center space-x-6 text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">
                  <span>{job.department}</span>
                  <span>{job.location}</span>
                </div>
                <p className="text-slate-400 font-medium leading-relaxed">{job.desc}</p>
              </div>
              <button className="mt-8 lg:mt-0 px-12 py-5 bg-white text-slate-950 rounded-2xl font-black text-lg active:scale-95 transition-all shadow-2xl">Apply Now</button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-32 p-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] text-center text-white">
        <h2 className="text-4xl font-black mb-6 tracking-tighter">Don't see a fit?</h2>
        <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">We are always looking for exceptional talent. If you think you can help us build the future, reach out directly to <b>founders@callingagent.agency</b></p>
        <button className="px-10 py-4 bg-white text-indigo-700 rounded-xl font-black text-lg hover:scale-105 transition-transform">General Application</button>
      </div>
    </div>
  );
};

export default CareerView;
