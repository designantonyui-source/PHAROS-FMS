import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, MessageSquare, Truck, FileCheck, ArrowRight, 
  MapPin, Clock, CheckCircle2, DollarSign, FileText, 
  Upload, Search, Filter, MoreVertical, X, Send,
  ChevronRight, AlertCircle, Check, Package, Navigation,
  Building2, User, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---

type LoadStatus = 'TENDERED' | 'AWARDED' | 'LOADED' | 'IN_TRANSIT' | 'DELIVERED' | 'PAID';

interface Bid {
  id: string;
  carrier: string;
  amount: number;
  rating: number;
  eta: string;
}

interface Message {
  id: string;
  sender: 'Shipper' | 'Driver';
  text: string;
  timestamp: string;
}

interface Doc {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
}

interface Load {
  id: string;
  origin: string;
  destination: string;
  status: LoadStatus;
  price: number;
  weight: string;
  equipment: string;
  progress: number; // 0 to 100
  bids: Bid[];
  messages: Message[];
  docs: Doc[];
}

// --- Mock Data ---

const INITIAL_LOADS: Load[] = [
  {
    id: 'PH-99281',
    origin: 'Berlin, DE',
    destination: 'Paris, FR',
    status: 'TENDERED',
    price: 1450,
    weight: '22,000 kg',
    equipment: 'Standard Trailer',
    progress: 0,
    bids: [
      { id: 'B1', carrier: 'TransEuro Logistics', amount: 1400, rating: 4.8, eta: '2h' },
      { id: 'B2', carrier: 'FastTrack Freight', amount: 1420, rating: 4.5, eta: '1h' },
    ],
    messages: [],
    docs: []
  },
  {
    id: 'PH-88123',
    origin: 'Madrid, ES',
    destination: 'Lisbon, PT',
    status: 'IN_TRANSIT',
    price: 980,
    weight: '18,500 kg',
    equipment: 'Refrigerated',
    progress: 65,
    bids: [],
    messages: [
      { id: 'M1', sender: 'Driver', text: 'Approving border crossing now.', timestamp: '10:30 AM' },
      { id: 'M2', sender: 'Shipper', text: 'Copy that. Temp must stay at 4°C.', timestamp: '10:35 AM' }
    ],
    docs: [
      { id: 'D1', name: 'Commercial_Invoice.pdf', type: 'Invoice', uploadedAt: 'Yesterday' }
    ]
  },
  {
    id: 'PH-77210',
    origin: 'Warsaw, PL',
    destination: 'Prague, CZ',
    status: 'DELIVERED',
    price: 1100,
    weight: '24,000 kg',
    equipment: 'Flatbed',
    progress: 100,
    bids: [],
    messages: [],
    docs: [
      { id: 'D2', name: 'POD_Signed.jpg', type: 'POD', uploadedAt: '1h ago' }
    ]
  }
];

// --- Components ---

