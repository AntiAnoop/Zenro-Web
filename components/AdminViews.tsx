
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, BookOpen, DollarSign, TrendingUp, Search, 
  Filter, MoreVertical, Edit2, Trash2, Plus, Download, 
  CheckCircle, XCircle, Shield, AlertTriangle, ChevronDown, ChevronUp, X, Save, RefreshCw, Key, WifiOff, Loader2,
  Layers, Check, Eye, CreditCard, FileText, Calendar, Clock, ArrowLeft, Briefcase, GraduationCap, MapPin, Phone, Mail
} from 'lucide-react';
import { User, UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { supabase } from '../services/supabaseClient';

// --- MOCK DATA FOR CHARTS ---
const REVENUE_DATA = [
  { month: 'Jan', phase1: 4000, phase2: 2400 },
  { month: 'Feb', phase1: 3000, phase2: 1398 },
  { month: 'Mar', phase1: 2000, phase2: 9800 },
  { month: 'Apr', phase1: 2780, phase2: 3908 },
  { month: 'May', phase1: 1890, phase2: 4800 },
  { month: 'Jun', phase1: 2390, phase2: 3800 },
];

// --- TYPES ---
interface Batch {
  id: string;
  name: string;
}

// --- HELPER FUNCTIONS ---
const generateUUID = () => {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> (+c / 4)).toString(16)
    );
};

const AdminHeader = ({ title, action }: { title: string, action?: React.ReactNode }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
    <div>
      <h1 className="text-3xl font-heading font-bold text-slate-800">{title}</h1>
      <p className="text-gray-500 text-sm mt-1">Super User Control Panel</p>
    </div>
    {action}
  </div>
);

const SearchBar = ({ value, onChange, placeholder }: { value: string, onChange: (s: string) => void, placeholder: string }) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
    <input 
      type="text" 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-white border border-gray-300 text-slate-800 pl-10 pr-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-zenro-blue focus:outline-none w-64 transition shadow-sm"
    />
  </div>
);

