
import React, { useState, useEffect } from 'react';
// Fixed: Added 'BarChart2' to imports
import { Users, BookOpen, Clock, Plus, Video, Calendar, FileText, CheckCircle, AlertTriangle, Loader2, FileCheck, Layers, Trash2, ChevronLeft, ChevronRight, BarChart2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export const TeacherDashboardHome = () => {
    const [stats, setStats] = useState({ students: 0, courses: 0, schedules: 0 });
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState<any[]>([]);
    const userData = localStorage.getItem('zenro_session');
    const user = userData ? JSON.parse(userData) : null;

    useEffect(() => {
        const fetchRealStats = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // 1. Get Teacher's assigned batches
                const { data: batches } = await supabase.from('teacher_batches').select('batch_name').eq('teacher_id', user.id);
                const batchNames = (batches || []).map(b => b.batch_name);

                // 2. Count ACTUAL students in those batches
                const { count: studentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'STUDENT').in('batch', batchNames);
                const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true }).eq('instructor_name', user.name);
                const { data: scheduleData, count: scheduleCount } = await supabase.from('schedules').select('*', { count: 'exact' }).eq('teacher_id', user.id).gte('start_time', new Date().toISOString()).order('start_time', { ascending: true }).limit(3);

                setStats({ students: studentCount || 0, courses: courseCount || 0, schedules: scheduleCount || 0 });
                setClasses(scheduleData || []);
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchRealStats();
    }, [user.id, user.name]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-4xl font-heading font-black text-zenro-blue tracking-tighter mb-2">Sensei Dashboard</h1>
                    <p className="text-gray-400 font-medium italic">Accurate aggregation from your assigned batches.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<Users className="w-8 h-8" />} label="Actual Students" value={loading ? '...' : stats.students} color="blue" />
                <StatCard icon={<BookOpen className="w-8 h-8" />} label="Live Courses" value={loading ? '...' : stats.courses} color="red" />
                <StatCard icon={<Calendar className="w-8 h-8" />} label="Upcoming Classes" value={loading ? '...' : stats.schedules} color="yellow" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                    <h3 className="text-xl font-black text-zenro-blue mb-8 flex items-center gap-3"><Calendar className="w-6 h-6 text-zenro-red" /> Live Queue</h3>
                    <div className="space-y-4">
                        {classes.length === 0 ? <p className="text-gray-300 font-bold py-10 text-center italic">No upcoming classes.</p> : classes.map(s => (
                            <div key={s.id} className="flex items-center gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-zenro-blue transition-all">
                                <div className="text-center w-16"><p className="text-zenro-red font-black text-lg">{new Date(s.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p></div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-slate-800 font-bold truncate">{s.title}</h4>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Target: <span className="text-zenro-blue">{s.batch_name}</span></p>
                                </div>
                                <Video className="w-5 h-5 text-gray-200" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                    <h3 className="text-xl font-black text-zenro-blue mb-8 flex items-center gap-3"><FileCheck className="w-6 h-6 text-green-500" /> Exam Proctoring</h3>
                    <div className="p-10 text-center border-2 border-dashed border-gray-50 rounded-3xl"><AlertTriangle className="w-10 h-10 text-gray-100 mx-auto mb-4" /><p className="text-gray-300 font-bold text-xs uppercase tracking-widest">No active exams in progress.</p></div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }: any) => {
    const colors: any = { blue: "bg-blue-50 text-blue-600", red: "bg-red-50 text-red-600", yellow: "bg-yellow-50 text-yellow-600" };
    return (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 flex items-center gap-6 shadow-sm hover:shadow-xl transition-all group">
            <div className={`p-4 rounded-2xl transition-colors ${colors[color]}`}>{icon}</div>
            <div><p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p><h3 className="text-3xl font-black text-zenro-slate">{value}</h3></div>
        </div>
    );
};

export const TeacherSchedulePage = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const userData = localStorage.getItem('zenro_session');
    const user = userData ? JSON.parse(userData) : null;

    const fetchSchedule = async () => {
        if (!user) return;
        setLoading(true);
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        const { data } = await supabase.from('schedules').select('*').eq('teacher_id', user.id).gte('start_time', startOfMonth.toISOString()).lte('start_time', endOfMonth.toISOString());
        if (data) setEvents(data);
        setLoading(false);
    };

    useEffect(() => { fetchSchedule(); }, [currentMonth, user?.id]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h1 className="text-3xl font-heading font-black text-zenro-blue tracking-tighter">Class Calendar</h1>
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100"><ChevronLeft/></button>
                    <span className="font-black text-xs uppercase tracking-widest w-40 text-center">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100"><ChevronRight/></button>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-zenro-red text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">New Session</button>
            </div>
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden grid grid-cols-7">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="p-6 text-center font-black text-slate-400 text-[10px] uppercase tracking-widest border-b border-gray-100">{day}</div>)}
                {Array.from({ length: 35 }).map((_, i) => {
                    const day = i - new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() + 1;
                    const isValid = day > 0 && day <= new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
                    const dateStr = isValid ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString() : '';
                    const dayEvents = events.filter(e => new Date(e.start_time).toDateString() === dateStr);
                    return (
                        <div key={i} className={`min-h-[140px] p-4 border-r border-b border-gray-50 ${isValid ? 'hover:bg-blue-50/20' : 'bg-gray-50/10'}`}>
                            {isValid && <span className="font-black text-slate-300 text-sm">{day}</span>}
                            <div className="mt-2 space-y-1">
                                {dayEvents.map(ev => <div key={ev.id} className="bg-zenro-blue text-white p-2 rounded-lg text-[10px] truncate font-bold shadow-sm">{ev.title}</div>)}
                            </div>
                        </div>
                    );
                })}
            </div>
            {isModalOpen && <ScheduleModal onClose={() => setIsModalOpen(false)} onRefresh={fetchSchedule} teacherId={user.id} />}
        </div>
    );
};

const ScheduleModal = ({ onClose, onRefresh, teacherId }: any) => {
    const [title, setTitle] = useState('');
    const [batch, setBatch] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('10:00');
    const [batches, setBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getBatches = async () => {
            const { data } = await supabase.from('teacher_batches').select('batch_name').eq('teacher_id', teacherId);
            if (data) setBatches(data);
        };
        getBatches();
    }, [teacherId]);

    const handleSave = async () => {
        if (!title || !batch) return alert("All fields are required.");
        setLoading(true);
        const start = new Date(`${date}T${time}`);
        const end = new Date(start.getTime() + 60 * 60000);
        await supabase.from('schedules').insert({ title, batch_name: batch, teacher_id: teacherId, start_time: start.toISOString(), end_time: end.toISOString() });
        onRefresh(); onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[40px] p-10 space-y-8 shadow-2xl">
                <h2 className="text-3xl font-black text-zenro-blue tracking-tighter">Sync Live Session</h2>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Lesson Topic</label><input className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Kanji Revision N5" /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Assigned Batch</label>
                    <select className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold" value={batch} onChange={e => setBatch(e.target.value)}>
                        <option value="">Select Batch</option>
                        {batches.map(b => <option key={b.batch_name} value={b.batch_name}>{b.batch_name}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input type="date" className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl" value={date} onChange={e => setDate(e.target.value)} />
                    <input type="time" className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl" value={time} onChange={e => setTime(e.target.value)} />
                </div>
                <div className="flex justify-end gap-4"><button onClick={onClose} className="px-6 font-bold text-gray-400">Cancel</button><button onClick={handleSave} disabled={loading} className="bg-zenro-red text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">Publish</button></div>
            </div>
        </div>
    );
};

export const TeacherAssignmentsPage = () => {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('assignments').select('*, assignment_batches(batch_name)').order('created_at', { ascending: false });
            if (data) setAssignments(data);
            setLoading(false);
        };
        fetch();
    }, []);
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"><h1 className="text-3xl font-heading font-black text-zenro-blue tracking-tighter">Workload Manager</h1><button className="bg-zenro-red text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest"><Plus className="w-4 h-4 mr-2" /> New Task</button></div>
            {loading ? <div className="text-center p-20"><Loader2 className="animate-spin mx-auto text-zenro-red opacity-20"/></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {assignments.map(a => (
                        <div key={a.id} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group">
                            <FileText className="w-12 h-12 text-blue-100 mb-6 group-hover:text-blue-600 transition-colors" />
                            <h3 className="text-xl font-bold mb-2 text-slate-800">{a.title}</h3>
                            <p className="text-xs text-gray-400 font-black uppercase mb-4">Batches: {a.assignment_batches?.map((b:any) => b.batch_name).join(', ') || 'Global'}</p>
                            <button className="w-full bg-gray-50 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zenro-blue hover:text-white transition-all">Review Submissions</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const TeacherTestsPage = () => {
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('tests').select('*, test_batches(batch_name)').order('created_at', { ascending: false });
            if (data) setTests(data);
            setLoading(false);
        };
        fetch();
    }, []);
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"><h1 className="text-3xl font-heading font-black text-zenro-blue tracking-tighter">Exam Engine</h1><button className="bg-zenro-red text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest"><Plus className="w-4 h-4 mr-2" /> New Exam</button></div>
            {loading ? <div className="text-center p-20"><Loader2 className="animate-spin mx-auto text-zenro-red opacity-20"/></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tests.map(t => (
                        <div key={t.id} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group">
                            <FileCheck className="w-12 h-12 text-zenro-red mb-6" />
                            <h3 className="text-xl font-bold mb-2 text-slate-800">{t.title}</h3>
                            <p className="text-[10px] text-gray-400 font-black uppercase mb-6">Duration: {t.duration_minutes}m • Pass: {t.passing_score}%</p>
                            <button className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Manage Questions</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const TeacherCoursesPage = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('courses').select('*, course_batches(batch_name)').order('created_at', { ascending: false });
            if (data) setCourses(data);
            setLoading(false);
        };
        fetch();
    }, []);
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"><h1 className="text-3xl font-heading font-black text-zenro-blue tracking-tighter">Curriculum Repository</h1><button className="bg-zenro-blue text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest"><Plus className="w-4 h-4 mr-2" /> New Course</button></div>
            {loading ? <div className="text-center p-20"><Loader2 className="animate-spin mx-auto text-zenro-blue opacity-20"/></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {courses.map(c => (
                        <div key={c.id} className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm flex group hover:shadow-2xl transition-all">
                            <img src={c.thumbnail} className="w-48 h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                            <div className="p-10 flex-1">
                                <span className="bg-red-50 text-zenro-red px-3 py-1 rounded-lg text-[10px] font-black uppercase mb-4 inline-block tracking-widest">{c.level}</span>
                                <h3 className="text-xl font-black mb-4 text-slate-800">{c.title}</h3>
                                <div className="flex justify-between items-center pt-6 border-t border-gray-50"><span className="text-[10px] font-black uppercase text-gray-300">Target: {c.course_batches?.[0]?.batch_name || 'All'}</span><button className="text-zenro-blue font-black text-[10px] uppercase hover:text-zenro-red transition">Edit Module</button></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const TeacherReportsPage = () => <div className="p-20 text-center"><BarChart2 className="w-12 h-12 text-gray-100 mx-auto mb-4" /><p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">Analytics Syncing...</p></div>;
export const LiveClassConsole = () => <div className="h-[75vh] flex flex-col items-center justify-center bg-slate-900 rounded-[50px] shadow-2xl relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-zenro-blue/40 to-transparent"></div><div className="relative z-10 text-center text-white"><Video className="w-16 h-16 text-zenro-red mx-auto mb-10 animate-pulse" /><h2 className="text-4xl font-heading font-black tracking-tighter mb-4">Broadcasting Studio</h2><button className="bg-white text-zenro-blue px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all">Go Live</button></div></div>;
export const TeacherProfilePage = ({user}: any) => <div className="p-20 bg-white rounded-[40px] border border-gray-100 text-center"><img src={user.avatar} className="w-32 h-32 rounded-[40px] border-4 border-gray-50 mx-auto mb-6 shadow-xl" /><h2 className="text-3xl font-black text-slate-800 tracking-tighter">{user.name}</h2><p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs mt-2">{user.role}</p></div>;
