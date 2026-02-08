"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { questions } from "../data/questions";
import html2canvas from "html2canvas";
import {
  FaHeart,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaHome,
  FaRedo,
  FaSpinner,
  FaDownload,
  FaShareAlt,
  FaWhatsapp,
} from "react-icons/fa";

type Status = "loading" | "waiting" | "complete" | "error";

function ResultPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const data = searchParams.get("data");

  const resultImageRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  const [person1Name, setPerson1Name] = useState("");
  const [person2Name, setPerson2Name] = useState("");
  const [person1Answers, setPerson1Answers] = useState<number[]>([]);
  const [person2Answers, setPerson2Answers] = useState<number[]>([]);
  const [quizId, setQuizId] = useState("");

  const [matchPercentage, setMatchPercentage] = useState(0);
  const [shareLink, setShareLink] = useState("");

  // prevents multiple DB writes
  const hasUpsertedRef = useRef(false);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (!data) {
      setError("No quiz data found.");
      setStatus("error");
      return;
    }

    try {
      const decoded = JSON.parse(atob(data));

      setPerson1Name(decoded.person1Name || "Person 1");
      setPerson2Name(decoded.person2Name || "Person 2");
      setPerson1Answers(decoded.person1Answers || []);
      setPerson2Answers(decoded.person2Answers || []);
      setQuizId(decoded.quizId || "");

      const safeData = encodeURIComponent(data);
      const base = window.location.origin;

      // Partner still needs to answer
      if (!decoded.person2Answers || decoded.person2Answers.length === 0) {
        setShareLink(`${base}/person2?data=${safeData}`);
        setStatus("waiting");
        return;
      }

      // Calculate result
      let matches = 0;
      decoded.person1Answers.forEach((a: number, i: number) => {
        if (a === decoded.person2Answers[i]) matches++;
      });

      setMatchPercentage(
        Math.round((matches / decoded.person1Answers.length) * 100)
      );

      setShareLink(`${base}/result?data=${safeData}`);
      setStatus("complete");

      // Insert ONCE
      if (!hasUpsertedRef.current) {
        hasUpsertedRef.current = true;
        (async () => {
          try {
            const quizTypeFromParams = searchParams.get("type") === "sexy" ? "sexy" : "love";

            const { data: upsertData, error: upsertError, status: upsertStatus, statusText: upsertStatusText } = await supabase
              .from("quiz_results")
              .upsert(
                [
                  {
                    quiz_id: decoded.quizId,
                    person1_name: decoded.person1Name,
                    person2_name: decoded.person2Name,
                    person1_answers: decoded.person1Answers,
                    person2_answers: decoded.person2Answers,
                    quiz_type: decoded.quizType || quizTypeFromParams,
                  },
                ],
                { onConflict: "quiz_id" }
              );

            console.log("Supabase upsert data:", upsertData);
            console.log("Supabase upsert status:", upsertStatus, upsertStatusText);
            if (upsertError) {
              console.error("Supabase upsert error message:", upsertError.message);
              console.error("Supabase upsert error details:", upsertError.details);
              console.error("Supabase upsert error code:", upsertError.code);
            } else {
              console.log("Supabase upsert completed without error");
            }
          } catch (err) {
            console.error("Unexpected error:", err);
          }
        })();
      }
    } catch {
      setError("Invalid quiz data.");
      setStatus("error");
    }
  }, [data]);

  /* ---------------- AUTO REFRESH ---------------- */
  useEffect(() => {
    if (status !== "waiting") return;

    const interval = setInterval(() => {
      window.location.reload();
    }, 3000);

    return () => clearInterval(interval);
  }, [status]);

  /* ---------------- ACTIONS ---------------- */
  const copyLink = async () => {
    await navigator.clipboard.writeText(shareLink);
    alert("Link copied!");
  };

  const downloadImage = async () => {
    if (!resultImageRef.current) return;

    const canvas = await html2canvas(resultImageRef.current, { scale: 2 });
    const link = document.createElement("a");
    link.download = "compatibility.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  /* ---------------- STATES ---------------- */
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="text-5xl text-pink-500 animate-spin" />
      </div>
    );
  }

  if (status === "waiting") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <FaSpinner className="text-6xl text-yellow-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Waiting for Partner</h2>
          <p className="mb-4">Share this link:</p>
          <input
            readOnly
            value={shareLink}
            className="w-full p-2 border rounded mb-3 text-sm"
          />
          <button onClick={copyLink} className="btn-primary">
            <FaShareAlt /> Copy Link
          </button>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl text-center">
          <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-3" />
          <p className="mb-4">{error}</p>
          <button onClick={() => router.push("/")}>
            <FaHome /> Go Home
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- RESULT ---------------- */
  return (
    <div className="min-h-screen px-4 py-8">
      <div ref={resultImageRef} className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-4">
          {person1Name} ❤️ {person2Name}
        </h1>

        <div className="text-center text-6xl font-bold text-pink-600 mb-6">
          {matchPercentage}%
        </div>

        {questions.map((q, i) => {
          const match = person1Answers[i] === person2Answers[i];
          return (
            <div key={q.id} className={`p-4 rounded mb-3 ${match ? "bg-green-50" : "bg-red-50"}`}>
              <div className="font-bold mb-1">{q.question}</div>
              <div className="flex justify-between text-sm">
                <span>{q.options[person1Answers[i]]}</span>
                {match ? <FaCheckCircle /> : <FaTimesCircle />}
                <span>{q.options[person2Answers[i]]}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <button onClick={downloadImage}>
          <FaDownload /> Download
        </button>
        <button onClick={copyLink}>
          <FaWhatsapp /> Share
        </button>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<FaSpinner className="animate-spin" />}>
      <ResultPageContent />
    </Suspense>
  );
}
