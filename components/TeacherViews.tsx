
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Users, BookOpen, Clock, Plus, Video, 
  MessageSquare, BarChart2, Calendar, FileText, 
  CheckCircle, AlertTriangle, MoreVertical, X,
  Mic, MicOff, Camera, CameraOff, Monitor, Languages,
  ChevronRight, Filter, Search, Download, Trash2, Upload,
  Layers, ChevronDown, Save, Eye, Paperclip, Film, PlayCircle,
  Briefcase, GraduationCap, Loader2, Edit3, Globe, Lock, AlertCircle, Check, WifiOff,
  FileCheck, HelpCircle, CheckSquare, Target
} from 'lucide-react';
import { Course, Assignment, StudentPerformance, CourseModule, CourseMaterial, User, Test, Question } from '../types';
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

// --- MOCK TEACHER STATS ---
const TEACHER_STATS = [
  { label: 'Total Students', value: '142', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  { label: 'Active Batches', value: '4', icon: BookOpen, color: 'text-red-600', bg: 'bg-red-100' },
  { label: 'JLPT Pass Rate', value: '94%', icon: BarChart2, color: 'text-yellow-600', bg: 'bg-yellow-100' },
];

const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: 'a1', title: 'Kanji Workbook: Chapter 5', courseId: 'c2', courseName: 'Kanji Mastery', dueDate: '2023-10-25', totalSubmissions: 32, totalStudents: 45, status: 'ACTIVE' },
  { id: 'a2', title: 'Recording: Self Introduction (Jiko Shoukai)', courseId: 'c1', courseName: 'JLPT N4', dueDate: '2023-10-20', totalSubmissions: 38, totalStudents: 38, status: 'CLOSED' },
];

const MOCK_PERFORMANCE: StudentPerformance[] = [
  { id: 's1', name: 'John Doe', attendance: 92, avgScore: 88, riskLevel: 'LOW' },
  { id: 's2', name: 'Jane Smith', attendance: 45, avgScore: 52, riskLevel: 'HIGH' },
  { id: 's3', name: 'Bob Johnson', attendance: 78, avgScore: 72, riskLevel: 'MEDIUM' },
  { id: 's4', name: 'Alice Brown', attendance: 30, avgScore: 40, riskLevel: 'HIGH' },
];

// --- COMPONENTS ---

