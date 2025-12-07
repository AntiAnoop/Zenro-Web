
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, BarChart2, ShieldAlert, Layout, LogOut, Play, User as UserIcon, Settings, MessageSquare, Video, CreditCard, Layers, Book, ListTodo, FileText, Globe, DollarSign, Users, Zap, Loader2, Menu, X, FileCheck } from 'lucide-react';
import { User, UserRole } from './types';
import { ExamPortal } from './components/ExamPortal';
import { StudentDashboardHome, StudentFeesPage, StudentProfilePage, StudentCoursesPage, StudentTestsPage, StudentActivityPage, StudentLiveRoom, StudentCoursePlayer } from './components/StudentViews';
import { StudentTestPlayer } from './components/StudentTestPlayer';
import { TestReport } from './components/TestReport';
import { TeacherDashboardHome, TeacherCoursesPage, TeacherAssignmentsPage, TeacherReportsPage, LiveClassConsole, TeacherTestsPage } from './components/TeacherViews';
import { AdminDashboard, AdminUserManagement, AdminFinancials } from './components/AdminViews';
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
    <defs>
      <linearGradient id="indiaFlag" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0.2" stopColor="#FF9933" />
        <stop offset="0.5" stopColor="#FFFFFF" />
        <stop offset="0.8" stopColor="#138808" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Left Arc - Japan (White background with Red Sun) */}
    {/* Background for left arc to ensure white visibility on dark bg */}
    <path d="M46 10 A40 40 0 0 0 46 90" stroke="#FFFFFF" strokeWidth="20" />
    <circle cx="26" cy="50" r="8" fill="#BC002D" />
    
    {/* Right Arc - India (Tricolor Gradient) */}
    <path d="M54 10 A40 40 0 0 1 54 90" stroke="url(#indiaFlag)" strokeWidth="20" />
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
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(account.name)}&background=BC002D&color=fff`,
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
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(account.name)}&background=BC002D&color=fff`,
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
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 bg-seigaiha relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-zenro-red/10 to-transparent pointer-events-none"></div>
      
      <div className="w-full max-w-5xl bg-dark-800 rounded-3xl border border-dark-700 shadow-2xl flex flex-col md:flex-row overflow-hidden relative z-10 min-h-[600px]">
        
        {/* Left Side - Brand Visual */}
        <div className="md:w-1/2 bg-dark-900 relative p-12 flex flex-col justify-between border-r border-dark-700/50">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <ZenroLogo className="w-12 h-12" />
                    <h1 className="text-3xl font-black text-white tracking-tight">ZENRO</h1>
                </div>
                <h2 className="text-4xl font-bold text-white leading-tight font-serif">
                    Bridging <span className="text-zenro-red">Japan</span> <br/>
                    & <span className="text-zenro-orange">India</span> through <br/>
                    Excellence.
                </h2>
            </div>

            <div className="relative z-10 text-sm text-gray-400">
                <div className="flex gap-4 mb-2">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-zenro-red"></div> N5-N1 Training</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-zenro-green"></div> Career Placement</div>
                </div>
                <p>&copy; 2024 Zenro Institute Pvt Ltd.</p>
            </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center bg-dark-800/80 backdrop-blur">
            <div className="max-w-sm mx-auto w-full">
                <h3 className="text-2xl font-bold text-white mb-2">Welcome Back</h3>
                <p className="text-gray-400 mb-8 text-sm">Please login to access your portal.</p>

                {/* Quick Login Demo Buttons */}
                <div className="flex gap-2 mb-6 p-1 bg-dark-900 rounded-lg border border-dark-700">
                    <button onClick={() => loginAs('8888888888')} className="flex-1 py-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-dark-800 rounded transition flex items-center justify-center gap-2">
                        <Zap className="w-3 h-3 text-zenro-red" /> Sensei
                    </button>
                    <button onClick={() => loginAs('9999999999')} className="flex-1 py-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-dark-800 rounded transition flex items-center justify-center gap-2">
                        <Zap className="w-3 h-3 text-zenro-orange" /> Student
                    </button>
                    <button onClick={() => loginAs('7777777777')} className="flex-1 py-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-dark-800 rounded transition flex items-center justify-center gap-2">
                        <Zap className="w-3 h-3 text-zenro-green" /> Admin
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Student ID / Email</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3 w-5 h-5 text-dark-600" />
                            <input 
                                type="text" 
                                value={identifier}
                                onChange={handleIdentifierChange}
                                className="w-full bg-dark-900 border border-dark-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-zenro-red focus:ring-1 focus:ring-zenro-red outline-none transition"
                                placeholder="ID or Email"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
                        <div className="relative">
                            <Settings className="absolute left-3 top-3 w-5 h-5 text-dark-600" />
                            <input 
                                type="password"
                                value={password}
                                maxLength={20}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-dark-900 border border-dark-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-zenro-red focus:ring-1 focus:ring-zenro-red outline-none transition"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && <div className="text-zenro-red text-xs text-center bg-zenro-red/10 py-2 rounded border border-zenro-red/20">{error}</div>}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-zenro-red to-brand-800 hover:from-brand-600 hover:to-brand-900 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-zenro-red/20 disabled:opacity-50 mt-4"
                    >
                        {loading ? <div className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Authenticating...</div> : 'Login to Dashboard'}
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

