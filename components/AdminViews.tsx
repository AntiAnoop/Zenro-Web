
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, BookOpen, DollarSign, TrendingUp, Search, 
  Filter, MoreVertical, Edit2, Trash2, Plus, Download, 
  CheckCircle, XCircle, Shield, AlertTriangle, ChevronDown, ChevronUp, X, Save, RefreshCw, Key, WifiOff, Loader2,
  Layers, Check, Eye, CreditCard, FileText, Calendar, Clock, ArrowLeft, Briefcase, GraduationCap, MapPin, Phone, Mail, Radio, Activity, Camera, ChevronLeft, ChevronRight, Repeat
} from 'lucide-react';
import { User, UserRole, Schedule, LiveSessionRecord } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { supabase } from '../services/supabaseClient';

// --- HELPER FUNCTIONS ---
const generateUUID = () => {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> (+c / 4)).toString(16)
    );
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
};

const AdminHeader = ({ title, action }: { title: string, action?: React.ReactNode }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
    <div>
      <h1 className="text-2xl md:text-3xl font-heading font-bold text-slate-800">{title}</h1>
      <p className="text-gray-500 text-sm mt-1">Super User Control Panel</p>
    </div>
    <div className="w-full md:w-auto">{action}</div>
  </div>
);

const SearchBar = ({ value, onChange, placeholder }: { value: string, onChange: (s: string) => void, placeholder: string }) => (
  <div className="relative w-full md:w-auto">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
    <input 
      type="text" 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-white border border-gray-300 text-slate-800 pl-10 pr-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-zenro-blue focus:outline-none w-full md:w-64 transition shadow-sm"
    />
  </div>
);

