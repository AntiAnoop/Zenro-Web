import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { BookOpen, BarChart2, ShieldAlert, Layout, LogOut, Play, User as UserIcon, Settings, MessageSquare, Video, CreditCard, Layers, Book, ListTodo, FileText, Globe, DollarSign, Users, Zap, Loader2 } from 'lucide-react';
import { User, UserRole } from './types';
import { ExamPortal } from './components/ExamPortal';
import { StudentDashboardHome, StudentFeesPage, StudentProfilePage, StudentCoursesPage, StudentTestsPage, StudentActivityPage, StudentLiveRoom } from './components/StudentViews';
import { StudentTestPlayer } from './components/StudentTestPlayer';
import { TestReport } from './components/TestReport';
import { TeacherDashboardHome, TeacherCoursesPage, TeacherAssignmentsPage, TeacherReportsPage, LiveClassConsole } from './components/TeacherViews';
import { AdminDashboard, AdminUserManagement, AdminFinancials } from './components/AdminViews';
import { LiveProvider } from './context/LiveContext';
import { supabase } from './services/supabaseClient';

// --- MOCK DATA ---
const CREDENTIALS: Record<string, {pass: string, role: UserRole, name: string, id: string}> = {
  '9999999999': { pass: '9999999999', role: UserRole.STUDENT, name: 'Alex Student', id: 's1' },
  '8888888888': { pass: '8888888888', role: UserRole.TEACHER, name: 'Tanaka Sensei', id: 't1' },
  '7777777777': { pass: '7777777777', role: UserRole.ADMIN, name: 'Admin', id: 'a1' }
};

// --- COMPONENTS ---

const ZenroLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="indiaFlag" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0.2" stopColor="#FF9933" />
        <stop offset="0.5" stopColor="#FFFFFF" />
        <stop offset="0.8" stopColor="#138808" />
      </linearGradient>
    </defs>
    {/* Left Arc - Japan (White background with Red Sun) */}
    <path d="M46 10 A40 40 0 0 0 46 90" stroke="#F5F5F5" strokeWidth="20" />
    <circle cx="26" cy="50" r="7" fill="#BC002D" />
    
    {/* Right Arc - India (Tricolor Gradient) */}
    <path d="M54 10 A40 40 0 0 1 54 90" stroke="url(#indiaFlag)" strokeWidth="20" />
  </svg>
);

