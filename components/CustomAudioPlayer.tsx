import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Download } from 'lucide-react';
import { motion } from 'motion/react';

interface CustomAudioPlayerProps {
  src: string;
  voiceId: string;
  voiceName: string;
  theme: 'light' | 'dark';
  activePlayingId: string | null;
  setActivePlayingId: (id: string | null) => void;
}

export const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({
  src,
  voiceId,
  voiceName,
  theme,
  activePlayingId,
  setActivePlayingId,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Generate simulated waveform bars for a cool aesthetic look
  useEffect(() => {
    const barsCount = 35;
    const bars = Array.from({ length: barsCount }, () => 15 + Math.random() * 85);
    setWaveformData(bars);
  }, [src]);

  // Handle external synchronization
  useEffect(() => {
    if (activePlayingId !== voiceId && isPlaying) {
      pauseAudio();
    }
  }, [activePlayingId]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const playAudio = () => {
    if (audioRef.current) {
      setActivePlayingId(voiceId);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Audio playback failed:", err);
        });
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (activePlayingId === voiceId) {
      setActivePlayingId(null);
    }
  };

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      audioRef.current.muted = vol === 0;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMute = !isMuted;
      setIsMuted(nextMute);
      audioRef.current.muted = nextMute;
      if (!nextMute && volume === 0) {
        setVolume(0.5);
        audioRef.current.volume = 0.5;
      }
    }
  };

  const handleSpeedChange = () => {
    const speeds = [1, 1.25, 1.5, 2, 0.75];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const resetPlayback = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (!src) return;
    const link = document.createElement('a');
    link.href = src;
    link.download = `${voiceName.replace(/\s+/g, '_')}_clone_sample.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`p-4 rounded-3xl border transition-all ${
      theme === 'dark'
        ? 'bg-slate-950/80 border-white/5 shadow-inner'
        : 'bg-slate-50 border-slate-100 shadow-inner'
    }`}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      {/* Waveform Visualization Overlay */}
      <div className="flex items-end justify-between h-8 px-2 mb-3 gap-[2px]">
        {waveformData.map((height, i) => {
          const progressPercent = duration ? (currentTime / duration) * 100 : 0;
          const barPercent = (i / waveformData.length) * 100;
          const isPlayed = barPercent <= progressPercent;
          
          return (
            <div
              key={i}
              className={`flex-1 rounded-full transition-all ${
                isPlayed
                  ? 'bg-indigo-500'
                  : theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'
              } ${isPlaying && isPlayed ? 'animate-pulse' : ''}`}
              style={{
                height: `${height}%`,
                opacity: isPlayed ? 1 : 0.6,
                transform: isPlaying && isPlayed ? `scaleY(${1 + Math.sin(currentTime * 10 + i) * 0.15})` : 'scaleY(1)',
              }}
            />
          );
        })}
      </div>

      {/* Scrub bar / Range Slider */}
      <div className="relative group mb-3">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleScrubChange}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-600 bg-slate-200 dark:bg-slate-800 focus:outline-none transition-all"
        />
      </div>

      {/* Main Controls Row */}
      <div className="flex items-center justify-between gap-4">
        {/* Play/Pause & reset */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={togglePlay}
            className={`p-2.5 rounded-2xl text-white transition-all transform hover:scale-105 active:scale-95 shadow-md ${
              isPlaying
                ? 'bg-rose-500 shadow-rose-500/10'
                : 'bg-indigo-600 shadow-indigo-600/10 hover:bg-indigo-500'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <button
            type="button"
            onClick={resetPlayback}
            className={`p-2 rounded-xl transition-all ${
              theme === 'dark'
                ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
            }`}
            title="Restart"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Timestamps */}
        <div className="text-[10px] font-mono font-bold text-slate-500">
          <span>{formatTime(currentTime)}</span>
          <span className="mx-1">/</span>
          <span>{formatTime(duration || 12)}</span>
        </div>

        {/* Speed button & Volume controls */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleSpeedChange}
            className={`px-2 py-1 text-[9px] font-mono font-black uppercase rounded-lg border transition-all ${
              theme === 'dark'
                ? 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                : 'border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Change Playback Speed"
          >
            {playbackRate}x
          </button>

          <div className="flex items-center space-x-1.5 group/volume">
            <button
              type="button"
              onClick={toggleMute}
              className={`p-1.5 rounded-lg transition-all ${
                theme === 'dark'
                  ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-12 h-1 rounded-lg appearance-none cursor-pointer accent-indigo-500 bg-slate-200 dark:bg-slate-800 focus:outline-none transition-all opacity-40 group-hover/volume:opacity-100"
            />
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className={`p-1.5 rounded-lg transition-all ${
              theme === 'dark'
                ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title="Download Audio Sample"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
