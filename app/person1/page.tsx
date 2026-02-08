"use client";

import { useState, Suspense } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter, useSearchParams } from "next/navigation";
import { questions, sexyQuestions } from "../data/questions";
import {
  FaHeart,
  FaUser,
  FaUserFriends,
  FaRocket,
  FaArrowLeft,
  FaSpinner,
} from "react-icons/fa";
import { supabase } from "../../lib/supabaseClient";

function Person1PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const quizType = searchParams.get("type") === "sexy" ? "sexy" : "love";
  const questionSet = quizType === "sexy" ? sexyQuestions : questions;

  const [name, setName] = useState("");
  const [partner2Name, setPartner2Name] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showNameForm, setShowNameForm] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !partner2Name.trim()) {
      setError("Please enter both names");
      return;
    }

    setError(null);
    setShowNameForm(false);
  };

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
    setError(null);

    try {
      const quizId = uuidv4();

      const { error: insertError } = await supabase
        .from("quiz_results")
        .insert([
          {
            quiz_id: quizId,
            person1_name: name.trim(),
            person2_name: partner2Name.trim(),
            person1_answers: newAnswers,
            person2_answers: [],
            quiz_type: quizType, // ✅ REQUIRED
          },
        ]);

      if (insertError) throw new Error(insertError.message);

      const encodedData = btoa(
        JSON.stringify({
          quizId,
          quizType, // ✅ ADD THIS
          person1Name: name.trim(),
          person2Name: partner2Name.trim(),
          person1Answers: newAnswers,
        })
      );

      router.push(`/share?data=${encodedData}&type=${quizType}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save quiz");
      setIsSubmitting(false);
      setCurrentQuestion((prev) => Math.max(prev - 1, 0));
      setAnswers((prev) => prev.slice(0, -1));
    }
  };

  if (showNameForm) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
        <div className="max-w-lg w-full bg-white/95 rounded-3xl shadow-2xl p-10 border border-pink-100">
          <div className="flex justify-center mb-6">
            <FaHeart className="text-6xl text-pink-500 animate-pulse-slow" />
          </div>

          <h1 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-pink-500 via-red-500 to-pink-600 bg-clip-text text-transparent">
            Let&apos;s Get Started!
          </h1>

          {error && (
            <div className="mb-4 text-red-600 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleStartQuiz} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 mb-2 font-semibold">
                <FaUser /> Your Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 border-2 border-pink-300 rounded-2xl"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2 font-semibold">
                <FaUserFriends /> Partner&apos;s Name
              </label>
              <input
                value={partner2Name}
                onChange={(e) => setPartner2Name(e.target.value)}
                className="w-full px-5 py-4 border-2 border-red-300 rounded-2xl"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold py-4 rounded-full hover:scale-105 transition"
            >
              Start Quiz <FaRocket />
            </button>
          </form>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questionSet.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
      <div className="max-w-2xl w-full">
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>{name}</span>
            <span>
              {currentQuestion + 1}/{questionSet.length}
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-red-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-3xl font-bold mb-8 text-center">
            {questionSet[currentQuestion].question}
          </h2>

          <div className="space-y-4">
            {questionSet[currentQuestion].options.map((opt, i) => (
              <button
                key={i}
                disabled={isSubmitting}
                onClick={() => handleAnswer(i)}
                className="w-full p-5 text-left rounded-2xl border-2 border-pink-200 hover:bg-pink-50 transition disabled:opacity-50"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          {currentQuestion > 0 && (
            <button
              onClick={() => {
                setCurrentQuestion((p) => p - 1);
                setAnswers((a) => a.slice(0, -1));
              }}
              className="flex items-center gap-2"
            >
              <FaArrowLeft /> Back
            </button>
          )}

          {isSubmitting && (
            <div className="flex items-center gap-2 text-pink-600">
              <FaSpinner className="animate-spin" /> Saving…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- SUSPENSE WRAPPER ---------------- */

export default function Person1Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <FaSpinner className="text-5xl text-pink-500 animate-spin" />
        </div>
      }
    >
      <Person1PageContent />
    </Suspense>
  );
}