// 1. Login Screen with Japanese Theme
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
        // 1. Check Hardcoded Mocks First (Quick Fallback)
        const account = CREDENTIALS[identifier];
        if (account && account.pass === password) {
            onLogin({
                id: account.id,
                name: account.name,
                role: account.role,
                email: `${identifier}@zenro.jp`,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(account.name)}&background=BC002D&color=fff`,
                batch: '2024-A' // Mock batch
            });
            setLoading(false);
            return;
        }

        // 2. Check Local Storage (For Robust Demo Mode)
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

        // 3. Check Supabase 'profiles' table
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
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/seigaiha.png')]">
      <div className="w-full max-w-md bg-dark-800 p-8 rounded-2xl border border-dark-700 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-brand-500"></div>
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-dark-900/50 rounded-full flex items-center justify-center border-4 border-dark-700 shadow-xl p-2">
             <ZenroLogo className="w-full h-full" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white text-center mb-2 font-sans">ZENRO</h2>
        <p className="text-center text-gray-400 mb-8 tracking-widest text-xs uppercase">Japanese Language Institute</p>
        
        {/* Quick Login Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={() => loginAs('8888888888')} className="flex items-center justify-center gap-2 p-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-xs font-bold text-white border border-dark-600 transition">
                <Zap className="w-4 h-4 text-brand-500" /> Sensei Login
            </button>
            <button onClick={() => loginAs('9999999999')} className="flex items-center justify-center gap-2 p-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-xs font-bold text-white border border-dark-600 transition">
                <Zap className="w-4 h-4 text-blue-500" /> Student Login
            </button>
        </div>

        <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dark-600"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-dark-800 px-2 text-gray-500">Or sign in with ID</span></div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Student ID / Email / Phone</label>
            <input 
              type="text" 
              value={identifier}
              onChange={handleIdentifierChange}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder-gray-600 transition"
              placeholder="Enter your registered ID..."
              
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <input 
              type="password"
              value={password}
              maxLength={20}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder-gray-600 transition"
              placeholder="••••••••"
              
            />
          </div>

          {error && <div className="text-red-500 text-sm text-center bg-red-500/10 py-2 rounded">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-brand-600/20 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In (ログイン)'}
          </button>
        </form>
      </div>
    </div>
  );
};

// 2. Sidebar
const Sidebar = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path ? "bg-brand-900/40 text-brand-500 border-r-4 border-brand-500" : "text-gray-400 hover:text-white hover:bg-dark-800";

  return (
    <div className="w-64 bg-dark-900 border-r border-dark-800 flex flex-col h-screen fixed left-0 top-0 z-10 font-sans">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 flex-shrink-0">
            <ZenroLogo className="w-full h-full" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">ZENRO</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        <p className="px-4 text-xs font-semibold text-gray-600 uppercase mb-2 tracking-widest">Navigation</p>
        
        {user.role === UserRole.STUDENT && (
          <>
            <Link to="/student/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all ${isActive('/student/dashboard')}`}>
              <Layout className="w-5 h-5" />
              Overview
            </Link>
            <Link to="/student/courses" className={`flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all ${isActive('/student/courses')}`}>
              <Book className="w-5 h-5" />
              Curriculum
            </Link>
             <Link to="/student/tests" className={`flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all ${isActive('/student/tests')}`}>
             <FileText className="w-5 h-5" />
             JLPT Results
           </Link>
            <Link to="/student/activities" className={`flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all ${isActive('/student/activities')}`}>
              <ListTodo className="w-5 h-5" />
              Practice
            </Link>
             <Link to="/student/fees" className={`flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all ${isActive('/student/fees')}`}>
              <CreditCard className="w-5 h-5" />
              Tuition
            </Link>
             <Link to="/student/profile" className={`flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all ${isActive('/student/profile')}`}>
              <UserIcon className="w-5 h-5" />
              Profile
            </Link>
          </>
        )}

        {user.role === UserRole.TEACHER && (
           <>
             <Link to="/teacher/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all ${isActive('/teacher/dashboard')}`}>
               <Layout className="w-5 h-5" />
               Overview
             </Link>
             <Link to="/teacher/courses" className={`flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all ${isActive('/teacher/courses')}`}>
               <Book className="w-5 h-5" />
               Classes
             </Link>
             <Link to="/teacher/assignments" className={`flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all ${isActive('/teacher/assignments')}`}>
               <FileText className="w-5 h-5" />
               Assignments
             </Link>
             <Link to="/teacher/reports" className={`flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all ${isActive('/teacher/reports')}`}>
               <BarChart2 className="w-5 h-5" />
               Analytics
             </Link>
             <Link to="/teacher/live" className={`flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all ${isActive('/teacher/live')}`}>
               <Video className="w-5 h-5" />
               Live Console
             </Link>
           </>
        )}

        {user.role === UserRole.ADMIN && (
          <>
             <Link to="/admin/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all ${isActive('/admin/dashboard')}`}>
               <Layout className="w-5 h-5" />
               Overview
             </Link>
             <Link to="/admin/users" className={`flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all ${isActive('/admin/users')}`}>
               <Users className="w-5 h-5" />
               User Mgmt
             </Link>
             <Link to="/admin/courses" className={`flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all ${isActive('/admin/courses')}`}>
               <BookOpen className="w-5 h-5" />
               Course Mgmt
             </Link>
             <Link to="/admin/reports" className={`flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all ${isActive('/admin/reports')}`}>
               <BarChart2 className="w-5 h-5" />
               Test Results
             </Link>
             <Link to="/admin/finance" className={`flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all ${isActive('/admin/finance')}`}>
               <DollarSign className="w-5 h-5" />
               Financials
             </Link>
             <Link to="/admin/settings" className={`flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all ${isActive('/admin/settings')}`}>
               <Settings className="w-5 h-5" />
               Settings
             </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-dark-800">
        <div className="flex items-center gap-3 px-4 py-3">
            <img src={user.avatar} alt="User" className="w-9 h-9 rounded-full bg-gray-700 border border-dark-600" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate capitalize">{user.role === UserRole.TEACHER ? 'Sensei' : user.role === UserRole.ADMIN ? 'Administrator' : 'Student'}</p>
            </div>
            <button onClick={onLogout} className="p-2 hover:bg-dark-800 rounded-full transition text-gray-500 hover:text-white" title="Logout">
                <LogOut className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
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
            <div className="flex items-center gap-2 text-brand-500">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="font-bold">Loading Session...</span>
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
        <div className="flex h-screen bg-dark-900 text-white font-sans selection:bg-brand-500 selection:text-white">
          <Sidebar user={user} onLogout={handleLogout} />
          <main className="ml-64 flex-1 overflow-auto p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
            <Routes>
              <Route path="/" element={
                 user.role === UserRole.STUDENT ? <Navigate to="/student/dashboard" /> : 
                 user.role === UserRole.TEACHER ? <Navigate to="/teacher/dashboard" /> : <Navigate to="/admin/dashboard" />
              } />
              
              {/* Student Routes */}
              <Route path="/student/dashboard" element={<ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}><StudentDashboardHome /></ProtectedRoute>} />
              <Route path="/student/courses" element={<ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}><StudentCoursesPage /></ProtectedRoute>} />
              <Route path="/student/live" element={<ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}><StudentLiveRoom user={user} /></ProtectedRoute>} />
              <Route path="/student/tests" element={<ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}><StudentTestsPage /></ProtectedRoute>} />
              <Route path="/student/test/:testId" element={<ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}><StudentTestPlayer /></ProtectedRoute>} />
              <Route path="/student/report/:submissionId" element={<ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}><TestReport role="STUDENT" /></ProtectedRoute>} />
              <Route path="/student/activities" element={<ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}><StudentActivityPage /></ProtectedRoute>} />
              <Route path="/student/fees" element={<ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}><StudentFeesPage /></ProtectedRoute>} />
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
          </main>
        </div>
      </Router>
    </LiveProvider>
  );
}