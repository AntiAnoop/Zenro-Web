
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Users, BookOpen, Clock, Plus, Video, 
  MessageSquare, BarChart2, Calendar, FileText, 
  CheckCircle, AlertTriangle, MoreVertical, X,
  Mic, MicOff, Camera, CameraOff, Monitor, Languages,
  ChevronRight, Filter, Search, Download, Trash2, Upload,
  Layers, ChevronDown, Save, Eye, Paperclip, Film, PlayCircle,
  Briefcase, GraduationCap, Loader2, Edit3, Globe, Lock, AlertCircle, Check, WifiOff,
  FileCheck, HelpCircle, CheckSquare, Target, ChevronLeft, Radio
} from 'lucide-react';
import { Course, Assignment, StudentPerformance, CourseModule, CourseMaterial, User, Test, Question, Schedule, LiveSessionRecord } from '../types';
import { generateClassSummary } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLiveSession } from '../context/LiveContext';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

// --- UI HELPERS ---
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
    <div className={`fixed bottom-6 right-6 z-[200] px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in-up transition-all ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
        {type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
        <p className="font-bold text-sm">{message}</p>
        <button onClick={onClose} className="ml-4 hover:bg-white/20 rounded-full p-1"><X className="w-4 h-4" /></button>
    </div>
);

// --- COMPONENTS ---

export const TeacherDashboardHome = () => {
  const [upcoming, setUpcoming] = useState<Schedule[]>([]);
  const userData = localStorage.getItem('zenro_session');
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
      const fetchSchedule = async () => {
          if (!user) return;
          const { data } = await supabase.from('schedules')
            .select('*')
            .eq('teacher_id', user.id)
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(3);
          if (data) setUpcoming(data);
      };
      fetchSchedule();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-zenro-slate">Sensei Dashboard</h1>
          <p className="text-gray-500">Manage your Japanese language classes and student progress.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center gap-4 hover:shadow-md transition shadow-sm">
            <div className="p-4 rounded-lg bg-blue-100"><Users className="w-8 h-8 text-blue-600" /></div>
            <div><p className="text-gray-500 text-sm font-semibold uppercase">Total Students</p><h3 className="text-3xl font-bold text-zenro-slate mt-1">142</h3></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center gap-4 hover:shadow-md transition shadow-sm">
            <div className="p-4 rounded-lg bg-red-100"><BookOpen className="w-8 h-8 text-red-600" /></div>
            <div><p className="text-gray-500 text-sm font-semibold uppercase">Active Batches</p><h3 className="text-3xl font-bold text-zenro-slate mt-1">4</h3></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center gap-4 hover:shadow-md transition shadow-sm">
            <div className="p-4 rounded-lg bg-yellow-100"><BarChart2 className="w-8 h-8 text-yellow-600" /></div>
            <div><p className="text-gray-500 text-sm font-semibold uppercase">Pass Rate</p><h3 className="text-3xl font-bold text-zenro-slate mt-1">94%</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-zenro-slate mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-zenro-red" /> Upcoming Schedule
            </h3>
            <div className="space-y-4">
                {upcoming.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No upcoming classes scheduled.</p>
                ) : upcoming.map(s => (
                    <div key={s.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-zenro-red">
                        <div className="text-center w-16">
                            <p className="text-zenro-red font-bold">{new Date(s.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            <p className="text-xs text-gray-500">{new Date(s.start_time).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <h4 className="text-zenro-slate font-bold">{s.title}</h4>
                            <p className="text-sm text-gray-500">Batch: <span className="font-bold text-blue-600">{s.batch_name}</span></p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
             <h3 className="text-xl font-bold text-zenro-slate mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" /> Needs Attention
            </h3>
            <div className="space-y-3">
                 <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                     <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center text-red-700 font-bold text-xs">J</div>
                         <div>
                             <p className="text-zenro-slate text-sm font-bold">John Doe</p>
                             <p className="text-xs text-red-500">Low Attendance (45%)</p>
                         </div>
                     </div>
                     <button className="text-xs text-gray-500 hover:text-zenro-red underline">Contact</button>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export const TeacherSchedulePage = () => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [batches, setBatches] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ title: '', batch: '', date: '', time: '', duration: 60 });
    
    const userData = localStorage.getItem('zenro_session');
    const user = userData ? JSON.parse(userData) : null;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        // Fetch Batches
        const { data: batchData } = await supabase.from('batches').select('name');
        if (batchData) setBatches(batchData.map(b => b.name));

        // Fetch Schedules
        if (user) {
            const { data: schedData } = await supabase
                .from('schedules')
                .select('*')
                .eq('teacher_id', user.id)
                .order('start_time', { ascending: true });
            if (schedData) setSchedules(schedData);
        }
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        const start = new Date(`${form.date}T${form.time}`);
        const end = new Date(start.getTime() + form.duration * 60000);

        const { error } = await supabase.from('schedules').insert({
            teacher_id: user.id,
            title: form.title,
            batch_name: form.batch,
            start_time: start.toISOString(),
            end_time: end.toISOString()
        });

        if (!error) {
            setIsModalOpen(false);
            fetchData();
            setForm({ title: '', batch: '', date: '', time: '', duration: 60 });
        } else {
            alert("Failed to schedule class");
        }
    };

    const deleteSchedule = async (id: string) => {
        if(!confirm("Cancel this class?")) return;
        await supabase.from('schedules').delete().eq('id', id);
        fetchData();
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-zenro-slate">Class Schedule</h1>
                    <p className="text-gray-500">Manage live lectures and batch timings.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-zenro-red hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm">
                    <Plus className="w-5 h-5" /> Schedule Class
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Upcoming Lectures</h3>
                </div>
                {loading ? <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-zenro-red"/></div> : 
                 schedules.length === 0 ? <div className="p-12 text-center text-gray-500">No classes scheduled.</div> :
                 <div className="divide-y divide-gray-100">
                    {schedules.map(sched => (
                        <div key={sched.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex gap-6 items-center">
                                <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-center min-w-[80px]">
                                    <p className="text-xs font-bold uppercase">{new Date(sched.start_time).toLocaleString('default', { month: 'short' })}</p>
                                    <p className="text-xl font-bold">{new Date(sched.start_time).getDate()}</p>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-800">{sched.title}</h4>
                                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(sched.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(sched.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        <span className="flex items-center gap-1"><Layers className="w-4 h-4" /> {sched.batch_name}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => deleteSchedule(sched.id)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 className="w-5 h-5" /></button>
                        </div>
                    ))}
                 </div>
                }
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Schedule New Class</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Topic</label>
                                <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border border-gray-300 rounded p-2 text-sm" placeholder="e.g. Grammar N4 Chapter 5" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Batch</label>
                                <select required value={form.batch} onChange={e => setForm({...form, batch: e.target.value})} className="w-full border border-gray-300 rounded p-2 text-sm">
                                    <option value="">Select Batch</option>
                                    {batches.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                                    <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border border-gray-300 rounded p-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time</label>
                                    <input required type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="w-full border border-gray-300 rounded p-2 text-sm" />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-zenro-red text-white rounded font-bold hover:bg-red-700">Schedule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export const LiveClassConsole = () => {
  const { 
    isLive, topic, viewerCount, startSession, endSession, 
    connectionState, chatMessages, sendMessage, localStream, enablePreview, toggleMic, toggleCamera
  } = useLiveSession();
  
  const [topicInput, setTopicInput] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [msgInput, setMsgInput] = useState('');
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  
  // Track DB Session ID
  const [currentDbSessionId, setCurrentDbSessionId] = useState<string | null>(null);
  const userData = localStorage.getItem('zenro_session');
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
     if (localStream && localVideoRef.current) {
         localVideoRef.current.srcObject = localStream;
     }
  }, [localStream]);

  useEffect(() => {
      // Fetch Batches for dropdown
      const loadBatches = async () => {
          const { data } = await supabase.from('batches').select('name');
          if (data) setAvailableBatches(data.map(b => b.name));
      };
      loadBatches();
  }, []);

  const handleToggleMic = () => {
      toggleMic(!micOn);
      setMicOn(!micOn);
  }

   const handleToggleCam = () => {
      toggleCamera(!camOn);
      setCamOn(!camOn);
  }

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if(msgInput.trim()) {
          sendMessage('Tanaka Sensei', msgInput);
          setMsgInput('');
      }
  }

  const handleGenerateSummary = async () => {
      setIsGeneratingSummary(true);
      const text = chatMessages.map(m => `${m.user}: ${m.text}`).join('\n') + "\n" + (transcript || "Instructor discussed Japanese grammar points related to the causative form.");
      const result = await generateClassSummary(text);
      setSummary(result);
      setIsGeneratingSummary(false);
  }

  const handleStartLive = async () => {
      if (!topicInput || !selectedBatch) {
          alert("Please enter a topic and select a batch.");
          return;
      }
      
      // 1. Create DB Record
      const { data, error } = await supabase.from('live_sessions').insert({
          teacher_id: user.id,
          batch_name: selectedBatch,
          topic: topicInput,
          status: 'LIVE'
      }).select().single();

      if (error) {
          console.error("Failed to log session start", error);
          alert("Database Error: Could not log session.");
          return;
      }

      setCurrentDbSessionId(data.id);

      // 2. Start WebRTC Session
      await startSession(topicInput);
  };

  const handleEndLive = async () => {
      // 1. Update DB Record
      if (currentDbSessionId) {
          await supabase.from('live_sessions').update({
              status: 'ENDED',
              end_time: new Date().toISOString()
          }).eq('id', currentDbSessionId);
      }
      setCurrentDbSessionId(null);

      // 2. End WebRTC Session
      endSession();
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col gap-4 animate-fade-in">
        <div className="flex justify-between items-center">
             <div>
                 <h1 className="text-2xl font-heading font-bold text-zenro-slate flex items-center gap-2">
                     <Video className="w-6 h-6 text-zenro-red" /> Live Classroom Console
                 </h1>
                 <p className="text-gray-500 text-sm">Control your broadcast and interact with students.</p>
             </div>
             <div className="flex items-center gap-4">
                 {isLive ? (
                     <div className="flex items-center gap-4">
                         <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-2">
                             <span className="w-2 h-2 bg-red-600 rounded-full"></span> LIVE
                         </div>
                         <div className="text-sm font-bold text-gray-600 flex items-center gap-2">
                             <Users className="w-4 h-4" /> {viewerCount} Viewers
                         </div>
                         <button onClick={handleEndLive} className="bg-gray-800 text-white hover:bg-black px-6 py-2 rounded-lg font-bold text-sm shadow-md transition">End Class</button>
                     </div>
                 ) : (
                     <div className="flex items-center gap-2">
                         <select 
                            value={selectedBatch}
                            onChange={e => setSelectedBatch(e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm w-40 outline-none focus:border-zenro-blue"
                         >
                             <option value="">Select Batch</option>
                             {availableBatches.map(b => <option key={b} value={b}>{b}</option>)}
                         </select>
                         <input 
                            type="text" 
                            placeholder="Enter Class Topic..." 
                            value={topicInput}
                            onChange={e => setTopicInput(e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 outline-none focus:border-zenro-blue"
                         />
                         <button 
                            onClick={handleStartLive}
                            className="bg-zenro-red text-white hover:bg-red-700 px-6 py-2 rounded-lg font-bold text-sm shadow-md flex items-center gap-2 transition"
                         >
                             <Radio className="w-4 h-4" /> Go Live
                         </button>
                     </div>
                 )}
             </div>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden">
            {/* Main Video Area */}
            <div className="flex-1 bg-black rounded-xl overflow-hidden relative shadow-2xl flex flex-col group">
                {localStream ? (
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-900">
                        <CameraOff className="w-16 h-16 mb-4 opacity-50" />
                        <p className="font-bold">Camera is Off</p>
                        <button onClick={enablePreview} className="mt-4 text-zenro-blue underline text-sm hover:text-white">Enable Preview</button>
                    </div>
                )}
                
                {/* Controls Overlay */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-gray-900/80 backdrop-blur p-3 rounded-full border border-gray-700 shadow-xl transition-opacity opacity-0 group-hover:opacity-100">
                    <button onClick={handleToggleMic} className={`p-3 rounded-full ${micOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-600 text-white'}`}>
                        {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </button>
                    <button onClick={handleToggleCam} className={`p-3 rounded-full ${camOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-600 text-white'}`}>
                        {camOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                    </button>
                     <button className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white">
                        <Monitor className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Side Panel: Chat & AI Summary */}
            <div className="w-96 flex flex-col gap-4">
                {/* Chat */}
                <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="p-3 border-b border-gray-200 bg-gray-50 font-bold text-sm text-zenro-slate flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Live Chat
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                        {chatMessages.map((m, i) => (
                             <div key={i} className="text-sm">
                                 <p className="text-xs font-bold text-gray-500 mb-0.5">{m.user} <span className="text-[10px] font-normal opacity-70 ml-1">{m.timestamp}</span></p>
                                 <p className="text-slate-700">{m.text}</p>
                             </div>
                        ))}
                    </div>
                    <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-gray-50">
                        <input 
                            type="text" 
                            value={msgInput}
                            onChange={e => setMsgInput(e.target.value)}
                            placeholder="Send a message..." 
                            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-zenro-blue"
                        />
                    </form>
                </div>

                {/* AI Summary Tool */}
                <div className="h-64 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                     <div className="p-3 border-b border-gray-200 bg-gray-50 font-bold text-sm text-zenro-slate flex items-center justify-between">
                        <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-zenro-red" /> AI Summary</div>
                        <button onClick={handleGenerateSummary} disabled={isGeneratingSummary} className="text-[10px] bg-zenro-blue text-white px-2 py-1 rounded hover:bg-blue-800 disabled:opacity-50">
                            {isGeneratingSummary ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto text-xs text-slate-600 leading-relaxed">
                        {summary ? (
                            <div className="prose prose-sm max-w-none">
                                {summary.split('\n').map((line, i) => <p key={i} className="mb-1">{line}</p>)}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic text-center mt-8">Start the class and generate a summary afterwards.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export const TeacherTestsPage = () => {
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreatorOpen, setIsCreatorOpen] = useState(false);
    const [editingTest, setEditingTest] = useState<Test | null>(null);
    const [statusModal, setStatusModal] = useState<{ test: Test, targetStatus: boolean } | null>(null);
    const [deleteModal, setDeleteModal] = useState<Test | null>(null);
    const [viewingResults, setViewingResults] = useState<Test | null>(null);

    useEffect(() => { fetchTests(); }, []);

    const fetchTests = async () => {
        setLoading(true);
        try { const { data, error } = await supabase.from('tests').select('*').order('created_at', { ascending: false }); if (error) throw error; setTests(data || []); } catch (e) { console.error("Fetch Tests Error:", e); } finally { setLoading(false); }
    };

    const confirmStatusChange = async () => {
        if(!statusModal) return;
        try { await supabase.from('tests').update({ is_active: statusModal.targetStatus }).eq('id', statusModal.test.id); setTests(prev => prev.map(t => t.id === statusModal.test.id ? { ...t, is_active: statusModal.targetStatus } : t)); setStatusModal(null); } catch (e) { console.error("Update Error:", e); alert("Failed to update status"); }
    };

    const confirmDelete = async () => {
        if(!deleteModal) return;
        try { await supabase.from('test_batches').delete().eq('test_id', deleteModal.id); await supabase.from('test_enrollments').delete().eq('test_id', deleteModal.id); await supabase.from('questions').delete().eq('test_id', deleteModal.id); await supabase.from('tests').delete().eq('id', deleteModal.id); fetchTests(); setDeleteModal(null); } catch (e) { console.error("Delete Error:", e); alert("Failed to delete test."); }
    };

    return (
        <div className="space-y-8 animate-fade-in relative">
            <div className="flex justify-between items-center">
                <div><h1 className="text-3xl font-heading font-bold text-zenro-slate">Test Management</h1><p className="text-gray-500">Create, edit and manage exams.</p></div>
                <button onClick={() => { setEditingTest(null); setIsCreatorOpen(true); }} className="bg-zenro-red hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm"><Plus className="w-5 h-5" /> Create Assessment</button>
            </div>

            {loading ? <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-zenro-red animate-spin" /></div> : tests.length === 0 ? <div className="text-center p-12 bg-white rounded-xl border border-gray-200"><p className="text-gray-500">No tests found.</p></div> : (
                <div className="grid grid-cols-1 gap-4">
                    {tests.map(test => (
                        <div key={test.id} className="bg-white p-6 rounded-xl border border-gray-200 flex justify-between items-center hover:shadow-md transition shadow-sm group">
                            <div className="cursor-pointer flex-1" onClick={() => setViewingResults(test)}>
                                <div className="flex items-center gap-3 mb-1"><h3 className="text-xl font-bold text-zenro-slate group-hover:text-zenro-red transition">{test.title}</h3><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${test.is_active ? 'bg-green-100 text-green-600 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>{test.is_active ? 'Live' : 'Draft'}</span></div>
                                <div className="flex gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {test.duration_minutes} Mins</span>
                                    <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Pass: {test.passing_score}%</span>
                                    <span className="flex items-center gap-1"><Target className="w-4 h-4" /> {test.allow_multiple_attempts ? 'Retries Allowed' : 'Single Attempt'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 border-l border-gray-200 pl-6">
                                <button onClick={() => setViewingResults(test)} className="text-xs font-bold text-zenro-blue hover:text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded transition">
                                    View Analytics
                                </button>
                                <button onClick={() => setStatusModal({ test, targetStatus: !test.is_active })} className={`px-4 py-2 rounded-lg text-sm font-bold border transition ${test.is_active ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}>{test.is_active ? 'Active' : 'Publish'}</button>
                                <div className="h-8 w-[1px] bg-gray-200"></div>
                                <button onClick={() => { setEditingTest(test); setIsCreatorOpen(true); }} className="p-2 text-gray-400 hover:text-zenro-blue rounded transition"><Edit3 className="w-5 h-5" /></button>
                                <button onClick={() => setDeleteModal(test)} className="p-2 text-gray-400 hover:text-red-500 rounded transition"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {isCreatorOpen && <TestCreationModal initialData={editingTest} onClose={() => setIsCreatorOpen(false)} onRefresh={fetchTests} />}
            
            {viewingResults && <TestResultsView test={viewingResults} onClose={() => setViewingResults(null)} />}

            {statusModal && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-xl border border-gray-200 shadow-2xl p-6 text-center">
                        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${statusModal.targetStatus ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>{statusModal.targetStatus ? <Globe className="w-6 h-6" /> : <Save className="w-6 h-6" />}</div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{statusModal.targetStatus ? 'Publish Assessment?' : 'Unpublish Assessment?'}</h3>
                        <div className="flex gap-3 mt-6"><button onClick={() => setStatusModal(null)} className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-slate-700 font-bold text-sm">Cancel</button><button onClick={confirmStatusChange} className="flex-1 py-2 bg-zenro-red hover:bg-red-700 rounded-lg text-white font-bold text-sm">Confirm</button></div>
                    </div>
                </div>
            )}
            {deleteModal && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-xl border border-red-200 shadow-2xl p-6 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-red-100 text-red-600"><AlertTriangle className="w-6 h-6" /></div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Assessment?</h3>
                        <div className="flex gap-3 mt-6"><button onClick={() => setDeleteModal(null)} className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-slate-700 font-bold text-sm">Cancel</button><button onClick={confirmDelete} className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-bold text-sm">Delete</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const TeacherCoursesPage = () => {
  return (
    <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-heading font-bold text-zenro-slate">My Courses</h1>
                <p className="text-gray-500">Manage your course content and modules.</p>
            </div>
             <button className="bg-zenro-red hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm">
                <Plus className="w-5 h-5" /> Create Course
            </button>
        </div>
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
             <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-gray-500">No courses created yet.</h3>
             <p className="text-sm text-gray-400">Click "Create Course" to get started.</p>
        </div>
    </div>
  );
};

export const TeacherAssignmentsPage = () => {
     return (
    <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-heading font-bold text-zenro-slate">Assignments</h1>
                <p className="text-gray-500">Track student homework and projects.</p>
            </div>
             <button className="bg-zenro-red hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm">
                <Plus className="w-5 h-5" /> New Assignment
            </button>
        </div>
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
             <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-gray-500">No active assignments.</h3>
        </div>
    </div>
  );
};

export const TeacherReportsPage = () => {
    // Mock data for reports list
    const reports = [
        { id: 'sub-1', test: 'JLPT N4 Mock 1', student: 'John Doe', score: 85, date: '2023-10-25' },
        { id: 'sub-2', test: 'Kanji Quiz 3', student: 'Jane Smith', score: 45, date: '2023-10-24' },
    ];
    const navigate = useNavigate();

    return (
    <div className="space-y-8 animate-fade-in">
        <h1 className="text-3xl font-heading font-bold text-zenro-slate">Student Performance Reports</h1>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
             <table className="w-full text-left text-sm text-gray-600">
                 <thead className="bg-gray-100 text-slate-700 uppercase font-bold text-xs">
                     <tr>
                         <th className="p-4">Student</th>
                         <th className="p-4">Assessment</th>
                         <th className="p-4">Score</th>
                         <th className="p-4">Date</th>
                         <th className="p-4 text-right">Action</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                     {reports.map(r => (
                         <tr key={r.id} className="hover:bg-gray-50">
                             <td className="p-4 font-bold text-slate-800">{r.student}</td>
                             <td className="p-4">{r.test}</td>
                             <td className="p-4">
                                 <span className={`px-2 py-1 rounded text-xs font-bold ${r.score >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                     {r.score}%
                                 </span>
                             </td>
                             <td className="p-4">{r.date}</td>
                             <td className="p-4 text-right">
                                 <button onClick={() => navigate(`/teacher/report/${r.id}`)} className="text-zenro-blue font-bold hover:underline">View Report</button>
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
        </div>
    </div>
  );
};

export const TestCreationModal = ({ initialData, onClose, onRefresh }: any) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [duration, setDuration] = useState(initialData?.duration_minutes || 30);
    const [passing, setPassing] = useState(initialData?.passing_score || 40);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if(initialData) {
                await supabase.from('tests').update({ title, duration_minutes: duration, passing_score: passing }).eq('id', initialData.id);
            } else {
                await supabase.from('tests').insert({ title, duration_minutes: duration, passing_score: passing, is_active: false });
            }
            onRefresh();
            onClose();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6">
                <h2 className="text-xl font-bold mb-4">{initialData ? 'Edit Test' : 'Create New Test'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Title</label>
                        <input className="w-full border p-2 rounded" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Duration (min)</label>
                            <input type="number" className="w-full border p-2 rounded" value={duration} onChange={e => setDuration(Number(e.target.value))} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Pass Score (%)</label>
                            <input type="number" className="w-full border p-2 rounded" value={passing} onChange={e => setPassing(Number(e.target.value))} required />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded border hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded bg-zenro-red text-white font-bold hover:bg-red-700">Save</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export const TestResultsView = ({ test, onClose }: any) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
             <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6 h-[80vh] flex flex-col">
                 <div className="flex justify-between items-center mb-6">
                     <h2 className="text-xl font-bold">{test.title} - Analytics</h2>
                     <button onClick={onClose}><X className="w-6 h-6 text-gray-400 hover:text-gray-600" /></button>
                 </div>
                 <div className="flex-1 overflow-y-auto flex items-center justify-center text-gray-500">
                     <div className="text-center">
                         <BarChart2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                         <p>Detailed analytics for this test are being calculated.</p>
                     </div>
                 </div>
             </div>
        </div>
    )
}
