
import React, { useState, useEffect } from 'react';
import { Play, Calendar, BookOpen, Video, FileCheck, Loader2, Monitor, ChevronLeft, ChevronRight, Radio, FileText, CreditCard } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useLiveSession } from '../context/LiveContext';
import { Link } from 'react-router-dom';

export const StudentDashboardHome = () => {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const userData = localStorage.getItem('zenro_session');
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
      const fetchSchedule = async () => {
          if (!user?.batch) return;
          setLoading(true);
          const { data } = await supabase.from('schedules').select('*, profiles(full_name)').eq('batch_name', user.batch).gte('start_time', new Date().toISOString()).order('start_time', { ascending: true }).limit(1);
          if(data) setSchedule(data);
          setLoading(false);
      };
      fetchSchedule();
  }, [user?.batch]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[40px] p-10 border border-gray-100 relative overflow-hidden flex flex-col justify-center shadow-xl">
          <div className="relative z-10">
            <h2 className="text-5xl font-heading font-black text-zenro-blue tracking-tighter mb-4 leading-tight">Ohayou, <br/><span className="text-zenro-red">{user?.name.split(' ')[0]}-san!</span></h2>
            <p className="text-gray-400 text-xl font-light mb-10 leading-relaxed">Let's unlock your language potential today.</p>
            <div className="flex gap-4">
                <Link to="/student/schedule" className="bg-zenro-blue text-white font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-slate-900 transition shadow-xl">My Schedule</Link>
                <Link to="/student/courses" className="bg-gray-50 text-slate-800 font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-gray-100 transition">Curriculum</Link>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-10"><div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div><span className="text-[10px] font-black uppercase tracking-widest text-white/50">Next Broadcast</span></div>
                {loading ? <Loader2 className="animate-spin mx-auto opacity-20"/> : schedule.length > 0 ? (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold tracking-tight">{schedule[0].title}</h3>
                        <div className="flex items-center gap-4 py-6 border-y border-white/10">
                            <div className="w-12 h-12 rounded-2xl bg-zenro-red flex items-center justify-center font-black text-lg">S</div>
                            <div><p className="text-xs font-black text-white/40 mb-1 uppercase">Instructor</p><p className="text-sm font-bold">{schedule[0].profiles?.full_name}</p></div>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-3xl font-black font-mono">{new Date(schedule[0].start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                            <Link to="/student/live" className="p-4 bg-zenro-red rounded-2xl hover:scale-110 transition-all shadow-red-500/20 shadow-xl"><Play className="w-6 h-6 fill-white" /></Link>
                        </div>
                    </div>
                ) : <div className="py-10 text-center opacity-30"><Monitor className="w-12 h-12 mx-auto mb-4" /><p className="font-bold text-xs uppercase tracking-widest">No classes scheduled</p></div>}
            </div>
        </div>
      </div>
    </div>
  );
};