// --- COMPONENT: USER PROFILE DETAIL MODAL ---
const UserProfileDetail = ({ user, onClose }: { user: User, onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FEES' | 'TESTS' | 'COURSES'>('OVERVIEW');
    const [loading, setLoading] = useState(true);
    
    // Data States
    const [fees, setFees] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalFees: 0,
        paidFees: 0,
        pendingFees: 0,
        avgScore: 0,
        testsTaken: 0,
        attendance: 88 // Mock default
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Fees
                const { data: feeData } = await supabase.from('fees').select('*').eq('student_id', user.id);
                const fData = feeData || [];
                setFees(fData);

                // 2. Fetch Tests
                const { data: subData } = await supabase
                    .from('submissions')
                    .select('*, tests(title)')
                    .eq('student_id', user.id)
                    .order('completed_at', { ascending: false });
                const sData = subData || [];
                setSubmissions(sData);

                // 3. Calculate Stats
                const totalF = fData.reduce((acc:number, curr:any) => acc + curr.amount, 0);
                const paidF = fData.filter((f:any) => f.status === 'PAID').reduce((acc:number, curr:any) => acc + curr.amount, 0);
                const avgS = sData.length > 0 ? Math.round(sData.reduce((acc:number, curr:any) => acc + (curr.score/curr.total_score), 0) / sData.length * 100) : 0;

                setStats({
                    totalFees: totalF,
                    paidFees: paidF,
                    pendingFees: totalF - paidF,
                    avgScore: avgS,
                    testsTaken: sData.length,
                    attendance: Math.floor(Math.random() * (100 - 70) + 70) // Mock attendance
                });

            } catch (e) {
                console.error("Profile Detail Fetch Error:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.id]);

    const InfoRow = ({ label, value, icon: Icon }: any) => (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
                {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                <span className="text-sm text-gray-500 font-bold uppercase">{label}</span>
            </div>
            <span className="text-slate-800 font-bold text-sm">{value}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex justify-end animate-fade-in">
            <div className="w-full max-w-4xl bg-white h-full border-l border-gray-200 shadow-2xl overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-zenro-blue to-slate-900 border-b border-gray-200 flex justify-between items-start sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                         <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-white">
                             <ArrowLeft className="w-6 h-6" />
                         </button>
                         <div className="flex items-center gap-4">
                             <img src={user.avatar} alt="" className="w-16 h-16 rounded-full border-4 border-white shadow-lg bg-white" />
                             <div>
                                 <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                                 <p className="text-blue-200 text-sm flex items-center gap-2">
                                     <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold border border-white/30 uppercase text-white">{user.role}</span>
                                     <span>•</span>
                                     <span>{user.email}</span>
                                 </p>
                             </div>
                         </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold border border-white/30 backdrop-blur">
                             Reset Password
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 border-b border-gray-200 bg-white flex gap-6 shadow-sm">
                    {['OVERVIEW', 'FEES', 'TESTS', 'COURSES'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`py-4 text-sm font-bold border-b-4 transition ${activeTab === tab ? 'border-zenro-red text-zenro-red' : 'border-transparent text-gray-500 hover:text-slate-800'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="p-8 flex-1 bg-gray-50">
                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-zenro-blue" /></div>
                    ) : (
                        <div className="space-y-8 animate-fade-in">
                            {/* OVERVIEW TAB */}
                            {activeTab === 'OVERVIEW' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Financial Summary Card */}
                                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 bg-blue-50 rounded-lg text-zenro-blue">
                                                    <DollarSign className="w-6 h-6" />
                                                </div>
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${stats.pendingFees > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                    {stats.pendingFees > 0 ? 'Payment Due' : 'All Clear'}
                                                </span>
                                            </div>
                                            <h3 className="text-gray-500 text-xs font-bold uppercase mb-1">Fee Status</h3>
                                            <div className="flex justify-between items-end mb-4">
                                                <div>
                                                    <p className="text-3xl font-bold text-slate-800">¥{stats.totalFees.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500">Total Invoiced</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-red-500">¥{stats.pendingFees.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500">Pending</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setActiveTab('FEES')}
                                                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 text-sm font-bold rounded border border-gray-300 flex items-center justify-center gap-2 transition"
                                            >
                                                View Fee Structure <ChevronDown className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Academic Summary Card */}
                                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 bg-red-50 rounded-lg text-zenro-red">
                                                    <GraduationCap className="w-6 h-6" />
                                                </div>
                                                <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-700">
                                                    Active Student
                                                </span>
                                            </div>
                                            <h3 className="text-gray-500 text-xs font-bold uppercase mb-1">Academic Performance</h3>
                                            <div className="flex justify-between items-end mb-4">
                                                <div>
                                                    <p className="text-3xl font-bold text-slate-800">{stats.avgScore}%</p>
                                                    <p className="text-xs text-gray-500">Average Score</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-slate-800">{stats.testsTaken}</p>
                                                    <p className="text-xs text-gray-500">Tests Taken</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setActiveTab('TESTS')}
                                                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 text-sm font-bold rounded border border-gray-300 flex items-center justify-center gap-2 transition"
                                            >
                                                View Test History <ChevronDown className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Detailed Personal Info */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <Users className="w-5 h-5 text-zenro-blue" /> Student Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InfoRow label="Full Name" value={user.name} icon={Users} />
                                            <InfoRow label="Student ID" value={user.rollNumber || user.id.slice(0,8)} icon={Key} />
                                            <InfoRow label="Batch" value={user.batch || 'Unassigned'} icon={Layers} />
                                            <InfoRow label="Phone" value={user.phone || 'N/A'} icon={Phone} />
                                            <InfoRow label="Email" value={user.email} icon={Mail} />
                                            <InfoRow label="Address" value="Tokyo, Japan (Mock)" icon={MapPin} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* FEES TAB */}
                            {activeTab === 'FEES' && (
                                <div className="space-y-6">
                                     <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-slate-800">Fee Ledger</h3>
                                        <button className="bg-zenro-red text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-red-700 shadow-sm">
                                            <Plus className="w-4 h-4" /> Add Manual Transaction
                                        </button>
                                     </div>
                                     <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                         <table className="w-full text-left text-sm text-gray-600">
                                             <thead className="bg-gray-100 text-slate-700 uppercase font-bold text-xs border-b border-gray-200">
                                                 <tr>
                                                     <th className="p-4">Description</th>
                                                     <th className="p-4">Due Date</th>
                                                     <th className="p-4">Amount</th>
                                                     <th className="p-4">Status</th>
                                                 </tr>
                                             </thead>
                                             <tbody className="divide-y divide-gray-100">
                                                 {fees.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-gray-500">No fee records found.</td></tr>}
                                                 {fees.map(fee => (
                                                     <tr key={fee.id}>
                                                         <td className="p-4 font-bold text-slate-800">{fee.title} <br/><span className="text-xs text-gray-500 font-normal">{fee.category} • Phase {fee.phase}</span></td>
                                                         <td className="p-4">{fee.dueDate || fee.due_date}</td>
                                                         <td className="p-4 font-mono font-bold">¥{fee.amount.toLocaleString()}</td>
                                                         <td className="p-4">
                                                             <span className={`px-2 py-1 rounded text-xs font-bold ${fee.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                 {fee.status}
                                                             </span>
                                                         </td>
                                                     </tr>
                                                 ))}
                                             </tbody>
                                         </table>
                                     </div>
                                </div>
                            )}

                            {/* TESTS TAB */}
                            {activeTab === 'TESTS' && (
                                <div className="space-y-6">
                                     <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-slate-800">Test History</h3>
                                        <p className="text-gray-500 text-sm">Avg Score: <span className="text-slate-800 font-bold">{stats.avgScore}%</span></p>
                                     </div>
                                     <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                         <table className="w-full text-left text-sm text-gray-600">
                                             <thead className="bg-gray-100 text-slate-700 uppercase font-bold text-xs border-b border-gray-200">
                                                 <tr>
                                                     <th className="p-4">Test Name</th>
                                                     <th className="p-4">Date Taken</th>
                                                     <th className="p-4">Score</th>
                                                     <th className="p-4 text-right">Action</th>
                                                 </tr>
                                             </thead>
                                             <tbody className="divide-y divide-gray-100">
                                                 {submissions.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-gray-500">No tests taken yet.</td></tr>}
                                                 {submissions.map(sub => (
                                                     <tr key={sub.id}>
                                                         <td className="p-4 font-bold text-slate-800">{sub.tests?.title || 'Unknown Test'}</td>
                                                         <td className="p-4">{new Date(sub.completed_at).toLocaleDateString()}</td>
                                                         <td className="p-4">
                                                             <span className={`font-bold px-2 py-1 rounded text-xs ${sub.score/sub.total_score > 0.4 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                 {sub.score} / {sub.total_score}
                                                             </span>
                                                         </td>
                                                         <td className="p-4 text-right">
                                                             <button className="text-zenro-blue hover:text-blue-800 font-bold text-xs border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 transition">View Report</button>
                                                         </td>
                                                     </tr>
                                                 ))}
                                             </tbody>
                                         </table>
                                     </div>
                                </div>
                            )}

                            {/* COURSES TAB (Mocked for now) */}
                            {activeTab === 'COURSES' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-slate-800">Enrolled Courses</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { title: 'JLPT N4 Comprehensive', progress: 75, instructor: 'Tanaka Sensei' },
                                            { title: 'Kanji Mastery', progress: 30, instructor: 'Sato Sensei' },
                                            { title: 'Business Japanese', progress: 0, instructor: 'Yamamoto Sensei' },
                                        ].map((c, i) => (
                                            <div key={i} className="bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-4 shadow-sm">
                                                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <BookOpen className="w-6 h-6 text-gray-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-slate-800 font-bold text-sm">{c.title}</h4>
                                                    <p className="text-xs text-gray-500">{c.instructor}</p>
                                                    <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                                                        <div style={{width: `${c.progress}%`}} className="bg-zenro-red h-1.5 rounded-full"></div>
                                                    </div>
                                                </div>
                                                <span className="text-slate-800 font-bold text-sm">{c.progress}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- DASHBOARD ---
export const AdminDashboard = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <AdminHeader 
        title="Admin Overview" 
        action={
          <button className="bg-zenro-blue hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg text-sm transition">
            <Download className="w-4 h-4" /> Export Report
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: '¥12.5M', icon: DollarSign, color: 'text-yellow-600 bg-yellow-100', sub: '+12% vs last month' },
          { label: 'Active Students', value: '1,240', icon: Users, color: 'text-blue-600 bg-blue-100', sub: '98% Retention' },
          { label: 'Pending Visas', value: '45', icon: Shield, color: 'text-purple-600 bg-purple-100', sub: 'Action Required' },
          { label: 'Course Completion', value: '89%', icon: TrendingUp, color: 'text-green-600 bg-green-100', sub: 'Avg N4 Pass Rate' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-zenro-blue transition shadow-md hover:shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">2024-FY</span>
            </div>
            <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">{stat.label}</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</h3>
            <p className="text-xs text-gray-400 mt-2">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue Overview (Phase 1 vs Phase 2)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#1e293b' }}
                  cursor={{fill: 'rgba(0,0,0,0.05)'}}
                />
                <Legend />
                <Bar dataKey="phase1" name="Domestic Training" fill="#E60012" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="phase2" name="Placement Success" fill="#1A237E" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
           <h3 className="text-lg font-bold text-slate-800 mb-6">Batch Distribution</h3>
           <div className="space-y-4">
              {[
                { name: 'Batch 2024-A (N4)', count: 450, color: 'bg-zenro-red' },
                { name: 'Batch 2024-B (N5)', count: 320, color: 'bg-zenro-blue' },
                { name: 'Batch 2023-C (Placed)', count: 280, color: 'bg-yellow-500' },
                { name: 'Batch 2024-C (New)', count: 190, color: 'bg-gray-400' },
              ].map((batch, i) => (
                <div key={i} className="group cursor-pointer">
                   <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span className="font-bold group-hover:text-slate-900 transition">{batch.name}</span>
                      <span>{batch.count} Students</span>
                   </div>
                   <div className="w-full bg-gray-100 rounded-full h-2">
                      <div style={{ width: `${(batch.count / 450) * 100}%` }} className={`h-full rounded-full ${batch.color}`}></div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

// --- USER MANAGEMENT ---
export const AdminUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  
  // Feedback States
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Create/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Profile View Modal State
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Delete Modal State
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Batch Management State
  const [availableBatches, setAvailableBatches] = useState<Batch[]>([]);
  const [showBatchDropdown, setShowBatchDropdown] = useState(false);
  const batchDropdownRef = useRef<HTMLDivElement>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'STUDENT',
    student_id: '',
    batch: '',
    password: '',
    phone: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchBatches();
    
    // SUBSCRIBE TO BATCH UPDATES (REAL-TIME)
    const batchSubscription = supabase
      .channel('public:batches')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'batches' }, (payload) => {
        console.log("Realtime Batch Insert:", payload.new);
        const newBatch = payload.new as Batch;
        setAvailableBatches(prev => {
            if (prev.some(b => b.name === newBatch.name)) {
                return prev.map(b => b.name === newBatch.name ? newBatch : b);
            }
            return [newBatch, ...prev];
        });
      })
      .subscribe();

    const handleClickOutside = (event: MouseEvent) => {
        if (batchDropdownRef.current && !batchDropdownRef.current.contains(event.target as Node)) {
            setShowBatchDropdown(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        supabase.removeChannel(batchSubscription);
    };
  }, []);

  useEffect(() => {
    if (successMsg || errorMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
        setErrorMsg('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, errorMsg]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        
        if (data) {
            const mappedUsers = data.map((u: any) => ({
                id: u.id,
                name: u.full_name,
                role: u.role as UserRole,
                email: u.email,
                avatar: u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name)}&background=random`,
                batch: u.batch,
                phone: u.phone,
                rollNumber: u.student_id
            }));
            setUsers(mappedUsers);
        }
    } catch (e: any) {
        console.error("DB Fetch Error:", e);
        setErrorMsg("Failed to load users from database. Please check your connection.");
    } finally {
        setLoading(false);
    }
  };

  const fetchBatches = async () => {
      try {
          const { data, error } = await supabase.from('batches').select('*').order('created_at', { ascending: false });
          
          let dbBatches: Batch[] = [];
          if (!error && data) {
              dbBatches = data;
          }

          const { data: profileData } = await supabase.from('profiles').select('batch');
          if (profileData) {
              const uniqueNames = Array.from(new Set(profileData.map((p:any) => p.batch).filter(Boolean)));
              const existingNames = new Set(dbBatches.map(b => b.name));
              const missingLegacy = uniqueNames
                  .filter(name => !existingNames.has(name as string))
                  .map(name => ({ id: `legacy-${name}`, name: name as string }));
              
              setAvailableBatches([...dbBatches, ...missingLegacy]);
          } else {
              setAvailableBatches(dbBatches);
          }
      } catch (e) {
          console.error("Batch fetch error", e);
      }
  };

  const handleCreateBatch = async (newBatchName: string) => {
      if (!newBatchName.trim()) return;
      if (!confirm(`Create new batch "${newBatchName}"?`)) return;

      try {
          const tempId = `temp-${Date.now()}`;
          const tempBatch = { id: tempId, name: newBatchName };
          setAvailableBatches(prev => [tempBatch, ...prev]);
          
          setFormData(prev => ({ ...prev, batch: newBatchName }));
          setShowBatchDropdown(false);
          setSuccessMsg(`Batch "${newBatchName}" created! Syncing...`);

          const { data, error } = await supabase.from('batches').insert({ name: newBatchName }).select();
          
          if (error) {
              console.error("Create Batch Error:", error);
              if (error.code !== '42P01') { 
                  setErrorMsg("Could not save batch to database. It may disappear on refresh.");
              }
          } else if (data) {
              setAvailableBatches(prev => prev.map(b => b.id === tempId ? data[0] : b));
              setSuccessMsg(`Batch "${newBatchName}" synced successfully.`);
          }

      } catch (e: any) {
          console.error("Create Batch Critical Error:", e);
      }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      (u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase())) &&
      (roleFilter === 'ALL' || u.role === roleFilter)
    );
  }, [users, filter, roleFilter]);

  const handleOpenModal = (user: any = null) => {
    setErrorMsg('');
    setSuccessMsg('');
    if (user) {
      setEditingUser(user);
      setFormData({
        full_name: user.name,
        email: user.email,
        role: user.role,
        student_id: user.rollNumber || '',
        batch: user.batch || '',
        password: '',
        phone: user.phone || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        full_name: '',
        email: '',
        role: 'STUDENT',
        student_id: '',
        batch: '',
        password: '',
        phone: ''
      });
    }
    setIsModalOpen(true);
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let pass = "";
    for(let i=0; i<8; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    setFormData(prev => ({...prev, password: pass}));
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    
    // --- ROBUST CLIENT-SIDE VALIDATION ---
    if (!formData.full_name.trim() || !formData.email.trim()) {
        setErrorMsg("Name and Email are mandatory.");
        setIsSubmitting(false);
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        setErrorMsg("Invalid email address format.");
        setIsSubmitting(false);
        return;
    }
    if (formData.phone) {
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.phone)) {
            setErrorMsg("Phone number must be exactly 10 digits.");
            setIsSubmitting(false);
            return;
        }
    }
    if (formData.role === 'STUDENT' && !formData.student_id.trim()) {
        setErrorMsg("Student ID is mandatory for Students.");
        setIsSubmitting(false);
        return;
    }
    if (!editingUser && formData.password.length < 8) {
        setErrorMsg("Password must be at least 8 characters.");
        setIsSubmitting(false);
        return;
    }
    const emailExists = users.some(u => u.email.toLowerCase() === formData.email.toLowerCase() && u.id !== editingUser?.id);
    if (emailExists) {
        setErrorMsg("A user with this email already exists.");
        setIsSubmitting(false);
        return;
    }
    if (formData.phone) {
        const phoneExists = users.some(u => u.phone === formData.phone && u.id !== editingUser?.id);
        if (phoneExists) {
            setErrorMsg("This phone number is already registered.");
            setIsSubmitting(false);
            return;
        }
    }
    if (formData.role === 'STUDENT') {
        const idExists = users.some(u => u.rollNumber?.toLowerCase() === formData.student_id.toLowerCase() && u.id !== editingUser?.id);
        if (idExists) {
             setErrorMsg("This Student ID is already assigned.");
             setIsSubmitting(false);
             return;
        }
    }

    const payload: any = {
      full_name: formData.full_name.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role,
      student_id: formData.student_id.trim() || null, 
      batch: formData.batch.trim(),
      phone: formData.phone.trim(),
      id: editingUser ? editingUser.id : generateUUID() 
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      if (editingUser) {
        const { error } = await supabase.from('profiles').update(payload).eq('id', editingUser.id);
        if (error) throw error;
        setSuccessMsg("User updated successfully.");
      } else {
        const { error } = await supabase.from('profiles').insert([payload]);
        if (error) throw error;
        setSuccessMsg("New user created in database.");
      }

      setIsModalOpen(false);
      fetchUsers();

    } catch (err: any) {
      console.error("DB Write Failed:", err);
      if (err.code === '23505') {
          setErrorMsg("Duplicate entry detected (Email, Phone or ID).");
      } else {
          setErrorMsg(`Database Error: ${err.message || 'Check connection'}`);
      }
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- DELETE FLOW HANDLERS ---
  const initiateDelete = (user: User) => {
      setUserToDelete(user);
      setIsDeleteConfirmed(false);
      setErrorMsg('');
  };

  const handleExecuteDelete = async () => {
    if (!userToDelete || !isDeleteConfirmed) return;
    
    setIsDeleting(true);
    try {
        // HARD DELETE from Database
        const { error } = await supabase.from('profiles').delete().eq('id', userToDelete.id);
        
        if (error) throw error;

        // Success logic
        setSuccessMsg(`User ${userToDelete.name} has been permanently deleted.`);
        setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
        setUserToDelete(null); // Close modal
    } catch (e: any) {
        console.error("Delete Failed:", e);
        setErrorMsg("Delete failed. " + (e.message || "Constraint error (check payments/results)."));
        // Don't close modal on error so user can see it, but optional
        setUserToDelete(null); // Actually, let's close it and show the toast to keep flow clean
    } finally {
        setIsDeleting(false);
    }
  };

  // Filter batches for dropdown
  const filteredBatches = availableBatches.filter(b => 
      b.name.toLowerCase().includes(formData.batch.toLowerCase())
  );
  const exactMatch = availableBatches.find(b => b.name.toLowerCase() === formData.batch.toLowerCase());

  return (
    <div className="space-y-6 animate-fade-in relative bg-gray-50 p-6 min-h-screen">
       <AdminHeader 
        title="User Management" 
        action={
          <button 
            onClick={() => handleOpenModal()}
            className="bg-zenro-red hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition"
          >
            <Plus className="w-5 h-5" /> Add New User
          </button>
        }
      />

      {/* FEEDBACK TOASTS */}
      {successMsg && (
          <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3 animate-fade-in-up shadow-sm">
              <CheckCircle className="w-5 h-5" /> {successMsg}
          </div>
      )}
      {errorMsg && (
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 animate-fade-in-up shadow-sm">
              <XCircle className="w-5 h-5" /> {errorMsg}
          </div>
      )}

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
         <div className="flex items-center gap-4 w-full md:w-auto">
             <SearchBar value={filter} onChange={setFilter} placeholder="Search users..." />
             
             <div className="relative">
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
                  className="appearance-none bg-white border border-gray-300 text-slate-800 pl-4 pr-10 py-2 rounded-lg text-sm focus:ring-2 focus:ring-zenro-blue outline-none cursor-pointer"
                >
                  <option value="ALL">All Roles</option>
                  <option value={UserRole.STUDENT}>Students</option>
                  <option value={UserRole.TEACHER}>Teachers</option>
                  <option value={UserRole.ADMIN}>Admins</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
             </div>
         </div>
         <div className="text-gray-500 text-sm font-medium">
           {loading ? 'Syncing...' : `Showing ${filteredUsers.length} users`}
         </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md min-h-[400px]">
         <div className="overflow-x-auto">
           <table className="w-full text-left text-sm text-gray-600">
             <thead className="bg-gray-100 text-slate-700 uppercase font-bold text-xs">
               <tr>
                 <th className="px-6 py-4">User Profile</th>
                 <th className="px-6 py-4">Role</th>
                 <th className="px-6 py-4">Contact</th>
                 <th className="px-6 py-4">Batch/ID</th>
                 <th className="px-6 py-4 text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {loading ? (
                   <tr>
                       <td colSpan={5} className="p-12 text-center">
                           <Loader2 className="w-8 h-8 text-zenro-blue animate-spin mx-auto mb-2" />
                           <p>Connecting to Database...</p>
                       </td>
                   </tr>
               ) : filteredUsers.length === 0 ? (
                   <tr>
                       <td colSpan={5} className="p-12 text-center text-gray-500">
                           No users found. Click "Add New User" to get started.
                       </td>
                   </tr>
               ) : (
                filteredUsers.map(user => (
                 <tr key={user.id} className="hover:bg-gray-50 transition group">
                   <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                       <img src={user.avatar} alt="" className="w-10 h-10 rounded-full bg-white border border-gray-200" />
                       <div>
                         <p className="text-slate-800 font-bold">{user.name}</p>
                         <p className="text-xs text-gray-500">{user.email}</p>
                       </div>
                     </div>
                   </td>
                   <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                       user.role === UserRole.ADMIN ? 'bg-red-100 text-red-700 border border-red-200' :
                       user.role === UserRole.TEACHER ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                       'bg-green-100 text-green-700 border border-green-200'
                     }`}>
                       {user.role}
                     </span>
                   </td>
                   <td className="px-6 py-4 font-mono text-xs font-medium">{user.phone || 'N/A'}</td>
                   <td className="px-6 py-4">
                     {user.batch ? (
                       <div className="flex flex-col gap-1 items-start">
                           <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200 text-xs text-slate-600 font-bold">{user.batch}</span>
                           <span className="text-[10px] text-gray-400 font-mono">{user.rollNumber}</span>
                       </div>
                     ) : (
                       <span className="text-gray-400">-</span>
                     )}
                   </td>
                   <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* VIEW PROFILE BUTTON */}
                        <button 
                            onClick={() => setViewingUser(user)}
                            className="p-2 bg-white hover:bg-gray-100 text-zenro-blue rounded border border-gray-200 hover:border-zenro-blue transition" 
                            title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleOpenModal(user)} className="p-2 bg-white hover:bg-gray-100 text-slate-600 rounded border border-gray-200 hover:border-slate-400 transition" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => initiateDelete(user)}
                          className="p-2 bg-white hover:bg-red-50 text-red-500 rounded border border-gray-200 hover:border-red-200 transition shadow-sm" 
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                   </td>
                 </tr>
               )))}
             </tbody>
           </table>
         </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl border border-gray-200 shadow-2xl overflow-visible">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        {editingUser ? <Edit2 className="w-5 h-5 text-zenro-blue" /> : <Plus className="w-5 h-5 text-green-600" />}
                        {editingUser ? 'Edit User Profile' : 'Create New Profile'}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                </div>
                
                <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                    {/* Error Banner inside Modal */}
                    {errorMsg && (
                        <div className="bg-red-50 border border-red-100 p-3 rounded text-red-600 text-xs mb-4 font-bold">
                            {errorMsg}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name <span className="text-red-500">*</span></label>
                            <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-white border border-gray-300 rounded p-2 text-slate-800 text-sm focus:border-zenro-blue outline-none" placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role <span className="text-red-500">*</span></label>
                            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-white border border-gray-300 rounded p-2 text-slate-800 text-sm focus:border-zenro-blue outline-none">
                                <option value="STUDENT">Student</option>
                                <option value="TEACHER">Teacher</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address <span className="text-red-500">*</span></label>
                        <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white border border-gray-300 rounded p-2 text-slate-800 text-sm focus:border-zenro-blue outline-none" placeholder="john@example.com" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone (10 digits) <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={formData.phone} 
                                onChange={e => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    if(val.length <= 10) setFormData({...formData, phone: val});
                                }} 
                                className="w-full bg-white border border-gray-300 rounded p-2 text-slate-800 text-sm focus:border-zenro-blue outline-none" 
                                placeholder="9876543210" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zenro-blue uppercase mb-1">Login Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Key className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    value={formData.password} 
                                    onChange={e => setFormData({...formData, password: e.target.value})} 
                                    className="w-full bg-white border border-gray-300 rounded p-2 pl-8 text-slate-800 text-sm font-mono focus:border-zenro-blue outline-none" 
                                    placeholder={editingUser ? "(Unchanged)" : "Min 8 chars"} 
                                />
                                <button type="button" onClick={generatePassword} className="absolute right-2 top-2 text-gray-400 hover:text-zenro-blue" title="Generate Random Password">
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {formData.role === 'STUDENT' && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 mt-4">
                            {/* SMART BATCH SELECTOR */}
                            <div className="relative" ref={batchDropdownRef}>
                                <label className="block text-xs font-bold text-zenro-blue uppercase mb-1">Batch Assignment</label>
                                <div className="relative">
                                    <Layers className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="text" 
                                        value={formData.batch} 
                                        onChange={e => {
                                            setFormData({...formData, batch: e.target.value});
                                            setShowBatchDropdown(true);
                                        }}
                                        onFocus={() => setShowBatchDropdown(true)}
                                        className="w-full bg-white border border-gray-300 rounded p-2 pl-8 text-slate-800 text-sm focus:border-zenro-blue outline-none" 
                                        placeholder="Select or Create Batch..." 
                                    />
                                    <div className="absolute right-2 top-2.5 cursor-pointer" onClick={() => setShowBatchDropdown(!showBatchDropdown)}>
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                                
                                {showBatchDropdown && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                        {filteredBatches.map(b => (
                                            <div 
                                                key={b.id} 
                                                onClick={() => {
                                                    setFormData({...formData, batch: b.name});
                                                    setShowBatchDropdown(false);
                                                }}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-slate-700 flex justify-between items-center"
                                            >
                                                {b.name}
                                                {formData.batch === b.name && <Check className="w-3 h-3 text-zenro-blue" />}
                                            </div>
                                        ))}
                                        {formData.batch && !exactMatch && (
                                            <div 
                                                onClick={() => handleCreateBatch(formData.batch)}
                                                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-zenro-blue cursor-pointer text-sm font-bold border-t border-gray-100 flex items-center gap-2"
                                            >
                                                <Plus className="w-3 h-3" /> Create "{formData.batch}"
                                            </div>
                                        )}
                                        {filteredBatches.length === 0 && !formData.batch && (
                                            <div className="px-4 py-2 text-xs text-gray-500 italic">Start typing to see batches...</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zenro-blue uppercase mb-1">Student ID (Login) <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={formData.student_id} 
                                    onChange={e => setFormData({...formData, student_id: e.target.value})} 
                                    className="w-full bg-white border border-gray-300 rounded p-2 text-slate-800 text-sm focus:border-zenro-blue outline-none" 
                                    placeholder="e.g. 99999..." 
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded text-gray-500 hover:text-slate-800 text-sm font-bold hover:bg-gray-100 transition">Cancel</button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="bg-zenro-red hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-md transition disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                            {editingUser ? 'Update Profile' : 'Create Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* DANGER: DELETE CONFIRMATION MODAL */}
      {userToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-fade-in">
              <div className="bg-white w-full max-w-md rounded-2xl border border-red-200 shadow-2xl overflow-hidden relative">
                  {/* Danger Header */}
                  <div className="bg-red-50 p-6 flex flex-col items-center justify-center border-b border-red-100">
                      <div className="bg-white p-4 rounded-full border border-red-100 mb-4 shadow-sm">
                          <AlertTriangle className="w-10 h-10 text-red-500" />
                      </div>
                      <h2 className="text-2xl font-bold text-red-600">Delete User Permanently?</h2>
                      <p className="text-red-400 text-sm mt-2 text-center font-medium">
                          This action is <strong className="uppercase">irreversible</strong>.
                      </p>
                  </div>
                  
                  <div className="p-6">
                      <p className="text-gray-600 mb-6 text-center text-sm leading-relaxed">
                          You are about to delete the user <strong className="text-slate-900">{userToDelete.name}</strong> ({userToDelete.email}). 
                          All associated data including exam results, fee records, and attendance will be wiped from the database.
                      </p>

                      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6">
                          <label className="flex items-start gap-3 cursor-pointer group">
                              <div className="relative flex items-center">
                                  <input 
                                      type="checkbox" 
                                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-400 bg-white checked:border-red-500 checked:bg-red-500 transition-all"
                                      checked={isDeleteConfirmed}
                                      onChange={(e) => setIsDeleteConfirmed(e.target.checked)}
                                  />
                                  <Check className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" />
                              </div>
                              <span className="text-xs text-gray-500 group-hover:text-gray-700 select-none leading-relaxed font-medium">
                                  I verify that I want to delete this user permanently and understand this step cannot be undone.
                              </span>
                          </label>
                      </div>

                      <div className="flex gap-3">
                          <button 
                              onClick={() => setUserToDelete(null)}
                              className="flex-1 py-3 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-bold text-sm transition"
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={handleExecuteDelete}
                              disabled={!isDeleteConfirmed || isDeleting}
                              className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm shadow-lg shadow-red-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              Delete Permanently
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* NEW: USER PROFILE DETAIL OVERVIEW MODAL */}
      {viewingUser && (
        <UserProfileDetail user={viewingUser} onClose={() => setViewingUser(null)} />
      )}

    </div>
  );
};

// --- FINANCIALS ---
export const AdminFinancials = () => {
  return (
    <div className="space-y-6 animate-fade-in">
       <AdminHeader title="Financial Control Center" />
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-zenro-red/10 rounded-bl-full -mr-4 -mt-4"></div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Phase 1 Collections</h3>
              <p className="text-gray-500 text-sm mb-6">Domestic Training (N5-N3)</p>
              <div className="flex justify-between items-end">
                  <div>
                      <p className="text-xs text-gray-400 uppercase font-bold">Total Collected</p>
                      <p className="text-4xl font-bold text-zenro-red">¥8.2M</p>
                  </div>
                  <div className="text-right">
                      <p className="text-xs text-red-400 uppercase font-bold">Outstanding</p>
                      <p className="text-xl font-bold text-red-500">¥1.2M</p>
                  </div>
              </div>
              <div className="mt-4 w-full bg-gray-100 rounded-full h-3">
                  <div style={{width: '85%'}} className="bg-zenro-red h-full rounded-full"></div>
              </div>
              <p className="text-xs text-right mt-1 text-gray-500 font-bold">85% Collection Rate</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-zenro-blue/10 rounded-bl-full -mr-4 -mt-4"></div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Phase 2 Collections</h3>
              <p className="text-gray-500 text-sm mb-6">Placement & Visa Success Fees</p>
              <div className="flex justify-between items-end">
                  <div>
                      <p className="text-xs text-gray-400 uppercase font-bold">Total Collected</p>
                      <p className="text-4xl font-bold text-zenro-blue">¥4.5M</p>
                  </div>
                  <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase font-bold">Projected</p>
                      <p className="text-xl font-bold text-slate-800">¥15.0M</p>
                  </div>
              </div>
              <div className="mt-4 w-full bg-gray-100 rounded-full h-3">
                  <div style={{width: '30%'}} className="bg-zenro-blue h-full rounded-full"></div>
              </div>
              <p className="text-xs text-right mt-1 text-gray-500 font-bold">30% Realized (Based on Placements)</p>
          </div>
       </div>

       {/* Transaction Table */}
       <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
             <h3 className="text-lg font-bold text-slate-800">Recent Transactions</h3>
             <button className="text-xs text-zenro-blue border border-zenro-blue px-3 py-1 rounded hover:bg-zenro-blue hover:text-white transition font-bold">View All</button>
          </div>
          <table className="w-full text-left text-sm text-gray-600">
             <thead className="bg-gray-100 text-slate-700 uppercase font-bold text-xs">
               <tr>
                 <th className="px-6 py-4">Transaction ID</th>
                 <th className="px-6 py-4">Student</th>
                 <th className="px-6 py-4">Date</th>
                 <th className="px-6 py-4">Category</th>
                 <th className="px-6 py-4">Amount</th>
                 <th className="px-6 py-4">Status</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
                {[
                  { id: 'TXN-9981', student: 'Alex Student', date: '2023-10-01', cat: 'Phase 1 - Month 3', amt: 9000, status: 'SUCCESS' },
                  { id: 'TXN-9982', student: 'Riya Patel', date: '2023-10-01', cat: 'Phase 1 - Month 3', amt: 9000, status: 'FAILED' },
                  { id: 'TXN-9983', student: 'Kenji Sato', date: '2023-09-28', cat: 'Phase 2 - Installment 1', amt: 75000, status: 'SUCCESS' },
                ].map((txn, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                     <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">{txn.id}</td>
                     <td className="px-6 py-4 text-slate-800 font-bold">{txn.student}</td>
                     <td className="px-6 py-4">{txn.date}</td>
                     <td className="px-6 py-4">{txn.cat}</td>
                     <td className="px-6 py-4 font-mono font-bold text-slate-800">¥{txn.amt.toLocaleString()}</td>
                     <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${txn.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {txn.status}
                        </span>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
};
