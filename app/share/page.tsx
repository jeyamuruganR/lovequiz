'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaHeart, FaCopy, FaWhatsapp, FaTelegramPlane,
  FaRedo, FaHome
} from "react-icons/fa";

// Number of floating hearts
const NUM_FLOATING_HEARTS = 12;

export default function SharePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const data = searchParams.get('data');

  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [person1Name, setPerson1Name] = useState('');
  const [person2Name, setPerson2Name] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [floatingHearts, setFloatingHearts] = useState<{
    left: string, top: string, animation: string, animationDelay: string, fontSize: string
  }[]>([]);

  // Generate floating hearts
  useEffect(() => {
    const hearts = Array.from({ length: NUM_FLOATING_HEARTS }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animation: `float ${8 + Math.random() * 10}s ease-in-out infinite`,
      animationDelay: `${Math.random() * 5}s`,
      fontSize: `${24 + Math.random() * 48}px`,
    }));
    setFloatingHearts(hearts);
  }, []);

  // Initialize data
  useEffect(() => {
    if (!data) {
      router.push('/');
      return;
    }

    try {
      const decoded = JSON.parse(atob(data));
      console.log('Decoded data:', decoded);

      setPerson1Name(decoded.person1Name || 'Person 1');
      setPerson2Name(decoded.person2Name || 'Person 2');

      if (typeof window !== 'undefined') {
        const currentUrl = window.location.origin;
        const shareUrl = `${currentUrl}/person2?data=${data}`;
        setShareLink(shareUrl);
      }

      setIsInitialized(true);
    } catch (e) {
      console.error('Failed to decode data:', e);
      setError("Invalid quiz data. Please start over.");
    }
  }, [data, router]);

  const copyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setError("Link not ready. Please wait...");
    }
  };

  const shareWhatsApp = () => {
    if (!shareLink) {
      setError("Share link not ready. Please wait...");
      return;
    }

    const message = encodeURIComponent(
      `💕 Hey ${person2Name}! ${person1Name} wants to check your love compatibility! 💕\n\nTake the quiz here: ${shareLink}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareTelegram = () => {
    if (!shareLink) {
      setError("Share link not ready. Please wait...");
      return;
    }

    const message = encodeURIComponent(
      `💕 Love Compatibility Quiz 💕\n${person1Name} wants to check your compatibility!`
    );
    const url = encodeURIComponent(shareLink);
    window.open(`https://t.me/share/url?url=${url}&text=${message}`, '_blank');
  };

  const restartQuiz = () => {
    router.push('/');
  };

  const refreshPage = () => {
    window.location.reload();
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
        <div className="text-center">
          <FaHeart className="text-6xl text-pink-500 animate-pulse mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-pink-700">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingHearts.map((heart, i) => (
          <div key={i} className="absolute text-pink-300/30" style={heart}>
            <FaHeart />
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 text-center relative z-10 border border-pink-100">
        {/* Header */}
        <div className="mb-8">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-r from-pink-400 to-red-500 flex items-center justify-center mx-auto">
              <FaHeart className="text-3xl md:text-4xl text-white animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white text-lg md:text-xl">
              {person1Name.charAt(0)}
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-3">
            Amazing, <span className="bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">{person1Name}</span>! 💖
          </h1>

          <p className="text-gray-700">
            Share this link with <span className="font-bold text-pink-700">{person2Name}</span> to take the quiz!
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {/* Share Link Section */}
        <div className="mb-8">
          <p className="text-gray-700 font-medium mb-2">Share this link:</p>
          <div className="bg-gray-100 p-3 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-700 text-sm font-mono break-all text-left">
              {shareLink || 'Generating link...'}
            </p>
          </div>

          <button
            onClick={copyLink}
            disabled={!shareLink}
            className="mt-4 w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:opacity-50"
          >
            <div className="flex items-center justify-center gap-2">
              <FaCopy />
              {copied ? 'Link Copied!' : 'Copy Share Link'}
            </div>
          </button>
        </div>

        {/* Quick Share Buttons */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={shareWhatsApp}
            className="flex items-center justify-center gap-2 p-4 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600"
          >
            <FaWhatsapp /> WhatsApp
          </button>
          <button
            onClick={shareTelegram}
            className="flex items-center justify-center gap-2 p-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600"
          >
            <FaTelegramPlane /> Telegram
          </button>
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={refreshPage} className="py-3 bg-gray-200 rounded-xl font-bold">
            <FaRedo className="inline mr-2" /> Refresh
          </button>
          <button onClick={restartQuiz} className="py-3 bg-pink-200 text-pink-800 rounded-xl font-bold">
            <FaHome className="inline mr-2" /> New Quiz
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0.3; }
          50% { transform: translateY(-25px) rotate(12deg) scale(1.1); opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}
