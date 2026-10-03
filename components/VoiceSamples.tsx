import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Building2, Stethoscope, Utensils, Truck, Headset, Mic, PhoneOff, AlertCircle, Send, CreditCard } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface VoiceConfig {
  provider: 'Gemini' | 'ElevenLabs';
  voiceId: string;
  speakingStyle: string;
  speed: number;
  stability: number;
  similarity: number;
  accent: string;
}

interface Sample {
  id: string;
  industry: string;
  scenario: string;
  greeting: string;
  prompt: string;
  icon: any;
  voiceName: string;
  suggestions: string[];
  voiceSettings: VoiceConfig;
}

interface VoiceSamplesProps {
  theme?: 'dark' | 'light';
}

const samples: Sample[] = [
  {
    id: 'real-estate',
    industry: 'Real Estate',
    scenario: 'Booking a property viewing for a downtown loft.',
    greeting: "Absolutely, I'd love to help you schedule a walkthrough. We actually have an open slot this Saturday at 2:00 PM for that gorgeous downtown loft. Would that time work well for your schedule?",
    prompt: "You are Sarah, an elite property consultant for CallingAgent Loft Realty. A potential client is calling to book a viewing for a downtown loft listed at $1.2M. Be professional, sophisticated, and warm. Ask for their preferred viewing slot and contact details. Greet the caller naturally, prioritizing helpful scheduling.",
    icon: Building2,
    voiceName: 'Aoede',
    suggestions: [
      "Can I view it this Saturday?",
      "What is the listing price?",
      "How many bedrooms does it have?"
    ],
    voiceSettings: {
      provider: 'Gemini',
      voiceId: 'Aoede',
      speakingStyle: 'Professional & Elegant',
      speed: 0.95,
      stability: 0.8,
      similarity: 0.85,
      accent: 'US Female Corporate'
    }
  },
  {
    id: 'healthcare',
    industry: 'Healthcare',
    scenario: 'Scheduling a follow-up appointment with a specialist.',
    greeting: "Hello, thank you for reaching out. Let me check Dr. Aris's calendar for your cardiology follow-up. I see a slot available next Tuesday morning. Do you have your insurance provider card handy?",
    prompt: "You are David, a medical coordinator at CallingAgent Health. You are helping a patient schedule a follow-up appointment with Dr. Aris, a cardiologist. Be warm, calm, reassuring, and patient. Avoid making direct medical claims. Focus on scheduling and collecting insurance data.",
    icon: Stethoscope,
    voiceName: 'Fenrir',
    suggestions: [
      "Yes, I have my insurance ready",
      "Is Tuesday at 10:00 AM still open?",
      "Do you take self-pay patients?"
    ],
    voiceSettings: {
      provider: 'Gemini',
      voiceId: 'Fenrir',
      speakingStyle: 'Reassuring & Empathetic',
      speed: 0.9,
      stability: 0.85,
      similarity: 0.9,
      accent: 'US Male Reassuring'
    }
  },
  {
    id: 'hospitality',
    industry: 'Hospitality',
    scenario: 'Making a dinner reservation and checking allergy options.',
    greeting: "Buonasera! Welcome to CallingAgent Bistro. I'd be absolutely delighted to secure a table for you this weekend. How many guests will be joining us for dinner?",
    prompt: "You are Marco, the head host at CallingAgent Bistro. A customer wants to make a dinner reservation for 4 people this Saturday. Be enthusiastic, welcoming, and highly conversational. Greet with Italian hospitality. Mention our custom gluten-free menu when asked.",
    icon: Utensils,
    voiceName: 'Puck',
    suggestions: [
      "Do you have gluten-free dishes?",
      "Can I book a table for 4 this Saturday?",
      "Where are you located?"
    ],
    voiceSettings: {
      provider: 'Gemini',
      voiceId: 'Puck',
      speakingStyle: 'Welcoming & Friendly',
      speed: 1.0,
      stability: 0.75,
      similarity: 0.8,
      accent: 'European Male Warm'
    }
  },
  {
    id: 'logistics',
    industry: 'Logistics',
    scenario: 'Automated status check for an international shipment.',
    greeting: "Hello. Let me pull up that shipment record for you right now. I see your package from Singapore to New York is currently in transit and cleared customs smoothly. It's on track for delivery this Thursday.",
    prompt: "You are the CallingAgent Global Logistics assistant. You help customers track international shipments. Be efficient, direct, confident, and highly clear. Greet naturally and assist with package query updates.",
    icon: Truck,
    voiceName: 'Kore',
    suggestions: [
      "Where is my package right now?",
      "Is there any customs delay?",
      "Awesome, prioritize my package"
    ],
    voiceSettings: {
      provider: 'Gemini',
      voiceId: 'Kore',
      speakingStyle: 'Confident & Confirmed',
      speed: 0.98,
      stability: 0.82,
      similarity: 0.88,
      accent: 'US Female Clear'
    }
  },
  {
    id: 'support',
    industry: 'Support',
    scenario: 'Resolving a billing inquiry for a SaaS subscription.',
    greeting: "Hi there, thank you for calling support. I understand there was a discrepancy on your latest Pro subscription invoice. Let me take a look at your account statement and get this squared away for you.",
    prompt: "You are Chloe from CallingAgent SaaS Support. You are helping a customer with a billing inquiry regarding their 'Pro' plan subscription. Be exceptionally patient, warm, and helpful. Offer a retention discount instead of direct cancellation if appropriate.",
    icon: Headset,
    voiceName: 'Aoede',
    suggestions: [
      "Why did you charge me $49?",
      "I want to cancel my Pro subscription",
      "Can you send me my invoice?"
    ],
    voiceSettings: {
      provider: 'Gemini',
      voiceId: 'Aoede',
      speakingStyle: 'Helpful & Patient',
      speed: 0.95,
      stability: 0.8,
      similarity: 0.85,
      accent: 'US Female Friendly'
    }
  },
  {
    id: 'finance',
    industry: 'Financial Services',
    scenario: 'Flagging fraudulent activity and disputes on a debit card.',
    greeting: "Hello, thank you for reaching out to security services. I've flagged that suspicious transaction of forty-five dollars on your debit card. Let's lock this down to secure your account and issue a replacement virtual card immediately.",
    prompt: "You are John, a senior fraud investigator at CallingAgent Capital. A customer is calling to dispute an unrecognized charge. Be completely calm, serious, highly secure, reassuring, and professional. Greet and immediately coordinate card safety.",
    icon: CreditCard,
    voiceName: 'Charon',
    suggestions: [
      "Block that unauthorized charge",
      "Is my savings balance safe?",
      "Can I get a new virtual card?"
    ],
    voiceSettings: {
      provider: 'Gemini',
      voiceId: 'Charon',
      speakingStyle: 'Secure & Controlled',
      speed: 0.93,
      stability: 0.9,
      similarity: 0.92,
      accent: 'US Male Authoritative'
    }
  }
];

