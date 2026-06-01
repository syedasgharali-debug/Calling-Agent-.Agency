import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Mic2, Building2, Stethoscope, Utensils, Truck, Headset, Mic, PhoneOff, AlertCircle } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface Sample {
  id: string;
  industry: string;
  scenario: string;
  url: string;
  icon: any;
  prompt: string;
}

const samples: Sample[] = [
  {
    id: 'real-estate',
    industry: 'Real Estate',
    scenario: 'Booking a property viewing for a downtown loft.',
    url: 'https://cdn.openai.com/whisper/draft-20220913/samples/sample_0.mp3',
    icon: Building2,
    prompt: "You are Sarah, a high-end real estate agent for CallingAgent Loft Realty. A potential client is calling to book a viewing for a downtown loft listed at $1.2M. Be professional, sophisticated, and helpful. Ask for their preferred time and contact details. START BY GREETING THE CALLER: 'Hello! This is Sarah from CallingAgent Loft Realty. I see you're interested in our beautiful downtown loft. How can I assist you today?'"
  },
  {
    id: 'healthcare',
    industry: 'Healthcare',
    scenario: 'Scheduling a follow-up appointment with a specialist.',
    url: 'https://cdn.openai.com/whisper/draft-20220913/samples/sample_1.mp3',
    icon: Stethoscope,
    prompt: "You are David, a medical coordinator at CallingAgent Health. You are helping a patient schedule a follow-up appointment with Dr. Aris, a cardiologist. Be empathetic, clear, and reassuring. Verify if they have their insurance card ready. START BY GREETING THE CALLER: 'Welcome to CallingAgent Health. This is David speaking. I'm here to help you schedule your follow-up with Dr. Aris. Do you have your insurance information handy?'"
  },
  {
    id: 'hospitality',
    industry: 'Hospitality',
    scenario: 'Making a dinner reservation and checking allergy options.',
    url: 'https://cdn.openai.com/whisper/draft-20220913/samples/sample_2.mp3',
    icon: Utensils,
    prompt: "You are Marco, the head host at CallingAgent Bistro. A customer wants to make a dinner reservation for 4 people this Saturday. Be enthusiastic and welcoming. They are concerned about gluten allergies; let them know we have a dedicated gluten-free menu. START BY GREETING THE CALLER: 'Buonasera! CallingAgent Bistro, this is Marco. We'd love to host you this Saturday. How many guests will be joining us?'"
  },
  {
    id: 'logistics',
    industry: 'Logistics',
    scenario: 'Automated status check for an international shipment.',
    url: 'https://cdn.openai.com/whisper/draft-20220913/samples/sample_3.mp3',
    icon: Truck,
    prompt: "You are the CallingAgent Global Logistics assistant. You help customers track international shipments. Be efficient, direct, and provide clear status updates. The customer is asking about a shipment from Singapore to New York. START BY GREETING THE CALLER: 'Global Logistics tracking assistant. Please provide your tracking number or ask about your Singapore to New York shipment status.'"
  },
  {
    id: 'support',
    industry: 'Support',
    scenario: 'Resolving a billing inquiry for a SaaS subscription.',
    url: 'https://cdn.openai.com/whisper/draft-20220913/samples/sample_4.mp3',
    icon: Headset,
    prompt: "You are Chloe from CallingAgent SaaS Support. You are helping a customer with a billing inquiry regarding their 'Pro' plan subscription. Be patient, professional, and clear about the billing cycles. START BY GREETING THE CALLER: 'Hi, thank you for calling support. This is Chloe. I understand you have a question about your Pro plan billing. How can I help you today?'"
  }
];

