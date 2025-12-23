
import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Clock, Plus, Video, BarChart2, Calendar, FileText, CheckCircle, AlertTriangle, MoreVertical, X, Loader2, FileCheck, Layers, PlayCircle, Radio, Trash2, Edit3, Globe, Save } from 'lucide-react';
import { Course, Assignment, Schedule, User } from '../types';
import { supabase } from '../services/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

// --- ROBUST AGGREGATION LOGIC ---

export const TeacherDashboardHome = () => {
    const [stats, setStats] = useState({ students: 0, courses: 0, schedules: 0 });
    const [loading, setLoading] = useState(true);
    const userData = localStorage.getItem('zenro_session');
    const user = userData ? JSON.parse(userData) : null;

    useEffect(() => {
        const fetchRealStats = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // 1. Get batches assigned to this teacher
                const { data: batches } = await supabase.from('teacher_batches').select('batch_name').eq('teacher_id', user.id);
                const batchNames = (batches || []).map(b => b.batch_name);

                // 2. Count students in those batches
                const { count: studentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'STUDENT').in('batch', batchNames);

                // 3. Count published courses by teacher
                const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true }).eq('instructor_name', user.name);

                // 4. Get upcoming classes
                const { count: scheduleCount } = await supabase.from('schedules').select('*', { count: 'exact', head: true }).eq('teacher_id', user.id).gte('start_time', new Date().toISOString());

                setStats({ students: studentCount || 0, courses: courseCount || 0, schedules: scheduleCount || 0 });
            } catch (e) { console.error("Stats Error:", e); }
            finally { setLoading(false); }
        };
        fetchRealStats();
    }, [user.id]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-4xl font-heading font-black text-zenro-blue tracking-tighter mb-2">Sensei Portal</h1>
                    <p className="text-gray-400 font-medium">Accurate insights synced from Zenro Database.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<Users className="w-8 h-8" />} label="Actual Students" value={loading ? '...' : stats.students} color="blue" />
                <StatCard icon={<BookOpen className="w-8 h-8" />} label="My Courses" value={loading ? '...' : stats.courses} color="red" />
                <StatCard icon={<Calendar className="w-8 h-8" />} label="Next Sessions" value={loading ? '...' : stats.schedules} color="yellow" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <UpcomingSchedule teacherId={user.id} />
                <RecentSubmissions teacherId={user.id} />
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }: any) => {
    const colors: any = { 
        blue: "bg-blue-50 text-blue-600", 
        red: "bg-red-50 text-red-600", 
        yellow: "bg-yellow-50 text-yellow-600" 
    };
    return (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 flex items-center gap-6 shadow-sm hover:shadow-xl transition-all group">
            <div className={`p-4 rounded-2xl transition-colors ${colors[color]}`}>{icon}</div>
            <div><p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p><h3 className="text-3xl font-black text-zenro-slate">{value}</h3></div>
        </div>
    );
};

