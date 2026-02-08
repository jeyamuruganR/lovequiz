'use client';

import { useState, useEffect, useRef } from "react";
import { supabase } from '../../lib/supabaseClient';
import { useRouter, useSearchParams } from "next/navigation";
import { questions } from "../data/questions";
import html2canvas from "html2canvas";
import { FaHeart, FaUserFriends, FaDownload, FaShareAlt, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaHome, FaRedo, FaSpinner, FaSkull, FaWhatsapp } from "react-icons/fa";

export default function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const data = searchParams.get('data');
  const resultImageRef = useRef<HTMLDivElement>(null);
  
  const [person1Name, setPerson1Name] = useState("");
  const [person2Name, setPartner2Name] = useState("");
  const [person1Answers, setPerson1Answers] = useState<number[]>([]);
  const [person2Answers, setPerson2Answers] = useState<number[]>([]);
  const [quizId, setQuizId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [shareLink, setShareLink] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    if (!data) {
      setError("No quiz data found!");
      setIsLoading(false);
      return;
    }

    try {
      const quizData = JSON.parse(atob(data));

      setPerson1Name(quizData.person1Name || "Person 1");
      setPartner2Name(quizData.person2Name || "Person 2");
      setPerson1Answers(quizData.person1Answers || []);
      setPerson2Answers(quizData.person2Answers || []);
      setQuizId(quizData.quizId || "");

      // If only person1 has finished, show share link and waiting message
      if (!quizData.person2Answers || quizData.person2Answers.length === 0) {
        setShareLink(`${window.location.origin}/result?data=${data}`);
        setError("Waiting for partner! Share the link below and ask your partner to finish the quiz.");
        setIsLoading(false);
        return;
      }

      // If both have finished, show result
      let matches = 0;
      for (let i = 0; i < quizData.person1Answers.length; i++) {
        if (quizData.person1Answers[i] === quizData.person2Answers[i]) {
          matches++;
        }
      }
      const percentage = Math.round((matches / quizData.person1Answers.length) * 100);
      setMatchPercentage(percentage);

      setShareLink(`${window.location.origin}/result?data=${data}`);

      // Supabase insert logic
      (async () => {
        const { data: insertData, error: insertError } = await supabase
          .from('quiz_results')
          .insert([
            {
              quiz_id: quizData.quizId || "",
              person1_name: quizData.person1Name || "Person 1",
              person2_name: quizData.person2Name || "Person 2",
              person1_answers: quizData.person1Answers,
              person2_answers: quizData.person2Answers,
            },
          ]);
        if (insertError) {
          // Log full error object and fallback message
          console.error('Supabase insert error:', insertError);
          if (!insertError.message) {
            console.error('Supabase insert failed: No error message. Check table schema and required fields.');
          }
        } else {
          console.log('Supabase insert success:', insertData);
        }
      })();

      setIsLoading(false);
    } catch (e) {
      setError("Invalid quiz data!");
      setIsLoading(false);
    }
  }, [data, refreshCount]);

  // Polling: If waiting for partner, auto-refresh every 3 seconds
  useEffect(() => {
    if (error && error.includes("Both persons must complete")) {
      const interval = setInterval(() => {
        setRefreshCount((c) => c + 1);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [error]);

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!');
  };

  const downloadImage = async () => {
    if (resultImageRef.current) {
      try {
        const canvas = await html2canvas(resultImageRef.current, {
          backgroundColor: '#fff',
          scale: 2,
          useCORS: true,
        });
        const link = document.createElement('a');
        link.download = `${person1Name}_${person2Name}_compatibility.png`;
        link.href = canvas.toDataURL();
        link.click();
      } catch (err) {
        alert('Failed to download image');
      }
    }
  };

  const shareImage = async () => {
    if (resultImageRef.current) {
      try {
        const canvas = await html2canvas(resultImageRef.current, {
          backgroundColor: '#fff',
          scale: 2,
          useCORS: true,
        });
        canvas.toBlob(async (blob: Blob | null) => {
          if (blob) {
            const file = new File([blob], `${person1Name}_${person2Name}_compatibility.png`, { type: 'image/png' });
            
            if (navigator.share && navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: 'Valentine\'s Day Compatibility',
                text: `${person1Name} & ${person2Name} - ${matchPercentage}% Compatible! 💕`
              });
            } else {
              // Fallback to WhatsApp Web
              const message = encodeURIComponent(`💕 ${person1Name} & ${person2Name} Compatibility Result: ${matchPercentage}%! 💕`);
              window.open(`https://wa.me/?text=${message}`, '_blank');
            }
          }
        });
      } catch (err) {
        alert('Failed to share image');
      }
    }
  };

  const getFinalMessage = () => {
    if (matchPercentage >= 70) {
      return {
        text: "Perfect Couple",
        icon: "💖",
        color: "text-green-600",
        bgColor: "from-green-400 to-emerald-500",
        emoji: "🎉"
      };
    } else if (matchPercentage >= 50) {
      return {
        text: "Great Match",
        icon: "👍",
        color: "text-blue-600",
        bgColor: "from-blue-400 to-purple-500",
        emoji: "✨"
      };
    } else {
      return {
        text: "Fight Loading",
        icon: "😅",
        color: "text-red-600",
        bgColor: "from-red-400 to-orange-500",
        emoji: "💥"
      };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-50 to-red-100">
        <div className="text-center">
          <FaSpinner className="text-5xl text-pink-500 animate-spin mx-auto mb-4" />
          <div className="text-2xl font-bold text-pink-700">Loading results...</div>
        </div>
      </div>
    );
  }

  if (error) {
    // Waiting for partner error
    if (error.includes("Waiting for partner!")) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-pink-100 via-rose-50 to-red-100">
          {/* Animated background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 text-yellow-200 opacity-20 animate-float">
              <FaSpinner className="text-8xl" />
            </div>
            <div className="absolute bottom-20 right-10 text-pink-200 opacity-20 animate-float-delayed">
              <FaHeart className="text-6xl" />
            </div>
          </div>

          <div className="max-w-md w-full bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 text-center animate-fade-in-up border border-yellow-100 relative z-10">
            <div className="relative mb-6">
              <FaSpinner className="text-7xl text-yellow-500 mx-auto animate-spin" />
              <div className="absolute inset-0 blur-xl bg-yellow-500 opacity-30 animate-pulse"></div>
            </div>
            <h2 className="text-4xl font-bold text-yellow-600 mb-4">Waiting for Partner...</h2>
            <p className="text-lg text-gray-700 mb-4 font-semibold">Share this link with your partner:</p>
            <div className="mb-4">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="w-full px-4 py-2 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-700 font-mono text-sm mb-2"
              />
              <button
                onClick={copyLink}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                <FaShareAlt /> Copy Link
              </button>
            </div>
            <p className="text-gray-600 mb-8">Ask your partner to finish the quiz. Then come back and check results!</p>
            <div className="flex flex-col gap-4 items-center">
              <button
                onClick={() => setRefreshCount((c) => c + 1)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                <FaRedo /> Refresh
              </button>
              <button
                onClick={() => router.push('/')}
                className="group flex items-center justify-center gap-3 mx-auto px-8 py-4 bg-gradient-to-r from-pink-500 via-red-500 to-pink-600 hover:from-pink-600 hover:via-red-600 hover:to-pink-700 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                <FaHome className="relative z-10" />
                <span className="relative z-10">Go Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    // Other errors
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-pink-100 via-rose-50 to-red-100">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 text-center animate-fade-in-up border border-red-100">
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

  const finalMessage = getFinalMessage();

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-pink-100 via-rose-50 to-red-100">
      <div className="max-w-2xl mx-auto animate-fade-in-up">
        {/* Instagram-style Single Card */}
        <div className="mb-8">
          {/* Card Header - Instagram-style */}
          <div className="bg-white rounded-t-2xl shadow-lg p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-400 to-red-500 flex items-center justify-center text-white font-bold text-xl">
                  {person1Name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Compatibility Test</h3>
                  <p className="text-sm text-gray-500">Valentine's Day Quiz</p>
                </div>
              </div>
              <span className="text-gray-400 text-sm">Just now</span>
            </div>
          </div>

          {/* Main Instagram-style Card */}
          <div 
            ref={resultImageRef}
            className="bg-white shadow-2xl rounded-b-2xl overflow-hidden"
          >
            {/* Score Section - Top of Instagram post */}
            <div className="p-8 bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 border-b border-pink-100">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Love Compatibility</h1>
                <p className="text-gray-600">See how well you match with your partner!</p>
              </div>
              
              {/* Names & Percentage */}
              <div className="flex items-center justify-between mb-6 bg-white p-6 rounded-2xl shadow-inner">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-2">
                    {person1Name.charAt(0)}
                  </div>
                  <p className="font-bold text-gray-800">{person1Name}</p>
                </div>
                
                <div className="text-center">
                  <div className="relative">
                    <div className="text-6xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-pink-600 bg-clip-text text-transparent">
                      {matchPercentage}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Match Score</div>
                    <div className="absolute -top-2 -right-2 animate-bounce">
                      <FaHeart className="text-2xl text-red-500" />
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-2">
                    {person2Name.charAt(0)}
                  </div>
                  <p className="font-bold text-gray-800">{person2Name}</p>
                </div>
              </div>

              {/* Final Verdict */}
              <div className={`text-center p-4 rounded-xl bg-gradient-to-r ${finalMessage.bgColor} text-white shadow-lg`}>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl">{finalMessage.emoji}</span>
                  <div>
                    <div className="text-2xl font-bold">"{finalMessage.text}"</div>
                    <div className="text-sm opacity-90">Your compatibility verdict</div>
                  </div>
                  <span className="text-3xl">{finalMessage.icon}</span>
                </div>
              </div>
            </div>

            {/* Answers Comparison Section */}
            <div className="p-6 max-h-[500px] overflow-y-auto">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <FaHeart className="text-red-500" /> 
                  Question-by-Question Breakdown
                </h3>
                <p className="text-sm text-gray-600 mb-4">See where you match and differ</p>
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => {
                  const isMatch = person1Answers[index] === person2Answers[index];
                  const person1Option = question.options[person1Answers[index]];
                  const person2Option = question.options[person2Answers[index]];

                  return (
                    <div 
                      key={question.id} 
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        isMatch 
                          ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                          : 'bg-rose-50 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 mb-1">
                            Q{index + 1}: {question.question}
                          </h4>
                        </div>
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${isMatch ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                          {isMatch ? (
                            <>
                              <FaCheckCircle className="text-sm" />
                              <span className="text-sm font-bold">Match</span>
                            </>
                          ) : (
                            <>
                              <FaTimesCircle className="text-sm" />
                              <span className="text-sm font-bold">Different</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Person 1 Answer */}
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 flex items-center justify-center text-white text-sm font-bold">
                              {person1Name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{person1Name}</span>
                          </div>
                          <p className="text-gray-800 pl-2 border-l-2 border-pink-400">{person1Option}</p>
                        </div>

                        {/* Person 2 Answer */}
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-center text-white text-sm font-bold">
                              {person2Name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{person2Name}</span>
                          </div>
                          <p className="text-gray-800 pl-2 border-l-2 border-red-400">{person2Option}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer - Instagram-style stats */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1">
                    <FaHeart className="text-red-500" />
                    <span className="font-medium">{questions.length} questions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaCheckCircle className="text-green-500" />
                    <span className="font-medium">
                      {person1Answers.filter((ans, idx) => ans === person2Answers[idx]).length} matches
                    </span>
                  </div>
                </div>
                <div className="text-gray-500">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-8 border border-pink-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Share Your Results! 💕</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={downloadImage}
              className="group flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              <FaDownload className="text-lg relative z-10 group-hover:translate-y-1 transition-transform" />
              <span className="relative z-10">Download Image</span>
            </button>
            <button
              onClick={shareImage}
              className="group flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              <FaWhatsapp className="text-lg relative z-10" />
              <span className="relative z-10">Share on WhatsApp</span>
            </button>
            <button
              onClick={copyLink}
              className="group flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 hover:from-blue-600 hover:via-purple-600 hover:to-blue-700 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              <FaShareAlt className="text-lg relative z-10 group-hover:rotate-12 transition-transform" />
              <span className="relative z-10">Copy Link</span>
            </button>
          </div>
          
          {/* Try Again Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg border border-gray-300"
            >
              <FaRedo /> Try Again with Someone New
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}