const StatusBadge = ({ status }: { status: LoadStatus }) => {
  const styles: Record<LoadStatus, string> = {
    TENDERED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    AWARDED: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    LOADED: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    IN_TRANSIT: 'bg-primary/10 text-primary border-primary/20',
    DELIVERED: 'bg-green-500/10 text-green-500 border-green-500/20',
    PAID: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium font-sans uppercase tracking-wider border ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export const FreightLifecycleEngine = () => {
  const [role, setRole] = useState<'shipper' | 'driver'>('shipper');
  const [loads, setLoads] = useState<Load[]>(INITIAL_LOADS);
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [walletBalance, setWalletBalance] = useState(12450.80);
  const [showChat, setShowChat] = useState(false);

  const selectedLoad = loads.find(l => l.id === selectedLoadId);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedLoad?.messages]);

  // --- Actions ---

  const handleAwardBid = (loadId: string, bidId: string) => {
    setLoads(prev => prev.map(l => 
      l.id === loadId ? { ...l, status: 'AWARDED' as LoadStatus, bids: [] } : l
    ));
  };

  const handleSubmitBid = (loadId: string) => {
    alert(`Bid submitted for ${loadId}!`);
  };

  const handleUpdateStatus = (loadId: string, nextStatus: LoadStatus) => {
    setLoads(prev => prev.map(l => 
      l.id === loadId ? { ...l, status: nextStatus, progress: nextStatus === 'DELIVERED' ? 100 : l.progress } : l
    ));
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !selectedLoadId) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: role === 'shipper' ? 'Shipper' : 'Driver',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setLoads(prev => prev.map(l => 
      l.id === selectedLoadId ? { ...l, messages: [...l.messages, newMessage] } : l
    ));
    setChatInput('');
  };

  const handlePayInvoice = (loadId: string) => {
    setLoads(prev => prev.map(l => 
      l.id === loadId ? { ...l, status: 'PAID' as LoadStatus } : l
    ));
  };

  // --- UI Sections ---

  const renderMarketplace = () => {
    if (role === 'shipper') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 style={{ color: 'var(--foreground)' }} className="text-2xl font-semibold font-sans">My Posted Loads</h3>
            <div className="flex gap-2">
              <button style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }} className="p-2 rounded-lg border border-border"><Search size={18} /></button>
              <button style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }} className="p-2 rounded-lg border border-border"><Filter size={18} /></button>
            </div>
          </div>
          <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ backgroundColor: 'var(--muted)' }} className="border-b border-border">
                  <th className="p-4 text-sm font-medium font-sans text-muted-foreground uppercase tracking-wider">Load ID</th>
                  <th className="p-4 text-sm font-medium font-sans text-muted-foreground uppercase tracking-wider">Route</th>
                  <th className="p-4 text-sm font-medium font-sans text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="p-4 text-sm font-medium font-sans text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loads.filter(l => l.status === 'TENDERED').map(load => (
                  <tr key={load.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-4 text-sm font-normal font-mono">{load.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm font-medium font-sans">
                        <span>{load.origin}</span>
                        <ArrowRight size={14} className="text-muted-foreground" />
                        <span>{load.destination}</span>
                      </div>
                    </td>
                    <td className="p-4"><StatusBadge status={load.status} /></td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedLoadId(load.id)}
                        style={{ color: 'var(--primary)' }}
                        className="text-sm font-bold font-sans hover:underline"
                      >
                        View Bids ({load.bids.length})
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 style={{ color: 'var(--foreground)' }} className="text-2xl font-semibold font-sans">Global Marketplace</h3>
          <div className="flex items-center gap-2 text-sm font-medium font-sans text-muted-foreground">
            <Globe size={16} /> Live Freight Feed
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loads.filter(l => l.status === 'TENDERED').map(load => (
            <motion.div 
              key={load.id}
              whileHover={{ y: -2 }}
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
              className="p-5 border rounded-2xl shadow-sm space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-xs font-bold font-mono text-muted-foreground uppercase tracking-widest">{load.id}</div>
                  <div className="text-lg font-bold font-sans flex items-center gap-2">
                    {load.origin} <ArrowRight size={16} className="text-primary" /> {load.destination}
                  </div>
                </div>
                <div className="text-xl font-black font-sans text-primary">€{load.price}</div>
              </div>
              <div className="flex gap-4 text-xs font-medium font-sans text-muted-foreground">
                <div className="flex items-center gap-1"><Package size={14} /> {load.weight}</div>
                <div className="flex items-center gap-1"><Truck size={14} /> {load.equipment}</div>
              </div>
              <button 
                onClick={() => handleSubmitBid(load.id)}
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                className="w-full py-2.5 rounded-xl font-bold font-sans text-sm shadow-md active:scale-95 transition-all"
              >
                Submit Bid
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderExecution = () => {
    if (!selectedLoad) return (
      <div style={{ backgroundColor: 'var(--muted)' }} className="h-full rounded-2xl border border-dashed border-border flex flex-col items-center justify-center p-12 text-center space-y-4">
        <div className="p-4 bg-card rounded-full shadow-sm"><Navigation size={32} className="text-muted-foreground" /></div>
        <div className="space-y-1">
          <h4 className="text-lg font-semibold font-sans">No Load Selected</h4>
          <p className="text-sm text-muted-foreground max-w-xs">Select a load from the marketplace or your active list to view execution details.</p>
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedLoadId(null)} className="p-2 hover:bg-muted rounded-full transition-colors"><X size={20} /></button>
            <h3 style={{ color: 'var(--foreground)' }} className="text-2xl font-semibold font-sans">Execution: {selectedLoad.id}</h3>
          </div>
          <StatusBadge status={selectedLoad.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map & Progress */}
          <div className="lg:col-span-2 space-y-6">
            <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="border rounded-2xl overflow-hidden shadow-sm aspect-video relative">
              {/* Mock Map */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(var(--foreground) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-full h-full p-12" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M 10 50 Q 50 10 90 50" fill="none" stroke="var(--primary)" strokeWidth="1" strokeDasharray="4 2" />
                  <motion.circle 
                    cx={10 + (selectedLoad.progress * 0.8)} 
                    cy={50 - (Math.sin((selectedLoad.progress / 100) * Math.PI) * 40)} 
                    r="3" 
                    fill="var(--primary)"
                    animate={{ r: [3, 5, 3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </svg>
              </div>
              <div className="absolute bottom-6 left-6 right-6 bg-card/90 backdrop-blur-md p-4 rounded-xl border border-border shadow-lg">
                <div className="flex justify-between text-xs font-bold font-sans uppercase tracking-widest mb-2">
                  <span>Progress</span>
                  <span className="text-primary">{selectedLoad.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedLoad.progress}%` }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            </div>

            {/* Actions based on status */}
            <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="p-6 border rounded-2xl shadow-sm flex justify-between items-center">
              <div className="space-y-1">
                <div className="text-sm font-medium font-sans text-muted-foreground">Current Action Required</div>
                <div className="text-lg font-bold font-sans">
                  {selectedLoad.status === 'TENDERED' && 'Awaiting Bid Selection'}
                  {selectedLoad.status === 'AWARDED' && 'Confirm Pickup'}
                  {selectedLoad.status === 'LOADED' && 'Start Transit'}
                  {selectedLoad.status === 'IN_TRANSIT' && 'Monitor Progress'}
                  {selectedLoad.status === 'DELIVERED' && 'Process Payment'}
                  {selectedLoad.status === 'PAID' && 'Transaction Complete'}
                </div>
              </div>
              {role === 'driver' && selectedLoad.status === 'AWARDED' && (
                <button onClick={() => handleUpdateStatus(selectedLoad.id, 'LOADED')} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold font-sans text-sm shadow-lg active:scale-95 transition-all">Confirm Loaded</button>
              )}
              {role === 'driver' && selectedLoad.status === 'LOADED' && (
                <button onClick={() => handleUpdateStatus(selectedLoad.id, 'IN_TRANSIT')} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold font-sans text-sm shadow-lg active:scale-95 transition-all">Start Transit</button>
              )}
              {role === 'driver' && selectedLoad.status === 'IN_TRANSIT' && (
                <button onClick={() => handleUpdateStatus(selectedLoad.id, 'DELIVERED')} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold font-sans text-sm shadow-lg active:scale-95 transition-all">Mark Delivered</button>
              )}
              {role === 'shipper' && selectedLoad.status === 'DELIVERED' && (
                <button onClick={() => handlePayInvoice(selectedLoad.id)} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold font-sans text-sm shadow-lg active:scale-95 transition-all">Approve & Pay</button>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="p-6 border rounded-2xl shadow-sm space-y-6">
            <h4 className="text-sm font-bold font-sans uppercase tracking-widest text-muted-foreground">Tracking Timeline</h4>
            <div className="space-y-8 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border"></div>
              {[
                { label: 'Tendered', status: 'TENDERED', time: '09:00 AM' },
                { label: 'Awarded', status: 'AWARDED', time: '10:15 AM' },
                { label: 'Loaded', status: 'LOADED', time: '01:30 PM' },
                { label: 'In Transit', status: 'IN_TRANSIT', time: '02:00 PM' },
                { label: 'Delivered', status: 'DELIVERED', time: 'Pending' }
              ].map((step, idx) => {
                const isCompleted = ['TENDERED', 'AWARDED', 'LOADED', 'IN_TRANSIT', 'DELIVERED', 'PAID'].indexOf(selectedLoad.status) >= ['TENDERED', 'AWARDED', 'LOADED', 'IN_TRANSIT', 'DELIVERED', 'PAID'].indexOf(step.status as LoadStatus);
                const isCurrent = selectedLoad.status === step.status;

                return (
                  <div key={idx} className="flex gap-4 relative z-10">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isCompleted ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground'
                    }`}>
                      {isCompleted ? <Check size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </div>
                    <div className="space-y-0.5">
                      <div className={`text-sm font-bold font-sans ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</div>
                      <div className="text-xs font-medium font-sans text-muted-foreground">{step.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSharedServices = () => {
    if (!selectedLoad) return null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Document Center */}
        <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="p-6 border rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold font-sans uppercase tracking-widest text-muted-foreground">Document Center</h4>
            <FileCheck size={18} className="text-primary" />
          </div>
          <div className="space-y-3">
            {selectedLoad.docs.map(doc => (
              <div key={doc.id} style={{ backgroundColor: 'var(--muted)' }} className="p-3 rounded-xl flex items-center justify-between border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-card rounded-lg border border-border"><FileText size={16} className="text-primary" /></div>
                  <div>
                    <div className="text-sm font-bold font-sans">{doc.name}</div>
                    <div className="text-xs text-muted-foreground">{doc.type} • {doc.uploadedAt}</div>
                  </div>
                </div>
                <button className="text-muted-foreground hover:text-foreground"><MoreVertical size={16} /></button>
              </div>
            ))}
            <button style={{ borderStyle: 'dashed' }} className="w-full py-4 border-2 border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 transition-all">
              <Upload size={20} />
              <span className="text-xs font-bold font-sans uppercase tracking-widest">
                {role === 'driver' ? 'Upload POD' : 'Upload Invoice'}
              </span>
            </button>
          </div>
        </div>

        {/* Load-Based Chat */}
        <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="p-6 border rounded-2xl shadow-sm flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold font-sans uppercase tracking-widest text-muted-foreground">Load Chat: {selectedLoad.id}</h4>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-bold font-sans uppercase text-muted-foreground tracking-widest">Live</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
            {selectedLoad.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 opacity-50">
                <MessageSquare size={24} />
                <p className="text-xs font-medium font-sans">No messages yet. Start the conversation.</p>
              </div>
            ) : (
              selectedLoad.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === (role === 'shipper' ? 'Shipper' : 'Driver') ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-sans ${
                    msg.sender === (role === 'shipper' ? 'Shipper' : 'Driver') 
                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                      : 'bg-muted text-foreground rounded-tl-none border border-border'
                  }`}>
                    <div className="text-[10px] font-bold uppercase opacity-70 mb-1">{msg.sender}</div>
                    {msg.text}
                    <div className="text-[10px] opacity-50 mt-1 text-right">{msg.timestamp}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="relative">
            <input 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type message..."
              style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}
              className="w-full pl-4 pr-12 py-3 border rounded-xl text-sm font-sans focus:ring-2 focus:ring-primary/20 outline-none"
            />
            <button 
              onClick={handleSendMessage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-lg shadow-md hover:scale-105 transition-all"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFinTech = () => {
    if (role === 'driver') {
      return (
        <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="p-8 border rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold font-sans uppercase tracking-widest text-muted-foreground">
                <Wallet size={18} className="text-primary" /> Driver Wallet
              </div>
              <div className="text-5xl font-black font-sans tracking-tighter">€{walletBalance.toLocaleString()}</div>
              <div className="flex items-center gap-2 text-xs font-bold font-sans text-green-500">
                <ArrowUpRight size={14} /> +€1,240.00 this week
              </div>
            </div>
            <div className="flex gap-3">
              <button style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }} className="px-6 py-3 rounded-xl font-bold font-sans text-sm shadow-lg active:scale-95 transition-all">Withdraw Funds</button>
              <button style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }} className="px-6 py-3 rounded-xl font-bold font-sans text-sm border border-border">Transaction History</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="p-8 border rounded-2xl shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold font-sans uppercase tracking-widest text-muted-foreground">
              <DollarSign size={18} className="text-primary" /> Shipper Payments
            </div>
            <h3 className="text-2xl font-bold font-sans">Pending Invoices</h3>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold font-sans uppercase text-muted-foreground tracking-widest">Total Payable</div>
            <div className="text-2xl font-black font-sans text-primary">€4,520.00</div>
          </div>
        </div>
        <div className="space-y-3">
          {loads.filter(l => l.status === 'DELIVERED').map(load => (
            <div key={load.id} style={{ backgroundColor: 'var(--muted)' }} className="p-4 rounded-xl flex items-center justify-between border border-border">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-card rounded-xl border border-border"><FileText size={20} className="text-primary" /></div>
                <div>
                  <div className="text-sm font-bold font-sans">Invoice for {load.id}</div>
                  <div className="text-xs text-muted-foreground">{load.origin} → {load.destination}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-sm font-black font-sans">€{load.price}</div>
                  <div className="text-[10px] font-bold font-sans uppercase text-muted-foreground">Due in 2 days</div>
                </div>
                <button 
                  onClick={() => handlePayInvoice(load.id)}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold font-sans text-xs shadow-md active:scale-95 transition-all"
                >
                  Approve & Pay
                </button>
              </div>
            </div>
          ))}
          {loads.filter(l => l.status === 'DELIVERED').length === 0 && (
            <div className="py-8 text-center text-muted-foreground text-sm font-medium font-sans italic">No pending invoices at this time.</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-8 space-y-8 max-w-7xl mx-auto">
      {/* Role Context Toggle */}
      <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="p-4 border rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl"><Truck size={24} className="text-primary" /></div>
          <div>
            <h2 style={{ color: 'var(--foreground)' }} className="text-xl font-bold font-sans tracking-tight">Freight Lifecycle Engine</h2>
            <p className="text-xs text-muted-foreground font-medium font-sans uppercase tracking-widest">Pharos Logistics System v2.0</p>
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--muted)' }} className="p-1 rounded-xl flex gap-1 border border-border">
          <button 
            onClick={() => setRole('shipper')}
            className={`px-6 py-2 rounded-lg text-sm font-bold font-sans transition-all ${role === 'shipper' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Shipper View
          </button>
          <button 
            onClick={() => setRole('driver')}
            className={`px-6 py-2 rounded-lg text-sm font-bold font-sans transition-all ${role === 'driver' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Driver View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="xl:col-span-8 space-y-8">
          {/* Layer 1: Marketplace */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black font-sans uppercase tracking-[0.2em] text-primary/60">
              <span className="w-8 h-[1px] bg-primary/30"></span> Layer 1: Marketplace
            </div>
            {renderMarketplace()}
          </section>

          {/* Layer 2 & 3: Execution */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black font-sans uppercase tracking-[0.2em] text-primary/60">
              <span className="w-8 h-[1px] bg-primary/30"></span> Layer 2 & 3: Execution Layer
            </div>
            {renderExecution()}
          </section>

          {/* Layer 4: Shared Services */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black font-sans uppercase tracking-[0.2em] text-primary/60">
              <span className="w-8 h-[1px] bg-primary/30"></span> Layer 4: Shared Services
            </div>
            {renderSharedServices()}
          </section>
        </div>

        {/* Sidebar / FinTech Area */}
        <div className="xl:col-span-4 space-y-8">
          {/* Layer 5: FinTech */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black font-sans uppercase tracking-[0.2em] text-primary/60">
              <span className="w-8 h-[1px] bg-primary/30"></span> Layer 5: FinTech Layer
            </div>
            {renderFinTech()}
          </section>

          {/* Quick Stats / Context */}
          <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="p-6 border rounded-2xl shadow-sm space-y-6">
            <h4 className="text-sm font-bold font-sans uppercase tracking-widest text-muted-foreground">System Health</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm font-medium font-sans"><Activity size={16} className="text-green-500" /> API Latency</div>
                <div className="text-sm font-mono">24ms</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm font-medium font-sans"><ShieldCheck size={16} className="text-blue-500" /> Auth Status</div>
                <div className="text-xs font-bold font-sans uppercase text-blue-500">Verified</div>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="text-[10px] font-bold font-sans uppercase text-muted-foreground mb-2">Active Sessions</div>
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-card bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">+12</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Icons (Missing in standard lucide) ---
const Globe = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
);

const Activity = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
);

const ShieldCheck = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

export default FreightLifecycleEngine;
