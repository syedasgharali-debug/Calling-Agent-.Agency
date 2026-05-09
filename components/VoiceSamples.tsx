import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, Mic2, Building2, Stethoscope, Utensils, Truck, Headset } from 'lucide-react';

interface Sample {
  id: string;
  industry: string;
  scenario: string;
  url: string;
  icon: any;
}

const samples: Sample[] = [
  {
    id: 'real-estate',
    industry: 'Real Estate',
    scenario: 'Booking a property viewing for a downtown loft.',
    url: 'https://cdn.openai.com/whisper/draft-20220913/samples/sample_0.mp3',
    icon: Building2
  },
  {
    id: 'healthcare',
    industry: 'Healthcare',
    scenario: 'Scheduling a follow-up appointment with a specialist.',
    url: 'https://cdn.openai.com/whisper/draft-20220913/samples/sample_1.mp3',
    icon: Stethoscope
  },
  {
    id: 'hospitality',
    industry: 'Hospitality',
    scenario: 'Making a dinner reservation and checking allergy options.',
    url: 'https://cdn.openai.com/whisper/draft-20220913/samples/sample_2.mp3',
    icon: Utensils
  },
  {
    id: 'logistics',
    industry: 'Logistics',
    scenario: 'Automated status check for an international shipment.',
    url: 'https://cdn.openai.com/whisper/draft-20220913/samples/sample_3.mp3',
    icon: Truck
  },
  {
    id: 'support',
    industry: 'Support',
    scenario: 'Resolving a billing inquiry for a SaaS subscription.',
    url: 'https://cdn.openai.com/whisper/draft-20220913/samples/sample_4.mp3',
    icon: Headset
  }
];

const VoiceSamples: React.FC = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = async (sample: Sample) => {
    try {
      // If clicking the currently playing one, stop it
      if (playingId === sample.id) {
        audioRef.current?.pause();
        setPlayingId(null);
        return;
      }

      // Stop any existing playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      setLoadingId(sample.id);
      
      const audio = new Audio(sample.url);
      audioRef.current = audio;

      // Add event listeners before calling play()
      audio.onplay = () => {
        setLoadingId(null);
        setPlayingId(sample.id);
      };

      audio.onended = () => {
        setPlayingId(null);
      };

      audio.onerror = (e) => {
        console.error("Audio Load Error:", e);
        setLoadingId(null);
        setPlayingId(null);
      };

      // Most browsers require a direct interaction for play()
      // Since this is in an onClick, it should be fine.
      await audio.play();

    } catch (error) {
      console.error("Playback failed:", error);
      setLoadingId(null);
      setPlayingId(null);
    }
  };

  return (
    <section id="samples" className="py-16 px-6 bg-slate-900/40 border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter">
            A <span className="text-indigo-500">Smarter</span> Way to Automate Calls
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Listen to our AI agents handle complex, real-world scenarios across various industries with uncanny human-like intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {samples.map((sample) => {
            const Icon = sample.icon;
            const isPlaying = playingId === sample.id;
            const isLoading = loadingId === sample.id;
            
            return (
              <div 
                key={sample.id}
                className={`group relative p-6 rounded-2xl border transition-all duration-300 ${
                  isPlaying 
                    ? 'bg-indigo-500/10 border-indigo-500/40 shadow-[0_0_30px_rgba(99,102,241,0.15)]' 
                    : 'bg-slate-900/60 border-white/5 hover:border-white/10 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${isPlaying ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700 transition-colors'}`}>
                    <Icon size={24} />
                  </div>
                  <button
                    onClick={() => togglePlay(sample)}
                    disabled={isLoading}
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                      isPlaying 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : isLoading
                          ? 'bg-slate-700 text-white cursor-not-allowed'
                          : 'bg-white text-slate-950 hover:scale-110 shadow-lg'
                    }`}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : isPlaying ? (
                      <Pause size={20} fill="currentColor" />
                    ) : (
                      <Play size={20} fill="currentColor" className="ml-1" />
                    )}
                  </button>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{sample.industry}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    {sample.scenario}
                  </p>
                  
                  {isPlaying && (
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1 h-3 items-end">
                        {[0.1, 0.2, 0.3, 0.4, 0.5].map((delay) => (
                          <div 
                            key={delay}
                            className="w-1 bg-indigo-500 rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" 
                            style={{ animationDelay: `${delay}s` }}
                          ></div>
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest animate-pulse">Live Playback</span>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-2 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Mic2 size={16} className="text-slate-700" />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-16 bg-gradient-to-r from-indigo-500/5 via-indigo-500/10 to-indigo-500/5 rounded-3xl p-8 border border-indigo-500/10 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h4 className="text-xl font-bold text-white mb-2 flex items-center">
              <Volume2 className="mr-2 text-indigo-500" size={20} />
              Latency-Free Conversations
            </h4>
            <p className="text-slate-400">Our agents respond in under 300ms, beating human reaction times for a truly fluid experience.</p>
          </div>
          <button className="px-8 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all transform hover:-translate-y-0.5 active:scale-95">
            Book a Demo
          </button>
        </div>
      </div>
    </section>
  );
};

export default VoiceSamples;