export const StudentSchedulePage = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const userData = localStorage.getItem('zenro_session');
    const user = userData ? JSON.parse(userData) : null;

    useEffect(() => {
        const fetch = async () => {
            if (!user?.batch) return;
            setLoading(true);
            const start = new Date(currentDate); start.setDate(currentDate.getDate() - currentDate.getDay());
            const end = new Date(start); end.setDate(start.getDate() + 7);
            const { data } = await supabase.from('schedules').select('*, profiles(full_name)').eq('batch_name', user.batch).gte('start_time', start.toISOString()).lte('start_time', end.toISOString()).order('start_time', { ascending: true });
            if (data) setEvents(data);
            setLoading(false);
        };
        fetch();
    }, [currentDate, user?.batch]);

    const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(currentDate); d.setDate(currentDate.getDate() - currentDate.getDay() + i); return d; });

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                <div><h1 className="text-3xl font-heading font-black text-zenro-blue tracking-tighter">Academic Planner</h1><p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest italic">Batch {user?.batch}</p></div>
                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl">
                    <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))} className="p-3 bg-white shadow-sm rounded-xl text-slate-400"><ChevronLeft className="w-5 h-5"/></button>
                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-800 w-40 text-center">Week of {weekDays[0].toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                    <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))} className="p-3 bg-white shadow-sm rounded-xl text-slate-400"><ChevronRight className="w-5 h-5"/></button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
                {weekDays.map((day, idx) => {
                    const dayEvents = events.filter(e => new Date(e.start_time).toDateString() === day.toDateString());
                    const isToday = new Date().toDateString() === day.toDateString();
                    return (
                        <div key={idx} className="space-y-4">
                            <div className={`p-6 rounded-[30px] text-center transition-all ${isToday ? 'bg-zenro-blue text-white shadow-xl scale-105 ring-8 ring-blue-500/10' : 'bg-white text-slate-300 border border-gray-50'}`}>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{day.toLocaleDateString(undefined, {weekday:'short'})}</p>
                                <p className="text-2xl font-black font-mono">{day.getDate()}</p>
                            </div>
                            <div className="space-y-4">
                                {dayEvents.map(ev => {
                                    const isLive = new Date() >= new Date(ev.start_time) && new Date() <= new Date(ev.end_time);
                                    return (
                                        <div key={ev.id} className={`p-6 rounded-[30px] border shadow-sm transition-all relative overflow-hidden ${isLive ? 'bg-red-50 border-red-200 ring-2 ring-red-500/10' : 'bg-white border-gray-50 hover:border-zenro-blue/30'}`}>
                                            {isLive && <div className="absolute top-0 right-0 w-2 h-full bg-zenro-red animate-pulse"></div>}
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${isLive ? 'text-red-600' : 'text-zenro-blue opacity-30'}`}>{new Date(ev.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                            <h4 className="font-black text-slate-800 text-sm leading-tight my-3">{ev.title}</h4>
                                            {isLive && <Link to="/student/live" className="w-full bg-zenro-red text-white py-2 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 shadow-lg">Join Live <Radio className="w-3 h-3"/></Link>}
                                        </div>
                                    );
                                })}
                                {dayEvents.length === 0 && <div className="h-32 rounded-[30px] border-2 border-dashed border-gray-50 flex items-center justify-center text-[9px] font-black uppercase text-gray-200 rotate-90 translate-y-4">Vacant</div>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const StudentCoursesPage = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const userData = localStorage.getItem('zenro_session');
    const user = userData ? JSON.parse(userData) : null;
    useEffect(() => {
        const fetchCourses = async () => {
            if (!user?.batch) return;
            setLoading(true);
            const { data: mapping } = await supabase.from('course_batches').select('course_id').eq('batch_name', user.batch);
            const courseIds = (mapping || []).map(m => m.course_id);
            const { data } = await supabase.from('courses').select('*').in('id', courseIds).eq('status', 'PUBLISHED');
            if (data) setCourses(data);
            setLoading(false);
        };
        fetchCourses();
    }, [user?.batch]);
    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-heading font-black text-zenro-blue tracking-tighter bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">My Curriculum</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? <Loader2 className="animate-spin mx-auto text-zenro-red opacity-20"/> : courses.map(c => (
                    <div key={c.id} className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all flex flex-col">
                        <img src={c.thumbnail} className="h-48 w-full object-cover" alt="" />
                        <div className="p-8 flex-1 flex flex-col">
                            <span className="bg-red-50 text-zenro-red px-2 py-1 rounded text-[9px] font-black uppercase mb-4 inline-block">{c.level}</span>
                            <h3 className="text-xl font-bold mb-4">{c.title}</h3>
                            <div className="mt-auto"><button className="w-full bg-zenro-blue text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/10 hover:bg-slate-900 transition-all">Resume Learning</button></div>
                        </div>
                    </div>
                ))}
                {!loading && courses.length === 0 && <div className="col-span-full py-20 text-center text-gray-300 font-bold italic">No courses assigned to your batch yet.</div>}
            </div>
        </div>
    );
};

export const StudentTestsPage = () => {
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const userData = localStorage.getItem('zenro_session');
    const user = userData ? JSON.parse(userData) : null;
    useEffect(() => {
        const fetchTests = async () => {
            if (!user?.batch) return;
            setLoading(true);
            const { data: mapping } = await supabase.from('test_batches').select('test_id').eq('batch_name', user.batch);
            const testIds = (mapping || []).map(t => t.test_id);
            const { data } = await supabase.from('tests').select('*').in('id', testIds).eq('is_active', true);
            if (data) setTests(data);
            setLoading(false);
        };
        fetchTests();
    }, [user?.batch]);
    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-heading font-black text-zenro-blue tracking-tighter bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">Active Exams</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? <Loader2 className="animate-spin mx-auto text-zenro-red opacity-20"/> : tests.map(t => (
                    <div key={t.id} className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group">
                        <div className="w-16 h-16 bg-red-50 text-zenro-red rounded-2xl flex items-center justify-center mb-8 group-hover:bg-zenro-red group-hover:text-white transition-all"><FileCheck /></div>
                        <h3 className="text-xl font-bold mb-2">{t.title}</h3>
                        <p className="text-xs text-gray-400 font-black uppercase mb-8">N4 Level • {t.duration_minutes} Mins</p>
                        <Link to={`/student/test/${t.id}`} className="block text-center bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zenro-red transition-all shadow-xl">Begin Exam</Link>
                    </div>
                ))}
                {!loading && tests.length === 0 && <div className="col-span-full py-20 text-center text-gray-300 font-bold italic">No active exams scheduled for your batch.</div>}
            </div>
        </div>
    );
};

export const StudentAssignmentsPage = () => {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const userData = localStorage.getItem('zenro_session');
    const user = userData ? JSON.parse(userData) : null;

    useEffect(() => {
        const fetch = async () => {
            if (!user?.batch) return;
            setLoading(true);
            const { data: mapping } = await supabase.from('assignment_batches').select('assignment_id').eq('batch_name', user.batch);
            const ids = (mapping || []).map(m => m.assignment_id);
            const { data } = await supabase.from('assignments').select('*').in('id', ids).eq('status', 'PUBLISHED');
            if (data) setAssignments(data);
            setLoading(false);
        };
        fetch();
    }, [user?.batch]);

    return (
        <div className="space-y-8 animate-fade-in">
             <h1 className="text-3xl font-heading font-black text-zenro-blue tracking-tighter bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">My Assignments</h1>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {loading ? <Loader2 className="animate-spin mx-auto text-zenro-blue opacity-20"/> : assignments.map(a => (
                     <div key={a.id} className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group">
                         <FileText className="w-12 h-12 text-blue-100 mb-6 group-hover:text-blue-600 transition-colors" />
                         <h3 className="text-xl font-bold mb-2">{a.title}</h3>
                         <p className="text-xs text-gray-400 font-black uppercase mb-8">Due: {new Date(a.due_date).toLocaleDateString()}</p>
                         <button className="w-full bg-gray-50 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zenro-blue hover:text-white transition-all shadow-sm">View & Submit</button>
                     </div>
                 ))}
                 {!loading && assignments.length === 0 && <div className="col-span-full py-20 text-center text-gray-300 font-bold italic">You are all caught up! No pending assignments.</div>}
             </div>
        </div>
    );
};

export const StudentLiveRoom = () => {
    const { isLive, remoteStream, topic, connectionState, joinSession, leaveSession } = useLiveSession();
    const videoRef = React.useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (remoteStream && videoRef.current) {
            videoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    useEffect(() => {
        if (isLive) joinSession();
        return () => leaveSession();
    }, [isLive]);

    return (
        <div className="h-[75vh] flex flex-col bg-slate-900 rounded-[50px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-8 left-8 z-20 flex items-center gap-4">
                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isLive ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-white/50'}`}>
                    {isLive ? 'Live Now' : 'Class Ended'}
                </div>
                {isLive && <span className="text-white font-bold text-sm tracking-tight">{topic}</span>}
            </div>

            {isLive ? (
                <div className="flex-1 relative">
                    {connectionState === 'connecting' ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4">
                            <Loader2 className="w-12 h-12 animate-spin text-zenro-red" />
                            <p className="font-black text-xs uppercase tracking-[0.4em]">Connecting to Teacher's Feed...</p>
                        </div>
                    ) : (
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />
                    )}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-white space-y-6">
                    <Video className="w-20 h-20 text-white/10 mb-4" />
                    <h2 className="text-4xl font-black tracking-tighter">Waiting for Instructor</h2>
                    <p className="text-white/40 max-w-sm uppercase text-[10px] font-black tracking-[0.3em]">The media server is active. Content will stream once the broadcast starts.</p>
                </div>
            )}
        </div>
    );
};

export const StudentFeesPage = ({ user }: { user: any }) => <div className="p-20 bg-white rounded-[40px] border border-gray-100 text-center shadow-sm"><CreditCard className="w-12 h-12 text-gray-100 mx-auto mb-4" /><p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">Accessing Financial Records...</p></div>;
export const StudentProfilePage = ({ user }: any) => <div className="p-20 bg-white rounded-[40px] border border-gray-100 text-center"><img src={user.avatar} className="w-32 h-32 rounded-[40px] border-4 border-gray-50 mx-auto mb-6 shadow-xl object-cover" /><h2 className="text-3xl font-black text-slate-800 tracking-tighter">{user.name}</h2><p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs mt-2">Batch {user.batch || 'Unassigned'}</p></div>;
