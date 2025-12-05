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
      <div className="flex h-full items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!submission || !test) {
    return <div className="p-8 text-center text-white">Report not found.</div>;
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
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(role === 'STUDENT' ? '/student/tests' : '/teacher/reports')} 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ChevronLeft className="w-5 h-5" /> Back to {role === 'STUDENT' ? 'Tests' : 'Reports'}
        </button>
        <button className="flex items-center gap-2 bg-dark-800 hover:bg-dark-700 text-white px-4 py-2 rounded-lg border border-dark-600 transition">
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Score Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`bg-dark-800 rounded-xl border p-8 flex flex-col md:flex-row items-center justify-between gap-6 ${isPassed ? 'border-green-500/30' : 'border-red-500/30'}`}>
             <div>
                <h1 className="text-2xl font-bold text-white mb-2">{test.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                   <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(submission.completed_at).toLocaleDateString()}</span>
                   <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(submission.completed_at).toLocaleTimeString()}</span>
                   {role === 'TEACHER' && student && (
                     <span className="flex items-center gap-1 text-brand-400"><UserIcon className="w-4 h-4" /> {student.full_name}</span>
                   )}
                </div>
             </div>
             <div className="text-right">
                <div className={`text-5xl font-bold mb-1 ${isPassed ? 'text-green-500' : 'text-red-500'}`}>
                  {scorePercentage}%
                </div>
                <div className={`text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block ${isPassed ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                  {isPassed ? 'Passed' : 'Failed'}
                </div>
             </div>
          </div>

          {/* Detailed Question Review */}
          <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
             <div className="p-6 border-b border-dark-700 font-bold text-white">Detailed Analysis</div>
             <div className="divide-y divide-dark-700">
                {questions.map((q, idx) => {
                   const studentAnsIdx = submission.answers[q.id];
                   const correctIdx = q.correct_option_index !== undefined ? q.correct_option_index : q.correct;
                   const isCorrect = studentAnsIdx === correctIdx;

                   return (
                     <div key={q.id} className="p-6 hover:bg-dark-700/20 transition">
                        <div className="flex gap-4">
                           <div className="mt-1">
                              {isCorrect ? <CheckCircle className="w-6 h-6 text-green-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
                           </div>
                           <div className="flex-1">
                              <p className="text-white font-medium mb-3">
                                <span className="text-gray-500 mr-2">Q{idx + 1}.</span> 
                                {q.text || q.question_text}
                              </p>
                              
                              <div className="space-y-2">
                                 {q.options.map((opt: string, optIdx: number) => {
                                    let styleClass = "border-dark-700 bg-dark-900 text-gray-400"; // Default
                                    
                                    if (optIdx === correctIdx) {
                                       styleClass = "border-green-500/50 bg-green-500/10 text-green-500 font-bold";
                                    } else if (optIdx === studentAnsIdx && !isCorrect) {
                                       styleClass = "border-red-500/50 bg-red-500/10 text-red-500";
                                    }

                                    return (
                                      <div key={optIdx} className={`p-3 rounded-lg border text-sm flex justify-between items-center ${styleClass}`}>
                                         <span>{opt}</span>
                                         {optIdx === studentAnsIdx && <span className="text-xs uppercase font-bold">Your Answer</span>}
                                         {optIdx === correctIdx && optIdx !== studentAnsIdx && <span className="text-xs uppercase font-bold">Correct Answer</span>}
                                      </div>
                                    );
                                 })}
                              </div>
                           </div>
                           <div className="text-xs font-bold text-gray-500 pt-1">
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
           <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
              <h3 className="text-white font-bold mb-4">Performance Chart</h3>
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
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                     <div className="w-3 h-3 rounded-full bg-green-500"></div> Correct
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                     <div className="w-3 h-3 rounded-full bg-red-500"></div> Incorrect
                  </div>
              </div>
           </div>

           <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
              <h3 className="text-white font-bold mb-4">Instructor Feedback</h3>
              {submission.feedback ? (
                <p className="text-gray-300 text-sm italic">"{submission.feedback}"</p>
              ) : (
                <div className="text-center py-4">
                   <p className="text-gray-500 text-sm">No feedback provided yet.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};