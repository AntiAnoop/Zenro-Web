
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, BarChart2, ShieldAlert, Layout, LogOut, Play, User as UserIcon, Settings, MessageSquare, Video, CreditCard, Layers, Book, ListTodo, FileText, Globe, DollarSign, Users, Zap, Loader2, Menu, X, FileCheck, Calendar } from 'lucide-react';
import { User, UserRole } from './types';
import { ExamPortal } from './components/ExamPortal';
import { StudentDashboardHome, StudentFeesPage, StudentProfilePage, StudentCoursesPage, StudentTestsPage, StudentActivityPage, StudentLiveRoom, StudentCoursePlayer, StudentSchedulePage } from './components/StudentViews';
import { StudentTestPlayer } from './components/StudentTestPlayer';
import { TestReport } from './components/TestReport';
import { TeacherDashboardHome, TeacherCoursesPage, TeacherAssignmentsPage, TeacherReportsPage, LiveClassConsole, TeacherTestsPage, TeacherSchedulePage, CourseContentManager, TeacherProfilePage } from './components/TeacherViews';
import { AdminDashboard, AdminUserManagement, AdminFinancials, AdminTeacherAnalytics, AdminScheduleView } from './components/AdminViews';
import { LiveProvider } from './context/LiveContext';
import { supabase } from './services/supabaseClient';

// --- BRAND ASSETS ---

/**
 * THE REAL BRAND LOGO (Vectorized SVG)
 * Japan-India Fusion Design
 */
const ZenroLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="circleClip">
        <circle cx="50" cy="50" r="50" />
      </clipPath>
    </defs>
    <g clipPath="url(#circleClip)">
      {/* Left side: Japan (White background + Red Sun) */}
      <rect x="0" y="0" width="50" height="100" fill="#FFFFFF" />
      <circle cx="28" cy="50" r="15" fill="#BC002D" />
      
      {/* Right side: India (Saffron, White, Green stripes) */}
      <rect x="50" y="0" width="50" height="33.3" fill="#FF9933" />
      <rect x="50" y="33.3" width="50" height="33.3" fill="#FFFFFF" />
      <rect x="50" y="66.6" width="50" height="33.4" fill="#138808" />
      
      {/* Central Bridge: Ashoka Chakra (Navy Blue) */}
      <circle cx="50" cy="50" r="10" stroke="#000080" strokeWidth="1.5" fill="white" />
      <circle cx="50" cy="50" r="1.5" fill="#000080" />
      <g stroke="#000080" strokeWidth="0.5">
        {[...Array(24)].map((_, i) => (
          <line key={i} x1="50" y1="50" x2="50" y2="40" transform={`rotate(${i * 15} 50 50)`} />
        ))}
      </g>
    </g>
    {/* Outer Ring for visibility on white */}
    <circle cx="50" cy="50" r="49.5" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
  </svg>
);

// --- AUTHENTICATION HELPERS ---

const CREDENTIALS: Record<string, {pass: string, role: UserRole, name: string, id: string}> = {
  '9999999999': { pass: '9999999999', role: UserRole.STUDENT, name: 'Alex Student', id: 's1' },
  '8888888888': { pass: '8888888888', role: UserRole.TEACHER, name: 'Tanaka Sensei', id: 't1' },
  '7777777777': { pass: '7777777777', role: UserRole.ADMIN, name: 'Admin', id: 'a1' }
};

