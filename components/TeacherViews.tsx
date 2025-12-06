
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Users, BookOpen, Clock, Plus, Video, 
  MessageSquare, BarChart2, Calendar, FileText, 
  CheckCircle, AlertTriangle, MoreVertical, X,
  Mic, MicOff, Camera, CameraOff, Monitor, Languages,
  ChevronRight, Filter, Search, Download, Trash2, Upload,
  Layers, ChevronDown, Save, Eye, Paperclip, Film, PlayCircle
} from 'lucide-react';
import { Course, Assignment, StudentPerformance, CourseModule, CourseMaterial } from '../types';
import { generateClassSummary } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLiveSession } from '../context/LiveContext';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

// --- HELPER MOCK DATA FOR SELECTION ---
const MOCK_STUDENTS_POOL = [
    { id: 's1', name: 'Alex Student', email: 'alex@zenro.jp', batch: '2024-A' },
    { id: 's2', name: 'Riya Patel', email: 'riya@zenro.jp', batch: '2024-A' },
    { id: 's3', name: 'Kenji Sato', email: 'kenji@zenro.jp', batch: '2024-B' },
    { id: 's4', name: 'Maria Garcia', email: 'maria@zenro.jp', batch: '2024-A' },
    { id: 's5', name: 'John Doe', email: 'john@zenro.jp', batch: '2023-C' },
];

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
          <div key={i} className="bg-dark-800 p-6 rounded-xl border border-dark-700 flex items-center gap-4">
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
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
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
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
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

