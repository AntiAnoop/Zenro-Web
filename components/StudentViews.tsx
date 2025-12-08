
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Clock, Calendar, AlertCircle, CheckCircle, 
  CreditCard, Download, User as UserIcon, MapPin, 
  Phone, Mail, Shield, BookOpen, ChevronRight, Lock,
  Video, BarChart2, ListTodo, FileText, Activity, Briefcase,
  Languages, GraduationCap, Globe, Zap, MessageCircle, Send, Users, Mic, MicOff, Hand, RefreshCw, Loader2,
  FileCheck, ArrowLeft, Menu, File, Film
} from 'lucide-react';
import { User, Course, FeeRecord, Transaction, TestResult, ActivityItem, CourseModule, CourseMaterial } from '../types';
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
  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header & Overview Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-8 border border-gray-200 relative overflow-hidden flex flex-col justify-center shadow-md">
          {/* Zenro Red Accent Bar */}
          <div className="absolute top-0 left-0 bottom-0 w-2 bg-zenro-red"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-heading font-bold text-zenro-slate mb-2">Konnichiwa, Alex-san! <span className="text-xl font-normal text-gray-400"> (こんにちは)</span></h2>
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

      {/* 2. Hero Section - Course Resume */}
      <div className="relative rounded-xl overflow-hidden bg-white border border-gray-200 shadow-md group">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1528360983277-13d9012356ee?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-zenro-blue/90 via-zenro-blue/80 to-transparent"></div>
        
        <div className="relative z-10 p-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zenro-red text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                <Play className="w-3 h-3 fill-current" /> Continue JLPT N4
              </div>
              <div>
                <h1 className="text-3xl font-heading font-bold text-white leading-tight">Grammar: The Causative Form</h1>
                <h2 className="text-xl text-blue-100 font-light mt-1">使役形 (Shieki-kei)</h2>
              </div>
              <p className="text-blue-200 font-light text-sm">Resume from 12:05 • Lesson 4 of 12 • Tanaka Sensei</p>
              <div className="w-full max-w-md bg-white/20 rounded-full h-1.5 backdrop-blur">
                  <div style={{width: '45%'}} className="bg-zenro-red h-1.5 rounded-full"></div>
              </div>
           </div>
           
           <button className="bg-white text-zenro-blue hover:bg-gray-100 px-8 py-3 rounded-lg font-bold flex items-center gap-3 transition shadow-lg border border-transparent">
              <Play className="w-5 h-5 fill-current text-zenro-red" /> 
              <span>Resume Lesson</span>
           </button>
        </div>
      </div>

      {/* 3. Daily Kanji & Activities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Kanji of the Day */}
          <div className="bg-white rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden group border border-gray-200 shadow-sm hover:shadow-md transition">
              <div className="absolute -right-4 -top-4 text-9xl text-gray-100 font-heading select-none pointer-events-none group-hover:scale-110 transition duration-700">夢</div>
              <h3 className="text-zenro-red text-[10px] font-bold uppercase tracking-widest mb-4 border border-red-100 bg-red-50 px-2 py-1 rounded">Kanji of the Day</h3>
              <div className="text-6xl font-black text-zenro-slate mb-2 font-heading">夢</div>
              <p className="text-2xl text-zenro-red mb-1 font-medium">Yume</p>
              <p className="text-gray-500">Dream</p>
              <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded w-full border border-gray-200">
                  Ex: 将来の夢 (Future dream)
              </div>
          </div>

          {/* Activities List */}
          <div className="md:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
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

