
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserRole, Plan, Coupon, Blog } from '../App';
import { 
  Mic, 
  Users, 
  BarChart3, 
  CreditCard, 
  LogOut, 
  Plus, 
  Settings, 
  History, 
  Play, 
  Pause, 
  Trash2, 
  Search,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Phone,
  PhoneOff,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  DollarSign,
  Ticket,
  Layout,
  Tag,
  FileText,
  Edit3,
  Save,
  X,
  ChevronRight,
  User,
  Camera,
  Lock,
  Building2,
  Sun,
  Moon
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../services/geminiService';
import Markdown from 'react-markdown';
import Vapi from '@vapi-ai/web';

interface DashboardViewProps {
  user: { email: string; role: UserRole; plan?: string; name?: string; profilePic?: string };
  isAdmin: boolean;
  isImpersonating: boolean;
  onLogout: () => void;
  onUpdateUser: (updates: any) => void;
  onImpersonate: (email: string) => void;
  onStopImpersonating: () => void;
  plans: Plan[];
  setPlans: React.Dispatch<React.SetStateAction<Plan[]>>;
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  blogs: Blog[];
  setBlogs: React.Dispatch<React.SetStateAction<Blog[]>>;
}

interface Agent {
  id: string;
  name: string;
  voice: string;
  gender?: 'Male' | 'Female' | 'Neutral';
  pitch?: number;
  speed?: number;
  status: 'Active' | 'Paused';
  calls: number;
  logic: string;
  prompt: string;
  provider?: 'CallingAgent' | 'Vapi';
  vapiAssistantId?: string;
}

interface Call {
  id: string;
  caller: string;
  agent: string;
  duration: string;
  outcome: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  timestamp: string;
  transcript?: string;
  sentimentAnalysis?: string;
}

interface Ticket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
  replies: { role: 'user' | 'admin', message: string, timestamp: string }[];
}

interface EnterpriseRequest {
  id: string;
  userId: string;
  userEmail: string;
  companyName: string;
  monthlyVolume: string;
  needs: string;
  status: 'Pending' | 'Reviewing' | 'Responded' | 'Closed';
  createdAt: string;
  adminResponse?: string;
}

interface Number {
  id: string;
  number: string;
  agentId: string;
  status: 'Active' | 'Paused' | 'Pending';
  location: string;
  type: 'sandbox' | 'real' | 'custom';
}

const VOICES = [
  { id: 'Puck', name: 'Puck', gender: 'Male', engine: 'Gemini Native', description: 'Youthful and energetic' },
  { id: 'Charon', name: 'Charon', gender: 'Male', engine: 'Gemini Native', description: 'Deep and professional' },
  { id: 'Kore', name: 'Kore', gender: 'Female', engine: 'Gemini Native', description: 'Calm and helpful' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Male', engine: 'Gemini Native', description: 'Authoritative and bold' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Neutral', engine: 'Gemini Native', description: 'Friendly and modern' },
  { id: 'Aria', name: 'Aria', gender: 'Female', engine: 'ElevenLabs', description: 'Soft and expressive' },
  { id: 'Marcus', name: 'Marcus', gender: 'Male', engine: 'ElevenLabs', description: 'Warm and trustworthy' },
  { id: 'S1', name: 'Sonic-1', gender: 'Male', engine: 'Cartesia', description: 'Ultra-low latency' },
];

