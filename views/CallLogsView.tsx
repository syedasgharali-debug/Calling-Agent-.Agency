import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Clock, 
  DollarSign, 
  Smile, 
  Phone, 
  Play, 
  Pause, 
  Download, 
  Calendar, 
  ChevronRight, 
  User, 
  FileText, 
  Activity,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { getCallLogs } from '../services/firebaseService';

interface CallLog {
  id: string;
  userId: string;
  caller: string;
  agent: string;
  duration: string;
  cost: number;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  timestamp: any;
  outcome: string;
  transcript?: string;
  sentimentAnalysis?: string;
}

interface CallLogsViewProps {
  userId: string;
  isAdmin: boolean;
  theme: 'dark' | 'light';
}

export const CallLogsView: React.FC<CallLogsViewProps> = ({ userId, isAdmin, theme }) => {
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<'All' | 'Positive' | 'Neutral' | 'Negative'>('All');
  const [agentFilter, setAgentFilter] = useState<string>('All');
  const [selectedLog, setSelectedLog] = useState<CallLog | null>(null);
  
  // Audio Player Simulation States
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const fetched = await getCallLogs(userId, isAdmin);
        if (active && fetched) {
          setLogs(fetched as CallLog[]);
        }
      } catch (e) {
        console.error("Failed to load call logs:", e);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchLogs();
    return () => {
      active = false;
    };
  }, [userId, isAdmin]);

  // Audio Player simulation interval
  useEffect(() => {
    let interval: any;
    if (playingId) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setPlayingId(null);
            return 0;
          }
          return prev + 2;
        });
      }, 300);
    } else {
      setAudioProgress(0);
    }
    return () => clearInterval(interval);
  }, [playingId]);

  const handlePlayToggle = (logId: string) => {
    if (playingId === logId) {
      setPlayingId(null);
    } else {
      setPlayingId(logId);
      setAudioProgress(0);
    }
  };

  const uniqueAgents = useMemo(() => {
    const list = new Set<string>();
    logs.forEach(l => list.add(l.agent));
    return ['All', ...Array.from(list)];
  }, [logs]);

  // Format timestamp helper
  const formatTimestamp = (val: any) => {
    if (!val) return 'Recently';
    if (val.seconds) {
      return new Date(val.seconds * 1000).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
    return new Date(val).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Filter & Search Log Lists
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.caller.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.agent.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.outcome.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSentiment = sentimentFilter === 'All' || log.sentiment === sentimentFilter;
      const matchesAgent = agentFilter === 'All' || log.agent === agentFilter;

      return matchesSearch && matchesSentiment && matchesAgent;
    });
  }, [logs, searchTerm, sentimentFilter, agentFilter]);

  // Statistics Computations
  const stats = useMemo(() => {
    const total = filteredLogs.length;
    let totalCost = 0;
    let positiveCount = 0;
    let totalSecs = 0;

    filteredLogs.forEach(l => {
      totalCost += l.cost || 0;
      if (l.sentiment === 'Positive') positiveCount++;
      
      // Parse duration like "2m 14s" or "45s" to seconds
      const dur = l.duration || '0s';
      let secs = 0;
      const mMatch = dur.match(/(\d+)m/);
      const sMatch = dur.match(/(\d+)s/);
      if (mMatch) secs += parseInt(mMatch[1]) * 60;
      if (sMatch) secs += parseInt(sMatch[1]);
      totalSecs += secs;
    });

    const avgSecs = total > 0 ? Math.round(totalSecs / total) : 0;
    const avgMin = Math.floor(avgSecs / 60);
    const avgSec = avgSecs % 60;
    const avgDurationStr = avgSecs > 0 ? `${avgMin}m ${avgSec}s` : '0s';
    
    const sentimentRate = total > 0 ? Math.round((positiveCount / total) * 100) : 0;

    return {
      total,
      totalCost: totalCost.toFixed(2),
      avgDurationStr,
      sentimentRate
    };
  }, [filteredLogs]);

  const exportCSV = () => {
    const headers = ['Call ID', 'Caller', 'Agent', 'Duration', 'Cost (USD)', 'Sentiment', 'Timestamp', 'Outcome'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.caller,
      l.agent,
      l.duration,
      l.cost,
      l.sentiment,
      formatTimestamp(l.timestamp),
      l.outcome
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `callingagent_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Call Analytics Logs
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Real-time audit history, costs, and customer sentiments across all agents.
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={filteredLogs.length === 0}
          className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-xs font-black tracking-wide uppercase transition-all shadow-md active:scale-95 ${
            theme === 'dark' 
              ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-900/20' 
              : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10'
          } disabled:opacity-50 disabled:pointer-events-none`}
        >
          <Download className="w-4 h-4" />
          <span>Export logs CSV</span>
        </button>
      </div>

      {/* Metrics Dashboard Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Agent Calls",
            value: stats.total,
            desc: "Active monitored sessions",
            icon: Phone,
            color: "text-indigo-500 bg-indigo-500/10"
          },
          {
            title: "Accumulated Cost",
            value: `$${stats.totalCost}`,
            desc: "Minutes consumption spend",
            icon: DollarSign,
            color: "text-amber-500 bg-amber-500/10"
          },
          {
            title: "Average Duration",
            value: stats.avgDurationStr,
            desc: "Hold and solution cycles",
            icon: Clock,
            color: "text-sky-500 bg-sky-500/10"
          },
          {
            title: "Positive Sentiment",
            value: `${stats.sentimentRate}%`,
            desc: "User engagement level",
            icon: Smile,
            color: "text-emerald-500 bg-emerald-500/10"
          }
        ].map((item, idx) => (
          <div
            key={idx}
            className={`border rounded-3xl p-6 transition-all relative overflow-hidden ${
              theme === 'dark' 
                ? 'bg-slate-900/40 border-white/5 shadow-xl' 
                : 'bg-white border-slate-100 shadow-lg'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                  {item.title}
                </span>
                <p className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {item.value}
                </p>
                <span className="text-[11px] font-bold text-slate-500 block">
                  {item.desc}
                </span>
              </div>
              <div className={`p-3 rounded-2xl ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table and Control Board */}
      <div className={`border rounded-[2.5rem] overflow-hidden transition-all ${
        theme === 'dark' ? 'bg-slate-900/30 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
      }`}>
        {/* Filter Toolbar */}
        <div className={`p-6 border-b flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center ${
          theme === 'dark' ? 'border-white/5 bg-slate-900/40' : 'border-slate-100 bg-slate-50/50'
        }`}>
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by Caller ID, Agent, or Outcome..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all font-bold border ${
                theme === 'dark' 
                  ? 'bg-slate-950 border-white/10 text-white placeholder-slate-600' 
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Selector filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Agent:</span>
              <select
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border focus:outline-none ${
                  theme === 'dark' 
                    ? 'bg-slate-950 border-white/10 text-white' 
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                {uniqueAgents.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Sentiment:</span>
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border focus:outline-none ${
                  theme === 'dark' 
                    ? 'bg-slate-950 border-white/10 text-white' 
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <option value="All">All Sentiments</option>
                <option value="Positive">Positive</option>
                <option value="Neutral">Neutral</option>
                <option value="Negative">Negative</option>
              </select>
            </div>
          </div>
        </div>

        {/* Call Logs Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm font-bold text-slate-500">Fetching secured cloud records...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-24 text-center space-y-3">
              <div className="p-4 bg-slate-500/10 w-fit rounded-full mx-auto text-slate-500">
                <Phone className="w-8 h-8" />
              </div>
              <h3 className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>No call logs found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No telemetry data matched your current search parameters or active filters.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm min-w-[850px]">
              <thead className={`text-[10px] font-black uppercase tracking-widest text-slate-500 ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                <tr>
                  <th className="px-8 py-5">Call ID / Caller</th>
                  <th className="px-8 py-5">Agent Name</th>
                  <th className="px-8 py-5">Hold Time</th>
                  <th className="px-8 py-5">Session Cost</th>
                  <th className="px-8 py-5">Sentiment</th>
                  <th className="px-8 py-5">Outcome</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-100'}`}>
                {filteredLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    onClick={() => setSelectedLog(log)}
                    className={`group transition-colors cursor-pointer ${
                      selectedLog?.id === log.id 
                        ? theme === 'dark' ? 'bg-violet-950/20' : 'bg-violet-50/50'
                        : theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className={`font-mono font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          {log.caller}
                        </span>
                        <span className="text-[10px] font-black text-slate-500 uppercase mt-1">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse"></div>
                        <span className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                          {log.agent}
                        </span>
                      </div>
                    </td>
                    <td className={`px-8 py-6 font-mono font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      {log.duration}
                    </td>
                    <td className={`px-8 py-6 font-mono font-bold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
                      ${log.cost?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase inline-flex items-center space-x-1.5 ${
                        log.sentiment === 'Positive' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : log.sentiment === 'Negative' 
                            ? 'bg-rose-500/10 text-rose-400' 
                            : 'bg-indigo-500/10 text-indigo-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          log.sentiment === 'Positive' ? 'bg-emerald-400' : log.sentiment === 'Negative' ? 'bg-rose-400' : 'bg-indigo-400'
                        }`} />
                        <span>{log.sentiment}</span>
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className={`font-medium max-w-xs truncate ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                        {log.outcome}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end items-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayToggle(log.id);
                          }}
                          className={`p-2.5 rounded-xl transition-all ${
                            playingId === log.id
                              ? 'bg-rose-500/10 text-rose-400'
                              : theme === 'dark'
                                ? 'bg-white/5 hover:bg-white/10 text-slate-300'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          {playingId === log.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <ChevronRight className={`w-5 h-5 transition-transform ${
                          selectedLog?.id === log.id ? 'translate-x-1 text-violet-500' : 'text-slate-500 group-hover:translate-x-0.5'
                        }`} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-out Interactive Call Detail Drawer */}
      <AnimatePresence>
        {selectedLog && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
              className="fixed inset-0 bg-black z-40 cursor-pointer"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 150 }}
              className={`fixed top-0 right-0 h-screen w-full sm:w-[550px] z-50 flex flex-col shadow-2xl border-l transition-colors ${
                theme === 'dark' ? 'bg-slate-950 border-white/5' : 'bg-white border-slate-100'
              }`}
            >
              {/* Drawer Header */}
              <div className={`p-8 border-b flex justify-between items-center ${
                theme === 'dark' ? 'border-white/5 bg-slate-900/20' : 'border-slate-100 bg-slate-50/50'
              }`}>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-violet-500 bg-violet-500/10 px-2.5 py-1 rounded-full">
                    Telemetry Dispatch
                  </span>
                  <h3 className={`text-xl font-black mt-2 font-mono ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {selectedLog.caller}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 mt-1">
                    Logged {formatTimestamp(selectedLog.timestamp)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    theme === 'dark' ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                  }`}
                >
                  Close
                </button>
              </div>

              {/* Drawer Content Scroll Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Simulated Audio Player */}
                <div className={`border rounded-3xl p-6 relative overflow-hidden ${
                  theme === 'dark' ? 'bg-slate-900/50 border-white/5' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handlePlayToggle(selectedLog.id)}
                      className={`p-4 rounded-2xl flex items-center justify-center transition-all ${
                        playingId === selectedLog.id
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                          : 'bg-violet-600 text-white shadow-lg shadow-violet-600/20 hover:scale-105'
                      }`}
                    >
                      {playingId === selectedLog.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-black uppercase tracking-wide ${
                          playingId === selectedLog.id ? 'text-rose-400' : 'text-slate-500'
                        }`}>
                          {playingId === selectedLog.id ? 'Playing voice log' : 'Voice call recording'}
                        </span>
                        <span className="text-xs font-bold text-slate-500 font-mono">
                          {playingId === selectedLog.id ? `${Math.round(audioProgress / 100 * 120)}s` : selectedLog.duration}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-700/20 overflow-hidden relative">
                        <div 
                          className="h-full bg-violet-500 transition-all duration-300"
                          style={{ width: `${playingId === selectedLog.id ? audioProgress : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/20 border-white/5' : 'bg-slate-50/50 border-slate-100'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Agent Operator</span>
                    <span className={`text-sm font-bold mt-1 block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {selectedLog.agent}
                    </span>
                  </div>
                  <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/20 border-white/5' : 'bg-slate-50/50 border-slate-100'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Session Cost</span>
                    <span className="text-sm font-black font-mono mt-1 text-amber-500 block">
                      ${selectedLog.cost?.toFixed(2)}
                    </span>
                  </div>
                  <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/20 border-white/5' : 'bg-slate-50/50 border-slate-100'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Talk Duration</span>
                    <span className={`text-sm font-bold font-mono mt-1 block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {selectedLog.duration}
                    </span>
                  </div>
                  <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/20 border-white/5' : 'bg-slate-50/50 border-slate-100'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Sentiment</span>
                    <span className={`text-xs font-black uppercase tracking-wider mt-1.5 inline-block ${
                      selectedLog.sentiment === 'Positive' ? 'text-emerald-400' : selectedLog.sentiment === 'Negative' ? 'text-rose-400' : 'text-indigo-400'
                    }`}>
                      {selectedLog.sentiment}
                    </span>
                  </div>
                </div>

                {/* AI Sentiment Analysis Block */}
                {selectedLog.sentimentAnalysis && (
                  <div className={`p-6 rounded-3xl space-y-3 border ${
                    theme === 'dark' ? 'bg-violet-950/10 border-violet-500/20' : 'bg-violet-50/20 border-violet-100'
                  }`}>
                    <div className="flex items-center space-x-2 text-violet-500">
                      <Sparkles className="w-5 h-5" />
                      <h4 className="text-xs font-black uppercase tracking-wider">AI Sentiment Assessment</h4>
                    </div>
                    <p className={`text-xs leading-relaxed font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      {selectedLog.sentimentAnalysis}
                    </p>
                  </div>
                )}

                {/* Final Outcome Block */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Call Resolution</h4>
                  <div className={`p-5 rounded-2xl border ${
                    theme === 'dark' ? 'bg-slate-900/20 border-white/5 text-white' : 'bg-slate-50/50 border-slate-100 text-slate-900'
                  } text-xs font-bold font-mono`}>
                    {selectedLog.outcome}
                  </div>
                </div>

                {/* Conversation Transcript */}
                {selectedLog.transcript && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-slate-500 border-b border-dashed pb-2">
                      <FileText className="w-4 h-4" />
                      <h4 className="text-xs font-black uppercase tracking-wider">Conversation Transcript</h4>
                    </div>
                    <div className="space-y-4 font-sans text-xs">
                      {selectedLog.transcript.split('\n').map((line, idx) => {
                        const isAgent = line.startsWith(selectedLog.agent.split(' ')[0] + ':') || line.startsWith('Sarah:') || line.startsWith('Chloe:') || line.startsWith('David:') || line.startsWith('John:');
                        return (
                          <div 
                            key={idx}
                            className={`flex flex-col p-4 rounded-2xl border ${
                              isAgent 
                                ? theme === 'dark' 
                                  ? 'bg-slate-900/40 border-white/5 self-start mr-8' 
                                  : 'bg-slate-50 border-slate-100 self-start mr-8'
                                : theme === 'dark'
                                  ? 'bg-violet-950/10 border-violet-500/10 self-end ml-8'
                                  : 'bg-violet-50/30 border-violet-100 self-end ml-8'
                            }`}
                          >
                            <span className={`text-[10px] font-black uppercase tracking-wider mb-1 ${
                              isAgent ? 'text-violet-500' : 'text-slate-500'
                            }`}>
                              {isAgent ? selectedLog.agent : 'Caller'}
                            </span>
                            <p className={`font-medium leading-relaxed ${
                              theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                            }`}>
                              {line.substring(line.indexOf(':') + 1).trim()}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