// --- COURSE CREATION WIZARD ---
const CourseCreationWizard = ({ onClose, onSave }: { onClose: () => void, onSave: (course: any) => void }) => {
    const [step, setStep] = useState(1);
    const [courseData, setCourseData] = useState<Partial<Course>>({
        title: '',
        description: '',
        level: 'N5',
        thumbnail: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&q=80&w=800',
        modules: [],
        enrolledStudentIds: [],
        status: 'DRAFT',
        instructor: 'Tanaka Sensei' // Auto-filled from Auth in real app
    });

    // Module Helper State
    const [newModuleTitle, setNewModuleTitle] = useState('');

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);
    
    const addModule = () => {
        if (!newModuleTitle.trim()) return;
        const newMod: CourseModule = {
            id: Math.random().toString(36).substr(2, 9),
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

    const addMaterialToModule = (moduleId: string, type: 'PDF' | 'LINK' | 'VIDEO') => {
        const title = prompt(`Enter Title for ${type}:`);
        if(!title) return;
        
        // Mocking Upload/Link
        const url = type === 'VIDEO' ? 'https://example.com/video.mp4' : 'https://example.com/material.pdf'; 

        const newMat: CourseMaterial = {
            id: Math.random().toString(36).substr(2, 9),
            title: title,
            type: type === 'VIDEO' ? 'LINK' : type as any, // Simplifying for demo
            url: url
        };

        const updatedModules = courseData.modules?.map(m => {
            if (m.id === moduleId) {
                if (type === 'VIDEO') {
                    return { ...m, videoUrl: url, duration: '15m' }; // Set video
                } else {
                    return { ...m, materials: [...m.materials, newMat] };
                }
            }
            return m;
        });

        setCourseData({ ...courseData, modules: updatedModules });
    };

    const toggleStudent = (id: string) => {
        const current = courseData.enrolledStudentIds || [];
        if (current.includes(id)) {
            setCourseData({ ...courseData, enrolledStudentIds: current.filter(s => s !== id) });
        } else {
            setCourseData({ ...courseData, enrolledStudentIds: [...current, id] });
        }
    };

    const handleFinalSave = () => {
        const finalCourse = {
            ...courseData,
            id: Math.random().toString(36).substr(2, 9),
            totalDuration: '0h', // Calculate based on modules
            progress: 0,
            studentCount: courseData.enrolledStudentIds?.length || 0,
        };
        onSave(finalCourse);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-dark-800 w-full max-w-4xl rounded-2xl border border-dark-700 shadow-2xl flex flex-col h-[85vh]">
                {/* Header */}
                <div className="p-6 border-b border-dark-700 flex justify-between items-center bg-dark-900 rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                           <BookOpen className="w-6 h-6 text-brand-500" /> Create New Course
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Step {step} of 4</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-dark-800 rounded-full text-gray-500 hover:text-white"><X className="w-6 h-6"/></button>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-dark-900">
                    <div 
                        className="h-full bg-brand-500 transition-all duration-300"
                        style={{ width: `${(step / 4) * 100}%` }}
                    ></div>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-8">
                    {step === 1 && (
                        <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
                            <h3 className="text-xl font-bold text-white mb-6">Course Identity</h3>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Course Title</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:border-brand-500 outline-none"
                                    placeholder="e.g. JLPT N4 Comprehensive Grammar"
                                    value={courseData.title}
                                    onChange={e => setCourseData({...courseData, title: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">JLPT Level</label>
                                    <select 
                                        className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:border-brand-500 outline-none"
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
                                        className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:border-brand-500 outline-none"
                                        value={courseData.thumbnail}
                                        onChange={e => setCourseData({...courseData, thumbnail: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Description</label>
                                <textarea 
                                    className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:border-brand-500 outline-none h-32 resize-none"
                                    placeholder="Describe what students will learn..."
                                    value={courseData.description}
                                    onChange={e => setCourseData({...courseData, description: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-xl font-bold text-white mb-4">Curriculum Builder</h3>
                            
                            {/* Add Module Input */}
                            <div className="flex gap-4 mb-8">
                                <input 
                                    type="text" 
                                    className="flex-1 bg-dark-900 border border-dark-700 rounded-lg p-3 text-white outline-none"
                                    placeholder="Enter Chapter/Module Title..."
                                    value={newModuleTitle}
                                    onChange={e => setNewModuleTitle(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addModule()}
                                />
                                <button 
                                    onClick={addModule}
                                    className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> Add Chapter
                                </button>
                            </div>

                            {/* Modules List */}
                            <div className="space-y-4">
                                {courseData.modules?.length === 0 && (
                                    <div className="text-center p-12 border-2 border-dashed border-dark-700 rounded-xl text-gray-500">
                                        No chapters added yet. Start building your curriculum!
                                    </div>
                                )}
                                {courseData.modules?.map((mod, idx) => (
                                    <div key={mod.id} className="bg-dark-900 rounded-xl border border-dark-700 p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                                <span className="bg-dark-800 text-gray-400 w-8 h-8 rounded-full flex items-center justify-center text-xs border border-dark-700">{idx + 1}</span>
                                                {mod.title}
                                            </h4>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => addMaterialToModule(mod.id, 'VIDEO')}
                                                    className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 border ${mod.videoUrl ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-dark-800 text-gray-400 border-dark-600 hover:text-white'}`}
                                                >
                                                    <Video className="w-3 h-3" /> {mod.videoUrl ? 'Video Added' : 'Add Video'}
                                                </button>
                                                <button 
                                                    onClick={() => addMaterialToModule(mod.id, 'PDF')}
                                                    className="px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 bg-dark-800 text-gray-400 border border-dark-600 hover:text-white"
                                                >
                                                    <Upload className="w-3 h-3" /> Materials
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Materials List inside Module */}
                                        {(mod.materials.length > 0 || mod.videoUrl) && (
                                            <div className="bg-dark-800 rounded-lg p-3 space-y-2">
                                                {mod.videoUrl && (
                                                    <div className="flex items-center gap-3 text-sm text-brand-400 p-2 bg-dark-900 rounded border border-brand-900/30">
                                                        <PlayCircle className="w-4 h-4" /> Video Lesson ({mod.duration})
                                                    </div>
                                                )}
                                                {mod.materials.map(mat => (
                                                    <div key={mat.id} className="flex items-center gap-3 text-sm text-gray-300 p-2 bg-dark-900 rounded border border-dark-700">
                                                        <Paperclip className="w-4 h-4" /> {mat.title} <span className="text-xs bg-dark-800 px-1 rounded text-gray-500">{mat.type}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
                            <h3 className="text-xl font-bold text-white mb-2">Enroll Students</h3>
                            <p className="text-gray-400 text-sm mb-6">Select students to grant immediate access to this course.</p>

                            <div className="bg-dark-900 border border-dark-700 rounded-lg p-2 mb-4 flex gap-2">
                                <Search className="w-5 h-5 text-gray-500 m-2" />
                                <input type="text" placeholder="Search students..." className="bg-transparent text-white outline-none flex-1" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                                {MOCK_STUDENTS_POOL.map(student => {
                                    const isSelected = courseData.enrolledStudentIds?.includes(student.id);
                                    return (
                                        <div 
                                            key={student.id} 
                                            onClick={() => toggleStudent(student.id)}
                                            className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between group ${isSelected ? 'bg-brand-900/20 border-brand-500' : 'bg-dark-900 border-dark-700 hover:border-gray-500'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isSelected ? 'bg-brand-500 text-white' : 'bg-dark-800 text-gray-400'}`}>
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className={`font-bold ${isSelected ? 'text-brand-400' : 'text-white'}`}>{student.name}</p>
                                                    <p className="text-xs text-gray-500">{student.batch}</p>
                                                </div>
                                            </div>
                                            {isSelected && <CheckCircle className="w-5 h-5 text-brand-500" />}
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-right text-sm text-gray-400 mt-2">Selected: {courseData.enrolledStudentIds?.length} Students</p>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-8 animate-fade-in text-center max-w-2xl mx-auto pt-10">
                            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                                <CheckCircle className="w-12 h-12 text-green-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-white">Ready to Launch?</h2>
                            <p className="text-gray-400">
                                You are about to create <span className="text-white font-bold">"{courseData.title}"</span> with {courseData.modules?.length} chapters for {courseData.enrolledStudentIds?.length} students.
                            </p>
                            
                            <div className="bg-dark-900 p-6 rounded-xl border border-dark-700 text-left space-y-4">
                                <div className="flex justify-between border-b border-dark-800 pb-2">
                                    <span className="text-gray-500">Level</span>
                                    <span className="text-white font-bold">{courseData.level}</span>
                                </div>
                                <div className="flex justify-between border-b border-dark-800 pb-2">
                                    <span className="text-gray-500">Chapters</span>
                                    <span className="text-white font-bold">{courseData.modules?.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Status</span>
                                    <select 
                                        className="bg-dark-800 border border-dark-600 rounded text-xs text-white p-1 outline-none"
                                        value={courseData.status}
                                        onChange={e => setCourseData({...courseData, status: e.target.value as any})}
                                    >
                                        <option value="DRAFT">Draft (Hidden)</option>
                                        <option value="PUBLISHED">Published (Visible)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-dark-700 bg-dark-900 rounded-b-2xl flex justify-between">
                    <button 
                        onClick={step === 1 ? onClose : handleBack}
                        className="px-6 py-3 rounded-lg text-gray-400 hover:text-white font-bold"
                    >
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>
                    
                    {step < 4 ? (
                        <button 
                            onClick={handleNext}
                            disabled={!courseData.title}
                            className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                        >
                            Next Step <ChevronRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button 
                            onClick={handleFinalSave}
                            className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-green-900/20"
                        >
                            <Save className="w-5 h-5" /> Create Course
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const TeacherCoursesPage = () => {
    // Initial State is EMPTY array as requested (Fresh Start)
    const [courses, setCourses] = useState<Course[]>([]);
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    const handleSaveCourse = (newCourse: Course) => {
        setCourses(prev => [...prev, newCourse]);
        setIsWizardOpen(false);
    };

    const handleDelete = (id: string) => {
        if(confirm("Are you sure you want to delete this course?")) {
            setCourses(prev => prev.filter(c => c.id !== id));
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
             <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Course Management</h1>
                    <p className="text-gray-400 text-sm mt-1">Design curriculum and assign batches</p>
                </div>
                <button 
                    onClick={() => setIsWizardOpen(true)}
                    className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg"
                >
                    <Plus className="w-5 h-5" /> Create Course
                </button>
            </div>

            {/* Empty State */}
            {courses.length === 0 ? (
                <div className="bg-dark-800 border-2 border-dashed border-dark-700 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="bg-dark-900 p-6 rounded-full mb-6">
                        <BookOpen className="w-12 h-12 text-dark-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Courses Created Yet</h3>
                    <p className="text-gray-500 max-w-md mb-8">Start by clicking the "Create Course" button to build your first curriculum, add videos, and assign students.</p>
                    <button 
                        onClick={() => setIsWizardOpen(true)}
                        className="bg-dark-700 hover:bg-dark-600 text-white px-6 py-3 rounded-lg font-bold border border-dark-500"
                    >
                        Launch Course Wizard
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course.id} className="bg-dark-800 rounded-xl overflow-hidden border border-dark-700 hover:border-brand-500/50 transition group shadow-lg flex flex-col">
                            <div className="relative aspect-video bg-black">
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-80" />
                                <div className="absolute top-2 right-2 flex gap-2">
                                     <span className="bg-black/60 backdrop-blur text-white px-2 py-1 rounded text-xs font-bold border border-white/10">
                                         {course.level}
                                     </span>
                                     <span className={`px-2 py-1 rounded text-xs font-bold border ${course.status === 'PUBLISHED' ? 'bg-green-500/80 text-white border-green-500' : 'bg-gray-600/80 text-gray-200 border-gray-500'}`}>
                                         {course.status}
                                     </span>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{course.title}</h3>
                                <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">{course.description || "No description provided."}</p>
                                
                                <div className="flex justify-between text-xs text-gray-500 mb-4 bg-dark-900 p-3 rounded-lg">
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3"/> {course.studentCount} Students</span>
                                    <span className="flex items-center gap-1"><Layers className="w-3 h-3"/> {course.modules?.length} Chapters</span>
                                </div>
                                
                                <div className="flex gap-2 mt-auto">
                                    <button className="flex-1 bg-brand-600 hover:bg-brand-500 text-white py-2 rounded text-sm font-bold shadow-lg">Manage</button>
                                    <button onClick={() => handleDelete(course.id)} className="p-2 bg-dark-700 hover:bg-red-900/30 text-red-500 rounded border border-dark-600">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isWizardOpen && (
                <CourseCreationWizard onClose={() => setIsWizardOpen(false)} onSave={handleSaveCourse} />
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

            <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
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
             <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
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
             <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 flex flex-col space-y-6">
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
                                className="bg-dark-900 border border-dark-700 text-white pl-9 pr-4 py-2 rounded-lg text-sm focus:ring-1 focus:ring-brand-500 outline-none w-48"
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
            <div className="flex items-center justify-between bg-dark-800 p-4 rounded-xl border border-dark-700">
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
                <div className="lg:col-span-2 bg-black rounded-xl border border-dark-700 relative overflow-hidden flex items-center justify-center group">
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
                            
                            <div className="absolute top-4 right-4 bg-brand-600 text-white px-3 py-1 rounded text-sm font-bold flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></span> {isLive ? 'LIVE' : 'PREVIEW'}
                            </div>
                            {isLive && (
                                <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-sm">
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
                <div className="bg-dark-800 rounded-xl border border-dark-700 flex flex-col overflow-hidden">
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
                            className="w-full bg-dark-900 border border-dark-700 rounded px-3 py-2 text-white focus:ring-1 focus:ring-brand-500 outline-none" 
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
