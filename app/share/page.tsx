"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaHeart,
  FaCopy,
  FaWhatsapp,
  FaTelegramPlane,
  FaRedo,
  FaHome,
  FaSpinner,
} from "react-icons/fa";

const NUM_FLOATING_HEARTS = 12;

function SharePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const data = searchParams.get("data");
  const quizType = searchParams.get("type") === "sexy" ? "sexy" : "love";

  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [person1Name, setPerson1Name] = useState("");
  const [person2Name, setPerson2Name] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [floatingHearts, setFloatingHearts] = useState<
    {
      left: string;
      top: string;
      animation: string;
      animationDelay: string;
      fontSize: string;
    }[]
  >([]);

  /* -------- Floating hearts -------- */
  useEffect(() => {
    setFloatingHearts(
      Array.from({ length: NUM_FLOATING_HEARTS }).map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animation: `float ${8 + Math.random() * 10}s ease-in-out infinite`,
        animationDelay: `${Math.random() * 5}s`,
        fontSize: `${24 + Math.random() * 48}px`,
      }))
    );
  }, []);

  /* -------- Init data -------- */
  useEffect(() => {
    if (!data) {
      router.replace("/");
      return;
    }

    try {
      const decoded = JSON.parse(atob(data));

      setPerson1Name(decoded.person1Name || "Person 1");
      setPerson2Name(decoded.person2Name || "Person 2");

      if (typeof window !== "undefined") {
        const base = window.location.origin;
        const safeData = encodeURIComponent(data);

        setShareLink(
          `${base}/person2?data=${safeData}&type=${quizType}`
        );
      }

      setIsInitialized(true);
    } catch (err) {
      console.error(err);
      setError("Invalid quiz data. Please start over.");
    }
  }, [data, quizType, router]);

  /* -------- Copy -------- */
  const copyLink = async () => {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copy failed. Please copy the link manually.");
    }
  };

  /* -------- Sharing -------- */
  const shareWhatsApp = () => {
    if (!shareLink) return;

    const msg = encodeURIComponent(
      `💕 Hey ${person2Name}! ${person1Name} wants to check your compatibility 💕\n\nTake the quiz here:\n${shareLink}`
    );

    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const shareTelegram = () => {
    if (!shareLink) return;

    const text = encodeURIComponent(
      `💕 Love Compatibility Quiz 💕\n${person1Name} wants to check your compatibility!`
    );
    const url = encodeURIComponent(shareLink);

    window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaHeart className="text-6xl text-pink-500 animate-pulse" />
      </div>
    );
  }

  /* -------- UI -------- */
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
      {/* Background hearts */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingHearts.map((h, i) => (
          <div key={i} className="absolute text-pink-300/30" style={h}>
            <FaHeart />
          </div>
        ))}
      </div>

      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative z-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            Amazing,{" "}
            <span className="text-pink-600">{person1Name}</span> 💖
          </h1>
          <p className="text-gray-700">
            Share this link with{" "}
            <span className="font-bold">{person2Name}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="bg-gray-100 p-3 rounded-xl border border-dashed">
            <p className="text-sm font-mono break-all text-left">
              {shareLink || "Generating link..."}
            </p>
          </div>

          <button
            onClick={copyLink}
            disabled={!shareLink}
            className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold"
          >
            <FaCopy className="inline mr-2" />
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={shareWhatsApp}
            className="bg-green-500 text-white p-4 rounded-xl font-bold"
          >
            <FaWhatsapp /> WhatsApp
          </button>
          <button
            onClick={shareTelegram}
            className="bg-blue-500 text-white p-4 rounded-xl font-bold"
          >
            <FaTelegramPlane /> Telegram
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => window.location.reload()}
            className="py-3 bg-gray-200 rounded-xl font-bold"
          >
            <FaRedo /> Refresh
          </button>
          <button
            onClick={() => router.push("/")}
            className="py-3 bg-pink-200 rounded-xl font-bold"
          >
            <FaHome /> New Quiz
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-25px);
            opacity: 0.15;
          }
        }
      `}</style>
    </div>
  );
}

/* -------- Suspense -------- */

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <FaSpinner className="text-5xl text-pink-500 animate-spin" />
        </div>
      }
    >
      <SharePageContent />
    </Suspense>
  );
}