const LoginScreen = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        const account = CREDENTIALS[identifier];
        if (account && account.pass === password) {
            onLogin({
                id: account.id,
                name: account.name,
                role: account.role,
                email: `${identifier}@zenro.jp`,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(account.name)}&background=1A237E&color=fff`,
                batch: '2024-A' 
            });
            return;
        }

        const { data, error: dbError } = await supabase
            .from('profiles')
            .select('*')
            .or(`student_id.eq.${identifier},email.eq.${identifier},phone.eq.${identifier}`)
            .single();

        if (dbError || !data) throw new Error('User not found');
        if (data.password !== password) throw new Error('Invalid password');

        onLogin({
            id: data.id,
            name: data.full_name,
            role: data.role as UserRole,
            email: data.email,
            avatar: data.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name)}&background=random`,
            batch: data.batch,
            phone: data.phone,
            rollNumber: data.student_id
        });
    } catch (err) {
        setError('Invalid credentials. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zenro-gray flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        <div className="hidden md:flex md:w-1/2 bg-zenro-blue relative p-12 flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1528360983277-13d9012356ee?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-10"></div>
            <div className="relative z-10 text-white">
                <div className="flex items-center gap-4 mb-12">
                    <div className="bg-white p-2.5 rounded-2xl shadow-xl transform rotate-3">
                        <ZenroLogo className="w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-heading font-extrabold tracking-tighter">ZENRO</h1>
                </div>
                <h2 className="text-5xl font-heading font-bold leading-tight mb-6">
                    Master Japanese <br/>
                    <span className="text-zenro-red">Secure Your Future</span>
                </h2>
                <p className="text-blue-100 text-xl font-light leading-relaxed max-w-sm">Global standards of language education, bridging cultures and opportunities.</p>
            </div>
            <div className="relative z-10 text-xs text-blue-300/60 uppercase tracking-widest font-bold">
                &copy; 2024 ZENRO JAPANESE INSTITUTE
            </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-20 flex flex-col justify-center bg-white relative">
            <div className="md:hidden flex flex-col items-center mb-10">
                 <ZenroLogo className="w-20 h-20 mb-4" />
                 <h1 className="text-2xl font-heading font-black text-zenro-blue tracking-tighter">ZENRO</h1>
            </div>
            <div className="max-w-sm mx-auto w-full">
                <h3 className="text-3xl font-heading font-bold text-zenro-slate mb-2">Welcome Back</h3>
                <p className="text-gray-400 mb-10">Sign in to your learning portal.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-zenro-slate uppercase mb-2 tracking-widest">ID / Email</label>
                        <div className="relative group">
                            <UserIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-zenro-red transition" />
                            <input 
                                type="text" 
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-zenro-slate focus:bg-white focus:border-zenro-red focus:ring-4 focus:ring-zenro-red/5 outline-none transition-all shadow-inner"
                                placeholder="9999999999"
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-zenro-slate uppercase mb-2 tracking-widest">Password</label>
                        <div className="relative group">
                            <Settings className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-zenro-red transition" />
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-zenro-slate focus:bg-white focus:border-zenro-red focus:ring-4 focus:ring-zenro-red/5 outline-none transition-all shadow-inner"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && <div className="text-zenro-red text-sm font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100 animate-shake">{error}</div>}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-zenro-blue hover:bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all shadow-xl hover:shadow-zenro-blue/20 disabled:opacity-50 mt-4 active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto"/> : 'Sign In'}
                    </button>
                </form>

                <div className="mt-12 flex justify-center gap-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition duration-500">
                    <ZenroLogo className="w-8 h-8" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- CORE LAYOUT COMPONENTS ---

const Sidebar = ({ user, onLogout, isOpen, onClose }: { user: User, onLogout: () => void, isOpen: boolean, onClose: () => void }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path 
    ? "bg-white/15 text-white border-l-4 border-zenro-red font-bold translate-x-1 shadow-lg" 
    : "text-blue-100/70 hover:text-white hover:bg-white/5 hover:translate-x-1";

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-900/60 z-40 lg:hidden transition-opacity duration-300 backdrop-blur-md ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`
        w-64 bg-zenro-blue flex flex-col h-screen fixed left-0 top-0 z-50 shadow-2xl transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="p-8 flex items-center gap-4 border-b border-white/5">
          <div className="bg-white p-1.5 rounded-xl shadow-lg shadow-black/20">
              <ZenroLogo className="w-10 h-10" />
          </div>
          <div>
              <h1 className="text-xl font-heading font-black text-white tracking-tighter">ZENRO</h1>
              <p className="text-[10px] text-zenro-red font-bold uppercase tracking-widest leading-none">Institute</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 mt-8 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-bold text-white/30 uppercase mb-4 tracking-widest">Main Menu</p>
          
          {user.role === UserRole.STUDENT && (
            <>
              <Link to="/student/dashboard" onClick={onClose} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-sm ${isActive('/student/dashboard')}`}>
                <Layout className="w-5 h-5" /> Dashboard
              </Link>
              <Link to="/student/schedule" onClick={onClose} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-sm ${isActive('/student/schedule')}`}>
                <Calendar className="w-5 h-5" /> My Schedule
              </Link>
              <Link to="/student/courses" onClick={onClose} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-sm ${isActive('/student/courses')}`}>
                <Book className="w-5 h-5" /> Curriculum
              </Link>
               <Link to="/student/tests" onClick={onClose} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-sm ${isActive('/student/tests')}`}>
               <FileCheck className="w-5 h-5" /> Tests & Reports
             </Link>
               <Link to="/student/fees" onClick={onClose} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-sm ${isActive('/student/fees')}`}>
                <CreditCard className="w-5 h-5" /> Fee Records
              </Link>
               <Link to="/student/profile" onClick={onClose} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-sm ${isActive('/student/profile')}`}>
                <UserIcon className="w-5 h-5" /> Profile
              </Link>
            </>
          )}

          {user.role === UserRole.TEACHER && (
             <>
               <Link to="/teacher/dashboard" onClick={onClose} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-sm ${isActive('/teacher/dashboard')}`}>
                 <Layout className="w-5 h-5" /> Dashboard
               </Link>
               <Link to="/teacher/schedule" onClick={onClose} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-sm ${isActive('/teacher/schedule')}`}>
                 <Calendar className="w-5 h-5" /> Live Schedule
               </Link>
               <Link to="/teacher/courses" onClick={onClose} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-sm ${isActive('/teacher/courses')}`}>
                 <Layers className="w-5 h-5" /> Courses
               </Link>
               <Link to="/teacher/tests" onClick={onClose} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-sm ${isActive('/teacher/tests')}`}>
                 <FileCheck className="w-5 h-5" /> Test Engine
               </Link>
               <Link to="/teacher/assignments" onClick={onClose} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-sm ${isActive('/teacher/assignments')}`}>
                 <FileText className="w-5 h-5" /> Assignments
               </Link>
               <Link to="/teacher/reports" onClick={onClose} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-sm ${isActive('/teacher/reports')}`}>
                 <BarChart2 className="w-5 h-5" /> Reports
               </Link>
             </>
          )}

          {user.role === UserRole.ADMIN && (
            <>
               <Link to="/admin/dashboard" onClick={onClose} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-sm ${isActive('/admin/dashboard')}`}>
                 <ShieldAlert className="w-5 h-5" /> Admin Console
               </Link>
               <Link to="/admin/users" onClick={onClose} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-sm ${isActive('/admin/users')}`}>
                 <Users className="w-5 h-5" /> User Directory
               </Link>
               <Link to="/admin/schedule" onClick={onClose} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-sm ${isActive('/admin/schedule')}`}>
                 <Calendar className="w-5 h-5" /> Global Calendar
               </Link>
               <Link to="/admin/finance" onClick={onClose} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-sm ${isActive('/admin/finance')}`}>
                 <DollarSign className="w-5 h-5" /> Financial Hub
               </Link>
            </>
          )}
        </nav>

        <div className="p-6 border-t border-white/5 bg-slate-900/20">
          <div className="flex items-center gap-4 px-3 py-2">
              <img src={user.avatar} alt="" className="w-10 h-10 rounded-2xl border-2 border-white/20 object-cover shadow-lg" />
              <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white truncate leading-none mb-1">{user.name.split(' ')[0]}</p>
                  <p className="text-[9px] text-blue-400 truncate font-bold uppercase tracking-widest">{user.role}</p>
              </div>
              <button onClick={onLogout} className="p-2.5 bg-white/5 hover:bg-zenro-red text-white rounded-xl transition-all active:scale-90 shadow-lg">
                  <LogOut className="w-4 h-4" />
              </button>
          </div>
        </div>
      </div>
    </>
  );
};

// --- MAIN APP ENTRY ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isExamMode, setIsExamMode] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = localStorage.getItem('zenro_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          const { data } = await supabase.from('profiles').select('*').eq('id', parsed.id).single();
          if (data) {
              const updated = {
                  ...parsed,
                  name: data.full_name,
                  email: data.email,
                  avatar: data.avatar_url || parsed.avatar,
                  batch: data.batch || parsed.batch
              };
              setUser(updated);
              localStorage.setItem('zenro_session', JSON.stringify(updated));
          } else {
              setUser(parsed);
          }
        }
      } catch (e) {
        localStorage.removeItem('zenro_session');
      } finally {
        setIsSessionLoading(false);
      }
    };
    restoreSession();
  }, []);

  if (isSessionLoading) {
     return (
        <div className="h-screen w-full bg-zenro-blue flex flex-col items-center justify-center text-white p-8">
            <div className="relative mb-12">
                <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-black/40 animate-fade-in relative z-10">
                    <ZenroLogo className="w-32 h-32 animate-bounce-slow" />
                </div>
            </div>
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-zenro-red" />
                    <span className="text-xl font-heading font-black tracking-tighter">ZENRO PORTAL</span>
                </div>
                <p className="text-blue-200/40 text-[10px] font-bold uppercase tracking-[0.3em]">Initializing Academic Core</p>
            </div>
        </div>
     );
  }

  if (!user) return <LoginScreen onLogin={(u) => { setUser(u); localStorage.setItem('zenro_session', JSON.stringify(u)); }} />;
  if (isExamMode) return <ExamPortal onExit={() => setIsExamMode(false)} />;

  return (
    <LiveProvider user={user}>
      <Router>
        <div className="flex h-screen bg-zenro-gray text-zenro-slate overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-40 flex items-center justify-between px-6 shadow-sm">
              <button onClick={() => setSidebarOpen(true)} className="p-2.5 bg-gray-50 text-zenro-blue rounded-xl active:bg-gray-100 transition"><Menu className="w-6 h-6" /></button>
              <ZenroLogo className="w-10 h-10 shadow-sm" />
              <img src={user.avatar} className="w-9 h-9 rounded-xl border border-gray-200 object-cover" alt="" />
          </div>

          <Sidebar user={user} onLogout={() => { setUser(null); localStorage.removeItem('zenro_session'); }} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          <main className="flex-1 overflow-auto p-4 lg:p-10 pt-20 lg:pt-10 scroll-smooth lg:ml-64 w-full bg-zenro-gray relative">
            <div className="max-w-7xl mx-auto min-h-full">
                <Routes>
                    <Route path="/" element={<Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />} />
                    <Route path="/student/dashboard" element={<StudentDashboardHome />} />
                    <Route path="/student/schedule" element={<StudentSchedulePage />} />
                    <Route path="/student/courses" element={<StudentCoursesPage />} />
                    <Route path="/student/live" element={<StudentLiveRoom user={user} />} />
                    <Route path="/student/tests" element={<StudentTestsPage />} />
                    <Route path="/student/test/:testId" element={<StudentTestPlayer />} />
                    <Route path="/student/report/:submissionId" element={<TestReport role="STUDENT" />} />
                    <Route path="/student/fees" element={<StudentFeesPage user={user} />} />
                    <Route path="/student/profile" element={<StudentProfilePage user={user} />} />
                    
                    <Route path="/teacher/dashboard" element={<TeacherDashboardHome />} />
                    <Route path="/teacher/schedule" element={<TeacherSchedulePage />} />
                    <Route path="/teacher/courses" element={<TeacherCoursesPage />} />
                    <Route path="/teacher/course/:courseId/manage" element={<CourseContentManager />} />
                    <Route path="/teacher/tests" element={<TeacherTestsPage />} />
                    <Route path="/teacher/assignments" element={<TeacherAssignmentsPage />} />
                    <Route path="/teacher/reports" element={<TeacherReportsPage />} />
                    <Route path="/teacher/live" element={<LiveClassConsole />} />
                    
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<AdminUserManagement />} />
                    <Route path="/admin/schedule" element={<AdminScheduleView />} />
                    <Route path="/admin/finance" element={<AdminFinancials />} />
                </Routes>
            </div>
          </main>
        </div>
      </Router>
    </LiveProvider>
  );
}
