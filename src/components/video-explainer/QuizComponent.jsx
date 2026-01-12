import { Target } from 'lucide-react';

export default function QuizComponent({ 
    assessments, 
    quizAnswers, 
    quizScore, 
    onAnswerSelect, 
    onSubmit, 
    onRetry 
}) {
    if (!assessments.length) return null;

    return (
        <div className="h-full flex flex-col">
            <div className="mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    <Target className="w-6 h-6" /> Knowledge Check
                </h2>
                <p className="text-white/70 text-sm">Test your understanding of the course material</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                {assessments.map((question, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="text-white font-medium">Question {index + 1}</h3>
                            <span className="text-xs px-2 py-1 bg-slate-700/50 rounded">
                                {question.difficulty || 'Medium'}
                            </span>
                        </div>

                        <p className="text-white/90 mb-4">{question.question}</p>

                        <div className="space-y-2">
                            {JSON.parse(question.options || '[]').map((option, optIndex) => (
                                <button
                                    key={optIndex}
                                    onClick={() => onAnswerSelect(index, optIndex)}
                                    className={`w-full text-left p-3 rounded-lg border transition-all ${quizAnswers[index] === optIndex
                                        ? optIndex === question.correctOptionIndex
                                            ? 'bg-green-500/20 border-green-400/50'
                                            : 'bg-red-500/20 border-red-400/50'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center ${quizAnswers[index] === optIndex
                                            ? optIndex === question.correctOptionIndex
                                                ? 'bg-green-500 text-white'
                                                : 'bg-red-500 text-white'
                                            : 'bg-white/10 text-white/60'
                                            }`}>
                                            {String.fromCharCode(65 + optIndex)}
                                        </div>
                                        <span className="text-white/80">{option}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {quizScore !== null && (
                            <div className={`mt-3 p-3 rounded-lg ${question.correctOptionIndex === quizAnswers[index]
                                ? 'bg-green-500/10 border border-green-500/20'
                                : 'bg-red-500/10 border border-red-500/20'
                                }`}>
                                <p className="text-sm font-medium text-white mb-1">
                                    {question.correctOptionIndex === quizAnswers[index] ? '✓ Correct!' : '✗ Incorrect'}
                                </p>
                                <p className="text-white/70 text-xs">{question.explanation}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
                {quizScore === null ? (
                    <button
                        onClick={onSubmit}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all"
                    >
                        Submit Answers
                    </button>
                ) : (
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-2">
                            {quizScore.percentage}%
                        </div>
                        <p className="text-white/70">
                            You got {quizScore.correct} out of {quizScore.total} questions correct
                        </p>
                        <button
                            onClick={onRetry}
                            className="mt-4 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Retry Quiz
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
