"use client";

import Link from "next/link";
import { FaHeart, FaRocket } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background hearts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-pink-200 opacity-20 animate-float">
          <FaHeart className="text-6xl" />
        </div>
        <div className="absolute top-40 right-20 text-red-200 opacity-20 animate-float-delayed">
          <FaHeart className="text-8xl" />
        </div>
        <div className="absolute bottom-20 left-1/4 text-pink-300 opacity-20 animate-float">
          <FaHeart className="text-5xl" />
        </div>
        <div className="absolute bottom-40 right-1/3 text-red-300 opacity-20 animate-float-delayed">
          <FaHeart className="text-7xl" />
        </div>
      </div>

      <div className="max-w-lg w-full bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 text-center relative z-10 animate-fade-in-up border border-pink-100">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <FaHeart className="text-7xl text-pink-500 animate-pulse-slow" />
            <div className="absolute inset-0 blur-xl bg-pink-500 opacity-30 animate-pulse"></div>
          </div>
        </div>

        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-red-500 to-pink-600 bg-clip-text text-transparent animate-gradient">
          Valentine&apos;s Day
        </h1>

        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          Couple Compatibility Quiz
        </h2>

        <p className="text-gray-600 mb-10 text-lg leading-relaxed">
          Answer funny questions and see how compatible you are with your partner!
        </p>

        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <Link
              href="/person1?type=love"
              className="group flex items-center justify-center gap-3 w-full bg-gradient-to-r from-pink-500 via-red-500 to-pink-600 hover:from-pink-600 hover:via-red-600 hover:to-pink-700 text-white font-bold py-5 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              <span className="relative z-10">Love Quiz</span>
              <FaRocket className="text-xl relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/person1?type=sexy"
              className="group flex items-center justify-center gap-3 w-full bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 hover:from-purple-700 hover:via-pink-600 hover:to-red-600 text-white font-bold py-5 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              <span className="relative z-10">18+ Quiz</span>
              <FaRocket className="text-xl relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Person 1 starts first, then share the link with Person 2!
          </p>
        </div>
      </div>
    </div>
  );
}
