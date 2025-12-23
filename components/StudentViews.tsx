
import React, { useState, useEffect } from 'react';
import { Play, Clock, Calendar, AlertCircle, CheckCircle, CreditCard, Download, User as UserIcon, BookOpen, ChevronRight, Video, FileCheck, RefreshCw, Loader2, Monitor, X, Radio, ChevronLeft } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { Link } from 'react-router-dom';

export const StudentDashboardHome = () => {
  const [schedule, setSchedule] = useState<any[]>([]);
  const userData = localStorage.getItem('zenro_session');
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
      const fetchSchedule = async () => {
          if (!user?.batch) return;
          const { data } = await supabase.from('schedules').select('*, profiles(full_name)').eq('batch_name', user.batch).gte('start_time', new Date().toISOString()).order('start_time', { ascending: true }).limit(1);
          if(data) setSchedule(data);
      };
      fetchSchedule();
  }, [user?.batch]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[40px] p-10 border border-gray-100 relative overflow-hidden flex flex-col justify-center shadow-xl">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-zenro-red/5 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-5xl font-heading font-black text-zenro-blue tracking-tighter mb-4 leading-tight">Ohayou, <br/><span className="text-zenro-red">{user?.name.split(' ')[0]}-san!</span></h2>
            <p className="text-gray-400 text-xl font-light mb-10 leading-relaxed">Let's continue your journey to JLPT success.</p>
            <div className="flex gap-4">
                <Link to="/student/schedule" className="bg-zenro-blue text-white font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-slate-900 transition shadow-xl">View Schedule</Link>
                <Link to="/student/courses" className="bg-gray-50 text-slate-800 font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-gray-100 transition">Curriculum</Link>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)]"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Next Session</span>
                </div>
                {schedule.length > 0 ? (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold tracking-tight">{schedule[0].title}</h3>
                        <div className="flex items-center gap-4 py-6 border-y border-white/10">
                            <div className="w-12 h-12 rounded-2xl bg-zenro-red flex items-center justify-center font-black text-lg">S</div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">Teacher</p>
                                <p className="text-sm font-bold">{schedule[0].profiles?.full_name}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-3xl font-black font-mono">{new Date(schedule[0].start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false})}</span>
                            <Link to="/student/live" className="p-4 bg-zenro-red rounded-2xl hover:scale-110 transition-all shadow-xl shadow-red-900/20"><Play className="w-6 h-6 fill-white" /></Link>
                        </div>
                    </div>
                ) : (
                    <div className="py-10 text-center opacity-30"><Monitor className="w-12 h-12 mx-auto mb-4" /><p className="font-bold text-xs uppercase tracking-widest">No classes soon</p></div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

// --- FEATURE: STUDENT COURSES (ROBUST) ---
export const StudentCoursesPage = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const userData = localStorage.getItem('zenro_session');
    const user = userData ? JSON.parse(userData) : null;

    useEffect(() => {
        const fetchCourses = async () => {
            if (!user?.batch) return;
            // 1. Get courses assigned to student's batch
            const { data: assignments } = await supabase.from('course_batches').select('course_id').eq('batch_name', user.batch);
            const courseIds = (assignments || []).map(a => a.course_id);
            
            // 2. Fetch those courses
            const { data } = await supabase.from('courses').select('*').in('id', courseIds).eq('status', 'PUBLISHED');
            if (data) setCourses(data);
            setLoading(false);
        };
        fetchCourses();
    }, [user?.batch]);

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-heading font-black text-zenro-blue tracking-tighter bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">Academic Curriculum</h1>
            {loading ? <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-zenro-blue opacity-20"/></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map(c => (
                        <div key={c.id} className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col">
                             <div className="h-48 relative">
                                 <img src={c.thumbnail} className="w-full h-full object-cover" alt="" />
                                 <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">{c.level}</div>
                             </div>
                             <div className="p-8 flex-1 flex flex-col">
                                 <h3 className="text-xl font-bold mb-4">{c.title}</h3>
                                 <p className="text-sm text-gray-400 font-medium mb-8 line-clamp-2">{c.description}</p>
                                 <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-center">
                                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sensei: {c.instructor_name}</span>
                                     <button className="bg-zenro-blue text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-blue-900/10">Start</button>
                                 </div>
                             </div>
                        </div>
                    ))}
                    {courses.length === 0 && <div className="col-span-full py-20 text-center text-gray-300 font-bold italic">No courses assigned to your batch ({user?.batch}).</div>}
                </div>
            )}
        </div>
    );
};

// --- FEATURE: STUDENT TESTS (ROBUST) ---
export const StudentTestsPage = () => {
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const userData = localStorage.getItem('zenro_session');
    const user = userData ? JSON.parse(userData) : null;

    useEffect(() => {
        const fetchTests = async () => {
            if (!user?.batch) return;
            // Get tests for the batch
            const { data: batchTests } = await supabase.from('test_batches').select('test_id').eq('batch_name', user.batch);
            const testIds = (batchTests || []).map(t => t.test_id);
            
            const { data } = await supabase.from('tests').select('*').in('id', testIds).eq('is_active', true);
            if (data) setTests(data);
            setLoading(false);
        };
        fetchTests();
    }, [user?.batch]);

    return (
        <div className="space-y-8 animate-fade-in">
             <h1 className="text-3xl font-heading font-black text-zenro-blue tracking-tighter bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">Exam Portal</h1>
             {loading ? <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-zenro-red opacity-20"/></div> : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {tests.map(t => (
                         <div key={t.id} className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group">
                             <div className="w-16 h-16 bg-red-50 text-zenro-red rounded-2xl flex items-center justify-center mb-8 transition-colors group-hover:bg-zenro-red group-hover:text-white"><FileCheck /></div>
                             <h3 className="text-xl font-bold mb-2">{t.title}</h3>
                             <p className="text-sm text-gray-400 font-medium mb-8">N4 Level Assessment • 60 Mins</p>
                             <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t.duration_minutes} Minutes</span>
                                 <Link to={`/student/test/${t.id}`} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">Begin</Link>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
        </div>
    );
};

// --- MISC VIEWS ---
export const StudentSchedulePage = () => <div className="p-10 text-center font-bold text-gray-300">Live Schedule Loading...</div>;
export const StudentFeesPage = ({ user }: { user: any }) => <div className="p-10 text-center font-bold text-gray-300">Fee Invoices & Payments Hub...</div>;
export const StudentLiveRoom = ({ user }: { user: any }) => <div className="p-20 text-center"><Video className="w-20 h-20 text-zenro-red mx-auto mb-6 animate-pulse"/><p className="text-xl font-black text-slate-800 tracking-tighter">Waiting for teacher to start stream...</p></div>;
export const StudentProfilePage = ({ user }: any) => <div className="p-10">Identity Card of {user.name}</div>;
export const StudentActivityPage = () => <div className="p-10">Practice History...</div>;
export const StudentCoursePlayer = () => <div className="p-10">Course Player Core...</div>;
