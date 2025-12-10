
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Clock, Calendar, AlertCircle, CheckCircle, 
  CreditCard, Download, User as UserIcon, MapPin, 
  Phone, Mail, Shield, BookOpen, ChevronRight, Lock,
  Video, BarChart2, ListTodo, FileText, Activity, Briefcase,
  Languages, GraduationCap, Globe, Zap, MessageCircle, Send, Users, Mic, MicOff, Hand, RefreshCw, Loader2,
  FileCheck, ArrowLeft, Menu, File, Film, AlertTriangle, Monitor, WifiOff, Upload, CheckSquare, X, Eye, ChevronDown,
  Camera, Edit2, Trash2
} from 'lucide-react';
import { User, Course, FeeRecord, Transaction, TestResult, ActivityItem, CourseModule, CourseMaterial, Schedule, Assignment, AssignmentSubmission, Test } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useLiveSession } from '../context/LiveContext';
import { supabase } from '../services/supabaseClient';
import { jsPDF } from "jspdf";

const RAZORPAY_KEY_ID = "rzp_test_RoNJfVaY3d336e"; 

// --- MOCK DATA ---
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
    SUBMITTED: 'bg-blue-100 text-blue-700 border-blue-200',
    GRADED: 'bg-purple-100 text-purple-700 border-purple-200',
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
              <Link to="/student/courses" className="bg-zenro-red text-white font-bold px-6 py-2 rounded-lg hover:bg-red-700 transition shadow-md flex items-center gap-2">
                <Play className="w-4 h-4 fill-current" /> Continue Learning
              </Link>
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
          <Link to="/student/fees" className="text-xs text-zenro-red hover:text-red-800 mt-2 text-left font-bold flex items-center gap-1 transition">
              View Details <ChevronRight className="w-3 h-3" />
          </Link>
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

          {/* Activities List Placeholder - Now linked to actual page */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
             <ListTodo className="w-16 h-16 text-gray-300 mb-4" />
             <h3 className="text-lg font-bold text-slate-800">Check Assignments</h3>
             <p className="text-sm text-gray-500 mb-4">View pending homework and tasks in the Activities tab.</p>
             <Link to="/student/activities" className="text-zenro-red font-bold text-sm hover:underline">Go to Activities</Link>
          </div>
      </div>
    </div>
  );
};

