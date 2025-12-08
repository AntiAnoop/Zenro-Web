
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Clock, Calendar, AlertCircle, CheckCircle, 
  CreditCard, Download, User as UserIcon, MapPin, 
  Phone, Mail, Shield, BookOpen, ChevronRight, Lock,
  Video, BarChart2, ListTodo, FileText, Activity, Briefcase,
  Languages, GraduationCap, Globe, Zap, MessageCircle, Send, Users, Mic, MicOff, Hand, RefreshCw, Loader2,
  FileCheck, ArrowLeft, Menu, File, Film, AlertTriangle, Monitor, WifiOff
} from 'lucide-react';
import { User, Course, FeeRecord, Transaction, TestResult, ActivityItem, CourseModule, CourseMaterial, Schedule } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveSession } from '../context/LiveContext';
import { supabase } from '../services/supabaseClient';
import { jsPDF } from "jspdf";

const RAZORPAY_KEY_ID = "rzp_test_RoNJfVaY3d336e"; 

// --- MOCK DATA ---
const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: 'a1', title: 'Write Essay: "My Dream in Japan"', type: 'ASSIGNMENT', dueDate: 'Today, 11:59 PM', status: 'PENDING', courseName: 'Writing N4' },
  { id: 'a2', title: 'Watch "Life in Tokyo" Documentary', type: 'QUIZ', dueDate: 'Tomorrow', status: 'PENDING', courseName: 'Culture' },
  { id: 'a3', title: 'Hiragana/Katakana Speed Test', type: 'PROJECT', dueDate: '2023-10-25', status: 'COMPLETED', courseName: 'Basics' },
];

const ATTENDANCE_DATA = [
  { day: 'Mon', present: true },
  { day: 'Tue', present: true },
  { day: 'Wed', present: false },
  { day: 'Thu', present: true },
  { day: 'Fri', present: true },
];

// --- SUB-COMPONENTS ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    PAID: 'bg-green-100 text-green-700 border-green-200',
    SUCCESS: 'bg-green-100 text-green-700 border-green-200',
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    OVERDUE: 'bg-red-100 text-red-700 border-red-200',
    FAILED: 'bg-red-100 text-red-700 border-red-200',
    COMPLETED: 'bg-blue-100 text-blue-700 border-blue-200',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
};

// --- PAGES ---

