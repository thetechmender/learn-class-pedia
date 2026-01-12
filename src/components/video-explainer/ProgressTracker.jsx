import { CheckCircle, Circle, Clock, Award, TrendingUp } from 'lucide-react';

export default function ProgressTracker({ 
    totalSlides, 
    completedSlides, 
    currentSlide, 
    timeSpent,
    onSlideClick 
}) {
    const completionPercentage = totalSlides > 0 ? Math.round((completedSlides.size / totalSlides) * 100) : 0;
    const averageTimePerSlide = completedSlides.size > 0 ? Math.round(timeSpent / completedSlides.size) : 0;

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };

    const getMotivationalMessage = () => {
        if (completionPercentage === 100) {
            return { text: "🎉 Course Completed!", color: "text-green-400" };
        } else if (completionPercentage >= 75) {
            return { text: "🔥 Almost there!", color: "text-orange-400" };
        } else if (completionPercentage >= 50) {
            return { text: "💪 Great progress!", color: "text-blue-400" };
        } else if (completionPercentage >= 25) {
            return { text: "🚀 Keep going!", color: "text-purple-400" };
        } else {
            return { text: "✨ Let's start learning!", color: "text-cyan-400" };
        }
    };

    const motivation = getMotivationalMessage();

    return (
        <div className="space-y-4">
            {/* Overall Progress */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold text-sm">Course Progress</h3>
                    <span className={`text-2xl font-bold ${motivation.color}`}>
                        {completionPercentage}%
                    </span>
                </div>
                
                {/* Progress Bar */}
                <div className="relative w-full h-3 bg-slate-700 rounded-full overflow-hidden mb-3">
                    <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-500 rounded-full"
                        style={{ width: `${completionPercentage}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                </div>

                <p className={`text-center text-sm font-medium ${motivation.color}`}>
                    {motivation.text}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-blue-300">Completed</span>
                    </div>
                    <p className="text-xl font-bold text-white">
                        {completedSlides.size}/{totalSlides}
                    </p>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-purple-300">Time Spent</span>
                    </div>
                    <p className="text-xl font-bold text-white">
                        {formatTime(timeSpent)}
                    </p>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-300">Avg/Slide</span>
                    </div>
                    <p className="text-xl font-bold text-white">
                        {averageTimePerSlide}s
                    </p>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Award className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-orange-300">Current</span>
                    </div>
                    <p className="text-xl font-bold text-white">
                        {currentSlide + 1}/{totalSlides}
                    </p>
                </div>
            </div>

            {/* Slide Progress List */}
            <div className="bg-slate-800/50 rounded-xl border border-white/10 p-4 max-h-64 overflow-y-auto">
                <h4 className="text-white text-xs font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                    Slide Progress
                </h4>
                <div className="space-y-2">
                    {Array.from({ length: totalSlides }, (_, i) => {
                        const isCompleted = completedSlides.has(i);
                        const isCurrent = i === currentSlide;
                        
                        return (
                            <button
                                key={i}
                                onClick={() => onSlideClick(i)}
                                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left ${
                                    isCurrent 
                                        ? 'bg-blue-500/20 border border-blue-500/50' 
                                        : 'hover:bg-white/5 border border-transparent'
                                }`}
                            >
                                {isCompleted ? (
                                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                ) : (
                                    <Circle className="w-4 h-4 text-white/30 flex-shrink-0" />
                                )}
                                <span className={`text-sm flex-1 ${
                                    isCurrent ? 'text-white font-medium' : 'text-white/70'
                                }`}>
                                    Slide {i + 1}
                                </span>
                                {isCurrent && (
                                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                                        Current
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