export const StudentActivityPage = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Map<string, AssignmentSubmission>>(new Map());
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [submissionForm, setSubmissionForm] = useState({ text: '', url: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userData = localStorage.getItem('zenro_session');
    const user: User = userData ? JSON.parse(userData) : null;

    useEffect(() => {
        const fetchAssignments = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // 1. Fetch Assignments for Batch
                const { data: batchAssigns } = await supabase.from('assignment_batches').select('assignment_id').eq('batch_name', user.batch);
                const batchIds = batchAssigns?.map((a: any) => a.assignment_id) || [];

                // 2. Fetch Assignments for Individual Student
                const { data: directAssigns } = await supabase.from('assignment_enrollments').select('assignment_id').eq('student_id', user.id);
                const directIds = directAssigns?.map((a: any) => a.assignment_id) || [];

                // Combine IDs
                const allIds = Array.from(new Set([...batchIds, ...directIds]));
                
                if (allIds.length > 0) {
                    const { data: assignData } = await supabase.from('assignments').select('*').in('id', allIds).eq('status', 'PUBLISHED').order('due_date', { ascending: true });
                    setAssignments(assignData || []);

                    // 3. Fetch My Submissions
                    const { data: subData } = await supabase.from('assignment_submissions').select('*').eq('student_id', user.id).in('assignment_id', allIds);
                    const subMap = new Map();
                    subData?.forEach((s: any) => subMap.set(s.assignment_id, s));
                    setSubmissions(subMap);
                }
            } catch (e) { console.error(e); } 
            finally { setLoading(false); }
        };
        fetchAssignments();
    }, [user?.id, user?.batch]);

    const handleSubmit = async () => {
        if (!selectedAssignment || !user) return;
        if (!submissionForm.text && !submissionForm.url) return alert("Please add some text or a link.");
        
        setIsSubmitting(true);
        try {
            const payload = {
                assignment_id: selectedAssignment.id,
                student_id: user.id,
                submission_text: submissionForm.text,
                submission_url: submissionForm.url,
                status: 'SUBMITTED',
                submitted_at: new Date().toISOString()
            };

            const { data, error } = await supabase.from('assignment_submissions').insert(payload).select().single();
            if (error) throw error;

            setSubmissions(prev => new Map(prev).set(selectedAssignment.id, data));
            setSelectedAssignment(null);
            alert("Assignment Submitted Successfully!");
        } catch (e: any) {
            console.error(e);
            alert("Submission failed: " + e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-12 h-12 text-zenro-red animate-spin" /></div>;

    return (
        <div className="space-y-8 animate-fade-in">
             <h1 className="text-3xl font-heading font-bold text-zenro-slate flex items-center gap-3"><ListTodo className="w-8 h-8 text-zenro-red" /> Practice & Activities</h1>
             
             {assignments.length === 0 ? (
                 <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
                     <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                     <h3 className="text-lg font-bold text-gray-500">No pending assignments.</h3>
                     <p className="text-sm text-gray-400">Great job staying up to date!</p>
                 </div>
             ) : (
                 <div className="grid grid-cols-1 gap-4">
                     {assignments.map(assign => {
                         const sub = submissions.get(assign.id);
                         const isLate = !sub && new Date(assign.due_date) < new Date();
                         
                         return (
                             <div key={assign.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                 <div className="flex items-start gap-4">
                                     <div className={`p-3 rounded-lg ${sub ? 'bg-green-50 text-green-600' : isLate ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                         {sub ? <CheckCircle className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
                                     </div>
                                     <div>
                                         <h4 className="font-bold text-slate-800 text-lg">{assign.title}</h4>
                                         <p className="text-sm text-gray-500 mb-1 line-clamp-1">{assign.description}</p>
                                         <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                                             <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Due: {new Date(assign.due_date).toLocaleDateString()}</span>
                                             <span>Max Marks: {assign.total_marks}</span>
                                         </div>
                                     </div>
                                 </div>
                                 
                                 <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                                     {sub ? (
                                         <div className="text-right">
                                             <StatusBadge status={sub.status} />
                                             {sub.status === 'GRADED' && <p className="text-sm font-bold text-green-600 mt-1">Score: {sub.obtained_marks}/{assign.total_marks}</p>}
                                         </div>
                                     ) : (
                                         <button 
                                            onClick={() => { setSelectedAssignment(assign); setSubmissionForm({ text: '', url: '' }); }}
                                            className="bg-zenro-red text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-red-700 transition w-full md:w-auto"
                                         >
                                             Submit Now
                                         </button>
                                     )}
                                 </div>
                             </div>
                         );
                     })}
                 </div>
             )}

             {/* Submission Modal */}
             {selectedAssignment && (
                 <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                     <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6">
                         <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                             <div>
                                 <h2 className="text-xl font-bold text-slate-800">{selectedAssignment.title}</h2>
                                 <p className="text-sm text-gray-500">Submit your work</p>
                             </div>
                             <button onClick={() => setSelectedAssignment(null)}><X className="w-6 h-6 text-gray-400" /></button>
                         </div>
                         
                         <div className="space-y-4 mb-6">
                             <div className="bg-gray-50 p-4 rounded-lg text-sm text-slate-700 leading-relaxed border border-gray-200">
                                 <p className="font-bold mb-2">Instructions:</p>
                                 {selectedAssignment.description}
                                 {selectedAssignment.attachment_url && (
                                     <a href={selectedAssignment.attachment_url} target="_blank" rel="noreferrer" className="block mt-3 text-zenro-blue font-bold underline flex items-center gap-1">
                                         <Download className="w-4 h-4" /> Download Reference Material
                                     </a>
                                 )}
                             </div>

                             <div>
                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Your Answer (Text)</label>
                                 <textarea 
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-zenro-blue outline-none h-32 resize-none"
                                    placeholder="Type your answer here..."
                                    value={submissionForm.text}
                                    onChange={e => setSubmissionForm({...submissionForm, text: e.target.value})}
                                 />
                             </div>
                             
                             <div>
                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Or Attach File URL (Google Drive/Dropbox)</label>
                                 <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-2 bg-white">
                                     <Upload className="w-4 h-4 text-gray-400" />
                                     <input 
                                        type="text" 
                                        className="flex-1 outline-none text-sm" 
                                        placeholder="https://..."
                                        value={submissionForm.url}
                                        onChange={e => setSubmissionForm({...submissionForm, url: e.target.value})}
                                     />
                                 </div>
                             </div>
                         </div>

                         <div className="flex gap-3">
                             <button onClick={() => setSelectedAssignment(null)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-lg transition">Cancel</button>
                             <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 py-3 bg-zenro-blue text-white font-bold rounded-lg hover:bg-blue-800 transition shadow-md disabled:opacity-50">
                                 {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                             </button>
                         </div>
                     </div>
                 </div>
             )}
        </div>
    );
};

export const StudentCoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
      if (data) setCourses(data);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
       <div className="flex justify-between items-center">
         <h1 className="text-3xl font-heading font-bold text-zenro-slate">My Curriculum</h1>
       </div>

       {loading ? <div className="text-center p-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-zenro-red" /></div> : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
               <Link to={`/student/course/${course.id}`} key={course.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="h-40 bg-gray-200 relative">
                     <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                     <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded font-bold backdrop-blur-sm">
                        {course.level || 'Beginner'}
                     </div>
                  </div>
                  <div className="p-6">
                     <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-zenro-red transition-colors">{course.title}</h3>
                     <p className="text-gray-500 text-sm mb-4 line-clamp-2">{course.description}</p>
                     
                     <div className="flex items-center justify-between mt-auto">
                        <div className="text-xs text-gray-400 font-bold flex items-center gap-1">
                           <UserIcon className="w-3 h-3" /> {course.instructor}
                        </div>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                           <div className="h-full bg-zenro-blue" style={{ width: `${course.progress || 0}%` }}></div>
                        </div>
                     </div>
                  </div>
               </Link>
            ))}
         </div>
       )}
    </div>
  );
};

export const StudentCoursePlayer = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [activeModule, setActiveModule] = useState<CourseModule | null>(null);
  const [activeMaterial, setActiveMaterial] = useState<CourseMaterial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
          const { data: cData } = await supabase.from('courses').select('*').eq('id', courseId).single();
          if (cData) setCourse(cData);

          const { data: mData } = await supabase
              .from('course_modules')
              .select(`*, materials:course_materials(*)`)
              .eq('course_id', courseId)
              .order('order', { ascending: true });
          
          if (mData) {
              setModules(mData);
              if (mData.length > 0) {
                  setActiveModule(mData[0]);
                  if (mData[0].materials?.length > 0) {
                      setActiveMaterial(mData[0].materials[0]);
                  }
              }
          }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchCourse();
  }, [courseId]);

  if (loading || !course) return <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-zenro-red" /></div>;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 animate-fade-in">
       <div className="flex-1 bg-black rounded-xl overflow-hidden shadow-2xl relative flex items-center justify-center">
          {activeMaterial ? (
              activeMaterial.type === 'VIDEO' ? (
                  activeMaterial.url.includes('youtube') || activeMaterial.url.includes('youtu.be') ? (
                    <iframe 
                        className="w-full h-full"
                        src={activeMaterial.url.replace('watch?v=', 'embed/')} 
                        title="Video Player" 
                        allowFullScreen
                    ></iframe>
                  ) : (
                    <video controls className="w-full h-full" src={activeMaterial.url}></video>
                  )
              ) : (
                  <div className="text-center text-white">
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-bold mb-4">{activeMaterial.title}</h3>
                      <a href={activeMaterial.url} target="_blank" rel="noreferrer" className="bg-zenro-red px-6 py-3 rounded font-bold hover:bg-red-700 transition">View Document</a>
                  </div>
              )
          ) : (
              <div className="flex flex-col items-center justify-center h-full text-white">
                 <Play className="w-16 h-16 mb-4 text-gray-600 opacity-50" />
                 <p className="text-gray-400 font-bold">Select a lesson to start learning.</p>
              </div>
          )}
       </div>

       <div className="w-full lg:w-96 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
             <h2 className="font-bold text-slate-800">{course.title}</h2>
             <p className="text-xs text-gray-500">Course Content</p>
          </div>
          <div className="flex-1 overflow-y-auto">
             {modules.map((mod, idx) => (
                <div key={mod.id} className="border-b border-gray-100 last:border-0">
                   <div 
                      className="p-4 bg-gray-50/50 font-bold text-sm text-slate-700 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                      onClick={() => setActiveModule(activeModule?.id === mod.id ? null : mod)}
                   >
                      <span>{idx + 1}. {mod.title}</span>
                      {activeModule?.id === mod.id ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4 text-gray-400"/>}
                   </div>
                   {activeModule?.id === mod.id && (
                       <div className="bg-white">
                           {mod.materials?.map((mat) => (
                               <div 
                                  key={mat.id} 
                                  onClick={() => setActiveMaterial(mat)}
                                  className={`p-3 pl-8 flex items-center gap-3 text-sm cursor-pointer transition ${activeMaterial?.id === mat.id ? 'bg-blue-50 text-zenro-blue font-bold border-l-4 border-zenro-blue' : 'hover:bg-gray-50 text-gray-600'}`}
                               >
                                   {mat.type === 'VIDEO' ? <Play className="w-3 h-3 fill-current"/> : <File className="w-3 h-3"/>}
                                   <span className="truncate">{mat.title}</span>
                               </div>
                           ))}
                           {(!mod.materials || mod.materials.length === 0) && <div className="p-3 pl-8 text-xs text-gray-400 italic">No content.</div>}
                       </div>
                   )}
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

export const StudentTestsPage = () => {
    const [tests, setTests] = useState<Test[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const userData = localStorage.getItem('zenro_session');
    const user = userData ? JSON.parse(userData) : null;

    useEffect(() => {
        const fetchTests = async () => {
            setLoading(true);
            try {
                // Fetch Available Tests
                const { data: testData } = await supabase.from('tests').select('*').eq('is_active', true);
                setTests(testData || []);

                // Fetch My Submissions
                if (user) {
                    const { data: subData } = await supabase.from('submissions').select('*').eq('student_id', user.id);
                    setSubmissions(subData || []);
                }
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchTests();
    }, [user]);

    const getBestSubmission = (testId: string) => {
        const subs = submissions.filter(s => s.test_id === testId);
        if (subs.length === 0) return null;
        return subs.reduce((prev, current) => (prev.score > current.score) ? prev : current);
    };

    return (
        <div className="space-y-8 animate-fade-in">
             <h1 className="text-3xl font-heading font-bold text-zenro-slate">Exams & Quizzes</h1>
             
             {loading ? <div className="text-center p-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-zenro-red" /></div> : (
                 <div className="grid grid-cols-1 gap-4">
                     {tests.map(test => {
                         const bestSub = getBestSubmission(test.id);
                         const isPassed = bestSub && (bestSub.score >= test.passing_score);
                         
                         return (
                             <div key={test.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                                 <div>
                                     <h3 className="text-xl font-bold text-slate-800">{test.title}</h3>
                                     <p className="text-sm text-gray-500 mb-2">{test.description}</p>
                                     <div className="flex gap-4 text-xs font-bold text-gray-400">
                                         <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {test.duration_minutes} Mins</span>
                                         <span>Pass: {test.passing_score} Marks</span>
                                     </div>
                                 </div>
                                 
                                 <div className="flex items-center gap-4">
                                     {bestSub ? (
                                         <div className="text-right">
                                             <div className={`text-2xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                                                 {bestSub.score} <span className="text-sm text-gray-400">marks</span>
                                             </div>
                                             <Link to={`/student/report/${bestSub.id}`} className="text-xs text-zenro-blue hover:underline font-bold">View Report</Link>
                                         </div>
                                     ) : (
                                        <div className="text-sm text-gray-400 italic">Not attempted</div>
                                     )}
                                     
                                     {(!bestSub || test.allow_multiple_attempts) && (
                                         <Link to={`/student/test/${test.id}`} className="px-6 py-2 bg-zenro-red text-white font-bold rounded-lg hover:bg-red-700 shadow-md transition">
                                             {bestSub ? 'Retake Test' : 'Start Test'}
                                         </Link>
                                     )}
                                 </div>
                             </div>
                         );
                     })}
                     {tests.length === 0 && <div className="p-8 text-center text-gray-500">No active tests available.</div>}
                 </div>
             )}
        </div>
    );
};

export const StudentLiveRoom = ({ user }: { user: User }) => {
    const { 
        connectionState, remoteStream, joinSession, leaveSession,
        isLive, topic, chatMessages, sendMessage
    } = useLiveSession();
    const [msgText, setMsgText] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (videoRef.current && remoteStream) {
            videoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleSend = () => {
        if(!msgText.trim()) return;
        sendMessage(user.name, msgText);
        setMsgText('');
    };

    return (
        <div className="h-[calc(100vh-100px)] flex gap-4 animate-fade-in">
            {/* Video Area */}
            <div className="flex-1 bg-black rounded-xl overflow-hidden relative shadow-2xl flex flex-col">
                 <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-3 py-1 rounded text-white text-xs font-bold flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
                     {isLive ? 'LIVE' : 'OFFLINE'}
                 </div>
                 
                 {isLive && connectionState === 'connected' ? (
                     <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain bg-black" />
                 ) : (
                     <div className="flex-1 flex flex-col items-center justify-center text-white space-y-4">
                         {isLive ? (
                             <>
                                <WifiOff className="w-12 h-12 text-gray-500" />
                                <p className="text-lg font-bold">Class is Live!</p>
                                <button onClick={joinSession} className="px-6 py-3 bg-zenro-red rounded-lg font-bold hover:bg-red-700 transition animate-bounce">
                                    Join Class
                                </button>
                             </>
                         ) : (
                             <>
                                <Monitor className="w-16 h-16 text-gray-600" />
                                <p className="text-gray-400">Waiting for Sensei to start the stream...</p>
                             </>
                         )}
                     </div>
                 )}
            </div>

            {/* Chat Area */}
            <div className="w-80 bg-white rounded-xl border border-gray-200 flex flex-col shadow-sm">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-bold text-slate-800">Class Chat</h3>
                    <p className="text-xs text-gray-500 truncate">{topic}</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map((msg, i) => (
                        <div key={i} className="text-sm">
                            <span className="font-bold text-slate-700">{msg.user}:</span> <span className="text-gray-600">{msg.text}</span>
                        </div>
                    ))}
                    <div ref={chatEndRef}></div>
                </div>

                <div className="p-3 border-t border-gray-200 flex gap-2">
                    <input 
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-zenro-blue"
                        placeholder="Ask a question..."
                        value={msgText}
                        onChange={e => setMsgText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button onClick={handleSend} className="p-2 bg-zenro-blue text-white rounded hover:bg-blue-800"><Send className="w-4 h-4" /></button>
                </div>
            </div>
        </div>
    );
};

export const StudentFeesPage = ({ user }: { user: User }) => {
    return (
        <div className="space-y-8 animate-fade-in">
             <h1 className="text-3xl font-heading font-bold text-zenro-slate">Tuition & Fees</h1>
             <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
                 <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                 <h2 className="text-xl font-bold text-slate-800 mb-2">Payment Portal</h2>
                 <p className="text-gray-500 mb-6">View your invoices and payment history.</p>
                 <div className="flex justify-center gap-4">
                     <div className="bg-green-50 p-4 rounded-lg border border-green-100 min-w-[150px]">
                         <p className="text-xs font-bold text-green-600 uppercase">Paid</p>
                         <p className="text-2xl font-bold text-green-700">¥120,000</p>
                     </div>
                     <div className="bg-red-50 p-4 rounded-lg border border-red-100 min-w-[150px]">
                         <p className="text-xs font-bold text-red-600 uppercase">Due</p>
                         <p className="text-2xl font-bold text-red-700">¥35,000</p>
                     </div>
                 </div>
             </div>
        </div>
    );
};

export const StudentProfilePage = ({ user, onUpdateUser }: { user: User, onUpdateUser?: (u: Partial<User>) => void }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation - Upgraded to 5MB
        if (!file.type.startsWith('image/')) return alert("Only image files are allowed.");
        if (file.size > 5 * 1024 * 1024) return alert("Image must be smaller than 5MB.");

        setUploading(true);
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const base64 = ev.target?.result as string;
            
            try {
                // Update Supabase
                const { error } = await supabase
                    .from('profiles')
                    .update({ avatar_url: base64 })
                    .eq('id', user.id);
                
                if (error) throw error;

                // Update Local State via App callback
                if (onUpdateUser) onUpdateUser({ avatar: base64 });
                
                alert("Profile picture updated!");
            } catch (err: any) {
                console.error(err);
                alert("Update failed: " + err.message);
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemovePicture = async () => {
        if(!confirm("Are you sure you want to remove your profile picture?")) return;
        setUploading(true);
        try {
            const { error } = await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
            if (error) throw error;
            
            // Revert to generated UI avatar in state but DB is NULL
            const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
            if (onUpdateUser) onUpdateUser({ avatar: defaultAvatar });
            alert("Profile picture removed.");
        } catch (err: any) {
            console.error(err);
            alert("Failed to remove picture: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
             <div className="relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                 <div className="h-32 bg-zenro-blue"></div>
                 <div className="px-8 pb-8">
                     <div className="relative -top-12 mb-[-30px] inline-block group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                         <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md object-cover transition group-hover:opacity-75" alt="" />
                         <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition text-white">
                             {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Camera className="w-8 h-8" />}
                         </div>
                         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                     </div>
                     <div className="flex justify-between items-end mt-4">
                         <div>
                             <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
                             <p className="text-gray-500 font-mono text-sm">{user.email}</p>
                         </div>
                         <div className="flex gap-2">
                             {!user.avatar.includes('ui-avatars') && (
                                 <button onClick={handleRemovePicture} className="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg text-sm font-bold flex items-center gap-2">
                                     <Trash2 className="w-4 h-4"/> Remove Pic
                                 </button>
                             )}
                             <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center gap-2">
                                 <Edit2 className="w-4 h-4"/> Edit Profile
                             </button>
                         </div>
                     </div>
                 </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                     <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><UserIcon className="w-4 h-4"/> Personal Details</h3>
                     <div className="space-y-3 text-sm">
                         <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Student ID</span><span className="font-mono">{user.rollNumber || 'N/A'}</span></div>
                         <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Batch</span><span className="font-bold text-zenro-blue">{user.batch || 'Unassigned'}</span></div>
                         <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Phone</span><span>{user.phone || 'N/A'}</span></div>
                     </div>
                 </div>
                 
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Shield className="w-4 h-4"/> Account Security</h3>
                      <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium mb-2 flex justify-between items-center transition">
                          Change Password <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium flex justify-between items-center transition">
                          Two-Factor Auth <span className="text-xs text-red-500 font-bold">Disabled</span>
                      </button>
                 </div>
             </div>
        </div>
    );
};