const VoiceSamples: React.FC<VoiceSamplesProps> = ({ theme = 'dark' }) => {
  const [playingSampleId, setPlayingSampleId] = useState<string | null>(null);
  const [isTTSLoading, setIsTTSLoading] = useState(false);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Live simulation states
  const [activeLiveId, setActiveLiveId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [micError, setMicError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const historyRef = useRef<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([]);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = () => {
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

  // Browser synthesis fallback with exceptionally premium voice selection (Google Natural / Local HQ)
  const speakWithBrowserFallback = (text: string, voiceName: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const selectBestVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const nameLower = voiceName.toLowerCase();
          
          // 1. Try to find custom "natural" or "google" versions of the specific model voice
          let matched = voices.find(v => v.name.toLowerCase().includes('natural') && v.name.toLowerCase().includes(nameLower));
          if (!matched) {
            matched = voices.find(v => v.name.toLowerCase().includes('google') && v.name.toLowerCase().includes(nameLower));
          }
          if (!matched) {
            matched = voices.find(v => v.name.toLowerCase().includes(nameLower));
          }
          
          // 2. Gender and accent fallback matching for premium, lifelike voices
          if (!matched) {
            const isFemale = ['aoede', 'kore', 'chloe', 'sarah', 'claudia'].includes(nameLower);
            const genderKeywords = isFemale 
              ? ['natural', 'google', 'female', 'samantha', 'sira', 'zira', 'karen', 'tessa', 'veena'] 
              : ['natural', 'google', 'male', 'david', 'guy', 'george', 'sean', 'ravi'];
            
            for (const keyword of genderKeywords) {
              matched = voices.find(v => v.name.toLowerCase().includes('en-') && v.name.toLowerCase().includes('natural') && v.name.toLowerCase().includes(keyword));
              if (matched) break;
            }
            if (!matched) {
              for (const keyword of genderKeywords) {
                matched = voices.find(v => v.name.toLowerCase().includes('en-') && v.name.toLowerCase().includes('google') && v.name.toLowerCase().includes(keyword));
                if (matched) break;
              }
            }
            if (!matched) {
              for (const keyword of genderKeywords) {
                matched = voices.find(v => v.name.toLowerCase().includes('en-') && v.name.toLowerCase().includes(keyword));
                if (matched) break;
              }
            }
          }
          
          if (matched) {
            utterance.voice = matched;
          }
        }
      };

      selectBestVoice();
      
      // Handle asynchronous loading of voices in browsers like Chrome
      if ('onvoiceschanged' in window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = selectBestVoice;
      }

      utterance.rate = 0.94; // Reassuring, clear, slightly slower natural human pace
      utterance.pitch = 1.02; // Friendly, clear pitch adjustment
      utterance.volume = 1.0;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  };

  // Speaks using high-fidelity prebuilt AI voice models
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
      console.warn("High-fidelity TTS generated error, falling back to Web Speech API", e);
      await speakWithBrowserFallback(text, voiceName);
    }
  };

  const togglePlayStatic = async (sample: Sample) => {
    if (activeLiveId) {
      stopLiveTest();
    }

    if (playingSampleId === sample.id) {
      cleanupAudio();
      setPlayingSampleId(null);
    } else {
      cleanupAudio();
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

  const stopLiveTest = () => {
    setActiveLiveId(null);
    setIsConnecting(false);
    setIsListening(false);
    setLiveTranscript([]);
    setMicError(null);
    historyRef.current = [];
    cleanupAudio();
  };

  // Start Speech Recognition loop with working BARGE-IN!
  const startSpeechRecognition = (sample: Sample) => {
    if (!activeLiveId) return;
    setMicError(null);
    
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setMicError("Microphone recognition is not supported in this browser. Please type or use quick chips below!");
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
      setMicError(null);
    };

    // BARGE-IN IMPLEMENTATION: Mute agent immediately when user starts speaking!
    rec.onsoundstart = () => {
      if (activeAudioRef.current) {
        console.log("Barge-in / interruption triggered! Muting active agent voice output immediately.");
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
    };

    rec.onresult = async (e: any) => {
      const text = e.results[0][0].transcript;
      if (text && text.trim()) {
        await handleUserTurn(text, sample);
      }
    };

    rec.onerror = (e: any) => {
      console.warn("Speech recognition notice:", e.error);
      setIsListening(false);
      if (e.error === 'not-allowed') {
        setMicError("Microphone permission denied. Enable microphone access in your browser settings.");
      } else if (e.error === 'no-speech') {
        setMicError("No speech detected. Feel free to speak or tap chips.");
      }
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

  const handleUserTurn = async (userText: string, sample: Sample) => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    setIsListening(false);
    setLiveTranscript(prev => [...prev, { role: 'user', text: userText }]);
    const currentHistory = [...historyRef.current];
    currentHistory.push({ role: 'user', parts: [{ text: userText }] });
    historyRef.current = currentHistory;

    setIsConnecting(true);

    try {
      const agentReply = await geminiService.getAgentResponse(userText, currentHistory, sample.prompt);
      
      setLiveTranscript(prev => [...prev, { role: 'model', text: agentReply }]);
      historyRef.current.push({ role: 'model', parts: [{ text: agentReply }] });

      setIsConnecting(false);
      await speakAgentResponse(agentReply, sample.voiceName);

      if (activeLiveId === sample.id) {
        startSpeechRecognition(sample);
      }
    } catch (err) {
      console.error("Live dialogue error:", err);
      setIsConnecting(false);
    }
  };

  const startLiveTest = async (sample: Sample) => {
    if (playingSampleId) {
      setPlayingSampleId(null);
    }
    stopLiveTest();

    setActiveLiveId(sample.id);
    setIsConnecting(true);

    try {
      setLiveTranscript([{ role: 'model', text: sample.greeting }]);
      historyRef.current = [{ role: 'model', parts: [{ text: sample.greeting }] }];
      
      setIsConnecting(false);
      await speakAgentResponse(sample.greeting, sample.voiceName);

      startSpeechRecognition(sample);
    } catch (err) {
      console.error("Failed to start live call:", err);
      setIsConnecting(false);
    }
  };

  return (
    <section id="samples" className={`py-16 px-6 border-y relative transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950 border-white/5' : 'bg-slate-100/50 border-slate-200'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-mono">Conversational Realism</span>
          <h2 className={`text-3xl md:text-5xl font-black mt-3 mb-4 tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            A Smarter Way to Automate Calls
          </h2>
          <p className={`max-w-2xl mx-auto text-sm md:text-base font-semibold leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Listen to pre-recorded conversational patterns or tap <span className="text-emerald-500 uppercase tracking-widest px-1 font-bold">Talk Live</span> to experience lag-free human-like dialogue right now.
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
                className={`group relative p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col justify-between overflow-hidden ${
                  isLive 
                    ? 'bg-emerald-950/10 border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.06)]'
                    : theme === 'dark'
                      ? 'bg-slate-950/40 border-white/5 hover:border-indigo-500/10 hover:bg-slate-950/60 shadow-2xl'
                      : 'bg-white border-slate-200 hover:border-indigo-500/10 hover:bg-slate-50 shadow-md'
                }`}
              >
                {isLive && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 animate-pulse" />
                )}

                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-3.5 rounded-2xl transition-all duration-300 ${
                      isLive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      theme === 'dark'
                        ? 'bg-slate-900 text-slate-400 group-hover:text-white border border-transparent group-hover:border-white/5'
                        : 'bg-slate-100 text-slate-600 group-hover:text-slate-900 border border-transparent group-hover:border-slate-200'
                    }`}>
                      <Icon size={24} />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => togglePlayStatic(sample)}
                        disabled={isLive || isTTSLoading}
                        className={`flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 border cursor-pointer ${
                          isSamplePlaying 
                            ? 'bg-rose-600 border-rose-600 text-white' 
                            : isLive 
                              ? theme === 'dark' ? 'bg-slate-900 border-transparent text-slate-700 cursor-not-allowed' : 'bg-slate-100 border-transparent text-slate-400 cursor-not-allowed'
                              : theme === 'dark' ? 'bg-white border-white text-slate-950 hover:scale-105' : 'bg-slate-900 border-slate-900 text-white hover:scale-105 hover:bg-slate-800'
                        }`}
                        title={isSamplePlaying ? "Pause Sample" : "Play Greeting Sample"}
                      >
                        {isSamplePlaying ? (
                          <Pause size={16} fill="currentColor" />
                        ) : (
                          <Play size={16} fill="currentColor" className="ml-0.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => isLive ? stopLiveTest() : startLiveTest(sample)}
                        className={`flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 border cursor-pointer ${
                          isLive 
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-500/10' 
                            : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:scale-105'
                        }`}
                        title={isLive ? "End Conversation" : "Talk Live"}
                      >
                        {isLive ? <PhoneOff size={16} /> : <Mic size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className={`text-xl font-bold tracking-tight ${isLive ? 'text-emerald-400' : theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        {sample.industry}
                      </h3>
                      <span className="text-[9px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/15">
                        {sample.voiceSettings.accent}
                      </span>
                    </div>

                    {isLive ? (
                      <div className="space-y-4">
                        <div className={`rounded-2xl p-4 h-[12rem] overflow-y-auto flex flex-col justify-end border ${theme === 'dark' ? 'bg-slate-950/80 border-white/5' : 'bg-white border-slate-200'}`}>
                          <div className="space-y-3">
                            {liveTranscript.slice(-3).map((msg, i) => (
                              <div key={i} className={`text-xs ${msg.role === 'model' ? 'text-white' : 'text-emerald-400'} font-semibold`}>
                                <span className="text-[9px] uppercase font-black mr-2 opacity-50">
                                  {msg.role === 'model' ? 'Agent' : 'You'}
                                </span>
                                {msg.text}
                              </div>
                            ))}
                            
                            {isConnecting && (
                              <div className="flex items-center space-x-1.5 py-1">
                                <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" />
                                <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.15s]" />
                                <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.3s]" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-[9px] uppercase font-black tracking-wider text-slate-500 font-mono">Quick Response Chips</p>
                          <div className="flex flex-wrap gap-1.5">
                            {sample.suggestions.map((option, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => handleUserTurn(option, sample)}
                                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all text-left cursor-pointer ${
                                  theme === 'dark' 
                                    ? 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/5' 
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>

                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (inputText.trim()) {
                              handleUserTurn(inputText, sample);
                              setInputText('');
                            }
                          }}
                          className={`flex items-center gap-1.5 rounded-xl p-1 border ${
                            theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'
                          }`}
                        >
                          <input
                            type="text"
                             value={inputText}
                             onChange={(e) => setInputText(e.target.value)}
                             placeholder="Type to voice agent..."
                             className={`bg-transparent text-[11px] focus:outline-none px-2 py-1 w-full ${
                               theme === 'dark' ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                             }`}
                          />
                          <button
                            type="submit"
                            className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors cursor-pointer"
                          >
                            <Send size={10} />
                          </button>
                        </form>

                        {micError && (
                          <div className="bg-amber-950/20 text-amber-300 text-[10px] p-2.5 rounded-xl border border-amber-500/20 flex gap-2 items-start leading-snug">
                            <AlertCircle size={14} className="shrink-0 mt-0.5" />
                            <span>{micError}</span>
                          </div>
                        )}

                        <div className={`flex items-center justify-between mt-2 pt-2 border-t ${
                          theme === 'dark' ? 'border-white/5' : 'border-slate-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isListening ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                              <span className={`relative inline-flex rounded-full h-2 w-2 ${isListening ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                            </span>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                              {isListening ? 'Listening...' : 'Muted'}
                            </span>
                          </div>
                          
                          {isListening ? (
                            <div className="flex space-x-0.5 items-end h-3">
                              {[1, 2, 3, 4, 1.5, 2.5, 1.2, 3.5].map((val, i) => (
                                <div 
                                  key={i} 
                                  className="w-0.5 bg-emerald-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]"
                                  style={{ height: `${val * 3}px` }}
                                />
                              ))}
                            </div>
                          ) : (
                            !isConnecting && (
                              <button
                                type="button"
                                onClick={() => startSpeechRecognition(sample)}
                                className="text-[10px] font-black text-white bg-emerald-600 hover:bg-emerald-550 px-2.5 py-1 rounded-lg active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Mic size={10} />
                                <span>TAP TO SPEAK</span>
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className={`text-xs md:text-sm leading-relaxed mb-6 font-semibold mt-2 ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {sample.scenario}
                      </p>
                    )}
                  </div>
                </div>

                {!isLive && (
                  <div className={`mt-4 pt-4 border-t flex flex-wrap items-center justify-between text-[10px] font-mono uppercase tracking-wider gap-2 ${
                    theme === 'dark' ? 'border-white/5 text-slate-500' : 'border-slate-200 text-slate-500'
                  }`}>
                    <span>Vibe: {sample.voiceSettings.speakingStyle}</span>
                    <span>Speed: {sample.voiceSettings.speed}x</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default VoiceSamples;
