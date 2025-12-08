
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ChevronLeft, Download, Clock, Calendar, User as UserIcon } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const TestReport = ({ role }: { role: 'STUDENT' | 'TEACHER' }) => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<any>(null);
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    fetchReportData();
  }, [submissionId]);

  const fetchReportData = async () => {
    try {
      // 1. Fetch Submission
      const { data: subData, error: subError } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (subError || !subData) throw new Error("Submission not found");
      setSubmission(subData);

      // 2. Fetch Test Details
      const { data: testData } = await supabase
        .from('tests')
        .select('*')
        .eq('id', subData.test_id)
        .single();
      setTest(testData);

      // 3. Fetch Questions to compare answers
      const { data: qData } = await supabase
        .from('questions')
        .select('*')
        .eq('test_id', subData.test_id);
      setQuestions(qData || []);

      // 4. Fetch Student Profile (useful for Teacher view)
      const { data: studentData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', subData.student_id)
        .single();
      setStudent(studentData);

    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zenro-red"></div>
      </div>
    );
  }

  if (!submission || !test) {
    return <div className="p-12 text-center text-gray-500">Report not found or access denied.</div>;
  }

  // Analytics
  const scorePercentage = Math.round((submission.score / submission.total_score) * 100);
  const isPassed = scorePercentage >= (test.passing_score || 40);
  const correctCount = questions.reduce((acc, q) => {
    const correctIdx = q.correct_option_index !== undefined ? q.correct_option_index : q.correct;
    return acc + (submission.answers[q.id] === correctIdx ? 1 : 0);
  }, 0);
  
  const chartData = [
    { name: 'Correct', value: correctCount },
    { name: 'Incorrect', value: questions.length - correctCount },
  ];
  const COLORS = ['#22c55e', '#ef4444'];

  return (
    <div className="space-y-8 animate-fade-in pb-10 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(role === 'STUDENT' ? '/student/tests' : '/teacher/reports')} 
          className="flex items-center gap-2 text-gray-500 hover:text-zenro-slate transition font-bold"
        >
          <ChevronLeft className="w-5 h-5" /> Back to {role === 'STUDENT' ? 'Tests' : 'Reports'}
        </button>
        <button className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 transition font-bold shadow-sm">
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Score Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`bg-white rounded-xl border p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm ${isPassed ? 'border-green-200' : 'border-red-200'}`}>
             <div>
                <h1 className="text-2xl font-heading font-bold text-slate-800 mb-2">{test.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                   <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(submission.completed_at).toLocaleDateString()}</span>
                   <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(submission.completed_at).toLocaleTimeString()}</span>
                   {role === 'TEACHER' && student && (
                     <span className="flex items-center gap-1 text-zenro-blue font-bold"><UserIcon className="w-4 h-4" /> {student.full_name}</span>
                   )}
                </div>
             </div>
             <div className="text-right">
                <div className={`text-5xl font-bold mb-1 ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {scorePercentage}%
                </div>
                <div className={`text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block ${isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {isPassed ? 'Passed' : 'Failed'}
                </div>
             </div>
          </div>

          {/* Detailed Question Review */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
             <div className="p-6 border-b border-gray-200 font-bold text-slate-800 bg-gray-50">Detailed Analysis</div>
             <div className="divide-y divide-gray-100">
                {questions.map((q, idx) => {
                   const studentAnsIdx = submission.answers[q.id];
                   const correctIdx = q.correct_option_index !== undefined ? q.correct_option_index : q.correct;
                   const isCorrect = studentAnsIdx === correctIdx;

                   return (
                     <div key={q.id} className="p-6 hover:bg-gray-50 transition">
                        <div className="flex gap-4">
                           <div className="mt-1">
                              {isCorrect ? <CheckCircle className="w-6 h-6 text-green-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
                           </div>
                           <div className="flex-1">
                              <p className="text-slate-800 font-medium mb-3 text-lg">
                                <span className="text-gray-400 mr-2 font-bold text-sm">Q{idx + 1}.</span> 
                                {q.text || q.question_text}
                              </p>
                              
                              <div className="space-y-2">
                                 {q.options.map((opt: string, optIdx: number) => {
                                    let styleClass = "border-gray-200 bg-white text-gray-500"; // Default
                                    
                                    if (optIdx === correctIdx) {
                                       styleClass = "border-green-200 bg-green-50 text-green-700 font-bold";
                                    } else if (optIdx === studentAnsIdx && !isCorrect) {
                                       styleClass = "border-red-200 bg-red-50 text-red-700 font-bold";
                                    }

                                    return (
                                      <div key={optIdx} className={`p-3 rounded-lg border text-sm flex justify-between items-center ${styleClass}`}>
                                         <span>{opt}</span>
                                         {optIdx === studentAnsIdx && <span className="text-[10px] uppercase font-bold tracking-wider">Your Answer</span>}
                                         {optIdx === correctIdx && optIdx !== studentAnsIdx && <span className="text-[10px] uppercase font-bold tracking-wider">Correct Answer</span>}
                                      </div>
                                    );
                                 })}
                              </div>
                           </div>
                           <div className="text-xs font-bold text-gray-400 pt-1">
                              {q.marks || 1} Marks
                           </div>
                        </div>
                     </div>
                   );
                })}
             </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
           <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-slate-800 font-bold mb-4 border-b border-gray-100 pb-2">Performance Breakdown</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
                     <div className="w-3 h-3 rounded-full bg-green-500"></div> Correct
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
                     <div className="w-3 h-3 rounded-full bg-red-500"></div> Incorrect
                  </div>
              </div>
           </div>

           <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-slate-800 font-bold mb-4 border-b border-gray-100 pb-2">Instructor Feedback</h3>
              {submission.feedback ? (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-blue-800 text-sm italic">"{submission.feedback}"</p>
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                   <p className="text-gray-400 text-sm">No feedback provided yet.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