// 2. Sidebar with Zenro Branding & Mobile Drawer Support
const Sidebar = ({ user, onLogout, isOpen, onClose }: { user: User, onLogout: () => void, isOpen: boolean, onClose: () => void }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path 
    ? "bg-brand-900/20 text-white border-r-4 border-zenro-red" 
    : "text-gray-400 hover:text-white hover:bg-dark-800/50";

  return (
    <>
      {/* Mobile Backdrop Overlay - "Levitating" Effect */}
      <div 
        className={`fixed inset-0 bg-black/80 z-40 lg:hidden transition-opacity duration-300 backdrop-blur-sm ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div className={`
        w-64 bg-dark-800/95 backdrop-blur border-r border-dark-700 flex flex-col h-screen 
        fixed left-0 top-0 z-50 font-sans shadow-2xl transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        {/* Tricolor Border Stripe */}
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-zenro-orange via-white to-zenro-green opacity-30"></div>

        {/* Mobile Close Button */}
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 bg-dark-700/50 text-gray-400 hover:text-white rounded-full lg:hidden z-10"
        >
            <X className="w-5 h-5" />
        </button>

        <div className="p-6 flex items-center gap-3 border-b border-dark-700/50 bg-dark-900/30">
          <div className="w-10 h-10 flex-shrink-0 bg-white/10 rounded-full p-1.5 border border-white/5">
              <ZenroLogo className="w-full h-full" />
          </div>
          <div>
              <h1 className="text-xl font-black tracking-tight text-white font-serif">ZENRO</h1>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest">Institute</p>
          </div>
        </div>
        
        <nav className="flex-1 px-3 space-y-1 mt-6 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-gray-500 uppercase mb-3 tracking-widest flex items-center gap-2">
              <span className="w-8 h-[1px] bg-gray-700"></span> MENU
          </p>
          
          {user.role === UserRole.STUDENT && (
            <>
              <Link to="/student/dashboard" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${isActive('/student/dashboard')}`}>
                <Layout className="w-4 h-4" />
                Overview
              </Link>
              <Link to="/student/courses" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${isActive('/student/courses')}`}>
                <Book className="w-4 h-4" />
                Curriculum
              </Link>
               <Link to="/student/tests" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${isActive('/student/tests')}`}>
               <FileText className="w-4 h-4" />
               Tests/Reports
             </Link>
              <Link to="/student/activities" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${isActive('/student/activities')}`}>
                <ListTodo className="w-4 h-4" />
                Practice
              </Link>
               <Link to="/student/fees" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${isActive('/student/fees')}`}>
                <CreditCard className="w-4 h-4" />
                Fees
              </Link>
               <Link to="/student/profile" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${isActive('/student/profile')}`}>
                <UserIcon className="w-4 h-4" />
                Profile
              </Link>
            </>
          )}

          {user.role === UserRole.TEACHER && (
             <>
               <Link to="/teacher/dashboard" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${isActive('/teacher/dashboard')}`}>
                 <Layout className="w-4 h-4" />
                 Overview
               </Link>
               <Link to="/teacher/courses" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${isActive('/teacher/courses')}`}>
                 <Book className="w-4 h-4" />
                 Classes
               </Link>
               <Link to="/teacher/tests" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${isActive('/teacher/tests')}`}>
                 <FileCheck className="w-4 h-4" />
                 Tests
               </Link>
               <Link to="/teacher/assignments" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${isActive('/teacher/assignments')}`}>
                 <FileText className="w-4 h-4" />
                 Assignments
               </Link>
               <Link to="/teacher/reports" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${isActive('/teacher/reports')}`}>
                 <BarChart2 className="w-4 h-4" />
                 Analytics
               </Link>
               <Link to="/teacher/live" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${isActive('/teacher/live')}`}>
                 <Video className="w-4 h-4" />
                 Live Console
               </Link>
             </>
          )}

          {user.role === UserRole.ADMIN && (
            <>
               <Link to="/admin/dashboard" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${isActive('/admin/dashboard')}`}>
                 <Layout className="w-4 h-4" />
                 Overview
               </Link>
               <Link to="/admin/users" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${isActive('/admin/users')}`}>
                 <Users className="w-4 h-4" />
                 User Mgmt
               </Link>
               <Link to="/admin/courses" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${isActive('/admin/courses')}`}>
                 <BookOpen className="w-4 h-4" />
                 Course Mgmt
               </Link>
               <Link to="/admin/reports" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${isActive('/admin/reports')}`}>
                 <BarChart2 className="w-4 h-4" />
                 Test Results
               </Link>
               <Link to="/admin/finance" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${isActive('/admin/finance')}`}>
                 <DollarSign className="w-4 h-4" />
                 Financials
               </Link>
               <Link to="/admin/settings" onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${isActive('/admin/settings')}`}>
                 <Settings className="w-4 h-4" />
                 Settings
               </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-dark-700/50 bg-dark-900/30">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-dark-800 border border-dark-700">
              <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full bg-dark-700 border border-dark-600 object-cover" />
              <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-zenro-orange truncate font-bold">{user.role}</p>
              </div>
              <button onClick={onLogout} className="p-1.5 hover:bg-dark-700 rounded-md transition text-gray-500 hover:text-white" title="Logout">
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

