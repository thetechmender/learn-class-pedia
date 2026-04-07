import React from 'react';
import { Sparkles } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900">
      <div className="text-center px-6">
        {/* Animated sparkle icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping bg-white/30 rounded-full"></div>
            <div className="relative bg-white/20 backdrop-blur-sm p-6 rounded-full">
              <Sparkles className="w-16 h-16 text-white animate-pulse" />
            </div>
          </div>
        </div>

        {/* Welcome text */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
          Welcome to
          <span className="block bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent">
            ClassPedia Admin
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
          Your journey to knowledge starts here. Explore, learn, and grow with us.
        </p>

        {/* Decorative elements */}
        <div className="flex justify-center gap-3">
          <div className="w-3 h-3 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
