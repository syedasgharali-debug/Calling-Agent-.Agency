import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Mic2, Building2, Stethoscope, Utensils, Truck, Headset, Mic, PhoneOff, AlertCircle, X, Send, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../services/geminiService';

interface Sample {
  id: string;
  industry: string;
  scenario: string;
  greeting: string;
  prompt: string;
  icon: any;
  voiceName: string;
  suggestions: string[];
}

const samples: Sample[] = [
  {
    id: 'real-estate',
    industry: 'Real Estate',
    scenario: 'Booking a property viewing for a downtown loft.',
    greeting: "Hello! This is Sarah from CallingAgent Loft Realty. I see you're interested in booking a viewing for our beautiful downtown loft. How can I assist you today?",
    prompt: "You are Sarah, a high-end real estate agent for CallingAgent Loft Realty. A potential client is calling to book a viewing for a downtown loft listed at $1.2M. Be professional, sophisticated, and helpful. Ask for their preferred time and contact details. Greet the caller with: 'Hello! This is Sarah from CallingAgent Loft Realty. I see you're interested in our beautiful downtown loft. How can I assist you today?' Keep responses short and realistic.",
    icon: Building2,
    voiceName: 'Aoede',
    suggestions: [
      "Can I view it this Saturday?",
      "What is the listing price?",
      "How many bedrooms does it have?"
    ]
  },
  {
    id: 'healthcare',
    industry: 'Healthcare',
    scenario: 'Scheduling a follow-up appointment with a specialist.',
    greeting: "Welcome to CallingAgent Health. This is David speaking. I'm here to help you schedule your follow-up with Dr. Aris. Do you have your insurance information handy?",
    prompt: "You are David, a medical coordinator at CallingAgent Health. You are helping a patient schedule a follow-up appointment with Dr. Aris, a cardiologist. Be empathetic, clear, and reassuring. Greet the caller with: 'Welcome to CallingAgent Health. This is David speaking. I'm here to help you schedule your follow-up with Dr. Aris. Do you have your insurance information handy?'",
    icon: Stethoscope,
    voiceName: 'Fenrir',
    suggestions: [
      "Yes, I have my insurance ready",
      "Is Tuesday at 10:00 AM still open?",
      "Do you take self-pay patients?"
    ]
  },
  {
    id: 'hospitality',
    industry: 'Hospitality',
    scenario: 'Making a dinner reservation and checking allergy options.',
    greeting: "Buonasera! CallingAgent Bistro, this is Marco. We'd love to host you this Saturday. How many guests will be joining us?",
    prompt: "You are Marco, the head host at CallingAgent Bistro. A customer wants to make a dinner reservation for 4 people this Saturday. Be enthusiastic and welcoming. Greet with: 'Buonasera! CallingAgent Bistro, this is Marco. We'd love to host you this Saturday. How many guests will be joining us?' Mention our gluten-free menu when asked.",
    icon: Utensils,
    voiceName: 'Puck',
    suggestions: [
      "Do you have gluten-free dishes?",
      "Can I book a table for 4 this Saturday?",
      "Where are you located?"
    ]
  },
  {
    id: 'logistics',
    industry: 'Logistics',
    scenario: 'Automated status check for an international shipment.',
    greeting: "Global Logistics tracking assistant. Please provide your tracking number or ask about your Singapore to New York shipment status.",
    prompt: "You are the CallingAgent Global Logistics assistant. You help customers track international shipments. Be efficient, direct, and clear. Greet with: 'Global Logistics tracking assistant. Please provide your tracking number or ask about your Singapore to New York shipment status.' Provide status of SG-NY-39049 when queried.",
    icon: Truck,
    voiceName: 'Kore',
    suggestions: [
      "Where is my package right now?",
      "Is there any customs delay?",
      "Awesome, prioritize my package"
    ]
  },
  {
    id: 'support',
    industry: 'Support',
    scenario: 'Resolving a billing inquiry for a SaaS subscription.',
    greeting: "Hi, thank you for calling support. This is Chloe. I understand you have a question about your Pro plan billing. How can I help you today?",
    prompt: "You are Chloe from CallingAgent SaaS Support. You are helping a customer with a billing inquiry regarding their 'Pro' plan subscription. Be patient, professional, and clear. Greet with: 'Hi, thank you for calling support. This is Chloe. I understand you have a question about your Pro plan billing. How can I help you today?' Offer a 50% discount instead of letting them cancel.",
    icon: Headset,
    voiceName: 'Aoede',
    suggestions: [
      "Why did you charge me $49?",
      "I want to cancel my Pro subscription",
      "Can you send me my invoice?"
    ]
  },
  {
    id: 'finance',
    industry: 'Financial Services',
    scenario: 'Flagging fraudulent activity and disputes on a debit card.',
    greeting: "Thank you for contacting CallingAgent Capital. This is John speaking. I see you flagged an unauthorized $45.00 charge on your account. Let's get this resolved for you right away.",
    prompt: "You are John, a senior fraud investigator at CallingAgent Capital. A customer is calling to dispute an unrecognized $45.00 online transaction. Be calm, reassuring, highly secure, and professional. Greet with: 'Thank you for contacting CallingAgent Capital. This is John speaking. I see you flagged an unauthorized $45.00 charge on your account. Let's get this resolved for you right away.' Offer to lock the card and generate a new secure virtual card.",
    icon: CreditCard,
    voiceName: 'Charon',
    suggestions: [
      "Block that unauthorized charge",
      "Is my savings balance safe?",
      "Can I get a new virtual card?"
    ]
  }
];

