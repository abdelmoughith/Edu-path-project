import React from 'react';
import { Brain, Sparkles, Loader2 } from 'lucide-react';

/**
 * Premium loading state for AI operations
 */
export default function AILoadingState({ message = "L'IA analyse vos données..." }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="relative mb-8">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>

                {/* Brain icon with rotation */}
                <div className="relative bg-white rounded-full p-8 shadow-2xl">
                    <Brain className="w-16 h-16 text-indigo-600 animate-pulse" />
                    <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-bounce" />
                </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                <p className="text-lg font-bold text-slate-700">{message}</p>
            </div>

            <div className="flex gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
        </div>
    );
}
