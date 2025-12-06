import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, BookOpen, DollarSign, TrendingUp, Search, 
  Filter, MoreVertical, Edit2, Trash2, Plus, Download, 
  CheckCircle, XCircle, Shield, AlertTriangle, ChevronDown, ChevronUp, X, Save, RefreshCw, Key, WifiOff, Loader2,
  Layers, Check
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
      <h1 className="text-3xl font-bold text-white font-sans">{title}</h1>
      <p className="text-gray-400 text-sm mt-1">Super User Control Panel</p>
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
      className="bg-dark-900 border border-dark-700 text-white pl-10 pr-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none w-64 transition"
    />
  </div>
);

// --- DASHBOARD ---
export const AdminDashboard = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <AdminHeader 
        title="Admin Overview" 
        action={
          <button className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg text-sm">
            <Download className="w-4 h-4" /> Export Report
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: '¥12.5M', icon: DollarSign, color: 'text-accent-gold', sub: '+12% vs last month' },
          { label: 'Active Students', value: '1,240', icon: Users, color: 'text-brand-500', sub: '98% Retention' },
          { label: 'Pending Visas', value: '45', icon: Shield, color: 'text-blue-500', sub: 'Action Required' },
          { label: 'Course Completion', value: '89%', icon: TrendingUp, color: 'text-green-500', sub: 'Avg N4 Pass Rate' },
        ].map((stat, i) => (
          <div key={i} className="bg-dark-800 p-6 rounded-xl border border-dark-700 hover:border-brand-500/30 transition shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg bg-dark-900 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono text-gray-500 bg-dark-900 px-2 py-1 rounded">2024-FY</span>
            </div>
            <p className="text-gray-400 text-sm uppercase tracking-wider font-bold">{stat.label}</p>
            <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
            <p className="text-xs text-gray-500 mt-2">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-dark-800 p-6 rounded-xl border border-dark-700">
          <h3 className="text-lg font-bold text-white mb-6">Revenue Overview (Phase 1 vs Phase 2)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Legend />
                <Bar dataKey="phase1" name="Domestic Training" fill="#be123c" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="phase2" name="Placement Success" fill="#C5A059" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
           <h3 className="text-lg font-bold text-white mb-6">Batch Distribution</h3>
           <div className="space-y-4">
              {[
                { name: 'Batch 2024-A (N4)', count: 450, color: 'bg-brand-500' },
                { name: 'Batch 2024-B (N5)', count: 320, color: 'bg-blue-600' },
                { name: 'Batch 2023-C (Placed)', count: 280, color: 'bg-accent-gold' },
                { name: 'Batch 2024-C (New)', count: 190, color: 'bg-gray-600' },
              ].map((batch, i) => (
                <div key={i} className="group cursor-pointer">
                   <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span className="font-bold group-hover:text-white transition">{batch.name}</span>
                      <span>{batch.count} Students</span>
                   </div>
                   <div className="w-full bg-dark-900 rounded-full h-2">
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
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

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
            // Avoid duplicates if we already added it optimistically
            if (prev.some(b => b.name === newBatch.name)) {
                // Update the ID if it was a temp ID
                return prev.map(b => b.name === newBatch.name ? newBatch : b);
            }
            return [...prev, newBatch].sort((a, b) => a.name.localeCompare(b.name));
        });
      })
      .subscribe();

    // Click outside listener for batch dropdown
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

  // Clear toast messages after 3 seconds
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
          // 1. Robust Fetch: Try to get from 'batches' table
          const { data, error } = await supabase.from('batches').select('*').order('name');
          
          let dbBatches: Batch[] = [];
          if (!error && data) {
              dbBatches = data;
          }

          // 2. Legacy Fallback: Scan profiles for batches not in DB yet (migration support)
          // Only if DB fetch worked but we want to ensure we don't miss legacy string-only batches
          const { data: profileData } = await supabase.from('profiles').select('batch');
          if (profileData) {
              const uniqueNames = Array.from(new Set(profileData.map((p:any) => p.batch).filter(Boolean)));
              // Merge: Add legacy ones if they aren't in DB list
              const existingNames = new Set(dbBatches.map(b => b.name));
              const missingLegacy = uniqueNames
                  .filter(name => !existingNames.has(name as string))
                  .map(name => ({ id: `legacy-${name}`, name: name as string }));
              
              setAvailableBatches([...dbBatches, ...missingLegacy].sort((a, b) => a.name.localeCompare(b.name)));
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
          // 1. Optimistic UI Update (Immediate)
          const tempId = `temp-${Date.now()}`;
          const tempBatch = { id: tempId, name: newBatchName };
          setAvailableBatches(prev => [...prev, tempBatch].sort((a, b) => a.name.localeCompare(b.name)));
          
          // Auto-select
          setFormData(prev => ({ ...prev, batch: newBatchName }));
          setShowBatchDropdown(false);
          setSuccessMsg(`Batch "${newBatchName}" created! Syncing...`);

          // 2. DB Insert
          const { data, error } = await supabase.from('batches').insert({ name: newBatchName }).select();
          
          if (error) {
              console.error("Create Batch Error:", error);
              // Handle error: maybe revert optimistic update if it was critical, or just warn
              if (error.code !== '42P01') { // Ignore "table missing" error for legacy compatibility
                  setErrorMsg("Could not save batch to database. It may disappear on refresh.");
              }
          } else if (data) {
              // 3. Confirm Update with real ID
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
    const chars = "0123456789";
    let pass = "";
    for(let i=0; i<6; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    setFormData(prev => ({...prev, password: pass}));
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    
    if (formData.role === 'STUDENT' && !formData.student_id) {
        setErrorMsg("Student ID is mandatory for Students.");
        setIsSubmitting(false);
        return;
    }
    if (!editingUser && !formData.password) {
        setErrorMsg("Password is required for new users.");
        setIsSubmitting(false);
        return;
    }

    const payload: any = {
      full_name: formData.full_name,
      email: formData.email,
      role: formData.role,
      student_id: formData.student_id || null, 
      batch: formData.batch,
      phone: formData.phone,
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
          setErrorMsg("Error: Email or Student ID already exists.");
      } else {
          setErrorMsg(`Database Error: ${err.message || 'Check connection'}`);
      }
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user? This cannot be undone.')) {
        try {
            const { error } = await supabase.from('profiles').delete().eq('id', id);
            if (error) throw error;
            setSuccessMsg("User deleted.");
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (e: any) {
            setErrorMsg("Failed to delete user. " + e.message);
        }
    }
  };

  // Filter batches for dropdown
  const filteredBatches = availableBatches.filter(b => 
      b.name.toLowerCase().includes(formData.batch.toLowerCase())
  );
  const exactMatch = availableBatches.find(b => b.name.toLowerCase() === formData.batch.toLowerCase());

  return (
    <div className="space-y-6 animate-fade-in relative">
       <AdminHeader 
        title="User Management" 
        action={
          <button 
            onClick={() => handleOpenModal()}
            className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" /> Add New User
          </button>
        }
      />

      {/* FEEDBACK TOASTS */}
      {successMsg && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-lg flex items-center gap-3 animate-fade-in-up">
              <CheckCircle className="w-5 h-5" /> {successMsg}
          </div>
      )}
      {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg flex items-center gap-3 animate-fade-in-up">
              <XCircle className="w-5 h-5" /> {errorMsg}
          </div>
      )}

      {/* Controls */}
      <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 flex flex-col md:flex-row gap-4 items-center justify-between">
         <div className="flex items-center gap-4 w-full md:w-auto">
             <SearchBar value={filter} onChange={setFilter} placeholder="Search users..." />
             
             <div className="relative">
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
                  className="appearance-none bg-dark-900 border border-dark-700 text-white pl-4 pr-10 py-2 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
                >
                  <option value="ALL">All Roles</option>
                  <option value={UserRole.STUDENT}>Students</option>
                  <option value={UserRole.TEACHER}>Teachers</option>
                  <option value={UserRole.ADMIN}>Admins</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
             </div>
         </div>
         <div className="text-gray-400 text-sm">
           {loading ? 'Syncing...' : `Showing ${filteredUsers.length} users`}
         </div>
      </div>

      {/* Data Table */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden shadow-xl min-h-[400px]">
         <div className="overflow-x-auto">
           <table className="w-full text-left text-sm text-gray-400">
             <thead className="bg-dark-900 text-gray-200 uppercase font-bold text-xs">
               <tr>
                 <th className="px-6 py-4">User Profile</th>
                 <th className="px-6 py-4">Role</th>
                 <th className="px-6 py-4">Contact</th>
                 <th className="px-6 py-4">Batch/ID</th>
                 <th className="px-6 py-4 text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-dark-700">
               {loading ? (
                   <tr>
                       <td colSpan={5} className="p-12 text-center">
                           <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-2" />
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
                 <tr key={user.id} className="hover:bg-dark-700/50 transition group">
                   <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                       <img src={user.avatar} alt="" className="w-10 h-10 rounded-full bg-dark-900 border border-dark-600" />
                       <div>
                         <p className="text-white font-bold">{user.name}</p>
                         <p className="text-xs">{user.email}</p>
                       </div>
                     </div>
                   </td>
                   <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                       user.role === UserRole.ADMIN ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                       user.role === UserRole.TEACHER ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' :
                       'bg-green-500/20 text-green-500 border border-green-500/30'
                     }`}>
                       {user.role}
                     </span>
                   </td>
                   <td className="px-6 py-4 font-mono text-xs">{user.phone || 'N/A'}</td>
                   <td className="px-6 py-4">
                     {user.batch ? (
                       <div className="flex flex-col gap-1">
                           <span className="bg-dark-900 px-2 py-1 rounded border border-dark-600 text-xs text-gray-300 text-center">{user.batch}</span>
                           <span className="text-[10px] text-gray-500 text-center">{user.rollNumber}</span>
                       </div>
                     ) : (
                       <span className="text-gray-600">-</span>
                     )}
                   </td>
                   <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal(user)} className="p-2 bg-dark-900 hover:bg-blue-900/30 text-blue-500 rounded border border-dark-600 hover:border-blue-500/30 transition" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 bg-dark-900 hover:bg-red-900/30 text-red-500 rounded border border-dark-600 hover:border-red-500/30 transition" 
                          title="Delete"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-dark-800 w-full max-w-lg rounded-2xl border border-dark-700 shadow-2xl overflow-visible">
                <div className="flex justify-between items-center p-6 border-b border-dark-700 bg-dark-900 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {editingUser ? <Edit2 className="w-5 h-5 text-brand-500" /> : <Plus className="w-5 h-5 text-green-500" />}
                        {editingUser ? 'Edit User Profile' : 'Create New Profile'}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
                
                <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                    {/* Error Banner inside Modal */}
                    {errorMsg && (
                        <div className="bg-red-500/20 border border-red-500/30 p-3 rounded text-red-400 text-xs mb-4">
                            {errorMsg}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name *</label>
                            <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-white text-sm focus:border-brand-500 outline-none" placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role *</label>
                            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-white text-sm focus:border-brand-500 outline-none">
                                <option value="STUDENT">Student</option>
                                <option value="TEACHER">Teacher</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address *</label>
                        <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-white text-sm focus:border-brand-500 outline-none" placeholder="john@example.com" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-white text-sm focus:border-brand-500 outline-none" placeholder="+91..." />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-brand-500 uppercase mb-1">Login Password *</label>
                            <div className="relative">
                                <Key className="absolute left-2 top-2.5 w-4 h-4 text-gray-500" />
                                <input 
                                    type="text" 
                                    value={formData.password} 
                                    onChange={e => setFormData({...formData, password: e.target.value})} 
                                    className="w-full bg-dark-900 border border-dark-700 rounded p-2 pl-8 text-white text-sm font-mono focus:border-brand-500 outline-none" 
                                    placeholder={editingUser ? "(Unchanged)" : "Required"} 
                                />
                                <button type="button" onClick={generatePassword} className="absolute right-2 top-2 text-gray-400 hover:text-brand-500" title="Generate Random Password">
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {formData.role === 'STUDENT' && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dark-700 mt-4">
                            {/* SMART BATCH SELECTOR */}
                            <div className="relative" ref={batchDropdownRef}>
                                <label className="block text-xs font-bold text-brand-500 uppercase mb-1">Batch Assignment</label>
                                <div className="relative">
                                    <Layers className="absolute left-2 top-2.5 w-4 h-4 text-gray-500" />
                                    <input 
                                        type="text" 
                                        value={formData.batch} 
                                        onChange={e => {
                                            setFormData({...formData, batch: e.target.value});
                                            setShowBatchDropdown(true);
                                        }}
                                        onFocus={() => setShowBatchDropdown(true)}
                                        className="w-full bg-dark-900 border border-dark-700 rounded p-2 pl-8 text-white text-sm focus:border-brand-500 outline-none" 
                                        placeholder="Select or Create Batch..." 
                                    />
                                    <div className="absolute right-2 top-2.5 cursor-pointer" onClick={() => setShowBatchDropdown(!showBatchDropdown)}>
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                    </div>
                                </div>
                                
                                {showBatchDropdown && (
                                    <div className="absolute z-50 w-full mt-1 bg-dark-800 border border-dark-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                        {filteredBatches.map(b => (
                                            <div 
                                                key={b.id} 
                                                onClick={() => {
                                                    setFormData({...formData, batch: b.name});
                                                    setShowBatchDropdown(false);
                                                }}
                                                className="px-4 py-2 hover:bg-dark-700 cursor-pointer text-sm text-gray-300 flex justify-between items-center"
                                            >
                                                {b.name}
                                                {formData.batch === b.name && <Check className="w-3 h-3 text-brand-500" />}
                                            </div>
                                        ))}
                                        {formData.batch && !exactMatch && (
                                            <div 
                                                onClick={() => handleCreateBatch(formData.batch)}
                                                className="px-4 py-2 bg-brand-900/20 hover:bg-brand-900/40 text-brand-500 cursor-pointer text-sm font-bold border-t border-dark-700 flex items-center gap-2"
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
                                <label className="block text-xs font-bold text-brand-500 uppercase mb-1">Student ID (Login) *</label>
                                <input 
                                    type="text" 
                                    value={formData.student_id} 
                                    onChange={e => setFormData({...formData, student_id: e.target.value})} 
                                    className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-white text-sm focus:border-brand-500 outline-none" 
                                    placeholder="e.g. 99999..." 
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded text-gray-400 hover:text-white text-sm font-bold">Cancel</button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                            {editingUser ? 'Update Profile' : 'Create Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
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
          <div className="bg-gradient-to-br from-brand-900 to-dark-800 p-6 rounded-xl border border-brand-500/30">
              <h3 className="text-xl font-bold text-white mb-2">Phase 1 Collections</h3>
              <p className="text-brand-200 text-sm mb-6">Domestic Training (N5-N3)</p>
              <div className="flex justify-between items-end">
                  <div>
                      <p className="text-xs text-gray-300 uppercase">Total Collected</p>
                      <p className="text-4xl font-bold text-white">¥8.2M</p>
                  </div>
                  <div className="text-right">
                      <p className="text-xs text-red-300 uppercase">Outstanding</p>
                      <p className="text-xl font-bold text-red-400">¥1.2M</p>
                  </div>
              </div>
              <div className="mt-4 w-full bg-dark-900/50 rounded-full h-3">
                  <div style={{width: '85%'}} className="bg-brand-500 h-full rounded-full"></div>
              </div>
              <p className="text-xs text-right mt-1 text-brand-200">85% Collection Rate</p>
          </div>

          <div className="bg-gradient-to-br from-accent-gold/20 to-dark-800 p-6 rounded-xl border border-accent-gold/30">
              <h3 className="text-xl font-bold text-white mb-2">Phase 2 Collections</h3>
              <p className="text-yellow-200 text-sm mb-6">Placement & Visa Success Fees</p>
              <div className="flex justify-between items-end">
                  <div>
                      <p className="text-xs text-gray-300 uppercase">Total Collected</p>
                      <p className="text-4xl font-bold text-accent-gold">¥4.5M</p>
                  </div>
                  <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase">Projected</p>
                      <p className="text-xl font-bold text-white">¥15.0M</p>
                  </div>
              </div>
              <div className="mt-4 w-full bg-dark-900/50 rounded-full h-3">
                  <div style={{width: '30%'}} className="bg-accent-gold h-full rounded-full"></div>
              </div>
              <p className="text-xs text-right mt-1 text-yellow-200">30% Realized (Based on Placements)</p>
          </div>
       </div>

       {/* Transaction Table */}
       <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
          <div className="p-6 border-b border-dark-700 flex justify-between items-center">
             <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
             <button className="text-xs text-brand-500 border border-brand-500 px-3 py-1 rounded hover:bg-brand-500 hover:text-white transition">View All</button>
          </div>
          <table className="w-full text-left text-sm text-gray-400">
             <thead className="bg-dark-900 text-gray-200 uppercase font-bold text-xs">
               <tr>
                 <th className="px-6 py-4">Transaction ID</th>
                 <th className="px-6 py-4">Student</th>
                 <th className="px-6 py-4">Date</th>
                 <th className="px-6 py-4">Category</th>
                 <th className="px-6 py-4">Amount</th>
                 <th className="px-6 py-4">Status</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-dark-700">
                {[
                  { id: 'TXN-9981', student: 'Alex Student', date: '2023-10-01', cat: 'Phase 1 - Month 3', amt: 9000, status: 'SUCCESS' },
                  { id: 'TXN-9982', student: 'Riya Patel', date: '2023-10-01', cat: 'Phase 1 - Month 3', amt: 9000, status: 'FAILED' },
                  { id: 'TXN-9983', student: 'Kenji Sato', date: '2023-09-28', cat: 'Phase 2 - Installment 1', amt: 75000, status: 'SUCCESS' },
                ].map((txn, i) => (
                  <tr key={i} className="hover:bg-dark-700/50 transition">
                     <td className="px-6 py-4 font-mono text-xs">{txn.id}</td>
                     <td className="px-6 py-4 text-white font-bold">{txn.student}</td>
                     <td className="px-6 py-4">{txn.date}</td>
                     <td className="px-6 py-4">{txn.cat}</td>
                     <td className="px-6 py-4 font-mono text-white">¥{txn.amt.toLocaleString()}</td>
                     <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${txn.status === 'SUCCESS' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
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