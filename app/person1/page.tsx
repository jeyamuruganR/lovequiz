'use client';

import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation";
import { questions, sexyQuestions } from "../data/questions";
import { FaHeart, FaUser, FaUserFriends, FaRocket, FaArrowLeft, FaSpinner } from "react-icons/fa";
import { supabase } from '../../lib/supabaseClient';

export default function Person1Page() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [partner2Name, setPartner2Name] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showNameForm, setShowNameForm] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const quizType = searchParams?.get('type') || 'love';
  const questionSet = quizType === 'sexy' ? sexyQuestions : questions;

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && partner2Name.trim()) {
      setShowNameForm(false);
      setError(null);
    } else {
      setError("Please enter both names");
    }
  };

  const handleAnswer = async (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestion < questionSet.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsSubmitting(true);
      setError(null);
      
      try {
        const quizId = uuidv4();
        const quizIdForRow = uuidv4(); // Separate ID for the row
        
        console.log('Creating quiz with ID:', quizId);
        console.log('Person 1 answers length:', newAnswers.length);

        // Store Person 1's answers in Supabase
        const { data: insertData, error: insertError } = await supabase
          .from('quiz_results')
          .insert([{
            id: quizIdForRow, // Unique ID for this row
            quiz_id: quizId,   // Shared quiz ID for linking
            person1_name: name.trim(),
            person2_name: partner2Name.trim(),
            person1_answers: newAnswers,
            person2_answers: [], // empty for now
          }])
          .select();

        if (insertError) {
          console.error('Supabase insert error details:', {
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code
          });
          throw new Error(`Failed to save quiz: ${insertError.message || 'Unknown error'}`);
        }

        console.log('Insert successful:', insertData);
        
        // Encode answers with names and quizId in URL
        const quizData = {
          quizId,
          person1Name: name.trim(),
          person2Name: partner2Name.trim(),
          person1Answers: newAnswers
        };
        
        const encodedAnswers = btoa(JSON.stringify(quizData));
        console.log('Encoded data:', encodedAnswers.substring(0, 50) + '...');
        
        router.push(`/share?data=${encodedAnswers}&type=${quizType}`);
        
      } catch (error: any) {
        console.error('Error in handleAnswer:', error);
        setError(error.message || 'Failed to save quiz. Please try again.');
        setIsSubmitting(false);
        
        // Allow user to try again
        if (currentQuestion > 0) {
          setCurrentQuestion(currentQuestion - 1);
          setAnswers(answers.slice(0, -1));
        }
      }
    }
  };

  // Show name input form
  if (showNameForm) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-pink-200 opacity-20 animate-float">
            <FaHeart className="text-8xl" />
          </div>
          <div className="absolute bottom-20 right-10 text-red-200 opacity-20 animate-float-delayed">
            <FaHeart className="text-6xl" />
          </div>
        </div>

        <div className="max-w-lg w-full bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-10 relative z-10 animate-fade-in-up border border-pink-100">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <FaHeart className="text-6xl text-pink-500 animate-pulse-slow" />
              <div className="absolute inset-0 blur-xl bg-pink-500 opacity-30 animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-pink-500 via-red-500 to-pink-600 bg-clip-text text-transparent animate-gradient">
            Let&apos;s Get Started!
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Enter your names to begin the quiz
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-center font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleStartQuiz} className="space-y-6">
            <div className="transform transition-all duration-300 hover:scale-102">
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                <FaUser className="text-pink-500" />
                Your Name (Person 1)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                minLength={2}
                maxLength={30}
                className="w-full px-5 py-4 border-2 border-pink-300 rounded-2xl focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-200 transition-all duration-300 text-lg shadow-sm hover:shadow-md"
              />
            </div>

            <div className="transform transition-all duration-300 hover:scale-102">
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                <FaUserFriends className="text-red-500" />
                Partner&apos;s Name (Person 2)
              </label>
              <input
                type="text"
                value={partner2Name}
                onChange={(e) => setPartner2Name(e.target.value)}
                placeholder="Enter partner's name"
                required
                minLength={2}
                maxLength={30}
                className="w-full px-5 py-4 border-2 border-red-300 rounded-2xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-200 transition-all duration-300 text-lg shadow-sm hover:shadow-md"
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim() || !partner2Name.trim() || isSubmitting}
              className="group flex items-center justify-center gap-3 w-full bg-gradient-to-r from-pink-500 via-red-500 to-pink-600 hover:from-pink-600 hover:via-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 md:py-5 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              <span className="relative z-10">
                {isSubmitting ? 'Starting...' : 'Start Quiz'}
              </span>
              <FaRocket className="text-xl relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questionSet.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
      <div className="max-w-2xl w-full animate-fade-in-up">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-700 mb-3">
            <span className="flex items-center gap-2 font-semibold text-pink-600">
              <FaUser className="text-pink-500" /> {name}
            </span>
            <span className="font-semibold">Question {currentQuestion + 1}/{questionSet.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
            <div 
              className="bg-gradient-to-r from-pink-500 via-red-500 to-pink-600 h-full transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-center font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-500 hover:text-red-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Question Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-10 border border-pink-100 animate-fade-in-down">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 md:mb-10 text-center leading-tight">
            {questionSet[currentQuestion].question}
          </h2>

          {/* Options */}
          <div className="space-y-4">
            {questionSet[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={isSubmitting}
                className="group w-full text-left p-5 md:p-6 bg-gradient-to-r from-pink-50 to-red-50 hover:from-pink-100 hover:to-red-100 rounded-2xl border-2 border-pink-200 hover:border-pink-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-pink-400/0 via-pink-400/10 to-pink-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                <span className="text-lg md:text-xl font-medium text-gray-800 relative z-10">
                  {option}
                  {isSubmitting && ' (Saving...)'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6">
          {currentQuestion > 0 && (
            <button
              onClick={() => {
                setCurrentQuestion(currentQuestion - 1);
                setAnswers(answers.slice(0, -1));
                setError(null);
              }}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-white/80 hover:bg-white text-gray-700 font-semibold rounded-full transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaArrowLeft /> Back
            </button>
          )}
          
          {isSubmitting && (
            <div className="flex items-center gap-2 text-pink-600">
              <FaSpinner className="animate-spin" />
              <span>Saving your answers...</span>
            </div>
          )}
          
          <div className="text-sm text-gray-500 ml-auto">
            Click an option to continue
          </div>
        </div>
      </div>
    </div>
  );
}