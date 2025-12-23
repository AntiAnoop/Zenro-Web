
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Clock, Calendar, AlertCircle, CheckCircle, 
  CreditCard, Download, User as UserIcon, MapPin, 
  Phone, Mail, Shield, BookOpen, ChevronRight, Lock,
  Video, BarChart2, ListTodo, FileText, Activity, Briefcase,
  Languages, GraduationCap, Globe, Zap, MessageCircle, Send, Users, Mic, MicOff, Hand, RefreshCw, Loader2,
  FileCheck, ArrowLeft, Menu, File, Film, AlertTriangle, Monitor, WifiOff, Upload, CheckSquare, X, Eye, ChevronDown,
  Camera, Edit2, Trash2, ChevronLeft, Radio
} from 'lucide-react';
import { User, Course, FeeRecord, Transaction, TestResult, ActivityItem, CourseModule, CourseMaterial, Schedule, Assignment, AssignmentSubmission, Test } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useLiveSession } from '../context/LiveContext';
import { supabase } from '../services/supabaseClient';
import { jsPDF } from "jspdf";

// --- STUDENT DASHBOARD ---

export const StudentDashboardHome = () => {
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const userData = localStorage.getItem('zenro_session');
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
      const fetchSchedule = async () => {
          if (!user?.batch) return;
          const { data } = await supabase.from('schedules')
            .select('*, profiles(full_name)')
            .eq('batch_name', user.batch)
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(2);
          if(data) setSchedule(data.map((s:any) => ({...s, teacher_name: s.profiles?.full_name})));
      };
      fetchSchedule();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[40px] p-10 border border-gray-100 relative overflow-hidden flex flex-col justify-center shadow-xl shadow-slate-200/50">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-zenro-red/5 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-5xl font-heading font-black text-zenro-blue tracking-tighter mb-4 leading-tight">Ohayou, <br/><span className="text-zenro-red">{user?.name.split(' ')[0]}-san!</span></h2>
            <p className="text-gray-400 text-xl font-light mb-10 leading-relaxed">Ready to level up your Japanese skills today?</p>
            <div className="flex gap-4">
                <Link to="/student/schedule" className="bg-zenro-blue text-white font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-slate-900 transition shadow-xl shadow-blue-900/20 flex items-center gap-3">
                    <Calendar className="w-4 h-4" /> View Schedule
                </Link>
                <Link to="/student/courses" className="bg-gray-50 text-slate-800 font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-gray-100 transition flex items-center gap-3">
                    <BookOpen className="w-4 h-4" /> My Courses
                </Link>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/40">
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)]"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Next Live Class</span>
                </div>
                {schedule.length > 0 ? (
                    <div className="space-y-6">
                        <h3 className="text-3xl font-heading font-black tracking-tight leading-tight">{schedule[0].title}</h3>
                        <div className="flex items-center gap-4 py-6 border-y border-white/10">
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(schedule[0].teacher_name || 'T')}&background=E60012&color=fff`} className="w-12 h-12 rounded-2xl shadow-lg" alt="" />
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">Instructor</p>
                                <p className="text-sm font-bold">{schedule[0].teacher_name}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-3xl font-black font-mono">{new Date(schedule[0].start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false})}</span>
                            <Link to="/student/live" className="p-4 bg-zenro-red rounded-2xl hover:scale-110 active:scale-90 transition-all shadow-xl shadow-red-900/20">
                                <Play className="w-6 h-6 fill-white" />
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="py-10 text-center opacity-30">
                        <Monitor className="w-16 h-16 mx-auto mb-4" />
                        <p className="font-bold text-sm uppercase tracking-widest">No classes today</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

// --- SCHEDULE PAGE ---

export const StudentSchedulePage = () => {
    const [events, setEvents] = useState<Schedule[]>([]);
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

            const { data } = await supabase.from('schedules')
                .select('*, profiles(full_name)')
                .eq('batch_name', user.batch)
                .gte('start_time', start.toISOString())
                .lte('start_time', end.toISOString())
                .order('start_time', { ascending: true });
            
            if (data) setEvents(data.map((s:any) => ({...s, teacher_name: s.profiles?.full_name})));
            setLoading(false);
        };
        fetch();
    }, [currentDate]);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(currentDate); d.setDate(currentDate.getDate() - currentDate.getDay() + i); return d;
    });

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-heading font-black text-zenro-blue tracking-tighter">Academic Planner</h1>
                    <p className="text-gray-400 font-medium">Batch: <span className="text-zenro-red font-black uppercase tracking-widest text-[10px] ml-2">{user?.batch}</span></p>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl">
                    <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))} className="p-3 bg-white shadow-sm rounded-xl text-slate-400 hover:text-zenro-blue transition-all"><ChevronLeft className="w-5 h-5"/></button>
                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-800 w-40 text-center">Week of {weekDays[0].toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                    <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))} className="p-3 bg-white shadow-sm rounded-xl text-slate-400 hover:text-zenro-blue transition-all"><ChevronRight className="w-5 h-5"/></button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
                {weekDays.map((day, idx) => {
                    const dayEvents = events.filter(e => new Date(e.start_time).toDateString() === day.toDateString());
                    const isToday = new Date().toDateString() === day.toDateString();

                    return (
                        <div key={idx} className={`flex flex-col gap-4 ${isToday ? 'scale-105' : ''}`}>
                            <div className={`p-6 rounded-[30px] text-center transition-all duration-500 shadow-xl ${isToday ? 'bg-zenro-blue text-white shadow-blue-900/30 ring-8 ring-blue-500/10' : 'bg-white text-slate-300 border border-gray-50 shadow-slate-200/50'}`}>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{day.toLocaleDateString(undefined, {weekday:'short'})}</p>
                                <p className="text-2xl font-black font-mono">{day.getDate()}</p>
                            </div>
                            
                            <div className="space-y-4">
                                {dayEvents.map(ev => {
                                    const isLive = new Date() >= new Date(ev.start_time) && new Date() <= new Date(ev.end_time);
                                    return (
                                        <div key={ev.id} className={`p-6 rounded-[30px] border shadow-2xl shadow-slate-200/30 transition-all duration-500 group relative overflow-hidden ${isLive ? 'bg-red-50 border-red-200 ring-4 ring-red-500/10' : 'bg-white border-gray-50 hover:border-zenro-blue/30'}`}>
                                            {isLive && <div className="absolute top-0 right-0 w-2 h-full bg-zenro-red animate-pulse"></div>}
                                            <div className="flex justify-between items-start mb-6">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${isLive ? 'text-red-600' : 'text-zenro-blue opacity-30'}`}>
                                                    {new Date(ev.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false})}
                                                </span>
                                            </div>
                                            <h4 className="font-black text-slate-800 text-sm leading-tight mb-4">{ev.title}</h4>
                                            <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                <div className="w-5 h-5 rounded-lg bg-gray-100 flex items-center justify-center"><UserIcon className="w-3 h-3" /></div>
                                                <span className="truncate">{ev.teacher_name?.split(' ')[0]}</span>
                                            </div>
                                            {isLive && (
                                                <Link to="/student/live" className="mt-6 flex items-center justify-center gap-2 bg-zenro-red text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-900/20 active:scale-95 transition-all">
                                                    Join Room <Radio className="w-3 h-3" />
                                                </Link>
                                            )}
                                        </div>
                                    );
                                })}
                                {dayEvents.length === 0 && <div className="h-32 rounded-[30px] border-2 border-dashed border-gray-100 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-200 rotate-90 origin-center translate-y-4">Vacant</div>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- MISC PLACEHOLDERS ---
export const StudentCoursesPage = () => <div className="p-10 text-gray-400 font-bold uppercase tracking-widest">Accessing Your Curriculum Repository...</div>;
export const StudentLiveRoom = ({ user }: { user: User }) => <div className="p-10 text-center font-black text-zenro-red animate-pulse">Connecting to Media Server...</div>;
export const StudentTestsPage = () => <div className="p-10">Exam Center Loading...</div>;
export const StudentActivityPage = () => <div className="p-10">Practice Arena Loading...</div>;
export const StudentFeesPage = ({ user }: { user: User }) => <div className="p-10">Financial Invoices Hub...</div>;
export const StudentProfilePage = ({ user }: any) => <div className="p-10">Student Identity Profile: {user.name}</div>;
export const StudentCoursePlayer = () => <div className="p-10">Media Player Engine...</div>;