export const StudentCoursePlayer = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [activeMaterial, setActiveMaterial] = useState<CourseMaterial | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            if(!courseId) return;
            try {
                const { data: courseData } = await supabase.from('courses').select('*').eq('id', courseId).single();
                if(courseData) setCourse(courseData);
                const { data: modulesData } = await supabase.from('course_modules').select('*, course_materials(*)').eq('course_id', courseId).order('order');
                if(modulesData) {
                    setModules(modulesData);
                    if(modulesData.length > 0 && modulesData[0].course_materials.length > 0) setActiveMaterial(modulesData[0].course_materials[0]);
                }
            } catch(e) { console.error("Content fetch failed", e); } finally { setLoading(false); }
        };
        fetchContent();
    }, [courseId]);

    if(loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-12 h-12 text-zenro-red animate-spin" /></div>;
    if(!course) return <div>Course not found</div>;

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
            {/* Header */}
            <div className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/student/courses')} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-zenro-slate">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="font-bold text-lg text-zenro-slate hidden md:block">{course.title}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content */}
                <div className="flex-1 bg-gray-50 relative flex items-center justify-center overflow-y-auto">
                    {activeMaterial ? (
                        activeMaterial.type === 'VIDEO' ? (
                            <div className="w-full h-full max-w-5xl mx-auto flex flex-col p-4">
                                <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg relative group">
                                    <video src={activeMaterial.url} controls className="w-full h-full object-contain" poster={course.thumbnail} />
                                </div>
                                <div className="mt-6">
                                    <h2 className="text-2xl font-bold text-zenro-slate">{activeMaterial.title}</h2>
                                    <p className="text-gray-500 mt-2 text-sm">Now Playing • Module Content</p>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col p-8">
                                <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-red-50 rounded-lg text-zenro-red">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-zenro-slate">{activeMaterial.title}</h2>
                                            <p className="text-gray-500 text-sm">Course Material • {activeMaterial.type}</p>
                                        </div>
                                    </div>
                                    <a href={activeMaterial.url} target="_blank" rel="noopener noreferrer" className="bg-zenro-red hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition">
                                        <Download className="w-4 h-4" /> Download
                                    </a>
                                </div>
                                <div className="flex-1 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 flex-col">
                                    <File className="w-16 h-16 mb-4 opacity-30" />
                                    <p>Preview not available.</p>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="text-gray-500">Select a lesson to start</div>
                    )}
                </div>

                {/* Sidebar Playlist - Clean Light Style */}
                <div className={`${sidebarOpen ? 'w-80 translate-x-0' : 'w-0 translate-x-full lg:w-0'} bg-white border-l border-gray-200 transition-all duration-300 flex flex-col absolute right-0 top-0 bottom-0 z-10 lg:relative lg:translate-x-0`}>
                    <div className="p-4 border-b border-gray-200 font-bold text-zenro-slate bg-gray-50">
                        Course Content
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {modules.map((mod, idx) => (
                            <div key={mod.id} className="border-b border-gray-100">
                                <div className="p-4 bg-gray-50 font-bold text-sm text-gray-600 flex justify-between items-center sticky top-0">
                                    <span>{idx + 1}. {mod.title}</span>
                                </div>
                                <div>
                                    {mod.course_materials.map((mat: any) => (
                                        <button
                                            key={mat.id}
                                            onClick={() => setActiveMaterial(mat)}
                                            className={`w-full text-left p-4 flex items-start gap-3 hover:bg-red-50 transition border-l-4 ${
                                                activeMaterial?.id === mat.id 
                                                ? 'bg-red-50 border-zenro-red text-zenro-red font-semibold' 
                                                : 'border-transparent text-gray-600'
                                            }`}
                                        >
                                            <div className="mt-0.5">
                                                {mat.type === 'VIDEO' ? <Film className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                            </div>
                                            <div className="text-sm line-clamp-2">{mat.title}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const StudentLiveRoom = ({ user }: { user: User }) => {
    const { isLive, topic, viewerCount, sendMessage, chatMessages, remoteStream, joinSession, leaveSession, checkStatus, connectionState } = useLiveSession();
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [isChatOpen, setIsChatOpen] = useState(true);

    useEffect(() => {
        if (isLive && !remoteStream) joinSession();
        const interval = setInterval(() => { if(isLive && connectionState === 'idle' && !remoteStream) joinSession(); }, 5000);
        return () => { clearInterval(interval); leaveSession(); };
    }, [isLive]);

    useEffect(() => { if (remoteStream && remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream; }, [remoteStream]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if(message.trim()) { sendMessage(user.name, message); setMessage(""); }
    }

    if (!isLive) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-8 animate-fade-in relative overflow-hidden bg-gray-50">
                <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-xl text-center max-w-xl w-full">
                    <div className="inline-block p-4 rounded-full bg-blue-50 border border-blue-100 mb-6">
                         <Video className="w-12 h-12 text-zenro-blue" />
                    </div>
                    <h2 className="text-3xl font-heading font-bold text-zenro-slate mb-2">{topic !== "Waiting for class..." ? "Class Ended" : "Waiting for Class"}</h2>
                    <p className="text-gray-500 mb-8 font-medium">
                        {topic !== "Waiting for class..." ? "The live session has ended." : "Waiting for host to start the class..."}
                    </p>
                    <div className="flex flex-col gap-4 mt-8">
                        <button onClick={checkStatus} className="bg-zenro-blue hover:bg-blue-800 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-md transition">
                            <RefreshCw className="w-4 h-4" /> Refresh Status
                        </button>
                        <button onClick={() => navigate('/student/courses')} className="text-gray-500 hover:text-zenro-red text-sm underline">
                            Leave Waiting Room
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-2rem)] flex gap-6 animate-fade-in relative">
             <div className="flex-1 flex flex-col space-y-4">
                 <div className="relative flex-1 bg-black rounded-xl border border-gray-800 overflow-hidden shadow-2xl group">
                      {remoteStream ? (
                          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover fixed inset-0 z-10 bg-black" />
                      ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-black z-10">
                             <div className="text-center">
                                 <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
                                 <p className="text-white font-bold text-lg mb-2">Connecting to Classroom...</p>
                             </div>
                          </div>
                      )}
                      
                      <div className="absolute top-4 left-4 flex gap-2 z-20 pointer-events-none">
                           <div className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-2 shadow-md">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> LIVE
                           </div>
                           <div className="bg-black/60 backdrop-blur text-white px-3 py-1 rounded text-xs flex items-center gap-2">
                                <Users className="w-3 h-3" /> {viewerCount}
                           </div>
                      </div>
                      
                      <div className="absolute bottom-4 right-4 z-40">
                          <button onClick={() => setIsChatOpen(!isChatOpen)} className="bg-white p-3 rounded-full text-zenro-slate hover:text-zenro-red transition shadow-lg">
                              <MessageCircle className="w-6 h-6" />
                          </button>
                      </div>
                 </div>
             </div>

             {/* Chat Sidebar - Light Theme */}
             <div className={`w-96 bg-white border-l border-gray-200 flex flex-col overflow-hidden shadow-xl fixed right-0 top-0 bottom-0 z-30 transition-transform duration-300 ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                 <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center pt-20">
                     <h3 className="font-bold text-zenro-slate flex items-center gap-2"><MessageCircle className="w-4 h-4 text-zenro-red" /> Live Chat</h3>
                     <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-gray-600"><ChevronRight className="w-5 h-5" /></button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                     {chatMessages.map((m, i) => (
                         <div key={i} className="animate-fade-in-up">
                             <div className="flex items-baseline justify-between mb-1">
                                 <span className={`text-xs font-bold ${m.user === "Tanaka Sensei" ? 'text-zenro-red' : m.user === user.name ? 'text-blue-600' : 'text-gray-700'}`}>
                                     {m.user}
                                 </span>
                                 <span className="text-[10px] text-gray-400">{m.timestamp}</span>
                             </div>
                             <p className={`text-sm rounded-lg p-3 shadow-sm ${m.user === "SYSTEM" ? 'bg-yellow-50 text-yellow-700 text-xs italic border border-yellow-100' : 'bg-white border border-gray-100 text-gray-700'}`}>
                                 {m.text}
                             </p>
                         </div>
                     ))}
                 </div>

                 <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200">
                     <div className="relative">
                         <input 
                            type="text" 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ask a question..." 
                            className="w-full bg-gray-50 border border-gray-300 text-slate-800 pl-4 pr-10 py-3 rounded-lg focus:ring-2 focus:ring-zenro-blue focus:outline-none placeholder-gray-400 text-sm"
                         />
                         <button type="submit" className="absolute right-2 top-2 p-1.5 bg-zenro-blue hover:bg-blue-800 text-white rounded-md transition">
                             <Send className="w-4 h-4" />
                         </button>
                     </div>
                 </form>
             </div>
             
             <button onClick={() => navigate('/student/courses')} className="fixed top-4 right-4 z-40 bg-white/90 hover:bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-sm backdrop-blur shadow-md border border-gray-200">Exit Class</button>
        </div>
    );
};

export const StudentFeesPage = ({ user }: { user: User }) => {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingFeeId, setPayingFeeId] = useState<string | null>(null);

  useEffect(() => { fetchFees(); }, [user.id]);

  const fetchFees = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from('fees').select('*').eq('student_id', user.id).order('due_date', { ascending: true });
        if (data) setFees(data);
      } catch (e) { console.error("Error fetching fees:", e); } finally { setLoading(false); }
  };

  const generateReceipt = (fee: FeeRecord, paymentId: string) => {
    try {
        const doc = new jsPDF();
        doc.setFillColor(230, 0, 18); // Zenro Red
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.text("ZENRO INSTITUTE", 20, 20);
        doc.setFontSize(10); doc.setFont("helvetica", "normal");
        doc.text("Excellence in Japanese Language Training", 20, 28);
        doc.setFontSize(16); doc.text("PAYMENT RECEIPT", 150, 25);
        doc.setTextColor(0, 0, 0); doc.setFontSize(10);
        doc.text(`Receipt No: #${paymentId.slice(-8).toUpperCase()}`, 140, 55);
        doc.text(`Student: ${user.name}`, 20, 55);
        doc.text(`Amount: ${fee.amount}`, 140, 62);
        doc.save(`Zenro_Receipt_${paymentId}.pdf`);
    } catch (e) { alert("Could not generate PDF."); }
  };

  const handlePay = (fee: FeeRecord) => {
    setPayingFeeId(fee.id);
    const options = {
        key: RAZORPAY_KEY_ID, 
        amount: fee.amount * 100, 
        currency: "INR", 
        name: "Zenro Institute",
        description: `Payment for ${fee.title}`,
        handler: async function (response: any) {
            try {
                await supabase.from('payments').insert({ fee_id: fee.id, razorpay_payment_id: response.razorpay_payment_id, amount: fee.amount });
                await supabase.from('fees').update({ status: 'PAID' }).eq('id', fee.id);
                alert(`Payment Successful! ID: ${response.razorpay_payment_id}`);
                fetchFees();
            } catch (err: any) { alert("Payment Error"); } finally { setPayingFeeId(null); }
        },
        theme: { color: "#E60012" }
    };
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  const phase1Fees = fees.filter(f => f.phase === 1);
  const phase2Fees = fees.filter(f => f.phase === 2);
  const calculateTotal = (fList: FeeRecord[]) => fList.reduce((acc, curr) => acc + curr.amount, 0);

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-12 h-12 text-zenro-red animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-heading font-bold text-zenro-slate flex items-center gap-3">
        <CreditCard className="w-8 h-8 text-zenro-red" /> Tuition & Fees
      </h1>
      
      {[ { title: 'Phase 1: Domestic Training', list: phase1Fees }, { title: 'Phase 2: Placement', list: phase2Fees } ].map((phase, idx) => (
      <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <div>
                <h2 className="text-xl font-bold text-zenro-slate">{phase.title}</h2>
                <p className="text-sm text-gray-500">Total Due: ¥{calculateTotal(phase.list.filter(f => f.status !== 'PAID')).toLocaleString()}</p>
            </div>
        </div>
        <div className="divide-y divide-gray-100">
            {phase.list.length === 0 && <div className="p-6 text-center text-gray-500">No fees assigned.</div>}
            {phase.list.map(fee => (
                <div key={fee.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${fee.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {fee.status === 'PAID' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className="text-zenro-slate font-medium">{fee.title}</p>
                            <p className="text-xs text-gray-500">Due: {fee.dueDate}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                            <p className="text-zenro-slate font-mono font-bold">¥{fee.amount.toLocaleString()}</p>
                            <StatusBadge status={fee.status} />
                        </div>
                        
                        {fee.status !== 'PAID' ? (
                            <button onClick={() => handlePay(fee)} disabled={payingFeeId === fee.id} className="bg-zenro-red hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm disabled:opacity-50 flex items-center gap-2 transition">
                                {payingFeeId === fee.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />} Pay Now
                            </button>
                        ) : (
                            <button onClick={() => generateReceipt(fee, `TXN-${fee.id.substring(0,8)}`)} className="bg-white hover:bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-bold text-sm border border-gray-300 flex items-center gap-2 shadow-sm">
                                <Download className="w-4 h-4" /> Receipt
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </div>
      ))}
    </div>
  );
};

export const StudentTestsPage = () => {
    const navigate = useNavigate();
    const [activeTests, setActiveTests] = useState<any[]>([]);
    const [pastSubmissions, setPastSubmissions] = useState<any[]>([]);
    const [tab, setTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
    const [loading, setLoading] = useState(true);
    const userData = localStorage.getItem('zenro_session');
    const user: User | null = userData ? JSON.parse(userData) : null;

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Get History
                const { data: subs } = await supabase
                    .from('submissions')
                    .select(`id, score, total_score, completed_at, test_id, tests (title, duration_minutes)`)
                    .eq('status', 'COMPLETED')
                    .eq('student_id', user.id)
                    .order('completed_at', { ascending: false });
                
                if(subs) setPastSubmissions(subs);

                // 2. Get Assigned Tests (Direct & Batch)
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
                        const submittedTestIds = new Set(subs?.map((s:any) => s.test_id) || []);
                        
                        // LOGIC: Show if NOT taken OR (Taken AND AllowMultipleAttempts)
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
        fetchData();
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
                    <div className="p-12 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                        <div className="flex justify-center mb-4"><FileCheck className="w-12 h-12 text-gray-400" /></div>
                        <h3 className="text-xl font-bold text-gray-600 mb-2">No Active Assessments</h3>
                        <p className="text-gray-500">You have completed all pending tests or none are assigned.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeTests.map((test, idx) => (
                            <div key={test.id || idx} className="bg-white rounded-xl p-6 flex flex-col relative overflow-hidden group border border-gray-200 shadow-sm hover:shadow-md transition">
                                <div className="absolute top-0 right-0 p-3">
                                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-[10px] font-bold border border-red-200 animate-pulse">ACTIVE</span>
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
                    <table className="w-full text-left text-sm text-gray-500">
                         <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-xs border-b border-gray-200">
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
                                    <td className="px-6 py-4">{new Date(sub.completed_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`font-bold px-2 py-1 rounded ${sub.score > (sub.total_score * 0.4) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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

export const StudentActivityPage = () => {
     return (
        <div className="space-y-8 animate-fade-in">
             <h1 className="text-3xl font-heading font-bold text-zenro-slate flex items-center gap-3">
                <ListTodo className="w-8 h-8 text-zenro-red" /> Practice & Assignments
            </h1>
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <div className="divide-y divide-gray-100">
                    {MOCK_ACTIVITIES.map(act => (
                        <div key={act.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg ${act.type === 'ASSIGNMENT' ? 'bg-blue-100 text-blue-600' : act.type === 'QUIZ' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                                    {act.type === 'ASSIGNMENT' ? <FileText className="w-6 h-6" /> : act.type === 'QUIZ' ? <AlertCircle className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-zenro-slate">{act.title}</h3>
                                    <div className="flex gap-3 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {act.courseName}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {act.dueDate}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <StatusBadge status={act.status} />
                                <button className="bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold border border-gray-300 transition">
                                    {act.status === 'COMPLETED' ? 'Review' : 'Start'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
     );
};

export const StudentProfilePage = ({ user }: { user: User }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="relative h-48 bg-gradient-to-r from-zenro-blue to-slate-800 rounded-xl overflow-hidden shadow-md">
                 <div className="absolute bottom-4 right-4 flex gap-2">
                     <span className="bg-white/20 backdrop-blur px-3 py-1 rounded text-xs text-white border border-white/30">
                         Batch: {user.batch || 'Unassigned'}
                     </span>
                 </div>
            </div>
            
            <div className="relative px-8 -mt-16 flex flex-col md:flex-row items-end gap-6">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 mb-2">
                    <h1 className="text-3xl font-heading font-bold text-zenro-slate">{user.name}</h1>
                    <p className="text-gray-500 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200 uppercase tracking-wider">{user.role}</span>
                        <span>•</span>
                        <span>ID: {user.rollNumber || user.id.slice(0, 8).toUpperCase()}</span>
                    </p>
                </div>
                <div className="mb-4 flex gap-3">
                    <button className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm border border-gray-300 transition shadow-sm">Edit Profile</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                     <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-bold text-zenro-slate mb-6 flex items-center gap-2 font-heading">
                            <UserIcon className="w-5 h-5 text-gray-400" /> Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Email</label><p className="text-slate-800 font-medium mt-1">{user.email}</p></div>
                            <div><label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Phone</label><p className="text-slate-800 font-medium mt-1">{user.phone || 'N/A'}</p></div>
                            <div><label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">ID</label><p className="text-slate-800 font-mono font-medium mt-1">{user.rollNumber || user.id.slice(0,8)}</p></div>
                            <div><label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Batch</label><p className="text-slate-800 font-medium mt-1">{user.batch || 'N/A'}</p></div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};
