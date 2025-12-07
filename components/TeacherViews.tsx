
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Users, BookOpen, Clock, Plus, Video, 
  MessageSquare, BarChart2, Calendar, FileText, 
  CheckCircle, AlertTriangle, MoreVertical, X,
  Mic, MicOff, Camera, CameraOff, Monitor, Languages,
  ChevronRight, Filter, Search, Download, Trash2, Upload,
  Layers, ChevronDown, Save, Eye, Paperclip, Film, PlayCircle,
  Briefcase, GraduationCap, Loader2, Edit3, Globe, Lock, AlertCircle, Check
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
    const [isFetching, setIsFetching] = useState(!!courseId);
    
    // DB Data States
    const [availableBatches, setAvailableBatches] = useState<string[]>([]);
    const [availableStudents, setAvailableStudents] = useState<User[]>([]);
    const [studentSearch, setStudentSearch] = useState('');

    // Form Data
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
        const fetchResources = async () => {
            try {
                // 1. Fetch Batches
                const { data: batches } = await supabase.from('batches').select('name');
                if (batches) {
                    setAvailableBatches(batches.map(b => b.name));
                }
                // 2. Fetch Students
                const { data: students } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'STUDENT')
                    .order('full_name');
                
                if (students) {
                     const mapped = students.map((u: any) => ({
                        id: u.id,
                        name: u.full_name,
                        role: 'STUDENT',
                        email: u.email,
                        avatar: u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name)}&background=random`,
                        batch: u.batch
                    }));
                    setAvailableStudents(mapped);
                }

                // 3. Fetch Existing Course if ID present
                if (courseId) {
                    const { data: course, error } = await supabase.from('courses').select('*').eq('id', courseId).single();
                    if (error) throw error;
                    if (course) {
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
                            description: course.description,
                            level: course.level,
                            thumbnail: course.thumbnail,
                            status: course.status,
                            instructor: course.instructor_name,
                            modules: modules || [],
                            assignedBatches: batchLinks?.map(b => b.batch_name) || [],
                            enrolledStudentIds: enrollLinks?.map(e => e.student_id) || []
                        });
                    }
                }

            } catch (e) {
                console.error("Error loading wizard resources:", e);
                showToast("Failed to load course details", 'error');
            } finally {
                setIsFetching(false);
            }
        };
        fetchResources();
    }, [courseId]);

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);
    
    const addModule = () => {
        if (!newModuleTitle.trim()) return;
        const newMod: CourseModule = {
            id: crypto.randomUUID(), // Temp ID (or text based on setup)
            title: newModuleTitle,
            materials: [],
            duration: '0m'
        };
        setCourseData({
            ...courseData,
            modules: [...(courseData.modules || []), newMod]
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
        // Mock default URL for demo - in prod, this would be a file upload to Supabase Storage
        const url = type === 'VIDEO' ? 'https://example.com/video.mp4' : 'https://example.com/material.pdf'; 

        const newMat: CourseMaterial = {
            id: crypto.randomUUID(),
            title: title,
            type: type,
            url: url
        };

        const updatedModules = [...(courseData.modules || [])];
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
        // Validation
        if (!courseData.title || !courseData.level) {
            showToast("Please fill in Course Title and Level.", 'error');
            return;
        }

        setIsLoading(true);

        try {
            let activeCourseId = courseId;

            // 1. Upsert Course
            const coursePayload = {
                title: courseData.title,
                description: courseData.description,
                level: courseData.level,
                thumbnail: courseData.thumbnail,
                status: status, // Set Draft or Published
                instructor_name: courseData.instructor
            };

            if (activeCourseId) {
                // UPDATE
                const { error } = await supabase
                    .from('courses')
                    .update(coursePayload)
                    .eq('id', activeCourseId);
                if (error) throw error;
            } else {
                // INSERT
                const { data, error } = await supabase
                    .from('courses')
                    .insert(coursePayload)
                    .select()
                    .single();
                if (error) throw error;
                activeCourseId = data.id;
            }

            if (!activeCourseId) throw new Error("Failed to resolve Course ID");

            // 2. Handle Modules & Materials (MANUAL CLEANUP to ensure it works even without strict CASCADE)
            // First, find all existing modules
            const { data: oldModules } = await supabase.from('course_modules').select('id').eq('course_id', activeCourseId);
            if (oldModules && oldModules.length > 0) {
                const oldModuleIds = oldModules.map(m => m.id);
                // Delete materials for these modules
                await supabase.from('course_materials').delete().in('module_id', oldModuleIds);
                // Delete modules
                await supabase.from('course_modules').delete().in('id', oldModuleIds);
            }

            // Insert new modules and materials
            if (courseData.modules && courseData.modules.length > 0) {
                for (let i = 0; i < courseData.modules.length; i++) {
                    const mod = courseData.modules[i];
                    const { data: modInsert, error: modError } = await supabase.from('course_modules').insert({
                        course_id: activeCourseId,
                        title: mod.title,
                        "order": i
                    }).select().single();

                    if (modError) throw modError;
                    const newModId = modInsert.id;

                    if (mod.materials && mod.materials.length > 0) {
                        const matsPayload = mod.materials.map(mat => ({
                            module_id: newModId,
                            title: mat.title,
                            type: mat.type,
                            url: mat.url
                        }));
                        await supabase.from('course_materials').insert(matsPayload);
                    }
                }
            }

            // 3. Update Batch Assignments (Wipe & Re-insert)
            await supabase.from('course_batches').delete().eq('course_id', activeCourseId);
            if (courseData.assignedBatches && courseData.assignedBatches.length > 0) {
                const batchPayload = courseData.assignedBatches.map(bName => ({
                    course_id: activeCourseId,
                    batch_name: bName
                }));
                await supabase.from('course_batches').insert(batchPayload);
            }

            // 4. Update Enrollments (Wipe & Re-insert)
            await supabase.from('course_enrollments').delete().eq('course_id', activeCourseId);
            if (courseData.enrolledStudentIds && courseData.enrolledStudentIds.length > 0) {
                const enrollPayload = courseData.enrolledStudentIds.map(sId => ({
                    course_id: activeCourseId,
                    student_id: sId
                }));
                await supabase.from('course_enrollments').insert(enrollPayload);
            }

            // Success
            showToast(`Course ${status === 'DRAFT' ? 'saved as draft' : 'published'} successfully!`, 'success');
            onRefresh(); 
            onClose();

        } catch (e: any) {
            console.error("Course Save Failed:", e);
             if (e.code === '42P01' || e.code === '42703' || e.code === 'PGRST204') { 
                showToast("DB SCHEMA ERROR: Run setup SQL.", 'error');
            } else {
                showToast(`Failed to save: ${e.message}`, 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Filter students for Step 3
    const filteredStudents = availableStudents.filter(s => 
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
        s.email.toLowerCase().includes(studentSearch.toLowerCase())
    );

    if (isFetching) {
         return (
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                 <div className="text-center">
                     <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
                     <p className="text-white">Loading Course Data...</p>
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
                           {courseId ? `Editing: ${courseData.title}` : 'Create New Course'}
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
                                    value={courseData.title}
                                    onChange={e => setCourseData({...courseData, title: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">JLPT Level <span className="text-red-500">*</span></label>
                                    <select 
                                        className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:border-brand-500 outline-none transition"
                                        value={courseData.level}
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
                                        value={courseData.thumbnail}
                                        onChange={e => setCourseData({...courseData, thumbnail: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Description</label>
                                <textarea 
                                    className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:border-brand-500 outline-none h-32 resize-none transition"
                                    placeholder="Describe what students will learn..."
                                    value={courseData.description}
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
                                {courseData.modules?.length === 0 && (
                                    <div className="text-center p-12 border-2 border-dashed border-dark-700 rounded-xl text-gray-500">
                                        No chapters added yet. Start building your curriculum!
                                    </div>
                                )}
                                {courseData.modules?.map((mod, idx) => (
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
                                        
                                        {mod.materials.length > 0 && (
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
                                <p className="text-sm text-gray-400">Total Access: <span className="text-brand-500 font-bold">{courseData.assignedBatches?.length} Batches</span> + <span className="text-white font-bold">{courseData.enrolledStudentIds?.length} Individuals</span></p>
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
                                            const isSelected = courseData.enrolledStudentIds?.includes(student.id);
                                            return (
                                                <div 
                                                    key={student.id} 
                                                    onClick={() => toggleStudent(student.id)}
                                                    className={`p-2 rounded-lg border cursor-pointer flex items-center justify-between transition ${isSelected ? 'bg-blue-900/20 border-blue-500' : 'bg-dark-800 border-dark-600 hover:border-gray-500'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-blue-500 text-white' : 'bg-dark-700 text-gray-400'}`}>
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>{student.name}</p>
                                                            <p className="text-[10px] text-gray-500">{student.batch || 'No Batch'}</p>
                                                        </div>
                                                    </div>
                                                    {isSelected && <CheckCircle className="w-4 h-4 text-blue-500" />}
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
                <h1 className="text-3xl font-bold text-white">Assignments</h1>
                <button className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg">
                    <Plus className="w-5 h-5" /> New Assignment
                </button>
            </div>

            <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden shadow-lg">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-dark-900 text-gray-200 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Course</th>
                            <th className="px-6 py-4">Due Date</th>
                            <th className="px-6 py-4">Submissions</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-700">
                        {MOCK_ASSIGNMENTS.map(assign => (
                            <tr key={assign.id} className="hover:bg-dark-700/50 transition">
                                <td className="px-6 py-4 font-medium text-white">{assign.title}</td>
                                <td className="px-6 py-4">{assign.courseName}</td>
                                <td className="px-6 py-4">{assign.dueDate}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 bg-dark-900 rounded-full h-2">
                                            <div style={{ width: `${(assign.totalSubmissions / assign.totalStudents) * 100}%` }} className="bg-brand-500 h-2 rounded-full"></div>
                                        </div>
                                        <span className="text-xs">{assign.totalSubmissions}/{assign.totalStudents}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${assign.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                                        {assign.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-brand-500 hover:text-white text-xs font-bold mr-3">VIEW</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const TeacherReportsPage = () => {
    const navigate = useNavigate();
    const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [filterBatch, setFilterBatch] = useState('ALL');
    const [filterTest, setFilterTest] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchSubmissions = async () => {
             setLoading(true);
             try {
                 // Fetch with joins to get Test and Profile info
                 // Note: 'profiles' join assumes the FK exists. If not, simple fetch will miss names.
                 const { data, error } = await supabase
                    .from('submissions')
                    .select(`
                        id, score, total_score, completed_at,
                        tests (id, title),
                        profiles (id, full_name, email)
                    `)
                    .eq('status', 'COMPLETED')
                    .order('completed_at', { ascending: false });
                
                if (data) {
                    // Enrich data with mock batches since DB might miss 'batch' column
                    // In a real scenario, profiles would have 'batch' column.
                    const enriched = data.map((sub: any) => ({
                        ...sub,
                        batch: ['2024-A', '2024-B', '2023-C'][Math.floor(Math.random() * 3)], // Mock batch assignment
                        studentName: sub.profiles?.full_name || sub.profiles?.email || 'Unknown Student',
                        testTitle: sub.tests?.title || 'Unknown Test'
                    }));
                    setAllSubmissions(enriched);
                }
             } catch (e) {
                 console.error("Error fetching submissions:", e);
             } finally {
                 setLoading(false);
             }
        };
        fetchSubmissions();
    }, []);

    // Extract unique options for dropdowns
    const uniqueBatches = useMemo(() => Array.from(new Set(allSubmissions.map(s => s.batch))), [allSubmissions]);
    const uniqueTests = useMemo(() => Array.from(new Set(allSubmissions.map(s => s.testTitle))), [allSubmissions]);

    // Apply Filters
    const filteredData = allSubmissions.filter(sub => {
        const matchesBatch = filterBatch === 'ALL' || sub.batch === filterBatch;
        const matchesTest = filterTest === 'ALL' || sub.testTitle === filterTest;
        const matchesSearch = sub.studentName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesBatch && matchesTest && matchesSearch;
    });

    const data = [
      { name: 'N5 Mock', avg: 72 },
      { name: 'N4 Mock', avg: 68 },
      { name: 'Kanji', avg: 75 },
      { name: 'Vocab', avg: 82 },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Student Reports & Results</h1>
                <button className="flex items-center gap-2 bg-dark-800 hover:bg-dark-700 text-white px-4 py-2 rounded-lg border border-dark-600 transition text-sm">
                    <Download className="w-4 h-4" /> Export CSV
                </button>
             </div>

             {/* Chart Section */}
             <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 shadow-lg">
                 <h3 className="text-lg font-bold text-white mb-6">Class Performance Overview</h3>
                 <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                            <Bar dataKey="avg" fill="#be123c" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
             </div>

             {/* Filters & Table */}
             <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 flex flex-col space-y-6 shadow-lg">
                 <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                     <h3 className="text-lg font-bold text-white flex-shrink-0">Detailed Submissions</h3>
                     
                     <div className="flex flex-wrap gap-3 w-full md:w-auto">
                         {/* Search */}
                         <div className="relative">
                             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                             <input 
                                type="text" 
                                placeholder="Search Student..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-dark-900 border border-dark-700 text-white pl-9 pr-4 py-2 rounded-lg text-sm focus:ring-1 focus:ring-brand-500 outline-none w-48 transition"
                             />
                         </div>

                         {/* Batch Filter */}
                         <div className="relative">
                             <select 
                                value={filterBatch}
                                onChange={(e) => setFilterBatch(e.target.value)}
                                className="appearance-none bg-dark-900 border border-dark-700 text-white pl-4 pr-8 py-2 rounded-lg text-sm focus:ring-1 focus:ring-brand-500 outline-none cursor-pointer"
                             >
                                 <option value="ALL">All Batches</option>
                                 {uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}
                             </select>
                             <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
                         </div>

                         {/* Test Filter */}
                         <div className="relative">
                             <select 
                                value={filterTest}
                                onChange={(e) => setFilterTest(e.target.value)}
                                className="appearance-none bg-dark-900 border border-dark-700 text-white pl-4 pr-8 py-2 rounded-lg text-sm focus:ring-1 focus:ring-brand-500 outline-none cursor-pointer max-w-[150px]"
                             >
                                 <option value="ALL">All Tests</option>
                                 {uniqueTests.map(t => <option key={t} value={t}>{t}</option>)}
                             </select>
                             <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
                         </div>
                     </div>
                 </div>

                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                         <thead className="text-xs uppercase bg-dark-900 text-gray-300 font-bold border-b border-dark-700">
                             <tr>
                                 <th className="p-4 rounded-tl-lg">Student Name</th>
                                 <th className="p-4">Batch</th>
                                 <th className="p-4">Test Title</th>
                                 <th className="p-4">Date Submitted</th>
                                 <th className="p-4">Score</th>
                                 <th className="p-4 rounded-tr-lg text-right">Action</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-dark-700">
                             {loading ? (
                                 <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading submissions...</td></tr>
                             ) : filteredData.length === 0 ? (
                                 <tr><td colSpan={6} className="p-8 text-center text-gray-500">No submissions found matching filters.</td></tr>
                             ) : (
                                 filteredData.map((sub) => (
                                     <tr key={sub.id} className="hover:bg-dark-700/50 transition">
                                         <td className="p-4 font-bold text-white flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-full bg-brand-900/50 flex items-center justify-center text-brand-500 text-xs font-bold border border-brand-500/20">
                                                 {sub.studentName.charAt(0)}
                                             </div>
                                             {sub.studentName}
                                         </td>
                                         <td className="p-4">
                                             <span className="bg-dark-900 border border-dark-600 text-gray-300 px-2 py-1 rounded text-xs">
                                                 {sub.batch}
                                             </span>
                                         </td>
                                         <td className="p-4 text-white">{sub.testTitle}</td>
                                         <td className="p-4">{new Date(sub.completed_at).toLocaleDateString()}</td>
                                         <td className="p-4">
                                            <span className={`font-bold px-2 py-1 rounded ${sub.score > (sub.total_score * 0.4) ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {sub.score} / {sub.total_score}
                                            </span>
                                         </td>
                                         <td className="p-4 text-right">
                                             <button 
                                                onClick={() => navigate(`/teacher/report/${sub.id}`)}
                                                className="bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded text-xs font-bold transition shadow flex items-center gap-1 ml-auto"
                                             >
                                                 View Report <ChevronRight className="w-3 h-3" />
                                             </button>
                                         </td>
                                     </tr>
                                 ))
                             )}
                         </tbody>
                    </table>
                 </div>
                 
                 <div className="flex justify-between items-center text-xs text-gray-500 pt-2">
                     <span>Showing {filteredData.length} entries</span>
                     {/* Pagination placeholder */}
                     <div className="flex gap-2">
                         <button className="px-3 py-1 rounded bg-dark-900 border border-dark-700 disabled:opacity-50" disabled>Previous</button>
                         <button className="px-3 py-1 rounded bg-dark-900 border border-dark-700 disabled:opacity-50" disabled>Next</button>
                     </div>
                 </div>
             </div>
        </div>
    );
};

export const LiveClassConsole = () => {
    const { isLive, topic, viewerCount, startSession, endSession, sendMessage, chatMessages, localStream, toggleMic, toggleCamera, enablePreview } = useLiveSession();
    
    const [transcript, setTranscript] = useState("");
    const [summary, setSummary] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    
    const localVideoRef = useRef<HTMLVideoElement>(null);

    // Auto-enable preview when entering console
    useEffect(() => {
        enablePreview();
    }, []);

    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Mock transcript growth
    useEffect(() => {
        if (!isLive) return;
        const interval = setInterval(() => {
            const phrases = [
                "Konnichiwa minna-san. ",
                "Today we are learning about the 'Te-form'. ",
                "Please conjugate 'Taberu' to 'Tabete'. ",
                "Pay attention to the intonation. ",
                "Homework is on page 42. "
            ];
            const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
            setTranscript(prev => prev + randomPhrase);
        }, 3000);
        return () => clearInterval(interval);
    }, [isLive]);

    const handleEndClass = async () => {
        setIsGenerating(true);
        endSession(); 
        try {
            const result = await generateClassSummary(transcript || "We discussed Japanese grammar.");
            setSummary(result);
        } catch (e) {
            setSummary("Failed to generate summary.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if(newMessage.trim()) {
            sendMessage("Tanaka Sensei", newMessage);
            setNewMessage("");
        }
    };

    const handleToggleMic = () => {
        const newState = !micOn;
        setMicOn(newState);
        toggleMic(newState);
    };

    const handleToggleCam = () => {
        const newState = !camOn;
        setCamOn(newState);
        toggleCamera(newState);
    };

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col space-y-4 animate-fade-in">
            <div className="flex items-center justify-between bg-dark-800 p-4 rounded-xl border border-dark-700 shadow-lg">
                <div className="flex items-center gap-4">
                     <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-brand-500 animate-pulse' : 'bg-gray-500'}`}></div>
                     <div>
                         <h2 className="text-xl font-bold text-white">{topic}</h2>
                         <p className="text-xs text-gray-400">Batch B-2024 • {isLive ? "BROADCASTING" : "OFFLINE"}</p>
                     </div>
                </div>
                
                <div className="flex items-center gap-4">
                     <div className="flex bg-dark-900 rounded-lg p-1">
                         <button onClick={handleToggleMic} className={`p-2 rounded ${micOn ? 'bg-dark-700 text-white' : 'text-red-500'}`}>
                             {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                         </button>
                         <button onClick={handleToggleCam} className={`p-2 rounded ${camOn ? 'bg-dark-700 text-white' : 'text-red-500'}`}>
                             {camOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                         </button>
                         <button className="p-2 rounded hover:bg-dark-700 text-gray-400">
                             <Monitor className="w-5 h-5" />
                         </button>
                     </div>

                    {!isLive ? (
                        <button onClick={() => startSession("JLPT N4 Grammar: The Te-Form")} className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-brand-900/50 flex items-center gap-2">
                             <Video className="w-4 h-4" /> Go Live
                        </button>
                    ) : (
                        <button onClick={handleEndClass} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-red-900/50">
                            End Class
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Video Feed Area */}
                <div className="lg:col-span-2 bg-black rounded-xl border border-dark-700 relative overflow-hidden flex items-center justify-center group shadow-xl">
                    {localStream ? (
                        <div className="relative w-full h-full">
                            {/* Real Local Video Feed */}
                            <video 
                                ref={localVideoRef} 
                                autoPlay 
                                muted 
                                playsInline 
                                className="w-full h-full object-cover" 
                            />
                            
                            <div className="absolute top-4 right-4 bg-brand-600 text-white px-3 py-1 rounded text-sm font-bold flex items-center gap-2 shadow-lg">
                                <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></span> {isLive ? 'LIVE' : 'PREVIEW'}
                            </div>
                            {isLive && (
                                <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-sm backdrop-blur">
                                    {viewerCount} Students
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center">
                            <Video className="w-16 h-16 text-dark-700 mx-auto mb-4" />
                            <p className="text-dark-500">Starting Camera...</p>
                        </div>
                    )}
                </div>

                {/* Chat & Tools */}
                <div className="bg-dark-800 rounded-xl border border-dark-700 flex flex-col overflow-hidden shadow-lg">
                    <div className="p-4 border-b border-dark-700 font-bold bg-dark-900/50">Class Chat</div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chatMessages.length === 0 && <p className="text-center text-gray-500 text-sm mt-4">No messages yet.</p>}
                        {chatMessages.map((m, i) => (
                            <div key={i} className="text-sm">
                                <div className="flex items-baseline justify-between mb-1">
                                    <span className={`font-bold ${m.user === "SYSTEM" ? 'text-accent-gold' : m.user === "Tanaka Sensei" ? 'text-brand-500' : 'text-white'}`}>{m.user}</span>
                                    <span className="text-[10px] text-gray-600">{m.timestamp}</span>
                                </div>
                                <p className={`p-2 rounded-lg rounded-tl-none ${m.user === "SYSTEM" ? 'bg-accent-gold/10 text-accent-gold italic' : 'bg-dark-900 text-gray-300'}`}>{m.text}</p>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-dark-700 bg-dark-900/30">
                        <input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..." 
                            className="w-full bg-dark-900 border border-dark-700 rounded px-3 py-2 text-white focus:ring-1 focus:ring-brand-500 outline-none transition" 
                        />
                    </form>
                </div>
            </div>

            {/* AI Summary Output */}
            {(isGenerating || summary) && (
                <div className="mt-6 bg-dark-800 p-6 rounded-xl border border-brand-500/30 shadow-lg shadow-brand-900/10">
                    <h3 className="text-xl font-bold text-brand-500 mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" /> AI Class Summary (Nihongo)
                    </h3>
                    {isGenerating ? (
                        <div className="flex items-center gap-2 text-gray-400 py-8">
                            <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                            Processing transcript...
                        </div>
                    ) : (
                        <div className="prose prose-invert max-w-none">
                            <div className="bg-dark-900 p-6 rounded-lg border border-dark-700">
                                <pre className="whitespace-pre-wrap font-sans text-gray-300 text-sm leading-relaxed">{summary}</pre>
                            </div>
                            <div className="mt-4 flex gap-4">
                                <button className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded text-sm font-bold">Send to Students</button>
                                <button className="border border-dark-600 hover:bg-dark-700 text-gray-300 px-4 py-2 rounded text-sm">Download PDF</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
