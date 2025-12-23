
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Users, BookOpen, Clock, Plus, Video, 
  MessageSquare, BarChart2, Calendar, FileText, 
  CheckCircle, AlertTriangle, MoreVertical, X,
  Mic, MicOff, Camera, CameraOff, Monitor, Languages,
  ChevronRight, Filter, Search, Download, Trash2, Upload,
  Layers, ChevronDown, Save, Eye, Paperclip, Film, PlayCircle,
  Briefcase, GraduationCap, Loader2, Edit3, Globe, Lock, AlertCircle, Check, WifiOff,
  FileCheck, HelpCircle, CheckSquare, Target, ChevronLeft, Radio,
  Layout, GripVertical, File, ListTodo, Send, Flag, User as UserIcon, Shield, Edit2, Repeat, RefreshCw
} from 'lucide-react';
import { Course, Assignment, StudentPerformance, CourseModule, CourseMaterial, User, Test, Question, Schedule, LiveSessionRecord, AssignmentSubmission } from '../types';
import { generateClassSummary } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLiveSession } from '../context/LiveContext';
import { supabase } from '../services/supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';

// --- ROBUST SCHEDULING ENGINE ---

const generateSeriesDates = (
    startDate: Date, 
    endDate: Date, 
    config: { type: 'DAILY' | 'WEEKLY', days?: number[] }
): Date[] => {
    const dates: Date[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    let safety = 0;
    
    while (current <= end && safety < 365) {
        const day = current.getDay();
        if (config.type === 'DAILY' || (config.type === 'WEEKLY' && config.days?.includes(day))) {
            dates.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
        safety++;
    }
    return dates;
};

// --- DASHBOARD HOME ---

export const TeacherDashboardHome = () => {
  const [upcoming, setUpcoming] = useState<Schedule[]>([]);
  const userData = localStorage.getItem('zenro_session');
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
      const fetchSchedule = async () => {
          if (!user) return;
          const { data } = await supabase.from('schedules')
            .select('*')
            .eq('teacher_id', user.id)
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(3);
          if (data) setUpcoming(data);
      };
      fetchSchedule();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-4xl font-heading font-black text-zenro-blue tracking-tighter mb-2">Sensei Portal</h1>
          <p className="text-gray-400 font-medium">Empowering your teaching with AI-driven insights.</p>
        </div>
        <div className="hidden md:flex flex-col items-end">
            <div className="bg-zenro-red text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-2">Authenticated</div>
            <div className="text-slate-400 text-xs font-mono">{new Date().toLocaleDateString('ja-JP')}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 flex items-center gap-6 hover:shadow-xl transition-all duration-500 group">
            <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500"><Users className="w-8 h-8" /></div>
            <div><p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Students</p><h3 className="text-3xl font-black text-zenro-slate">142</h3></div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 flex items-center gap-6 hover:shadow-xl transition-all duration-500 group">
            <div className="p-4 rounded-2xl bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors duration-500"><BookOpen className="w-8 h-8" /></div>
            <div><p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Courses</p><h3 className="text-3xl font-black text-zenro-slate">4</h3></div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 flex items-center gap-6 hover:shadow-xl transition-all duration-500 group">
            <div className="p-4 rounded-2xl bg-yellow-50 text-yellow-600 group-hover:bg-yellow-600 group-hover:text-white transition-colors duration-500"><BarChart2 className="w-8 h-8" /></div>
            <div><p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Pass Rate</p><h3 className="text-3xl font-black text-zenro-slate">94%</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-xl font-black text-zenro-blue mb-8 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-zenro-red" /> Upcoming Classes
            </h3>
            <div className="space-y-4">
                {upcoming.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-gray-50 rounded-2xl">
                        <Clock className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                        <p className="text-gray-300 font-bold">No classes scheduled.</p>
                    </div>
                ) : upcoming.map(s => (
                    <div key={s.id} className="flex items-center gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-zenro-blue/30 transition-all cursor-default">
                        <div className="text-center w-20 flex-shrink-0">
                            <p className="text-zenro-red font-black text-lg leading-none">{new Date(s.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-tighter">{new Date(s.start_time).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-slate-800 font-bold truncate">{s.title}</h4>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Batch: <span className="text-zenro-blue">{s.batch_name}</span></p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
             <h3 className="text-xl font-black text-zenro-blue mb-8 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-500" /> Proctoring Alerts
            </h3>
            <div className="space-y-3">
                 <div className="flex items-center justify-between p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                     <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700 font-black text-sm">JD</div>
                         <div>
                             <p className="text-slate-800 text-sm font-bold">John Doe</p>
                             <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Tab Switched • 3 Times</p>
                         </div>
                     </div>
                     <button className="text-[10px] font-black uppercase tracking-widest bg-white text-orange-700 px-4 py-2 rounded-lg border border-orange-200 hover:bg-orange-500 hover:text-white transition-all">Review</button>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- SCHEDULE PAGE ---

export const TeacherSchedulePage = () => {
    const [events, setEvents] = useState<Schedule[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Schedule | null>(null);
    const [loading, setLoading] = useState(true);

    const userData = localStorage.getItem('zenro_session');
    const user = userData ? JSON.parse(userData) : null;

    useEffect(() => {
        fetchSchedule();
    }, [currentMonth]);

    const fetchSchedule = async () => {
        if (!user) return;
        setLoading(true);
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        
        const { data } = await supabase.from('schedules')
            .select('*')
            .eq('teacher_id', user.id)
            .gte('start_time', startOfMonth.toISOString())
            .lte('start_time', endOfMonth.toISOString());
        
        if (data) setEvents(data);
        setLoading(false);
    };

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const paddingDays = Array.from({ length: firstDay }, (_, i) => i);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-heading font-black text-zenro-blue tracking-tighter">Live Calendar</h1>
                    <p className="text-gray-400 font-medium">Manage recurring lecture schedules.</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-100">
                        <button onClick={prevMonth} className="p-2 hover:bg-white rounded-xl text-gray-500 shadow-sm transition-all"><ChevronLeft className="w-5 h-5"/></button>
                        <span className="font-black text-slate-800 w-36 text-center text-sm uppercase tracking-widest">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={nextMonth} className="p-2 hover:bg-white rounded-xl text-gray-500 shadow-sm transition-all"><ChevronRight className="w-5 h-5"/></button>
                    </div>
                    <button onClick={() => { setEditingEvent(null); setIsModalOpen(true); }} className="bg-zenro-blue text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-blue-900/20 hover:bg-slate-900 active:scale-95 transition-all">
                        <Plus className="w-5 h-5" /> Schedule Class
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden">
                <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-6 text-center font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">{day}</div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 auto-rows-[160px] bg-white">
                    {paddingDays.map(i => <div key={`pad-${i}`} className="bg-gray-50/20 border-b border-r border-gray-50/50"></div>)}
                    
                    {daysArray.map(day => {
                        const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
                        const dayEvents = events.filter(e => new Date(e.start_time).toDateString() === dateStr);
                        const isToday = new Date().toDateString() === dateStr;

                        return (
                            <div key={day} className={`border-b border-r border-gray-50/50 p-4 relative group hover:bg-blue-50/10 transition-all duration-300`}>
                                <span className={`text-sm font-black inline-flex items-center justify-center w-8 h-8 rounded-xl ${isToday ? 'bg-zenro-red text-white shadow-lg shadow-red-500/20' : 'text-slate-300 group-hover:text-slate-800 transition-colors duration-500'}`}>{day}</span>
                                <div className="mt-4 space-y-2 overflow-y-auto max-h-[100px] custom-scrollbar pr-1">
                                    {dayEvents.map(ev => (
                                        <div 
                                            key={ev.id}
                                            onClick={() => { setEditingEvent(ev); setIsModalOpen(true); }}
                                            className="bg-blue-50/80 backdrop-blur-sm border-l-4 border-zenro-blue p-2 rounded-xl text-[10px] cursor-pointer hover:bg-blue-100 hover:shadow-md active:scale-95 transition-all truncate"
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-black text-zenro-blue">{new Date(ev.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false})}</span>
                                                {ev.series_id && <Repeat className="w-2.5 h-2.5 text-blue-400" />}
                                            </div>
                                            <div className="font-bold text-slate-600 truncate">{ev.title}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {isModalOpen && <ScheduleModal initialData={editingEvent} onClose={() => setIsModalOpen(false)} onRefresh={fetchSchedule} role={user?.role} userId={user?.id} />}
        </div>
    );
};

const ScheduleModal = ({ initialData, onClose, onRefresh, role, userId }: any) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [batch, setBatch] = useState(initialData?.batch_name || '');
    const [date, setDate] = useState(initialData ? new Date(initialData.start_time).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(initialData ? new Date(initialData.start_time).toTimeString().substring(0,5) : '10:00');
    const [duration, setDuration] = useState(60);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState<'SINGLE' | 'SERIES'>('SINGLE');

    const [isRecurring, setIsRecurring] = useState(!!initialData?.series_id);
    const [recurrenceType, setRecurrenceType] = useState<'DAILY' | 'WEEKLY'>('WEEKLY');
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]);
    const [endDate, setEndDate] = useState<string>(new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]);

    const [batches, setBatches] = useState<string[]>([]);

    useEffect(() => {
        const fetchBatches = async () => {
            const table = role === 'ADMIN' ? 'batches' : 'teacher_batches';
            const query = supabase.from(table).select(role === 'ADMIN' ? 'name' : 'batch_name');
            if (role !== 'ADMIN') query.eq('teacher_id', userId);
            const { data } = await query;
            if (data) setBatches(data.map((b: any) => role === 'ADMIN' ? b.name : b.batch_name));
        };
        fetchBatches();
    }, []);

    const handleSave = async () => {
        if (!title || !batch || !date || !time) return alert("Required fields missing.");
        setLoading(true);

        const baseStart = new Date(`${date}T${time}`);
        const baseEnd = new Date(baseStart.getTime() + duration * 60000);
        const seriesId = initialData?.series_id || crypto.randomUUID();

        try {
            if (initialData) {
                if (editMode === 'SERIES' && initialData.series_id) {
                    await supabase.from('schedules').delete().eq('series_id', initialData.series_id).gte('start_time', baseStart.toISOString());
                    await createSeries(seriesId, baseStart);
                } else {
                    await supabase.from('schedules').update({ title, batch_name: batch, start_time: baseStart.toISOString(), end_time: baseEnd.toISOString() }).eq('id', initialData.id);
                }
            } else {
                if (isRecurring) await createSeries(seriesId, baseStart);
                else await supabase.from('schedules').insert({ title, batch_name: batch, teacher_id: userId, start_time: baseStart.toISOString(), end_time: baseEnd.toISOString() });
            }
            onRefresh(); onClose();
        } catch (e) { alert("Error saving schedule."); }
        finally { setLoading(false); }
    };

    const createSeries = async (sId: string, start: Date) => {
        const dates = generateSeriesDates(start, new Date(endDate), { type: recurrenceType, days: selectedDays });
        const rows = dates.map(d => {
            const s = new Date(d); s.setHours(start.getHours(), start.getMinutes());
            return { title, batch_name: batch, teacher_id: userId, start_time: s.toISOString(), end_time: new Date(s.getTime() + duration * 60000).toISOString(), series_id: sId, recurrence_rule: { type: recurrenceType, days: selectedDays, end: endDate } };
        });
        if(rows.length > 0) await supabase.from('schedules').insert(rows);
    };

    const toggleDay = (d: number) => setSelectedDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-10 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar border border-white/20">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-heading font-black text-zenro-blue tracking-tighter">{initialData ? 'Update Lecture' : 'New Schedule'}</h2>
                    <button onClick={onClose} className="p-3 bg-gray-50 hover:bg-zenro-red hover:text-white text-gray-400 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
                </div>
                
                <div className="space-y-8">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Topic / Subject</label>
                        <input className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-slate-800 font-bold focus:bg-white focus:border-zenro-blue transition-all outline-none shadow-inner" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Kanji Revision N5" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Batch</label>
                        <select className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-slate-800 font-bold focus:bg-white outline-none transition-all shadow-inner appearance-none cursor-pointer" value={batch} onChange={e => setBatch(e.target.value)}>
                            <option value="">Select Batch</option>
                            {batches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Start Date</label>
                            <input type="date" className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-slate-800 font-bold focus:bg-white outline-none shadow-inner" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Start Time</label>
                            <input type="time" className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-slate-800 font-bold focus:bg-white outline-none shadow-inner" value={time} onChange={e => setTime(e.target.value)} />
                        </div>
                    </div>

                    <div className="bg-blue-50/30 p-8 rounded-[30px] border border-blue-50 space-y-6">
                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="recur" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="w-5 h-5 accent-zenro-blue cursor-pointer" />
                            <label htmlFor="recur" className="text-sm font-black text-zenro-blue uppercase tracking-widest cursor-pointer">Repeat this class</label>
                        </div>
                        
                        {isRecurring && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex gap-2">
                                    {['DAILY', 'WEEKLY'].map(type => (
                                        <button key={type} onClick={() => setRecurrenceType(type as any)} className={`flex-1 py-3 text-[10px] font-black rounded-xl border-2 transition-all tracking-widest ${recurrenceType === type ? 'bg-zenro-blue text-white border-zenro-blue shadow-lg shadow-blue-900/20' : 'bg-white text-slate-400 border-gray-100 hover:border-blue-200'}`}>{type}</button>
                                    ))}
                                </div>
                                {recurrenceType === 'WEEKLY' && (
                                    <div className="flex justify-between items-center p-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                        {['S','M','T','W','T','F','S'].map((d, i) => (
                                            <button key={i} onClick={() => toggleDay(i)} className={`w-10 h-10 rounded-xl text-xs font-black flex items-center justify-center transition-all ${selectedDays.includes(i) ? 'bg-zenro-red text-white shadow-lg' : 'text-slate-300 hover:bg-gray-50'}`}>{d}</button>
                                        ))}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Series End Date</label>
                                    <input type="date" className="w-full bg-white border border-gray-100 p-4 rounded-2xl text-slate-800 font-bold focus:border-zenro-blue outline-none shadow-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 flex justify-end gap-4 border-t border-gray-100 pt-8">
                    <button onClick={onClose} className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Cancel</button>
                    <button onClick={handleSave} disabled={loading} className="px-10 py-4 bg-zenro-red text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-red-900/20 hover:scale-105 active:scale-95 transition-all">
                        {loading ? 'Processing...' : 'Sync Schedule'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- RESTORING MISSING FEATURES ---

export const TeacherAssignmentsPage = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('assignments').select('*').order('created_at', { ascending: false });
            if (data) setAssignments(data);
            setLoading(false);
        };
        fetch();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-heading font-black text-zenro-blue tracking-tighter">Assignments</h1>
                    <p className="text-gray-400 font-medium">Manage student tasks and submissions.</p>
                </div>
                <button className="bg-zenro-red text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-red-900/20">
                    <Plus className="w-5 h-5" /> New Task
                </button>
            </div>

            {loading ? <div className="text-center p-20"><Loader2 className="w-12 h-12 animate-spin mx-auto text-zenro-red opacity-20"/></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {assignments.map(a => (
                        <div key={a.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{a.title}</h3>
                            <p className="text-sm text-gray-400 font-medium mb-8 line-clamp-2">{a.description}</p>
                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Due {new Date(a.due_date).toLocaleDateString()}</span>
                                <button className="text-zenro-blue font-black text-[10px] uppercase tracking-widest hover:text-zenro-red transition">Review</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const TeacherTestsPage = () => (
    <div className="p-20 text-center animate-fade-in">
        <FileCheck className="w-20 h-20 text-gray-100 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter mb-2">Test Engine v2.0</h2>
        <p className="text-gray-400 font-medium max-w-md mx-auto">Create robust anti-cheat assessments with AI-powered proctoring and automated grading.</p>
        <button className="mt-10 bg-zenro-blue text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-900/20 active:scale-95 transition-all">Launch Creator</button>
    </div>
);

export const TeacherReportsPage = () => <div className="p-10">Reports and Analytics in Progress...</div>;
export const TeacherCoursesPage = () => <div className="p-10">Curriculum Management in Progress...</div>;
export const CourseContentManager = () => <div className="p-10">Course Content Editor in Progress...</div>;
export const TeacherProfilePage = ({user}: any) => <div className="p-10">Profile Settings for {user.name}</div>;
export const LiveClassConsole = () => (
    <div className="h-[80vh] flex flex-col items-center justify-center bg-slate-900 rounded-[50px] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-zenro-blue/40 to-transparent opacity-50"></div>
        <div className="relative z-10 text-center text-white">
            <div className="w-32 h-32 bg-zenro-red/10 rounded-full flex items-center justify-center mx-auto mb-10 ring-8 ring-zenro-red/5">
                <Video className="w-12 h-12 text-zenro-red animate-pulse" />
            </div>
            <h2 className="text-4xl font-heading font-black tracking-tighter mb-4">Start Real-time Stream</h2>
            <p className="text-blue-200/50 font-medium max-w-sm mx-auto mb-12 uppercase text-[10px] tracking-[0.4em]">Ultra Low Latency Academic Broadcast</p>
            <button className="bg-white text-zenro-blue px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all">Go Live Now</button>
        </div>
    </div>
);
