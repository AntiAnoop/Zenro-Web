
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, BookOpen, DollarSign, TrendingUp, Search, 
  Filter, MoreVertical, Edit2, Trash2, Plus, Download, 
  CheckCircle, XCircle, Shield, AlertTriangle, ChevronDown, ChevronUp, X, Save, RefreshCw, Key, WifiOff, Loader2,
  Layers, Check, Eye, CreditCard, FileText, Calendar, Clock, ArrowLeft, Briefcase, GraduationCap, MapPin, Phone, Mail, Radio
} from 'lucide-react';
import { User, UserRole, Schedule, LiveSessionRecord } from '../types';
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
    const [fees, setFees] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalFees: 0, paidFees: 0, pendingFees: 0, avgScore: 0, testsTaken: 0, attendance: 88 });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: feeData } = await supabase.from('fees').select('*').eq('student_id', user.id);
                const fData = feeData || [];
                setFees(fData);
                const { data: subData } = await supabase.from('submissions').select('*, tests(title)').eq('student_id', user.id).order('completed_at', { ascending: false });
                const sData = subData || [];
                setSubmissions(sData);
                const totalF = fData.reduce((acc:number, curr:any) => acc + curr.amount, 0);
                const paidF = fData.filter((f:any) => f.status === 'PAID').reduce((acc:number, curr:any) => acc + curr.amount, 0);
                const avgS = sData.length > 0 ? Math.round(sData.reduce((acc:number, curr:any) => acc + (curr.score/curr.total_score), 0) / sData.length * 100) : 0;
                setStats({ totalFees: totalF, paidFees: paidF, pendingFees: totalF - paidF, avgScore: avgS, testsTaken: sData.length, attendance: 88 });
            } catch (e) { console.error("Profile Error:", e); } finally { setLoading(false); }
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
                <div className="p-6 bg-gradient-to-r from-zenro-blue to-slate-900 border-b border-gray-200 flex justify-between items-start sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                         <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-white"><ArrowLeft className="w-6 h-6" /></button>
                         <div className="flex items-center gap-4">
                             <img src={user.avatar} alt="" className="w-16 h-16 rounded-full border-4 border-white shadow-lg bg-white" />
                             <div>
                                 <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                                 <p className="text-blue-200 text-sm flex items-center gap-2">
                                     <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold border border-white/30 uppercase text-white">{user.role}</span>
                                     <span>•</span><span>{user.email}</span>
                                 </p>
                             </div>
                         </div>
                    </div>
                </div>
                {/* Simplified Tabs View */}
                <div className="p-8 space-y-6">
                    {loading ? <div className="text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-zenro-blue"/></div> : (
                        <div className="grid grid-cols-2 gap-4">
                            <InfoRow label="Total Fees" value={`¥${stats.totalFees}`} icon={DollarSign} />
                            <InfoRow label="Pending" value={`¥${stats.pendingFees}`} icon={AlertTriangle} />
                            <InfoRow label="Tests Taken" value={stats.testsTaken} icon={FileText} />
                            <InfoRow label="Avg Score" value={`${stats.avgScore}%`} icon={TrendingUp} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- ADMIN DASHBOARD ---
export const AdminDashboard = () => {
    return (
        <div className="space-y-8 animate-fade-in">
             <AdminHeader title="Admin Dashboard" />
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                     <div className="p-4 bg-blue-100 rounded-lg text-blue-600"><Users className="w-8 h-8" /></div>
                     <div><p className="text-gray-500 text-xs font-bold uppercase">Total Users</p><h3 className="text-2xl font-bold text-slate-800">142</h3></div>
                 </div>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                     <div className="p-4 bg-green-100 rounded-lg text-green-600"><DollarSign className="w-8 h-8" /></div>
                     <div><p className="text-gray-500 text-xs font-bold uppercase">Total Revenue</p><h3 className="text-2xl font-bold text-slate-800">¥12.5M</h3></div>
                 </div>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                     <div className="p-4 bg-purple-100 rounded-lg text-purple-600"><BookOpen className="w-8 h-8" /></div>
                     <div><p className="text-gray-500 text-xs font-bold uppercase">Active Courses</p><h3 className="text-2xl font-bold text-slate-800">4</h3></div>
                 </div>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-zenro-blue"/> Recent Activity</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                            <span>New user registration: <strong>Kenji Tanaka</strong></span>
                            <span className="text-xs text-gray-500">2m ago</span>
                        </div>
                         <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                            <span>Payment received: <strong>¥45,000</strong></span>
                            <span className="text-xs text-gray-500">15m ago</span>
                        </div>
                         <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                            <span>New course created: <strong>JLPT N3 Grammar</strong></span>
                            <span className="text-xs text-gray-500">1h ago</span>
                        </div>
                    </div>
                 </div>
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-green-600"/> System Health</h3>
                    <div className="flex items-center gap-2 text-green-600 font-bold mb-2"><CheckCircle className="w-5 h-5" /> All Systems Operational</div>
                    <p className="text-sm text-gray-500">Database connection is stable. API latency is normal (45ms). Backup completed successfully at 03:00 AM.</p>
                 </div>
             </div>
        </div>
    );
};

// --- ADMIN TEACHER ANALYTICS & MONITOR ---
export const AdminTeacherAnalytics = () => {
    const [stats, setStats] = useState<any[]>([]);
    const [logs, setLogs] = useState<LiveSessionRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('live_sessions')
                .select('*, profiles(full_name)')
                .order('start_time', { ascending: false });
            
            if (data) {
                const processedLogs: LiveSessionRecord[] = data.map((s:any) => ({
                    id: s.id,
                    teacher_id: s.teacher_id,
                    teacher_name: s.profiles?.full_name,
                    batch_name: s.batch_name,
                    topic: s.topic,
                    start_time: s.start_time,
                    end_time: s.end_time,
                    status: s.status
                }));
                setLogs(processedLogs);

                const teacherMap = new Map<string, {name: string, sessions: number, totalHours: number}>();
                processedLogs.forEach(session => {
                    if (!teacherMap.has(session.teacher_id)) {
                        teacherMap.set(session.teacher_id, { name: session.teacher_name || 'Unknown', sessions: 0, totalHours: 0 });
                    }
                    const t = teacherMap.get(session.teacher_id)!;
                    t.sessions += 1;
                    if (session.end_time && session.start_time) {
                        const durationMs = new Date(session.end_time).getTime() - new Date(session.start_time).getTime();
                        t.totalHours += durationMs / (1000 * 60 * 60);
                    }
                });
                setStats(Array.from(teacherMap.values()));
            }
            setLoading(false);
        };
        fetchAnalytics();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            <AdminHeader title="Teacher Activity Analytics" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Teaching Hours (Total)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats}>
                                <XAxis dataKey="name" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                                <Bar dataKey="totalHours" name="Hours" fill="#1A237E" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[400px]">
                    <div className="p-6 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-bold text-slate-800">Session History</h3>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-100 text-slate-700 uppercase font-bold text-xs sticky top-0">
                                <tr>
                                    <th className="p-4">Teacher</th>
                                    <th className="p-4">Batch</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Duration</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.map(log => {
                                    const duration = log.end_time 
                                        ? Math.round((new Date(log.end_time).getTime() - new Date(log.start_time).getTime()) / 60000) + ' mins'
                                        : 'Live Now';
                                    return (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="p-4 font-bold text-slate-800">{log.teacher_name}</td>
                                            <td className="p-4">{log.batch_name}</td>
                                            <td className="p-4">{new Date(log.start_time).toLocaleDateString()}</td>
                                            <td className="p-4 font-mono">{duration}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- ADMIN SCHEDULE VIEW ---
export const AdminScheduleView = () => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase
                .from('schedules')
                .select('*, profiles(full_name)')
                .order('start_time', { ascending: true });
            
            if (data) {
                const mapped: Schedule[] = data.map((s:any) => ({
                    ...s,
                    teacher_name: s.profiles?.full_name
                }));
                setSchedules(mapped);
            }
            setLoading(false);
        };
        fetch();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            <AdminHeader title="Master Schedule" />
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Global Class Schedule</h3>
                    <span className="text-xs text-gray-500 font-bold bg-white border px-2 py-1 rounded">Next 30 Days</span>
                </div>
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-100 text-slate-700 uppercase font-bold text-xs">
                        <tr>
                            <th className="p-4">Date & Time</th>
                            <th className="p-4">Class / Topic</th>
                            <th className="p-4">Batch</th>
                            <th className="p-4">Instructor</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {schedules.map(sched => (
                            <tr key={sched.id} className="hover:bg-gray-50">
                                <td className="p-4">
                                    <div className="font-bold text-slate-800">{new Date(sched.start_time).toLocaleDateString()}</div>
                                    <div className="text-xs text-gray-500">{new Date(sched.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                </td>
                                <td className="p-4 font-medium">{sched.title}</td>
                                <td className="p-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">{sched.batch_name}</span></td>
                                <td className="p-4">{sched.teacher_name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [availableBatches, setAvailableBatches] = useState<Batch[]>([]);
  const [showBatchDropdown, setShowBatchDropdown] = useState(false);
  const batchDropdownRef = useRef<HTMLDivElement>(null);
  
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
    
    // Subscribe to batch changes to keep dropdown fresh
    const batchSubscription = supabase
      .channel('admin_user_batches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'batches' }, () => {
        fetchBatches();
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
        setErrorMsg("Failed to load users.");
    } finally {
        setLoading(false);
    }
  };

  const fetchBatches = async () => {
      try {
          const { data, error } = await supabase.from('batches').select('*').order('created_at', { ascending: false });
          if (!error && data) {
              setAvailableBatches(data);
          }
      } catch (e) {
          console.error("Batch fetch error", e);
      }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    
    // --- VALIDATION ---
    if (!formData.full_name.trim() || !formData.email.trim()) {
        setErrorMsg("Name and Email are mandatory.");
        setIsSubmitting(false); return;
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
      // 1. AUTO-CREATE BATCH IF MISSING
      if (formData.role === 'STUDENT' && formData.batch.trim()) {
          const batchName = formData.batch.trim();
          const batchExists = availableBatches.some(b => b.name.toLowerCase() === batchName.toLowerCase());
          
          if (!batchExists) {
              // Create it explicitly so other listeners pick it up immediately
              const { error: batchErr } = await supabase.from('batches').insert({ name: batchName });
              if (batchErr && batchErr.code !== '23505') { // Ignore unique violation if race condition
                  console.error("Batch creation failed:", batchErr);
              } else {
                  // Wait a tick for subscription to update or manually update local state
                  fetchBatches(); 
              }
          }
      }

      // 2. SAVE USER
      if (editingUser) {
        const { error } = await supabase.from('profiles').update(payload).eq('id', editingUser.id);
        if (error) throw error;
        setSuccessMsg("User updated successfully.");
      } else {
        const { error } = await supabase.from('profiles').insert([payload]);
        if (error) throw error;
        setSuccessMsg("New user created.");
      }

      setIsModalOpen(false);
      fetchUsers();

    } catch (err: any) {
      console.error("DB Write Failed:", err);
      setErrorMsg(`Error: ${err.message || 'Database error'}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  // ... (Delete handlers remain same)
  const initiateDelete = (user: User) => {
      setUserToDelete(user);
      setIsDeleteConfirmed(false);
      setErrorMsg('');
  };

  const handleExecuteDelete = async () => {
    if (!userToDelete || !isDeleteConfirmed) return;
    setIsDeleting(true);
    try {
        const { error } = await supabase.from('profiles').delete().eq('id', userToDelete.id);
        if (error) throw error;
        setSuccessMsg(`User ${userToDelete.name} deleted.`);
        setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
        setUserToDelete(null); 
    } catch (e: any) {
        console.error("Delete Failed:", e);
        setErrorMsg("Delete failed. " + (e.message));
    } finally {
        setIsDeleting(false);
    }
  };

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

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      (u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase())) &&
      (roleFilter === 'ALL' || u.role === roleFilter)
    );
  }, [users, filter, roleFilter]);

  const filteredBatches = availableBatches.filter(b => 
      b.name.toLowerCase().includes(formData.batch.toLowerCase())
  );
  
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

      {successMsg && <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3 animate-fade-in-up shadow-sm"><CheckCircle className="w-5 h-5" /> {successMsg}</div>}
      {errorMsg && <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 animate-fade-in-up shadow-sm"><XCircle className="w-5 h-5" /> {errorMsg}</div>}

      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
         <div className="flex items-center gap-4 w-full md:w-auto">
             <SearchBar value={filter} onChange={setFilter} placeholder="Search users..." />
             <div className="relative">
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')} className="appearance-none bg-white border border-gray-300 text-slate-800 pl-4 pr-10 py-2 rounded-lg text-sm focus:ring-2 focus:ring-zenro-blue outline-none cursor-pointer">
                  <option value="ALL">All Roles</option>
                  <option value={UserRole.STUDENT}>Students</option>
                  <option value={UserRole.TEACHER}>Teachers</option>
                  <option value={UserRole.ADMIN}>Admins</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
             </div>
         </div>
         <div className="text-gray-500 text-sm font-medium">{loading ? 'Syncing...' : `Showing ${filteredUsers.length} users`}</div>
      </div>

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
               {loading ? <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="w-8 h-8 text-zenro-blue animate-spin mx-auto mb-2" /><p>Connecting to Database...</p></td></tr> : filteredUsers.length === 0 ? <tr><td colSpan={5} className="p-12 text-center text-gray-500">No users found. Click "Add New User" to get started.</td></tr> : filteredUsers.map(user => (
                 <tr key={user.id} className="hover:bg-gray-50 transition group">
                   <td className="px-6 py-4"><div className="flex items-center gap-3"><img src={user.avatar} alt="" className="w-10 h-10 rounded-full bg-white border border-gray-200" /><div><p className="text-slate-800 font-bold">{user.name}</p><p className="text-xs text-gray-500">{user.email}</p></div></div></td>
                   <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${user.role === UserRole.ADMIN ? 'bg-red-100 text-red-700 border border-red-200' : user.role === UserRole.TEACHER ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>{user.role}</span></td>
                   <td className="px-6 py-4 font-mono text-xs font-medium">{user.phone || 'N/A'}</td>
                   <td className="px-6 py-4">{user.batch ? <div className="flex flex-col gap-1 items-start"><span className="bg-gray-100 px-2 py-1 rounded border border-gray-200 text-xs text-slate-600 font-bold">{user.batch}</span><span className="text-[10px] text-gray-400 font-mono">{user.rollNumber}</span></div> : <span className="text-gray-400">-</span>}</td>
                   <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => setViewingUser(user)} className="p-2 bg-white hover:bg-gray-100 text-zenro-blue rounded border border-gray-200 hover:border-zenro-blue transition"><Eye className="w-4 h-4" /></button><button onClick={() => handleOpenModal(user)} className="p-2 bg-white hover:bg-gray-100 text-slate-600 rounded border border-gray-200 hover:border-slate-400 transition"><Edit2 className="w-4 h-4" /></button><button onClick={() => initiateDelete(user)} className="p-2 bg-white hover:bg-red-50 text-red-500 rounded border border-gray-200 hover:border-red-200 transition shadow-sm"><Trash2 className="w-4 h-4" /></button></div></td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl border border-gray-200 shadow-2xl overflow-visible">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">{editingUser ? <Edit2 className="w-5 h-5 text-zenro-blue" /> : <Plus className="w-5 h-5 text-green-600" />}{editingUser ? 'Edit User Profile' : 'Create New Profile'}</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                    {errorMsg && <div className="bg-red-50 border border-red-100 p-3 rounded text-red-600 text-xs mb-4 font-bold">{errorMsg}</div>}
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name *</label><input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-white border border-gray-300 rounded p-2 text-sm" placeholder="John Doe" /></div>
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role *</label><select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-white border border-gray-300 rounded p-2 text-sm"><option value="STUDENT">Student</option><option value="TEACHER">Teacher</option><option value="ADMIN">Admin</option></select></div>
                    </div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email *</label><input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white border border-gray-300 rounded p-2 text-sm" placeholder="email@example.com" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone *</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} className="w-full bg-white border border-gray-300 rounded p-2 text-sm" /></div>
                        <div><label className="block text-xs font-bold text-zenro-blue uppercase mb-1">Password *</label><input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-white border border-gray-300 rounded p-2 text-sm font-mono" placeholder="Min 8 chars" /></div>
                    </div>
                    {formData.role === 'STUDENT' && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 mt-4">
                            <div className="relative" ref={batchDropdownRef}>
                                <label className="block text-xs font-bold text-zenro-blue uppercase mb-1">Batch Assignment</label>
                                <div className="relative">
                                    <Layers className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                                    <input type="text" value={formData.batch} onChange={e => { setFormData({...formData, batch: e.target.value}); setShowBatchDropdown(true); }} onFocus={() => setShowBatchDropdown(true)} className="w-full bg-white border border-gray-300 rounded p-2 pl-8 text-slate-800 text-sm focus:border-zenro-blue outline-none" placeholder="Select or Create Batch..." />
                                    <div className="absolute right-2 top-2.5 cursor-pointer" onClick={() => setShowBatchDropdown(!showBatchDropdown)}><ChevronDown className="w-4 h-4 text-gray-400" /></div>
                                </div>
                                {showBatchDropdown && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                        {filteredBatches.map(b => (
                                            <div key={b.id} onClick={() => { setFormData({...formData, batch: b.name}); setShowBatchDropdown(false); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-slate-700 flex justify-between items-center">{b.name} {formData.batch === b.name && <Check className="w-3 h-3 text-zenro-blue" />}</div>
                                        ))}
                                        {formData.batch && !filteredBatches.some(b => b.name === formData.batch) && (
                                            <div className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-zenro-blue cursor-pointer text-sm font-bold border-t border-gray-100 flex items-center gap-2"><Plus className="w-3 h-3" /> Create "{formData.batch}"</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div><label className="block text-xs font-bold text-zenro-blue uppercase mb-1">Student ID *</label><input type="text" value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} className="w-full bg-white border border-gray-300 rounded p-2 text-sm" /></div>
                        </div>
                    )}
                    <div className="pt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded text-gray-500 font-bold hover:bg-gray-100">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-zenro-red text-white px-6 py-2 rounded font-bold">{isSubmitting ? 'Saving...' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* DANGER: DELETE CONFIRMATION MODAL */}
      {userToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-fade-in">
              <div className="bg-white w-full max-w-md rounded-2xl border border-red-200 shadow-2xl overflow-hidden relative">
                  <div className="bg-red-50 p-6 flex flex-col items-center justify-center border-b border-red-100">
                      <div className="bg-white p-4 rounded-full border border-red-100 mb-4 shadow-sm"><AlertTriangle className="w-10 h-10 text-red-500" /></div>
                      <h2 className="text-2xl font-bold text-red-600">Delete User Permanently?</h2>
                  </div>
                  <div className="p-6">
                      <p className="text-gray-600 mb-6 text-center text-sm leading-relaxed">Irreversible action. User <strong>{userToDelete.name}</strong> will be wiped.</p>
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6"><label className="flex items-start gap-3 cursor-pointer group"><input type="checkbox" className="mt-1" checked={isDeleteConfirmed} onChange={(e) => setIsDeleteConfirmed(e.target.checked)} /><span className="text-xs text-gray-500 font-medium">I verify that I want to delete this user permanently.</span></label></div>
                      <div className="flex gap-3">
                          <button onClick={() => setUserToDelete(null)} className="flex-1 py-3 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-bold text-sm">Cancel</button>
                          <button onClick={handleExecuteDelete} disabled={!isDeleteConfirmed || isDeleting} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm disabled:opacity-50">Delete</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {viewingUser && <UserProfileDetail user={viewingUser} onClose={() => setViewingUser(null)} />}
    </div>
  );
};

export const AdminFinancials = () => {
    return (
        <div className="space-y-8 animate-fade-in">
             <AdminHeader title="Financial Overview" />
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                     <p className="text-xs font-bold text-gray-500 uppercase">Total Revenue</p>
                     <h3 className="text-3xl font-bold text-slate-800">¥12,500,000</h3>
                 </div>
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                     <p className="text-xs font-bold text-gray-500 uppercase">Outstanding Fees</p>
                     <h3 className="text-3xl font-bold text-red-600">¥1,200,000</h3>
                 </div>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                     <p className="text-xs font-bold text-gray-500 uppercase">Pending Transactions</p>
                     <h3 className="text-3xl font-bold text-yellow-600">14</h3>
                 </div>
             </div>
             
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
                 <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                 <p>Detailed financial transaction history and export tools coming soon.</p>
             </div>
        </div>
    );
};