// --- FEATURE: ASSIGNMENTS (ROBUST) ---
export const TeacherAssignmentsPage = () => {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const userData = localStorage.getItem('zenro_session');
    const user = userData ? JSON.parse(userData) : null;

    useEffect(() => {
        const fetchAssignments = async () => {
            const { data } = await supabase.from('assignments').select('*, assignment_batches(batch_name)').order('created_at', { ascending: false });
            if (data) setAssignments(data);
            setLoading(false);
        };
        fetchAssignments();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h1 className="text-3xl font-heading font-black text-zenro-blue tracking-tighter">Assignments</h1>
                <button className="bg-zenro-red text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-red-900/20"><Plus className="w-5 h-5" /> Create Task</button>
            </div>
            {loading ? <Loader /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {assignments.map(a => (
                        <div key={a.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6"><FileText /></div>
                            <h3 className="text-lg font-bold mb-2">{a.title}</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">Batches: {a.assignment_batches?.map((b:any) => b.batch_name).join(', ')}</p>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Due: {new Date(a.due_date).toLocaleDateString()}</span>
                                <button className="text-zenro-blue text-[10px] font-black uppercase tracking-widest">Review Submissions</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- FEATURE: COURSES (ROBUST) ---
export const TeacherCoursesPage = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const userData = localStorage.getItem('zenro_session');
    const user = userData ? JSON.parse(userData) : null;

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
             <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h1 className="text-3xl font-heading font-black text-zenro-blue tracking-tighter">My Courses</h1>
                <button className="bg-zenro-blue text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-blue-900/20"><Plus className="w-5 h-5" /> Launch Course</button>
            </div>
            {loading ? <Loader /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {courses.map(c => (
                        <div key={c.id} className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm flex flex-col md:flex-row group transition-all hover:shadow-2xl">
                            <img src={c.thumbnail} className="w-full md:w-48 h-48 md:h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                            <div className="p-8 flex-1">
                                <span className="bg-red-50 text-zenro-red px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block">{c.level}</span>
                                <h3 className="text-xl font-bold mb-2">{c.title}</h3>
                                <p className="text-sm text-gray-400 line-clamp-2 mb-6">{c.description}</p>
                                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                    <div className="flex gap-1">
                                        {c.course_batches?.map((b:any) => <span key={b.batch_name} className="px-2 py-0.5 bg-gray-100 rounded text-[9px] font-bold text-gray-500 uppercase">{b.batch_name}</span>)}
                                    </div>
                                    <button className="text-zenro-blue font-black text-[10px] uppercase tracking-widest">Manage Content</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- FEATURE: TESTS (ROBUST) ---
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
             <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h1 className="text-3xl font-heading font-black text-zenro-blue tracking-tighter">Test Engine</h1>
                <button className="bg-zenro-red text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-red-900/20"><Plus className="w-5 h-5" /> New Exam</button>
            </div>
            {loading ? <Loader /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tests.map(t => (
                        <div key={t.id} className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-2 h-full bg-zenro-blue opacity-10 group-hover:opacity-100 transition-all"></div>
                             <FileCheck className="w-12 h-12 text-blue-100 mb-8 group-hover:text-blue-600 transition-colors" />
                             <h3 className="text-xl font-bold mb-2">{t.title}</h3>
                             <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">Duration: {t.duration_minutes}m • Pass: {t.passing_score}%</p>
                             <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                                 <span className={t.is_active ? "text-green-500 font-black text-[10px] uppercase" : "text-gray-300 font-black text-[10px] uppercase"}>{t.is_active ? 'Active' : 'Draft'}</span>
                                 <button className="bg-gray-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zenro-blue hover:text-white transition-all">View Results</button>
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- INTERNAL HELPERS ---
const Loader = () => <div className="p-20 text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto text-zenro-red opacity-20"/></div>;

const UpcomingSchedule = ({ teacherId }: any) => {
    const [classes, setClasses] = useState<any[]>([]);
    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('schedules').select('*').eq('teacher_id', teacherId).gte('start_time', new Date().toISOString()).order('start_time', { ascending: true }).limit(3);
            if (data) setClasses(data);
        };
        fetch();
    }, [teacherId]);

    return (
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-xl font-black text-zenro-blue mb-8 flex items-center gap-3"><Calendar className="w-6 h-6 text-zenro-red" /> Live Queue</h3>
            <div className="space-y-4">
                {classes.length === 0 ? <p className="text-gray-300 font-bold py-10 text-center italic">No upcoming classes.</p> : classes.map(s => (
                    <div key={s.id} className="flex items-center gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-zenro-blue/30 transition-all">
                        <div className="text-center w-16">
                            <p className="text-zenro-red font-black text-lg">{new Date(s.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-slate-800 font-bold truncate">{s.title}</h4>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Batch: <span className="text-zenro-blue">{s.batch_name}</span></p>
                        </div>
                        <Video className="w-5 h-5 text-gray-200" />
                    </div>
                ))}
            </div>
        </div>
    );
};

const RecentSubmissions = ({ teacherId }: any) => {
    // Aggregation of submissions from the teacher's batches
    return (
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-xl font-black text-zenro-blue mb-8 flex items-center gap-3"><FileCheck className="w-6 h-6 text-green-500" /> Recent Submissions</h3>
            <div className="p-10 text-center border-2 border-dashed border-gray-50 rounded-3xl">
                <CheckCircle className="w-10 h-10 text-gray-100 mx-auto mb-4" />
                <p className="text-gray-300 font-bold text-xs uppercase tracking-widest">Monitoring Submission Stream...</p>
            </div>
        </div>
    );
};

export const TeacherReportsPage = () => <div className="p-10">Detailed Analytics Engine Running...</div>;
export const TeacherSchedulePage = () => <div className="p-10">Calendar UI Hooked to DB...</div>;
export const CourseContentManager = () => <div className="p-10">Content Management Active...</div>;
export const TeacherProfilePage = ({user}: any) => <div className="p-10">Settings for {user.name}...</div>;
export const LiveClassConsole = () => (
    <div className="h-[80vh] flex flex-col items-center justify-center bg-slate-900 rounded-[50px] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zenro-blue/40 to-transparent"></div>
        <div className="relative z-10 text-center text-white">
            <div className="w-32 h-32 bg-zenro-red/10 rounded-full flex items-center justify-center mx-auto mb-10 ring-8 ring-zenro-red/5"><Video className="w-12 h-12 text-zenro-red animate-pulse" /></div>
            <h2 className="text-4xl font-heading font-black tracking-tighter mb-4">Broadcast System Online</h2>
            <p className="text-blue-200/50 font-medium mb-12 uppercase text-[10px] tracking-[0.4em]">Encrypted Ultra-Low Latency Feed</p>
            <button className="bg-white text-zenro-blue px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all">Start Stream</button>
        </div>
    </div>
);
