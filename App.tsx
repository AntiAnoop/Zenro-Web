
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, BarChart2, ShieldAlert, Layout, LogOut, Play, User as UserIcon, Settings, MessageSquare, Video, CreditCard, Layers, Book, ListTodo, FileText, Globe, DollarSign, Users, Zap, Loader2, Menu, X, FileCheck, Calendar } from 'lucide-react';
import { User, UserRole } from './types';
import { ExamPortal } from './components/ExamPortal';
import { StudentDashboardHome, StudentFeesPage, StudentProfilePage, StudentCoursesPage, StudentTestsPage, StudentActivityPage, StudentLiveRoom, StudentCoursePlayer } from './components/StudentViews';
import { StudentTestPlayer } from './components/StudentTestPlayer';
import { TestReport } from './components/TestReport';
import { TeacherDashboardHome, TeacherCoursesPage, TeacherAssignmentsPage, TeacherReportsPage, LiveClassConsole, TeacherTestsPage, TeacherSchedulePage, CourseContentManager, TeacherProfilePage } from './components/TeacherViews';
import { AdminDashboard, AdminUserManagement, AdminFinancials, AdminTeacherAnalytics, AdminScheduleView } from './components/AdminViews';
import { LiveProvider } from './context/LiveContext';
import { supabase } from './services/supabaseClient';

// --- MOCK DATA ---
const CREDENTIALS: Record<string, {pass: string, role: UserRole, name: string, id: string}> = {
  '9999999999': { pass: '9999999999', role: UserRole.STUDENT, name: 'Alex Student', id: 's1' },
  '8888888888': { pass: '8888888888', role: UserRole.TEACHER, name: 'Tanaka Sensei', id: 't1' },
  '7777777777': { pass: '7777777777', role: UserRole.ADMIN, name: 'Admin', id: 'a1' }
};

// --- BRAND ASSETS ---

const ZenroLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="white" />
    <circle cx="50" cy="50" r="20" fill="#E60012" />
    <path d="M50 5 A45 45 0 0 1 95 50" stroke="#1A237E" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