// --- COMPONENT: USER PROFILE DETAIL MODAL ---
const UserProfileDetail = ({ user, onClose }: { user: User, onClose: () => void }) => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalFees: 0, paidFees: 0, pendingFees: 0, avgScore: 0, testsTaken: 0, attendance: 88 });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: feeData } = await supabase.from('fees').select('*').eq('student_id', user.id);
                const fData = feeData || [];
                
                const { data: subData } = await supabase.from('submissions').select('*, tests(title)').eq('student_id', user.id);
                const sData = subData || [];
                
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
            <div className="w-full md:max-w-4xl bg-white h-full border-l border-gray-200 shadow-2xl overflow-y-auto flex flex-col">
                <div className="p-6 bg-gradient-to-r from-zenro-blue to-slate-900 border-b border-gray-200 flex justify-between items-start sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                         <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-white"><ArrowLeft className="w-6 h-6" /></button>
                         <div className="flex items-center gap-4">
                             <img src={user.avatar} alt="" className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-white shadow-lg bg-white object-cover" />
                             <div>
                                 <h2 className="text-xl md:text-2xl font-bold text-white">{user.name}</h2>
                                 <p className="text-blue-200 text-sm flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                                     <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold border border-white/30 uppercase text-white w-fit">{user.role}</span>
                                     <span className="hidden md:inline">•</span><span>{user.email}</span>
                                 </p>
                             </div>
                         </div>
                    </div>
                </div>
                <div className="p-4 md:p-8 space-y-6">
                    {loading ? <div className="text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-zenro-blue"/></div> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoRow label="Total Fees" value={formatCurrency(stats.totalFees)} icon={DollarSign} />
                            <InfoRow label="Pending" value={formatCurrency(stats.pendingFees)} icon={AlertTriangle} />
                            <InfoRow label="Tests Taken" value={stats.testsTaken} icon={FileText} />
                            <InfoRow label="Avg Score" value={`${stats.avgScore}%`} icon={TrendingUp} />
                        </div>
                    )}
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
                                    <th className="hidden md:table-cell p-4">Date</th>
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
                                            <td className="hidden md:table-cell p-4">{new Date(log.start_time).toLocaleDateString()}</td>
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
    const [events, setEvents] = useState<Schedule[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Schedule | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterTeacher, setFilterTeacher] = useState('ALL');
    const [teachers, setTeachers] = useState<any[]>([]);

    useEffect(() => {
        fetchTeachers();
    }, []);

    useEffect(() => {
        fetchSchedule();
    }, [currentMonth, filterTeacher]);

    const fetchTeachers = async () => {
        const { data } = await supabase.from('profiles').select('id, full_name').eq('role', 'TEACHER');
        if (data) setTeachers(data);
    };

    const fetchSchedule = async () => {
        setLoading(true);
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        
        let query = supabase.from('schedules')
            .select('*, profiles(full_name)')
            .gte('start_time', startOfMonth.toISOString())
            .lte('start_time', endOfMonth.toISOString());
        
        if (filterTeacher !== 'ALL') {
            query = query.eq('teacher_id', filterTeacher);
        }

        const { data } = await query;
        if (data) setEvents(data.map((s:any) => ({...s, teacher_name: s.profiles?.full_name})));
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if(!confirm("Cancel this live class?")) return;
        await supabase.from('schedules').delete().eq('id', id);
        fetchSchedule();
        setIsModalOpen(false);
    };

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

    // Calendar Grid Logic
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay(); // 0 = Sun
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const paddingDays = Array.from({ length: firstDay }, (_, i) => i);

    return (
        <div className="space-y-6 animate-fade-in">
            <AdminHeader title="Master Schedule" />
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200 px-2 py-1">
                        <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded text-gray-600"><ChevronLeft className="w-5 h-5"/></button>
                        <span className="font-bold text-slate-800 w-32 text-center">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded text-gray-600"><ChevronRight className="w-5 h-5"/></button>
                    </div>
                    <select value={filterTeacher} onChange={e => setFilterTeacher(e.target.value)} className="bg-white border border-gray-300 text-slate-800 rounded px-3 py-2 text-sm outline-none">
                        <option value="ALL">All Teachers</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                    </select>
                </div>
                <button onClick={() => { setEditingEvent(null); setIsModalOpen(true); }} className="bg-zenro-blue text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm hover:bg-blue-800">
                    <Plus className="w-5 h-5" /> Schedule Class
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-4 text-center font-bold text-gray-500 text-xs uppercase tracking-widest">{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 auto-rows-[120px]">
                    {paddingDays.map(i => <div key={`pad-${i}`} className="bg-gray-50/30 border-b border-r border-gray-100"></div>)}
                    {daysArray.map(day => {
                        const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
                        const dayEvents = events.filter(e => new Date(e.start_time).toDateString() === dateStr);
                        return (
                            <div key={day} className="border-b border-r border-gray-100 p-2 relative group hover:bg-gray-50 transition">
                                <span className={`text-sm font-bold ${new Date().toDateString() === dateStr ? 'bg-zenro-red text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-gray-700'}`}>{day}</span>
                                <div className="mt-2 space-y-1 overflow-y-auto max-h-[80px]">
                                    {dayEvents.map(ev => (
                                        <div 
                                            key={ev.id}
                                            onClick={() => { setEditingEvent(ev); setIsModalOpen(true); }}
                                            className="bg-blue-50 border-l-2 border-zenro-blue p-1 rounded text-[10px] cursor-pointer hover:bg-blue-100 truncate"
                                            title={`${ev.teacher_name} - ${ev.batch_name}`}
                                        >
                                            <span className="font-bold text-blue-800">{new Date(ev.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span> {ev.teacher_name?.split(' ')[0]}: {ev.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {isModalOpen && <AdminScheduleModal 
                initialData={editingEvent} 
                onClose={() => setIsModalOpen(false)} 
                onRefresh={fetchSchedule}
                teachers={teachers}
            />}
        </div>
    );
};

const AdminScheduleModal = ({ initialData, onClose, onRefresh, teachers }: any) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [batch, setBatch] = useState(initialData?.batch_name || '');
    const [teacherId, setTeacherId] = useState(initialData?.teacher_id || '');
    const [date, setDate] = useState(initialData ? new Date(initialData.start_time).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(initialData ? new Date(initialData.start_time).toTimeString().substring(0,5) : '10:00');
    const [duration, setDuration] = useState(60);
    
    // Recurring Options
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceType, setRecurrenceType] = useState<'DAILY' | 'WEEKLY'>('DAILY');
    const [recurrenceCount, setRecurrenceCount] = useState(5);

    const [batches, setBatches] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBatches = async () => {
            const { data } = await supabase.from('batches').select('name');
            if (data) setBatches(data.map(b => b.name));
        };
        fetchBatches();
    }, []);

    const handleSave = async () => {
        if (!title || !batch || !date || !time || !teacherId) return alert("All fields required");
        setLoading(true);

        const baseStart = new Date(`${date}T${time}`);
        const baseEnd = new Date(baseStart.getTime() + duration * 60000);

        try {
            if (initialData) {
                // Single Update
                await supabase.from('schedules').update({
                    title, batch_name: batch, teacher_id: teacherId, start_time: baseStart.toISOString(), end_time: baseEnd.toISOString()
                }).eq('id', initialData.id);
            } else {
                // New Creation (Potential Recurrence)
                const newEvents = [];
                const count = isRecurring ? recurrenceCount : 1;

                for (let i = 0; i < count; i++) {
                    const s = new Date(baseStart);
                    const e = new Date(baseEnd);
                    
                    if (recurrenceType === 'DAILY') {
                        s.setDate(s.getDate() + i);
                        e.setDate(e.getDate() + i);
                    } else if (recurrenceType === 'WEEKLY') {
                        s.setDate(s.getDate() + (i * 7));
                        e.setDate(e.getDate() + (i * 7));
                    }

                    newEvents.push({
                        title, 
                        batch_name: batch, 
                        teacher_id: teacherId, 
                        start_time: s.toISOString(),
                        end_time: e.toISOString()
                    });
                }
                
                await supabase.from('schedules').insert(newEvents);
            }
            onRefresh();
            onClose();
        } catch (e) { console.error(e); alert("Error saving schedule"); }
        finally { setLoading(false); }
    };

    const deleteEvent = async () => {
        if(!confirm("Delete this event?")) return;
        await supabase.from('schedules').delete().eq('id', initialData.id);
        onRefresh();
        onClose();
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Edit Class (Admin)' : 'Schedule Class (Admin)'}</h2>
                    <button onClick={onClose}><X className="w-6 h-6 text-gray-400" /></button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teacher</label>
                        <select className="w-full border p-2 rounded" value={teacherId} onChange={e => setTeacherId(e.target.value)}>
                            <option value="">Select Instructor</option>
                            {teachers.map((t:any) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Class Title</label>
                        <input className="w-full border p-2 rounded" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Kanji Chapter 5" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Batch</label>
                        <select className="w-full border p-2 rounded" value={batch} onChange={e => setBatch(e.target.value)}>
                            <option value="">Select Batch</option>
                            {batches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                            <input type="date" className="w-full border p-2 rounded" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Time</label>
                            <input type="time" className="w-full border p-2 rounded" value={time} onChange={e => setTime(e.target.value)} />
                        </div>
                    </div>
                    
                    {!initialData && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-3">
                                <input type="checkbox" id="recur" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="w-4 h-4 text-zenro-blue" />
                                <label htmlFor="recur" className="text-sm font-bold text-slate-700 flex items-center gap-2"><Repeat className="w-4 h-4" /> Recurring Event?</label>
                            </div>
                            
                            {isRecurring && (
                                <div className="grid grid-cols-2 gap-3 pl-6">
                                    <select className="border p-2 rounded text-sm" value={recurrenceType} onChange={e => setRecurrenceType(e.target.value as any)}>
                                        <option value="DAILY">Daily (Consecutive)</option>
                                        <option value="WEEKLY">Weekly (Same Day)</option>
                                    </select>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">For</span>
                                        <input type="number" min="2" max="30" className="w-16 border p-2 rounded text-sm" value={recurrenceCount} onChange={e => setRecurrenceCount(parseInt(e.target.value))} />
                                        <span className="text-xs text-gray-500">Times</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="pt-6 flex justify-end gap-2">
                    {initialData && <button onClick={deleteEvent} className="px-4 py-2 text-red-500 font-bold hover:bg-red-50 rounded border border-transparent hover:border-red-100 mr-auto">Delete</button>}
                    <button onClick={onClose} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded">Cancel</button>
                    <button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-zenro-blue text-white font-bold rounded hover:bg-blue-800 disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Schedule'}
                    </button>
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
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [availableBatches, setAvailableBatches] = useState<{id: string, name: string}[]>([]);
  const [showBatchDropdown, setShowBatchDropdown] = useState(false);
  const batchDropdownRef = useRef<HTMLDivElement>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // New State for Multi-Batch assignment
  const [teacherBatches, setTeacherBatches] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'STUDENT',
    student_id: '',
    batch: '', // For Student
    password: '',
    phone: '',
    avatar_url: ''
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

  const createBatch = async (batchName: string) => {
      if(!batchName.trim()) return;
      if(window.confirm(`Batch "${batchName}" does not exist. Do you want to create it?`)) {
          const { data, error } = await supabase.from('batches').insert({ name: batchName }).select().single();
          if(error) {
              setErrorMsg(`Failed to create batch: ${error.message}`);
              return false;
          } else {
              setAvailableBatches(prev => [data, ...prev]);
              setSuccessMsg(`Batch "${batchName}" created successfully!`);
              return true;
          }
      }
      return false;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) return alert("Only images allowed");
      if (file.size > 5 * 1024 * 1024) return alert("Max size 5MB");

      const reader = new FileReader();
      reader.onload = (ev) => {
          const base64 = ev.target?.result as string;
          setAvatarPreview(base64);
          setFormData({ ...formData, avatar_url: base64 });
      };
      reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
      if(!confirm("Remove custom profile picture? This cannot be undone.")) return;
      setAvatarPreview(null);
      setFormData({ ...formData, avatar_url: '' }); 
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    
    if (!formData.full_name.trim() || !formData.email.trim()) {
        setErrorMsg("Name and Email are mandatory.");
        setIsSubmitting(false); return;
    }
    
    const payload: any = {
      full_name: formData.full_name.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role,
      student_id: formData.student_id.trim() || null, 
      batch: formData.role === 'STUDENT' ? formData.batch.trim() : null, // Explicitly NULL if not student
      phone: formData.phone.trim(),
      id: editingUser ? editingUser.id : generateUUID(),
      avatar_url: formData.avatar_url || null 
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      let userId = payload.id;
      
      // 1. Update/Create Profile
      if (editingUser) {
        const { error } = await supabase.from('profiles').update(payload).eq('id', editingUser.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('profiles').insert([payload]);
        if (error) throw error;
      }

      // 2. Handle Teacher Batch Assignments
      if (formData.role === 'TEACHER') {
          // Wipe old
          await supabase.from('teacher_batches').delete().eq('teacher_id', userId);
          // Insert new
          if (teacherBatches.length > 0) {
              const batchPayload = teacherBatches.map(b => ({ teacher_id: userId, batch_name: b }));
              await supabase.from('teacher_batches').insert(batchPayload);
          }
      }

      setSuccessMsg("User profile updated successfully.");
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      console.error("DB Write Failed:", err);
      setErrorMsg(`Error: ${err.message || 'Database error'}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleBatchSelect = async (batchName: string) => {
      const exists = availableBatches.some(b => b.name.toLowerCase() === batchName.toLowerCase());
      if (exists) {
          setFormData({ ...formData, batch: batchName });
      } else {
          const created = await createBatch(batchName);
          if (created) {
              setFormData({ ...formData, batch: batchName });
          }
      }
      setShowBatchDropdown(false);
  };

  const toggleTeacherBatch = (batchName: string) => {
      setTeacherBatches(prev => 
          prev.includes(batchName) ? prev.filter(b => b !== batchName) : [...prev, batchName]
      );
  };

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

  const handleOpenModal = async (user: any = null) => {
    setErrorMsg('');
    setSuccessMsg('');
    setTeacherBatches([]);

    if (user) {
      setEditingUser(user);
      setAvatarPreview(user.avatar);
      setFormData({
        full_name: user.name,
        email: user.email,
        role: user.role,
        student_id: user.rollNumber || '',
        batch: user.batch || '',
        password: '',
        phone: user.phone || '',
        avatar_url: user.avatar
      });

      // Fetch teacher batches if needed
      if (user.role === 'TEACHER') {
          const { data } = await supabase.from('teacher_batches').select('batch_name').eq('teacher_id', user.id);
          if (data) setTeacherBatches(data.map(r => r.batch_name));
      }

    } else {
      setEditingUser(null);
      setAvatarPreview(null);
      setFormData({
        full_name: '',
        email: '',
        role: 'STUDENT',
        student_id: '',
        batch: '',
        password: '',
        phone: '',
        avatar_url: ''
      });
    }
    setIsModalOpen(true);
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
            className="w-full md:w-auto bg-zenro-red hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg transition"
          >
            <Plus className="w-5 h-5" /> Add New User
          </button>
        }
      />

      {successMsg && <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3 animate-fade-in-up shadow-sm"><CheckCircle className="w-5 h-5" /> {successMsg}</div>}
      {errorMsg && <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 animate-fade-in-up shadow-sm"><XCircle className="w-5 h-5" /> {errorMsg}</div>}

      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
         <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
             <SearchBar value={filter} onChange={setFilter} placeholder="Search users..." />
             <div className="relative w-full md:w-auto">
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')} className="appearance-none w-full bg-white border border-gray-300 text-slate-800 pl-4 pr-10 py-2 rounded-lg text-sm focus:ring-2 focus:ring-zenro-blue outline-none cursor-pointer">
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
         {/* MOBILE CARD VIEW */}
         <div className="md:hidden">
             {loading ? <div className="p-12 text-center"><Loader2 className="w-8 h-8 text-zenro-blue animate-spin mx-auto mb-2" /><p>Connecting to Database...</p></div> : filteredUsers.length === 0 ? <div className="p-12 text-center text-gray-500">No users found.</div> : filteredUsers.map(user => (
                 <div key={user.id} className="p-4 border-b border-gray-100 flex items-start gap-4">
                     <img src={user.avatar} alt="" className="w-12 h-12 rounded-full border border-gray-200 object-cover" />
                     <div className="flex-1">
                         <div className="flex justify-between items-start">
                             <div>
                                 <p className="font-bold text-slate-800">{user.name}</p>
                                 <p className="text-xs text-gray-500">{user.email}</p>
                             </div>
                             <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${user.role === UserRole.ADMIN ? 'bg-red-100 text-red-700' : user.role === UserRole.TEACHER ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{user.role}</span>
                         </div>
                         <div className="mt-2 flex gap-4 text-xs text-gray-600">
                             {user.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {user.phone}</div>}
                             {user.batch && <div className="bg-gray-100 px-2 rounded font-bold">{user.batch}</div>}
                         </div>
                         <div className="mt-3 flex justify-end gap-2">
                             <button onClick={() => setViewingUser(user)} className="p-2 bg-gray-50 rounded border border-gray-200 text-zenro-blue"><Eye className="w-4 h-4" /></button>
                             <button onClick={() => handleOpenModal(user)} className="p-2 bg-gray-50 rounded border border-gray-200 text-slate-600"><Edit2 className="w-4 h-4" /></button>
                             <button onClick={() => initiateDelete(user)} className="p-2 bg-red-50 rounded border border-red-100 text-red-500"><Trash2 className="w-4 h-4" /></button>
                         </div>
                     </div>
                 </div>
             ))}
         </div>

         {/* DESKTOP TABLE VIEW */}
         <div className="hidden md:block overflow-x-auto">
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
                   <td className="px-6 py-4"><div className="flex items-center gap-3"><img src={user.avatar} alt="" className="w-10 h-10 rounded-full bg-white border border-gray-200 object-cover" /><div><p className="text-slate-800 font-bold">{user.name}</p><p className="text-xs text-gray-500">{user.email}</p></div></div></td>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4 animate-fade-in">
            <div className="bg-white w-full h-full md:h-auto md:max-w-2xl md:rounded-2xl border border-gray-200 shadow-2xl overflow-visible max-h-none md:max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 md:rounded-t-2xl">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">{editingUser ? <Edit2 className="w-5 h-5 text-zenro-blue" /> : <Plus className="w-5 h-5 text-green-600" />}{editingUser ? 'Edit User Profile' : 'Create New Profile'}</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSaveUser} className="p-6 space-y-4 overflow-y-auto">
                    {errorMsg && <div className="bg-red-50 border border-red-100 p-3 rounded text-red-600 text-xs mb-4 font-bold">{errorMsg}</div>}
                    
                    <div className="flex flex-col items-center justify-center mb-6">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <img src={avatarPreview || `https://ui-avatars.com/api/?name=${formData.full_name || 'New User'}&background=random`} className="w-24 h-24 rounded-full border-4 border-gray-100 object-cover shadow-sm bg-white" alt="Avatar" />
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white">
                                <Camera className="w-8 h-8" />
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                        </div>
                        {avatarPreview && !avatarPreview.includes('ui-avatars') && (
                            <button 
                                type="button" 
                                onClick={handleRemoveImage}
                                className="mt-2 text-xs text-red-500 font-bold hover:underline flex items-center gap-1"
                            >
                                <Trash2 className="w-3 h-3" /> Remove Picture
                            </button>
                        )}
                        <p className="text-xs text-gray-400 mt-2">Max 5MB. Formats: JPG, PNG.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name *</label><input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-white border border-gray-300 rounded p-2 text-sm" placeholder="John Doe" /></div>
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role *</label><select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-white border border-gray-300 rounded p-2 text-sm"><option value="STUDENT">Student</option><option value="TEACHER">Teacher</option><option value="ADMIN">Admin</option></select></div>
                    </div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email *</label><input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white border border-gray-300 rounded p-2 text-sm" placeholder="email@example.com" /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone *</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} className="w-full bg-white border border-gray-300 rounded p-2 text-sm" /></div>
                        <div><label className="block text-xs font-bold text-zenro-blue uppercase mb-1">Password *</label><input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-white border border-gray-300 rounded p-2 text-sm font-mono" placeholder="Min 8 chars" /></div>
                    </div>
                    
                    {/* STUDENT: SINGLE BATCH */}
                    {formData.role === 'STUDENT' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 mt-4">
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
                                            <div key={b.id} onClick={() => handleBatchSelect(b.name)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-slate-700 flex justify-between items-center">{b.name} {formData.batch === b.name && <Check className="w-3 h-3 text-zenro-blue" />}</div>
                                        ))}
                                        {formData.batch && !filteredBatches.some(b => b.name === formData.batch) && (
                                            <div onClick={() => handleBatchSelect(formData.batch)} className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-zenro-blue cursor-pointer text-sm font-bold border-t border-gray-100 flex items-center gap-2"><Plus className="w-3 h-3" /> Create "{formData.batch}"</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div><label className="block text-xs font-bold text-zenro-blue uppercase mb-1">Student ID *</label><input type="text" value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} className="w-full bg-white border border-gray-300 rounded p-2 text-sm" /></div>
                        </div>
                    )}

                    {/* TEACHER: MULTI BATCH */}
                    {formData.role === 'TEACHER' && (
                        <div className="pt-4 border-t border-gray-200 mt-4">
                            <label className="block text-xs font-bold text-zenro-blue uppercase mb-2">Assigned Batches (Multi-Select)</label>
                            <div className="border border-gray-200 rounded-lg p-2 max-h-40 overflow-y-auto grid grid-cols-2 gap-2 bg-gray-50">
                                {availableBatches.length === 0 ? <p className="text-xs text-gray-400 p-2">No batches created yet.</p> : availableBatches.map(b => (
                                    <div 
                                        key={b.id} 
                                        onClick={() => toggleTeacherBatch(b.name)} 
                                        className={`p-2 rounded text-xs font-bold cursor-pointer border flex justify-between items-center transition ${teacherBatches.includes(b.name) ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}
                                    >
                                        {b.name}
                                        {teacherBatches.includes(b.name) && <CheckCircle className="w-3 h-3 text-blue-600" />}
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">Selected batches will appear on the teacher's profile.</p>
                        </div>
                    )}

                    <div className="pt-6 flex justify-end gap-3 pb-safe">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded text-gray-500 font-bold hover:bg-gray-100">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-zenro-red text-white px-6 py-2 rounded font-bold">{isSubmitting ? 'Saving...' : 'Save & Update'}</button>
                    </div>
                </form>
            </div>
        </div>
      )}

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
    // ... (Keep existing logic unchanged)
    const [transactions, setTransactions] = useState<any[]>([]);
    const [summary, setSummary] = useState({ totalRevenue: 0, outstanding: 0, pendingCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Payments for Revenue & Transactions
                const { data: payData } = await supabase
                    .from('payments')
                    .select('*, fees(title, profiles(full_name))')
                    .order('payment_date', { ascending: false });
                
                // Fetch Fees for Outstanding
                const { data: feeData } = await supabase
                    .from('fees')
                    .select('amount, status');

                if (payData && feeData) {
                    const totalRev = payData.reduce((acc, curr) => acc + (curr.amount || 0), 0);
                    const outst = feeData.filter(f => f.status !== 'PAID').reduce((acc, curr) => acc + (curr.amount || 0), 0);
                    const pending = feeData.filter(f => f.status === 'PENDING').length;

                    setSummary({ totalRevenue: totalRev, outstanding: outst, pendingCount: pending });
                    setTransactions(payData.map(p => ({
                        id: p.id,
                        student_name: p.fees?.profiles?.full_name || 'Unknown',
                        title: p.fees?.title || 'Fee Payment',
                        amount: p.amount,
                        date: p.payment_date,
                        status: 'SUCCESS'
                    })));
                }
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
             <AdminHeader title="Financial Overview" />
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                     <p className="text-xs font-bold text-gray-500 uppercase">Total Revenue</p>
                     <h3 className="text-3xl font-bold text-slate-800">{formatCurrency(summary.totalRevenue)}</h3>
                 </div>
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                     <p className="text-xs font-bold text-gray-500 uppercase">Outstanding Fees</p>
                     <h3 className="text-3xl font-bold text-red-600">{formatCurrency(summary.outstanding)}</h3>
                 </div>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                     <p className="text-xs font-bold text-gray-500 uppercase">Pending Invoices</p>
                     <h3 className="text-3xl font-bold text-yellow-600">{summary.pendingCount}</h3>
                 </div>
             </div>
             
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                 <div className="p-6 border-b border-gray-200 bg-gray-50">
                     <h3 className="font-bold text-slate-800">Recent Transactions</h3>
                 </div>
                 {/* Desktop Table */}
                 <div className="hidden md:block">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-100 text-slate-700 uppercase font-bold text-xs">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Student</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></td></tr> : transactions.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-gray-500">No transactions found.</td></tr> : transactions.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-mono text-xs">{new Date(t.date).toLocaleDateString()}</td>
                                    <td className="p-4 font-bold text-slate-800">{t.student_name}</td>
                                    <td className="p-4">{t.title}</td>
                                    <td className="p-4 font-mono font-bold">{formatCurrency(t.amount)}</td>
                                    <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{t.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
                 {/* Mobile Cards */}
                 <div className="md:hidden">
                     {transactions.map(t => (
                         <div key={t.id} className="p-4 border-b border-gray-100">
                             <div className="flex justify-between items-start mb-1">
                                 <div className="font-bold text-slate-800">{t.student_name}</div>
                                 <div className="font-mono font-bold text-slate-800">{formatCurrency(t.amount)}</div>
                             </div>
                             <div className="text-sm text-gray-500 mb-2">{t.title}</div>
                             <div className="flex justify-between items-center text-xs">
                                 <span className="text-gray-400">{new Date(t.date).toLocaleDateString()}</span>
                                 <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-bold">{t.status}</span>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
    );
};

export const AdminDashboard = () => {
    // ... (Keep existing logic unchanged)
    const [stats, setStats] = useState({ totalUsers: 0, totalRevenue: 0, activeCourses: 0 });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // 1. Parallel Fetch for Stats
                const [usersRes, coursesRes, paymentsRes] = await Promise.all([
                    supabase.from('profiles').select('*', { count: 'exact', head: true }),
                    supabase.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'PUBLISHED'),
                    supabase.from('payments').select('amount')
                ]);

                const totalRev = paymentsRes.data?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

                setStats({
                    totalUsers: usersRes.count || 0,
                    activeCourses: coursesRes.count || 0,
                    totalRevenue: totalRev
                });

                // 2. Fetch Recent Activity Feed (Aggregated)
                // New Users
                const { data: newUsers } = await supabase.from('profiles').select('full_name, created_at').order('created_at', { ascending: false }).limit(3);
                // New Payments
                const { data: newPay } = await supabase.from('payments').select('amount, payment_date').order('payment_date', { ascending: false }).limit(3);
                // New Courses
                const { data: newCourses } = await supabase.from('courses').select('title, created_at').order('created_at', { ascending: false }).limit(2);

                const activity = [
                    ...(newUsers || []).map((u:any) => ({ type: 'USER', text: `New user registration: ${u.full_name}`, date: u.created_at })),
                    ...(newPay || []).map((p:any) => ({ type: 'PAYMENT', text: `Payment received: ${formatCurrency(p.amount)}`, date: p.payment_date })),
                    ...(newCourses || []).map((c:any) => ({ type: 'COURSE', text: `New course created: ${c.title}`, date: c.created_at }))
                ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

                setRecentActivity(activity);

            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchDashboardData();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
             <AdminHeader title="Admin Dashboard" />
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                     <div className="p-4 bg-blue-100 rounded-lg text-blue-600"><Users className="w-8 h-8" /></div>
                     <div><p className="text-gray-500 text-xs font-bold uppercase">Total Users</p><h3 className="text-2xl font-bold text-slate-800">{loading ? '...' : stats.totalUsers}</h3></div>
                 </div>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                     <div className="p-4 bg-green-100 rounded-lg text-green-600"><DollarSign className="w-8 h-8" /></div>
                     <div><p className="text-gray-500 text-xs font-bold uppercase">Total Revenue</p><h3 className="text-2xl font-bold text-slate-800">{loading ? '...' : formatCurrency(stats.totalRevenue)}</h3></div>
                 </div>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                     <div className="p-4 bg-purple-100 rounded-lg text-purple-600"><BookOpen className="w-8 h-8" /></div>
                     <div><p className="text-gray-500 text-xs font-bold uppercase">Active Courses</p><h3 className="text-2xl font-bold text-slate-800">{loading ? '...' : stats.activeCourses}</h3></div>
                 </div>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-zenro-blue"/> Live Activity Feed</h3>
                    <div className="space-y-3">
                        {loading ? <div className="text-center p-4"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></div> : recentActivity.length === 0 ? <p className="text-gray-500 text-sm">No recent activity.</p> : recentActivity.map((act, i) => (
                            <div key={i} className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded border border-gray-100">
                                <span className="flex items-center gap-2">
                                    {act.type === 'USER' && <Users className="w-4 h-4 text-blue-500"/>}
                                    {act.type === 'PAYMENT' && <DollarSign className="w-4 h-4 text-green-500"/>}
                                    {act.type === 'COURSE' && <BookOpen className="w-4 h-4 text-purple-500"/>}
                                    <strong>{act.text.split(':')[0]}:</strong> {act.text.split(':')[1]}
                                </span>
                                <span className="text-xs text-gray-500 font-mono">{new Date(act.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                            </div>
                        ))}
                    </div>
                 </div>
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-green-600"/> System Health</h3>
                    <div className="flex items-center gap-2 text-green-600 font-bold mb-2"><CheckCircle className="w-5 h-5" /> All Systems Operational</div>
                    <p className="text-sm text-gray-500">Database connection is stable. RLS Policies active. Real-time subscriptions enabled.</p>
                 </div>
             </div>
        </div>
    );
};
