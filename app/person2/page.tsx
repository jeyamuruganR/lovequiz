"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { questions, sexyQuestions } from "../data/questions";
import {
  FaUser,
  FaArrowLeft,
  FaExclamationTriangle,
  FaHome,
  FaSpinner,
} from "react-icons/fa";
import { supabase } from "../../lib/supabaseClient";

/* ---------------- CONTENT ---------------- */

function Person2PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const data = searchParams.get("data");
  const initialQuizType = searchParams.get("type") === "sexy" ? "sexy" : "love";
  const [quizTypeState, setQuizTypeState] = useState<string>(initialQuizType);
  const questionSet = quizTypeState === "sexy" ? sexyQuestions : questions;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [person1Answers, setPerson1Answers] = useState<number[]>([]);
  const [person1Name, setPerson1Name] = useState("");
  const [person2Name, setPerson2Name] = useState("");
  const [quizId, setQuizId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ----------- Decode shared quiz data ----------- */
  useEffect(() => {
    if (!data) {
      setError("No quiz data found. Please ask your partner to share the link again.");
      setIsLoading(false);
      return;
    }

    try {
      const decoded = JSON.parse(atob(data));

      setPerson1Answers(decoded.person1Answers || []);
      setPerson1Name(decoded.person1Name || "");
      setPerson2Name(decoded.person2Name || "");
      setQuizId(decoded.quizId || "");
      // Preserve quiz type from the original shared payload when available
      if (decoded.quizType) {
        setQuizTypeState(decoded.quizType);
      }

      if (!decoded.quizId) {
        throw new Error("Missing quiz ID");
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Decode error:", err);
      setError("Invalid quiz link. Please ask your partner to resend it.");
      setIsLoading(false);
    }
  }, [data]);

  /* ----------- Handle Answer ----------- */
  const handleAnswer = async (optionIndex: number) => {
    if (isSubmitting) return;

    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestion < questionSet.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      return;
    }

    // Last question → submit
    setIsSubmitting(true);

    try {
      const { error: updateError } = await supabase
        .from("quiz_results")
        .update({
          person2_answers: newAnswers,
        })
        .eq("quiz_id", quizId); // ✅ FIXED (was id)

      if (updateError) {
        throw new Error(updateError.message);
      }

      const encodedResult = btoa(
        JSON.stringify({
          quizId,
          person1Name,
          person2Name,
          person1Answers,
          person2Answers: newAnswers,
          quizType: quizTypeState,
        })
      );

      router.push(`/result?data=${encodedResult}&type=${quizTypeState}`);
    } catch (err: any) {
      console.error(err);
      setError("Failed to save answers. Please try again.");
      setIsSubmitting(false);
      setCurrentQuestion((prev) => Math.max(prev - 1, 0));
      setAnswers((prev) => prev.slice(0, -1));
    }
  };

  /* ----------- Loading ----------- */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="text-5xl text-pink-500 animate-spin" />
      </div>
    );
  }

  /* ----------- Error ----------- */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-red-500 mb-4">Oops!</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-full hover:scale-105 transition"
          >
            <FaHome /> Go Home
          </button>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questionSet.length) * 100;

  /* ----------- Quiz UI ----------- */
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="flex items-center gap-2 font-semibold text-purple-600">
              <FaUser /> {person2Name || "Person 2"}
            </span>
            <span>
              {currentQuestion + 1}/{questionSet.length}
            </span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-3xl shadow-xl p-10">
          <h2 className="text-4xl font-bold mb-10 text-center">
            {questionSet[currentQuestion].question}
          </h2>

          <div className="space-y-4">
            {questionSet[currentQuestion].options.map((option, i) => (
              <button
                key={i}
                disabled={isSubmitting}
                onClick={() => handleAnswer(i)}
                className="w-full p-6 text-left rounded-2xl border-2 border-purple-200 hover:bg-purple-50 transition disabled:opacity-50"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Back */}
        {currentQuestion > 0 && !isSubmitting && (
          <button
            onClick={() => {
              setCurrentQuestion((p) => p - 1);
              setAnswers((a) => a.slice(0, -1));
            }}
            className="flex items-center gap-2 mt-6 px-6 py-3 bg-white shadow rounded-full"
          >
            <FaArrowLeft /> Back
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- SUSPENSE WRAPPER ---------------- */

export default function Person2Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <FaSpinner className="text-5xl text-pink-500 animate-spin" />
        </div>
      }
    >
      <Person2PageContent />
    </Suspense>
  );
}
