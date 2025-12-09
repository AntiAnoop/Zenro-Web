import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Users, BookOpen, Clock, Plus, Video, 
  MessageSquare, BarChart2, Calendar, FileText, 
  CheckCircle, AlertTriangle, MoreVertical, X,
  Mic, MicOff, Camera, CameraOff, Monitor, Languages,
  ChevronRight, Filter, Search, Download, Trash2, Upload,
  Layers, ChevronDown, Save, Eye, Paperclip, Film, PlayCircle,
  Briefcase, GraduationCap, Loader2, Edit3, Globe, Lock, AlertCircle, Check, WifiOff,
  FileCheck, HelpCircle, CheckSquare, Target, ChevronLeft, Radio,
  Layout, GripVertical, File, ListTodo
} from 'lucide-react';
import { Course, Assignment, StudentPerformance, CourseModule, CourseMaterial, User, Test, Question, Schedule, LiveSessionRecord, AssignmentSubmission } from '../types';
import { generateClassSummary } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLiveSession } from '../context/LiveContext';
import { supabase } from '../services/supabaseClient';
import { useNavigate, useParams, Link } from 'react-router-dom';

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

export const TeacherAssignmentsPage = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreatorOpen, setIsCreatorOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
    const [viewingSubmissions, setViewingSubmissions] = useState<Assignment | null>(null);

    useEffect(() => { fetchAssignments(); }, []);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const { data } = await supabase.from('assignments').select('*').order('created_at', { ascending: false });
            if (data) setAssignments(data);
        } catch (e) { console.error(e); } 
        finally { setLoading(false); }
    };

    const deleteAssignment = async (id: string) => {
        if(!confirm("Delete this assignment? Submissions will be lost.")) return;
        await supabase.from('assignments').delete().eq('id', id);
        fetchAssignments();
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-zenro-slate">Assignments</h1>
                    <p className="text-gray-500">Track student homework, essays, and projects.</p>
                </div>
                <button 
                    onClick={() => { setEditingAssignment(null); setIsCreatorOpen(true); }}
                    className="bg-zenro-red hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm"
                >
                    <Plus className="w-5 h-5" /> New Assignment
                </button>
            </div>

            {loading ? <div className="p-12 text-center"><Loader2 className="w-8 h-8 text-zenro-red animate-spin mx-auto"/></div> : 
             assignments.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-500">No active assignments.</h3>
                    <p className="text-sm text-gray-400">Create a task to get students started.</p>
                </div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {assignments.map(assign => (
                         <div key={assign.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col group">
                             <div className="flex justify-between items-start mb-4">
                                 <div className={`p-3 rounded-lg ${assign.status === 'PUBLISHED' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                     <Briefcase className="w-6 h-6" />
                                 </div>
                                 <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                     <button onClick={() => { setEditingAssignment(assign); setIsCreatorOpen(true); }} className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Edit3 className="w-4 h-4" /></button>
                                     <button onClick={() => deleteAssignment(assign.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                                 </div>
                             </div>
                             <h3 className="text-lg font-bold text-slate-800 mb-1">{assign.title}</h3>
                             <p className="text-xs text-gray-500 line-clamp-2 mb-4 h-8">{assign.description}</p>
                             
                             <div className="mt-auto space-y-3">
                                 <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                     <Calendar className="w-4 h-4 text-zenro-red" /> Due: {new Date(assign.due_date).toLocaleDateString()}
                                 </div>
                                 <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                     <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${assign.status === 'PUBLISHED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>{assign.status}</span>
                                     <button onClick={() => setViewingSubmissions(assign)} className="text-xs font-bold text-zenro-blue hover:underline">View Submissions</button>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             )
            }

            {isCreatorOpen && <AssignmentCreationModal initialData={editingAssignment} onClose={() => setIsCreatorOpen(false)} onRefresh={fetchAssignments} />}
            {viewingSubmissions && <AssignmentGradingModal assignment={viewingSubmissions} onClose={() => setViewingSubmissions(null)} />}
        </div>
    );
};

export const AssignmentCreationModal = ({ initialData, onClose, onRefresh }: any) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [availableBatches, setAvailableBatches] = useState<string[]>([]);
    
    const [formData, setFormData] = useState<Partial<Assignment>>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        total_marks: initialData?.total_marks || 100,
        due_date: initialData?.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : '',
        attachment_url: initialData?.attachment_url || '',
        assignedBatches: [],
    });

    useEffect(() => {
        const loadBatches = async () => {
            const { data } = await supabase.from('batches').select('name').order('created_at', { ascending: false });
            if(data) setAvailableBatches(data.map(b => b.name));
            
            if (initialData) {
                const { data: bData } = await supabase.from('assignment_batches').select('batch_name').eq('assignment_id', initialData.id);
                if (bData) setFormData(prev => ({ ...prev, assignedBatches: bData.map(b => b.batch_name) }));
            }
        };
        loadBatches();
    }, [initialData]);

    const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
        if (!formData.title || !formData.due_date) return alert("Title and Due Date are required.");
        setLoading(true);
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                total_marks: formData.total_marks,
                due_date: new Date(formData.due_date!).toISOString(),
                attachment_url: formData.attachment_url,
                status: status
            };

            let assignId = initialData?.id;

            if (assignId) {
                await supabase.from('assignments').update(payload).eq('id', assignId);
            } else {
                const { data } = await supabase.from('assignments').insert(payload).select().single();
                assignId = data.id;
            }

            // Batches
            await supabase.from('assignment_batches').delete().eq('assignment_id', assignId);
            if (formData.assignedBatches?.length) {
                await supabase.from('assignment_batches').insert(
                    formData.assignedBatches.map(b => ({ assignment_id: assignId, batch_name: b }))
                );
            }

            onRefresh();
            onClose();
        } catch (e: any) {
            console.error(e);
            alert("Error saving assignment: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleBatch = (b: string) => {
        const current = formData.assignedBatches || [];
        setFormData({ ...formData, assignedBatches: current.includes(b) ? current.filter(x => x !== b) : [...current, b] });
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col h-[80vh] overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Edit Assignment' : 'Create Assignment'}</h2>
                    <button onClick={onClose}><X className="w-6 h-6 text-gray-400" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Title *</label><input className="w-full border p-2 rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Essay on Japanese Culture" /></div>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label><textarea className="w-full border p-2 rounded h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                            <div className="grid grid-cols-2 gap-6">
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Due Date *</label><input type="date" className="w-full border p-2 rounded" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} /></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Total Marks</label><input type="number" className="w-full border p-2 rounded" value={formData.total_marks} onChange={e => setFormData({...formData, total_marks: parseInt(e.target.value)})} /></div>
                            </div>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Reference File (URL)</label><input className="w-full border p-2 rounded" value={formData.attachment_url} onChange={e => setFormData({...formData, attachment_url: e.target.value})} placeholder="https://..." /></div>
                        </div>
                    )}
                    {step === 2 && (
                        <div>
                            <h3 className="text-lg font-bold mb-4">Assign to Batches</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {availableBatches.map(b => (
                                    <div key={b} onClick={() => toggleBatch(b)} className={`p-4 rounded-lg border cursor-pointer flex justify-between items-center ${formData.assignedBatches?.includes(b) ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200'}`}>
                                        <span className="font-bold">{b}</span>
                                        {formData.assignedBatches?.includes(b) && <CheckCircle className="w-5 h-5" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between">
                    <button onClick={() => step === 1 ? onClose() : setStep(1)} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded">{step === 1 ? 'Cancel' : 'Back'}</button>
                    {step === 1 ? (
                        <button onClick={() => setStep(2)} className="px-6 py-2 bg-zenro-blue text-white font-bold rounded hover:bg-blue-800">Next Step</button>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={() => handleSave('DRAFT')} disabled={loading} className="px-6 py-2 bg-gray-200 text-slate-700 font-bold rounded hover:bg-gray-300">Save Draft</button>
                            <button onClick={() => handleSave('PUBLISHED')} disabled={loading} className="px-6 py-2 bg-zenro-red text-white font-bold rounded hover:bg-red-700 shadow-md">Publish</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const AssignmentGradingModal = ({ assignment, onClose }: { assignment: Assignment, onClose: () => void }) => {
    const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [gradingSub, setGradingSub] = useState<string | null>(null); // ID of submission being graded
    const [gradeData, setGradeData] = useState({ marks: 0, feedback: '' });

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoading(true);
            try {
                const { data } = await supabase
                    .from('assignment_submissions')
                    .select('*, profiles(full_name)')
                    .eq('assignment_id', assignment.id);
                
                if (data) {
                    const mapped = data.map((s: any) => ({
                        ...s,
                        student_name: s.profiles?.full_name
                    }));
                    setSubmissions(mapped);
                }
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchSubmissions();
    }, [assignment.id]);

    const handleSubmitGrade = async (subId: string) => {
        try {
            await supabase.from('assignment_submissions').update({
                obtained_marks: gradeData.marks,
                feedback: gradeData.feedback,
                status: 'GRADED'
            }).eq('id', subId);
            
            // Local update
            setSubmissions(prev => prev.map(s => s.id === subId ? { ...s, obtained_marks: gradeData.marks, feedback: gradeData.feedback, status: 'GRADED' } : s));
            setGradingSub(null);
        } catch (e) { console.error(e); alert("Failed to save grade"); }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{assignment.title}</h2>
                        <p className="text-sm text-gray-500">Grading Portal • Total Marks: {assignment.total_marks}</p>
                    </div>
                    <button onClick={onClose}><X className="w-6 h-6 text-gray-400" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    {loading ? <div className="text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-zenro-blue"/></div> : 
                     submissions.length === 0 ? <div className="text-center p-12 text-gray-500">No submissions yet.</div> : (
                         <div className="space-y-4">
                             {submissions.map(sub => (
                                 <div key={sub.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                     <div className="flex justify-between items-start mb-4">
                                         <div>
                                             <h4 className="font-bold text-slate-800 text-lg">{sub.student_name}</h4>
                                             <p className="text-xs text-gray-500">Submitted: {new Date(sub.submitted_at).toLocaleString()}</p>
                                         </div>
                                         <span className={`px-2 py-1 rounded text-xs font-bold ${sub.status === 'GRADED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{sub.status}</span>
                                     </div>
                                     
                                     <div className="mb-4 bg-gray-50 p-4 rounded border border-gray-100">
                                         {sub.submission_text && <p className="text-sm text-slate-700 whitespace-pre-wrap mb-2">{sub.submission_text}</p>}
                                         {sub.submission_url && <a href={sub.submission_url} target="_blank" rel="noreferrer" className="text-zenro-blue text-sm font-bold underline flex items-center gap-1"><Download className="w-4 h-4"/> Attached File</a>}
                                     </div>

                                     {gradingSub === sub.id ? (
                                         <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-3 animate-fade-in">
                                             <div className="flex gap-4 items-center">
                                                 <label className="text-xs font-bold uppercase text-blue-800">Marks:</label>
                                                 <input type="number" className="w-20 border p-1 rounded" value={gradeData.marks} onChange={e => setGradeData({...gradeData, marks: parseInt(e.target.value)})} max={assignment.total_marks} />
                                                 <span className="text-xs text-gray-500">/ {assignment.total_marks}</span>
                                             </div>
                                             <div>
                                                 <label className="text-xs font-bold uppercase text-blue-800 block mb-1">Feedback:</label>
                                                 <textarea className="w-full border p-2 rounded text-sm h-20" value={gradeData.feedback} onChange={e => setGradeData({...gradeData, feedback: e.target.value})} placeholder="Good job, but..." />
                                             </div>
                                             <div className="flex gap-2">
                                                 <button onClick={() => handleSubmitGrade(sub.id)} className="bg-zenro-blue text-white px-4 py-2 rounded text-xs font-bold">Save Grade</button>
                                                 <button onClick={() => setGradingSub(null)} className="text-gray-500 px-4 py-2 rounded text-xs font-bold">Cancel</button>
                                             </div>
                                         </div>
                                     ) : (
                                         <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                             <div className="text-sm">
                                                 {sub.status === 'GRADED' ? <span className="font-bold text-green-600">Score: {sub.obtained_marks} / {assignment.total_marks}</span> : <span className="text-gray-400 italic">Not graded yet</span>}
                                             </div>
                                             <button onClick={() => { setGradingSub(sub.id); setGradeData({ marks: sub.obtained_marks || 0, feedback: sub.feedback || '' }); }} className="text-zenro-blue font-bold text-xs border border-blue-200 px-3 py-1.5 rounded hover:bg-blue-50">
                                                 {sub.status === 'GRADED' ? 'Edit Grade' : 'Grade Submission'}
                                             </button>
                                         </div>
                                     )}
                                 </div>
                             ))}
                         </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export const TeacherCoursesPage = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
                 <h1 className="text-3xl font-heading font-bold text-zenro-slate">Course Management</h1>
                 <button className="bg-zenro-blue text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm hover:bg-blue-800">
                     <Plus className="w-5 h-5" /> New Course
                 </button>
             </div>

             {loading ? <div className="text-center p-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-zenro-red" /></div> : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {courses.map(course => (
                         <div key={course.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition group">
                             <div className="h-40 bg-gray-200 relative">
                                 <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                                 <button onClick={() => navigate(`/teacher/course/${course.id}/manage`)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold gap-2">
                                     <Edit3 className="w-5 h-5" /> Manage Content
                                 </button>
                             </div>
                             <div className="p-5">
                                 <h3 className="font-bold text-lg text-slate-800 mb-2">{course.title}</h3>
                                 <p className="text-xs text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                                 <div className="flex justify-between items-center text-xs text-gray-400 font-bold">
                                     <span>{course.level}</span>
                                     <span>{course.totalDuration}</span>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
        </div>
    );
};

export const CourseContentManager = () => {
    const { courseId } = useParams();
    const [modules, setModules] = useState<CourseModule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetch for demonstration since `modules` column is often JSONB or separate table
        setTimeout(() => {
            setModules([
                { id: '1', title: 'Chapter 1: Basics', duration: '2h', materials: [] },
                { id: '2', title: 'Chapter 2: Particles', duration: '1.5h', materials: [] }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
             <div className="flex items-center gap-4">
                 <Link to="/teacher/courses" className="text-gray-500 hover:text-zenro-blue"><ChevronLeft className="w-6 h-6" /></Link>
                 <h1 className="text-3xl font-heading font-bold text-zenro-slate">Course Content</h1>
             </div>
             
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                 {loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-zenro-blue" /> : (
                     <div className="space-y-4">
                         {modules.map((mod, idx) => (
                             <div key={mod.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center bg-gray-50">
                                 <div>
                                     <h4 className="font-bold text-slate-800">Module {idx + 1}: {mod.title}</h4>
                                     <p className="text-xs text-gray-500">{mod.duration}</p>
                                 </div>
                                 <div className="flex gap-2">
                                     <button className="p-2 bg-white border rounded hover:bg-gray-100"><Edit3 className="w-4 h-4 text-gray-600" /></button>
                                     <button className="p-2 bg-white border rounded hover:bg-gray-100"><Trash2 className="w-4 h-4 text-red-500" /></button>
                                 </div>
                             </div>
                         ))}
                         <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 font-bold hover:border-zenro-blue hover:text-zenro-blue transition flex items-center justify-center gap-2">
                             <Plus className="w-5 h-5" /> Add New Module
                         </button>
                     </div>
                 )}
             </div>
        </div>
    );
};

export const TeacherTestsPage = () => {
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('tests').select('*').order('created_at', { ascending: false });
            if (data) setTests(data);
            setLoading(false);
        };
        fetch();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                 <h1 className="text-3xl font-heading font-bold text-zenro-slate">Tests & Quizzes</h1>
                 <button className="bg-zenro-blue text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm">
                     <Plus className="w-5 h-5" /> Create Test
                 </button>
            </div>
            {loading ? <div className="text-center p-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-zenro-red" /></div> : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-100 text-slate-700 uppercase font-bold text-xs">
                            <tr>
                                <th className="p-4">Title</th>
                                <th className="p-4">Duration</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tests.map(test => (
                                <tr key={test.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-bold text-slate-800">{test.title}</td>
                                    <td className="p-4">{test.duration_minutes}m</td>
                                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${test.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{test.is_active ? 'Active' : 'Draft'}</span></td>
                                    <td className="p-4 text-right">
                                        <button className="text-zenro-blue hover:underline font-bold text-xs mr-4">Edit</button>
                                        <button className="text-red-500 hover:underline font-bold text-xs">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export const TeacherSchedulePage = () => {
    return (
        <div className="space-y-8 animate-fade-in">
             <h1 className="text-3xl font-heading font-bold text-zenro-slate">My Schedule</h1>
             <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
                 <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                 <p>Calendar view integration coming soon.</p>
             </div>
        </div>
    );
};

export const TeacherReportsPage = () => {
    return (
        <div className="space-y-8 animate-fade-in">
             <h1 className="text-3xl font-heading font-bold text-zenro-slate">Student Reports</h1>
             <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
                 <BarChart2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                 <p>Detailed student performance analytics coming soon.</p>
             </div>
        </div>
    );
};

export const LiveClassConsole = () => {
    const { 
        isLive, topic, viewerCount, localStream, 
        startSession, endSession, enablePreview, 
        toggleMic, toggleCamera, chatMessages, sendMessage 
    } = useLiveSession();
    
    const [topicInput, setTopicInput] = useState('');
    const [msgText, setMsgText] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && localStream) {
            videoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    const handleStart = () => {
        if (!topicInput) return alert("Enter a topic");
        startSession(topicInput);
    };

    return (
        <div className="h-[calc(100vh-100px)] flex gap-4 animate-fade-in">
             <div className="flex-1 flex flex-col gap-4">
                 <div className="flex-1 bg-black rounded-xl overflow-hidden relative shadow-md">
                     <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                     <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                         {isLive ? 'LIVE' : 'PREVIEW'}
                     </div>
                     <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                         <Users className="w-3 h-3" /> {viewerCount}
                     </div>
                     
                     <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
                         <button onClick={() => toggleMic(true)} className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"><Mic className="w-5 h-5" /></button>
                         <button onClick={() => toggleCamera(true)} className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"><Camera className="w-5 h-5" /></button>
                         {!isLive ? (
                             <button onClick={handleStart} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-lg">GO LIVE</button>
                         ) : (
                             <button onClick={endSession} className="px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white font-bold rounded-full shadow-lg">END STREAM</button>
                         )}
                     </div>
                 </div>
                 
                 {!isLive && (
                     <div className="bg-white p-4 rounded-xl border border-gray-200 flex gap-4 items-center">
                         <button onClick={enablePreview} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded font-bold text-sm">Enable Camera</button>
                         <input className="flex-1 border p-2 rounded" placeholder="Class Topic..." value={topicInput} onChange={e => setTopicInput(e.target.value)} />
                     </div>
                 )}
             </div>

             <div className="w-80 bg-white rounded-xl border border-gray-200 flex flex-col shadow-sm">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-bold text-slate-800">Live Chat</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {chatMessages.map((msg, i) => (
                        <div key={i} className="text-sm"><span className="font-bold text-slate-700">{msg.user}:</span> {msg.text}</div>
                    ))}
                </div>
                <div className="p-3 border-t border-gray-200 flex gap-2">
                    <input className="flex-1 border p-2 rounded text-sm" value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="Type..." />
                    <button onClick={() => { sendMessage('Sensei', msgText); setMsgText(''); }} className="p-2 bg-zenro-blue text-white rounded"><Send className="w-4 h-4" /></button>
                </div>
             </div>
        </div>
    );
};