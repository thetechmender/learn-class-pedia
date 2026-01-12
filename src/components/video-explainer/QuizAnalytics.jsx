import { useState, useEffect } from 'react';
import { TrendingUp, Award, Target, CheckCircle, XCircle, BarChart3, RefreshCw } from 'lucide-react';

export default function QuizAnalytics({ quizHistory, assessments }) {
    const [stats, setStats] = useState({
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        improvement: 0,
        weakTopics: [],
        strongTopics: []
    });

    useEffect(() => {
        if (!quizHistory || quizHistory.length === 0) return;

        const totalAttempts = quizHistory.length;
        const scores = quizHistory.map(h => h.percentage);
        const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const bestScore = Math.max(...scores);
        
        // Calculate improvement (compare last 3 attempts with first 3)
        let improvement = 0;
        if (totalAttempts >= 6) {
            const firstThree = scores.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
            const lastThree = scores.slice(-3).reduce((a, b) => a + b, 0) / 3;
            improvement = Math.round(lastThree - firstThree);
        }

        setStats({
            totalAttempts,
            averageScore,
            bestScore,
            improvement,
            weakTopics: [],
            strongTopics: []
        });
    }, [quizHistory]);

    if (!quizHistory || quizHistory.length === 0) {
        return (
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="text-center py-8">
                    <BarChart3 className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 text-sm">Complete a quiz to see your analytics</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl border border-white/10 p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                    Quiz Performance
                </h3>
                <span className="text-xs text-white/50">{stats.totalAttempts} attempts</span>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-blue-400" />
                        <span className="text-xs text-blue-300 font-medium">Average Score</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.averageScore}%</p>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-green-400" />
                        <span className="text-xs text-green-300 font-medium">Best Score</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.bestScore}%</p>
                </div>
            </div>

            {/* Improvement Indicator */}
            {stats.improvement !== 0 && (
                <div className={`p-4 rounded-xl border ${
                    stats.improvement > 0 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-orange-500/10 border-orange-500/30'
                }`}>
                    <div className="flex items-center gap-3">
                        <TrendingUp className={`w-5 h-5 ${
                            stats.improvement > 0 ? 'text-green-400' : 'text-orange-400'
                        }`} />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-white">
                                {stats.improvement > 0 ? 'Great Progress!' : 'Keep Practicing'}
                            </p>
                            <p className="text-xs text-white/60">
                                {stats.improvement > 0 ? '+' : ''}{stats.improvement}% improvement over time
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Attempts */}
            <div>
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-purple-400" />
                    Recent Attempts
                </h4>
                <div className="space-y-2">
                    {quizHistory.slice(-5).reverse().map((attempt, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                        >
                            <div className="flex items-center gap-3">
                                {attempt.percentage >= 70 ? (
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-400" />
                                )}
                                <div>
                                    <p className="text-sm text-white font-medium">
                                        {attempt.correct}/{attempt.total} correct
                                    </p>
                                    <p className="text-xs text-white/50">
                                        {new Date(attempt.timestamp).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className={`text-lg font-bold ${
                                attempt.percentage >= 70 ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {attempt.percentage}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Performance Chart */}
            <div>
                <h4 className="text-sm font-semibold text-white mb-3">Score Trend</h4>
                <div className="flex items-end gap-2 h-32">
                    {quizHistory.slice(-10).map((attempt, index) => {
                        const height = `${attempt.percentage}%`;
                        const color = attempt.percentage >= 70 ? 'bg-green-500' : 'bg-red-500';
                        
                        return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full bg-white/10 rounded-t relative" style={{ height: '100%' }}>
                                    <div
                                        className={`absolute bottom-0 w-full ${color} rounded-t transition-all`}
                                        style={{ height }}
                                    ></div>
                                </div>
                                <span className="text-xs text-white/40">{index + 1}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Motivational Message */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
                <p className="text-sm text-white/90 text-center">
                    {stats.averageScore >= 80 ? '🎉 Excellent work! You\'re mastering this material!' :
                     stats.averageScore >= 60 ? '💪 Good progress! Keep practicing to improve!' :
                     '📚 Keep learning! Review the material and try again!'}
                </p>
            </div>
        </div>
    );
}