// 1. Login Screen with Zenro Professional Theme
const LoginScreen = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdentifier(e.target.value);
  };

  const loginAs = (id: string) => {
    const account = CREDENTIALS[id];
    if (account) {
        onLogin({
            id: account.id,
            name: account.name,
            role: account.role,
            email: `${id}@zenro.jp`,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(account.name)}&background=1A237E&color=fff`,
            batch: '2024-A',
            phone: 'N/A'
        });
    }
  };

  const checkLocalUsers = (id: string, pass: string) => {
      try {
          const local = localStorage.getItem('zenro_demo_users');
          if (local) {
              const users = JSON.parse(local);
              const found = users.find((u: any) => 
                  (u.student_id === id || u.email === id || u.phone === id)
              );
              if (found && found.password === pass) {
                  return found;
              }
          }
      } catch (e) { console.error("Local login check failed", e); }
      return null;
  };

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
            setLoading(false);
            return;
        }

        const localUser = checkLocalUsers(identifier, password);
        if (localUser) {
             onLogin({
                id: localUser.id,
                name: localUser.full_name,
                role: localUser.role as UserRole,
                email: localUser.email,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(localUser.full_name)}&background=random`,
                batch: localUser.batch,
                phone: localUser.phone,
                rollNumber: localUser.student_id
            });
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .or(`student_id.eq.${identifier},email.eq.${identifier},phone.eq.${identifier}`)
            .single();

        if (error || !data) {
            throw new Error('User not found in registry');
        }

        if (data.password === password) {
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
        } else {
            setError('Invalid password.');
        }

    } catch (err) {
        console.error("Login Error:", err);
        setError('Invalid credentials or user does not exist.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zenro-gray flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        
        {/* Left Side - Brand Visual */}
        <div className="hidden md:flex md:w-1/2 bg-zenro-blue relative p-12 flex-col justify-between">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1528360983277-13d9012356ee?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
            <div className="relative z-10 text-white">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-white p-2 rounded-full">
                        <ZenroLogo className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-heading font-bold tracking-tight">ZENRO INSTITUTE</h1>
                </div>
                <h2 className="text-4xl font-heading font-bold leading-tight mb-4">
                    Your Gateway to <br/>
                    <span className="text-zenro-red">Global Opportunities</span>
                </h2>
                <p className="text-blue-100 text-lg">Master Japanese, secure your future, and build a career without borders.</p>
            </div>

            <div className="relative z-10 text-sm text-blue-200 mt-8">
                <p>&copy; 2024 Zenro Institute Pvt Ltd.</p>
            </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative">
            <div className="md:hidden flex justify-center mb-8">
                 <ZenroLogo className="w-16 h-16" />
            </div>
            <div className="max-w-sm mx-auto w-full">
                <h3 className="text-2xl font-heading font-bold text-zenro-slate mb-2 text-center md:text-left">Welcome Back</h3>
                <p className="text-gray-500 mb-8 text-center md:text-left">Please enter your credentials.</p>

                {/* Quick Login Demo Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
                    <button onClick={() => loginAs('8888888888')} className="flex-1 py-2 text-xs font-bold text-gray-500 hover:text-zenro-blue hover:bg-white shadow-sm rounded transition flex items-center justify-center gap-2">
                        Teacher
                    </button>
                    <button onClick={() => loginAs('9999999999')} className="flex-1 py-2 text-xs font-bold text-gray-500 hover:text-zenro-red hover:bg-white shadow-sm rounded transition flex items-center justify-center gap-2">
                        Student
                    </button>
                    <button onClick={() => loginAs('7777777777')} className="flex-1 py-2 text-xs font-bold text-gray-500 hover:text-green-600 hover:bg-white shadow-sm rounded transition flex items-center justify-center gap-2">
                        Admin
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-zenro-slate uppercase mb-2">Student ID / Email</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input 
                                type="text" 
                                value={identifier}
                                onChange={handleIdentifierChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-zenro-slate focus:border-zenro-red focus:ring-1 focus:ring-zenro-red outline-none transition"
                                placeholder="ID or Email"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-zenro-slate uppercase mb-2">Password</label>
                        <div className="relative">
                            <Settings className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input 
                                type="password"
                                value={password}
                                maxLength={20}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-zenro-slate focus:border-zenro-red focus:ring-1 focus:ring-zenro-red outline-none transition"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && <div className="text-zenro-red text-xs text-center bg-red-50 py-2 rounded border border-red-100">{error}</div>}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-zenro-red hover:bg-red-700 text-white font-bold py-3.5 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 mt-4"
                    >
                        {loading ? <div className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Authenticating...</div> : 'Login'}
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

// 2. Sidebar with Zenro Branding (Navy Blue)
const Sidebar = ({ user, onLogout, isOpen, onClose }: { user: User, onLogout: () => void, isOpen: boolean, onClose: () => void }) => {
  const location = useLocation();
  // New Active State: White background with Navy text on Navy sidebar
  const isActive = (path: string) => location.pathname === path 
    ? "bg-white/10 text-white border-r-4 border-zenro-red font-bold" 
    : "text-blue-100 hover:text-white hover:bg-white/5";

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 backdrop-blur-sm ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div className={`
        w-64 bg-zenro-blue flex flex-col h-screen 
        fixed left-0 top-0 z-50 font-sans shadow-2xl transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        {/* Mobile Close Button */}
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 text-blue-200 hover:text-white lg:hidden z-10 hover:bg-white/10 rounded-full"
        >
            <X className="w-5 h-5" />
        </button>

        <div className="p-6 flex items-center gap-3 border-b border-blue-900/50">
          <div className="bg-white p-1.5 rounded-full">
              <ZenroLogo className="w-8 h-8" />
          </div>
          <div>
              <h1 className="text-xl font-heading font-bold text-white tracking-tight">ZENRO</h1>
              <p className="text-[10px] text-blue-200 uppercase tracking-widest">Institute</p>
          </div>
        </div>
        
        <nav className="flex-1 px-3 space-y-1 mt-6 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-blue-300 uppercase mb-3 tracking-widest">Main Menu</p>
          
          {user.role === UserRole.STUDENT && (
            <>
              <Link to="/student/dashboard" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${isActive('/student/dashboard')}`}>
                <Layout className="w-4 h-4" /> Overview
              </Link>
              <Link to="/student/courses" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${isActive('/student/courses')}`}>
                <Book className="w-4 h-4" /> Curriculum
              </Link>
               <Link to="/student/tests" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${isActive('/student/tests')}`}>
               <FileText className="w-4 h-4" /> Tests/Reports
             </Link>
              <Link to="/student/activities" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${isActive('/student/activities')}`}>
                <ListTodo className="w-4 h-4" /> Practice
              </Link>
               <Link to="/student/fees" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${isActive('/student/fees')}`}>
                <CreditCard className="w-4 h-4" /> Fees
              </Link>
               <Link to="/student/profile" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${isActive('/student/profile')}`}>
                <UserIcon className="w-4 h-4" /> Profile
              </Link>
            </>
          )}

          {user.role === UserRole.TEACHER && (
             <>
               <Link to="/teacher/dashboard" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${isActive('/teacher/dashboard')}`}>
                 <Layout className="w-4 h-4" /> Dashboard
               </Link>
               <Link to="/teacher/schedule" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${isActive('/teacher/schedule')}`}>
                 <Calendar className="w-4 h-4" /> Class Schedule
               </Link>
               <Link to="/teacher/courses" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${isActive('/teacher/courses')}`}>
                 <Book className="w-4 h-4" /> My Classes
               </Link>
               <Link to="/teacher/tests" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${isActive('/teacher/tests')}`}>
                 <FileCheck className="w-4 h-4" /> Tests
               </Link>
               <Link to="/teacher/assignments" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${isActive('/teacher/assignments')}`}>
                 <FileText className="w-4 h-4" /> Assignments
               </Link>
               <Link to="/teacher/reports" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${isActive('/teacher/reports')}`}>
                 <BarChart2 className="w-4 h-4" /> Analytics
               </Link>
               <Link to="/teacher/live" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${isActive('/teacher/live')}`}>
                 <Video className="w-4 h-4" /> Live Console
               </Link>
               <Link to="/teacher/profile" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${isActive('/teacher/profile')}`}>
                 <UserIcon className="w-4 h-4" /> My Profile
               </Link>
             </>
          )}

          {user.role === UserRole.ADMIN && (
            <>
               <Link to="/admin/dashboard" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${isActive('/admin/dashboard')}`}>
                 <Layout className="w-4 h-4" /> Dashboard
               </Link>
               <Link to="/admin/schedule" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${isActive('/admin/schedule')}`}>
                 <Calendar className="w-4 h-4" /> Master Schedule
               </Link>
               <Link to="/admin/users" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${isActive('/admin/users')}`}>
                 <Users className="w-4 h-4" /> User Mgmt
               </Link>
               <Link to="/admin/courses" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${isActive('/admin/courses')}`}>
                 <BookOpen className="w-4 h-4" /> Course Mgmt
               </Link>
               <Link to="/admin/analytics" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${isActive('/admin/analytics')}`}>
                 <BarChart2 className="w-4 h-4" /> Teacher Analytics
               </Link>
               <Link to="/admin/finance" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${isActive('/admin/finance')}`}>
                 <DollarSign className="w-4 h-4" /> Financials
               </Link>
               <Link to="/admin/settings" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${isActive('/admin/settings')}`}>
                 <Settings className="w-4 h-4" /> Settings
               </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-blue-900/50 bg-blue-900/20">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
              <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full border border-blue-400 object-cover" />
              <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-blue-300 truncate font-bold">{user.role}</p>
              </div>
              <button onClick={onLogout} className="p-1.5 hover:bg-blue-800 rounded-md transition text-blue-300 hover:text-white" title="Logout">
                  <LogOut className="w-4 h-4" />
              </button>
          </div>
        </div>
      </div>
    </>
  );
};

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles: UserRole[];
  user: User;
}

const ProtectedRoute = ({ children, allowedRoles, user }: ProtectedRouteProps) => {
  if (!allowedRoles.includes(user.role)) {
    if (user.role === UserRole.STUDENT) return <Navigate to="/student/dashboard" replace />;
    if (user.role === UserRole.TEACHER) return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === UserRole.ADMIN) return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// 4. Main App Layout Logic - Light Theme
const AppContent = ({ user, handleLogout, setIsExamMode, onUpdateUser }: any) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  return (
    <div className="flex h-screen bg-zenro-gray text-zenro-slate font-sans selection:bg-zenro-red selection:text-white overflow-hidden">
       {/* Mobile Header - Sticky */}
       <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4 shadow-sm">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
             <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
             <div className="bg-zenro-blue p-1 rounded-full"><ZenroLogo className="w-6 h-6" /></div>
             <span className="font-heading font-bold text-zenro-blue tracking-tight text-lg">ZENRO</span>
          </div>
          
          <button 
            onClick={() => {
                if(user.role === UserRole.STUDENT) navigate('/student/profile');
                if(user.role === UserRole.TEACHER) navigate('/teacher/profile');
            }} 
            className="w-9 h-9 rounded-full overflow-hidden border border-gray-300"
          >
             <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
          </button>
       </div>

       <Sidebar 
         user={user} 
         onLogout={handleLogout} 
         isOpen={sidebarOpen} 
         onClose={() => setSidebarOpen(false)} 
       />
       
       {/* Main Content Area - Optimized Padding for Mobile */}
       <main className="flex-1 overflow-auto p-4 lg:p-8 pt-20 lg:pt-8 relative scroll-smooth lg:ml-64 w-full bg-zenro-gray">
          <div className="max-w-7xl mx-auto">
                <Routes>
                <Route path="/" element={
                    user.role === UserRole.STUDENT ? <Navigate to="/student/dashboard" /> : 
                    user.role === UserRole.TEACHER ? <Navigate to="/teacher/dashboard" /> : <Navigate to="/admin/dashboard" />
                } />
                
                {/* Student Routes */}
                <Route path="/student/dashboard" element={<ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}><StudentDashboardHome /></ProtectedRoute>} />
                <Route path="/student/courses" element={<ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}><StudentCoursesPage /></ProtectedRoute>} />
                <Route path="/student/course/:courseId" element={<ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}><StudentCoursePlayer /></ProtectedRoute>} />
                <Route path="/student/live" element={<ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}><StudentLiveRoom user={user} /></ProtectedRoute>} />
                <Route path="/student/tests" element={<ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}><StudentTestsPage /></ProtectedRoute>} />
                <Route path="/student/test/:testId" element={<ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}><StudentTestPlayer /></ProtectedRoute>} />
                <Route path="/student/report/:submissionId" element={<ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}><TestReport role="STUDENT" /></ProtectedRoute>} />
                <Route path="/student/activities" element={<ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}><StudentActivityPage /></ProtectedRoute>} />
                <Route path="/student/fees" element={<ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}><StudentFeesPage user={user} /></ProtectedRoute>} />
                <Route path="/student/profile" element={<ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}><StudentProfilePage user={user} onUpdateUser={onUpdateUser} /></ProtectedRoute>} />
                
                <Route path="/exam-intro" element={
                    <ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}>
                        <div className="p-8 flex justify-center items-center h-full">
                            <div className="bg-white p-8 rounded-xl max-w-md text-center border border-gray-200 shadow-xl">
                                <ShieldAlert className="w-16 h-16 text-zenro-red mx-auto mb-4" />
                                <h1 className="text-2xl font-bold mb-2 text-zenro-slate">JLPT Mock Exam</h1>
                                <p className="text-gray-500 mb-6">Duration: 60 mins • N4 Level</p>
                                <button onClick={() => setIsExamMode(true)} className="w-full bg-zenro-red py-3 rounded-lg text-white font-bold hover:bg-red-700 shadow-md">
                                    Start Examination
                                </button>
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                
                {/* Teacher Routes */}
                <Route path="/teacher/dashboard" element={<ProtectedRoute user={user} allowedRoles={[UserRole.TEACHER]}><TeacherDashboardHome /></ProtectedRoute>} />
                <Route path="/teacher/schedule" element={<ProtectedRoute user={user} allowedRoles={[UserRole.TEACHER, UserRole.ADMIN]}><TeacherSchedulePage /></ProtectedRoute>} />
                <Route path="/teacher/courses" element={<ProtectedRoute user={user} allowedRoles={[UserRole.TEACHER, UserRole.ADMIN]}><TeacherCoursesPage /></ProtectedRoute>} />
                <Route path="/teacher/course/:courseId/manage" element={<ProtectedRoute user={user} allowedRoles={[UserRole.TEACHER, UserRole.ADMIN]}><CourseContentManager /></ProtectedRoute>} />
                <Route path="/teacher/tests" element={<ProtectedRoute user={user} allowedRoles={[UserRole.TEACHER, UserRole.ADMIN]}><TeacherTestsPage /></ProtectedRoute>} />
                <Route path="/teacher/assignments" element={<ProtectedRoute user={user} allowedRoles={[UserRole.TEACHER]}><TeacherAssignmentsPage /></ProtectedRoute>} />
                <Route path="/teacher/reports" element={<ProtectedRoute user={user} allowedRoles={[UserRole.TEACHER, UserRole.ADMIN]}><TeacherReportsPage /></ProtectedRoute>} />
                <Route path="/teacher/report/:submissionId" element={<ProtectedRoute user={user} allowedRoles={[UserRole.TEACHER, UserRole.ADMIN]}><TestReport role="TEACHER" /></ProtectedRoute>} />
                <Route path="/teacher/live" element={<ProtectedRoute user={user} allowedRoles={[UserRole.TEACHER]}><LiveClassConsole /></ProtectedRoute>} />
                <Route path="/teacher/profile" element={<ProtectedRoute user={user} allowedRoles={[UserRole.TEACHER]}><TeacherProfilePage user={user} onUpdateUser={onUpdateUser} /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]}><AdminUserManagement /></ProtectedRoute>} />
                <Route path="/admin/finance" element={<ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]}><AdminFinancials /></ProtectedRoute>} />
                <Route path="/admin/courses" element={<ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]}><TeacherCoursesPage /></ProtectedRoute>} />
                <Route path="/admin/schedule" element={<ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]}><AdminScheduleView /></ProtectedRoute>} />
                <Route path="/admin/analytics" element={<ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]}><AdminTeacherAnalytics /></ProtectedRoute>} />
                <Route path="/admin/reports" element={<ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]}><TeacherReportsPage /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]}><div className="text-center p-12 text-gray-500">Settings Module Loading...</div></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/" />} />
                </Routes>
          </div>
       </main>
    </div>
  );
};


// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isExamMode, setIsExamMode] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  // SESSION PERSISTENCE LOGIC WITH ROBUST SYNC
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedSession = localStorage.getItem('zenro_session');
        if (storedSession) {
          const parsedUser = JSON.parse(storedSession);
          
          // ROBUST SYNC: Fetch latest profile from DB to ensure Admin changes (like avatar) are reflected instantly
          try {
              const { data, error } = await supabase.from('profiles').select('*').eq('id', parsedUser.id).single();
              if (data && !error) {
                  const refreshedUser = {
                      ...parsedUser,
                      name: data.full_name,
                      email: data.email,
                      role: data.role,
                      avatar: data.avatar_url || parsedUser.avatar,
                      batch: data.batch || parsedUser.batch,
                      phone: data.phone || parsedUser.phone
                  };
                  setUser(refreshedUser);
                  localStorage.setItem('zenro_session', JSON.stringify(refreshedUser));
              } else {
                  // Fallback to local if DB fetch fails (e.g. offline), but user exists
                  setUser(parsedUser);
              }
          } catch (dbErr) {
              console.warn("DB Sync failed, using local session:", dbErr);
              setUser(parsedUser);
          }
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
        localStorage.removeItem('zenro_session');
      } finally {
        setIsSessionLoading(false);
      }
    };
    restoreSession();
  }, []);

  const handleLogin = (newUser: User) => {
    localStorage.setItem('zenro_session', JSON.stringify(newUser));
    setUser(newUser);
  };

  const handleUpdateUser = (updates: Partial<User>) => {
      if(!user) return;
      const updatedUser = { ...user, ...updates };
      localStorage.setItem('zenro_session', JSON.stringify(updatedUser));
      setUser(updatedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('zenro_session');
    setUser(null);
  };

  if (isSessionLoading) {
     return (
        <div className="h-screen w-full bg-white flex flex-col items-center justify-center text-zenro-slate space-y-4">
            <div className="bg-zenro-blue p-3 rounded-full"><ZenroLogo className="w-16 h-16 animate-pulse" /></div>
            <div className="flex items-center gap-2 text-zenro-red">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="font-bold">Loading Zenro Portal...</span>
            </div>
        </div>
     );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (isExamMode) {
    return <ExamPortal onExit={() => setIsExamMode(false)} />;
  }

  return (
    <LiveProvider user={user}>
      <Router>
         <AppContent 
            user={user} 
            handleLogout={handleLogout} 
            setIsExamMode={setIsExamMode}
            onUpdateUser={handleUpdateUser} 
         />
      </Router>
    </LiveProvider>
  );
}