export const StudentDashboardHome = () => {
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const userData = localStorage.getItem('zenro_session');
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
      const fetchSchedule = async () => {
          if (!user?.batch) return;
          const { data } = await supabase.from('schedules')
            .select('*')
            .eq('batch_name', user.batch)
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(3);
          if(data) setSchedule(data);
      };
      fetchSchedule();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header & Overview Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-8 border border-gray-200 relative overflow-hidden flex flex-col justify-center shadow-md">
          {/* Zenro Red Accent Bar */}
          <div className="absolute top-0 left-0 bottom-0 w-2 bg-zenro-red"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-heading font-bold text-zenro-slate mb-2">Konnichiwa, {user?.name.split(' ')[0]}-san! <span className="text-xl font-normal text-gray-400"> (こんにちは)</span></h2>
            <p className="text-gray-600 mb-6 font-light">Your JLPT N4 exam is in <span className="font-bold text-zenro-red">45 days</span>. Keep pushing! 頑張ってください!</p>
            <div className="flex gap-3">
              <button className="bg-zenro-red text-white font-bold px-6 py-2 rounded-lg hover:bg-red-700 transition shadow-md flex items-center gap-2">
                <Play className="w-4 h-4 fill-current" /> Continue Learning
              </button>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-10 translate-y-10">
             <Globe className="w-64 h-64 text-zenro-blue" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 flex flex-col justify-between border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Attendance</p>
              <h3 className="text-4xl font-heading font-bold text-zenro-slate mt-2">88%</h3>
              <p className="text-xs text-gray-400 mt-1">Shusseki (出席)</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-green-600">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="flex gap-1 mt-4">
             {ATTENDANCE_DATA.map((d, i) => (
               <div key={i} className={`h-1.5 flex-1 rounded-full ${d.present ? 'bg-green-500' : 'bg-gray-200'}`} title={d.day}></div>
             ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 flex flex-col justify-between border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start">
             <div>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Next Payment</p>
              <h3 className="text-4xl font-heading font-bold text-zenro-blue mt-2">¥35k</h3> 
              <p className="text-xs text-gray-400 mt-1">Due: Month 3</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-zenro-blue">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <button className="text-xs text-zenro-red hover:text-red-800 mt-2 text-left font-bold flex items-center gap-1 transition">
              View Details <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. Upcoming Schedule & Resume */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-heading font-bold text-zenro-slate mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-zenro-red" /> My Schedule
              </h3>
              <div className="space-y-3">
                  {schedule.length === 0 ? <p className="text-gray-500">No upcoming classes.</p> : 
                   schedule.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-zenro-blue">
                          <div>
                              <p className="font-bold text-slate-800">{s.title}</p>
                              <p className="text-xs text-gray-500">{new Date(s.start_time).toLocaleString()}</p>
                          </div>
                      </div>
                   ))
                  }
              </div>
          </div>

          {/* Activities List */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-heading font-bold text-zenro-slate flex items-center gap-2">
                    <ListTodo className="w-5 h-5 text-zenro-red" /> Pending Tasks
                </h3>
            </div>
            <div className="space-y-3">
                {MOCK_ACTIVITIES.filter(a => a.status === 'PENDING').slice(0, 3).map(act => (
                    <div key={act.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-zenro-red hover:bg-gray-100 transition group">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${act.type === 'ASSIGNMENT' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                {act.type === 'ASSIGNMENT' ? <FileText className="w-4 h-4" /> : <Languages className="w-4 h-4" />}
                            </div>
                            <div>
                                <p className="text-zenro-slate font-medium">{act.title}</p>
                                <p className="text-xs text-gray-500">{act.courseName} • Due {act.dueDate}</p>
                            </div>
                        </div>
                        <button className="text-xs bg-white hover:bg-zenro-red hover:text-white text-gray-600 px-4 py-2 rounded border border-gray-200 transition font-bold shadow-sm">Start</button>
                    </div>
                ))}
            </div>
          </div>
      </div>
    </div>
  );
};

export const StudentCoursesPage = () => {
  const navigate = useNavigate();
  const { isLive, topic } = useLiveSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveCourse, setLiveCourse] = useState<Course | null>(null);
  const userData = localStorage.getItem('zenro_session');
  const user: User = userData ? JSON.parse(userData) : null;

  const fetchMyCourses = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data: batchCourses } = await supabase.from('course_batches').select('course_id').eq('batch_name', user.batch); 
            const { data: directCourses } = await supabase.from('course_enrollments').select('course_id').eq('student_id', user.id);
            const courseIds = new Set<string>();
            if (batchCourses) batchCourses.forEach((c: any) => courseIds.add(c.course_id));
            if (directCourses) directCourses.forEach((c: any) => courseIds.add(c.course_id));

            if (courseIds.size > 0) {
                const { data: courseDetails } = await supabase.from('courses').select('*').in('id', Array.from(courseIds)).eq('status', 'PUBLISHED');
                if (courseDetails) {
                    const mapped: Course[] = courseDetails.map((c: any) => ({
                        id: c.id,
                        title: c.title,
                        description: c.description,
                        instructor: c.instructor_name || 'Tanaka Sensei',
                        progress: 0, 
                        thumbnail: c.thumbnail,
                        totalDuration: '10h 30m', 
                        level: c.level,
                        status: c.status
                    }));
                    setCourses(mapped);
                    const foundLive = mapped.find(c => c.title.includes(topic) || (isLive && c.id === 'c1')); 
                    if (foundLive && isLive) setLiveCourse(foundLive);
                }
            } else {
                setCourses([]);
            }
        } catch (e) { console.error("Course fetch error:", e); } finally { setLoading(false); }
    };

  useEffect(() => {
    fetchMyCourses();
    const courseSub = supabase.channel('public:courses').on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => fetchMyCourses()).subscribe();
    const batchSub = supabase.channel('public:course_batches').on('postgres_changes', { event: '*', schema: 'public', table: 'course_batches' }, () => fetchMyCourses()).subscribe();
    return () => { supabase.removeChannel(courseSub); supabase.removeChannel(batchSub); };
  }, [user?.id, user?.batch]);

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-12 h-12 text-zenro-red animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
        <h1 className="text-3xl font-heading font-bold text-zenro-slate flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-zenro-red" /> My Curriculum
        </h1>

        {liveCourse && (
            <div className="bg-zenro-blue rounded-xl p-1 shadow-lg">
                <div className="bg-white rounded-lg p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative w-full md:w-64 aspect-video bg-black rounded-lg overflow-hidden border border-gray-200">
                        <img src={liveCourse.thumbnail} alt="Live" className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-sm shadow-md ${isLive ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-600 text-white'}`}>
                                <span className={`w-2 h-2 bg-white rounded-full ${isLive ? 'animate-pulse' : ''}`}></span> {isLive ? 'LIVE NOW' : 'WAITING'}
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-bold text-zenro-slate mb-1">{topic}</h2>
                        <p className="text-gray-500 mb-4 font-medium text-sm uppercase tracking-wide">Instructor: {liveCourse.instructor}</p>
                        <button 
                            onClick={() => navigate('/student/live')}
                            className="bg-zenro-red hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 mx-auto md:mx-0 transition shadow-md"
                        >
                            <Video className="w-5 h-5" /> Join Classroom
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.length === 0 ? (
               <div className="col-span-3 p-12 text-center text-gray-500 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                   No courses assigned to your batch ({user?.batch}) yet. Please contact admin.
               </div>
          ) : (
            courses.map(course => (
                <div 
                    key={course.id} 
                    onClick={() => !course.isLocked && navigate(`/student/course/${course.id}`)}
                    className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-zenro-red hover:shadow-lg transition group cursor-pointer flex flex-col h-full"
                >
                <div className="relative aspect-video overflow-hidden bg-gray-200">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700" />
                    {course.isLocked && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-[1px]">
                            <Lock className="w-8 h-8 text-white mb-2" />
                            <span className="text-xs font-bold text-white uppercase tracking-widest">Locked</span>
                        </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] text-zenro-slate border border-gray-200 uppercase font-bold tracking-wider shadow-sm">
                        {course.level}
                    </div>
                    {!course.isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                            <div className="bg-zenro-red rounded-full p-4 shadow-xl transform scale-75 group-hover:scale-100 transition">
                                <Play className="w-6 h-6 text-white ml-1 fill-white" />
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                    <h4 className="font-heading font-bold text-zenro-slate truncate mb-2 text-lg group-hover:text-zenro-red transition">{course.title}</h4>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> {course.instructor}</span>
                        <span className="flex items-center gap-1 text-zenro-red"><Clock className="w-3 h-3" /> 12 Lessons</span>
                    </div>
                </div>
                </div>
            ))
          )}
        </div>
    </div>
  );
};

export const StudentLiveRoom = ({ user }: { user: User }) => {
    const { isLive, topic, remoteStream, joinSession, leaveSession, chatMessages, sendMessage, connectionState } = useLiveSession();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [msgInput, setMsgInput] = useState('');
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const attendanceInterval = useRef<any>(null);

    useEffect(() => {
        if (isLive) {
            joinSession();
            checkAndLogAttendance();
        }
        return () => {
            leaveSession();
            if (attendanceInterval.current) clearInterval(attendanceInterval.current);
        };
    }, [isLive]);

    // ATTENDANCE LOGIC
    const checkAndLogAttendance = async () => {
        if (!user.batch) return;
        
        // Find Active Session for Batch
        const { data } = await supabase.from('live_sessions')
            .select('id')
            .eq('batch_name', user.batch)
            .eq('status', 'LIVE')
            .single();
        
        if (data) {
            setActiveSessionId(data.id);
            // Log Join
            await supabase.from('attendance').insert({
                session_id: data.id,
                student_id: user.id,
                total_minutes: 0
            });

            // Start Heartbeat (Every 1 min)
            attendanceInterval.current = setInterval(async () => {
                await supabase.rpc('increment_attendance', { 
                    sid: data.id, 
                    uid: user.id 
                }); // Note: Ideally use RPC, but for simplicity here standard update
                
                // Fallback update without RPC
                const { data: current } = await supabase.from('attendance')
                    .select('total_minutes')
                    .eq('session_id', data.id)
                    .eq('student_id', user.id)
                    .single();
                
                if(current) {
                    await supabase.from('attendance').update({
                        total_minutes: current.total_minutes + 1,
                        last_heartbeat: new Date().toISOString()
                    }).eq('session_id', data.id).eq('student_id', user.id);
                }
            }, 60000);
        }
    };

    useEffect(() => {
        if (videoRef.current && remoteStream) {
            videoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (msgInput.trim()) {
            sendMessage(user.name, msgInput);
            setMsgInput('');
        }
    };

    if (!isLive) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-6 text-center animate-fade-in p-8">
                <div className="bg-gray-100 p-8 rounded-full">
                    <WifiOff className="w-16 h-16 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Class is currently offline</h2>
                <p className="text-gray-500 max-w-md">Please check your schedule or wait for the instructor to start the session.</p>
                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-zenro-blue text-white rounded-lg font-bold hover:bg-blue-800 transition">Refresh Status</button>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col gap-4 animate-fade-in">
             <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                 <div>
                     <h1 className="text-xl font-heading font-bold text-slate-800 flex items-center gap-2">
                         <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span> {topic}
                     </h1>
                     <p className="text-xs text-gray-500">Live Interactive Session • Tracking Attendance</p>
                 </div>
                 <div className="flex items-center gap-2">
                     <span className={`px-2 py-1 rounded text-xs font-bold ${connectionState === 'connected' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                         {connectionState === 'connected' ? 'Connected' : 'Connecting...'}
                     </span>
                 </div>
             </div>

             <div className="flex-1 flex gap-4 overflow-hidden">
                 <div className="flex-1 bg-black rounded-xl overflow-hidden relative shadow-lg flex flex-col justify-center items-center">
                     {remoteStream ? (
                         <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />
                     ) : (
                         <div className="text-white/50 flex flex-col items-center">
                             <Loader2 className="w-12 h-12 animate-spin mb-4" />
                             <p>Waiting for video stream...</p>
                         </div>
                     )}
                 </div>

                 <div className="w-80 bg-white border border-gray-200 rounded-xl flex flex-col shadow-sm">
                     <div className="p-3 border-b border-gray-200 font-bold text-sm text-slate-800 bg-gray-50">Class Chat</div>
                     <div className="flex-1 overflow-y-auto p-4 space-y-3">
                         {chatMessages.map((msg, i) => (
                             <div key={i} className="text-sm">
                                 <p className="text-xs font-bold text-slate-500">{msg.user} <span className="opacity-50 font-normal ml-1">{msg.timestamp}</span></p>
                                 <p className="text-slate-800">{msg.text}</p>
                             </div>
                         ))}
                     </div>
                     <form onSubmit={handleSend} className="p-3 border-t border-gray-200 bg-gray-50">
                         <div className="flex gap-2">
                             <input 
                                type="text" 
                                value={msgInput}
                                onChange={e => setMsgInput(e.target.value)}
                                className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-zenro-blue"
                                placeholder="Type a message..."
                             />
                             <button type="submit" className="bg-zenro-blue text-white p-2 rounded hover:bg-blue-800 transition"><Send className="w-4 h-4" /></button>
                         </div>
                     </form>
                 </div>
             </div>
        </div>
    );
}

export const StudentTestsPage = () => {
    const navigate = useNavigate();
    const [activeTests, setActiveTests] = useState<any[]>([]);
    const [pastSubmissions, setPastSubmissions] = useState<any[]>([]);
    const [tab, setTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
    const [loading, setLoading] = useState(true);
    const userData = localStorage.getItem('zenro_session');
    const user: User | null = userData ? JSON.parse(userData) : null;

    // --- REFACTORED DATA FETCHING FOR REAL-TIME UPDATES ---
    const fetchTestsAndHistory = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // 1. Get History (Ordered Latest First)
            const { data: subs } = await supabase
                .from('submissions')
                .select(`id, score, total_score, completed_at, test_id, tests (title, duration_minutes)`)
                .eq('status', 'COMPLETED')
                .eq('student_id', user.id)
                .order('completed_at', { ascending: false }); // Latest first
            
            const currentSubs = subs || [];
            setPastSubmissions(currentSubs);

            // 2. Get Assigned Tests
            const { data: batchTests } = await supabase.from('test_batches').select('test_id').eq('batch_name', user.batch);
            const { data: directTests } = await supabase.from('test_enrollments').select('test_id').eq('student_id', user.id);
            
            const eligibleTestIds = new Set<string>();
            if(batchTests) batchTests.forEach((t:any) => eligibleTestIds.add(t.test_id));
            if(directTests) directTests.forEach((t:any) => eligibleTestIds.add(t.test_id));

            if (eligibleTestIds.size > 0) {
                const { data: tests } = await supabase
                    .from('tests')
                    .select('*')
                    .in('id', Array.from(eligibleTestIds))
                    .eq('is_active', true);
                
                if (tests) {
                    const submittedTestIds = new Set(currentSubs.map((s:any) => s.test_id));
                    
                    const filtered = tests.filter((t: any) => 
                        !submittedTestIds.has(t.id) || t.allow_multiple_attempts
                    );
                    setActiveTests(filtered);
                }
            } else { 
                setActiveTests([]); 
            }
        } catch (error) { 
            console.error(error); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => {
        fetchTestsAndHistory();
        const subscription = supabase
            .channel('public:submissions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions', filter: `student_id=eq.${user?.id}` }, () => fetchTestsAndHistory())
            .subscribe();
        return () => { supabase.removeChannel(subscription); };
    }, [user?.id, user?.batch]);

    if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-12 h-12 text-zenro-red animate-spin" /></div>;

    return (
        <div className="space-y-8 animate-fade-in">
             <div className="flex items-center justify-between">
                <h1 className="text-3xl font-heading font-bold text-zenro-slate flex items-center gap-3">
                    <FileText className="w-8 h-8 text-zenro-red" /> Assessments
                </h1>
                <div className="bg-white p-1 rounded-lg flex border border-gray-200 shadow-sm">
                    <button onClick={() => setTab('ACTIVE')} className={`px-4 py-2 rounded-md text-sm font-bold transition ${tab === 'ACTIVE' ? 'bg-zenro-blue text-white' : 'text-gray-500 hover:text-zenro-slate'}`}>Active Tests</button>
                    <button onClick={() => setTab('HISTORY')} className={`px-4 py-2 rounded-md text-sm font-bold transition ${tab === 'HISTORY' ? 'bg-zenro-blue text-white' : 'text-gray-500 hover:text-zenro-slate'}`}>History & Reports</button>
                </div>
             </div>

            {tab === 'ACTIVE' ? (
                activeTests.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-gray-300 rounded-xl bg-white shadow-sm">
                        <div className="flex justify-center mb-4"><FileCheck className="w-12 h-12 text-gray-400" /></div>
                        <h3 className="text-xl font-bold text-zenro-slate mb-2">No Active Assessments</h3>
                        <p className="text-gray-500">You have completed all pending tests or none are assigned.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeTests.map((test, idx) => (
                            <div key={test.id || idx} className="bg-white rounded-xl p-6 flex flex-col relative overflow-hidden group border border-gray-200 shadow-sm hover:shadow-md transition">
                                <div className="absolute top-0 right-0 p-3">
                                    <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-[10px] font-bold border border-red-100 animate-pulse">ACTIVE</span>
                                </div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-50 text-zenro-blue rounded-lg"><Activity className="w-6 h-6" /></div>
                                </div>
                                <h3 className="text-lg font-bold text-zenro-slate mb-1">{test.title}</h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    {test.duration_minutes} Minutes • Passing: {test.passing_score || 40}%
                                    {test.allow_multiple_attempts && <span className="block text-xs text-green-600 font-bold mt-1">Retakes Allowed</span>}
                                </p>
                                <div className="mt-auto">
                                <button onClick={() => navigate(`/student/test/${test.id}`)} className="w-full py-3 bg-zenro-red hover:bg-red-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-sm">
                                    Start Test <ChevronRight className="w-4 h-4" />
                                </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <table className="w-full text-left text-sm text-gray-600">
                         <thead className="bg-gray-50 text-slate-700 uppercase font-bold text-xs border-b border-gray-200">
                           <tr>
                             <th className="px-6 py-4">Test Title</th>
                             <th className="px-6 py-4">Date Completed</th>
                             <th className="px-6 py-4">Score</th>
                             <th className="px-6 py-4 text-right">Action</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                           {pastSubmissions.length === 0 ? (
                               <tr><td colSpan={4} className="p-8 text-center text-gray-500">No past attempts found.</td></tr>
                           ) : (
                               pastSubmissions.map((sub) => (
                                 <tr key={sub.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-bold text-zenro-slate">{sub.tests?.title || 'Unknown Test'}</td>
                                    <td className="px-6 py-4">{new Date(sub.completed_at).toLocaleDateString()} {new Date(sub.completed_at).toLocaleTimeString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`font-bold px-2 py-1 rounded text-xs ${sub.score > (sub.total_score * 0.4) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {sub.score} / {sub.total_score}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => navigate(`/student/report/${sub.id}`)} className="text-zenro-blue hover:text-blue-800 font-bold text-xs border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 transition">
                                            View Report
                                        </button>
                                    </td>
                                 </tr>
                               ))
                           )}
                         </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export const StudentFeesPage = ({ user }: { user: User }) => {
    const [fees, setFees] = useState<FeeRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFees = async () => {
            setLoading(true);
            try {
                const { data } = await supabase.from('fees').select('*').eq('student_id', user.id);
                if (data) {
                    const mapped: FeeRecord[] = data.map((f:any) => ({
                        id: f.id,
                        title: f.title,
                        amount: f.amount,
                        dueDate: f.due_date,
                        status: f.status,
                        category: f.category,
                        phase: f.phase
                    }));
                    setFees(mapped);
                }
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchFees();
    }, [user.id]);

    const totalDue = fees.filter(f => f.status === 'PENDING' || f.status === 'OVERDUE').reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="space-y-8 animate-fade-in">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-heading font-bold text-zenro-slate flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-zenro-red" /> Fee Status
                </h1>
                <div className="text-right">
                    <p className="text-xs text-gray-500 font-bold uppercase">Total Outstanding</p>
                    <p className={`text-2xl font-bold ${totalDue > 0 ? 'text-red-500' : 'text-green-500'}`}>¥{totalDue.toLocaleString()}</p>
                </div>
             </div>

             {loading ? <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-zenro-red animate-spin" /></div> : (
                 <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                     <table className="w-full text-left text-sm text-gray-600">
                         <thead className="bg-gray-100 text-slate-700 uppercase font-bold text-xs border-b border-gray-200">
                             <tr>
                                 <th className="p-4">Description</th>
                                 <th className="p-4">Category</th>
                                 <th className="p-4">Due Date</th>
                                 <th className="p-4">Amount</th>
                                 <th className="p-4">Status</th>
                                 <th className="p-4 text-right">Action</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                             {fees.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-gray-500">No fee records found.</td></tr> : fees.map(fee => (
                                 <tr key={fee.id} className="hover:bg-gray-50 transition">
                                     <td className="p-4 font-bold text-slate-800">{fee.title}</td>
                                     <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600">{fee.category}</span></td>
                                     <td className="p-4">{new Date(fee.dueDate).toLocaleDateString()}</td>
                                     <td className="p-4 font-mono font-bold">¥{fee.amount.toLocaleString()}</td>
                                     <td className="p-4"><StatusBadge status={fee.status} /></td>
                                     <td className="p-4 text-right">
                                         {fee.status === 'PENDING' || fee.status === 'OVERDUE' ? (
                                             <button className="bg-zenro-red text-white text-xs px-3 py-1.5 rounded hover:bg-red-700 transition font-bold shadow-sm">Pay Now</button>
                                         ) : (
                                             <button className="text-gray-400 hover:text-slate-600 flex items-center gap-1 text-xs font-bold ml-auto"><Download className="w-3 h-3" /> Receipt</button>
                                         )}
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             )}
        </div>
    );
}