// 3. Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles, user }: ProtectedRouteProps) => {
  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on actual role
    if (user.role === UserRole.STUDENT) return <Navigate to="/student/dashboard" replace />;
    if (user.role === UserRole.TEACHER) return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === UserRole.ADMIN) return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// 4. Main App Layout Logic
const AppContent = ({ user, handleLogout, setIsExamMode }: any) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close sidebar automatically on route change (Mobile UX)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  return (
    <div className="flex h-screen bg-dark-900 text-white font-sans selection:bg-zenro-red selection:text-white overflow-hidden">
       {/* Mobile Header (Levitating Top Bar) */}
       <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-dark-900/90 backdrop-blur-md border-b border-white/10 z-40 flex items-center justify-between px-4 shadow-lg animate-fade-in-down">
          {/* Hamburger Menu (Left) */}
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
             <Menu className="w-6 h-6" />
          </button>
          
          {/* Branding (Center) */}
          <div className="flex items-center gap-2">
             <ZenroLogo className="w-8 h-8" />
             <span className="font-serif font-bold text-white tracking-tight text-lg">ZENRO</span>
          </div>
          
          {/* Profile (Right) - Clicking opens profile */}
          <button 
            onClick={() => {
                if(user.role === UserRole.STUDENT) navigate('/student/profile');
                // Could expand for other roles if they have profiles
            }} 
            className="w-10 h-10 rounded-full overflow-hidden border border-white/20 p-0.5 bg-gradient-to-br from-zenro-red to-zenro-orange shadow-lg active:scale-95 transition"
          >
             <img src={user.avatar} alt="Profile" className="w-full h-full object-cover rounded-full bg-dark-800" />
          </button>
       </div>

       <Sidebar 
         user={user} 
         onLogout={handleLogout} 
         isOpen={sidebarOpen} 
         onClose={() => setSidebarOpen(false)} 
       />
       
       {/* Main Content Area */}
       <main className="flex-1 overflow-auto p-4 lg:p-8 pt-20 lg:pt-8 bg-seigaiha relative scroll-smooth lg:ml-64 w-full transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-dark-800 to-transparent pointer-events-none -z-10"></div>
          
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
                <Route path="/student/profile" element={<ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}><StudentProfilePage user={user} /></ProtectedRoute>} />
                
                <Route path="/exam-intro" element={
                    <ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}>
                        <div className="p-8 flex justify-center items-center h-full">
                            <div className="bg-dark-800 p-8 rounded-xl max-w-md text-center border border-dark-700">
                                <ShieldAlert className="w-16 h-16 text-brand-500 mx-auto mb-4" />
                                <h1 className="text-2xl font-bold mb-2">JLPT Mock Exam</h1>
                                <p className="text-gray-400 mb-6">Duration: 60 mins • N4 Level</p>
                                <button onClick={() => setIsExamMode(true)} className="w-full bg-brand-600 py-3 rounded text-white font-bold hover:bg-brand-500">
                                    Start Examination
                                </button>
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                
                {/* Teacher Routes */}
                <Route path="/teacher/dashboard" element={<ProtectedRoute user={user} allowedRoles={[UserRole.TEACHER]}><TeacherDashboardHome /></ProtectedRoute>} />
                <Route path="/teacher/courses" element={<ProtectedRoute user={user} allowedRoles={[UserRole.TEACHER, UserRole.ADMIN]}><TeacherCoursesPage /></ProtectedRoute>} />
                <Route path="/teacher/tests" element={<ProtectedRoute user={user} allowedRoles={[UserRole.TEACHER, UserRole.ADMIN]}><TeacherTestsPage /></ProtectedRoute>} />
                <Route path="/teacher/assignments" element={<ProtectedRoute user={user} allowedRoles={[UserRole.TEACHER]}><TeacherAssignmentsPage /></ProtectedRoute>} />
                <Route path="/teacher/reports" element={<ProtectedRoute user={user} allowedRoles={[UserRole.TEACHER, UserRole.ADMIN]}><TeacherReportsPage /></ProtectedRoute>} />
                <Route path="/teacher/report/:submissionId" element={<ProtectedRoute user={user} allowedRoles={[UserRole.TEACHER, UserRole.ADMIN]}><TestReport role="TEACHER" /></ProtectedRoute>} />
                <Route path="/teacher/live" element={<ProtectedRoute user={user} allowedRoles={[UserRole.TEACHER]}><LiveClassConsole /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]}><AdminUserManagement /></ProtectedRoute>} />
                <Route path="/admin/finance" element={<ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]}><AdminFinancials /></ProtectedRoute>} />
                <Route path="/admin/courses" element={<ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]}><TeacherCoursesPage /></ProtectedRoute>} />
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

  // SESSION PERSISTENCE LOGIC
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedSession = localStorage.getItem('zenro_session');
        if (storedSession) {
          const parsedUser = JSON.parse(storedSession);
          setUser(parsedUser);
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
    // Save to local storage for persistence
    localStorage.setItem('zenro_session', JSON.stringify(newUser));
    setUser(newUser);
  };

  const handleLogout = () => {
    // Explicitly clear session on logout
    localStorage.removeItem('zenro_session');
    setUser(null);
  };

  // Prevent flash of login screen while checking session
  if (isSessionLoading) {
     return (
        <div className="h-screen w-full bg-dark-900 flex flex-col items-center justify-center text-white space-y-4">
            <ZenroLogo className="w-24 h-24 animate-pulse" />
            <div className="flex items-center gap-2 text-zenro-red">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="font-bold">Loading Zenro Portal...</span>
            </div>
        </div>
     );
  }

  // If not logged in, show Login Screen
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // If in Exam Mode, hijack screen
  if (isExamMode) {
    return <ExamPortal onExit={() => setIsExamMode(false)} />;
  }

  return (
    <LiveProvider user={user}>
      <Router>
         <AppContent user={user} handleLogout={handleLogout} setIsExamMode={setIsExamMode} />
      </Router>
    </LiveProvider>
  );
}
