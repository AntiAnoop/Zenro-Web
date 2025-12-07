
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

// --- RAZORPAY CONFIG ---
const RAZORPAY_KEY_ID = "rzp_test_RoNJfVaY3d336e"; 

// --- MOCK DATA FOR OTHER COMPONENTS ---
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
    PAID: 'bg-zenro-green/10 text-zenro-green border-zenro-green/30',
    SUCCESS: 'bg-zenro-green/10 text-zenro-green border-zenro-green/30',
    PENDING: 'bg-zenro-orange/10 text-zenro-orange border-zenro-orange/30',
    OVERDUE: 'bg-zenro-red/10 text-zenro-red border-zenro-red/30',
    FAILED: 'bg-zenro-red/10 text-zenro-red border-zenro-red/30',
    COMPLETED: 'bg-brand-500/20 text-brand-500 border-brand-500/30',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-500/20 text-gray-500'}`}>
      {status}
    </span>
  );
};

// --- PAGES ---

export const StudentDashboardHome = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header & Overview Stats with Japanese Theme */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-brand-900 via-zenro-red to-brand-800 rounded-2xl p-8 border border-white/10 relative overflow-hidden flex flex-col justify-center shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-20 -translate-y-20"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-2 font-serif">Konnichiwa, Alex-san! <span className="text-xl font-normal ml-2 opacity-80"> (こんにちは)</span></h2>
            <p className="text-white/80 mb-6 font-light">Your JLPT N4 exam is in <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded">45 days</span>. Keep pushing! 頑張ってください!</p>
            <div className="flex gap-3">
              <button className="bg-white text-zenro-red font-bold px-6 py-2 rounded-lg hover:bg-gray-50 transition shadow-lg flex items-center gap-2">
                <Play className="w-4 h-4 fill-current" /> Continue Learning
              </button>
            </div>
          </div>
          {/* Decorative globe abstract */}
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
             <Globe className="w-64 h-64 text-white" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Attendance</p>
              <h3 className="text-4xl font-black text-white mt-2 font-serif">88%</h3>
              <p className="text-xs text-gray-500 mt-1">Shusseki (出席)</p>
            </div>
            <div className="p-3 bg-zenro-green/20 rounded-lg border border-zenro-green/20">
              <Calendar className="w-6 h-6 text-zenro-green" />
            </div>
          </div>
          <div className="flex gap-1 mt-4">
             {ATTENDANCE_DATA.map((d, i) => (
               <div key={i} className={`h-1.5 flex-1 rounded-full ${d.present ? 'bg-zenro-green' : 'bg-dark-700'}`} title={d.day}></div>
             ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
             <div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Next Payment</p>
              <h3 className="text-4xl font-black text-zenro-orange mt-2 font-serif">¥35k</h3> 
              <p className="text-xs text-gray-500 mt-1">Due: Month 3</p>
            </div>
            <div className="p-3 bg-zenro-orange/20 rounded-lg border border-zenro-orange/20">
              <CreditCard className="w-6 h-6 text-zenro-orange" />
            </div>
          </div>
          <button className="text-xs text-zenro-orange hover:text-white mt-2 text-left font-bold flex items-center gap-1 transition">
              View Details <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. Hero Section - Styled like a Japanese Scroll/Poster */}
      <div className="relative rounded-2xl overflow-hidden bg-dark-800 border border-dark-700 group shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1528360983277-13d9012356ee?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center opacity-30 group-hover:opacity-20 transition duration-700"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/80 to-transparent"></div>
        
        <div className="relative z-10 p-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zenro-red text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-zenro-red/30 border border-white/10">
                <Play className="w-3 h-3 fill-current" /> Continue JLPT N4
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white leading-tight font-serif">Grammar: The Causative Form</h1>
                <h2 className="text-2xl text-gray-300 font-light mt-1">使役形 (Shieki-kei)</h2>
              </div>
              <p className="text-gray-400 font-light">Resume from 12:05 • Lesson 4 of 12 • Tanaka Sensei</p>
              <div className="w-full max-w-md bg-white/5 rounded-full h-1.5 backdrop-blur border border-white/5">
                  <div style={{width: '45%'}} className="bg-gradient-to-r from-zenro-red to-zenro-orange h-1.5 rounded-full shadow-[0_0_10px_rgba(188,0,45,0.5)]"></div>
              </div>
           </div>
           
           <button className="bg-white/10 backdrop-blur hover:bg-white text-white hover:text-dark-900 border border-white/20 px-8 py-3 rounded-xl font-bold flex items-center gap-3 transition shadow-xl group/btn">
              <Play className="w-5 h-5 fill-current text-zenro-red" /> 
              <span>Resume Lesson</span>
           </button>
        </div>
      </div>

      {/* 3. Daily Kanji & Activities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Kanji of the Day */}
          <div className="glass-card rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 text-9xl text-white/5 font-serif select-none pointer-events-none group-hover:scale-110 transition duration-700">夢</div>
              <h3 className="text-zenro-orange text-[10px] font-bold uppercase tracking-widest mb-4 border border-zenro-orange/30 px-2 py-1 rounded">Kanji of the Day</h3>
              <div className="text-6xl font-black text-white mb-2 font-serif">夢</div>
              <p className="text-2xl text-zenro-red mb-1 font-medium">Yume</p>
              <p className="text-gray-400">Dream</p>
              <div className="mt-4 text-sm text-gray-400 bg-dark-900/50 p-3 rounded w-full border border-white/5">
                  Ex: 将来の夢 (Future dream)
              </div>
          </div>

          {/* Activities List */}
          <div className="md:col-span-2 glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 font-serif">
                    <ListTodo className="w-5 h-5 text-zenro-red" /> Pending Tasks
                </h3>
            </div>
            <div className="space-y-3">
                {MOCK_ACTIVITIES.filter(a => a.status === 'PENDING').slice(0, 3).map(act => (
                    <div key={act.id} className="flex items-center justify-between p-4 bg-dark-900/40 rounded-xl border-l-4 border-zenro-red hover:bg-dark-900/60 transition group">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${act.type === 'ASSIGNMENT' ? 'bg-zenro-red/10 text-zenro-red' : 'bg-blue-500/10 text-blue-500'}`}>
                                {act.type === 'ASSIGNMENT' ? <FileText className="w-4 h-4" /> : <Languages className="w-4 h-4" />}
                            </div>
                            <div>
                                <p className="text-white font-medium group-hover:text-zenro-red transition">{act.title}</p>
                                <p className="text-xs text-gray-500">{act.courseName} • Due {act.dueDate}</p>
                            </div>
                        </div>
                        <button className="text-xs bg-dark-800 hover:bg-white hover:text-dark-900 text-gray-300 px-4 py-2 rounded-lg border border-dark-600 transition font-bold">Start</button>
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
  
  // Real Data State
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveCourse, setLiveCourse] = useState<Course | null>(null);

  // User context from Session Storage
  const userData = localStorage.getItem('zenro_session');
  const user: User = userData ? JSON.parse(userData) : null;

  const fetchMyCourses = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // ROBUST QUERY:
            // 1. Get Courses assigned to my Batch (course_batches)
            const { data: batchCourses } = await supabase
                .from('course_batches')
                .select('course_id')
                .eq('batch_name', user.batch); 

            // 2. Get Courses assigned to me directly (course_enrollments)
            const { data: directCourses } = await supabase
                .from('course_enrollments')
                .select('course_id')
                .eq('student_id', user.id);

            // Combine IDs
            const courseIds = new Set<string>();
            if (batchCourses) batchCourses.forEach((c: any) => courseIds.add(c.course_id));
            if (directCourses) directCourses.forEach((c: any) => courseIds.add(c.course_id));

            if (courseIds.size > 0) {
                // 3. Fetch full course details
                const { data: courseDetails } = await supabase
                    .from('courses')
                    .select('*')
                    .in('id', Array.from(courseIds))
                    .eq('status', 'PUBLISHED'); // Only show published
                
                if (courseDetails) {
                    // Map to UI model
                    const mapped: Course[] = courseDetails.map((c: any) => ({
                        id: c.id,
                        title: c.title,
                        description: c.description,
                        instructor: c.instructor_name || 'Tanaka Sensei',
                        progress: 0, // In real app, join 'course_enrollments' to get progress
                        thumbnail: c.thumbnail,
                        totalDuration: '10h 30m', 
                        level: c.level,
                        status: c.status
                    }));
                    setCourses(mapped);

                    // Check for live match
                    const foundLive = mapped.find(c => c.title.includes(topic) || (isLive && c.id === 'c1')); 
                    if (foundLive && isLive) setLiveCourse(foundLive);
                }
            } else {
                setCourses([]);
            }

        } catch (e) {
            console.error("Course fetch error:", e);
        } finally {
            setLoading(false);
        }
    };

  useEffect(() => {
    fetchMyCourses();

    // REAL-TIME UPDATES: Subscribe to changes in relevant tables
    // This makes sure if an admin adds a course, it shows up instantly.
    const courseSub = supabase
        .channel('public:courses')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
            console.log("Course updated/added, refreshing...");
            fetchMyCourses();
        })
        .subscribe();

    const batchSub = supabase
        .channel('public:course_batches')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'course_batches' }, () => {
            console.log("Batch assignment updated, refreshing...");
            fetchMyCourses();
        })
        .subscribe();

    return () => {
        supabase.removeChannel(courseSub);
        supabase.removeChannel(batchSub);
    };
  }, [user?.id, user?.batch]);

  if (loading) {
      return (
          <div className="h-full flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-fade-in">
        <h1 className="text-3xl font-black text-white flex items-center gap-3 font-serif">
            <BookOpen className="w-8 h-8 text-zenro-red" /> My Curriculum
        </h1>

        {/* Live Class Hero */}
        {liveCourse && (
            <div className="bg-gradient-to-r from-zenro-red to-brand-900 rounded-2xl p-[1px] shadow-2xl shadow-zenro-red/20">
                <div className="bg-dark-900 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative w-full md:w-64 aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(188,0,45,0.3)]">
                        <img src={liveCourse.thumbnail} alt="Live" className="w-full h-full object-cover opacity-70" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-sm shadow-lg ${isLive ? 'bg-zenro-red text-white animate-pulse' : 'bg-gray-600 text-gray-200'}`}>
                                <span className={`w-2 h-2 bg-white rounded-full ${isLive ? 'animate-pulse' : ''}`}></span> {isLive ? 'LIVE NOW' : 'WAITING ROOM'}
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-bold text-white mb-1">{topic}</h2>
                        <p className="text-gray-400 mb-4 font-medium text-sm uppercase tracking-wide">Instructor: {liveCourse.instructor}</p>
                        <button 
                            onClick={() => navigate('/student/live')}
                            className="bg-zenro-red hover:bg-brand-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto md:mx-0 transition shadow-lg shadow-zenro-red/20"
                        >
                            <Video className="w-5 h-5" /> Join Classroom
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.length === 0 ? (
               <div className="col-span-3 p-12 text-center text-gray-500 border-2 border-dashed border-dark-700 rounded-xl bg-dark-800/50">
                   No courses assigned to your batch ({user?.batch}) yet. Please contact admin.
               </div>
          ) : (
            courses.map(course => (
                <div 
                    key={course.id} 
                    onClick={() => !course.isLocked && navigate(`/student/course/${course.id}`)}
                    className={`bg-dark-800 rounded-xl overflow-hidden border ${course.isLive ? 'border-zenro-red ring-1 ring-zenro-red/50' : 'border-dark-700'} hover:border-zenro-red/50 transition group shadow-lg cursor-pointer flex flex-col hover:-translate-y-1 duration-300`}
                >
                <div className="relative aspect-video overflow-hidden bg-black">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700 opacity-80 group-hover:opacity-100" />
                    {course.isLocked && (
                        <div className="absolute inset-0 bg-dark-900/80 flex flex-col items-center justify-center backdrop-blur-[2px]">
                            <Lock className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Locked</span>
                        </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] text-white border border-white/10 uppercase font-bold tracking-wider">
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
                <div className="p-5 flex-1 flex flex-col bg-gradient-to-b from-dark-800 to-dark-900">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-white truncate flex-1 text-lg group-hover:text-zenro-red transition font-serif" title={course.title}>{course.title}</h4>
                    </div>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2 font-light">{course.description}</p>
                    
                    <div className="mt-auto pt-4 border-t border-dark-700 flex justify-between items-center text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> {course.instructor}</span>
                        <span className="flex items-center gap-1 text-zenro-orange"><Clock className="w-3 h-3" /> 12 Lessons</span>
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
                // 1. Fetch Course Info
                const { data: courseData } = await supabase.from('courses').select('*').eq('id', courseId).single();
                if(courseData) setCourse(courseData);

                // 2. Fetch Modules & Materials
                const { data: modulesData } = await supabase
                    .from('course_modules')
                    .select('*, course_materials(*)')
                    .eq('course_id', courseId)
                    .order('order');
                
                if(modulesData) {
                    setModules(modulesData);
                    // Set first video/material as active
                    if(modulesData.length > 0 && modulesData[0].course_materials.length > 0) {
                        setActiveMaterial(modulesData[0].course_materials[0]);
                    }
                }
            } catch(e) {
                console.error("Content fetch failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [courseId]);

    if(loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-12 h-12 text-brand-500 animate-spin" /></div>;
    if(!course) return <div>Course not found</div>;

    return (
        <div className="fixed inset-0 z-50 bg-dark-900 flex flex-col text-white">
            {/* Header */}
            <div className="h-16 border-b border-dark-700 bg-dark-800 flex items-center justify-between px-4 shadow-lg z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/student/courses')} className="p-2 hover:bg-dark-700 rounded-full transition text-gray-400 hover:text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="font-bold text-lg hidden md:block">{course.title}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-400 hidden md:block">Progress: 0%</div>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-dark-700 rounded-lg lg:hidden">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content (Video/PDF) */}
                <div className="flex-1 bg-black relative flex items-center justify-center overflow-y-auto">
                    {activeMaterial ? (
                        activeMaterial.type === 'VIDEO' ? (
                            // Use native video for demo, iframe for YT if needed
                            <div className="w-full h-full max-w-5xl mx-auto flex flex-col p-4">
                                <div className="aspect-video bg-black rounded-xl overflow-hidden border border-dark-700 shadow-2xl relative group">
                                    <video 
                                        src={activeMaterial.url} 
                                        controls 
                                        className="w-full h-full object-contain" 
                                        poster={course.thumbnail}
                                    />
                                </div>
                                <div className="mt-6">
                                    <h2 className="text-2xl font-bold">{activeMaterial.title}</h2>
                                    <p className="text-gray-400 mt-2 text-sm">Now Playing • Module Content</p>
                                </div>
                            </div>
                        ) : (
                            // PDF / Link View
                            <div className="w-full h-full flex flex-col p-8">
                                <div className="flex items-center justify-between mb-6 bg-dark-800 p-4 rounded-xl border border-dark-700">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-brand-500/20 rounded-lg text-brand-500">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">{activeMaterial.title}</h2>
                                            <p className="text-gray-400 text-sm">Course Material • {activeMaterial.type}</p>
                                        </div>
                                    </div>
                                    <a 
                                        href={activeMaterial.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg"
                                    >
                                        <Download className="w-4 h-4" /> Download/Open
                                    </a>
                                </div>
                                <div className="flex-1 bg-dark-800 rounded-xl border border-dark-700 flex items-center justify-center text-gray-500 flex-col">
                                    <File className="w-16 h-16 mb-4 opacity-50" />
                                    <p>Preview not available for this file type.</p>
                                    <p className="text-sm mt-2">Please download to view.</p>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="text-gray-500">Select a lesson to start</div>
                    )}
                </div>

                {/* Sidebar Playlist */}
                <div className={`${sidebarOpen ? 'w-80 translate-x-0' : 'w-0 translate-x-full lg:w-0'} bg-dark-800 border-l border-dark-700 transition-all duration-300 flex flex-col absolute right-0 top-0 bottom-0 z-10 lg:relative lg:translate-x-0`}>
                    <div className="p-4 border-b border-dark-700 font-bold text-white bg-dark-900/50">
                        Course Content
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {modules.map((mod, idx) => (
                            <div key={mod.id} className="border-b border-dark-700/50">
                                <div className="p-4 bg-dark-900/30 font-bold text-sm text-gray-300 flex justify-between items-center sticky top-0">
                                    <span>{idx + 1}. {mod.title}</span>
                                </div>
                                <div>
                                    {mod.course_materials.map((mat: any) => (
                                        <button
                                            key={mat.id}
                                            onClick={() => setActiveMaterial(mat)}
                                            className={`w-full text-left p-4 flex items-start gap-3 hover:bg-dark-700/50 transition border-l-4 ${
                                                activeMaterial?.id === mat.id 
                                                ? 'bg-brand-900/10 border-brand-500 text-white' 
                                                : 'border-transparent text-gray-400'
                                            }`}
                                        >
                                            <div className="mt-0.5">
                                                {mat.type === 'VIDEO' ? <Film className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                            </div>
                                            <div className="text-sm line-clamp-2">{mat.title}</div>
                                        </button>
                                    ))}
                                    {mod.course_materials.length === 0 && (
                                        <div className="p-4 text-xs text-gray-600 italic">No content uploaded</div>
                                    )}
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

    // Auto-join on mount or when going live
    useEffect(() => {
        if (isLive && !remoteStream) {
            joinSession();
        }
        
        // Retry logic: If connecting for more than 5s, retry
        const interval = setInterval(() => {
            if(isLive && connectionState === 'idle' && !remoteStream) {
                joinSession();
            }
        }, 5000);

        return () => {
            clearInterval(interval);
            leaveSession();
        };
    }, [isLive]); // Depend on isLive to re-trigger if status changes

    // Attach stream to video element
    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if(message.trim()) {
            sendMessage(user.name, message);
            setMessage("");
        }
    }

    if (!isLive) {
        // Waiting Room UI
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-8 animate-fade-in relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544967082-d9d3f661eb1d?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center blur-md opacity-20"></div>
                <div className="relative z-10 bg-dark-800/80 backdrop-blur-xl p-12 rounded-2xl border border-dark-600 shadow-2xl text-center max-w-xl w-full">
                    <div className="inline-block p-4 rounded-full bg-dark-900 border border-dark-700 mb-6 relative">
                         <div className="absolute top-0 right-0 w-3 h-3 bg-brand-500 rounded-full animate-ping"></div>
                         <Video className="w-12 h-12 text-brand-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">{topic !== "Waiting for class..." ? "Class Ended" : "Waiting for Class"}</h2>
                    <p className="text-brand-200 mb-8 font-medium">
                        {topic !== "Waiting for class..." ? "The live session has ended." : "Waiting for host to start the class..."}
                    </p>
                    
                    {topic === "Waiting for class..." && (
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-8">
                            <Users className="w-4 h-4" /> 
                            <span>{viewerCount} Students Waiting</span>
                        </div>
                    )}

                    <div className="flex flex-col gap-4 mt-8">
                        <button onClick={checkStatus} className="bg-brand-600/80 hover:bg-brand-600 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition">
                            <RefreshCw className="w-4 h-4" /> Refresh Status
                        </button>
                        <button onClick={() => navigate('/student/courses')} className="text-gray-500 hover:text-white text-sm underline">
                            Leave Waiting Room
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Live UI
    return (
        <div className="h-[calc(100vh-2rem)] flex gap-6 animate-fade-in relative">
             <div className="flex-1 flex flex-col space-y-4">
                 <div className="relative flex-1 bg-black rounded-xl border border-dark-700 overflow-hidden shadow-2xl group">
                      {remoteStream ? (
                          <video 
                             ref={remoteVideoRef} 
                             autoPlay 
                             playsInline 
                             className="w-full h-full object-cover fixed inset-0 z-10 bg-black" 
                          />
                      ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-black z-10">
                             <div className="text-center">
                                 <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
                                 <p className="text-white font-bold text-lg mb-2">Connecting to Classroom...</p>
                                 <p className="text-gray-400 text-sm"> establishing secure stream</p>
                                 {connectionState === 'failed' && (
                                     <button onClick={() => joinSession()} className="mt-4 bg-dark-800 px-4 py-2 rounded text-white text-sm border border-dark-600 hover:bg-dark-700">
                                         Retry Connection
                                     </button>
                                 )}
                             </div>
                          </div>
                      )}
                      
                      {/* Controls Overlay */}
                      <div className="absolute top-4 left-4 flex gap-2 z-20 pointer-events-none">
                           <div className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-2 shadow-lg">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> LIVE
                           </div>
                           <div className="bg-black/60 backdrop-blur text-white px-3 py-1 rounded text-xs flex items-center gap-2">
                                <Users className="w-3 h-3" /> {viewerCount}
                           </div>
                      </div>
                      
                      <div className="absolute bottom-4 right-4 z-40">
                          <button onClick={() => setIsChatOpen(!isChatOpen)} className="bg-dark-900/80 p-3 rounded-full text-white hover:bg-brand-600 transition shadow-lg border border-white/10">
                              <MessageCircle className="w-6 h-6" />
                          </button>
                      </div>
                 </div>
             </div>

             {/* Chat Sidebar - Floats on top (z-30) */}
             <div className={`w-96 bg-dark-900/90 backdrop-blur-md border-l border-white/10 flex flex-col overflow-hidden shadow-2xl fixed right-0 top-0 bottom-0 z-30 transition-transform duration-300 ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                 <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center pt-20">
                     <h3 className="font-bold text-white flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Live Chat</h3>
                     <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white"><ChevronRight className="w-5 h-5" /></button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-4 space-y-4">
                     {chatMessages.map((m, i) => (
                         <div key={i} className="animate-fade-in-up">
                             <div className="flex items-baseline justify-between mb-1">
                                 <span className={`text-xs font-bold ${m.user === "Tanaka Sensei" ? 'text-brand-500' : m.user === user.name ? 'text-blue-400' : m.user === "SYSTEM" ? 'text-accent-gold' : 'text-gray-300'}`}>
                                     {m.user}
                                 </span>
                                 <span className="text-[10px] text-gray-500">{m.timestamp}</span>
                             </div>
                             <p className={`text-sm rounded-lg p-2 ${m.user === "SYSTEM" ? 'bg-accent-gold/10 text-accent-gold text-xs italic' : 'bg-white/5 text-gray-200'}`}>
                                 {m.text}
                             </p>
                         </div>
                     ))}
                 </div>

                 <form onSubmit={handleSend} className="p-4 bg-black/20 border-t border-white/10">
                     <div className="relative">
                         <input 
                            type="text" 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ask a question..." 
                            className="w-full bg-white/5 border border-white/10 text-white pl-4 pr-10 py-3 rounded-xl focus:ring-1 focus:ring-brand-500 focus:outline-none placeholder-gray-500 text-sm"
                         />
                         <button type="submit" className="absolute right-2 top-2 p-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition">
                             <Send className="w-4 h-4" />
                         </button>
                     </div>
                 </form>
             </div>
             
             {/* Floating Leave Button (z-40) */}
             <button 
                onClick={() => navigate('/student/courses')} 
                className="fixed top-4 right-4 z-40 bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm backdrop-blur shadow-lg border border-red-500/30"
             >
                 Exit Class
             </button>
        </div>
    );
};

export const StudentFeesPage = ({ user }: { user: User }) => {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingFeeId, setPayingFeeId] = useState<string | null>(null);

  useEffect(() => {
    fetchFees();
  }, [user.id]);

  const fetchFees = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
            .from('fees')
            .select('*')
            .eq('student_id', user.id) // Filter strictly by logged-in user
            .order('due_date', { ascending: true });
        
        if (data) setFees(data);
      } catch (e) {
        console.error("Error fetching fees:", e);
      } finally {
        setLoading(false);
      }
  };

  const generateReceipt = (fee: FeeRecord, paymentId: string) => {
    try {
        const doc = new jsPDF();
        
        // Add Company Logo/Header Background
        doc.setFillColor(190, 18, 60); // Brand Red
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.text("ZENRO INSTITUTE", 20, 20);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Excellence in Japanese Language Training", 20, 28);
        doc.text("Tokyo | New Delhi", 20, 33);

        doc.setFontSize(16);
        doc.text("PAYMENT RECEIPT", 150, 25);
        
        // Receipt Details
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text(`Receipt No:`, 140, 55);
        doc.text(`Date:`, 140, 62);
        doc.text(`Student Name:`, 20, 55);
        doc.text(`Payment ID:`, 20, 62);

        doc.setFont("helvetica", "bold");
        doc.text(`#${paymentId.slice(-8).toUpperCase()}`, 170, 55);
        doc.text(`${new Date().toLocaleDateString()}`, 170, 62);
        doc.text(user.name, 50, 55);
        doc.text(paymentId, 50, 62);

        // Table Header
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(20, 75, 190, 75);
        
        doc.setFillColor(245, 245, 245);
        doc.rect(20, 75, 170, 10, 'F');
        
        doc.setFontSize(11);
        doc.text("Description", 25, 82);
        doc.text("Phase", 100, 82);
        doc.text("Amount (JPY)", 160, 82);
        
        // Table Row
        doc.setFont("helvetica", "normal");
        doc.text(fee.title, 25, 95);
        doc.text(`Phase ${fee.phase}`, 100, 95);
        doc.text(`¥${fee.amount.toLocaleString()}`, 160, 95);
        
        doc.line(20, 105, 190, 105);

        // Totals
        doc.setFont("helvetica", "bold");
        doc.text("Total Paid:", 120, 115);
        doc.setFontSize(14);
        doc.setTextColor(190, 18, 60);
        doc.text(`¥${fee.amount.toLocaleString()}`, 160, 115);

        // Footer
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text("Thank you for your payment. This is a computer-generated receipt.", 105, 140, { align: "center" });
        
        // Watermark
        doc.setTextColor(240, 240, 240);
        doc.setFontSize(60);
        doc.text("PAID", 105, 100, { align: "center", angle: 45 });

        doc.save(`Zenro_Receipt_${paymentId}.pdf`);
    } catch (e) {
        console.error("PDF Gen Error:", e);
        alert("Could not generate PDF. Please contact admin.");
    }
  };

  const handlePay = (fee: FeeRecord) => {
    setPayingFeeId(fee.id);

    const options = {
        key: RAZORPAY_KEY_ID, 
        amount: fee.amount * 100, // Amount in paise/yen cents (check currency)
        currency: "INR", // Using INR for test mode as RZP Japan might need special activation
        name: "Zenro Institute",
        description: `Payment for ${fee.title}`,
        image: "https://ui-avatars.com/api/?name=Zenro", // Logo
        handler: async function (response: any) {
            try {
                // 1. Verify and Record Payment in DB
                const { error: payError } = await supabase.from('payments').insert({
                    fee_id: fee.id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    amount: fee.amount,
                    payment_date: new Date().toISOString()
                });

                if (payError) throw payError;

                // 2. Update Fee Status
                const { error: feeError } = await supabase
                    .from('fees')
                    .update({ status: 'PAID' })
                    .eq('id', fee.id);
                
                if (feeError) throw feeError;

                // 3. Success UI
                alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
                
                // 4. Download Receipt
                if(confirm("Download Receipt now?")) {
                    generateReceipt(fee, response.razorpay_payment_id);
                }

                // 5. Refresh List
                fetchFees();

            } catch (err: any) {
                console.error("Payment Record Failed:", err);
                alert("Payment processed but failed to record. Contact support with ID: " + response.razorpay_payment_id);
            } finally {
                setPayingFeeId(null);
            }
        },
        prefill: {
            name: user.name, 
            email: user.email,
            contact: user.phone || "9999999999"
        },
        notes: {
            fee_id: fee.id
        },
        theme: {
            color: "#be123c"
        }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
    
    rzp.on('payment.failed', function (response: any){
        alert("Payment Failed: " + response.error.description);
        setPayingFeeId(null);
    });
  };

  const phase1Fees = fees.filter(f => f.phase === 1);
  const phase2Fees = fees.filter(f => f.phase === 2);
  const calculateTotal = (fList: FeeRecord[]) => fList.reduce((acc, curr) => acc + curr.amount, 0);

  if (loading) {
      return (
        <div className="h-full flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
        </div>
      );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-black text-white flex items-center gap-3 font-serif">
        <CreditCard className="w-8 h-8 text-zenro-red" /> Tuition & Fees
      </h1>
      
      {/* Phase 1 */}
      <div className="glass-card rounded-xl border border-dark-700 overflow-hidden shadow-lg">
        <div className="p-6 border-b border-dark-700 flex justify-between items-center bg-dark-900/50">
            <div>
                <h2 className="text-xl font-bold text-white">Phase 1: Domestic Training</h2>
                <p className="text-sm text-gray-400">Total Due: ¥{calculateTotal(phase1Fees.filter(f => f.status !== 'PAID')).toLocaleString()}</p>
            </div>
             <div className="px-3 py-1 bg-zenro-green/10 text-zenro-green rounded text-xs font-bold border border-zenro-green/20 uppercase tracking-widest">Active</div>
        </div>
        <div className="divide-y divide-dark-700">
            {phase1Fees.length === 0 && <div className="p-6 text-center text-gray-500">No Phase 1 fees found.</div>}
            {phase1Fees.map(fee => (
                <div key={fee.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-dark-700/30 transition">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${fee.status === 'PAID' ? 'bg-zenro-green/20 text-zenro-green' : fee.status === 'OVERDUE' ? 'bg-zenro-red/20 text-zenro-red' : 'bg-gray-500/20 text-gray-400'}`}>
                            {fee.status === 'PAID' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className="text-white font-medium">{fee.title}</p>
                            <p className="text-xs text-gray-500">Due: {fee.dueDate}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                            <p className="text-white font-mono font-bold">¥{fee.amount.toLocaleString()}</p>
                            <StatusBadge status={fee.status} />
                        </div>
                        
                        {fee.status !== 'PAID' ? (
                            <button 
                                onClick={() => handlePay(fee)}
                                disabled={payingFeeId === fee.id}
                                className="bg-zenro-red hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg disabled:opacity-50 flex items-center gap-2 transition"
                            >
                                {payingFeeId === fee.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                                Pay Now
                            </button>
                        ) : (
                            <button 
                                onClick={() => generateReceipt(fee, `PREV-TXN-${fee.id.substring(0,8).toUpperCase()}`)}
                                className="bg-dark-700 hover:bg-dark-600 text-gray-300 px-4 py-2 rounded-lg font-bold text-sm border border-dark-600 flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" /> Receipt
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </div>

       {/* Phase 2 */}
       <div className="glass-card rounded-xl border border-dark-700 overflow-hidden shadow-lg opacity-90">
        <div className="p-6 border-b border-dark-700 flex justify-between items-center bg-dark-900/50">
            <div>
                <h2 className="text-xl font-bold text-white">Phase 2: Placement & Visa</h2>
                <p className="text-sm text-gray-400">Total: ¥{calculateTotal(phase2Fees).toLocaleString()}</p>
            </div>
             <div className="px-3 py-1 bg-zenro-orange/10 text-zenro-orange rounded text-xs font-bold border border-zenro-orange/20 uppercase tracking-widest">Installments</div>
        </div>
        <div className="divide-y divide-dark-700">
             {phase2Fees.length === 0 && <div className="p-6 text-center text-gray-500">No Phase 2 fees assigned yet.</div>}
            {phase2Fees.map(fee => (
                <div key={fee.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-dark-700/30 transition">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${fee.status === 'PAID' ? 'bg-zenro-green/20 text-zenro-green' : 'bg-zenro-orange/20 text-zenro-orange'}`}>
                             {fee.status === 'PAID' ? <CheckCircle className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className="text-white font-medium">{fee.title}</p>
                            <p className="text-xs text-gray-500">Due: {fee.dueDate}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                            <p className="text-white font-mono font-bold">¥{fee.amount.toLocaleString()}</p>
                            <StatusBadge status={fee.status} />
                        </div>

                         {fee.status !== 'PAID' ? (
                            <button 
                                onClick={() => handlePay(fee)}
                                disabled={payingFeeId === fee.id}
                                className="bg-zenro-red hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg disabled:opacity-50 flex items-center gap-2 transition"
                            >
                                {payingFeeId === fee.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                                Pay Now
                            </button>
                        ) : (
                            <button 
                                onClick={() => generateReceipt(fee, `PREV-TXN-${fee.id.substring(0,8).toUpperCase()}`)}
                                className="bg-dark-700 hover:bg-dark-600 text-gray-300 px-4 py-2 rounded-lg font-bold text-sm border border-dark-600 flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" /> Receipt
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export const StudentTestsPage = () => {
    const navigate = useNavigate();
    const [activeTests, setActiveTests] = useState<any[]>([]);
    const [pastSubmissions, setPastSubmissions] = useState<any[]>([]);
    const [tab, setTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
    const [loading, setLoading] = useState(true);
    
    // Get logged in user
    const userData = localStorage.getItem('zenro_session');
    const user: User | null = userData ? JSON.parse(userData) : null;

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // FETCH SUBMISSIONS FIRST
                const { data: subs } = await supabase
                    .from('submissions')
                    .select(`id, score, total_score, completed_at, test_id, tests (title, duration_minutes)`)
                    .eq('status', 'COMPLETED')
                    .eq('student_id', user.id)
                    .order('completed_at', { ascending: false });
                
                const submittedTestIds = new Set(subs?.map((s:any) => s.test_id) || []);
                if(subs) setPastSubmissions(subs);

                // FETCH RELEVANT TESTS
                // Logic: 
                // 1. Get tests assigned to my Batch
                // 2. Get tests assigned to me directly
                // 3. Filter for active only
                // 4. Exclude tests already submitted (optional, usually you can't retake immediately)

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
                    
                    // Filter out already taken tests if needed, or show them with "Retake" option
                    // For now, let's show them but maybe mark as done visually or just list available ones
                    const available = (tests || []).filter((t:any) => !submittedTestIds.has(t.id));
                    setActiveTests(available);
                } else {
                    setActiveTests([]);
                }

            } catch (error) {
                console.error("Fetch tests error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.id, user?.batch]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
             <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-white flex items-center gap-3 font-serif">
                    <FileText className="w-8 h-8 text-zenro-red" /> Assessments
                </h1>
                <div className="bg-dark-800 p-1 rounded-lg flex border border-dark-700">
                    <button 
                        onClick={() => setTab('ACTIVE')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition ${tab === 'ACTIVE' ? 'bg-zenro-red text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Active Tests
                    </button>
                    <button 
                        onClick={() => setTab('HISTORY')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition ${tab === 'HISTORY' ? 'bg-zenro-red text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        History & Reports
                    </button>
                </div>
             </div>

            {tab === 'ACTIVE' ? (
                activeTests.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-dark-700 rounded-xl bg-dark-800/50">
                        <div className="flex justify-center mb-4">
                            <FileCheck className="w-12 h-12 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Active Assessments</h3>
                        <p className="text-gray-500">There are currently no active tests available for you. Please check back later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeTests.map((test, idx) => (
                            <div key={test.id || idx} className="glass-card rounded-xl p-6 flex flex-col relative overflow-hidden group hover:border-zenro-red/50 transition shadow-lg">
                                <div className="absolute top-0 right-0 p-3">
                                    <span className="bg-zenro-red/20 text-zenro-red px-2 py-1 rounded text-[10px] font-bold border border-zenro-red/30 animate-pulse">
                                        ACTIVE
                                    </span>
                                </div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-zenro-red/10 text-zenro-red rounded-lg">
                                        <Activity className="w-6 h-6" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">{test.title}</h3>
                                <p className="text-sm text-gray-400 mb-6">{test.duration_minutes} Minutes • Passing: {test.passing_score || 40}%</p>
                                
                                <div className="mt-auto">
                                <button 
                                    onClick={() => navigate(`/student/test/${test.id}`)}
                                    className="w-full py-3 bg-zenro-red hover:bg-brand-600 text-white font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-zenro-red/20"
                                >
                                    Start Test <ChevronRight className="w-4 h-4" />
                                </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                <div className="glass-card rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-400">
                         <thead className="bg-dark-900/50 text-gray-200 uppercase font-bold text-xs">
                           <tr>
                             <th className="px-6 py-4">Test Title</th>
                             <th className="px-6 py-4">Date Completed</th>
                             <th className="px-6 py-4">Score</th>
                             <th className="px-6 py-4 text-right">Action</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-dark-700">
                           {pastSubmissions.length === 0 ? (
                               <tr><td colSpan={4} className="p-8 text-center text-gray-500">No past attempts found.</td></tr>
                           ) : (
                               pastSubmissions.map((sub) => (
                                 <tr key={sub.id} className="hover:bg-dark-700/50 transition">
                                    <td className="px-6 py-4 font-bold text-white">{sub.tests?.title || 'Unknown Test'}</td>
                                    <td className="px-6 py-4">{new Date(sub.completed_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`font-bold ${sub.score > (sub.total_score * 0.4) ? 'text-zenro-green' : 'text-zenro-red'}`}>
                                            {sub.score} / {sub.total_score}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => navigate(`/student/report/${sub.id}`)}
                                            className="text-zenro-orange hover:text-white font-bold text-xs border border-zenro-orange/30 px-3 py-1 rounded hover:bg-zenro-orange transition"
                                        >
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
             <h1 className="text-3xl font-black text-white flex items-center gap-3 font-serif">
                <ListTodo className="w-8 h-8 text-zenro-red" /> Practice & Assignments
            </h1>

            <div className="glass-card rounded-xl overflow-hidden">
                <div className="divide-y divide-dark-700">
                    {MOCK_ACTIVITIES.map(act => (
                        <div key={act.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-dark-700/30 transition">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg ${act.type === 'ASSIGNMENT' ? 'bg-blue-500/10 text-blue-500' : act.type === 'QUIZ' ? 'bg-zenro-orange/10 text-zenro-orange' : 'bg-zenro-green/10 text-zenro-green'}`}>
                                    {act.type === 'ASSIGNMENT' ? <FileText className="w-6 h-6" /> : act.type === 'QUIZ' ? <AlertCircle className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{act.title}</h3>
                                    <div className="flex gap-3 text-sm text-gray-400 mt-1">
                                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {act.courseName}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {act.dueDate}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded text-xs font-bold border ${act.status === 'COMPLETED' ? 'bg-zenro-green/10 text-zenro-green border-zenro-green/20' : 'bg-zenro-orange/10 text-zenro-orange border-zenro-orange/20'}`}>
                                    {act.status}
                                </span>
                                <button className="bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition">
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
    const [testStats, setTestStats] = useState({ attempts: 0, avgScore: 0, passed: 0 });
    const [recentTests, setRecentTests] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            const { data } = await supabase
                .from('submissions')
                .select('score, total_score, status, completed_at, tests(title)')
                .eq('student_id', user.id) // Assuming user.id matches profile id
                .eq('status', 'COMPLETED');
            
            if (data && data.length > 0) {
                const total = data.length;
                const totalScorePct = data.reduce((acc, curr) => acc + (curr.score / curr.total_score), 0);
                const passedCount = data.filter(d => (d.score / d.total_score) > 0.4).length; // assuming 40% pass

                setTestStats({
                    attempts: total,
                    avgScore: Math.round((totalScorePct / total) * 100),
                    passed: passedCount
                });
                setRecentTests(data.slice(0, 3));
            }
        };
        // Only fetch if it's a real user ID (not mock 's1') or if you have real data for 's1'
        // For this demo, let's try fetching anyway
        fetchStats();
    }, [user.id]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="relative h-48 bg-gradient-to-r from-zenro-red to-dark-800 rounded-xl overflow-hidden border border-white/10">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/seigaiha.png')] opacity-30"></div>
                 <div className="absolute bottom-4 right-4 flex gap-2">
                     <span className="bg-black/50 backdrop-blur px-3 py-1 rounded text-xs text-white border border-white/20">
                         Batch: {user.batch || 'Unassigned'}
                     </span>
                 </div>
            </div>
            
            <div className="relative px-8 -mt-16 flex flex-col md:flex-row items-end gap-6">
                <div className="w-32 h-32 rounded-full border-4 border-dark-900 overflow-hidden shadow-2xl bg-dark-800">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 mb-2">
                    <h1 className="text-3xl font-black text-white font-serif">{user.name}</h1>
                    <p className="text-gray-400 flex items-center gap-2">
                        <span className="bg-zenro-red/20 text-zenro-red px-2 py-0.5 rounded text-[10px] font-bold border border-zenro-red/30 uppercase tracking-wider">{user.role}</span>
                        <span>•</span>
                        <span>ID: {user.rollNumber || user.id.slice(0, 8).toUpperCase()}</span>
                    </p>
                </div>
                <div className="mb-4 flex gap-3">
                    <button className="bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded-lg font-bold text-sm border border-dark-600 transition">Edit Profile</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                     <div className="glass-card rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-serif">
                            <UserIcon className="w-5 h-5 text-gray-400" /> Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Email Address</label>
                                <p className="text-white font-medium mt-1">{user.email}</p>
                            </div>
                             <div>
                                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Phone Number</label>
                                <p className="text-white font-medium mt-1">{user.phone || 'N/A'}</p>
                            </div>
                             <div>
                                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Student ID</label>
                                <p className="text-white font-mono font-medium mt-1">{user.rollNumber || user.id.toUpperCase()}</p>
                            </div>
                             <div>
                                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Enrolled Batch</label>
                                <p className="text-white font-medium mt-1">{user.batch || 'N/A'}</p>
                            </div>
                        </div>
                     </div>

                     <div className="glass-card rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-serif">
                            <Activity className="w-5 h-5 text-gray-400" /> Academic Performance
                        </h3>
                        
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-dark-900/50 p-4 rounded-lg text-center border border-white/5">
                                <div className="text-2xl font-black text-white">{testStats.attempts}</div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold">Tests Taken</div>
                            </div>
                            <div className="bg-dark-900/50 p-4 rounded-lg text-center border border-white/5">
                                <div className="text-2xl font-black text-zenro-red">{testStats.avgScore}%</div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold">Avg Score</div>
                            </div>
                            <div className="bg-dark-900/50 p-4 rounded-lg text-center border border-white/5">
                                <div className="text-2xl font-black text-zenro-green">{testStats.passed}</div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold">Tests Passed</div>
                            </div>
                        </div>

                        <h4 className="text-sm font-bold text-gray-400 mb-3">Recent Results</h4>
                        <div className="space-y-2">
                            {recentTests.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No test history found.</p>
                            ) : (
                                recentTests.map((t, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-dark-900/50 rounded border border-dark-700">
                                        <span className="text-white text-sm font-medium">{t.tests?.title}</span>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-gray-500">{new Date(t.completed_at).toLocaleDateString()}</span>
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${t.score/t.total_score > 0.4 ? 'bg-zenro-green/20 text-zenro-green' : 'bg-zenro-red/20 text-zenro-red'}`}>
                                                {t.score}/{t.total_score}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                     </div>
                </div>

                <div className="space-y-6">
                     <div className="glass-card rounded-xl p-6">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-4 tracking-widest">Certificates</h3>
                        <div className="space-y-3">
                             <div className="flex items-center gap-3 p-3 bg-dark-900/50 rounded border border-dark-600 hover:border-zenro-red transition cursor-pointer group">
                                 <GraduationCap className="w-5 h-5 text-gray-500 group-hover:text-zenro-red" />
                                 <span className="text-sm text-gray-300">JLPT N5 Certificate</span>
                             </div>
                             <div className="flex items-center gap-3 p-3 bg-dark-900/50 rounded border border-dark-600 hover:border-zenro-red transition cursor-pointer group">
                                 <GraduationCap className="w-5 h-5 text-gray-500 group-hover:text-zenro-red" />
                                 <span className="text-sm text-gray-300">Course Completion</span>
                             </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};