const DashboardView: React.FC<DashboardViewProps> = ({ 
  user, 
  isAdmin, 
  isImpersonating, 
  onLogout, 
  onUpdateUser,
  onImpersonate, 
  onStopImpersonating,
  plans,
  setPlans,
  coupons,
  setCoupons,
  blogs,
  setBlogs
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'analytics' | 'billing' | 'logs' | 'numbers' | 'integrations' | 'users' | 'invoices' | 'support' | 'tickets' | 'admin-plans' | 'admin-coupons' | 'admin-blogs' | 'profile' | 'enterprise'>('overview');
  const [currentPlan, setCurrentPlan] = useState<Plan>(plans.find(p => p.name === user.plan) || plans[0]);
  const [isBillingYearly, setIsBillingYearly] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planMinutes, setPlanMinutes] = useState(0);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToBill, setUserToBill] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [billAmount, setBillAmount] = useState('10.00');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'Medium' as 'Low' | 'Medium' | 'High' });
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketReply, setTicketReply] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'customer' | 'admin'>('customer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('dashboard-theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('dashboard-theme', theme);
  }, [theme]);

  const handleSaveConfig = (key: string, value: string, secondaryKeys?: {[key: string]: string}) => {
    localStorage.setItem(key, value);
    if (secondaryKeys) {
      Object.entries(secondaryKeys).forEach(([k, v]) => localStorage.setItem(k, v));
    }
    setSaveFeedback(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setSaveFeedback(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const [enterpriseRequests, setEnterpriseRequests] = useState<EnterpriseRequest[]>([
    { 
      id: 'er1', 
      userId: 'u1', 
      userEmail: 'customer1@example.com', 
      companyName: 'TechCorp Inc.', 
      monthlyVolume: '50,000+', 
      needs: 'Custom integration with Salesforce and high-availability voice agents.', 
      status: 'Reviewing', 
      createdAt: '2024-03-15 09:00' 
    }
  ]);
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const [newEnterpriseRequest, setNewEnterpriseRequest] = useState({ companyName: '', monthlyVolume: '', needs: '' });
  const [selectedEnterpriseRequest, setSelectedEnterpriseRequest] = useState<EnterpriseRequest | null>(null);
  const [enterpriseResponse, setEnterpriseResponse] = useState('');

  useEffect(() => {
    if (showPlanModal) {
      setPlanMinutes(editingPlan?.mins || 0);
    }
  }, [showPlanModal, editingPlan]);

  const calculatePrice = (mins: number) => (mins * 0.45).toFixed(2);
  const calculateYearlyPrice = (mins: number) => (mins * 0.45 * 12 * 0.8).toFixed(2); // 20% discount

  // Profile State
  const [profileName, setProfileName] = useState(user.name || '');
  const [profilePic, setProfilePic] = useState(user.profilePic || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{[key: string]: boolean}>({});
  const [showConnectNumber, setShowConnectNumber] = useState(false);
  const [showPaymentSelectionModal, setShowPaymentSelectionModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<any>(null);
  const [showOutboundModal, setShowOutboundModal] = useState(false);
  const [showCallDetailsModal, setShowCallDetailsModal] = useState(false);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [outboundNumber, setOutboundNumber] = useState('');
  const [outboundAgentId, setOutboundAgentId] = useState('');
  const [vapiApiKey, setVapiApiKey] = useState(localStorage.getItem('vapi_api_key') || '');
  const [twilioSid, setTwilioSid] = useState(localStorage.getItem('twilio_sid') || '');
  const [twilioToken, setTwilioToken] = useState(localStorage.getItem('twilio_token') || '');
  const [twilioNumber, setTwilioNumber] = useState(localStorage.getItem('twilio_number') || '');
  const [stripeApiKey, setStripeApiKey] = useState(localStorage.getItem('stripe_api_key') || '');
  const [paypalClientId, setPaypalClientId] = useState(localStorage.getItem('paypal_client_id') || '');
  const [paypalSecret, setPaypalSecret] = useState(localStorage.getItem('paypal_secret') || '');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [testChat, setTestChat] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);
  const [testInput, setTestInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCallPaused, setIsCallPaused] = useState(false);
  const isCallPausedRef = React.useRef(false);

  useEffect(() => {
    isCallPausedRef.current = isCallPaused;
  }, [isCallPaused]);

  const [liveSession, setLiveSession] = useState<any>(null);
  const liveSessionRef = React.useRef<any>(null);
  const selectedAgentRef = React.useRef<Agent | null>(null);
  
  useEffect(() => {
    liveSessionRef.current = liveSession;
  }, [liveSession]);

  useEffect(() => {
    selectedAgentRef.current = selectedAgent;
  }, [selectedAgent]);
  const [vapiInstance, setVapiInstance] = useState<any>(null);
  const [activeStreamSid, setActiveStreamSid] = useState<string | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const processorRef = React.useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = React.useRef<number>(0);
  const relayWsRef = React.useRef<WebSocket | null>(null);

  // Real State
  const [agents, setAgents] = useState<Agent[]>([
    { id: '1', name: 'Dr. Smith Scheduler', voice: 'Charon', gender: 'Male', pitch: 1.0, speed: 1.0, status: 'Active', calls: 412, logic: 'Make.com Hook', prompt: 'You are a medical scheduler for Dr. Smith. Your goal is to book appointments... Be polite and professional.', provider: 'CallingAgent' },
    { id: '2', name: 'Real Estate Lead Gen', voice: 'Aria', gender: 'Female', pitch: 1.0, speed: 1.0, status: 'Active', calls: 892, logic: 'FastAPI Agent', prompt: 'You are a real estate assistant. Qualify leads by asking about their budget and timeline. Be persuasive but helpful.', provider: 'CallingAgent' },
    { id: '3', name: 'After-Hours Support', voice: 'Kore', gender: 'Female', pitch: 1.1, speed: 0.9, status: 'Paused', calls: 124, logic: 'Static Script', prompt: 'You handle support calls after 6 PM. Take messages if you cannot solve the issue. Always ask for a callback number.', provider: 'CallingAgent' },
  ]);

  const [numbers, setNumbers] = useState<Number[]>([
    { id: '1', number: '+1 (888) 123-4567', agentId: '1', status: 'Active', location: 'Sandbox (Shared)', type: 'sandbox' },
    { id: '2', number: '+1 (555) 987-6543', agentId: '2', status: 'Active', location: 'London, UK', type: 'real' },
  ]);

  const [provisionTab, setProvisionTab] = useState<'sandbox' | 'buy' | 'custom'>('sandbox');
  const [selectedRegion, setSelectedRegion] = useState('US');
  const [provisioningAgentId, setProvisioningAgentId] = useState('');

  const [calls, setCalls] = useState<Call[]>([
    { 
      id: 'c1', 
      caller: '+1 (555) 012-3456', 
      agent: 'Dr. Smith Scheduler', 
      duration: '4m 12s', 
      outcome: 'Booked', 
      sentiment: 'Positive', 
      timestamp: '2 mins ago',
      transcript: "Agent: Hello, this is Dr. Smith's office. How can I help you?\nCaller: Hi, I'd like to book an appointment for next week.\nAgent: Certainly! We have an opening on Tuesday at 10 AM. Does that work for you?\nCaller: Yes, that's perfect. My name is John Doe.\nAgent: Great, John. I've booked you in for Tuesday at 10 AM. We'll see you then.\nCaller: Thank you, goodbye.\nAgent: Goodbye, have a great day!",
      sentimentAnalysis: "The caller was polite and appreciative. The agent provided efficient service and successfully booked the appointment. Overall sentiment is highly positive with clear resolution."
    },
    { id: 'c2', caller: '+1 (555) 098-7654', agent: 'After-Hours Support', duration: '1m 22s', outcome: 'Resolved', sentiment: 'Neutral', timestamp: '15 mins ago' },
    { id: 'c3', caller: '+1 (555) 234-5678', agent: 'Real Estate Lead Gen', duration: '8m 45s', outcome: 'Inquiry', sentiment: 'Positive', timestamp: '1 hour ago' },
    { id: 'c4', caller: '+1 (555) 555-0001', agent: 'Dr. Smith Scheduler', duration: '2m 10s', outcome: 'Cancelled', sentiment: 'Negative', timestamp: '3 hours ago' },
  ]);

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (activeTab === 'users' && isAdmin) {
      const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
          const { getAllUsers } = await import('../services/firebaseService');
          const users = await getAllUsers();
          if (users) setAllUsers(users);
        } catch (error) {
          console.error("Failed to fetch users:", error);
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [activeTab, isAdmin]);

  const [invoices, setInvoices] = useState([
    { id: 'inv_1', user: 'customer1@example.com', amount: 250.00, status: 'Paid', date: '2024-03-01' },
    { id: 'inv_2', user: 'customer2@example.com', amount: 100.00, status: 'Pending', date: '2024-03-15' },
    { id: 'inv_3', user: 'customer2@example.com', amount: 50.00, status: 'Paid', date: '2024-02-01' },
  ]);

  const [tickets, setTickets] = useState<Ticket[]>([
    { 
      id: 't1', 
      userId: 'u1', 
      userEmail: 'customer1@example.com', 
      subject: 'Call quality issue', 
      description: 'I am hearing a lot of static during calls.', 
      status: 'Open', 
      priority: 'High', 
      createdAt: '2024-03-20 10:00',
      replies: []
    },
    { 
      id: 't2', 
      userId: 'u2', 
      userEmail: 'customer2@example.com', 
      subject: 'Billing question', 
      description: 'Why was I charged twice this month?', 
      status: 'Resolved', 
      priority: 'Medium', 
      createdAt: '2024-03-18 14:30',
      replies: [
        { role: 'admin', message: 'We have refunded the duplicate charge.', timestamp: '2024-03-19 09:00' }
      ]
    }
  ]);

  const [newAgent, setNewAgent] = useState({
    name: '',
    voice: 'Puck',
    gender: 'Male' as 'Male' | 'Female' | 'Neutral',
    pitch: 1.0,
    speed: 1.0,
    logic: 'CallingAgent Orchestrator',
    prompt: '',
    provider: 'CallingAgent' as 'CallingAgent' | 'Vapi',
    vapiAssistantId: ''
  });

  const [selectedAdminMetric, setSelectedAdminMetric] = useState<'revenue' | 'users' | 'usage'>('revenue');
  const [selectedUserMetric, setSelectedUserMetric] = useState<'minutes' | 'latency' | 'spend'>('minutes');

  // Realistic Chart Data Generation
  const chartData = useMemo(() => {
    const data = [];
    let baseRevenue = 450;
    let baseCalls = 15;
    let baseUsers = 1200;
    let baseUsage = 120000;
    let baseSpend = 5;
    
    for (let i = 0; i < 24; i++) {
      // Simulate daily cycle (peak hours 9 AM - 6 PM)
      const hour = i;
      const isPeak = hour >= 9 && hour <= 18;
      const peakMultiplier = isPeak ? 1.5 + Math.random() * 0.5 : 0.7 + Math.random() * 0.3;
      
      // Add a slight upward trend over the 24h period for "growth" feel
      const trendFactor = 1 + (i * 0.01); 
      
      const calls = Math.floor(baseCalls * peakMultiplier * trendFactor);
      const revenue = Math.floor(baseRevenue * peakMultiplier * trendFactor);
      const users = Math.floor(baseUsers + (i * 3) + Math.random() * 5);
      const usage = Math.floor(baseUsage / 24 * peakMultiplier * trendFactor);
      const latency = Math.floor(140 + Math.random() * 20 - (isPeak ? 10 : 0)); 
      const spend = Math.floor(baseSpend * peakMultiplier * trendFactor);
      
      data.push({
        time: `${i}:00`,
        calls,
        latency,
        revenue,
        users,
        usage,
        minutes: calls * 3, // Simulate minutes
        spend,
      });
      
      // Gradually increase base for next hour to simulate growth
      baseRevenue += Math.random() * 5;
      baseCalls += Math.random() * 0.2;
      baseSpend += Math.random() * 0.1;
    }
    return data;
  }, []);

  const sentimentData = [
    { name: 'Positive', value: 65, color: '#10b981' },
    { name: 'Neutral', value: 25, color: '#6366f1' },
    { name: 'Negative', value: 10, color: '#f43f5e' },
  ];

  useEffect(() => {
    // Setup WebSocket Relay for real phone calls
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/frontend-relay`);
    relayWsRef.current = ws;

    ws.onopen = () => console.log("Relay WebSocket connected");
    ws.onmessage = async (event) => {
      try {
        if (!event.data) return;
        const msgStr = (event.data as string).toString().trim();
        if (msgStr === 'undefined' || msgStr === '') return;
        
        const data = JSON.parse(msgStr);
        
        if (data.type === 'CALL_STARTED') {
          console.log("Real call started, initializing agent session...");
          const agent = agents.find(a => a.id === data.agentId) || agents[0];
          setSelectedAgent(agent);
          // Wait a bit for state to propagate or use local agent
          await startLiveCall(data.streamSid, agent);
        }

        if (data.type === 'TWILIO_AUDIO') {
          if (liveSessionRef.current) {
            liveSessionRef.current.sendRealtimeInput({
              audio: { data: data.payload, mimeType: 'audio/pcm;rate=8000' }
            });
          }
        }

        if (data.type === 'CALL_ENDED') {
          console.log("Real call ended");
          stopLiveCall();
        }
      } catch (error) {
        console.error("WebSocket message parsing error:", error);
      }
    };

    return () => {
      ws.close();
      stopLiveCall();
    };
  }, [agents]); // Only depend on agents list

  const handleAddUser = async () => {
    if (!newUserEmail) return;
    try {
      const { manuallyCreateUser } = await import('../services/firebaseService');
      const newUser = await manuallyCreateUser(newUserEmail, newUserRole);
      if (newUser) {
        setAllUsers([newUser, ...allUsers]);
      }
      setShowAddUserModal(false);
      setNewUserEmail('');
    } catch (error) {
      console.error("Manual user creation failed:", error);
    }
  };

  const formatDate = (val: any) => {
    if (!val) return 'Recently';
    if (val.seconds) {
      return new Date(val.seconds * 1000).toLocaleDateString();
    }
    if (val instanceof Date) {
      return val.toLocaleDateString();
    }
    return val.toString();
  };

  const handleRemoveUser = async (id: string) => {
    try {
      const { deleteUserDoc } = await import('../services/firebaseService');
      await deleteUserDoc(id);
      setAllUsers(prev => prev.filter(u => u.id !== id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleBillUser = async () => {
    if (!userToBill || !billAmount) return;
    const val = parseFloat(billAmount);
    const newBalance = (userToBill.balance || 0) + val;
    
    try {
      const { updateUserBalance } = await import('../services/firebaseService');
      await updateUserBalance(userToBill.id, newBalance);
      
      setAllUsers(prev => prev.map(u => u.id === userToBill.id ? { ...u, balance: newBalance } : u));
      setInvoices(prev => [{
        id: `inv_${Date.now()}`,
        user: userToBill.email,
        amount: val,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0]
      }, ...prev]);
      setShowBillModal(false);
      setUserToBill(null);
      setBillAmount('10.00');
    } catch (error) {
      console.error("Failed to update balance:", error);
    }
  };

  const handleCreateTicket = () => {
    if (!newTicket.subject || !newTicket.description) return;
    const ticket: Ticket = {
      id: `t${Date.now()}`,
      userId: user.email, // Using email as ID for simplicity in this mock
      userEmail: user.email,
      subject: newTicket.subject,
      description: newTicket.description,
      status: 'Open',
      priority: newTicket.priority,
      createdAt: new Date().toLocaleString(),
      replies: []
    };
    setTickets([ticket, ...tickets]);
    setShowTicketModal(false);
    setNewTicket({ subject: '', description: '', priority: 'Medium' });
  };

  const handleReplyTicket = (ticketId: string) => {
    if (!ticketReply.trim()) return;
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: user.role === 'admin' ? 'In Progress' : 'Open',
          replies: [...t.replies, { 
            role: user.role === 'admin' ? 'admin' : 'user', 
            message: ticketReply, 
            timestamp: new Date().toLocaleString() 
          }]
        };
      }
      return t;
    }));
    setTicketReply('');
  };

  const handleCreateAgent = () => {
    if (!newAgent.name) return;
    
    // Check plan limits
    if (agents.length >= currentPlan.agents) {
      alert(`You have reached the limit of ${currentPlan.agents} agents for your ${currentPlan.name} plan. Please upgrade to create more.`);
      setActiveTab('billing');
      return;
    }

    const agent: Agent = {
      id: Math.random().toString(36).substr(2, 9),
      name: newAgent.name,
      voice: newAgent.voice,
      gender: newAgent.gender,
      pitch: newAgent.pitch,
      speed: newAgent.speed,
      status: 'Active',
      calls: 0,
      logic: newAgent.logic,
      prompt: newAgent.prompt,
      provider: newAgent.provider,
      vapiAssistantId: newAgent.vapiAssistantId
    };
    setAgents([...agents, agent]);
    setShowCreateModal(false);
    setNewAgent({ 
      name: '', 
      voice: 'Puck', 
      gender: 'Male',
      pitch: 1.0,
      speed: 1.0,
      logic: 'CallingAgent Orchestrator', 
      prompt: '', 
      provider: 'CallingAgent', 
      vapiAssistantId: '' 
    });
  };

  const handleDeleteAgent = (id: string) => {
    setAgents(agents.filter(a => a.id !== id));
  };

  const toggleAgentStatus = (id: string) => {
    setAgents(agents.map(a => a.id === id ? { ...a, status: a.status === 'Active' ? 'Paused' : 'Active' } : a));
  };

  const handleOutboundCall = async () => {
    if (!outboundNumber || !outboundAgentId) return;
    
    // Check minute limits
    if (124 >= currentPlan.mins) {
      alert(`You have reached your monthly limit of ${currentPlan.mins} minutes. Please upgrade your plan.`);
      setActiveTab('billing');
      setShowOutboundModal(false);
      return;
    }

    const agent = agents.find(a => a.id === outboundAgentId);
    if (!agent) return;

    // Check credentials
    if (agent.provider === 'Vapi' && !vapiApiKey) {
      alert("Please configure Vapi API Key in Integrations first.");
      setActiveTab('integrations');
      setShowOutboundModal(false);
      return;
    }
    if ((!agent.provider || agent.provider === 'CallingAgent') && (!twilioSid || !twilioToken || !twilioNumber)) {
      alert("Please configure Twilio credentials in Integrations first.");
      setActiveTab('integrations');
      setShowOutboundModal(false);
      return;
    }

    try {
      const response = await fetch('/api/outbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: outboundNumber,
          agentId: agent.id,
          provider: agent.provider,
          vapiAssistantId: agent.vapiAssistantId,
          vapiApiKey: vapiApiKey,
          twilioSid: twilioSid,
          twilioToken: twilioToken,
          twilioNumber: twilioNumber
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert("Outbound call initiated!");
        setShowOutboundModal(false);
        setOutboundNumber('');
      } else {
        alert("Error: " + (data.error || "Failed to initiate call"));
      }
    } catch (error) {
      console.error("Outbound call error:", error);
      alert("Failed to connect to server for outbound call.");
    }
  };

  const handlePlanUpgrade = async (plan: any) => {
    if (plan.name === currentPlan.name) return;

    if (plan.name === 'Enterprise') {
      setShowEnterpriseModal(true);
      return;
    }

    setPendingPlan(plan);
    setShowPaymentSelectionModal(true);
  };

  const confirmPlanUpgrade = async (method: 'stripe' | 'paypal') => {
    if (!pendingPlan) return;
    
    try {
      if (method === 'stripe' && !stripeApiKey) {
        alert("Please configure Stripe Secret Key in Integrations first.");
        setActiveTab('integrations');
        setShowPaymentSelectionModal(false);
        return;
      }
      
      if (method === 'paypal' && (!paypalClientId || !paypalSecret)) {
        alert("Please configure PayPal credentials in Integrations first.");
        setActiveTab('integrations');
        setShowPaymentSelectionModal(false);
        return;
      }

      // In a real app, we'd redirect to Stripe Checkout or PayPal portal here
      // For now, we simulate success
      setCurrentPlan(pendingPlan);
      
      // Add to invoices
      setInvoices(prev => [{
        id: `inv_${Date.now()}`,
        user: user.email,
        amount: isBillingYearly ? pendingPlan.yearlyPrice : pendingPlan.price,
        status: 'Paid',
        date: new Date().toISOString().split('T')[0]
      }, ...prev]);

      alert(`Successfully upgraded to ${pendingPlan.name} plan via ${method === 'stripe' ? 'Stripe' : 'PayPal'}!`);
      setShowPaymentSelectionModal(false);
      setPendingPlan(null);
    } catch (error) {
      console.error("Upgrade error:", error);
      alert("Failed to process upgrade.");
    }
  };

  const handlePayment = async (method: 'stripe' | 'paypal', amount: number) => {
    try {
      if (method === 'stripe') {
        if (!stripeApiKey) {
          alert("Please configure Stripe Secret Key in Integrations first.");
          setActiveTab('integrations');
          return;
        }
        const response = await fetch('/api/payments/stripe/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, stripeSecretKey: stripeApiKey })
        });
        const data = await response.json();
        if (data.url) window.location.href = data.url;
      } else {
        if (!paypalClientId || !paypalSecret) {
          alert("Please configure PayPal credentials in Integrations first.");
          setActiveTab('integrations');
          return;
        }
        const response = await fetch('/api/payments/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, clientId: paypalClientId, secret: paypalSecret })
        });
        const data = await response.json();
        if (data.id) alert(`PayPal Order Created: ${data.id}. In a real app, this would open the PayPal popup.`);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate payment.");
    }
  };

  const handleTestAgent = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!testInput.trim() || !selectedAgent || isTyping) return;

    const userMsg = testInput;
    const newUserMsg = { role: 'user' as const, parts: [{ text: userMsg }] };
    setTestInput('');
    setTestChat(prev => [...prev, newUserMsg]);
    setIsTyping(true);

    try {
      const response = await geminiService.getAgentResponse(userMsg, [...testChat, newUserMsg], selectedAgent.prompt);
      setTestChat(prev => [...prev, { role: 'model', parts: [{ text: response }] }]);
      
      // Generate and play speech
      const audio = await geminiService.generateSpeech(response, selectedAgent.voice);
      if (audio) {
        setAudioUrl(audio);
        const audioObj = new Audio(audio);
        audioObj.play();

        // Auto-cut detection
        const lowerResponse = response.toLowerCase();
        const endCallKeywords = ['goodbye', 'bye', 'have a great day', 'have a nice day', 'end call'];
        if (endCallKeywords.some(kw => lowerResponse.includes(kw))) {
          setTimeout(() => {
            setShowTestModal(false);
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Test Agent Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTestInput(transcript);
      // Automatically send after voice input
      setTimeout(() => {
        handleVoiceSubmit(transcript);
      }, 500);
    };

    recognition.start();
  };

  const handleVoiceSubmit = async (transcript: string) => {
    if (!transcript.trim() || isTyping || !selectedAgent) return;

    const newUserMsg = { role: 'user' as const, parts: [{ text: transcript }] };
    setTestChat(prev => [...prev, newUserMsg]);
    setIsTyping(true);

    try {
      const response = await geminiService.getAgentResponse(
        transcript, 
        [...testChat, newUserMsg], 
        selectedAgent.prompt
      );
      
      setTestChat(prev => [...prev, { role: 'model', parts: [{ text: response }] }]);
      
      const audio = await geminiService.generateSpeech(response, selectedAgent.voice);
      if (audio) {
        setAudioUrl(audio);
        const audioObj = new Audio(audio);
        audioObj.play();

        // Auto-cut detection for non-live voice
        const lowerResponse = response.toLowerCase();
        const endCallKeywords = ['goodbye', 'bye', 'have a great day', 'have a nice day', 'end call'];
        if (endCallKeywords.some(kw => lowerResponse.includes(kw))) {
          setTimeout(() => {
            setShowTestModal(false);
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Test Agent Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const stopLiveCall = () => {
    setIsConnecting(false);
    if (vapiInstance) {
      vapiInstance.stop();
      setVapiInstance(null);
    }
    if (liveSession) {
      liveSession.close();
      setLiveSession(null);
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsCallActive(false);
    setIsCallPaused(false);
    setActiveStreamSid(null);
    nextStartTimeRef.current = 0;
  };

  const togglePauseCall = async () => {
    if (!isCallActive) return;

    if (isCallPaused) {
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      setIsCallPaused(false);
    } else {
      if (audioContextRef.current?.state === 'running') {
        await audioContextRef.current.suspend();
      }
      setIsCallPaused(true);
    }
  };

  const startLiveCall = async (streamSid?: string, providedAgent?: Agent) => {
    const agent = providedAgent || selectedAgent;
    if (!agent) return;
    
    if (agent.provider === 'Vapi') {
      if (!vapiApiKey) {
        alert('Please connect your Vapi API Key in the Integrations tab first.');
        setActiveTab('integrations');
        return;
      }
      if (!agent.vapiAssistantId) {
        alert('This agent is missing a Vapi Assistant ID.');
        return;
      }

      try {
        setIsConnecting(true);
        setIsCallActive(true);
        const vapi = new Vapi(vapiApiKey);
        setVapiInstance(vapi);
        
        vapi.start(agent.vapiAssistantId);
        
        vapi.on('call-start', () => {
          console.log('Vapi call started');
          setIsConnecting(false);
        });
        vapi.on('call-end', () => {
          console.log('Vapi call ended');
          setIsCallActive(false);
          setVapiInstance(null);
        });
        vapi.on('message', (message) => {
          if (message.type === 'transcript' && message.transcriptType === 'final') {
            setTestChat(prev => [...prev, { 
              role: message.role === 'assistant' ? 'model' : 'user', 
              parts: [{ text: message.transcript }] 
            }]);

            // Auto-cut detection for Vapi
            const lowerTranscript = message.transcript.toLowerCase();
            const endCallKeywords = ['goodbye', 'bye', 'have a great day', 'have a nice day', 'end call'];
            if (message.role === 'assistant' && endCallKeywords.some(kw => lowerTranscript.includes(kw))) {
              setTimeout(() => stopLiveCall(), 3000);
            }
          }
        });
        vapi.on('error', (e) => console.error('Vapi error:', e));
        
        return;
      } catch (err) {
        console.error("Failed to start Vapi call:", err);
        setIsCallActive(false);
        return;
      }
    }

    try {
      setIsConnecting(true);
      setIsCallActive(true);
      if (streamSid) setActiveStreamSid(streamSid);
      
      // Initialize Audio Context
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      
      // Ensure context is running
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Setup session
      const endCallKeywords = ['goodbye', 'bye', 'have a great day', 'have a nice day', 'end call'];
      const enhancedPrompt = `${agent.prompt}\n\nIMPORTANT: When the conversation is finished or the user says goodbye, you MUST say "Goodbye" or "Have a great day" to signal the end of the call.`;

      let sessionOpen = false;
      const voiceName = VOICES.find(v => v.id === agent.voice)?.engine === 'Gemini Native' ? agent.voice : 'Zephyr';
      const session = await geminiService.connectLive(enhancedPrompt, {
        onopen: () => {
          console.log("Live session opened");
          sessionOpen = true;
          setIsConnecting(false);
        },
        onmessage: async (message: any) => {
          if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
            const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
            playAudioChunk(base64Audio);

            // Relay back to Twilio if this is a real call
            // Use streamSid from closure or state
            const targetSid = streamSid || activeStreamSid;
            if (relayWsRef.current?.readyState === WebSocket.OPEN && targetSid) {
              relayWsRef.current.send(JSON.stringify({
                type: 'AGENT_AUDIO',
                payload: base64Audio,
                streamSid: targetSid
              }));
            }
          }
          if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
            const text = message.serverContent.modelTurn.parts[0].text;
            setTestChat(prev => [...prev, { role: 'model', parts: [{ text }] }]);
            
            // Auto-cut detection
            const lowerText = text.toLowerCase();
            if (endCallKeywords.some(kw => lowerText.includes(kw))) {
              console.log("End of call detected in model response");
              // Wait a bit for the audio to finish playing before cutting
              setTimeout(() => {
                stopLiveCall();
              }, 2000);
            }
          }
          if (message.userContent?.modelTurn?.parts?.[0]?.text) {
            const text = message.userContent.modelTurn.parts[0].text;
            setTestChat(prev => [...prev, { role: 'user', parts: [{ text }] }]);

            // User-side auto-cut detection
            const lowerText = text.toLowerCase();
            if (lowerText === 'goodbye' || lowerText === 'bye' || lowerText === 'end call') {
              console.log("End of call detected in user transcript");
              setTimeout(() => {
                stopLiveCall();
              }, 1000);
            }
          }
          if (message.serverContent?.interrupted) {
            // Stop current playback if interrupted
            nextStartTimeRef.current = 0;
          }
        },
        onerror: (err: any) => {
          console.error("Live session error:", err);
          stopLiveCall();
        },
        onclose: () => {
          console.log("Live session closed");
          stopLiveCall();
        }
      }, voiceName);
      setLiveSession(session);

      // Setup Microphone
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (micErr) {
        console.error("Microphone access denied:", micErr);
        alert("Microphone access is required for voice calls. Please check your browser permissions.");
        stopLiveCall();
        return;
      }
      
      streamRef.current = stream;
      const source = audioContext.createMediaStreamSource(stream);
      
      // Use ScriptProcessor for simplicity (though deprecated, it's easier for quick PCM conversion)
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      processor.onaudioprocess = (e: any) => {
        if (!sessionOpen || isCallPausedRef.current) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert to 16-bit PCM
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        // Convert to Base64 safely
        const bytes = new Uint8Array(pcmData.buffer);
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Data = btoa(binary);
        
        session.sendRealtimeInput({
          audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

    } catch (err) {
      console.error("Failed to start live call:", err);
      stopLiveCall();
    }
  };

  const playAudioChunk = async (base64Data: string) => {
    if (!audioContextRef.current || isCallPausedRef.current) return;
    
    try {
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Ensure we have an even number of bytes for 16-bit PCM
      const pcmLength = Math.floor(bytes.length / 2);
      const pcmData = new Int16Array(pcmLength);
      const dataView = new DataView(bytes.buffer);
      
      for (let i = 0; i < pcmLength; i++) {
        // Gemini returns little-endian PCM
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
        nextStartTimeRef.current = currentTime + 0.05; // Small buffer
      }
      
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;
    } catch (err) {
      console.error("Error playing audio chunk:", err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccess(false);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (newPassword && newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      setIsUpdatingProfile(false);
      return;
    }

    onUpdateUser({
      name: profileName,
      profilePic: profilePic
    });

    setIsUpdatingProfile(false);
    setProfileSuccess(true);
    setNewPassword('');
    setConfirmPassword('');

    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const stats = [
    { id: 'minutes', label: 'Total Minutes', value: '1,284', change: '+12.5%', icon: Phone, color: 'text-indigo-400' },
    { id: 'completion', label: 'Completion Rate', value: '99.4%', change: '+0.2%', icon: CheckCircle2, color: 'text-emerald-400' },
    { id: 'latency', label: 'Avg Latency', value: '142ms', change: '-8ms', icon: TrendingUp, color: 'text-purple-400' },
    { id: 'spend', label: 'Spend (MTD)', value: '$192.40', change: '+$12.10', icon: CreditCard, color: 'text-blue-400' },
  ];

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-500 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className={`fixed inset-0 backdrop-blur-sm z-30 lg:hidden ${
              theme === 'dark' ? 'bg-slate-950/60' : 'bg-slate-900/40'
            }`}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 border-r backdrop-blur-xl flex flex-col p-6 z-40 transition-all duration-300 lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        theme === 'dark' 
          ? 'bg-slate-900/95 lg:bg-slate-900/50 border-white/5' 
          : 'bg-white/95 lg:bg-white/50 border-slate-200 shadow-xl'
      }`}>
        <div className="flex items-center space-x-3 mb-10 px-2 group cursor-pointer">
          <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 transition-all duration-500 overflow-hidden group-hover:scale-110">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent)]"></div>
            <svg className="w-7 h-7 text-white relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 4H9L11 9L8.5 10.5C9.57096 12.6715 11.3285 14.429 13.5 15.5L15 13L20 15V19C20 20.1046 19.1046 21 18 21C8.61116 21 1 13.3888 1 4C1 2.89543 1.89543 2 3 2H5" fill="currentColor"/>
              <path d="M17 2L18 5L21 6L18 7L17 10L16 7L13 6L16 5L17 2Z" fill="white" className="animate-pulse" />
            </svg>
          </div>
          <div className="flex flex-col -space-y-1">
            <span className={`text-2xl font-black tracking-tighter leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Calling<span className="text-indigo-500">Agent</span></span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-0.5">Agency</span>
          </div>
        </div>

        <div className="mb-6 px-2">
          {/* Theme toggle moved to header */}
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            ...(isAdmin && !isImpersonating ? [
              { id: 'enterprise', label: 'Enterprise Requests', icon: Building2 },
              { id: 'integrations', label: 'API Configuration', icon: Settings },
              { id: 'users', label: 'User Management', icon: ShieldCheck },
              { id: 'admin-plans', label: 'Subscription Plans', icon: Layout },
              { id: 'admin-coupons', label: 'Coupons', icon: Tag },
              { id: 'admin-blogs', label: 'Blog Manager', icon: FileText },
              { id: 'invoices', label: 'Revenue & Invoices', icon: DollarSign },
              { id: 'tickets', label: 'Support Tickets', icon: AlertCircle },
              { id: 'profile', label: 'My Profile', icon: User }
            ] : [
              { id: 'agents', label: 'My Agents', icon: Users },
              { id: 'numbers', label: 'Phone Numbers', icon: Phone },
              { id: 'provision', label: 'Provision', icon: Plus },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'billing', label: 'Billing', icon: CreditCard },
              { id: 'enterprise', label: 'Enterprise Solutions', icon: Building2 },
              { id: 'support', label: 'Support', icon: MessageSquare },
              { id: 'profile', label: 'My Profile', icon: User }
            ]),
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                if (window.innerWidth < 1024) {
                  setIsSidebarOpen(false);
                }
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === item.id 
                  ? isAdmin && !isImpersonating
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : theme === 'dark'
                    ? 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <item.icon className={`w-5 h-5 ${
                activeTab === item.id 
                  ? 'text-white' 
                  : theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
              }`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className={`pt-6 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'}`}>
          <div className={`rounded-2xl p-4 mb-6 ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs overflow-hidden">
                {user.profilePic ? (
                  <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  (user.name ? user.name[0] : user.email[0]).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{user.name || user.email}</p>
                {user.name && <p className="text-[9px] font-bold text-slate-500 truncate">{user.email}</p>}
              </div>
            </div>
            <button 
              onClick={onLogout} 
              className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold text-rose-400 hover:bg-rose-400/10 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
          <p className={`text-[10px] text-center font-bold uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>v2.4.0 Stable</p>
        </div>
      </aside>

      {/* Main Dashboard Area */}
      <main className="flex-1 overflow-y-auto relative p-4 sm:p-8 lg:p-12">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div className="flex items-center justify-between w-full lg:w-auto">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h2 className={`text-3xl sm:text-4xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h2>
                {isImpersonating && (
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                    Viewing as User
                  </span>
                )}
              </div>
              <p className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'} text-sm font-medium`}>
                {isImpersonating ? `Currently reviewing the dashboard as ${user.email}` : 'Manage your AI voice infrastructure and real-time operations.'}
              </p>
            </div>
            
            {/* Mobile Sidebar Toggle */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={`lg:hidden w-12 h-12 flex items-center justify-center rounded-2xl border transition-all ${
                theme === 'dark' 
                  ? 'bg-white/5 border-white/10 text-white' 
                  : 'bg-white border-slate-200 text-slate-900 shadow-sm'
              }`}
            >
              <Layout className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`flex items-center space-x-3 border px-4 py-2.5 rounded-2xl transition-all ${
                theme === 'dark' 
                  ? 'bg-slate-900 border-white/5 text-slate-300 hover:text-white' 
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
              }`}
            >
              {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span className="text-xs font-bold uppercase tracking-widest">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${theme === 'dark' ? 'left-6' : 'left-1'}`} />
              </div>
            </button>
            <button className={`p-2.5 border rounded-2xl transition-all ${
              theme === 'dark' 
                ? 'bg-slate-900 border-white/5 text-slate-400 hover:text-white' 
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm'
            }`}>
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              {isAdmin && !isImpersonating ? (
                // Admin Overview
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { id: 'revenue', label: 'Total Revenue', value: '$18,450.00', change: '+12.5%', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                      { id: 'users', label: 'Active Users', value: '1,284', change: '+142', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                      { id: 'usage', label: 'Platform Usage', value: '124,500 mins', change: '+12.4k', icon: Mic, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                      { id: 'tickets', label: 'Open Tickets', value: tickets.filter(t => t.status === 'Open').length.toString(), change: '-2', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    ].map((stat, i) => (
                      <button 
                        key={i} 
                        onClick={() => {
                          if (stat.id === 'tickets') {
                            setActiveTab('tickets');
                          } else {
                            setSelectedAdminMetric(stat.id as any);
                          }
                        }}
                        className={`p-6 rounded-[2rem] group transition-all duration-300 border text-left w-full ${
                          theme === 'dark' 
                            ? `bg-slate-900/40 border-white/5 hover:border-emerald-500/30 ${selectedAdminMetric === stat.id ? 'border-emerald-500/50 bg-slate-800/50' : ''}` 
                            : `bg-white border-slate-200 hover:border-emerald-500/30 shadow-sm hover:shadow-md ${selectedAdminMetric === stat.id ? 'border-emerald-500/50 bg-emerald-50/50' : ''}`
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 rounded-2xl ${stat.bg}`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                          </div>
                          <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${
                            stat.change.startsWith('+') 
                              ? theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                              : theme === 'dark' ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-100 text-rose-600'
                          }`}>
                            {stat.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                            {stat.change}
                          </div>
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</p>
                        <span className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{stat.value}</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className={`lg:col-span-2 border rounded-[2.5rem] p-8 transition-all ${
                      theme === 'dark' ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
                    }`}>
                      <div className="flex justify-between items-center mb-8">
                        <div>
                          <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            {selectedAdminMetric === 'revenue' ? 'Revenue Growth' : 
                             selectedAdminMetric === 'users' ? 'Active Users' : 
                             'Platform Usage'}
                          </h3>
                          <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                            {selectedAdminMetric === 'revenue' ? 'Monthly recurring revenue trends' : 
                             selectedAdminMetric === 'users' ? 'Real-time user engagement' : 
                             'Total minutes processed across all agents'}
                          </p>
                        </div>
                        <div className={`flex p-1 rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200/50'}`}>
                          <button className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-lg">Live</button>
                          <button className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                          }`}>24H</button>
                        </div>
                      </div>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={
                                  selectedAdminMetric === 'revenue' ? '#10b981' : 
                                  selectedAdminMetric === 'users' ? '#3b82f6' : 
                                  '#8b5cf6'
                                } stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={
                                  selectedAdminMetric === 'revenue' ? '#10b981' : 
                                  selectedAdminMetric === 'users' ? '#3b82f6' : 
                                  '#8b5cf6'
                                } stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} vertical={false} />
                            <XAxis dataKey="time" stroke={theme === 'dark' ? '#475569' : '#94a3b8'} fontSize={10} tickLine={false} axisLine={false} interval={4} />
                            <YAxis stroke={theme === 'dark' ? '#475569' : '#94a3b8'} fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ 
                              backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', 
                              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', 
                              borderRadius: '12px',
                              boxShadow: theme === 'dark' ? 'none' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }} />
                            <Area 
                              type="monotone" 
                              dataKey={selectedAdminMetric} 
                              stroke={
                                selectedAdminMetric === 'revenue' ? '#10b981' : 
                                selectedAdminMetric === 'users' ? '#3b82f6' : 
                                '#8b5cf6'
                              } 
                              strokeWidth={3} 
                              fillOpacity={1} 
                              fill="url(#colorMetric)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className={`border rounded-[2.5rem] p-8 transition-all ${
                      theme === 'dark' ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
                    }`}>
                      <h3 className={`text-xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>User Activity</h3>
                      <div className="space-y-6">
                        {allUsers.slice(0, 5).map((u, i) => (
                          <div key={i} className="flex items-center justify-between group">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black text-sm border border-emerald-500/20">
                                {u.email[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className={`text-sm font-black truncate group-hover:text-emerald-400 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{u.email}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{u.usage} mins used</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">${(u.balance || 0).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // User Overview
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                      <button 
                        key={i} 
                        onClick={() => {
                          if (stat.id === 'completion') return; // No chart for completion rate yet
                          setSelectedUserMetric(stat.id as any);
                        }}
                        className={`p-6 rounded-[2rem] group transition-all duration-300 border text-left w-full ${
                          theme === 'dark' 
                            ? `bg-slate-900/40 border-white/5 hover:border-indigo-500/30 ${selectedUserMetric === stat.id ? 'border-indigo-500/50 bg-slate-800/50' : ''}` 
                            : `bg-white border-slate-200 hover:border-indigo-500/30 shadow-sm hover:shadow-md ${selectedUserMetric === stat.id ? 'border-indigo-500/50 bg-indigo-50/50' : ''}`
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'} ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                          </div>
                          <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${
                            stat.change.startsWith('+') 
                              ? theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                              : theme === 'dark' ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-100 text-rose-600'
                          }`}>
                            {stat.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                            {stat.change}
                          </div>
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</p>
                        <span className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{stat.value}</span>
                      </button>
                    ))}
                  </div>

              {/* Main Chart Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={`lg:col-span-2 border rounded-[2.5rem] p-8 transition-all ${
                  theme === 'dark' ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
                }`}>
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        {selectedUserMetric === 'minutes' ? 'Call Volume' : 
                         selectedUserMetric === 'latency' ? 'System Latency' : 
                         'Usage Spend'}
                      </h3>
                      <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                        {selectedUserMetric === 'minutes' ? 'Total minutes processed in real-time' : 
                         selectedUserMetric === 'latency' ? 'Average response time in milliseconds' : 
                         'Estimated daily spend in USD'}
                      </p>
                    </div>
                    <div className={`flex p-1 rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200/50'}`}>
                      <button className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-lg">Live</button>
                      <button className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}>24H</button>
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorUserMetric" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={
                              selectedUserMetric === 'minutes' ? '#6366f1' : 
                              selectedUserMetric === 'latency' ? '#a855f7' : 
                              '#3b82f6'
                            } stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={
                              selectedUserMetric === 'minutes' ? '#6366f1' : 
                              selectedUserMetric === 'latency' ? '#a855f7' : 
                              '#3b82f6'
                            } stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} vertical={false} />
                        <XAxis dataKey="time" stroke={theme === 'dark' ? '#475569' : '#94a3b8'} fontSize={10} tickLine={false} axisLine={false} interval={4} />
                        <YAxis stroke={theme === 'dark' ? '#475569' : '#94a3b8'} fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ 
                          backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', 
                          border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', 
                          borderRadius: '12px',
                          boxShadow: theme === 'dark' ? 'none' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }} />
                        <Area 
                          type="monotone" 
                          dataKey={selectedUserMetric} 
                          stroke={
                            selectedUserMetric === 'minutes' ? '#6366f1' : 
                            selectedUserMetric === 'latency' ? '#a855f7' : 
                            '#3b82f6'
                          } 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#colorUserMetric)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                  <div className={`border rounded-[2.5rem] p-8 transition-all ${
                    theme === 'dark' ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
                  }`}>
                    <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Sentiment Analysis</h3>
                    <div className="h-[200px] w-full mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sentimentData} layout="vertical">
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={12} width={80} axisLine={false} tickLine={false} />
                          <Tooltip 
                            cursor={{fill: 'transparent'}} 
                            contentStyle={{ 
                              backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', 
                              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', 
                              borderRadius: '12px' 
                            }}
                          />
                          <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                            {sentimentData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                      {sentimentData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{item.name}</span>
                          </div>
                          <span className={`text-xs font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Activity Table */}
                <div className={`border rounded-[2.5rem] overflow-hidden transition-all ${
                  theme === 'dark' ? 'bg-slate-900/30 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
                }`}>
                  <div className={`p-8 border-b flex justify-between items-center ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                    <div>
                      <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Recent Conversations</h3>
                      <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Latest interactions across all agents</p>
                    </div>
                    <button className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                    }`}>
                      Export CSV
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[800px]">
                      <thead className={`text-[10px] font-black uppercase tracking-widest text-slate-500 ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                        <tr>
                          <th className="px-8 py-5">Caller ID</th>
                          <th className="px-8 py-5">Agent</th>
                          <th className="px-8 py-5">Duration</th>
                          <th className="px-8 py-5">Sentiment</th>
                          <th className="px-8 py-5 text-right">Outcome</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-100'}`}>
                        {calls.map((call) => (
                          <tr 
                            key={call.id} 
                            onClick={() => {
                              setSelectedCall(call);
                              setShowCallDetailsModal(true);
                            }}
                            className={`group transition-colors cursor-pointer ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                          >
                            <td className="px-8 py-6">
                              <div className="flex flex-col">
                                <span className={`font-bold font-mono ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{call.caller}</span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase">{call.timestamp}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                <span className={`font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{call.agent}</span>
                              </div>
                            </td>
                            <td className={`px-8 py-6 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{call.duration}</td>
                            <td className="px-8 py-6">
                              <span className={`flex items-center text-[10px] font-black uppercase ${
                                call.sentiment === 'Positive' ? 'text-emerald-400' : 
                                call.sentiment === 'Negative' ? 'text-rose-400' : 'text-indigo-400'
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                                  call.sentiment === 'Positive' ? 'bg-emerald-400' : 
                                  call.sentiment === 'Negative' ? 'bg-rose-400' : 'bg-indigo-400'
                                }`}></div>
                                {call.sentiment}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <span className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-wider border border-indigo-500/20">
                                {call.outcome}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

          {activeTab === 'numbers' && (
            <motion.div 
              key="numbers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`text-2xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Phone Numbers</h3>
                  <p className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} text-sm`}>Connect real phone numbers to your AI agents.</p>
                </div>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setShowOutboundModal(true)}
                    className={`px-8 py-4 rounded-[1.25rem] font-black text-sm shadow-xl active:scale-95 transition-all flex items-center space-x-2 ${
                      theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Phone className="w-5 h-5" />
                    <span>Outbound Call</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (numbers.length >= currentPlan.numbers) {
                        alert(`You have reached the limit of ${currentPlan.numbers} phone numbers for your ${currentPlan.name} plan. Please upgrade to provision more.`);
                        setActiveTab('billing');
                        return;
                      }
                      setShowConnectNumber(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-[1.25rem] font-black text-sm shadow-xl shadow-indigo-500/30 active:scale-95 transition-all flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Provision New Number</span>
                  </button>
                </div>
              </div>

              <div className={`border rounded-[2.5rem] overflow-x-auto transition-all ${
                theme === 'dark' ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
              }`}>
                <table className="w-full text-left min-w-[800px]">
                  <thead>
                    <tr className={`border-b ${theme === 'dark' ? 'bg-slate-800/30 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Assigned Agent</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Location</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-100'}`}>
                    {numbers.map((num) => (
                      <tr key={num.id} className={`group transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                        <td className="px-8 py-6">
                          <span className={`font-bold font-mono text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{num.number}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                              <Mic className="w-4 h-4" />
                            </div>
                            <span className={`font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                              {agents.find(a => a.id === num.agentId)?.name || 'Unassigned'}
                            </span>
                          </div>
                        </td>
                        <td className={`px-8 py-6 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{num.location}</td>
                        <td className="px-8 py-6">
                          <span className="flex items-center text-[10px] font-black uppercase text-emerald-400">
                            <div className="w-1.5 h-1.5 rounded-full mr-2 bg-emerald-400"></div>
                            {num.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className={`p-2 transition-colors ${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>
                            <Settings className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[2.5rem] flex items-center space-x-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-black text-white mb-1 tracking-tighter">Telephony Webhook Configuration</h4>
                  <p className="text-slate-400 text-sm font-medium">To connect your own Twilio numbers, set your webhook URL to: <code className="bg-slate-950 px-2 py-1 rounded text-indigo-400 font-mono">{window.location.origin}/api/voice?agentId=1</code></p>
                </div>
              </div>

              {/* Sandbox Dialer */}
              <div className={`p-10 rounded-[3rem] border transition-all ${
                theme === 'dark' ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
              }`}>
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className={`text-xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Sandbox Dialer</h4>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Test your numbers via search-to-dial</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Destination Number</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={outboundNumber}
                        onChange={(e) => setOutboundNumber(e.target.value)}
                        placeholder="+1 555 000 0000"
                        className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold ${
                        theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`} />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex space-x-2">
                        <button 
                          onClick={() => setOutboundNumber('+1 (888) AGENT-AI')}
                          className="px-3 py-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg text-[10px] font-black uppercase hover:bg-indigo-500/20 transition-all"
                        >
                          Use Sandbox
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Test with Agent</label>
                    <select 
                      value={outboundAgentId}
                      onChange={(e) => setOutboundAgentId(e.target.value)}
                      className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold appearance-none ${
                      theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}>
                      <option value="">Select Agent...</option>
                      {agents.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={handleOutboundCall}
                      disabled={!outboundNumber || !outboundAgentId}
                      className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/30 active:scale-95 transition-all flex items-center justify-center space-x-2"
                    >
                      <Phone className="w-5 h-5" />
                      <span>Initiate Test Call</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'agents' && (
            <motion.div 
              key="agents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tighter">My Voice Agents</h3>
                  <p className="text-slate-500 text-sm">Deploy and manage your custom AI personas.</p>
                </div>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-[1.25rem] font-black text-sm shadow-xl shadow-indigo-500/30 active:scale-95 transition-all flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Deploy New Agent</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {agents.map((agent) => (
                  <div key={agent.id} className={`p-8 rounded-[2.5rem] flex flex-col justify-between transition-all duration-300 group border ${
                    theme === 'dark' 
                      ? 'bg-slate-900/40 border-white/5 hover:border-indigo-500/30' 
                      : 'bg-white border-slate-200 hover:border-indigo-500/30 shadow-xl'
                  }`}>
                    <div>
                      <div className="flex justify-between items-start mb-8">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                          agent.status === 'Active' 
                            ? 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10' 
                            : theme === 'dark' ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <Mic className="w-7 h-7" />
                        </div>
                        <button 
                          onClick={() => toggleAgentStatus(agent.id)}
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                            agent.status === 'Active' 
                              ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
                              : theme === 'dark' ? 'bg-slate-800 text-slate-500 hover:bg-slate-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {agent.status === 'Active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          <span>{agent.status}</span>
                        </button>
                      </div>
                      <h4 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{agent.name}</h4>
                      <div className="flex flex-wrap items-center gap-3 mb-8">
                        <div className="flex items-center space-x-2 bg-slate-800/20 px-3 py-1 rounded-full border border-white/5">
                          <MessageSquare className="w-3 h-3 text-indigo-400" />
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            {agent.voice} {agent.gender ? `• ${agent.gender}` : ''}
                          </p>
                        </div>
                        {agent.pitch !== undefined && (
                          <div className="flex items-center space-x-1 bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-lg border border-indigo-500/20 text-[9px] font-black uppercase tracking-tighter">
                            <span>P:{agent.pitch}x S:{agent.speed}x</span>
                          </div>
                        )}
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${agent.provider === 'Vapi' ? 'bg-white text-black border-white' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                          {agent.provider || 'CallingAgent'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-10">
                        <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/30 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                          <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Total Calls</p>
                          <p className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{agent.calls}</p>
                        </div>
                        <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/30 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                          <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Success Rate</p>
                          <p className="text-xl font-black text-emerald-400">98%</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => {
                          setSelectedAgent(agent);
                          startLiveCall(undefined, agent);
                        }}
                        className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>Direct Call</span>
                      </button>
                      <button 
                        onClick={() => {
                          setOutboundAgentId(agent.id);
                          setShowOutboundModal(true);
                        }}
                        className={`p-3.5 rounded-2xl transition-all flex items-center justify-center ${
                          theme === 'dark' ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                        }`}
                        title="Make Outbound Call"
                      >
                        <Phone className="w-5 h-5" />
                      </button>
                      <button className={`p-3.5 rounded-2xl transition-all ${
                        theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900'
                      }`}>
                        <Settings className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteAgent(agent.id)}
                        className="p-3.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-2xl text-rose-500 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Empty State / Add Card */}
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="border-2 border-dashed border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center space-y-4 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group min-h-[400px]"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8 text-slate-500 group-hover:text-indigo-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">Deploy New Agent</p>
                    <p className="text-xs text-slate-500 font-medium">Create a custom persona in seconds</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
          {activeTab === 'logs' && (
            <motion.div 
              key="logs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`text-2xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Call History</h3>
                  <p className="text-slate-500 text-sm">Review transcripts and recordings of past interactions.</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search by ID or Agent..." 
                    className={`rounded-xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all font-bold border ${
                      theme === 'dark' ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className={`border rounded-[2.5rem] overflow-hidden transition-all ${
                theme === 'dark' ? 'bg-slate-900/30 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className={`text-[10px] font-black uppercase tracking-widest text-slate-500 ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                      <tr>
                        <th className="px-8 py-5">Call ID</th>
                        <th className="px-8 py-5">Agent</th>
                        <th className="px-8 py-5">Duration</th>
                        <th className="px-8 py-5">Sentiment</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-100'}`}>
                      {calls.map((call) => (
                        <tr 
                          key={call.id} 
                          onClick={() => {
                            setSelectedCall(call);
                            setShowCallDetailsModal(true);
                          }}
                          className={`group transition-colors cursor-pointer ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                        >
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className={`font-bold font-mono ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{call.caller}</span>
                              <span className="text-[10px] text-slate-500 font-bold uppercase">{call.timestamp}</span>
                            </div>
                          </td>
                          <td className={`px-8 py-6 font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{call.agent}</td>
                          <td className={`px-8 py-6 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{call.duration}</td>
                          <td className="px-8 py-6">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                              call.sentiment === 'Positive' ? 'bg-emerald-500/10 text-emerald-400' : 
                              call.sentiment === 'Negative' ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400'
                            }`}>
                              {call.sentiment}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCall(call);
                                setShowCallDetailsModal(true);
                              }}
                              className="text-indigo-400 hover:text-indigo-300 font-bold text-xs"
                            >
                              View Transcript
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'integrations' && (
            <motion.div 
              key="integrations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div>
                <h3 className={`text-2xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Integrations</h3>
                <p className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} text-sm`}>Connect third-party voice AI and telephony platforms.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Vapi Integration */}
                <div className={`p-10 rounded-[2.5rem] space-y-6 relative overflow-hidden group border transition-all ${
                  theme === 'dark' ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
                }`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-600/10 transition-all"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center p-3 shadow-lg">
                        <img src="https://vapi.ai/favicon.ico" alt="Vapi" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <h4 className={`text-2xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Vapi.ai</h4>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Voice AI Platform</p>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${vapiApiKey ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : theme === 'dark' ? 'bg-slate-800 text-slate-500 border-white/5' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                      {vapiApiKey ? 'Connected' : 'Not Connected'}
                    </div>
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Vapi Private API Key</label>
                      <div className="flex space-x-2">
                        <input 
                          type="password" 
                          value={vapiApiKey}
                          onChange={(e) => setVapiApiKey(e.target.value)}
                          className={`flex-1 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-slate-400 border ${
                            theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`} 
                          placeholder="vapi-..." 
                        />
                        <button 
                          onClick={() => handleSaveConfig('vapi_api_key', vapiApiKey)}
                          className={`px-6 py-4 rounded-2xl font-black text-xs transition-all shadow-lg ${
                            saveFeedback['vapi_api_key'] 
                              ? 'bg-emerald-600 text-white shadow-emerald-600/20' 
                              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'
                          }`}
                        >
                          {saveFeedback['vapi_api_key'] ? 'Saved!' : 'Save'}
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                      Required for outbound calls and assistant management. Get yours at <a href="https://dashboard.vapi.ai/account" target="_blank" className="text-indigo-400 hover:underline">vapi.ai</a>.
                    </p>
                  </div>
                </div>

                {/* Twilio Integration */}
                <div className={`p-10 rounded-[2.5rem] space-y-6 relative overflow-hidden group border transition-all ${
                  theme === 'dark' ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
                }`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#F22F46]/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[#F22F46]/10 transition-all"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#F22F46] flex items-center justify-center p-3 shadow-lg">
                        <Phone className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-2xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Twilio</h4>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Telephony Provider</p>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${twilioSid && twilioToken ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : theme === 'dark' ? 'bg-slate-800 text-slate-500 border-white/5' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                      {twilioSid && twilioToken ? 'Connected' : 'Not Connected'}
                    </div>
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Account SID</label>
                        <input 
                          type="text" 
                          value={twilioSid}
                          onChange={(e) => setTwilioSid(e.target.value)}
                          className={`w-full rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-slate-400 border ${
                            theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`} 
                          placeholder="AC..." 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Auth Token</label>
                        <input 
                          type="password" 
                          value={twilioToken}
                          onChange={(e) => setTwilioToken(e.target.value)}
                          className={`w-full rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-slate-400 border ${
                            theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`} 
                          placeholder="••••••••" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Twilio Phone Number</label>
                      <div className="flex space-x-2">
                        <input 
                          type="text" 
                          value={twilioNumber}
                          onChange={(e) => setTwilioNumber(e.target.value)}
                          className={`flex-1 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-slate-400 border ${
                            theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`} 
                          placeholder="+1..." 
                        />
                        <button 
                          onClick={() => handleSaveConfig('twilio_sid', twilioSid, {
                            'twilio_token': twilioToken,
                            'twilio_number': twilioNumber
                          })}
                          className={`px-6 py-4 rounded-2xl font-black text-xs transition-all shadow-lg ${
                            saveFeedback['twilio_sid'] 
                              ? 'bg-emerald-600 text-white shadow-emerald-600/20' 
                              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'
                          }`}
                        >
                          {saveFeedback['twilio_sid'] ? 'Saved!' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stripe Integration */}
                <div className={`p-10 rounded-[2.5rem] space-y-6 relative overflow-hidden group border transition-all ${
                  theme === 'dark' ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
                }`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#635BFF]/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[#635BFF]/10 transition-all"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#635BFF] flex items-center justify-center p-3 shadow-lg">
                        <CreditCard className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-2xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Stripe</h4>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Payment Gateway</p>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${stripeApiKey ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : theme === 'dark' ? 'bg-slate-800 text-slate-500 border-white/5' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                      {stripeApiKey ? 'Connected' : 'Not Connected'}
                    </div>
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Stripe Secret Key</label>
                      <div className="flex space-x-2">
                        <input 
                          type="password" 
                          value={stripeApiKey}
                          onChange={(e) => setStripeApiKey(e.target.value)}
                          className={`flex-1 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-slate-400 border ${
                            theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`} 
                          placeholder="sk_test_..." 
                        />
                        <button 
                          onClick={() => handleSaveConfig('stripe_api_key', stripeApiKey)}
                          className={`px-6 py-4 rounded-2xl font-black text-xs transition-all shadow-lg ${
                            saveFeedback['stripe_api_key'] 
                              ? 'bg-emerald-600 text-white shadow-emerald-600/20' 
                              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'
                          }`}
                        >
                          {saveFeedback['stripe_api_key'] ? 'Saved!' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PayPal Integration */}
                <div className={`p-10 rounded-[2.5rem] space-y-6 relative overflow-hidden group border transition-all ${
                  theme === 'dark' ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
                }`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#003087]/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[#003087]/10 transition-all"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#003087] flex items-center justify-center p-3 shadow-lg">
                        <DollarSign className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-2xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>PayPal</h4>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Payment Provider</p>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${paypalClientId && paypalSecret ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : theme === 'dark' ? 'bg-slate-800 text-slate-500 border-white/5' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                      {paypalClientId && paypalSecret ? 'Connected' : 'Not Connected'}
                    </div>
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Client ID</label>
                        <input 
                          type="text" 
                          value={paypalClientId}
                          onChange={(e) => setPaypalClientId(e.target.value)}
                          className={`w-full rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-slate-700 border ${
                            theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`} 
                          placeholder="Client ID" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Secret</label>
                        <input 
                          type="password" 
                          value={paypalSecret}
                          onChange={(e) => setPaypalSecret(e.target.value)}
                          className={`w-full rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-slate-700 border ${
                            theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`} 
                          placeholder="••••••••" 
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => handleSaveConfig('paypal_client_id', paypalClientId, {
                        'paypal_secret': paypalSecret
                      })}
                      className={`w-full px-6 py-4 rounded-2xl font-black text-xs transition-all shadow-lg ${
                        saveFeedback['paypal_client_id'] 
                          ? 'bg-emerald-600 text-white shadow-emerald-600/20' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'
                      }`}
                    >
                      {saveFeedback['paypal_client_id'] ? 'PayPal Credentials Saved!' : 'Save PayPal Credentials'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'provision' && !isAdmin && (
            <motion.div 
              key="provision"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`text-2xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Provision New Number</h3>
                  <p className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} text-sm`}>Get a dedicated phone number for your AI agents in seconds.</p>
                </div>
              </div>

              <div className={`border rounded-[3rem] p-10 transition-all ${
                theme === 'dark' ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
              }`}>
                {/* Tabs */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl mb-8 max-w-md">
                  {(['sandbox', 'buy', 'custom'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setProvisionTab(tab)}
                      className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        provisionTab === tab 
                          ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-sm' 
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="max-w-2xl space-y-8">
                  {provisionTab === 'sandbox' && (
                    <div className="space-y-6">
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10 underline-offset-4`}>
                        Claim a free sandbox extension on our shared number. Perfect for testing and development.
                      </p>
                      <div className={`p-8 border rounded-[2rem] ${theme === 'dark' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[10px] font-black text-indigo-600 uppercase mb-2">Sandbox Number:</p>
                            <p className={`text-3xl font-black font-mono tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>+1 (888) AGENT-AI</p>
                            <p className="text-sm text-slate-500 mt-2 font-mono">Extension: {Math.floor(1000 + Math.random() * 9000)}</p>
                          </div>
                          <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                            Claim Extension
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {provisionTab === 'buy' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Select Region</label>
                          <select 
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                            className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold appearance-none ${
                            theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}>
                            <option value="US">United States (+1) - $2.00/mo</option>
                            <option value="UK">United Kingdom (+44) - $4.00/mo</option>
                            <option value="CA">Canada (+1) - $2.50/mo</option>
                            <option value="AU">Australia (+61) - $6.00/mo</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Assign to Agent</label>
                          <select 
                            className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold appearance-none ${
                            theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}>
                            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className={`p-8 border rounded-[2rem] flex justify-between items-center ${theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                        <div>
                          <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">Available Number:</p>
                          <p className={`text-3xl font-black font-mono tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>+1 (555) {Math.floor(Math.random() * 900) + 100}-{Math.floor(Math.random() * 9000) + 1000}</p>
                          <p className="text-xs text-slate-500 mt-2">Instant activation. Includes 10 free SMS/mo.</p>
                        </div>
                        <button className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">
                          Purchase Now
                        </button>
                      </div>
                    </div>
                  )}

                  {provisionTab === 'custom' && (
                    <div className="space-y-6">
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} bg-slate-500/5 p-4 rounded-2xl border border-slate-500/10`}>
                        Import your own carrier numbers directly into the CallingAgent network.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                          <input 
                            type="text" 
                            placeholder="+1 555 000 0000"
                            className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold ${
                              theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Carrier Provider</label>
                          <select className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold appearance-none ${
                            theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}>
                            <option>Twilio BYOC</option>
                            <option>Vapi SIP</option>
                            <option>Retell AI</option>
                            <option>SignalWire</option>
                          </select>
                        </div>
                      </div>
                      <button className="w-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 py-4 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                        Verify and Connect Number
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className={`border rounded-[2.5rem] p-8 transition-all ${
                  theme === 'dark' ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
                }`}>
                  <h3 className={`text-xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Average Latency (ms)</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} vertical={false} />
                        <XAxis dataKey="time" stroke={theme === 'dark' ? '#475569' : '#94a3b8'} fontSize={10} tickLine={false} axisLine={false} interval={4} />
                        <YAxis stroke={theme === 'dark' ? '#475569' : '#94a3b8'} fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ 
                          backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', 
                          border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', 
                          borderRadius: '12px' 
                        }} />
                        <Area type="monotone" dataKey="latency" stroke="#a855f7" strokeWidth={3} fillOpacity={0.1} fill="#a855f7" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className={`border rounded-[2.5rem] p-8 transition-all ${
                  theme === 'dark' ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
                }`}>
                  <h3 className={`text-xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Agent Performance</h3>
                  <div className="space-y-6">
                    {agents.map((agent, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-400">{agent.name}</span>
                          <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{Math.floor(Math.random() * 20 + 80)}% CSAT</span>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                          <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${Math.random() * 20 + 80}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'billing' && (
            <motion.div 
              key="billing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl space-y-12"
            >
              <div className="text-center space-y-4">
                <h3 className={`text-5xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Choose Your Plan</h3>
                <p className="text-slate-500 text-lg font-bold">Scale your AI voice operations with the right infrastructure.</p>
                
                {/* Billing Toggle */}
                <div className="flex items-center justify-center space-x-4 pt-4">
                  <span className={`text-sm font-bold transition-colors ${!isBillingYearly ? (theme === 'dark' ? 'text-white' : 'text-slate-900') : 'text-slate-500'}`}>Monthly</span>
                  <button 
                    onClick={() => setIsBillingYearly(!isBillingYearly)}
                    className={`relative w-14 h-7 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'}`}
                  >
                    <div className={`w-5 h-5 bg-indigo-500 rounded-full transition-transform duration-300 transform ${isBillingYearly ? 'translate-x-7' : 'translate-x-0'}`}></div>
                  </button>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-bold transition-colors ${isBillingYearly ? (theme === 'dark' ? 'text-white' : 'text-slate-900') : 'text-slate-500'}`}>Yearly</span>
                    <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Save 20%</span>
                  </div>
                </div>

                <div className="max-w-md mx-auto pt-6">
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter Coupon Code"
                      className={`flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all ${
                        theme === 'dark' ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                    <button 
                      onClick={() => {
                        const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
                        if (coupon) {
                          setAppliedCoupon(coupon);
                          alert(`Coupon applied! ${coupon.discount}${coupon.type === 'percentage' ? '%' : '$'} discount.`);
                        } else {
                          alert('Invalid coupon code.');
                        }
                      }}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-500 transition-all"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedCoupon && (
                    <p className="text-emerald-400 text-xs font-bold mt-2">
                      Applied: {appliedCoupon.code} (-{appliedCoupon.discount}{appliedCoupon.type === 'percentage' ? '%' : '$'})
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => {
                  const basePrice = isBillingYearly ? plan.yearlyPrice : plan.price;
                  const discountedPrice = appliedCoupon 
                    ? (appliedCoupon.type === 'percentage' 
                        ? basePrice * (1 - appliedCoupon.discount / 100)
                        : Math.max(0, basePrice - appliedCoupon.discount))
                    : basePrice;

                  return (
                    <div 
                      key={plan.name} 
                      className={`relative border rounded-[3rem] p-10 flex flex-col h-full transition-all hover:scale-[1.02] ${
                        plan.name === currentPlan.name 
                          ? 'border-indigo-500' 
                          : theme === 'dark' 
                            ? 'bg-slate-900/40 border-white/5' 
                            : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500/30'
                      }`}
                    >
                      {plan.recommended && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl shadow-indigo-600/20">
                          Most Popular
                        </div>
                      )}
                      
                      <div className="mb-8">
                        <h4 className={`text-2xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h4>
                        <div className="flex items-baseline space-x-1">
                          <span className={`text-4xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            ${isBillingYearly ? Math.floor(discountedPrice / 12) : (discountedPrice || 0).toFixed(0)}
                          </span>
                          {appliedCoupon && (
                            <span className="text-slate-500 line-through text-sm ml-2">
                              ${isBillingYearly ? Math.floor(basePrice / 12) : plan.price}
                            </span>
                          )}
                          <span className="text-slate-500 font-bold">/month</span>
                        </div>
                        {isBillingYearly && (
                          <div className="text-[10px] font-bold text-indigo-400 mt-2 uppercase tracking-widest">
                            Billed ${(discountedPrice || 0).toFixed(0)} annually
                          </div>
                        )}
                      </div>

                      <div className="space-y-4 mb-12 flex-1">
                        {plan.features.map((feature, i) => (
                          <div key={i} className={`flex items-center space-x-3 text-sm font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4">
                        <button 
                          onClick={() => handlePlanUpgrade(plan)}
                          className={`w-full py-5 rounded-2xl font-black text-sm transition-all ${
                            plan.name === currentPlan.name 
                              ? theme === 'dark' ? 'bg-slate-800 text-slate-400 cursor-default' : 'bg-slate-100 text-slate-400 cursor-default'
                              : `bg-gradient-to-r ${plan.color} text-white hover:opacity-90 shadow-xl shadow-indigo-600/20`
                          }`}
                        >
                          {plan.name === currentPlan.name ? 'Current Plan' : `Purchase ${plan.name} Plan`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={`border rounded-[3rem] p-12 transition-all ${
                theme === 'dark' ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
              }`}>
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                  <div>
                    <h4 className={`text-2xl font-black mb-2 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Current Usage</h4>
                    <p className="text-slate-500 font-bold">You are currently on the <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{currentPlan.name}</span> plan.</p>
                  </div>
                  <div className="flex gap-12">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Minutes Used</p>
                      <p className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>124 / {currentPlan.mins}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Agents</p>
                      <p className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{agents.length} / {currentPlan.agents}</p>
                    </div>
                  </div>
                </div>
                <div className={`w-full h-2 rounded-full mt-8 overflow-hidden ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                    style={{ width: `${(124 / currentPlan.mins) * 100}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && isAdmin && (
            <motion.div 
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h3 className={`text-4xl font-black tracking-tighter mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>User Management</h3>
                  <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Control access and monitor platform growth.</p>
                </div>
                <button 
                  onClick={() => setShowAddUserModal(true)}
                  className={`px-6 py-3 rounded-2xl font-black text-sm transition-all flex items-center space-x-2 shadow-xl active:scale-95 ${
                    theme === 'dark' ? 'bg-white text-slate-950 hover:bg-slate-200 shadow-white/5' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New User</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {loadingUsers && (
                  <div className="flex justify-center p-20">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {!loadingUsers && allUsers.length === 0 && (
                  <div className={`p-20 text-center border-2 border-dashed rounded-[3rem] ${theme === 'dark' ? 'border-white/5 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                    No users found in the system yet.
                  </div>
                )}
                {!loadingUsers && allUsers.map((u) => (
                  <div key={u.id} className={`border rounded-[2.5rem] p-8 flex items-center justify-between group transition-all ${
                    theme === 'dark' ? 'bg-slate-900/40 border-white/5 hover:border-white/10' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                  }`}>
                    <div className="flex items-center space-x-6">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-xl">
                        {u.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{u.email}</h4>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                            u.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                          }`}>
                            {u.role}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs font-bold text-slate-500">
                          <span className="flex items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></div>
                            {u.status}
                          </span>
                          <span>Joined {formatDate(u.createdAt)}</span>
                          <span>{u.usage || 0} mins used</span>
                        </div>
                      </div>
                    </div>
                    
                        <div className="flex items-center space-x-3">
                          <div className="text-right mr-6">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Balance</p>
                            <p className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>${(u.balance || 0).toFixed(2)}</p>
                          </div>
                      <button 
                        onClick={() => onImpersonate(u.email)}
                        className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all border ${
                          theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white border-white/5' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                        }`}
                      >
                        Review User Side
                      </button>
                      <button 
                        onClick={() => {
                          setUserToBill(u);
                          setShowBillModal(true);
                        }}
                        className={`px-4 py-2.5 text-white rounded-xl font-black text-xs transition-all shadow-lg ${
                          isAdmin && !isImpersonating
                            ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                            : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                        }`}
                      >
                        Bill User
                      </button>
                      <button 
                        onClick={() => {
                          setUserToDelete(u);
                          setShowDeleteModal(true);
                        }}
                        className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-all border border-rose-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'invoices' && isAdmin && (
            <motion.div 
              key="invoices"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div>
                <h3 className={`text-4xl font-black tracking-tighter mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Invoices</h3>
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Track payments and outstanding balances.</p>
              </div>

              <div className={`border rounded-[2.5rem] overflow-x-auto transition-all ${
                theme === 'dark' ? 'bg-slate-900/30 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
              }`}>
                <table className="w-full text-left text-sm min-w-[800px]">
                  <thead className={`text-[10px] font-black uppercase tracking-widest text-slate-500 ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                    <tr>
                      <th className="px-8 py-5">Invoice ID</th>
                      <th className="px-8 py-5">Customer</th>
                      <th className="px-8 py-5">Amount</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5">Date</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-100'}`}>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className={`group transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                        <td className={`px-8 py-6 font-mono text-xs ${
                          isAdmin && !isImpersonating ? 'text-emerald-400' : 'text-indigo-400'
                        }`}>{inv.id}</td>
                        <td className={`px-8 py-6 font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{inv.user}</td>
                        <td className={`px-8 py-6 font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>${(inv.amount || 0).toFixed(2)}</td>
                        <td className="px-8 py-6">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                            inv.status === 'Paid' 
                              ? theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                              : theme === 'dark' ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className={`px-8 py-6 font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{inv.date}</td>
                        <td className="px-8 py-6 text-right">
                          <button className={`transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'support' && (
            <motion.div 
              key="support"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl space-y-8"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h3 className={`text-4xl font-black tracking-tighter mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Support</h3>
                  <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Need help? Open a ticket and our team will get back to you.</p>
                </div>
                <button 
                  onClick={() => setShowTicketModal(true)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-500 transition-all flex items-center space-x-2 shadow-xl shadow-indigo-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Open New Ticket</span>
                </button>
              </div>

              <div className="space-y-4">
                {tickets.filter(t => t.userEmail === user.email).map(ticket => (
                  <div key={ticket.id} className={`border rounded-[2.5rem] p-8 transition-all ${
                    theme === 'dark' ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{ticket.subject}</h4>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                            ticket.status === 'Open' ? theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-700' :
                            ticket.status === 'Resolved' ? theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700' :
                            theme === 'dark' ? 'bg-slate-500/10 text-slate-400' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold">Opened on {ticket.createdAt}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        ticket.priority === 'High' ? 'border-rose-500/20 text-rose-500 bg-rose-500/5' :
                        ticket.priority === 'Medium' ? 'border-amber-500/20 text-amber-500 bg-amber-500/5' :
                        'border-slate-500/20 text-slate-400 bg-slate-500/5'
                      }`}>
                        {ticket.priority} Priority
                      </span>
                    </div>
                    <p className={`text-sm mb-6 leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{ticket.description}</p>
                    
                    {ticket.replies.length > 0 && (
                      <div className={`space-y-4 mb-6 pt-6 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                        {ticket.replies.map((reply, idx) => (
                          <div key={idx} className={`flex ${reply.role === 'admin' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl ${
                              reply.role === 'admin' 
                                ? theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900' 
                                : 'bg-indigo-600 text-white'
                            }`}>
                              <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">
                                {reply.role === 'admin' ? 'Support Team' : 'You'} • {reply.timestamp}
                              </p>
                              <p className="text-sm font-medium">{reply.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                      <div className="flex space-x-3">
                        <input 
                          type="text" 
                          value={selectedTicket?.id === ticket.id ? ticketReply : ''}
                          onChange={(e) => {
                            setSelectedTicket(ticket);
                            setTicketReply(e.target.value);
                          }}
                          onFocus={() => setSelectedTicket(ticket)}
                          placeholder="Type your reply..."
                          className={`flex-1 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-all border ${
                            theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                        <button 
                          onClick={() => handleReplyTicket(ticket.id)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs transition-all"
                        >
                          Send
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'tickets' && isAdmin && (
            <motion.div 
              key="tickets"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div>
                <h3 className={`text-4xl font-black tracking-tighter mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Support Tickets</h3>
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Manage customer inquiries and resolve issues.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {tickets.map(ticket => (
                  <div key={ticket.id} className={`border rounded-[2.5rem] p-8 transition-all ${
                    theme === 'dark' ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
                  }`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black border ${
                          theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {ticket.userEmail[0].toUpperCase()}
                        </div>
                        <div>
                          <h4 className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{ticket.subject}</h4>
                          <p className="text-xs text-slate-500 font-bold">From {ticket.userEmail} • {ticket.createdAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          ticket.priority === 'High' ? 'border-rose-500/20 text-rose-500 bg-rose-500/5' :
                          ticket.priority === 'Medium' ? 'border-amber-500/20 text-amber-500 bg-amber-500/5' :
                          'border-slate-500/20 text-slate-400 bg-slate-500/5'
                        }`}>
                          {ticket.priority} Priority
                        </span>
                        <select 
                          value={ticket.status}
                          onChange={(e) => {
                            setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: e.target.value as any } : t));
                          }}
                          className={`border rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-emerald-500 transition-all ${
                            theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-slate-950/50 rounded-2xl border border-white/5 mb-6">
                      <p className="text-slate-300 text-sm leading-relaxed">{ticket.description}</p>
                    </div>

                    {ticket.replies.length > 0 && (
                      <div className="space-y-4 mb-6">
                        {ticket.replies.map((reply, idx) => (
                          <div key={idx} className={`flex ${reply.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl ${
                              reply.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-white'
                            }`}>
                              <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">
                                {reply.role === 'admin' ? 'Support Team (You)' : 'Customer'} • {reply.timestamp}
                              </p>
                              <p className="text-sm font-medium">{reply.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <input 
                        type="text" 
                        value={selectedTicket?.id === ticket.id ? ticketReply : ''}
                        onChange={(e) => {
                          setSelectedTicket(ticket);
                          setTicketReply(e.target.value);
                        }}
                        onFocus={() => setSelectedTicket(ticket)}
                        placeholder="Type your response..."
                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                      />
                      <button 
                        onClick={() => handleReplyTicket(ticket.id)}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-indigo-600/20"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          {activeTab === 'admin-plans' && isAdmin && (
            <motion.div 
              key="admin-plans"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h3 className={`text-4xl font-black tracking-tighter mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Subscription Plans</h3>
                  <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Manage pricing, features, and limits for your platform.</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingPlan(null);
                    setShowPlanModal(true);
                  }}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-500 transition-all flex items-center space-x-2 shadow-xl shadow-emerald-600/20 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Plan</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div key={plan.name} className={`border rounded-[2.5rem] p-8 flex flex-col group transition-all ${
                    theme === 'dark' ? 'bg-slate-900/40 border-white/5 hover:border-emerald-500/30' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                  }`}>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h4>
                        <div className="flex flex-col">
                          <p className="text-emerald-400 font-black text-xl">${plan.price}/mo</p>
                          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">${plan.yearlyPrice}/yr (Save 20%)</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setEditingPlan(plan);
                            setShowPlanModal(true);
                          }}
                          className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setPlans(plans.filter(p => p.name !== plan.name))}
                          className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500' : 'bg-rose-50 hover:bg-rose-100 text-rose-600'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-8 flex-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500 uppercase tracking-widest">Minutes</span>
                        <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{plan.mins}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500 uppercase tracking-widest">Agents</span>
                        <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{plan.agents}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500 uppercase tracking-widest">Numbers</span>
                        <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{plan.numbers}</span>
                      </div>
                    </div>

                    <div className={`pt-6 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Key Features</p>
                      <div className="flex flex-wrap gap-2">
                        {plan.features.slice(0, 3).map((f, i) => (
                          <span key={i} className={`px-2 py-1 rounded-md text-[9px] font-bold ${
                            theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'
                          }`}>{f}</span>
                        ))}
                        {plan.features.length > 3 && (
                          <span className={`px-2 py-1 rounded-md text-[9px] font-bold ${
                            theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'
                          }`}>
                            +{plan.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'admin-coupons' && isAdmin && (
            <motion.div 
              key="admin-coupons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h3 className={`text-4xl font-black tracking-tighter mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Coupons & Discounts</h3>
                  <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Create promotional codes to attract and retain customers.</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingCoupon(null);
                    setShowCouponModal(true);
                  }}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-500 transition-all flex items-center space-x-2 shadow-xl shadow-emerald-600/20 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {coupons.map((coupon) => (
                  <div key={coupon.code} className={`border rounded-[2rem] p-6 flex items-center justify-between group transition-all ${
                    theme === 'dark' ? 'bg-slate-900/40 border-white/5 hover:border-emerald-500/30' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                  }`}>
                    <div className="flex items-center space-x-6">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <Tag className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className={`text-xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{coupon.code}</h4>
                        <p className="text-sm font-bold text-slate-500">
                          {coupon.discount}{coupon.type === 'percentage' ? '%' : '$'} off • Expires {coupon.expiry}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => {
                          setEditingCoupon(coupon);
                          setShowCouponModal(true);
                        }}
                        className={`p-2.5 rounded-xl transition-all ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setCoupons(coupons.filter(c => c.code !== coupon.code))}
                        className={`p-2.5 rounded-xl transition-all ${theme === 'dark' ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500' : 'bg-rose-50 hover:bg-rose-100 text-rose-600'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'admin-blogs' && isAdmin && (
            <motion.div 
              key="admin-blogs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h3 className={`text-4xl font-black tracking-tighter mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Blog Manager</h3>
                  <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Publish updates, tutorials, and news to your website.</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingBlog(null);
                    setShowBlogModal(true);
                  }}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-500 transition-all flex items-center space-x-2 shadow-xl shadow-emerald-600/20 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Write New Post</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blogs.map((blog) => (
                  <div key={blog.id} className={`border rounded-[2.5rem] overflow-hidden group transition-all ${
                    theme === 'dark' ? 'bg-slate-900/40 border-white/5 hover:border-emerald-500/30' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                  }`}>
                    <div className="h-48 relative overflow-hidden">
                      <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                      <div className={`absolute inset-0 bg-gradient-to-t ${theme === 'dark' ? 'from-slate-950' : 'from-white'} to-transparent`}></div>
                      <div className="absolute bottom-4 left-6">
                        <span className="px-2 py-1 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-md">Published</span>
                      </div>
                    </div>
                    <div className="p-8">
                      <h4 className={`text-xl font-black mb-2 line-clamp-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{blog.title}</h4>
                      <p className={`text-sm font-bold mb-6 line-clamp-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{blog.content}</p>
                      <div className={`flex items-center justify-between pt-6 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                            {blog.author[0]}
                          </div>
                          <span className="text-xs font-bold text-slate-400">{blog.author} • {blog.date}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              setEditingBlog(blog);
                              setShowBlogModal(true);
                            }}
                            className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setBlogs(blogs.filter(b => b.id !== blog.id))}
                            className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500' : 'bg-rose-50 hover:bg-rose-100 text-rose-600'}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'enterprise' && (
            <motion.div 
              key="enterprise"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h3 className={`text-4xl font-black tracking-tighter mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {isAdmin ? 'Enterprise Requests' : 'Enterprise Solutions'}
                  </h3>
                  <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
                    {isAdmin ? 'Manage custom requests from high-volume clients.' : 'Scale your operations with custom voice AI solutions.'}
                  </p>
                </div>
                {!isAdmin && (
                  <button 
                    onClick={() => setShowEnterpriseModal(true)}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-500 transition-all flex items-center space-x-2 shadow-xl shadow-indigo-600/20 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Request Custom Solution</span>
                  </button>
                )}
              </div>

              {isAdmin ? (
                <div className="grid grid-cols-1 gap-6">
                  {enterpriseRequests.length === 0 ? (
                    <div className={`p-12 text-center border-2 border-dashed rounded-[3rem] transition-all ${theme === 'dark' ? 'border-white/5 bg-slate-900/20' : 'border-slate-200 bg-white shadow-sm'}`}>
                      <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-20" />
                      <p className={`font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>No enterprise requests yet.</p>
                    </div>
                  ) : (
                    enterpriseRequests.map((req) => (
                      <div key={req.id} className={`border rounded-[2.5rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
                        theme === 'dark' ? 'bg-slate-900/40 border-white/5 hover:border-white/10' : 'bg-white border-slate-200 hover:border-indigo-500/20 shadow-sm'
                      }`}>
                        <div className="flex items-center space-x-6">
                          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-2xl border border-indigo-500/20">
                            {req.companyName[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center space-x-3 mb-1">
                              <h4 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{req.companyName}</h4>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                req.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
                                req.status === 'Reviewing' ? 'bg-blue-500/10 text-blue-500' :
                                req.status === 'Responded' ? 'bg-emerald-500/10 text-emerald-500' :
                                'bg-slate-500/10 text-slate-500'
                              }`}>
                                {req.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                              <span className="flex items-center"><User className="w-3.5 h-3.5 mr-1.5" /> {req.userEmail}</span>
                              <span className="flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-1.5" /> {req.monthlyVolume} mins/mo</span>
                              <span className="flex items-center"><History className="w-3.5 h-3.5 mr-1.5" /> {req.createdAt}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => {
                              setSelectedEnterpriseRequest(req);
                              setEnterpriseResponse(req.adminResponse || '');
                            }}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs transition-all shadow-lg shadow-indigo-600/20"
                          >
                            Review & Respond
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <div className={`p-10 rounded-[3rem] border transition-all ${theme === 'dark' ? 'bg-indigo-600/10 border-indigo-500/20' : 'bg-white border-slate-200 shadow-xl'}`}>
                      <h4 className={`text-2xl font-black mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Custom Enterprise Solutions</h4>
                      <p className={`text-sm font-medium leading-relaxed mb-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        Our Enterprise tier is designed for companies that require high-volume processing, custom LLM integrations, and dedicated infrastructure. Get a tailored plan that fits your exact business needs.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                          { title: 'Dedicated Infrastructure', desc: 'Zero-latency processing on private clusters.' },
                          { title: 'Custom LLM Training', desc: 'Agents trained on your specific business data.' },
                          { title: 'SLA Guarantees', desc: '99.99% uptime with dedicated support engineers.' },
                          { title: 'Advanced Security', desc: 'SOC2 compliance and custom data retention policies.' }
                        ].map((feature, i) => (
                          <div key={i} className="flex items-start space-x-4">
                            <div className="mt-1 p-1 bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                            <div>
                              <p className={`text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{feature.title}</p>
                              <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>{feature.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className={`text-xl font-black px-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Your Requests</h4>
                      {enterpriseRequests.filter(r => r.userEmail === user.email).length === 0 ? (
                        <div className={`p-12 text-center border-2 border-dashed rounded-[2.5rem] ${theme === 'dark' ? 'border-white/5 bg-slate-900/20' : 'border-slate-200 bg-slate-50'}`}>
                          <p className="text-slate-500 font-bold">You haven't submitted any enterprise requests yet.</p>
                        </div>
                      ) : (
                        enterpriseRequests.filter(r => r.userEmail === user.email).map((req) => (
                          <div key={req.id} className={`p-8 border rounded-[2.5rem] transition-all ${
                            theme === 'dark' ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                          }`}>
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h5 className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{req.companyName}</h5>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{req.createdAt}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                req.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
                                req.status === 'Reviewing' ? 'bg-blue-500/10 text-blue-500' :
                                req.status === 'Responded' ? 'bg-emerald-500/10 text-emerald-500' :
                                'bg-slate-500/10 text-slate-500'
                              }`}>
                                {req.status}
                              </span>
                            </div>
                            <div className={`p-4 rounded-xl mb-4 ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-100/50'}`}>
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Your Needs</p>
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{req.needs}</p>
                            </div>
                            {req.adminResponse && (
                              <div className={`p-6 rounded-2xl border-l-4 border-indigo-500 transition-all ${theme === 'dark' ? 'bg-indigo-500/5' : 'bg-indigo-50/50'}`}>
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Admin Response</p>
                                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{req.adminResponse}</p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className={`p-8 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
                      <h4 className={`text-xl font-black mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Why Enterprise?</h4>
                      <div className="space-y-6">
                        {[
                          { icon: ShieldCheck, title: 'Compliance', desc: 'Custom data residency and security protocols.' },
                          { icon: Users, title: 'Team Access', desc: 'Unlimited team members with granular RBAC.' },
                          { icon: Settings, title: 'API Priority', desc: 'Highest rate limits and direct API support.' }
                        ].map((item, i) => (
                          <div key={i} className="flex items-start space-x-4">
                            <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                              <item.icon className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div>
                              <p className={`text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.title}</p>
                              <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl space-y-12"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <h3 className={`text-4xl font-black tracking-tighter mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>My Profile</h3>
                  <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Manage your personal information, security, and preferences.</p>
                </div>
                {profileSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 text-xs font-black uppercase tracking-widest"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Profile Updated Successfully</span>
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <div className={`border rounded-[3rem] p-8 text-center transition-all ${theme === 'dark' ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
                    <div className="relative inline-block mb-6 group">
                      <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-4xl font-black border-2 border-dashed overflow-hidden transition-all ${
                        theme === 'dark' ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                      }`}>
                        {profilePic ? (
                          <img src={profilePic} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          user.email[0].toUpperCase()
                        )}
                      </div>
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/40 hover:scale-110 transition-all"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*" 
                      />
                    </div>
                    <h4 className={`text-xl font-black mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{profileName || 'Anonymous User'}</h4>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{user.role}</p>
                    
                    <div className={`mt-8 pt-8 border-t text-left space-y-4 ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                          <BarChart3 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Status</p>
                          <p className="text-xs font-bold text-emerald-400">Active & Verified</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Plan</p>
                          <p className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{currentPlan.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className={`border rounded-[3rem] p-10 space-y-8 transition-all ${theme === 'dark' ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
                      <div className="space-y-6">
                        <h4 className={`text-lg font-black flex items-center space-x-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          <User className="w-5 h-5 text-indigo-500" />
                          <span>Personal Information</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                            <input 
                              type="text" 
                              value={profileName}
                              onChange={(e) => setProfileName(e.target.value)}
                              className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold ${
                                theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`}
                              placeholder="Your name"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address (Read-only)</label>
                            <input 
                              type="email" 
                              value={user.email}
                              disabled
                              className={`w-full border rounded-2xl px-6 py-4 cursor-not-allowed font-bold ${
                                theme === 'dark' ? 'bg-slate-950/50 border-white/5 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400'
                              }`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Profile Picture URL</label>
                          <input 
                            type="text" 
                            value={profilePic}
                            onChange={(e) => setProfilePic(e.target.value)}
                            className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold ${
                              theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                            placeholder="https://example.com/photo.jpg"
                          />
                        </div>
                      </div>

                      <div className={`pt-8 border-t space-y-6 ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                        <h4 className={`text-lg font-black flex items-center space-x-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          <Lock className="w-5 h-5 text-indigo-500" />
                          <span>Security & Password</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">New Password</label>
                            <input 
                              type="password" 
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold ${
                                theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`}
                              placeholder="••••••••"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                            <input 
                              type="password" 
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold ${
                                theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`}
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button 
                          type="submit"
                          disabled={isUpdatingProfile}
                          className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-500 transition-all active:scale-95 shadow-xl shadow-indigo-600/20 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUpdatingProfile ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Saving Changes...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              <span>Save Profile Settings</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Ticket Modal */}
      <AnimatePresence>
        {showTicketModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 backdrop-blur-xl ${theme === 'dark' ? 'bg-slate-950/90' : 'bg-slate-900/40'}`} 
              onClick={() => setShowTicketModal(false)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-lg border rounded-[3rem] p-10 shadow-2xl overflow-hidden transition-all ${
                theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
              <h3 className={`text-3xl font-black mb-8 tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Open Support Ticket</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Subject</label>
                  <input 
                    type="text" 
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-slate-400 ${
                      theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`} 
                    placeholder="Brief summary of the issue" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Priority</label>
                  <select 
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                    className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold appearance-none ${
                      theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Description</label>
                  <textarea 
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    rows={4}
                    className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-slate-400 resize-none ${
                      theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`} 
                    placeholder="Describe the problem in detail..." 
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button 
                    onClick={() => setShowTicketModal(false)}
                    className={`flex-1 px-8 py-4 rounded-2xl font-black text-sm transition-all ${
                      theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateTicket}
                    disabled={!newTicket.subject || !newTicket.description}
                    className="flex-1 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Ticket
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bill User Modal */}
      <AnimatePresence>
        {showBillModal && userToBill && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 backdrop-blur-xl ${theme === 'dark' ? 'bg-slate-950/90' : 'bg-slate-900/40'}`} 
              onClick={() => setShowBillModal(false)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-lg border rounded-[3rem] p-10 shadow-2xl overflow-hidden transition-all ${
                theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
              <h3 className={`text-3xl font-black mb-2 tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Bill User</h3>
              <p className="text-slate-500 text-sm font-bold mb-8">Generate a manual invoice for {userToBill.email}</p>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Amount ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-slate-400 ${
                      theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`} 
                    placeholder="10.00" 
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button 
                    onClick={() => setShowBillModal(false)}
                    className={`flex-1 px-8 py-4 rounded-2xl font-black text-sm transition-all ${
                      theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleBillUser}
                    className="flex-1 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/20 transition-all"
                  >
                    Generate Invoice
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete User Modal */}
      <AnimatePresence>
        {showDeleteModal && userToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 backdrop-blur-xl ${theme === 'dark' ? 'bg-slate-950/90' : 'bg-slate-900/40'}`} 
              onClick={() => setShowDeleteModal(false)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-lg border rounded-[3rem] p-10 shadow-2xl overflow-hidden text-center transition-all ${
                theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-10 h-10 text-rose-500" />
              </div>
              <h3 className={`text-3xl font-black mb-2 tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Remove User?</h3>
              <p className="text-slate-500 text-sm font-bold mb-8">Are you sure you want to remove <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{userToDelete.email}</span>? This action cannot be undone.</p>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className={`flex-1 px-8 py-4 rounded-2xl font-black text-sm transition-all ${
                    theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  Keep User
                </button>
                <button 
                  onClick={() => handleRemoveUser(userToDelete.id)}
                  className="flex-1 px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-rose-500/20 transition-all"
                >
                  Remove Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddUserModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 backdrop-blur-xl ${theme === 'dark' ? 'bg-slate-950/90' : 'bg-slate-900/40'}`} 
              onClick={() => setShowAddUserModal(false)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-lg border rounded-[3rem] p-10 shadow-2xl overflow-hidden transition-all ${
                theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
              <h3 className={`text-3xl font-black mb-8 tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Add New User</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-slate-400 ${
                      theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`} 
                    placeholder="user@example.com" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Role</label>
                  <select 
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold appearance-none ${
                      theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex space-x-4 pt-4">
                  <button 
                    onClick={() => setShowAddUserModal(false)}
                    className={`flex-1 px-8 py-4 rounded-2xl font-black text-sm transition-all ${
                      theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddUser}
                    disabled={!newUserEmail}
                    className="flex-1 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add User
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Outbound Call Modal */}
      <AnimatePresence>
        {showOutboundModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 backdrop-blur-xl ${theme === 'dark' ? 'bg-slate-950/90' : 'bg-slate-900/40'}`} 
              onClick={() => setShowOutboundModal(false)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-lg border rounded-[3rem] p-10 shadow-2xl overflow-hidden transition-all ${
                theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
              <h3 className={`text-3xl font-black mb-8 tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Initiate Outbound Call</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Customer Phone Number</label>
                  <input 
                    type="tel" 
                    value={outboundNumber}
                    onChange={(e) => setOutboundNumber(e.target.value)}
                    className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-slate-400 ${
                      theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`} 
                    placeholder="+1234567890" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Select Agent</label>
                  <select 
                    value={outboundAgentId}
                    onChange={(e) => setOutboundAgentId(e.target.value)}
                    className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold appearance-none ${
                      theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="">Select an agent...</option>
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.provider || 'CallingAgent'})</option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-4 pt-4">
                  <button 
                    onClick={() => setShowOutboundModal(false)}
                    className={`flex-1 px-8 py-4 rounded-2xl font-black text-sm transition-all ${
                      theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleOutboundCall}
                    disabled={!outboundNumber || !outboundAgentId}
                    className="flex-1 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Call
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Connect Number Modal */}
      <AnimatePresence>
        {showConnectNumber && !isAdmin && !isImpersonating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 backdrop-blur-xl ${theme === 'dark' ? 'bg-slate-950/90' : 'bg-slate-900/40'}`} 
              onClick={() => setShowConnectNumber(false)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-xl border rounded-[3rem] p-10 shadow-2xl overflow-hidden transition-all ${
                theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-600 to-teal-600"></div>
              <h3 className={`text-3xl font-black mb-8 tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Provision Number</h3>
              
              {/* Tabs */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl mb-8">
                {(['sandbox', 'buy', 'custom'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setProvisionTab(tab)}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      provisionTab === tab 
                        ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                {provisionTab === 'sandbox' && (
                  <div className="space-y-6">
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10`}>
                      Claim a free sandbox extension on our shared number. Perfect for testing and development.
                    </p>
                    <div className={`p-6 border rounded-2xl ${theme === 'dark' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                      <p className="text-[10px] font-black text-indigo-600 uppercase mb-2">Sandbox Number:</p>
                      <p className={`text-2xl font-black font-mono tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>+1 (888) AGENT-AI</p>
                      <p className="text-xs text-slate-500 mt-2 font-mono">Ext: {Math.floor(1000 + Math.random() * 9000)}</p>
                    </div>
                  </div>
                )}

                {provisionTab === 'buy' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Select Region</label>
                      <select 
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold appearance-none ${
                        theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}>
                        <option value="US">United States (+1) - $2.00/mo</option>
                        <option value="UK">United Kingdom (+44) - $4.00/mo</option>
                        <option value="CA">Canada (+1) - $2.50/mo</option>
                        <option value="AU">Australia (+61) - $6.00/mo</option>
                      </select>
                    </div>
                    <div className={`p-6 border rounded-2xl ${theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                      <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">Generated Number:</p>
                      <p className={`text-2xl font-black font-mono tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>+1 (555) {Math.floor(Math.random() * 900) + 100}-{Math.floor(Math.random() * 9000) + 1000}</p>
                    </div>
                  </div>
                )}

                {provisionTab === 'custom' && (
                  <div className="space-y-6">
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      Import your existing numbers from Twilio or Vapi.
                    </p>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                      <input 
                        type="text" 
                        placeholder="+1 555 000 0000"
                        className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold ${
                        theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`} />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Assign to Agent</label>
                  <select 
                    value={provisioningAgentId}
                    onChange={(e) => setProvisioningAgentId(e.target.value)}
                    className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold appearance-none ${
                    theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}>
                    <option value="">Select Agent...</option>
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button 
                    onClick={() => setShowConnectNumber(false)}
                    className={`flex-1 px-8 py-4 rounded-2xl font-black text-sm transition-all ${
                      theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (!provisioningAgentId) {
                        alert("Please select an agent first.");
                        return;
                      }
                      const newNum: Number = {
                        id: Math.random().toString(36).substr(2, 9),
                        number: provisionTab === 'sandbox' ? '+1 (888) AGENT-AI' : '+1 (555) 321-4321',
                        agentId: provisioningAgentId,
                        status: 'Active',
                        location: provisionTab === 'sandbox' ? 'Sandbox' : (selectedRegion === 'US' ? 'United States' : 'International'),
                        type: provisionTab === 'buy' ? 'real' : provisionTab
                      };
                      setNumbers([...numbers, newNum]);
                      setShowConnectNumber(false);
                      setProvisioningAgentId('');
                    }}
                    className={`flex-1 px-8 py-4 rounded-2xl font-black text-sm shadow-xl transition-all ${
                      provisionTab === 'buy' 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                    }`}
                  >
                    {provisionTab === 'buy' ? 'Purchase Number' : 'Connect Number'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Call Details Modal */}
      <AnimatePresence>
        {showCallDetailsModal && selectedCall && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 backdrop-blur-xl ${theme === 'dark' ? 'bg-slate-950/90' : 'bg-slate-900/40'}`} 
              onClick={() => setShowCallDetailsModal(false)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-2xl border rounded-[3rem] p-10 shadow-2xl overflow-hidden transition-all ${
                theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className={`absolute top-0 left-0 w-full h-2 ${
                selectedCall.sentiment === 'Positive' ? 'bg-emerald-500' : 
                selectedCall.sentiment === 'Negative' ? 'bg-rose-500' : 'bg-indigo-500'
              }`}></div>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className={`text-3xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Call Analysis</h3>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{selectedCall.agent} • {selectedCall.caller}</p>
                </div>
                <button 
                  onClick={() => setShowCallDetailsModal(false)}
                  className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950/50 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Duration</p>
                  <p className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{selectedCall.duration}</p>
                </div>
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950/50 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Outcome</p>
                  <p className="text-xl font-black text-indigo-400">{selectedCall.outcome}</p>
                </div>
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950/50 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sentiment</p>
                  <p className={`text-xl font-black ${
                    selectedCall.sentiment === 'Positive' ? 'text-emerald-400' : 
                    selectedCall.sentiment === 'Negative' ? 'text-rose-400' : 'text-indigo-400'
                  }`}>{selectedCall.sentiment}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Sentiment Analysis Result</label>
                  <div className={`p-6 rounded-2xl border text-sm font-medium leading-relaxed ${
                    theme === 'dark' ? 'bg-slate-950 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    {selectedCall.sentimentAnalysis || "Sentiment analysis is being processed for this call. Please check back shortly."}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Transcript</label>
                  <div className={`p-6 rounded-2xl border text-sm font-medium leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar ${
                    theme === 'dark' ? 'bg-slate-950 border-white/10 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    {selectedCall.transcript ? (
                      <div className="space-y-6">
                        {selectedCall.transcript.split('\n').map((line, i) => {
                          const isAgent = line.startsWith('Agent:');
                          return (
                            <div key={i} className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}>
                              <span className={`text-[10px] font-black uppercase mb-1 ${isAgent ? 'text-indigo-400' : 'text-emerald-400'}`}>
                                {isAgent ? 'Agent' : 'Caller'}
                              </span>
                              <div className={`max-w-[85%] px-6 py-3 rounded-[1.5rem] ${
                                isAgent 
                                  ? theme === 'dark' ? 'bg-indigo-500/10 text-slate-200 border border-indigo-500/20' : 'bg-indigo-50 text-slate-700 border border-indigo-100'
                                  : theme === 'dark' ? 'bg-slate-800 text-slate-400 border border-white/5' : 'bg-white text-slate-600 border border-slate-200'
                              }`}>
                                {line.replace(/^(Agent|Caller): /, '')}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="italic text-slate-500">Transcript not available for this call.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <button 
                  onClick={() => setShowCallDetailsModal(false)}
                  className={`w-full py-5 rounded-2xl text-xs font-black uppercase tracking-[0.3em] transition-all border ${
                    theme === 'dark' ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Close Analysis
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Agent Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 backdrop-blur-md ${theme === 'dark' ? 'bg-slate-950/80' : 'bg-slate-900/40'}`} 
              onClick={() => setShowCreateModal(false)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-2xl border rounded-[3rem] p-10 shadow-2xl overflow-hidden transition-all ${
                theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
              <h3 className={`text-3xl font-black mb-8 tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Deploy New Agent</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Agent Name</label>
                  <input 
                    type="text" 
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                    className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-slate-400 ${
                      theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`} 
                    placeholder="e.g. Sales Assistant" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">AI Provider</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setNewAgent({...newAgent, provider: 'CallingAgent'})}
                      className={`py-4 rounded-2xl font-black text-sm transition-all border ${
                        newAgent.provider === 'CallingAgent' 
                          ? 'bg-indigo-600/10 border-indigo-600 text-indigo-400' 
                          : theme === 'dark' 
                            ? 'bg-slate-950 border-white/10 text-slate-500 hover:border-white/20' 
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      CallingAgent Native
                    </button>
                    <button 
                      onClick={() => setNewAgent({...newAgent, provider: 'Vapi'})}
                      className={`py-4 rounded-2xl font-black text-sm transition-all border ${
                        newAgent.provider === 'Vapi' 
                          ? 'bg-indigo-600/10 border-indigo-600 text-indigo-400' 
                          : theme === 'dark' 
                            ? 'bg-slate-950 border-white/10 text-slate-500 hover:border-white/20' 
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      Vapi.ai
                    </button>
                  </div>
                </div>
                {newAgent.provider === 'Vapi' ? (
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Vapi Assistant ID</label>
                    <input 
                      type="text" 
                      value={newAgent.vapiAssistantId}
                      onChange={(e) => setNewAgent({...newAgent, vapiAssistantId: e.target.value})}
                      className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-slate-400 ${
                        theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`} 
                      placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000" 
                    />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Voice Selection</label>
                        <div className={`border rounded-2xl p-2 max-h-[300px] overflow-y-auto custom-scrollbar ${
                          theme === 'dark' ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div className="grid grid-cols-1 gap-2">
                            {VOICES.map((v) => (
                              <button
                                key={v.id}
                                onClick={() => setNewAgent({
                                  ...newAgent, 
                                  voice: v.id, 
                                  gender: v.gender as any
                                })}
                                className={`flex items-center justify-between p-3 rounded-xl transition-all border ${
                                  newAgent.voice === v.id
                                    ? 'bg-indigo-600/10 border-indigo-600 text-indigo-400'
                                    : theme === 'dark'
                                      ? 'hover:bg-white/5 border-transparent text-slate-400'
                                      : 'hover:bg-slate-200/50 border-transparent text-slate-600'
                                }`}
                              >
                                <div className="text-left">
                                  <div className="text-sm font-black tracking-tight">{v.name}</div>
                                  <div className="text-[10px] opacity-60 font-bold">{v.engine} • {v.gender}</div>
                                </div>
                                {newAgent.voice === v.id && <CheckCircle2 className="w-4 h-4" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Logic Orchestrator</label>
                        <select 
                          value={newAgent.logic}
                          onChange={(e) => setNewAgent({...newAgent, logic: e.target.value})}
                          className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold appearance-none mb-6 ${
                            theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        >
                          <option>CallingAgent Orchestrator</option>
                          <option>FastAPI Agent</option>
                          <option>Make.com Hook</option>
                          <option>Custom Webhook</option>
                        </select>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pitch</label>
                              <span className="text-[10px] font-black text-indigo-500">{newAgent.pitch}x</span>
                            </div>
                            <input 
                              type="range" 
                              min="0.5" 
                              max="2.0" 
                              step="0.1"
                              value={newAgent.pitch}
                              onChange={(e) => setNewAgent({...newAgent, pitch: parseFloat(e.target.value)})}
                              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Speed</label>
                              <span className="text-[10px] font-black text-indigo-500">{newAgent.speed}x</span>
                            </div>
                            <input 
                              type="range" 
                              min="0.5" 
                              max="2.0" 
                              step="0.1"
                              value={newAgent.speed}
                              onChange={(e) => setNewAgent({...newAgent, speed: parseFloat(e.target.value)})}
                              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">System Instruction (Prompt)</label>
                  <textarea 
                    rows={4} 
                    value={newAgent.prompt}
                    onChange={(e) => setNewAgent({...newAgent, prompt: e.target.value})}
                    className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-slate-400 resize-none ${
                      theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`} 
                    placeholder="Describe how the agent should behave, its goals, and constraints..."
                  ></textarea>
                </div>
                <div className="flex space-x-4 pt-4">
                  <button 
                    onClick={handleCreateAgent}
                    className="flex-1 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm active:scale-95 transition-all shadow-xl shadow-indigo-600/20"
                  >
                    Deploy Agent
                  </button>
                  <button 
                    onClick={() => setShowCreateModal(false)}
                    className={`px-10 py-5 rounded-[1.5rem] font-black text-sm transition-all ${
                      theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Test Agent Modal */}
      <AnimatePresence>
        {showTestModal && selectedAgent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" 
              onClick={() => setShowTestModal(false)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className={`relative w-full max-w-4xl h-[80vh] border rounded-[3rem] shadow-2xl flex flex-col overflow-hidden transition-all ${
                theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className={`p-8 border-b flex justify-between items-center transition-all ${
                theme === 'dark' ? 'bg-slate-900/50 border-white/5' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Testing: {selectedAgent.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Session</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {!isCallActive ? (
                    <button 
                      onClick={() => startLiveCall()}
                      className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-600/20"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Start Voice Call</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={togglePauseCall}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg ${
                          isCallPaused 
                            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20' 
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                        }`}
                      >
                        {isCallPaused ? (
                          <>
                            <Play className="w-4 h-4" />
                            <span>Resume</span>
                          </>
                        ) : (
                          <>
                            <Pause className="w-4 h-4" />
                            <span>Pause</span>
                          </>
                        )}
                      </button>
                      <button 
                        onClick={stopLiveCall}
                        className="flex items-center space-x-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-rose-600/20 animate-pulse"
                      >
                        <PhoneOff className="w-4 h-4" />
                        <span>End Call</span>
                      </button>
                    </div>
                  )}
                  <button 
                    onClick={() => {
                      if (isCallActive) stopLiveCall();
                      setShowTestModal(false);
                    }}
                    className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 hover:text-white transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide relative">
                {isCallActive && (
                  <div className={`absolute inset-0 z-50 backdrop-blur-[2px] flex flex-col items-center justify-end pb-20 pointer-events-none ${
                    theme === 'dark' ? 'bg-slate-900/40' : 'bg-slate-900/10'
                  }`}>
                    <div className="relative flex flex-col items-center space-y-4">
                      <div className="absolute -inset-8 bg-indigo-500/20 rounded-full blur-2xl animate-pulse"></div>
                      <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-600/40 relative z-10">
                        {isConnecting ? (
                          <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <Mic className={`w-8 h-8 text-white ${isCallPaused ? '' : 'animate-bounce'}`} />
                        )}
                      </div>
                      <div className={`border px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl ${
                        theme === 'dark' ? 'bg-slate-900/90 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}>
                        {isConnecting ? 'Establishing Neural Link...' : isCallPaused ? 'Session Paused' : 'Voice Session Active'}
                      </div>
                    </div>
                  </div>
                )}
                {testChat.length === 0 && !isCallActive && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <Phone className={`w-10 h-10 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Start the conversation</p>
                      <p className="text-sm text-slate-500">Say hello to test your agent's logic and voice response.</p>
                    </div>
                  </div>
                )}
                {testChat.map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-6 rounded-3xl font-medium text-sm shadow-xl ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : theme === 'dark' 
                          ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5' 
                          : 'bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200'
                    }`}>
                      <div className="prose prose-invert max-w-none">
                        <Markdown>
                          {msg.parts[0].text}
                        </Markdown>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className={`p-6 rounded-3xl rounded-tl-none border flex space-x-2 ${
                      theme === 'dark' ? 'bg-slate-800 border-white/5' : 'bg-slate-100 border-slate-200'
                    }`}>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleTestAgent} className={`p-8 border-t transition-all ${
                theme === 'dark' ? 'bg-slate-900/50 border-white/5' : 'bg-slate-50 border-slate-100'
              }`}>
                {selectedAgent.provider === 'Vapi' ? (
                  <div className="flex flex-col items-center justify-center py-4 space-y-2">
                    <div className="flex items-center space-x-2 text-indigo-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-widest">Vapi agents are voice-only</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">Use the "Start Voice Call" button above to interact.</p>
                  </div>
                ) : (
                  <div className="relative flex items-center space-x-4">
                    <button 
                      type="button"
                      onClick={startListening}
                      className={`p-5 rounded-2xl transition-all shadow-lg ${
                        isListening 
                          ? 'bg-rose-600 text-white animate-pulse' 
                          : theme === 'dark' 
                            ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700' 
                            : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Mic className="w-6 h-6" />
                    </button>
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        placeholder={isListening ? "Listening..." : "Type a message to the agent..."}
                        className={`w-full border rounded-2xl pl-6 pr-16 py-5 focus:outline-none focus:border-indigo-500 transition-all font-bold ${
                          theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      />
                      <button 
                        type="submit"
                        disabled={!testInput.trim() || isTyping}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                      >
                        <ArrowUpRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex justify-center mt-4 space-x-6">
                  <div className="flex items-center space-x-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span>Mic Active</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    <span>{selectedAgent.provider === 'Vapi' ? 'Vapi.ai Engine' : 'The DigiXy Flash'}</span>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Payment Selection Modal */}
      <AnimatePresence>
        {showPaymentSelectionModal && pendingPlan && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 backdrop-blur-xl ${theme === 'dark' ? 'bg-slate-950/90' : 'bg-slate-900/40'}`} 
              onClick={() => setShowPaymentSelectionModal(false)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-lg border rounded-[3rem] p-10 shadow-2xl overflow-hidden transition-all ${
                theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className={`text-3xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Pay to Continue</h3>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Upgrade to {pendingPlan.name} Plan</p>
                </div>
                <button 
                  onClick={() => setShowPaymentSelectionModal(false)}
                  className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className={`p-8 rounded-[2rem] border mb-8 ${theme === 'dark' ? 'bg-slate-950/50 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Selected Plan</span>
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                    {isBillingYearly ? 'Yearly' : 'Monthly'}
                  </span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-4xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    ${isBillingYearly ? pendingPlan.yearlyPrice : pendingPlan.price}
                  </span>
                  <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                    {isBillingYearly ? '/ Year' : '/ Month'}
                  </span>
                </div>
                <div className="mt-6 flex flex-wrap gap-2 text-[8px] font-black uppercase tracking-widest">
                  {pendingPlan.features.slice(0, 3).map((f: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-500">{f}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => confirmPlanUpgrade('stripe')}
                  className="w-full group relative flex items-center justify-between p-6 bg-[#635BFF] hover:bg-[#5851E0] rounded-[2rem] text-white transition-all shadow-xl shadow-indigo-600/20"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black uppercase tracking-widest">Pay with Stripe</p>
                      <p className="text-[10px] opacity-70">Credit Card, Apple Pay, Google Pay</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>

                <button 
                  onClick={() => confirmPlanUpgrade('paypal')}
                  className="w-full group relative flex items-center justify-between p-6 bg-[#0070BA] hover:bg-[#005EA6] rounded-[2rem] text-white transition-all shadow-xl shadow-blue-600/20"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black uppercase tracking-widest">Pay with PayPal</p>
                      <p className="text-[10px] opacity-70">PayPal Balance, Direct Bank Transfer</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              </div>

              <div className="mt-10 text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Secure encrypted checkout via industry standards.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Enterprise Request Modal */}
      <AnimatePresence>
        {showEnterpriseModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEnterpriseModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-lg border rounded-[3rem] shadow-2xl overflow-hidden ${
                theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className={`text-3xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    Enterprise Request
                  </h3>
                  <button onClick={() => setShowEnterpriseModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-all">
                    <X className="w-6 h-6 text-slate-500" />
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const request: EnterpriseRequest = {
                    id: `er_${Date.now()}`,
                    userId: user.email,
                    userEmail: user.email,
                    companyName: newEnterpriseRequest.companyName,
                    monthlyVolume: newEnterpriseRequest.monthlyVolume,
                    needs: newEnterpriseRequest.needs,
                    status: 'Pending',
                    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
                  };
                  setEnterpriseRequests([request, ...enterpriseRequests]);
                  setShowEnterpriseModal(false);
                  setNewEnterpriseRequest({ companyName: '', monthlyVolume: '', needs: '' });
                  alert("Your request has been submitted! Our team will review it and get back to you shortly.");
                }} className="space-y-6">
                  <div>
                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Company Name</label>
                    <input 
                      required 
                      value={newEnterpriseRequest.companyName}
                      onChange={(e) => setNewEnterpriseRequest({...newEnterpriseRequest, companyName: e.target.value})}
                      className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold ${
                        theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`} 
                      placeholder="e.g. Acme Corp" 
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Estimated Monthly Volume</label>
                    <select 
                      required 
                      value={newEnterpriseRequest.monthlyVolume}
                      onChange={(e) => setNewEnterpriseRequest({...newEnterpriseRequest, monthlyVolume: e.target.value})}
                      className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold appearance-none ${
                        theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="">Select volume...</option>
                      <option value="10,000 - 50,000">10,000 - 50,000 mins</option>
                      <option value="50,000 - 250,000">50,000 - 250,000 mins</option>
                      <option value="250,000 - 1,000,000">250,000 - 1,000,000 mins</option>
                      <option value="1,000,000+">1,000,000+ mins</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Specific Needs & Requirements</label>
                    <textarea 
                      required 
                      value={newEnterpriseRequest.needs}
                      onChange={(e) => setNewEnterpriseRequest({...newEnterpriseRequest, needs: e.target.value})}
                      className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-medium h-32 ${
                        theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`} 
                      placeholder="Tell us about your use case, required integrations, and any specific features you need..." 
                    />
                  </div>

                  <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">
                    Submit Request
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Enterprise Response Modal */}
      <AnimatePresence>
        {selectedEnterpriseRequest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEnterpriseRequest(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-2xl border rounded-[3rem] shadow-2xl overflow-hidden ${
                theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className={`text-3xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      Review Request
                    </h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">From: {selectedEnterpriseRequest.companyName}</p>
                  </div>
                  <button onClick={() => setSelectedEnterpriseRequest(null)} className="p-2 hover:bg-white/5 rounded-full transition-all">
                    <X className="w-6 h-6 text-slate-500" />
                  </button>
                </div>

                <div className="space-y-6 mb-8">
                  <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>Request Details</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Email</p>
                        <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{selectedEnterpriseRequest.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Volume</p>
                        <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{selectedEnterpriseRequest.monthlyVolume}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Needs</p>
                      <p className={`text-sm font-medium leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{selectedEnterpriseRequest.needs}</p>
                    </div>
                  </div>

                  {selectedEnterpriseRequest.adminResponse && (
                    <div className={`p-6 rounded-2xl border-l-4 border-indigo-500 ${theme === 'dark' ? 'bg-indigo-500/5' : 'bg-indigo-50'}`}>
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Previous Admin Response</p>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{selectedEnterpriseRequest.adminResponse}</p>
                    </div>
                  )}

                  <div>
                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Your Response / Proposal</label>
                    <textarea 
                      value={enterpriseResponse}
                      onChange={(e) => setEnterpriseResponse(e.target.value)}
                      className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-medium h-32 ${
                        theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`} 
                      placeholder="Write your response or custom proposal here..." 
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button 
                    onClick={() => {
                      setEnterpriseRequests(enterpriseRequests.map(er => 
                        er.id === selectedEnterpriseRequest.id 
                          ? { ...er, status: 'Responded', adminResponse: enterpriseResponse } 
                          : er
                      ));
                      setSelectedEnterpriseRequest(null);
                      setEnterpriseResponse('');
                      alert("Response sent to the customer.");
                    }}
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
                  >
                    Send Response
                  </button>
                  <button 
                    onClick={() => {
                      setEnterpriseRequests(enterpriseRequests.map(er => 
                        er.id === selectedEnterpriseRequest.id 
                          ? { ...er, status: 'Closed' } 
                          : er
                      ));
                      setSelectedEnterpriseRequest(null);
                    }}
                    className={`px-8 py-4 border rounded-2xl font-black text-sm transition-all ${
                      theme === 'dark' ? 'bg-slate-800 border-white/10 text-white hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    Close Request
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Plan Modal */}
      <AnimatePresence>
        {showPlanModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPlanModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-2xl border rounded-[3rem] shadow-2xl overflow-hidden transition-all ${
                theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className={`text-3xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {editingPlan ? 'Edit Subscription Plan' : 'Create New Plan'}
                  </h3>
                  <button onClick={() => setShowPlanModal(false)} className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>
                    <X className="w-6 h-6 text-slate-500" />
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newPlan: Plan = {
                    name: formData.get('name') as string,
                    price: Number(formData.get('price')),
                    yearlyPrice: Number(formData.get('yearlyPrice')),
                    mins: Number(formData.get('mins')),
                    agents: Number(formData.get('agents')),
                    numbers: Number(formData.get('numbers')),
                    features: (formData.get('features') as string).split(',').map(f => f.trim()),
                    color: formData.get('color') as string || 'from-indigo-600 to-purple-600',
                    recommended: editingPlan?.recommended
                  };

                  if (editingPlan) {
                    setPlans(plans.map(p => p.name === editingPlan.name ? newPlan : p));
                  } else {
                    setPlans([...plans, newPlan]);
                  }
                  setShowPlanModal(false);
                }} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Plan Name</label>
                      <input name="name" defaultValue={editingPlan?.name} required className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all font-bold ${
                        theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`} placeholder="e.g. Pro Plus" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Monthly ($)</label>
                        <input 
                          name="price" 
                          type="number" 
                          value={calculatePrice(planMinutes)} 
                          readOnly
                          className={`w-full border rounded-2xl px-6 py-4 focus:outline-none transition-all font-bold opacity-70 cursor-not-allowed ${
                            theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`} 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Yearly ($)</label>
                        <input 
                          name="yearlyPrice" 
                          type="number" 
                          value={calculateYearlyPrice(planMinutes)}
                          readOnly
                          className={`w-full border rounded-2xl px-6 py-4 focus:outline-none transition-all font-bold opacity-70 cursor-not-allowed ${
                            theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Minutes (at $0.45/min)</label>
                      <input 
                        name="mins" 
                        type="number" 
                        value={planMinutes}
                        onChange={(e) => setPlanMinutes(Number(e.target.value))}
                        required 
                        className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all font-bold ${
                          theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`} 
                        placeholder="e.g. 1000" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Agents</label>
                      <input name="agents" type="number" defaultValue={editingPlan?.agents} required className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all font-bold ${
                        theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`} placeholder="e.g. 5" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Numbers</label>
                      <input name="numbers" type="number" defaultValue={editingPlan?.numbers} required className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all font-bold ${
                        theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`} placeholder="e.g. 2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Features (comma separated)</label>
                    <textarea name="features" defaultValue={editingPlan?.features.join(', ')} required className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all font-bold h-32 resize-none ${
                      theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`} placeholder="Feature 1, Feature 2, ..." />
                  </div>

                  <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20">
                    {editingPlan ? 'Save Changes' : 'Create Plan'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Coupon Modal */}
      <AnimatePresence>
        {showCouponModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCouponModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-md border rounded-[3rem] shadow-2xl overflow-hidden transition-all ${
                theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className={`text-3xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                  </h3>
                  <button onClick={() => setShowCouponModal(false)} className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>
                    <X className="w-6 h-6 text-slate-500" />
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newCoupon: Coupon = {
                    code: (formData.get('code') as string).toUpperCase(),
                    discount: Number(formData.get('discount')),
                    type: formData.get('type') as 'percentage' | 'fixed',
                    expiry: formData.get('expiry') as string
                  };

                  if (editingCoupon) {
                    setCoupons(coupons.map(c => c.code === editingCoupon.code ? newCoupon : c));
                  } else {
                    setCoupons([...coupons, newCoupon]);
                  }
                  setShowCouponModal(false);
                }} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Coupon Code</label>
                    <input name="code" defaultValue={editingCoupon?.code} required className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all font-black uppercase ${
                      theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`} placeholder="e.g. SAVE20" />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Discount</label>
                      <input name="discount" type="number" defaultValue={editingCoupon?.discount} required className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all font-bold ${
                        theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`} placeholder="e.g. 20" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Type</label>
                      <select name="type" defaultValue={editingCoupon?.type} className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all font-bold appearance-none ${
                        theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}>
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount ($)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Expiry Date</label>
                    <input name="expiry" type="date" defaultValue={editingCoupon?.expiry} required className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all font-bold ${
                      theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`} />
                  </div>

                  <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20">
                    {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Blog Modal */}
      <AnimatePresence>
        {showBlogModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBlogModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-3xl border rounded-[3rem] shadow-2xl overflow-hidden transition-all ${
                theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className={`text-3xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {editingBlog ? 'Edit Blog Post' : 'Write New Post'}
                  </h3>
                  <button onClick={() => setShowBlogModal(false)} className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>
                    <X className="w-6 h-6 text-slate-500" />
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newBlog: Blog = {
                    id: editingBlog?.id || Math.random().toString(36).substr(2, 9),
                    title: formData.get('title') as string,
                    content: formData.get('content') as string,
                    author: 'Admin',
                    date: new Date().toISOString().split('T')[0],
                    image: formData.get('image') as string || 'https://picsum.photos/seed/blog/800/400'
                  };

                  if (editingBlog) {
                    setBlogs(blogs.map(b => b.id === editingBlog.id ? newBlog : b));
                  } else {
                    setBlogs([newBlog, ...blogs]);
                  }
                  setShowBlogModal(false);
                }} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Post Title</label>
                    <input name="title" defaultValue={editingBlog?.title} required className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all font-black ${
                      theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`} placeholder="e.g. The Future of AI" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Featured Image URL</label>
                    <input name="image" defaultValue={editingBlog?.image} className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all font-bold ${
                      theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`} placeholder="https://..." />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Content</label>
                    <textarea name="content" defaultValue={editingBlog?.content} required className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all font-medium h-48 resize-none ${
                      theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`} placeholder="Write your post content here..." />
                  </div>

                  <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20">
                    {editingBlog ? 'Update Post' : 'Publish Post'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardView;