export const StudentProfilePage = ({ user }: { user: User }) => {
    return (
        <div className="space-y-8 animate-fade-in">
             <h1 className="text-3xl font-heading font-bold text-zenro-slate flex items-center gap-3"><UserIcon className="w-8 h-8 text-zenro-red" /> My Profile</h1>
             <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                 <div className="flex flex-col md:flex-row gap-8 items-start">
                     <div className="flex flex-col items-center gap-4">
                         <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-100" />
                         <span className="bg-zenro-blue text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{user.role}</span>
                     </div>
                     <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="p-4 bg-gray-50 rounded-lg border border-gray-200"><p className="text-xs text-gray-500 font-bold uppercase mb-1">Full Name</p><p className="text-lg font-bold text-slate-800">{user.name}</p></div>
                         <div className="p-4 bg-gray-50 rounded-lg border border-gray-200"><p className="text-xs text-gray-500 font-bold uppercase mb-1">Student ID</p><p className="text-lg font-bold text-slate-800 font-mono">{user.rollNumber || user.id.slice(0, 8).toUpperCase()}</p></div>
                         <div className="p-4 bg-gray-50 rounded-lg border border-gray-200"><p className="text-xs text-gray-500 font-bold uppercase mb-1">Email Address</p><p className="text-lg font-bold text-slate-800">{user.email}</p></div>
                         <div className="p-4 bg-gray-50 rounded-lg border border-gray-200"><p className="text-xs text-gray-500 font-bold uppercase mb-1">Assigned Batch</p><p className="text-lg font-bold text-slate-800">{user.batch || 'Unassigned'}</p></div>
                         <div className="p-4 bg-gray-50 rounded-lg border border-gray-200"><p className="text-xs text-gray-500 font-bold uppercase mb-1">Phone Number</p><p className="text-lg font-bold text-slate-800">{user.phone || 'Not Provided'}</p></div>
                     </div>
                 </div>
             </div>
        </div>
    );
}

