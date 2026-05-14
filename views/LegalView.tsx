
import React from 'react';

interface LegalViewProps {
  type: 'privacy' | 'terms';
}

const LegalView: React.FC<LegalViewProps> = ({ type }) => {
  const content = type === 'privacy' ? {
    title: 'Privacy Policy',
    lastUpdated: 'May 24, 2024',
    intro: 'At CallingAgent.agency, we take your privacy seriously. This document outlines exactly what data we collect, how it is stored, and your rights as a data subject.',
    sections: [
      {
        title: '1. Information We Collect',
        text: 'We collect information you provide directly to us, such as when you create or modify your account, request support, or otherwise communicate with us. This information may include your name, email, phone number, and voice recordings processed by our agents. We also automatically collect log data, device information, and IP addresses for security and performance monitoring. This data is essential for maintaining the integrity of your voice infrastructure.'
      },
      {
        title: '2. Voice Data and Recordings',
        text: 'All voice data processed by our orchestration layer is encrypted in transit and at rest. We use your recordings solely to provide our service and to improve the specific models assigned to your account. We never share raw audio data with third parties for marketing purposes. You have full control over retention periods for transcripts and audio files via your dashboard. Our systems are designed to minimize data footprint while maximizing operational efficiency.'
      },
      {
        title: '3. Data Sharing and Third Parties',
        text: 'To provide our "Million Dollar Stack," we utilize infrastructure from Deepgram (STT), Cartesia (TTS), and OpenAI/Anthropic (LLM). Data shared with these providers is limited to the minimum necessary to process your request and is protected by enterprise-grade DPAs (Data Processing Agreements). We select our partners based on their commitment to security and their ability to deliver sub-second latency.'
      },
      {
        title: '4. Security Measures',
        text: 'We implement industry-standard security measures, including SOC2 Type II compliance, TLS 1.3 encryption for all data in transit, and AES-256 encryption for data at rest. Our systems are regularly audited by third-party security firms and we maintain a bug bounty program to ensure the highest level of security.'
      },
      {
        title: '5. Your Rights (GDPR & CCPA)',
        text: 'Under various global regulations, you have the right to access, rectify, or erase your personal data. You may also object to processing or request data portability.'
      }
    ]
  } : {
    title: 'Terms of Service',
    lastUpdated: 'May 24, 2024',
    intro: 'Welcome to CallingAgent.agency. These Terms of Service govern your use of our platform and infrastructure. By using our services, you agree to these terms in full.',
    sections: [
      {
        title: '1. Acceptance of Terms',
        text: 'By accessing or using CallingAgent.agency, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our platform. These terms apply to all visitors, users, and others who access or use the service. We reserve the right to modify these terms at any time, and your continued use of the service constitutes acceptance of those changes.'
      },
      {
        title: '2. Usage Limits and Overages',
        text: 'Each pricing plan has specific minute and feature limitations. Exceeding these limits may result in overage charges as defined in your specific plan documentation. We reserve the right to throttle services if usage patterns indicate automated abuse or violation of our fair use policy. We aim to provide transparent billing and will notify you as you approach your plan limits.'
      },
      {
        title: '3. Intellectual Property',
        text: 'The CallingAgent.agency platform, including its proprietary orchestration engine, UI components, and logos, is the intellectual property of CallingAgent.agency Systems Inc. You retain ownership of the content of your calls and your specific system instructions. You grant us a limited license to process this data solely to provide you with the service. Any feedback or suggestions you provide may be used to improve our platform without obligation to you.'
      },
      {
        title: '4. Service Level Agreement (SLA)',
        text: 'Enterprise clients are guaranteed 99.9% uptime. For all other plans, we strive for high availability but do not provide explicit financial credits for downtime. Maintenance windows will be communicated via our status page at least 24 hours in advance.'
      },
      {
        title: '5. Termination',
        text: 'You may cancel your subscription at any time. Upon termination, you will have 30 days to export your data (transcripts and logs) before it is permanently removed from our production servers according to our data deletion protocol.'
      }
    ]
  };

  return (
    <div className="pt-40 pb-32 px-6 max-w-4xl mx-auto font-sans animate-fade-in">
      <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">{content.title}</h1>
      <p className="text-indigo-500 font-bold text-xs uppercase tracking-widest mb-8">Last Updated: {content.lastUpdated}</p>
      
      <p className="text-xl text-slate-400 mb-16 leading-relaxed font-light border-l-4 border-indigo-500 pl-8">
        {content.intro}
      </p>

      <div className="space-y-16">
        {content.sections.map((section, i) => (
          <section key={i} className="space-y-6">
            <h2 className="text-3xl font-black text-white tracking-tight">{section.title}</h2>
            <p className="text-slate-400 text-lg leading-relaxed font-medium">{section.text}</p>
          </section>
        ))}
      </div>
      
      {/* Removing legal team contact section per user request */}
    </div>
  );
};

export default LegalView;