export const TeacherDashboardHome = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-zenro-slate">Sensei Dashboard</h1>
          <p className="text-gray-500">Manage your Japanese language classes and student progress.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TEACHER_STATS.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 flex items-center gap-4 hover:shadow-md transition shadow-sm">
            <div className={`p-4 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase">{stat.label}</p>
              <h3 className="text-3xl font-bold text-zenro-slate mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-zenro-slate mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-zenro-red" /> Today's Schedule
            </h3>
            <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-zenro-red">
                    <div className="text-center w-16">
                        <p className="text-zenro-red font-bold">10:00</p>
                        <p className="text-xs text-gray-500">AM</p>
                    </div>
                    <div>
                        <h4 className="text-zenro-slate font-bold">JLPT N4 Grammar</h4>
                        <p className="text-sm text-gray-500">Batch B-2024 • Live Lecture</p>
                        <div className="mt-2 flex gap-2">
                            <button className="text-xs bg-zenro-red text-white px-3 py-1 rounded hover:bg-red-700 shadow-sm">Start Class</button>
                            <button className="text-xs bg-white border border-gray-300 text-gray-600 px-3 py-1 rounded hover:bg-gray-100">View Material</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
             <h3 className="text-xl font-bold text-zenro-slate mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" /> Needs Attention
            </h3>
            <div className="space-y-3">
                 {MOCK_PERFORMANCE.filter(s => s.riskLevel === 'HIGH').map(student => (
                     <div key={student.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                         <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center text-red-700 font-bold text-xs">
                                 {student.name.charAt(0)}
                             </div>
                             <div>
                                 <p className="text-zenro-slate text-sm font-bold">{student.name}</p>
                                 <p className="text-xs text-red-500">Low Attendance ({student.attendance}%)</p>
                             </div>
                         </div>
                         <button className="text-xs text-gray-500 hover:text-zenro-red underline">Contact</button>
                     </div>
                 ))}
            </div>
        </div>
      </div>
    </div>
  );
};

// --- TEST MANAGEMENT ---

interface TestModalProps {
    onClose: () => void;
    onRefresh: () => void;
    initialData?: Test | null;
}

const TestCreationModal = ({ onClose, onRefresh, initialData }: TestModalProps) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [testData, setTestData] = useState<Partial<Test>>({
        title: '', description: '', duration_minutes: 30, passing_score: 40, is_active: false, assignedBatches: [], assignedStudentIds: []
    });
    const [questions, setQuestions] = useState<Partial<Question>[]>([]);
    const [availableBatches, setAvailableBatches] = useState<string[]>([]);
    const [availableStudents, setAvailableStudents] = useState<User[]>([]);
    const [studentSearch, setStudentSearch] = useState('');

    useEffect(() => {
        const loadResources = async () => {
            const { data: bData } = await supabase.from('batches').select('name');
            if(bData) setAvailableBatches(bData.map(b => b.name));
            const { data: sData } = await supabase.from('profiles').select('*').eq('role', 'STUDENT');
            if(sData) {
                const mapped = sData.map((u: any) => ({
                    id: u.id, name: u.full_name, role: 'STUDENT', email: u.email, avatar: u.avatar_url, batch: u.batch, rollNumber: u.student_id
                }));
                setAvailableStudents(mapped);
            }
            if(initialData) {
                const { data: qData } = await supabase.from('questions').select('*').eq('test_id', initialData.id);
                setQuestions(qData || []);
                const { data: bAssign } = await supabase.from('test_batches').select('batch_name').eq('test_id', initialData.id);
                const { data: sAssign } = await supabase.from('test_enrollments').select('student_id').eq('test_id', initialData.id);
                setTestData({ ...initialData, assignedBatches: bAssign?.map(b => b.batch_name) || [], assignedStudentIds: sAssign?.map(s => s.student_id) || [] });
            }
        };
        loadResources();
    }, [initialData]);

    const addQuestion = () => { setQuestions([...questions, { id: crypto.randomUUID(), question_text: '', options: ['', '', '', ''], correct_option_index: 0, marks: 1 }]); };
    const updateQuestion = (idx: number, field: keyof Question, value: any) => { const updated = [...questions]; updated[idx] = { ...updated[idx], [field]: value }; setQuestions(updated); };
    const updateOption = (qIdx: number, oIdx: number, val: string) => { const updated = [...questions]; if (updated[qIdx].options) { const newOpts = [...updated[qIdx].options!]; newOpts[oIdx] = val; updated[qIdx].options = newOpts; setQuestions(updated); } };
    const removeQuestion = (idx: number) => { const updated = [...questions]; updated.splice(idx, 1); setQuestions(updated); };

    const handleSave = async (activate: boolean) => {
        if (!testData.title) return alert("Title is required");
        if (questions.length === 0) return alert("Add at least one question");
        if (activate && !confirm("Confirm Publish: This test will be immediately available.")) return;
        setLoading(true);
        try {
            const payload = { title: testData.title, description: testData.description || '', duration_minutes: testData.duration_minutes || 30, passing_score: testData.passing_score || 40, is_active: activate };
            let currentTestId = initialData?.id;
            if (currentTestId) { await supabase.from('tests').update(payload).eq('id', currentTestId); } 
            else { const { data } = await supabase.from('tests').insert(payload).select().single(); currentTestId = data.id; }
            await supabase.from('questions').delete().eq('test_id', currentTestId);
            if (questions.length > 0) { await supabase.from('questions').insert(questions.map(q => ({ test_id: currentTestId, question_text: q.question_text, options: q.options, correct_option_index: q.correct_option_index, marks: q.marks }))); }
            await supabase.from('test_batches').delete().eq('test_id', currentTestId);
            if(testData.assignedBatches?.length) { await supabase.from('test_batches').insert(testData.assignedBatches.map(b => ({ test_id: currentTestId, batch_name: b }))); }
            await supabase.from('test_enrollments').delete().eq('test_id', currentTestId);
            if(testData.assignedStudentIds?.length) { await supabase.from('test_enrollments').insert(testData.assignedStudentIds.map(s => ({ test_id: currentTestId, student_id: s }))); }
            alert(`Test ${activate ? 'Published' : 'Saved'} Successfully!`); onRefresh(); onClose();
        } catch (e: any) { console.error("Save Test Error:", e); alert(`Error saving test: ${e.message}`); } finally { setLoading(false); }
    };

    const toggleBatch = (b: string) => { const current = testData.assignedBatches || []; setTestData({ ...testData, assignedBatches: current.includes(b) ? current.filter(x => x !== b) : [...current, b] }); };
    const toggleStudent = (id: string) => { const current = testData.assignedStudentIds || []; setTestData({ ...testData, assignedStudentIds: current.includes(id) ? current.filter(x => x !== id) : [...current, id] }); };
    const filteredStudents = availableStudents.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.email.toLowerCase().includes(studentSearch.toLowerCase()));

    return (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-zenro-slate flex items-center gap-2"><FileCheck className="w-6 h-6 text-zenro-red" /> {initialData ? 'Edit Assessment' : 'Create New Assessment'}</h2>
                        <div className="flex gap-4 mt-2">
                            {[1, 2, 3, 4].map(s => (
                                <div key={s} className={`flex items-center gap-2 text-xs font-bold ${step === s ? 'text-zenro-red' : 'text-gray-400'}`}>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${step === s ? 'border-zenro-red bg-red-50' : 'border-gray-300'}`}>{s}</div>
                                    <span>{s === 1 ? 'Details' : s === 2 ? 'Questions' : s === 3 ? 'Access' : 'Review'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><X className="w-6 h-6"/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-white">
                    {step === 1 && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Test Title <span className="text-red-500">*</span></label><input type="text" className="w-full bg-white border border-gray-300 rounded-lg p-3 text-slate-800 focus:border-zenro-red outline-none" placeholder="e.g. JLPT N4 Mock Exam #1" value={testData.title} onChange={e => setTestData({...testData, title: e.target.value})} /></div>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Instructions</label><textarea className="w-full bg-white border border-gray-300 rounded-lg p-3 text-slate-800 focus:border-zenro-red outline-none h-32 resize-none" value={testData.description || ''} onChange={e => setTestData({...testData, description: e.target.value})} /></div>
                            <div className="grid grid-cols-2 gap-6">
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Duration (Minutes)</label><input type="number" className="w-full bg-white border border-gray-300 rounded-lg p-3 text-slate-800 focus:border-zenro-red outline-none" value={testData.duration_minutes} onChange={e => setTestData({...testData, duration_minutes: parseInt(e.target.value)})} /></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Passing Score (%)</label><input type="number" className="w-full bg-white border border-gray-300 rounded-lg p-3 text-slate-800 focus:border-zenro-red outline-none" value={testData.passing_score} onChange={e => setTestData({...testData, passing_score: parseInt(e.target.value)})} /></div>
                            </div>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-800">Question Builder ({questions.length})</h3>
                                <button onClick={addQuestion} className="text-sm bg-zenro-red hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> Add Question</button>
                            </div>
                            {questions.map((q, idx) => (
                                <div key={idx} className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative group">
                                    <button onClick={() => removeQuestion(idx)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    <div className="mb-4 pr-12"><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Question {idx + 1}</label><textarea className="w-full bg-white border border-gray-300 rounded-lg p-3 text-slate-800 focus:border-zenro-red outline-none h-24 resize-none" placeholder="Enter question text..." value={q.question_text} onChange={e => updateQuestion(idx, 'question_text', e.target.value)} /></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        {q.options?.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-3">
                                                <div onClick={() => updateQuestion(idx, 'correct_option_index', oIdx)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer ${q.correct_option_index === oIdx ? 'border-zenro-red' : 'border-gray-400'}`}>{q.correct_option_index === oIdx && <div className="w-3 h-3 bg-zenro-red rounded-full"></div>}</div>
                                                <input type="text" className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-sm text-slate-800 outline-none focus:border-zenro-red" placeholder={`Option ${oIdx + 1}`} value={opt} onChange={e => updateOption(idx, oIdx, e.target.value)} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-end"><div className="flex items-center gap-2"><label className="text-xs font-bold text-gray-500 uppercase">Marks:</label><input type="number" className="w-16 bg-white border border-gray-300 rounded p-1 text-slate-800 text-sm text-center outline-none focus:border-zenro-red" value={q.marks} onChange={e => updateQuestion(idx, 'marks', parseInt(e.target.value))} /></div></div>
                                </div>
                            ))}
                        </div>
                    )}
                    {step === 3 && (
                        <div className="h-full flex flex-col">
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Access Control</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
                                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex flex-col">
                                    <div className="p-4 bg-white border-b border-gray-200 font-bold text-slate-700 flex items-center gap-2"><Layers className="w-4 h-4 text-zenro-red" /> Batches</div>
                                    <div className="p-4 overflow-y-auto flex-1 space-y-2">
                                        {availableBatches.map(b => (
                                            <div key={b} onClick={() => toggleBatch(b)} className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition ${testData.assignedBatches?.includes(b) ? 'bg-red-50 border-zenro-red' : 'bg-white border-gray-200'}`}><span className="text-sm font-bold text-slate-700">{b}</span>{testData.assignedBatches?.includes(b) && <CheckCircle className="w-4 h-4 text-zenro-red" />}</div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex flex-col">
                                    <div className="p-4 bg-white border-b border-gray-200 font-bold text-slate-700 flex items-center justify-between"><div className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" /> Specific Students</div><input type="text" placeholder="Search..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} className="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-xs text-slate-800 outline-none w-32" /></div>
                                    <div className="p-4 overflow-y-auto flex-1 space-y-2">
                                        {filteredStudents.map(s => {
                                            const inBatch = s.batch && testData.assignedBatches?.includes(s.batch);
                                            const explicitlyAssigned = testData.assignedStudentIds?.includes(s.id);
                                            return (
                                                <div key={s.id} onClick={() => !inBatch && toggleStudent(s.id)} className={`p-2 rounded-lg border flex items-center justify-between transition ${inBatch ? 'opacity-60 bg-gray-100 border-transparent cursor-default' : explicitlyAssigned ? 'bg-blue-50 border-blue-500 cursor-pointer' : 'bg-white border-gray-200 hover:border-gray-400 cursor-pointer'}`}>
                                                    <div><p className="text-sm font-bold text-slate-700">{s.name}</p><p className="text-[10px] text-gray-500">{s.email}</p></div>{inBatch ? <span className="text-[10px] bg-gray-200 px-2 py-1 rounded text-gray-500">Via Batch</span> : explicitlyAssigned && <CheckCircle className="w-4 h-4 text-blue-500" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {step === 4 && (
                        <div className="max-w-2xl mx-auto text-center py-10 space-y-8">
                            <h2 className="text-3xl font-bold text-zenro-slate">Ready to Finalize?</h2>
                            <div className="grid grid-cols-2 gap-4 text-left bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <div><p className="text-xs text-gray-500 uppercase font-bold">Title</p><p className="text-slate-800 font-bold">{testData.title}</p></div>
                                <div><p className="text-xs text-gray-500 uppercase font-bold">Questions</p><p className="text-slate-800 font-bold">{questions.length}</p></div>
                            </div>
                            <div className="flex gap-4 justify-center">
                                <button onClick={() => handleSave(false)} disabled={loading} className="px-8 py-4 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold text-gray-700 flex items-center gap-2 transition">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-5 h-5" />} Save as Draft</button>
                                <button onClick={() => handleSave(true)} disabled={loading} className="px-8 py-4 bg-zenro-red hover:bg-red-700 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg transition">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-5 h-5" />} Publish Live</button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between">
                    <button onClick={step === 1 ? onClose : () => setStep(step - 1)} className="px-6 py-3 rounded-lg text-gray-500 hover:text-slate-800 font-bold transition">{step === 1 ? 'Cancel' : 'Back'}</button>
                    {step < 4 && <button onClick={() => setStep(step + 1)} className="bg-zenro-red hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition">Next Step <ChevronRight className="w-5 h-5" /></button>}
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
                            <div>
                                <div className="flex items-center gap-3 mb-1"><h3 className="text-xl font-bold text-zenro-slate group-hover:text-zenro-red transition">{test.title}</h3><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${test.is_active ? 'bg-green-100 text-green-600 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>{test.is_active ? 'Live' : 'Draft'}</span></div>
                                <div className="flex gap-4 text-sm text-gray-500"><span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {test.duration_minutes} Mins</span><span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Pass: {test.passing_score}%</span></div>
                            </div>
                            <div className="flex items-center gap-4">
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
    // Reusing same logic, simplified styles for brevity - white cards, gray text
    return <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">Course Management (Use same structure as Student/Admin)</div>;
};

export const LiveClassConsole = () => {
    const { isLive, topic, viewerCount, localStream, chatMessages, startSession, endSession, enablePreview, toggleMic, toggleCamera, sendMessage } = useLiveSession();
    const [title, setTitle] = useState('');
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => { if (localStream && videoRef.current) videoRef.current.srcObject = localStream; }, [localStream]);
    const handleToggleMic = () => { setMicOn(!micOn); toggleMic(!micOn); };
    const handleToggleCam = () => { setCamOn(!camOn); toggleCamera(!camOn); };

    return (
        <div className="h-[calc(100vh-2rem)] flex gap-6 animate-fade-in">
            <div className="flex-1 flex flex-col gap-4">
                 <div className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
                    <div><h2 className="text-xl font-bold text-zenro-slate flex items-center gap-2"><Video className="w-6 h-6 text-zenro-red" /> Console</h2><p className="text-sm text-gray-500">{isLive ? `Broadcasting: ${topic}` : 'Session Offline'}</p></div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-500 bg-gray-100 px-3 py-1 rounded"><Users className="w-4 h-4" /> <span className="font-mono font-bold text-slate-800">{viewerCount}</span></div>
                        {!isLive ? (
                            <div className="flex gap-2"><input type="text" placeholder="Topic..." className="bg-gray-100 border border-gray-300 text-slate-800 px-3 py-2 rounded-lg text-sm outline-none focus:border-zenro-red w-64" value={title} onChange={e => setTitle(e.target.value)} /><button onClick={() => startSession(title || 'Class')} className="bg-zenro-red hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><WifiOff className="w-4 h-4" /> Go Live</button><button onClick={enablePreview} className="bg-gray-200 text-slate-700 px-3 py-2 rounded-lg text-sm">Preview</button></div>
                        ) : <button onClick={endSession} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold shadow-md animate-pulse">End Class</button>}
                    </div>
                 </div>
                 <div className="flex-1 bg-black rounded-xl border border-gray-800 overflow-hidden relative group">
                     {localStream ? <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" /> : <div className="absolute inset-0 flex items-center justify-center text-gray-500"><div className="text-center"><CameraOff className="w-16 h-16 mx-auto mb-4 opacity-50" /><p>Camera off</p></div></div>}
                     <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 bg-white/10 backdrop-blur px-6 py-3 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition duration-300">
                         <button onClick={handleToggleMic} className={`p-3 rounded-full ${micOn ? 'bg-white text-slate-900' : 'bg-red-600 text-white'}`}>{micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}</button>
                         <button onClick={handleToggleCam} className={`p-3 rounded-full ${camOn ? 'bg-white text-slate-900' : 'bg-red-600 text-white'}`}>{camOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}</button>
                     </div>
                 </div>
            </div>
            <div className="w-80 flex flex-col gap-4">
                <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden shadow-sm">
                    <div className="p-3 border-b border-gray-200 bg-gray-50 font-bold text-slate-700">Live Chat</div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                        {chatMessages.map((msg, i) => (<div key={i} className="text-sm"><span className="font-bold text-xs text-blue-600">{msg.user}</span><p className="text-gray-700 bg-gray-50 p-2 rounded">{msg.text}</p></div>))}
                    </div>
                    <div className="p-3 bg-gray-50 border-t border-gray-200"><input type="text" placeholder="Send..." className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-slate-800 outline-none" onKeyDown={e => { if(e.key === 'Enter') { sendMessage('Sensei', e.currentTarget.value); e.currentTarget.value = ''; }}} /></div>
                </div>
            </div>
        </div>
    );
};

export const TeacherAssignmentsPage = () => {
  return (
    <div className="space-y-8 animate-fade-in">
        <h1 className="text-3xl font-heading font-bold text-zenro-slate flex items-center gap-3">
            <FileText className="w-8 h-8 text-zenro-red" /> Assignments
        </h1>
        <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <div className="divide-y divide-gray-100">
                {MOCK_ASSIGNMENTS.map(assign => (
                    <div key={assign.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-zenro-slate">{assign.title}</h3>
                                <div className="flex gap-3 text-sm text-gray-500 mt-1">
                                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {assign.courseName}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {assign.dueDate}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                             <div className="text-right">
                                <p className="text-lg font-bold text-zenro-slate">{assign.totalSubmissions}/{assign.totalStudents}</p>
                                <p className="text-xs text-gray-500">Submissions</p>
                             </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${assign.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                {assign.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export const TeacherReportsPage = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-heading font-bold text-zenro-slate flex items-center gap-3">
                <BarChart2 className="w-8 h-8 text-zenro-red" /> Performance Reports
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-bold text-zenro-slate mb-4">Class Performance</h3>
                     <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={MOCK_PERFORMANCE}>
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Bar dataKey="avgScore" fill="#E60012" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                     </div>
                 </div>

                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-bold text-zenro-slate mb-4">Student Risk Analysis</h3>
                    <div className="space-y-4">
                        {MOCK_PERFORMANCE.map(student => (
                            <div key={student.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-8 rounded-full ${student.riskLevel === 'HIGH' ? 'bg-red-500' : student.riskLevel === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                    <div>
                                        <p className="font-bold text-zenro-slate">{student.name}</p>
                                        <p className="text-xs text-gray-500">Avg Score: {student.avgScore}%</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${student.riskLevel === 'HIGH' ? 'bg-red-100 text-red-600' : student.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                                    {student.riskLevel} Risk
                                </span>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
        </div>
    );
};