const VoiceSamples: React.FC = () => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Audio Playback State for static MP3 files
  const [playingSampleId, setPlayingSampleId] = useState<string | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Live Test State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const isLiveActiveRef = useRef(false);
  const [activeLiveId, setActiveLiveId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<{ role: 'user' | 'model', text: string, id?: string }[]>([]);
  
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const togglePlayStatic = (sample: Sample) => {
    // Stop live test if it is running
    if (isLiveActive || activeLiveId) {
      stopLiveTest();
    }

    if (playingSampleId === sample.id) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      setPlayingSampleId(null);
    } else {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      
      const audio = new Audio(sample.url);
      activeAudioRef.current = audio;
      setPlayingSampleId(sample.id);
      
      audio.onended = () => {
        setPlayingSampleId(null);
      };
      
      audio.onerror = () => {
        console.error("Failed to play pre-recorded sample:", sample.url);
        setPlayingSampleId(null);
      };
      
      audio.play().catch(err => {
        console.error("Audio playback error:", err);
        setPlayingSampleId(null);
      });
    }
  };

  const startLiveTest = async (sample: Sample) => {
    // Stop any static audio currently playing
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      setPlayingSampleId(null);
    }

    try {
      setIsConnecting(true);
      setActiveLiveId(sample.id);
      setIsLiveActive(true);
      isLiveActiveRef.current = true;
      setLiveTranscript([]);

      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const session = await geminiService.connectLive(sample.prompt, {
        onopen: () => {
          console.log("Live session opened");
          setIsConnecting(false);
          // Send an initial message to trigger the greeting using modern Live API method
          session.sendRealtimeInput({
            text: "Hello! I'm calling for assistance."
          });
        },
        onmessage: (message: any) => {
          // Handle audio output
          if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
            playAudioChunk(message.serverContent.modelTurn.parts[0].inlineData.data);
          }
          
          // Handle model transcription
          if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
            const text = message.serverContent.modelTurn.parts[0].text;
            setLiveTranscript(prev => [...prev.filter(m => m.id !== 'model-streaming'), { role: 'model', text }]);
          }

          // Handle streaming transcriptions
          if (message.serverContent?.outputAudioTranscription?.text) {
            const text = message.serverContent.outputAudioTranscription.text;
             setLiveTranscript(prev => {
               const filtered = prev.filter(m => m.id !== 'model-streaming');
               return [...filtered, { role: 'model', text, id: 'model-streaming' }];
             });
          }

          if (message.serverContent?.inputAudioTranscription?.text) {
            const text = message.serverContent.inputAudioTranscription.text;
            setLiveTranscript(prev => {
               const filtered = prev.filter(m => m.id !== 'user-streaming');
               return [...filtered, { role: 'user', text, id: 'user-streaming' }];
             });
          }

          if (message.serverContent?.interrupted) {
            nextStartTimeRef.current = 0;
          }
        },
        onerror: (err: any) => {
          console.error("Live session error:", err);
          stopLiveTest();
        },
        onclose: () => {
          console.log("Live session closed");
          stopLiveTest();
        }
      });

      liveSessionRef.current = session;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e: any) => {
        if (!session || !isLiveActiveRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        // Efficient binary to base64
        const bytes = new Uint8Array(pcmData.buffer);
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        
        try {
          session.sendRealtimeInput({
            audio: { data: btoa(binary), mimeType: 'audio/pcm;rate=16000' }
          });
        } catch (error) {
          console.error("Failed to send audio:", error);
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

    } catch (err) {
      console.error("Failed to start live test:", err);
      stopLiveTest();
    }
  };

  const stopLiveTest = () => {
    setIsLiveActive(false);
    isLiveActiveRef.current = false;
    setActiveLiveId(null);
    setIsConnecting(false);
    
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
    if (processorRef.current) {
       processorRef.current.disconnect();
       processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    nextStartTimeRef.current = 0;
  };

  const playAudioChunk = async (base64Data: string) => {
    if (!audioContextRef.current) return;
    try {
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const pcmLength = Math.floor(bytes.length / 2);
      const pcmData = new Int16Array(pcmLength);
      const dataView = new DataView(bytes.buffer);
      for (let i = 0; i < pcmLength; i++) {
        pcmData[i] = dataView.getInt16(i * 2, true);
      }
      const floatData = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        floatData[i] = pcmData[i] / 32768;
      }
      const audioBuffer = audioContextRef.current.createBuffer(1, floatData.length, 16000);
      audioBuffer.getChannelData(0).set(floatData);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      const currentTime = audioContextRef.current.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime + 0.05;
      }
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;
    } catch (err) {
      console.error("Error playing audio chunk:", err);
    }
  };

  useEffect(() => {
    return () => {
      stopLiveTest();
    };
  }, []);

  return (
    <section id="samples" className="py-16 px-6 bg-slate-900/40 border-y border-white/5">
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
            const isLoading = loadingId === sample.id;
            const isLive = activeLiveId === sample.id;
            
            return (
              <div 
                key={sample.id}
                className={`group relative p-8 rounded-3xl border transition-all duration-500 overflow-hidden ${
                  isLive 
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.1)]'
                    : 'bg-slate-900/60 border-white/5 hover:border-white/10 hover:bg-slate-900/80 shadow-2xl shadow-black/40'
                }`}
              >
                 {isLive && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                 )}

                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 rounded-2xl transition-all duration-300 ${
                    isLive ? 'bg-emerald-500 text-white' : 
                    'bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700'
                  }`}>
                    <Icon size={28} />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => togglePlayStatic(sample)}
                      className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                        playingSampleId === sample.id 
                          ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20 scale-105' 
                          : 'bg-white text-slate-950 hover:scale-110 shadow-xl'
                      }`}
                      title={playingSampleId === sample.id ? "Pause Sample" : "Play Sample"}
                    >
                      {playingSampleId === sample.id ? (
                        <Pause size={20} fill="currentColor" />
                      ) : (
                        <Play size={20} fill="currentColor" className="ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={() => isLive ? stopLiveTest() : startLiveTest(sample)}
                      disabled={isConnecting && activeLiveId !== sample.id}
                      className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 border-2 ${
                        isLive 
                          ? 'bg-emerald-500 border-emerald-500 text-white animate-pulse shadow-xl shadow-emerald-500/30' 
                          : isConnecting && activeLiveId === sample.id
                            ? 'bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white hover:scale-110'
                      }`}
                      title={isLive ? "End Conversation" : "Talk Live"}
                    >
                      {isLive ? <PhoneOff size={20} /> : <Mic size={20} />}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <h3 className={`text-2xl font-black mb-3 tracking-tight ${isLive ? 'text-emerald-400' : 'text-white'}`}>
                    {sample.industry}
                  </h3>
                  
                  {isLive ? (
                    <div className="space-y-4">
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 h-32 overflow-y-auto custom-scrollbar flex flex-col justify-end">
                        {isConnecting ? (
                           <div className="flex flex-col items-center justify-center h-full space-y-2">
                             <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Neural Link...</span>
                           </div>
                        ) : (
                          <div className="space-y-2">
                            {liveTranscript.slice(-2).map((msg, i) => (
                              <div key={i} className={`text-sm ${msg.role === 'model' ? 'text-white' : 'text-emerald-400'} font-medium animate-fade-in`}>
                                <span className="text-[10px] uppercase font-black mr-2 opacity-50">{msg.role === 'model' ? 'AI' : 'You'}</span>
                                {msg.text}
                              </div>
                            ))}
                            {liveTranscript.length === 0 && (
                               <p className="text-emerald-500/40 text-sm font-bold italic animate-pulse">Wait for greeting or speak now...</p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                         <div className="flex space-x-1 h-3 items-end">
                          {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8].map((delay) => (
                            <div 
                              key={delay}
                              className="w-1 bg-emerald-500 rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" 
                              style={{ animationDelay: `${delay}s`, height: `${Math.random() * 100}%` }}
                            ></div>
                          ))}
                        </div>
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] animate-pulse">Live Link Active</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                        {sample.scenario}
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-16 bg-gradient-to-br from-indigo-500/10 via-slate-900/80 to-emerald-500/10 rounded-[3rem] p-10 border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/5 mask-gradient-to-b pointer-events-none"></div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h4 className="text-2xl font-black text-white mb-3 tracking-tight flex items-center">
                <AlertCircle className="mr-3 text-indigo-500" size={24} />
                Try Our Latency-Free Pipeline
              </h4>
              <p className="text-slate-400 font-medium lowercase tracking-tighter text-lg leading-snug">
                Click the <span className="text-emerald-400 font-black">MIC icon</span> on any card to talk directly with that industry agent. No login required for preview. 
                Experience <span className="text-white underline decoration-indigo-500 underline-offset-4">sub-300ms</span> response times that feel truly human.
              </p>
            </div>
            <button className="px-10 py-5 bg-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all transform hover:-translate-y-1 active:scale-95 shadow-2xl shadow-indigo-600/20">
              Get Enterprise Access
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VoiceSamples;
