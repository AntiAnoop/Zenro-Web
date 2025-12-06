import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Save, Flag } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

// --- MOCK FALLBACK DATA ---
const MOCK_QUESTIONS = [
  { id: 'q1', text: 'Which of the following is the correct reading for "日本"?', options: ['Nihon', 'Nippon', 'Jipon', 'Both A and B'], correct: 3 },
  { id: 'q2', text: 'Choose the correct particle: Watashi __ Tanaka desu.', options: ['wa', 'ga', 'wo', 'ni'], correct: 0 },
  { id: 'q3', text: 'What is the meaning of "Taberu"?', options: ['To drink', 'To eat', 'To sleep', 'To run'], correct: 1 },
];

export const StudentTestPlayer = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [testDetails, setTestDetails] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800); // Default 30 mins
  
  useEffect(() => {
    fetchTest();
  }, [testId]);

  useEffect(() => {
    if (!loading && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, timeLeft]);

  const fetchTest = async () => {
    try {
      // 1. Try Fetching Test Metadata
      const { data: testData, error: testError } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId)
        .single();

      // 2. Try Fetching Questions
      const { data: qData, error: qError } = await supabase
        .from('questions')
        .select('*')
        .eq('test_id', testId);

      if (testError || qError || !testData) {
        console.warn("Using Mock Data due to DB error or missing data");
        setTestDetails({ title: 'JLPT N4 Grammar Mock (Demo)', duration_minutes: 30 });
        setQuestions(MOCK_QUESTIONS);
        setTimeLeft(30 * 60);
      } else {
        setTestDetails(testData);
        setQuestions(qData);
        setTimeLeft(testData.duration_minutes * 60);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (qId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    
    // Calculate Score locally
    let calculatedScore = 0;
    let totalScore = 0;
    
    questions.forEach(q => {
      const correctIdx = q.correct_option_index !== undefined ? q.correct_option_index : q.correct;
      if (answers[q.id] === correctIdx) {
        calculatedScore += (q.marks || 1);
      }
      totalScore += (q.marks || 1);
    });

    try {
        const { data, error } = await supabase.from('submissions').insert({
            test_id: testId,
            score: calculatedScore,
            total_score: totalScore,
            answers: answers,
            status: 'COMPLETED',
            completed_at: new Date().toISOString()
        }).select();

        if (error) throw error;
        
        // Redirect to report page using the ID of the new submission
        if (data && data[0]) {
            navigate(`/student/report/${data[0].id}`);
        } else {
            // Fallback for mock mode if DB write fails
            alert("Test submitted (Mock Mode). Score: " + calculatedScore);
            navigate('/student/tests');
        }

    } catch (e) {
        console.error("Failed to save submission", e);
        alert("Error submitting test. Please try again.");
    } finally {
        setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
        <div className="flex h-full items-center justify-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="h-full flex flex-col bg-dark-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-dark-800 h-16 border-b border-dark-700 flex items-center justify-between px-6 shadow-md z-10">
          <div className="flex items-center gap-4">
              <button onClick={() => navigate('/student/tests')} className="text-gray-400 hover:text-white">
                  <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-bold truncate max-w-md">{testDetails.title}</h1>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-xl ${timeLeft < 300 ? 'bg-red-900/20 text-red-500 animate-pulse' : 'bg-dark-900 text-brand-500'}`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
          </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
          {/* Question Area */}
          <div className="flex-1 p-8 overflow-y-auto">
              <div className="max-w-3xl mx-auto">
                  <div className="flex justify-between items-center mb-6">
                      <span className="text-gray-400 font-bold">Question {currentQuestionIndex + 1} of {questions.length}</span>
                      <button className="flex items-center gap-2 text-gray-500 hover:text-yellow-500 transition text-sm">
                          <Flag className="w-4 h-4" /> Mark for Review
                      </button>
                  </div>

                  <div className="bg-dark-800 p-8 rounded-2xl border border-dark-700 shadow-lg mb-8">
                      <p className="text-xl font-medium leading-relaxed mb-8">{currentQ.text || currentQ.question_text}</p>
                      
                      <div className="space-y-3">
                          {(currentQ.options || []).map((opt: string, idx: number) => (
                              <label 
                                key={idx} 
                                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all ${
                                    answers[currentQ.id] === idx 
                                    ? 'bg-brand-900/20 border-brand-500 ring-1 ring-brand-500' 
                                    : 'bg-dark-900 border-dark-700 hover:bg-dark-700 hover:border-gray-500'
                                }`}
                              >
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                      answers[currentQ.id] === idx ? 'border-brand-500' : 'border-gray-500'
                                  }`}>
                                      {answers[currentQ.id] === idx && <div className="w-3 h-3 bg-brand-500 rounded-full"></div>}
                                  </div>
                                  <input 
                                    type="radio" 
                                    name={`q-${currentQ.id}`} 
                                    className="hidden" 
                                    checked={answers[currentQ.id] === idx} 
                                    onChange={() => handleOptionSelect(currentQ.id, idx)} 
                                  />
                                  <span className="text-gray-200">{opt}</span>
                              </label>
                          ))}
                      </div>
                  </div>

                  <div className="flex justify-between items-center">
                      <button 
                        onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-6 py-3 rounded-lg bg-dark-800 hover:bg-dark-700 text-white disabled:opacity-50 font-bold flex items-center gap-2"
                      >
                          <ChevronLeft className="w-5 h-5" /> Previous
                      </button>

                      {currentQuestionIndex === questions.length - 1 ? (
                          <button 
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-8 py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-green-900/20"
                          >
                             {submitting ? 'Submitting...' : 'Submit Exam'} <Save className="w-5 h-5" />
                          </button>
                      ) : (
                          <button 
                            onClick={() => setCurrentQuestionIndex(p => Math.min(questions.length - 1, p + 1))}
                            className="px-6 py-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold flex items-center gap-2"
                          >
                              Next <ChevronRight className="w-5 h-5" />
                          </button>
                      )}
                  </div>
              </div>
          </div>

          {/* Navigation Sidebar */}
          <div className="w-72 bg-dark-800 border-l border-dark-700 p-6 overflow-y-auto hidden lg:block">
              <h3 className="text-gray-400 font-bold uppercase text-xs mb-4">Question Navigator</h3>
              <div className="grid grid-cols-4 gap-3">
                  {questions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`aspect-square rounded-lg font-bold text-sm transition ${
                            currentQuestionIndex === idx 
                            ? 'bg-white text-dark-900'
                            : answers[q.id] !== undefined
                                ? 'bg-brand-900/40 text-brand-500 border border-brand-500/30'
                                : 'bg-dark-900 text-gray-500 border border-dark-700 hover:border-gray-500'
                        }`}
                      >
                          {idx + 1}
                      </button>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};