const VoiceSamples: React.FC = () => {
  // Play state for static files (dynamic TTS greetings)
  const [playingSampleId, setPlayingSampleId] = useState<string | null>(null);
  const [isTTSLoading, setIsTTSLoading] = useState(false);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Live simulation states
  const [activeLiveId, setActiveLiveId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [inputText, setInputText] = useState('');

  const recognitionRef = useRef<any>(null);
  const historyRef = useRef<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([]);

  // Cleanup synthesis or audio on unmount
  useEffect(() => {
    return () => {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Web Speech Synthesis Fallback
  const speakWithBrowserFallback = (text: string, voiceName: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const nameLower = voiceName.toLowerCase();
        const matched = voices.find(v => 
          v.name.toLowerCase().includes(nameLower) ||
          (nameLower === 'aoede' && v.name.toLowerCase().includes('female')) ||
          (nameLower === 'fenrir' && v.name.toLowerCase().includes('male'))
        );
        if (matched) utterance.voice = matched;
      }
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  };

  // Speaks using Gemini high-quality TTS or falls back to browser synthesis
  const speakAgentResponse = async (text: string, voiceName: string) => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }

    try {
      const audioUrl = await geminiService.generateSpeech(text, voiceName);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        activeAudioRef.current = audio;
        await audio.play();
        return new Promise<void>((resolve) => {
          audio.onended = () => resolve();
          audio.onerror = () => {
            speakWithBrowserFallback(text, voiceName).then(resolve);
          };
        });
      } else {
        await speakWithBrowserFallback(text, voiceName);
      }
    } catch (e) {
      console.warn("TTS fetch failed, falling back to Web Speech API", e);
      await speakWithBrowserFallback(text, voiceName);
    }
  };

  // Toggle play greeting sample
  const togglePlayStatic = async (sample: Sample) => {
    // If live call is active or connecting, close it first
    if (activeLiveId) {
      stopLiveTest();
    }

    if (playingSampleId === sample.id) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingSampleId(null);
    } else {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      setPlayingSampleId(sample.id);
      setIsTTSLoading(true);

      try {
        await speakAgentResponse(sample.greeting, sample.voiceName);
      } catch (err) {
        console.error("Agent playback error:", err);
      } finally {
        setIsTTSLoading(false);
        setPlayingSampleId(null);
      }
    }
  };

  // Stop current live conversation
  const stopLiveTest = () => {
    setActiveLiveId(null);
    setIsConnecting(false);
    setIsListening(false);
    setLiveTranscript([]);
    historyRef.current = [];
    
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  // Start Speech Recognition loop
  const startSpeechRecognition = (sample: Sample) => {
    if (!activeLiveId) return;
    
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      console.warn("Speech recognition is not supported in this browser.");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    const rec = new SpeechRecognitionClass();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = async (e: any) => {
      const text = e.results[0][0].transcript;
      if (text && text.trim()) {
        await handleUserTurn(text, sample);
      }
    };

    rec.onerror = (e: any) => {
      console.warn("Speech recognition error:", e.error);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (e) {
      console.error("Failed to start SpeechRecognition:", e);
    }
  };

  // Process user message (vocal or typed)
  const handleUserTurn = async (userText: string, sample: Sample) => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    setIsListening(false);

    // Add user message to transcript and history
    setLiveTranscript(prev => [...prev, { role: 'user', text: userText }]);
    const currentHistory = [...historyRef.current];
    currentHistory.push({ role: 'user', parts: [{ text: userText }] });
    historyRef.current = currentHistory;

    setIsConnecting(true); // show thinking indicator

    try {
      // Get response from server-side agent
      const agentReply = await geminiService.getAgentResponse(userText, currentHistory, sample.prompt);
      
      // Update transcript
      setLiveTranscript(prev => [...prev, { role: 'model', text: agentReply }]);
      historyRef.current.push({ role: 'model', parts: [{ text: agentReply }] });

      // Speak response
      setIsConnecting(false);
      await speakAgentResponse(agentReply, sample.voiceName);

      // Loop back to speech recognition if conversation is still active
      if (activeLiveId === sample.id) {
        startSpeechRecognition(sample);
      }
    } catch (err) {
      console.error("Live dialogue error:", err);
      setIsConnecting(false);
    }
  };

  // Start live conversational test
  const startLiveTest = async (sample: Sample) => {
    if (playingSampleId) {
      setPlayingSampleId(null);
    }
    stopLiveTest();

    setActiveLiveId(sample.id);
    setIsConnecting(true);

    try {
      // Speak the initial greeting
      setLiveTranscript([{ role: 'model', text: sample.greeting }]);
      historyRef.current = [{ role: 'model', parts: [{ text: sample.greeting }] }];
      
      setIsConnecting(false);
      await speakAgentResponse(sample.greeting, sample.voiceName);

      // Trigger automatic voice pickup if supported
      startSpeechRecognition(sample);
    } catch (err) {
      console.error("Failed to start live call:", err);
      setIsConnecting(false);
    }
  };

  return (
    <section id="samples" className="py-16 px-6 bg-slate-900/40 border-y border-white/5 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter">
            A <span className="text-indigo-500">Smarter</span> Way to Automate Calls
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg lowercase tracking-tight">
            Listen to pre-recorded samples or <span className="text-emerald-400 font-bold uppercase tracking-widest px-2 opacity-80">talk live</span> to our agents right now.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {samples.map((sample) => {
            const Icon = sample.icon;
            const isLive = activeLiveId === sample.id;
            const isSamplePlaying = playingSampleId === sample.id;

            return (
              <div 
                key={sample.id}
                className={`group relative p-8 rounded-3xl border transition-all duration-500 flex flex-col justify-between overflow-hidden ${
                  isLive 
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.08)]'
                    : 'bg-slate-900/60 border-white/5 hover:border-white/10 hover:bg-slate-900/80 shadow-2xl'
                }`}
              >
                {isLive && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 animate-pulse"></div>
                )}

                <div>
                  {/* Top Bar inside Card */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-4 rounded-2xl transition-all duration-300 ${
                      isLive ? 'bg-emerald-500 text-white' : 
                      'bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700'
                    }`}>
                      <Icon size={28} />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => togglePlayStatic(sample)}
                        disabled={isLive}
                        className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 border ${
                          isSamplePlaying 
                            ? 'bg-rose-500 border-rose-500 text-white shadow-xl scale-105' 
                            : isLive 
                              ? 'bg-slate-800/40 border-transparent text-slate-600 cursor-not-allowed'
                              : 'bg-white border-white text-slate-950 hover:scale-110 shadow-xl'
                        }`}
                        title={isSamplePlaying ? "Pause Sample" : "Play Greeting Sample"}
                      >
                        {isSamplePlaying ? (
                          <Pause size={18} fill="currentColor" />
                        ) : (
                          <Play size={18} fill="currentColor" className="ml-0.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => isLive ? stopLiveTest() : startLiveTest(sample)}
                        className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 border ${
                          isLive 
                            ? 'bg-emerald-500 border-emerald-500 text-white animate-pulse shadow-xl shadow-emerald-500/30' 
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white hover:scale-110'
                        }`}
                        title={isLive ? "End Conversation" : "Talk Live"}
                      >
                        {isLive ? <PhoneOff size={18} /> : <Mic size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Info / Conversation Panel */}
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`text-2xl font-black tracking-tight ${isLive ? 'text-emerald-400' : 'text-white'}`}>
                        {sample.industry}
                      </h3>
                      <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {sample.voiceName} Voice
                      </span>
                    </div>

                    {isLive ? (
                      <div className="space-y-4">
                        <div className="bg-slate-950/80 border border-white/5 rounded-2xl p-4 h-[12rem] overflow-y-auto custom-scrollbar flex flex-col justify-end">
                          <div className="space-y-3">
                            {liveTranscript.slice(-3).map((msg, i) => (
                              <div key={i} className={`text-sm ${msg.role === 'model' ? 'text-white' : 'text-emerald-400'} font-medium animate-fade-in`}>
                                <span className="text-[10px] uppercase font-black mr-2 opacity-60">
                                  {msg.role === 'model' ? 'Agent' : 'You'}
                                </span>
                                {msg.text}
                              </div>
                            ))}
                            
                            {isConnecting && (
                              <div className="flex items-center space-x-2 py-1">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Interactive Suggestion Chips */}
                        <div className="space-y-1.5">
                          <p className="text-[10px] uppercase font-bold text-slate-500">Quick Response Chips (Iframe Friendly)</p>
                          <div className="flex flex-wrap gap-1.5">
                            {sample.suggestions.map((option, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => handleUserTurn(option, sample)}
                                className="text-[11px] font-bold px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white rounded-lg border border-white/5 transition-all text-left"
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Manual Keyboard Response Entry */}
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (inputText.trim()) {
                              handleUserTurn(inputText, sample);
                              setInputText('');
                            }
                          }}
                          className="flex items-center gap-1.5 bg-slate-900 border border-white/5 rounded-xl p-1"
                        >
                          <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type response to voice agent..."
                            className="bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none px-2 py-1 w-full"
                          />
                          <button
                            type="submit"
                            className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                          >
                            <Send size={12} />
                          </button>
                        </form>

                        {/* Visualizer Status */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isListening ? 'bg-emerald-400' : 'bg-indigo-400'}`}></span>
                              <span className={`relative inline-flex rounded-full h-2 w-2 ${isListening ? 'bg-emerald-500' : 'bg-indigo-500'}`}></span>
                            </span>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                              {isListening ? 'Listening via Microphone...' : 'Agent synthesis active'}
                            </span>
                          </div>
                          {isListening && (
                            <div className="flex space-x-0.5 items-end h-3">
                              {[1, 2, 3, 4, 1.5, 2.5, 1.2, 3.5].map((val, i) => (
                                <div 
                                  key={i} 
                                  className="w-0.5 bg-emerald-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]"
                                  style={{ height: `${val * 3}px` }}
                                ></div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium mt-2">
                        {sample.scenario}
                      </p>
                    )}
                  </div>
                </div>

                {!isLive && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-slate-500 text-xs">
                    <span>Vibe: {sample.id === 'healthcare' || sample.id === 'support' ? 'Warm' : 'Professional'}</span>
                    <span>Latency: sub-150ms</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-20 bg-gradient-to-br from-indigo-500/10 via-slate-900/80 to-emerald-500/10 rounded-[3rem] p-10 border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/5 pointer-events-none"></div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h4 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight flex items-center">
                <AlertCircle className="mr-3 text-indigo-500 animate-pulse" size={24} />
                Try Our Latency-Free Pipeline
              </h4>
              <p className="text-slate-300 font-medium text-base md:text-lg leading-snug">
                Click the <span className="text-emerald-450 font-black text-emerald-400">MIC icon</span> on any card to talk directly with that industry agent. No login required for preview. Experience sub-300ms response times that feel truly human.
              </p>
            </div>
            <button 
              type="button"
              className="px-10 py-5 bg-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all transform hover:-translate-y-1 active:scale-95 shadow-2xl shadow-indigo-600/20 cursor-pointer shrink-0"
            >
              Get Enterprise Access
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VoiceSamples;