export const StudentActivityPage = () => {
    return (
        <div className="space-y-8 animate-fade-in">
             <h1 className="text-3xl font-heading font-bold text-zenro-slate flex items-center gap-3"><ListTodo className="w-8 h-8 text-zenro-red" /> Practice & Activities</h1>
             <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                 <div className="p-6 border-b border-gray-200 bg-gray-50"><h3 className="font-bold text-slate-800">Assigned Tasks</h3></div>
                 <div className="divide-y divide-gray-100">
                     {MOCK_ACTIVITIES.map(activity => (
                         <div key={activity.id} className="p-6 hover:bg-gray-50 transition flex items-center justify-between group">
                             <div className="flex items-center gap-4">
                                 <div className={`p-3 rounded-full ${activity.type === 'ASSIGNMENT' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>{activity.type === 'ASSIGNMENT' ? <FileText className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}</div>
                                 <div><h4 className="font-bold text-slate-800 text-lg group-hover:text-zenro-blue transition">{activity.title}</h4><p className="text-sm text-gray-500">{activity.courseName} • Due: {activity.dueDate}</p></div>
                             </div>
                             <span className={`px-3 py-1 rounded-full text-xs font-bold border ${activity.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>{activity.status}</span>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
    );
}

export const StudentCoursePlayer = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            setLoading(true);
            try {
                const { data } = await supabase.from('courses').select('*').eq('id', courseId).single();
                if (data) {
                    setCourse({ id: data.id, title: data.title, description: data.description, instructor: data.instructor_name || 'Tanaka Sensei', progress: 0, thumbnail: data.thumbnail, totalDuration: '10h', level: data.level, modules: [{ id: 'm1', title: 'Introduction', materials: [] }, { id: 'm2', title: 'Chapter 1: Basics', materials: [] }] });
                }
            } catch (e) { console.error(e); } 
            finally { setLoading(false); }
        };
        fetchCourse();
    }, [courseId]);

    if(loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-12 h-12 text-zenro-red animate-spin" /></div>;
    if(!course) return <div className="p-8 text-center">Course not found.</div>;

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col gap-4 animate-fade-in">
             <div className="flex items-center gap-4 mb-2">
                 <button onClick={() => navigate('/student/courses')} className="p-2 hover:bg-gray-200 rounded-full transition"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
                 <h1 className="text-2xl font-heading font-bold text-slate-800">{course.title}</h1>
             </div>
             <div className="flex-1 flex gap-6 overflow-hidden">
                 <div className="flex-1 bg-black rounded-xl overflow-hidden shadow-lg flex items-center justify-center relative group"><div className="text-center"><Play className="w-16 h-16 text-white/50 mx-auto mb-4" /><p className="text-white/70 font-bold">Select a lesson to start</p></div></div>
                 <div className="w-80 bg-white border border-gray-200 rounded-xl flex flex-col shadow-sm overflow-hidden"><div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-slate-800">Course Content</div><div className="flex-1 overflow-y-auto">{course.modules?.map((module, i) => (<div key={module.id} className="border-b border-gray-100 last:border-0"><div className="p-4 bg-gray-50/50 font-bold text-sm text-slate-700 flex justify-between items-center cursor-pointer hover:bg-gray-100">{module.title}</div><div className="bg-white">{[1,2,3].map(lesson => (<div key={lesson} className="p-3 pl-8 hover:bg-blue-50 cursor-pointer flex items-center gap-3 text-sm text-gray-600 transition"><div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{lesson}</div><span>Lesson {lesson}</span><span className="ml-auto text-xs text-gray-400">10:00</span></div>))}</div></div>))}</div></div>
             </div>
        </div>
    );
}
