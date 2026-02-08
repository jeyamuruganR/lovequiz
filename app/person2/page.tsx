'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { questions, sexyQuestions } from "../data/questions";
import { FaUser, FaArrowLeft, FaExclamationTriangle, FaHome, FaSpinner } from "react-icons/fa";
import { supabase } from '../../lib/supabaseClient';

export default function Person2Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const data = searchParams.get('data');
  const quizType = searchParams.get('type') || 'love';
  const questionSet = quizType === 'sexy' ? sexyQuestions : questions;
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [person1Answers, setPerson1Answers] = useState<number[]>([]);
  const [person1Name, setPerson1Name] = useState("");
  const [person2Name, setPerson2Name] = useState("");
  const [quizId, setQuizId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) {
      setError("No quiz data found! Please ask your partner to share the quiz link.");
      setIsLoading(false);
      return;
    }

    try {
      // Decode Person 1 answers and names from URL
      const decoded = JSON.parse(atob(data));
      if (decoded.person1Answers) {
        setPerson1Answers(decoded.person1Answers);
      }
      if (decoded.person1Name) {
        setPerson1Name(decoded.person1Name);
      }
      if (decoded.person2Name) {
        setPerson2Name(decoded.person2Name);
      }
      if (decoded.quizId) {
        setQuizId(decoded.quizId);
      }
      setIsLoading(false);
    } catch (e) {
      console.error("Decode error:", e);
      setError("Invalid quiz link! Please ask your partner to share the quiz link again.");
      setIsLoading(false);
    }
  }, [data]);

  const handleAnswer = async (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestion < questionSet.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Update Person 2's answers in Supabase
      const { data: updateData, error: updateError } = await supabase
        .from('quiz_results')
        .update({
          person2_answers: newAnswers
        })
        .eq('id', quizId); // <-- changed from 'quiz_id' to 'id'
      if (updateError) {
        console.error('Supabase update error:', updateError);
        if (!updateError.message) {
          console.error('Update failed: Check table schema, required fields, and types.');
        }
      }
      // Encode both answers and redirect to results
      const encodedData = btoa(JSON.stringify({
        quizId: quizId,
        person1Name: person1Name,
        person2Name: person2Name,
        person1Answers: person1Answers,
        person2Answers: newAnswers
      }));
      router.push(`/result?data=${encodedData}&type=${quizType}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-5xl text-white animate-spin mx-auto mb-4" />
          <div className="text-2xl font-bold text-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center">
          <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-red-500 mb-4">Oops!</h2>
          <p className="text-xl text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105"
          >
            <FaHome /> Go Home
          </button>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questionSet.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full animate-fade-in-up">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-700 mb-3">
            <span className="flex items-center gap-2 font-semibold text-purple-600">
              <FaUser className="text-purple-500" /> Person 2
            </span>
            <span className="font-semibold">Question {currentQuestion + 1}/{questionSet.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
            <div 
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 h-full transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-purple-100 animate-fade-in-down">
          <h2 className="text-4xl font-bold text-gray-800 mb-10 text-center leading-tight">
            {questionSet[currentQuestion].question}
          </h2>

          {/* Options */}
          <div className="space-y-4">
            {questionSet[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="group w-full text-left p-6 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-2xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl relative overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/10 to-purple-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                <span className="text-xl font-medium text-gray-800 relative z-10">{option}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Back Button */}
        {currentQuestion > 0 && (
          <button
            onClick={() => {
              setCurrentQuestion(currentQuestion - 1);
              setAnswers(answers.slice(0, -1));
            }}
            className="flex items-center gap-2 mt-6 px-6 py-3 bg-white/80 hover:bg-white text-gray-700 font-semibold rounded-full transition-all duration-300 shadow-md"
          >
            <FaArrowLeft /> Back
          </button>
        )}
      </div>
    </div>
  );
}
