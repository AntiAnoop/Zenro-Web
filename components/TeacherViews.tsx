
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Users, BookOpen, Clock, Plus, Video, 
  MessageSquare, BarChart2, Calendar, FileText, 
  CheckCircle, AlertTriangle, MoreVertical, X,
  Mic, MicOff, Camera, CameraOff, Monitor, Languages,
  ChevronRight, Filter, Search, Download, Trash2, Upload,
  Layers, ChevronDown, Save, Eye, Paperclip, Film, PlayCircle,
  Briefcase, GraduationCap, Loader2, Edit3, Globe, Lock, AlertCircle, Check, WifiOff
} from 'lucide-react';
import { Course, Assignment, StudentPerformance, CourseModule, CourseMaterial, User } from '../types';
import { generateClassSummary } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLiveSession } from '../context/LiveContext';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

// --- UI HELPERS ---
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
    <div className={`fixed bottom-6 right-6 z-[200] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-up transition-all ${type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
        {type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
        <p className="font-bold text-sm">{message}</p>
        <button onClick={onClose} className="ml-4 hover:bg-white/20 rounded-full p-1"><X className="w-4 h-4" /></button>
    </div>
);

// --- MOCK TEACHER STATS ---
const TEACHER_STATS = [
  { label: 'Total Students', value: '142', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/20' },
  { label: 'Active Batches', value: '4', icon: BookOpen, color: 'text-brand-500', bg: 'bg-brand-500/20' },
  { label: 'JLPT Pass Rate', value: '94%', icon: BarChart2, color: 'text-accent-gold', bg: 'bg-accent-gold/20' },
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
          <h1 className="text-3xl font-bold text-white">Sensei Dashboard</h1>
          <p className="text-gray-400">Manage your Japanese language classes and student progress.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TEACHER_STATS.map((stat, i) => (
          <div key={i} className="bg-dark-800 p-6 rounded-xl border border-dark-700 flex items-center gap-4 hover:border-brand-500/30 transition shadow-lg">
            <div className={`p-4 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-semibold uppercase">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Classes */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-500" /> Today's Schedule
            </h3>
            <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-dark-900 rounded-lg border-l-4 border-brand-500">
                    <div className="text-center w-16">
                        <p className="text-brand-500 font-bold">10:00</p>
                        <p className="text-xs text-gray-500">AM</p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold">JLPT N4 Grammar</h4>
                        <p className="text-sm text-gray-400">Batch B-2024 • Live Lecture</p>
                        <div className="mt-2 flex gap-2">
                            <button className="text-xs bg-brand-600 text-white px-3 py-1 rounded hover:bg-brand-500">Start Class</button>
                            <button className="text-xs border border-dark-600 text-gray-400 px-3 py-1 rounded hover:text-white">View Material</button>
                        </div>
                    </div>
                </div>
                
                 <div className="flex items-start gap-4 p-4 bg-dark-900 rounded-lg border-l-4 border-blue-500">
                    <div className="text-center w-16">
                        <p className="text-blue-500 font-bold">02:00</p>
                        <p className="text-xs text-gray-500">PM</p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold">Kanji Practice & Q&A</h4>
                        <p className="text-sm text-gray-400">Batch B-2024 • Interactive</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Needs Attention */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 shadow-lg">
             <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" /> Needs Attention
            </h3>
            <div className="space-y-3">
                 {MOCK_PERFORMANCE.filter(s => s.riskLevel === 'HIGH').map(student => (
                     <div key={student.id} className="flex items-center justify-between p-3 bg-red-900/10 rounded-lg border border-red-500/20">
                         <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 font-bold text-xs">
                                 {student.name.charAt(0)}
                             </div>
                             <div>
                                 <p className="text-white text-sm font-bold">{student.name}</p>
                                 <p className="text-xs text-red-400">Low Attendance ({student.attendance}%)</p>
                             </div>
                         </div>
                         <button className="text-xs text-gray-400 hover:text-white underline">Contact</button>
                     </div>
                 ))}
                 <div className="flex items-center justify-between p-3 bg-dark-900 rounded-lg">
                     <p className="text-sm text-gray-300">Assignment "Kanji Workbook" has 12 ungraded submissions.</p>
                     <button className="text-xs text-brand-500 font-bold">Grade</button>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- ROBUST COURSE CREATION WIZARD ---
interface WizardProps {
    onClose: () => void;
    onRefresh: () => void;
    courseId?: string | null;
    showToast: (msg: string, type: 'success'|'error') => void;
}

const CourseCreationWizard = ({ onClose, onRefresh, courseId, showToast }: WizardProps) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true); // Default to true to load resources
    
    // DB Data States
    const [availableBatches, setAvailableBatches] = useState<string[]>([]);
    const [availableStudents, setAvailableStudents] = useState<User[]>([]);
    const [studentSearch, setStudentSearch] = useState('');

    // Form Data - Robust defaults
    const [courseData, setCourseData] = useState<Partial<Course>>({
        title: '',
        description: '',
        level: 'N5',
        thumbnail: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&q=80&w=800',
        modules: [],
        assignedBatches: [],
        enrolledStudentIds: [],
        status: 'DRAFT',
        instructor: 'Tanaka Sensei' 
    });

    const [newModuleTitle, setNewModuleTitle] = useState('');

    // Fetch Batches & Students on Mount + Course Details if editing
    useEffect(() => {
        let isMounted = true;

        const fetchResources = async () => {
            try {
                setIsFetching(true);
                
                // 1. Fetch Batches
                const { data: batches } = await supabase.from('batches').select('name');
                if (isMounted && batches) {
                    setAvailableBatches(batches.map(b => b.name));
                }
                
                // 2. Fetch ALL Students (Robust - fetch everything to ensure we don't miss anyone)
                // We'll filter visually if needed, but for "Add Student", the teacher expects to see everyone.
                const { data: students } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('full_name');
                
                if (isMounted && students) {
                     const mapped = students.map((u: any) => ({
                        id: u.id,
                        name: u.full_name || u.email, // Fallback if name missing
                        role: u.role || 'STUDENT',
                        email: u.email,
                        avatar: u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'User')}&background=random`,
                        batch: u.batch,
                        rollNumber: u.student_id
                    }));
                    setAvailableStudents(mapped);
                }

                // 3. Fetch Existing Course if ID present
                if (courseId) {
                    const { data: course, error } = await supabase.from('courses').select('*').eq('id', courseId).single();
                    if (error) throw error;
                    
                    if (isMounted && course) {
                         // Fetch children
                         const { data: modules } = await supabase
                            .from('course_modules')
                            .select('*, course_materials(*)')
                            .eq('course_id', courseId)
                            .order('order');
                         
                         const { data: batchLinks } = await supabase
                            .from('course_batches')
                            .select('batch_name')
                            .eq('course_id', courseId);

                         const { data: enrollLinks } = await supabase
                            .from('course_enrollments')
                            .select('student_id')
                            .eq('course_id', courseId);
                        
                        setCourseData({
                            id: course.id,
                            title: course.title,
                            description: course.description || '',
                            level: course.level,
                            thumbnail: course.thumbnail,
                            status: course.status,
                            instructor: course.instructor_name,
                            modules: modules || [], // SAFE DEFAULT
                            assignedBatches: batchLinks?.map(b => b.batch_name) || [],
                            enrolledStudentIds: enrollLinks?.map(e => e.student_id) || []
                        });
                    }
                }

            } catch (e) {
                console.error("Error loading wizard resources:", e);
                showToast("Failed to load course details. Please try again.", 'error');
                if (courseId) onClose(); // Close if editing fails
            } finally {
                if (isMounted) setIsFetching(false);
            }
        };

        fetchResources();
        return () => { isMounted = false; };
    }, [courseId]);

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);
    
    const addModule = () => {
        if (!newModuleTitle.trim()) return;
        const newMod: CourseModule = {
            id: crypto.randomUUID(), 
            title: newModuleTitle,
            materials: [],
            duration: '0m'
        };
        // Safe access
        const currentModules = courseData.modules || [];
        setCourseData({
            ...courseData,
            modules: [...currentModules, newMod]
        });
        setNewModuleTitle('');
    };

    const removeModule = (idx: number) => {
        const newModules = [...(courseData.modules || [])];
        newModules.splice(idx, 1);
        setCourseData({...courseData, modules: newModules});
    };

    const addMaterialToModule = (moduleIdx: number, type: 'PDF' | 'LINK' | 'VIDEO') => {
        const title = prompt(`Enter Title for ${type}:`);
        if(!title) return;
        const url = type === 'VIDEO' ? 'https://example.com/video.mp4' : 'https://example.com/material.pdf'; 

        const newMat: CourseMaterial = {
            id: crypto.randomUUID(),
            title: title,
            type: type,
            url: url
        };

        const updatedModules = [...(courseData.modules || [])];
        if (!updatedModules[moduleIdx].materials) updatedModules[moduleIdx].materials = [];
        updatedModules[moduleIdx].materials.push(newMat);
        setCourseData({ ...courseData, modules: updatedModules });
    };

    const toggleBatch = (batchName: string) => {
        const current = courseData.assignedBatches || [];
        if (current.includes(batchName)) {
            setCourseData({ ...courseData, assignedBatches: current.filter(b => b !== batchName) });
        } else {
            setCourseData({ ...courseData, assignedBatches: [...current, batchName] });
        }
    };

    const toggleStudent = (id: string) => {
        const current = courseData.enrolledStudentIds || [];
        if (current.includes(id)) {
            setCourseData({ ...courseData, enrolledStudentIds: current.filter(s => s !== id) });
        } else {
            setCourseData({ ...courseData, enrolledStudentIds: [...current, id] });
        }
    };

    const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
        if (!courseData.title || !courseData.level) {
            showToast("Please fill in Course Title and Level.", 'error');
            return;
        }

        setIsLoading(true);

        try {
            let activeCourseId = courseId;

            const coursePayload = {
                title: courseData.title,
                description: courseData.description,
                level: courseData.level,
                thumbnail: courseData.thumbnail,
                status: status,
                instructor_name: courseData.instructor
            };

            if (activeCourseId) {
                const { error } = await supabase.from('courses').update(coursePayload).eq('id', activeCourseId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('courses').insert(coursePayload).select().single();
                if (error) throw error;
                activeCourseId = data.id;
            }

            if (!activeCourseId) throw new Error("Failed to resolve Course ID");

            // --- CASCADE HANDLING ---
            // 1. Modules & Materials
            const { data: oldModules } = await supabase.from('course_modules').select('id').eq('course_id', activeCourseId);
            if (oldModules && oldModules.length > 0) {
                const oldModuleIds = oldModules.map(m => m.id);
                await supabase.from('course_materials').delete().in('module_id', oldModuleIds);
                await supabase.from('course_modules').delete().in('id', oldModuleIds);
            }

            if (courseData.modules && courseData.modules.length > 0) {
                for (let i = 0; i < courseData.modules.length; i++) {
                    const mod = courseData.modules[i];
                    const { data: modInsert, error: modError } = await supabase.from('course_modules').insert({
                        course_id: activeCourseId,
                        title: mod.title,
                        "order": i
                    }).select().single();

                    if (modError) throw modError;
                    
                    if (mod.materials && mod.materials.length > 0) {
                        const matsPayload = mod.materials.map(mat => ({
                            module_id: modInsert.id,
                            title: mat.title,
                            type: mat.type,
                            url: mat.url
                        }));
                        await supabase.from('course_materials').insert(matsPayload);
                    }
                }
            }

            // 2. Batches
            await supabase.from('course_batches').delete().eq('course_id', activeCourseId);
            if (courseData.assignedBatches && courseData.assignedBatches.length > 0) {
                const batchPayload = courseData.assignedBatches.map(bName => ({
                    course_id: activeCourseId,
                    batch_name: bName
                }));
                await supabase.from('course_batches').insert(batchPayload);
            }

            // 3. Enrollments
            await supabase.from('course_enrollments').delete().eq('course_id', activeCourseId);
            if (courseData.enrolledStudentIds && courseData.enrolledStudentIds.length > 0) {
                const enrollPayload = courseData.enrolledStudentIds.map(sId => ({
                    course_id: activeCourseId,
                    student_id: sId
                }));
                await supabase.from('course_enrollments').insert(enrollPayload);
            }

            showToast(`Course ${status === 'DRAFT' ? 'saved as draft' : 'published'} successfully!`, 'success');
            onRefresh(); 
            onClose();

        } catch (e: any) {
            console.error("Course Save Failed:", e);
            showToast(`Failed to save: ${e.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredStudents = availableStudents.filter(s => 
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
        s.email.toLowerCase().includes(studentSearch.toLowerCase())
    );

    if (isFetching) {
         return (
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                 <div className="text-center">
                     <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
                     <p className="text-white">Loading...</p>
                 </div>
            </div>
         );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-dark-800 w-full max-w-5xl rounded-2xl border border-dark-700 shadow-2xl flex flex-col h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-dark-700 flex justify-between items-center bg-dark-900">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                           {courseId ? <Edit3 className="w-6 h-6 text-brand-500" /> : <Plus className="w-6 h-6 text-brand-500" />} 
                           {courseId ? `Edit: ${courseData.title}` : 'Create New Course'}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Step {step} of 4</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-dark-800 rounded-full text-gray-500 hover:text-white"><X className="w-6 h-6"/></button>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-dark-900">
                    <div 
                        className="h-full bg-brand-500 transition-all duration-500 ease-out"
                        style={{ width: `${(step / 4) * 100}%` }}
                    ></div>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-8 bg-dark-800/50">
                    {/* STEP 1: IDENTITY */}
                    {step === 1 && (
                        <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
                            <h3 className="text-xl font-bold text-white mb-6">Course Identity</h3>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Course Title <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition"
                                    placeholder="e.g. JLPT N4 Comprehensive Grammar"
                                    value={courseData.title || ''}
                                    onChange={e => setCourseData({...courseData, title: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">JLPT Level <span className="text-red-500">*</span></label>
                                    <select 
                                        className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:border-brand-500 outline-none transition"
                                        value={courseData.level || 'N5'}
                                        onChange={e => setCourseData({...courseData, level: e.target.value as any})}
                                    >
                                        <option value="N5">N5 (Beginner)</option>
                                        <option value="N4">N4 (Basic)</option>
                                        <option value="N3">N3 (Intermediate)</option>
                                        <option value="N2">N2 (Advanced)</option>
                                        <option value="N1">N1 (Expert)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Thumbnail URL</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:border-brand-500 outline-none transition"
                                        value={courseData.thumbnail || ''}
                                        onChange={e => setCourseData({...courseData, thumbnail: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Description</label>
                                <textarea 
                                    className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:border-brand-500 outline-none h-32 resize-none transition"
                                    placeholder="Describe what students will learn..."
                                    value={courseData.description || ''}
                                    onChange={e => setCourseData({...courseData, description: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 2: CURRICULUM */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-xl font-bold text-white mb-4">Curriculum Builder</h3>
                            
                            <div className="flex gap-4 mb-8">
                                <input 
                                    type="text" 
                                    className="flex-1 bg-dark-900 border border-dark-700 rounded-lg p-3 text-white outline-none focus:border-brand-500 transition"
                                    placeholder="Enter Chapter/Module Title..."
                                    value={newModuleTitle}
                                    onChange={e => setNewModuleTitle(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addModule()}
                                />
                                <button 
                                    onClick={addModule}
                                    className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg transition"
                                >
                                    <Plus className="w-5 h-5" /> Add Chapter
                                </button>
                            </div>

                            <div className="space-y-4">
                                {(courseData.modules || []).length === 0 && (
                                    <div className="text-center p-12 border-2 border-dashed border-dark-700 rounded-xl text-gray-500">
                                        No chapters added yet. Start building your curriculum!
                                    </div>
                                )}
                                {(courseData.modules || []).map((mod, idx) => (
                                    <div key={mod.id || idx} className="bg-dark-900 rounded-xl border border-dark-700 p-4 transition hover:border-dark-600">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                                <span className="bg-dark-800 text-gray-400 w-8 h-8 rounded-full flex items-center justify-center text-xs border border-dark-700">{idx + 1}</span>
                                                {mod.title}
                                            </h4>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => addMaterialToModule(idx, 'VIDEO')}
                                                    className="px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 bg-dark-800 text-gray-400 border border-dark-600 hover:text-white hover:border-brand-500 transition"
                                                >
                                                    <Video className="w-3 h-3" /> Add Video
                                                </button>
                                                <button 
                                                    onClick={() => addMaterialToModule(idx, 'PDF')}
                                                    className="px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 bg-dark-800 text-gray-400 border border-dark-600 hover:text-white hover:border-brand-500 transition"
                                                >
                                                    <Upload className="w-3 h-3" /> Materials
                                                </button>
                                                <button 
                                                    onClick={() => removeModule(idx)}
                                                    className="px-2 py-1.5 rounded text-xs font-bold bg-dark-800 text-red-500 border border-dark-600 hover:bg-red-900/20 transition"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {mod.materials && mod.materials.length > 0 && (
                                            <div className="bg-dark-800 rounded-lg p-3 space-y-2">
                                                {mod.materials.map((mat, matIdx) => (
                                                    <div key={mat.id || matIdx} className="flex items-center gap-3 text-sm text-gray-300 p-2 bg-dark-900 rounded border border-dark-700">
                                                        {mat.type === 'VIDEO' ? <Film className="w-4 h-4 text-brand-500" /> : <Paperclip className="w-4 h-4" />} 
                                                        {mat.title} <span className="text-xs bg-dark-800 px-1 rounded text-gray-500 border border-dark-700">{mat.type}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: ENROLLMENT */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in h-full flex flex-col">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">Enrollment & Access</h3>
                                <div className="text-xs text-gray-400 bg-dark-900 px-3 py-1 rounded border border-dark-700">
                                    <span className="text-brand-500 font-bold">{courseData.assignedBatches?.length || 0} Batches</span> 
                                    <span className="mx-2">•</span> 
                                    <span className="text-white font-bold">{courseData.enrolledStudentIds?.length || 0} Individual Overrides</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
                                {/* LEFT: BATCH SELECTION */}
                                <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden flex flex-col">
                                    <div className="p-4 border-b border-dark-700 bg-dark-800 font-bold text-gray-300 flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-brand-500" /> Batch Assignments
                                    </div>
                                    <div className="p-4 overflow-y-auto flex-1 space-y-3">
                                        {availableBatches.length === 0 && <p className="text-center text-gray-500 text-sm mt-4">No batches found.</p>}
                                        {availableBatches.map(batch => {
                                            const isSelected = courseData.assignedBatches?.includes(batch);
                                            return (
                                                <div 
                                                    key={batch} 
                                                    onClick={() => toggleBatch(batch)}
                                                    className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition ${isSelected ? 'bg-brand-900/20 border-brand-500' : 'bg-dark-800 border-dark-600 hover:border-gray-500'}`}
                                                >
                                                    <span className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-gray-400'}`}>{batch}</span>
                                                    {isSelected && <CheckCircle className="w-4 h-4 text-brand-500" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* RIGHT: INDIVIDUAL SELECTION */}
                                <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden flex flex-col">
                                    <div className="p-3 border-b border-dark-700 bg-dark-800 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-500" /> 
                                        <span className="font-bold text-gray-300 text-sm flex-1">Individual Students</span>
                                        <input 
                                            type="text" 
                                            placeholder="Search name..." 
                                            value={studentSearch}
                                            onChange={e => setStudentSearch(e.target.value)}
                                            className="bg-dark-900 border border-dark-700 rounded px-2 py-1 text-xs text-white outline-none w-32 focus:border-blue-500 transition"
                                        />
                                    </div>
                                    <div className="p-4 overflow-y-auto flex-1 space-y-3">
                                        {filteredStudents.length === 0 && <p className="text-center text-gray-500 text-sm mt-4">No students found.</p>}
                                        {filteredStudents.map(student => {
                                            const isDirectlyEnrolled = courseData.enrolledStudentIds?.includes(student.id);
                                            // SMART LOGIC: If their batch is selected, they are implicitly enrolled
                                            const batchName = student.batch;
                                            const isBatchEnrolled = batchName && courseData.assignedBatches?.includes(batchName);
                                            
                                            // We disable toggle if they are already in via batch to prevent confusion
                                            const isDisabled = !!isBatchEnrolled;

                                            return (
                                                <div 
                                                    key={student.id} 
                                                    onClick={() => !isDisabled && toggleStudent(student.id)}
                                                    className={`p-2 rounded-lg border flex items-center justify-between transition 
                                                        ${isBatchEnrolled 
                                                            ? 'bg-brand-900/10 border-brand-500/30 cursor-default opacity-80' 
                                                            : isDirectlyEnrolled 
                                                                ? 'bg-blue-900/20 border-blue-500 cursor-pointer' 
                                                                : 'bg-dark-800 border-dark-600 hover:border-gray-500 cursor-pointer'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold 
                                                            ${isBatchEnrolled ? 'bg-brand-900 text-brand-200' : isDirectlyEnrolled ? 'bg-blue-500 text-white' : 'bg-dark-700 text-gray-400'}`}>
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className={`text-sm font-bold ${isBatchEnrolled ? 'text-brand-200' : isDirectlyEnrolled ? 'text-white' : 'text-gray-300'}`}>{student.name}</p>
                                                            <p className="text-[10px] text-gray-500">{student.batch || 'No Batch'}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    {isBatchEnrolled && (
                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-brand-400 bg-brand-900/20 px-2 py-1 rounded border border-brand-500/20 uppercase tracking-wide">
                                                            <Layers className="w-3 h-3" /> Batch Added
                                                        </div>
                                                    )}
                                                    
                                                    {!isBatchEnrolled && isDirectlyEnrolled && <CheckCircle className="w-4 h-4 text-blue-500" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: REVIEW & SAVE */}
                    {step === 4 && (
                        <div className="space-y-8 animate-fade-in text-center max-w-2xl mx-auto pt-10">
                            <div className="w-24 h-24 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-500/30">
                                <Globe className="w-12 h-12 text-brand-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-white">{courseId ? 'Save Changes?' : 'Ready to Launch?'}</h2>
                            <p className="text-gray-400">
                                Choose how you want to save <span className="text-white font-bold">"{courseData.title}"</span>.
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-dark-900 p-6 rounded-xl border border-dark-700 hover:border-gray-500 transition cursor-pointer group shadow-lg" onClick={() => handleSave('DRAFT')}>
                                    <div className="p-3 bg-dark-800 rounded-lg w-fit mb-4 group-hover:bg-dark-700 transition">
                                        <Save className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Save as Draft</h3>
                                    <p className="text-sm text-gray-500">
                                        Save all your data securely. The course will remain hidden from students until you publish it.
                                    </p>
                                </div>

                                <div className="bg-brand-900/20 p-6 rounded-xl border border-brand-500/30 hover:border-brand-500 transition cursor-pointer group shadow-lg" onClick={() => handleSave('PUBLISHED')}>
                                    <div className="p-3 bg-brand-500/20 rounded-lg w-fit mb-4 group-hover:bg-brand-500/30 transition">
                                        <Globe className="w-6 h-6 text-brand-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Publish Now</h3>
                                    <p className="text-sm text-brand-200/70">
                                        Make this course immediately visible to all assigned batches and students.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-dark-700 bg-dark-900 flex justify-between">
                    <button 
                        onClick={step === 1 ? onClose : handleBack}
                        disabled={isLoading}
                        className="px-6 py-3 rounded-lg text-gray-400 hover:text-white font-bold transition"
                    >
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>
                    
                    {step < 4 && (
                        <button 
                            onClick={handleNext}
                            disabled={!courseData.title || isLoading}
                            className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 transition shadow-lg shadow-brand-900/50"
                        >
                            Next Step <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const TeacherCoursesPage = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ msg: string, type: 'success'|'error' } | null>(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if(toast) {
            const t = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(t);
        }
    }, [toast]);

    const showToast = (msg: string, type: 'success'|'error') => setToast({ msg, type });

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
            if (data) {
                const mapped = data.map((c: any) => ({
                    ...c,
                    instructor: c.instructor_name,
                    modules: [], 
                    studentCount: 0 
                }));
                setCourses(mapped);
            }
        } catch (e) {
            console.error(e);
            showToast("Failed to load courses.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if(!confirm(`⚠️ PERMANENT DELETE WARNING ⚠️\n\nDeleting "${title}" will remove:\n- All Course Chapters & Videos\n- All Batch Assignments\n- All Student Progress\n\nThis action cannot be undone. Are you absolutely sure?`)) {
            return;
        }

        try {
            // ROBUST DELETE: Manual cleanup of related tables first to ensure success
            // 1. Delete Enrollments
            await supabase.from('course_enrollments').delete().eq('course_id', id);
            // 2. Delete Batch Links
            await supabase.from('course_batches').delete().eq('course_id', id);
            
            // 3. Find and Delete Modules & Materials
            const { data: modules } = await supabase.from('course_modules').select('id').eq('course_id', id);
            if (modules && modules.length > 0) {
                const modIds = modules.map(m => m.id);
                // 3a. Delete Materials
                await supabase.from('course_materials').delete().in('module_id', modIds);
                // 3b. Delete Modules
                await supabase.from('course_modules').delete().in('id', modIds);
            }

            // 4. Finally Delete Course
            const { error } = await supabase.from('courses').delete().eq('id', id);
            
            if (error) throw error;
            
            setCourses(prev => prev.filter(c => c.id !== id));
            showToast(`Course "${title}" deleted successfully.`, 'success');

        } catch (err: any) {
            console.error("Delete Error:", err);
            showToast("Failed to delete. Try again or contact admin.", 'error');
        }
    };

    const openCreate = () => {
        setEditingCourseId(null);
        setIsWizardOpen(true);
    };

    const openEdit = (id: string) => {
        setEditingCourseId(id);
        setIsWizardOpen(true);
    };

    return (
        <div className="space-y-8 animate-fade-in relative">
            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

             <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Course Management</h1>
                    <p className="text-gray-400 text-sm mt-1">Design curriculum, upload materials, and assign batches</p>
                </div>
                <button 
                    onClick={openCreate}
                    className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-brand-900/50 transition transform hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" /> Create New Course
                </button>
            </div>

            {/* Empty State */}
            {!loading && courses.length === 0 ? (
                <div className="bg-dark-800 border-2 border-dashed border-dark-700 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="bg-dark-900 p-6 rounded-full mb-6 shadow-xl border border-dark-700">
                        <BookOpen className="w-12 h-12 text-dark-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Courses Created Yet</h3>
                    <p className="text-gray-500 max-w-md mb-8">Start by clicking the "Create Course" button to build your first curriculum, add videos, and assign students.</p>
                    <button 
                        onClick={openCreate}
                        className="bg-dark-700 hover:bg-dark-600 text-white px-6 py-3 rounded-lg font-bold border border-dark-500 transition"
                    >
                        Launch Course Wizard
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course.id} className="bg-dark-800 rounded-xl overflow-hidden border border-dark-700 hover:border-brand-500/50 transition group shadow-lg flex flex-col">
                            <div className="relative aspect-video bg-black group-hover:opacity-90 transition">
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-80 transition transform group-hover:scale-105 duration-700" />
                                <div className="absolute top-2 right-2 flex gap-2">
                                     <span className="bg-black/60 backdrop-blur text-white px-2 py-1 rounded text-xs font-bold border border-white/10 shadow-lg">
                                         {course.level}
                                     </span>
                                     <span className={`px-2 py-1 rounded text-xs font-bold border shadow-lg ${course.status === 'PUBLISHED' ? 'bg-green-500/80 text-white border-green-500' : 'bg-gray-600/80 text-gray-200 border-gray-500'}`}>
                                         {course.status}
                                     </span>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-brand-500 transition">{course.title}</h3>
                                <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">{course.description || "No description provided."}</p>
                                
                                <div className="flex gap-2 mt-auto">
                                    <button 
                                        onClick={() => openEdit(course.id)}
                                        className="flex-1 bg-brand-600 hover:bg-brand-500 text-white py-2 rounded text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition"
                                    >
                                        <Edit3 className="w-4 h-4" /> Edit Content
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(course.id, course.title)} 
                                        className="p-2 bg-dark-700 hover:bg-red-900/30 text-red-500 rounded border border-dark-600 transition"
                                        title="Delete Course Permanently"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isWizardOpen && (
                <CourseCreationWizard 
                    onClose={() => setIsWizardOpen(false)} 
                    onRefresh={fetchCourses} 
                    courseId={editingCourseId}
                    showToast={showToast}
                />
            )}
        </div>
    );
};

export const TeacherAssignmentsPage = () => {
  return (
    <div className="space-y-8 animate-fade-in">
       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Assignments</h1>
          <p className="text-gray-400">Manage student tasks and homework.</p>
        </div>
        <button className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg">
          <Plus className="w-5 h-5" /> Create Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {MOCK_ASSIGNMENTS.map(assignment => (
          <div key={assignment.id} className="bg-dark-800 p-6 rounded-xl border border-dark-700 flex justify-between items-center hover:border-brand-500/30 transition">
             <div>
                <h3 className="text-xl font-bold text-white">{assignment.title}</h3>
                <p className="text-gray-400 text-sm flex gap-2 mt-1">
                   <span>{assignment.courseName}</span> • <span>Due: {assignment.dueDate}</span>
                </p>
             </div>
             <div className="flex items-center gap-6">
                <div className="text-right">
                   <p className="text-2xl font-bold text-white">{assignment.totalSubmissions}/{assignment.totalStudents}</p>
                   <p className="text-xs text-gray-500">Submissions</p>
                </div>
                <div className={`px-3 py-1 rounded text-xs font-bold border ${assignment.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500 border-green-500/30' : 'bg-gray-700 text-gray-400 border-gray-600'}`}>
                   {assignment.status}
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TeacherReportsPage = () => {
    // Ideally fetch from supabase, using mock performance for now or simple table
    return (
        <div className="space-y-8 animate-fade-in">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Student Reports & Analytics</h1>
                <div className="flex gap-2">
                    <button className="bg-dark-800 border border-dark-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
                    <h3 className="text-lg font-bold text-white mb-4">Class Performance Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { range: '0-40%', count: 5 },
                                { range: '40-60%', count: 12 },
                                { range: '60-80%', count: 25 },
                                { range: '80-100%', count: 10 },
                            ]}>
                                <XAxis dataKey="range" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                                <Bar dataKey="count" fill="#bc002d" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                 </div>

                 <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 overflow-y-auto max-h-[360px]">
                    <h3 className="text-lg font-bold text-white mb-4">At-Risk Students</h3>
                    <div className="space-y-3">
                        {MOCK_PERFORMANCE.filter(s => s.riskLevel !== 'LOW').map(s => (
                            <div key={s.id} className="flex items-center justify-between p-3 bg-dark-900 rounded-lg border border-dark-600">
                                <div>
                                    <p className="font-bold text-white">{s.name}</p>
                                    <p className="text-xs text-red-400">{s.riskLevel} Risk • Avg: {s.avgScore}%</p>
                                </div>
                                <button className="text-xs text-gray-400 hover:text-white underline">View Profile</button>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>

            <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
                <div className="p-4 bg-dark-900 border-b border-dark-700 font-bold text-gray-300">
                    All Students
                </div>
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-dark-900/50 text-gray-200 uppercase font-bold text-xs">
                        <tr>
                            <th className="p-4">Student Name</th>
                            <th className="p-4">Attendance</th>
                            <th className="p-4">Avg Score</th>
                            <th className="p-4">Risk Level</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-700">
                        {MOCK_PERFORMANCE.map(s => (
                            <tr key={s.id} className="hover:bg-dark-700/50">
                                <td className="p-4 font-bold text-white">{s.name}</td>
                                <td className="p-4">{s.attendance}%</td>
                                <td className="p-4">{s.avgScore}%</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        s.riskLevel === 'LOW' ? 'bg-green-500/20 text-green-500' : 
                                        s.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'
                                    }`}>
                                        {s.riskLevel}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button className="text-brand-500 hover:text-white text-xs">Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const LiveClassConsole = () => {
    const { 
        isLive, topic, viewerCount, localStream, chatMessages,
        startSession, endSession, enablePreview, toggleMic, toggleCamera, sendMessage
    } = useLiveSession();
    
    const [title, setTitle] = useState('');
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [transcript, setTranscript] = useState('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [summary, setSummary] = useState('');

    useEffect(() => {
        if (localStream && videoRef.current) {
            videoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    const handleToggleMic = () => {
        setMicOn(!micOn);
        toggleMic(!micOn);
    };

    const handleToggleCam = () => {
        setCamOn(!camOn);
        toggleCamera(!camOn);
    };

    const handleGenerateSummary = async () => {
        setIsGeneratingSummary(true);
        // Simulate a transcript from chat or dummy data for now, as real STT isn't fully hooked up to a variable
        const mockTranscript = chatMessages.map(m => `${m.user}: ${m.text}`).join('\n');
        const summaryText = await generateClassSummary(mockTranscript || "No transcript available. Class focused on grammar points N4.");
        setSummary(summaryText);
        setIsGeneratingSummary(false);
    };

    return (
        <div className="h-[calc(100vh-2rem)] flex gap-6 animate-fade-in">
            {/* Left: Video & Controls */}
            <div className="flex-1 flex flex-col gap-4">
                 <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Video className="w-6 h-6 text-brand-500" /> Live Classroom Console
                        </h2>
                        <p className="text-sm text-gray-400">{isLive ? `Broadcasting: ${topic}` : 'Session Offline'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-400 bg-dark-900 px-3 py-1 rounded border border-dark-700">
                            <Users className="w-4 h-4" /> <span className="font-mono font-bold text-white">{viewerCount}</span>
                        </div>
                        {!isLive ? (
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Enter Class Topic..." 
                                    className="bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg text-sm outline-none focus:border-brand-500 w-64"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                                <button 
                                    onClick={() => startSession(title || 'Untitled Class')}
                                    className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                                >
                                    <WifiOff className="w-4 h-4" /> Go Live
                                </button>
                                <button onClick={enablePreview} className="bg-dark-700 text-white px-3 py-2 rounded-lg text-sm">Preview</button>
                            </div>
                        ) : (
                            <button 
                                onClick={endSession}
                                className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg animate-pulse"
                            >
                                End Class
                            </button>
                        )}
                    </div>
                 </div>

                 <div className="flex-1 bg-black rounded-xl border border-dark-700 overflow-hidden relative group">
                     {localStream ? (
                         <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                     ) : (
                         <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                             <div className="text-center">
                                 <CameraOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                 <p>Camera is off or preview not enabled</p>
                             </div>
                         </div>
                     )}
                     
                     <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 bg-dark-900/80 backdrop-blur px-6 py-3 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition duration-300">
                         <button onClick={handleToggleMic} className={`p-3 rounded-full ${micOn ? 'bg-dark-700 hover:bg-dark-600 text-white' : 'bg-red-500 text-white'}`}>
                             {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                         </button>
                         <button onClick={handleToggleCam} className={`p-3 rounded-full ${camOn ? 'bg-dark-700 hover:bg-dark-600 text-white' : 'bg-red-500 text-white'}`}>
                             {camOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                         </button>
                     </div>
                 </div>
                 
                 {summary && (
                     <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 max-h-48 overflow-y-auto">
                         <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                             <FileText className="w-4 h-4 text-brand-500" /> AI Class Summary
                         </h3>
                         <div className="prose prose-invert prose-sm">
                             {summary}
                         </div>
                     </div>
                 )}
            </div>

            {/* Right: Chat & Tools */}
            <div className="w-80 flex flex-col gap-4">
                <div className="flex-1 bg-dark-800 rounded-xl border border-dark-700 flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-dark-700 bg-dark-900 font-bold text-white flex justify-between items-center">
                        <span>Live Chat</span>
                        <span className="text-xs font-normal text-gray-500">{chatMessages.length} msgs</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {chatMessages.length === 0 && <p className="text-center text-gray-600 text-sm mt-10">Chat is quiet...</p>}
                        {chatMessages.map((msg, i) => (
                            <div key={i} className="text-sm">
                                <span className={`font-bold text-xs ${msg.user === 'SYSTEM' ? 'text-brand-500' : 'text-blue-400'}`}>{msg.user}</span>
                                <p className="text-gray-300">{msg.text}</p>
                            </div>
                        ))}
                    </div>
                    {/* Teacher can also chat */}
                    <div className="p-3 bg-dark-900 border-t border-dark-700">
                         <input 
                            type="text" 
                            placeholder="Send message..."
                            className="w-full bg-dark-800 border border-dark-700 rounded px-3 py-2 text-sm text-white focus:border-brand-500 outline-none"
                            onKeyDown={e => {
                                if(e.key === 'Enter') {
                                    sendMessage('Sensei', e.currentTarget.value);
                                    e.currentTarget.value = '';
                                }
                            }}
                         />
                    </div>
                </div>

                <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 space-y-3">
                    <h3 className="font-bold text-white text-sm uppercase">Quick Actions</h3>
                    <button 
                        onClick={handleGenerateSummary} 
                        disabled={isGeneratingSummary}
                        className="w-full bg-dark-700 hover:bg-dark-600 text-white py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition"
                    >
                        {isGeneratingSummary ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4 text-brand-500" />}
                        Generate AI Summary
                    </button>
                </div>
            </div>
        </div>
    );
};
