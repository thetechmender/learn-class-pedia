import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
    CheckCircle2, 
    Circle, 
    Clock, 
    AlertCircle, 
    ChevronLeft, 
    ChevronRight,
    Award,
    BookOpen,
    RefreshCw,
    Send,
    Check,
    X,
    Timer,
    Star,
    BarChart3,
    Filter,
    Eye,
    EyeOff,
    Bookmark,
    Download,
    Share2,
    Target,
    TrendingUp,
    HelpCircle,
    Volume2,
    Pause,
    Play,
    Zap,
    Crown,
    Sparkles
} from 'lucide-react';
import { getAssessment, submitAssessment, saveAssessmentProgress } from '../services/assessmentApi';
import Confetti from 'react-confetti';

const AssessmentPage = ({ lectureId: propLectureId, lectureName: propLectureName, studentId: propStudentId }) => {
    const { lectureId: paramLectureId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const lectureId = propLectureId || paramLectureId || searchParams.get('lectureId') || 1005;
    const lectureName = propLectureName || searchParams.get('lectureName') || "Assessment";
    const studentId = propStudentId || searchParams.get('studentId') || 1;
    
    // State management
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [results, setResults] = useState(null);
    const [showReview, setShowReview] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    
    // Enhanced states
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);
    const [showExplanations, setShowExplanations] = useState({});
    const [reviewMode, setReviewMode] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [showAdvancedStats, setShowAdvancedStats] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [difficultyRatings, setDifficultyRatings] = useState({});
    const [answerHistory, setAnswerHistory] = useState([]);
    
    // Refs
    const timerRef = useRef(null);
    const audioRef = useRef(null);
    const progressSaveRef = useRef(null);
    const questionRefs = useRef([]);

    // Categories from questions
    const categories = [...new Set(questions.map(q => q.category || 'General'))];
    
    // Current question - defined early for use in effects
    const currentQuestion = questions[currentQuestionIndex];

    // Initialize timer
    useEffect(() => {
        if (!isSubmitted && !isLoading && questions.length > 0) {
            setIsTimerRunning(true);
            timerRef.current = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isSubmitted, isLoading, questions.length]);

    // Save progress automatically
    useEffect(() => {
        if (progressSaveRef.current) {
            clearTimeout(progressSaveRef.current);
        }

        if (questions.length > 0 && Object.keys(selectedAnswers).length > 0 && !isSubmitted) {
            progressSaveRef.current = setTimeout(async () => {
                try {
                    await saveAssessmentProgress(studentId, lectureId, {
                        selectedAnswers,
                        currentQuestionIndex,
                        timeElapsed,
                        bookmarkedQuestions
                    });
                } catch (error) {
                    console.log('Auto-save failed:', error);
                }
            }, 3000); // Debounce save every 3 seconds
        }

        return () => {
            if (progressSaveRef.current) {
                clearTimeout(progressSaveRef.current);
            }
        };
    }, [selectedAnswers, currentQuestionIndex, timeElapsed, bookmarkedQuestions, questions.length, isSubmitted]);

    // Load saved progress
    useEffect(() => {
        const loadSavedProgress = async () => {
            try {
                const saved = localStorage.getItem(`assessment_progress_${lectureId}_${studentId}`);
                if (saved) {
                    const { selectedAnswers: savedAnswers, currentQuestionIndex: savedIndex, 
                            timeElapsed: savedTime, bookmarkedQuestions: savedBookmarks } = JSON.parse(saved);
                    
                    if (savedAnswers && Object.keys(savedAnswers).length > 0) {
                        setSelectedAnswers(savedAnswers);
                    }
                    if (savedIndex !== undefined) {
                        setCurrentQuestionIndex(savedIndex);
                    }
                    if (savedTime !== undefined) {
                        setTimeElapsed(savedTime);
                    }
                    if (savedBookmarks) {
                        setBookmarkedQuestions(savedBookmarks);
                    }
                }
            } catch (error) {
                console.log('Failed to load saved progress:', error);
            }
        };

        if (questions.length > 0) {
            loadSavedProgress();
        }
    }, [questions.length, lectureId, studentId]);

    // Play sound effects
    useEffect(() => {
        if (audioEnabled && audioRef.current) {
            if (isSubmitted && results?.percentage >= 80) {
                audioRef.current.src = '/sounds/success.mp3';
                audioRef.current.play().catch(console.log);
            } else if (isSubmitted && results?.percentage < 50) {
                audioRef.current.src = '/sounds/complete.mp3';
                audioRef.current.play().catch(console.log);
            }
        }
    }, [isSubmitted, results, audioEnabled]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isSubmitted || isLoading) return;

            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    handlePrevious();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (currentQuestionIndex < questions.length - 1) {
                        handleNext();
                    } else {
                        handleSubmit();
                    }
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                    e.preventDefault();
                    const optionIndex = parseInt(e.key) - 1;
                    if (currentQuestion?.options[optionIndex]) {
                        handleAnswerSelect(currentQuestion.quizQuestionId, currentQuestion.options[optionIndex].optionLetter);
                    }
                    break;
                case ' ':
                    e.preventDefault();
                    if (currentQuestion?.explanation) {
                        toggleExplanation(currentQuestion.quizQuestionId);
                    }
                    break;
                case 'b':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        toggleBookmark(currentQuestion.quizQuestionId);
                    }
                    break;
                case 'Escape':
                    setShowAdvancedStats(false);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentQuestionIndex, questions, isSubmitted, isLoading, currentQuestion]);

    // Fetch assessment on mount
    useEffect(() => {
        fetchAssessment();
    }, [lectureId]);

    const fetchAssessment = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getAssessment(lectureId);
            setQuestions(data);
            
            // Initialize difficulty ratings
            const initialRatings = {};
            data.forEach(q => {
                initialRatings[q.quizQuestionId] = q.difficulty || 'medium';
            });
            setDifficultyRatings(initialRatings);
            
            // Reset states
            setSelectedAnswers({});
            setIsSubmitted(false);
            setResults(null);
            setCurrentQuestionIndex(0);
            setTimeElapsed(0);
            setBookmarkedQuestions([]);
            setShowExplanations({});
            setShowConfetti(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerSelect = (questionId, optionLetter) => {
        if (isSubmitted) return;
        
        setSelectedAnswers(prev => {
            const newAnswers = { ...prev, [questionId]: optionLetter };
            
            // Track answer history
            setAnswerHistory(prevHistory => [
                ...prevHistory,
                {
                    questionId,
                    selectedOption: optionLetter,
                    timestamp: Date.now(),
                    questionIndex: questions.findIndex(q => q.quizQuestionId === questionId)
                }
            ]);
            
            return newAnswers;
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);
            // Scroll to question
            if (questionRefs.current[nextIndex]) {
                questionRefs.current[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            const prevIndex = currentQuestionIndex - 1;
            setCurrentQuestionIndex(prevIndex);
            // Scroll to question
            if (questionRefs.current[prevIndex]) {
                questionRefs.current[prevIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    const handleSubmit = async () => {
        const unanswered = questions.filter(q => !selectedAnswers[q.quizQuestionId]);
        
        if (unanswered.length > 0 && !window.confirm(
            `You have ${unanswered.length} unanswered question(s). Submit anyway?`
        )) {
            return;
        }

        try {
            setIsSubmitting(true);
            setIsTimerRunning(false);
            
            // Calculate results
            const calculatedResults = questions.map(q => ({
                questionId: q.quizQuestionId,
                selectedAnswer: selectedAnswers[q.quizQuestionId],
                correctAnswer: q.correctAnswer,
                isCorrect: selectedAnswers[q.quizQuestionId] === q.correctAnswer,
                explanation: q.explanation,
                category: q.category,
                difficulty: difficultyRatings[q.quizQuestionId]
            }));

            const score = calculatedResults.filter(r => r.isCorrect).length;
            const percentage = Math.round((score / questions.length) * 100);
            
            // Show confetti for high scores
            if (percentage >= 80) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);
            }

            // Submit to API
            try {
                const answers = questions.map(q => ({
                    quizQuestionId: q.quizQuestionId,
                    selectedAnswer: selectedAnswers[q.quizQuestionId]
                }));
                
                await submitAssessment(studentId, lectureId, answers);
                
                // Save performance analytics
                const analytics = {
                    score,
                    totalQuestions: questions.length,
                    timeSpent: timeElapsed,
                    date: new Date().toISOString(),
                    difficultyBreakdown: calculatedResults.reduce((acc, r) => {
                        acc[r.difficulty] = acc[r.difficulty] || { correct: 0, total: 0 };
                        acc[r.difficulty].total++;
                        if (r.isCorrect) acc[r.difficulty].correct++;
                        return acc;
                    }, {}),
                    categoryBreakdown: calculatedResults.reduce((acc, r) => {
                        acc[r.category] = acc[r.category] || { correct: 0, total: 0 };
                        acc[r.category].total++;
                        if (r.isCorrect) acc[r.category].correct++;
                        return acc;
                    }, {})
                };
                
                localStorage.setItem(`assessment_analytics_${lectureId}_${studentId}`, JSON.stringify(analytics));
            } catch (apiError) {
                console.log('API submission failed, using local results:', apiError);
            }

            setResults({
                score,
                total: questions.length,
                percentage,
                details: calculatedResults,
                timeSpent: timeElapsed,
                averageTimePerQuestion: Math.round(timeElapsed / questions.length)
            });
            
            setIsSubmitted(true);
            setShowReview(true);
            
            // Clear saved progress
            localStorage.removeItem(`assessment_progress_${lectureId}_${studentId}`);
        } catch (err) {
            setError('Failed to submit assessment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetake = () => {
        setSelectedAnswers({});
        setIsSubmitted(false);
        setResults(null);
        setShowReview(false);
        setShowConfetti(false);
        setCurrentQuestionIndex(0);
        setTimeElapsed(0);
        setIsTimerRunning(true);
        setAnswerHistory([]);
        fetchAssessment();
    };

    const toggleBookmark = (questionId) => {
        setBookmarkedQuestions(prev => 
            prev.includes(questionId) 
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        );
    };

    const toggleExplanation = (questionId) => {
        setShowExplanations(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }));
    };

    const jumpToBookmarked = (questionId) => {
        const index = questions.findIndex(q => q.quizQuestionId === questionId);
        if (index !== -1) {
            setCurrentQuestionIndex(index);
        }
    };

    const filterByCategory = (category) => {
        setSelectedCategories(prev => 
            prev.includes(category) 
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const rateDifficulty = (questionId, difficulty) => {
        setDifficultyRatings(prev => ({
            ...prev,
            [questionId]: difficulty
        }));
    };

    const exportResults = () => {
        const exportData = {
            lectureId,
            lectureName,
            studentId,
            results,
            questions: questions.map((q, index) => ({
                questionNumber: index + 1,
                question: q.question,
                selectedAnswer: selectedAnswers[q.quizQuestionId],
                correctAnswer: q.correctAnswer,
                isCorrect: selectedAnswers[q.quizQuestionId] === q.correctAnswer,
                explanation: q.explanation,
                category: q.category
            })),
            analytics: {
                timeSpent: timeElapsed,
                bookmarks: bookmarkedQuestions.length,
                date: new Date().toISOString()
            }
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `assessment_results_${lectureId}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const shareResults = () => {
        if (navigator.share && results) {
            navigator.share({
                title: `Assessment Results - ${lectureName}`,
                text: `I scored ${results.percentage}% on the ${lectureName} assessment!`,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(
                `I scored ${results.percentage}% on the ${lectureName} assessment!`
            );
            alert('Results copied to clipboard!');
        }
    };

    const getAnsweredCount = () => {
        return Object.keys(selectedAnswers).length;
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getPerformanceInsights = () => {
        if (!results) return null;
        
        const insights = [];
        
        if (results.timeSpent < questions.length * 30) {
            insights.push("Great speed! You completed the assessment efficiently.");
        }
        
        if (results.percentage >= 90) {
            insights.push("Excellent! You've mastered this material.");
        } else if (results.percentage >= 70) {
            insights.push("Good job! You have a solid understanding.");
        } else if (results.percentage >= 50) {
            insights.push("Keep practicing! Review the explanations.");
        } else {
            insights.push("Take time to review the material and try again.");
        }
        
        // Category insights
        const categoryPerformance = results.details.reduce((acc, r) => {
            acc[r.category] = acc[r.category] || { correct: 0, total: 0 };
            if (r.isCorrect) acc[r.category].correct++;
            acc[r.category].total++;
            return acc;
        }, {});
        
        Object.entries(categoryPerformance).forEach(([category, stats]) => {
            const percentage = Math.round((stats.correct / stats.total) * 100);
            if (percentage < 60) {
                insights.push(`Focus on ${category} concepts - you scored ${percentage}% in this area.`);
            }
        });
        
        return insights;
    };

    const filteredQuestions = selectedCategories.length > 0 
        ? questions.filter(q => selectedCategories.includes(q.category || 'General'))
        : questions;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <Sparkles className="w-16 h-16 text-purple-500 animate-pulse mx-auto mb-4" />
                        <RefreshCw className="w-12 h-12 text-purple-500 animate-spin absolute top-2 left-1/2 -translate-x-1/2" />
                    </div>
                    <p className="text-slate-300 text-lg mt-4">Loading assessment questions...</p>
                    <p className="text-slate-500 text-sm mt-2">Preparing interactive learning experience</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center bg-slate-800/50 p-8 rounded-2xl border border-red-500/30 backdrop-blur-sm">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
                    <p className="text-red-400 text-lg mb-4 font-medium">{error}</p>
                    <p className="text-slate-400 mb-6">Unable to load assessment questions</p>
                    <div className="flex gap-4 justify-center">
                        <button 
                            onClick={fetchAssessment}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all flex items-center gap-2"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Try Again
                        </button>
                        <button 
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isSubmitted && showReview) {
        const performanceInsights = getPerformanceInsights();
        
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
                {showConfetti && <Confetti recycle={false} numberOfPieces={200} gravity={0.1} />}
                <audio ref={audioRef} preload="auto" />
                
                <div className="max-w-6xl mx-auto">
                    {/* Results Header */}
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 md:p-8 mb-6">
                        <div className="text-center">
                            <div className="relative inline-block">
                                <Award className={`w-24 h-24 mx-auto mb-4 ${results.percentage >= 90 ? 'text-yellow-500 animate-bounce' : results.percentage >= 70 ? 'text-purple-500' : 'text-slate-500'}`} />
                                {results.percentage >= 90 && (
                                    <Crown className="w-12 h-12 text-yellow-500 absolute -top-4 -right-4 animate-pulse" />
                                )}
                            </div>
                            
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                {results.percentage >= 90 ? "Outstanding!" : 
                                 results.percentage >= 70 ? "Great Job!" : 
                                 results.percentage >= 50 ? "Good Effort!" : "Keep Learning!"}
                            </h1>
                            
                            <div className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 mb-4">
                                {results.percentage}%
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <p className="text-slate-400 text-sm mb-1">Score</p>
                                    <p className="text-2xl font-bold text-white">
                                        {results.score}<span className="text-slate-400 text-lg">/{results.total}</span>
                                    </p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <p className="text-slate-400 text-sm mb-1">Time Spent</p>
                                    <p className="text-2xl font-bold text-white flex items-center gap-2">
                                        <Timer className="w-5 h-5" />
                                        {formatTime(results.timeSpent)}
                                    </p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <p className="text-slate-400 text-sm mb-1">Avg Time/Question</p>
                                    <p className="text-2xl font-bold text-white">
                                        {results.averageTimePerQuestion}s
                                    </p>
                                </div>
                            </div>
                            
                            {performanceInsights && performanceInsights.length > 0 && (
                                <div className="mb-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/30">
                                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5" />
                                        Performance Insights
                                    </h3>
                                    <ul className="text-left space-y-2">
                                        {performanceInsights.map((insight, index) => (
                                            <li key={index} className="text-slate-300 flex items-start gap-2">
                                                <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-1" />
                                                {insight}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            <div className="flex flex-wrap justify-center gap-3">
                                <button
                                    onClick={handleRetake}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all flex items-center gap-2"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    Retake Assessment
                                </button>
                                <button
                                    onClick={exportResults}
                                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Download className="w-5 h-5" />
                                    Export Results
                                </button>
                                <button
                                    onClick={shareResults}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Share2 className="w-5 h-5" />
                                    Share
                                </button>
                                <button
                                    onClick={() => setShowAdvancedStats(!showAdvancedStats)}
                                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <BarChart3 className="w-5 h-5" />
                                    {showAdvancedStats ? 'Hide Stats' : 'Show Stats'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Advanced Statistics */}
                    {showAdvancedStats && (
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-6">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <BarChart3 className="w-6 h-6 text-purple-500" />
                                Detailed Analytics
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Difficulty Breakdown */}
                                <div>
                                    <h3 className="text-lg font-medium text-white mb-3">Performance by Difficulty</h3>
                                    {Object.entries(results.details.reduce((acc, r) => {
                                        acc[r.difficulty] = acc[r.difficulty] || { correct: 0, total: 0 };
                                        if (r.isCorrect) acc[r.difficulty].correct++;
                                        acc[r.difficulty].total++;
                                        return acc;
                                    }, {})).map(([difficulty, stats]) => (
                                        <div key={difficulty} className="mb-4">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-slate-300 capitalize">{difficulty}</span>
                                                <span className="text-slate-400">
                                                    {stats.correct}/{stats.total} ({Math.round((stats.correct / stats.total) * 100)}%)
                                                </span>
                                            </div>
                                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                                    style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Category Breakdown */}
                                <div>
                                    <h3 className="text-lg font-medium text-white mb-3">Performance by Category</h3>
                                    {Object.entries(results.details.reduce((acc, r) => {
                                        acc[r.category] = acc[r.category] || { correct: 0, total: 0 };
                                        if (r.isCorrect) acc[r.category].correct++;
                                        acc[r.category].total++;
                                        return acc;
                                    }, {})).map(([category, stats]) => (
                                        <div key={category} className="mb-4">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-slate-300">{category}</span>
                                                <span className="text-slate-400">
                                                    {stats.correct}/{stats.total} ({Math.round((stats.correct / stats.total) * 100)}%)
                                                </span>
                                            </div>
                                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                                                    style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Review Questions */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <Eye className="w-5 h-5" />
                                Review Your Answers
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowExplanations({})}
                                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
                                >
                                    Hide All Explanations
                                </button>
                                <button
                                    onClick={() => {
                                        const allExplanations = {};
                                        questions.forEach(q => {
                                            if (q.explanation) allExplanations[q.quizQuestionId] = true;
                                        });
                                        setShowExplanations(allExplanations);
                                    }}
                                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                                >
                                    Show All Explanations
                                </button>
                            </div>
                        </div>
                        
                        {questions.map((question, index) => {
                            const result = results.details.find(r => r.questionId === question.quizQuestionId);
                            return (
                                <div 
                                    key={question.quizQuestionId}
                                    ref={el => questionRefs.current[index] = el}
                                    className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border p-6 transition-all duration-300 ${
                                        result.isCorrect 
                                            ? 'border-green-500/30 hover:border-green-500/50' 
                                            : 'border-red-500/30 hover:border-red-500/50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-3">
                                            <span className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                                                result.isCorrect 
                                                    ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white' 
                                                    : 'bg-gradient-to-br from-red-500 to-pink-500 text-white'
                                            }`}>
                                                {result.isCorrect ? 
                                                    <Check className="w-6 h-6" /> : 
                                                    <X className="w-6 h-6" />
                                                }
                                            </span>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-slate-500 text-sm">Question {index + 1}</span>
                                                    <span className="text-xs px-2 py-1 rounded-full bg-slate-700/50 text-slate-300">
                                                        {question.category || 'General'}
                                                    </span>
                                                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                                                        {difficultyRatings[question.quizQuestionId] || 'medium'}
                                                    </span>
                                                    {bookmarkedQuestions.includes(question.quizQuestionId) && (
                                                        <Bookmark className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                    )}
                                                </div>
                                                <p className="text-white font-medium text-lg">{question.question}</p>
                                            </div>
                                        </div>
                                        
                                        {question.explanation && (
                                            <button
                                                onClick={() => toggleExplanation(question.quizQuestionId)}
                                                className="flex-shrink-0 text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                            >
                                                {showExplanations[question.quizQuestionId] ? (
                                                    <>
                                                        <EyeOff className="w-4 h-4" />
                                                        Hide Explanation
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="w-4 h-4" />
                                                        Show Explanation
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    
                                    {showExplanations[question.quizQuestionId] && question.explanation && (
                                        <div className="mb-4 ml-13 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/30">
                                            <h4 className="text-sm font-medium text-purple-300 mb-2 flex items-center gap-2">
                                                <HelpCircle className="w-4 h-4" />
                                                Explanation
                                            </h4>
                                            <p className="text-slate-300">{question.explanation}</p>
                                        </div>
                                    )}
                                    
                                    <div className="space-y-2 ml-13">
                                        {question.options.map(option => {
                                            const isSelected = result.selectedAnswer === option.optionLetter;
                                            const isCorrect = question.correctAnswer === option.optionLetter;
                                            return (
                                                <div 
                                                    key={option.quizOptionId}
                                                    className={`p-4 rounded-lg border transition-all duration-200 ${
                                                        isCorrect 
                                                            ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/50 text-green-300'
                                                            : isSelected 
                                                                ? 'bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/50 text-red-300'
                                                                : 'bg-slate-700/30 border-slate-600/30 text-slate-400'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-medium flex-shrink-0 ${
                                                            isCorrect 
                                                                ? 'bg-green-500 text-white'
                                                                : isSelected 
                                                                    ? 'bg-red-500 text-white'
                                                                    : 'bg-slate-600 text-slate-300'
                                                        }`}>
                                                            {option.optionLetter}
                                                        </span>
                                                        <span className="flex-1">{option.optionText}</span>
                                                        {isCorrect && (
                                                            <span className="flex items-center gap-1 text-green-400">
                                                                <CheckCircle2 className="w-5 h-5" />
                                                                Correct
                                                            </span>
                                                        )}
                                                        {isSelected && !isCorrect && (
                                                            <span className="flex items-center gap-1 text-red-400">
                                                                <X className="w-5 h-5" />
                                                                Your Answer
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
            <audio ref={audioRef} preload="auto" />
            
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <BookOpen className="w-10 h-10 text-purple-500" />
                                {bookmarkedQuestions.length > 0 && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold text-slate-900">{bookmarkedQuestions.length}</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-white">{lectureName}</h1>
                                <p className="text-slate-400 text-sm">Assessment Quiz</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Timer */}
                            <div className="flex items-center gap-2 bg-slate-800/70 rounded-lg px-4 py-2">
                                <Timer className="w-5 h-5 text-purple-400" />
                                <span className="text-white font-mono font-medium">
                                    {formatTime(timeElapsed)}
                                </span>
                                <button
                                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                                    className="ml-2 text-slate-400 hover:text-white transition-colors"
                                    aria-label={isTimerRunning ? "Pause timer" : "Resume timer"}
                                >
                                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </button>
                            </div>
                            
                            {/* Progress */}
                            <div className="text-right">
                                <p className="text-slate-400 text-sm">Progress</p>
                                <p className="text-white font-medium">
                                    {getAnsweredCount()} / {questions.length} answered
                                </p>
                                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mt-1 w-32">
                                    <div 
                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                                        style={{ width: `${(getAnsweredCount() / questions.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Enhanced Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2">
                            <span className="text-slate-400 text-sm flex items-center gap-1">
                                <Filter className="w-4 h-4" />
                                Filter by:
                            </span>
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => filterByCategory(category)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                        selectedCategories.includes(category)
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                            {selectedCategories.length > 0 && (
                                <button
                                    onClick={() => setSelectedCategories([])}
                                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setAudioEnabled(!audioEnabled)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    audioEnabled 
                                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' 
                                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                }`}
                                aria-label={audioEnabled ? "Disable sound" : "Enable sound"}
                            >
                                <Volume2 className="w-5 h-5" />
                            </button>
                            
                            {bookmarkedQuestions.length > 0 && (
                                <div className="relative group">
                                    <button
                                        className="w-10 h-10 rounded-full bg-slate-700 text-slate-400 hover:bg-slate-600 flex items-center justify-center"
                                        aria-label="Bookmarked questions"
                                    >
                                        <Bookmark className="w-5 h-5" />
                                    </button>
                                    <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 rounded-lg border border-slate-700 shadow-xl z-50 hidden group-hover:block">
                                        <div className="p-3 border-b border-slate-700">
                                            <p className="text-sm font-medium text-white">Bookmarked Questions</p>
                                        </div>
                                        <div className="max-h-48 overflow-auto">
                                            {bookmarkedQuestions.map(questionId => {
                                                const question = questions.find(q => q.quizQuestionId === questionId);
                                                return question ? (
                                                    <button
                                                        key={questionId}
                                                        onClick={() => jumpToBookmarked(questionId)}
                                                        className="w-full p-3 text-left hover:bg-slate-700/50 border-b border-slate-700/50 last:border-b-0 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Bookmark className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                                            <span className="text-sm text-slate-300 truncate">
                                                                {question.question.substring(0, 60)}...
                                                            </span>
                                                        </div>
                                                    </button>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Question Indicators with Enhanced Status */}
                    <div className="flex flex-wrap gap-2">
                        {questions.map((q, index) => {
                            const isCurrent = index === currentQuestionIndex;
                            const isAnswered = !!selectedAnswers[q.quizQuestionId];
                            const isBookmarked = bookmarkedQuestions.includes(q.quizQuestionId);
                            const isFiltered = selectedCategories.length > 0 && !selectedCategories.includes(q.category || 'General');
                            
                            return (
                                <button
                                    key={q.quizQuestionId}
                                    onClick={() => setCurrentQuestionIndex(index)}
                                    className={`relative w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                                        isCurrent
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                                            : isAnswered
                                                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/50'
                                                : isFiltered
                                                    ? 'bg-slate-700/30 text-slate-500 opacity-50 cursor-not-allowed'
                                                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600 hover:text-white'
                                    }`}
                                    disabled={isFiltered}
                                >
                                    {index + 1}
                                    {isBookmarked && (
                                        <div className="absolute -top-1 -right-1">
                                            <Bookmark className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        </div>
                                    )}
                                    {isCurrent && (
                                        <div className="absolute -top-1 -left-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Question Card */}
                {currentQuestion && (
                    <div 
                        ref={el => questionRefs.current[currentQuestionIndex] = el}
                        className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 md:p-8 mb-6"
                    >
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-purple-400 text-sm font-medium bg-purple-500/10 px-3 py-1 rounded-full">
                                        Question {currentQuestionIndex + 1} of {questions.length}
                                    </span>
                                    <span className="text-slate-500 text-sm bg-slate-700/50 px-3 py-1 rounded-full">
                                        {currentQuestion.category || 'General'}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleBookmark(currentQuestion.quizQuestionId)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            bookmarkedQuestions.includes(currentQuestion.quizQuestionId)
                                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                        }`}
                                        aria-label={
                                            bookmarkedQuestions.includes(currentQuestion.quizQuestionId)
                                                ? "Remove bookmark"
                                                : "Add bookmark"
                                        }
                                    >
                                        <Bookmark className={`w-5 h-5 ${
                                            bookmarkedQuestions.includes(currentQuestion.quizQuestionId) ? 'fill-current' : ''
                                        }`} />
                                    </button>
                                    
                                    {/* Difficulty Rating */}
                                    <div className="flex items-center gap-1 bg-slate-700/50 rounded-full px-3 py-1.5">
                                        <span className="text-slate-400 text-xs mr-1">Difficulty:</span>
                                        {['easy', 'medium', 'hard'].map(level => (
                                            <button
                                                key={level}
                                                onClick={() => rateDifficulty(currentQuestion.quizQuestionId, level)}
                                                className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                                                    difficultyRatings[currentQuestion.quizQuestionId] === level
                                                        ? level === 'easy' ? 'bg-green-500/20 text-green-400' :
                                                          level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                          'bg-red-500/20 text-red-400'
                                                        : 'text-slate-500 hover:text-slate-300'
                                                }`}
                                            >
                                                {level.charAt(0).toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <h2 className="text-2xl md:text-3xl font-semibold text-white leading-relaxed">
                                {currentQuestion.question}
                            </h2>
                            
                            {currentQuestion.explanation && (
                                <button
                                    onClick={() => toggleExplanation(currentQuestion.quizQuestionId)}
                                    className="mt-4 text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                >
                                    {showExplanations[currentQuestion.quizQuestionId] ? (
                                        <>
                                            <EyeOff className="w-4 h-4" />
                                            Hide Explanation
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-4 h-4" />
                                            Show Explanation
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                        
                        {showExplanations[currentQuestion.quizQuestionId] && currentQuestion.explanation && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/30">
                                <h4 className="text-sm font-medium text-purple-300 mb-2 flex items-center gap-2">
                                    <HelpCircle className="w-4 h-4" />
                                    Explanation
                                </h4>
                                <p className="text-slate-300">{currentQuestion.explanation}</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => {
                                const isSelected = selectedAnswers[currentQuestion.quizQuestionId] === option.optionLetter;
                                const shortcutKey = index + 1;
                                
                                return (
                                    <button
                                        key={option.quizOptionId}
                                        onClick={() => handleAnswerSelect(currentQuestion.quizQuestionId, option.optionLetter)}
                                        className={`w-full p-4 rounded-xl border text-left transition-all duration-200 group ${
                                            isSelected
                                                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                                                : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500 hover:transform hover:scale-[1.02]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                                                isSelected
                                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                                                    : 'bg-slate-600 text-slate-300 group-hover:bg-slate-500'
                                            }`}>
                                                {option.optionLetter}
                                                <span className="absolute -ml-8 text-xs text-slate-500 group-hover:text-slate-400">
                                                    {shortcutKey}
                                                </span>
                                            </span>
                                            <span className="flex-1 text-lg">{option.optionText}</span>
                                            {isSelected && (
                                                <CheckCircle2 className="w-6 h-6 text-purple-400 animate-pulse" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        
                        {/* Answer Statistics (if available) */}
                        {currentQuestion.statistics && (
                            <div className="mt-6 p-4 bg-slate-800/30 rounded-lg">
                                <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4" />
                                    Previous Attempt Statistics
                                </h4>
                                <div className="grid grid-cols-4 gap-2">
                                    {currentQuestion.options.map(option => (
                                        <div key={option.optionLetter} className="text-center">
                                            <div className="text-xs text-slate-500 mb-1">{option.optionLetter}</div>
                                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${
                                                        option.optionLetter === currentQuestion.correctAnswer
                                                            ? 'bg-green-500'
                                                            : 'bg-slate-600'
                                                    }`}
                                                    style={{ 
                                                        width: `${currentQuestion.statistics[option.optionLetter] || 0}%` 
                                                    }}
                                                />
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                {currentQuestion.statistics[option.optionLetter] || 0}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation & Submit */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                            className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                                currentQuestionIndex === 0
                                    ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                                    : 'bg-slate-700 text-white hover:bg-slate-600 hover:shadow-lg'
                            }`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Previous
                        </button>
                        
                        <button
                            onClick={() => {
                                const unanswered = questions.filter(q => !selectedAnswers[q.quizQuestionId]);
                                if (unanswered.length > 0) {
                                    const randomUnanswered = unanswered[Math.floor(Math.random() * unanswered.length)];
                                    const index = questions.findIndex(q => q.quizQuestionId === randomUnanswered.quizQuestionId);
                                    setCurrentQuestionIndex(index);
                                }
                            }}
                            disabled={Object.keys(selectedAnswers).length === questions.length}
                            className={`px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${
                                Object.keys(selectedAnswers).length === questions.length
                                    ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                                    : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30'
                            }`}
                        >
                            <Target className="w-4 h-4" />
                            Jump to Unanswered
                        </button>
                    </div>

                    {currentQuestionIndex === questions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || Object.keys(selectedAnswers).length === 0}
                            className={`px-8 py-3 rounded-lg flex items-center gap-2 transition-all ${
                                isSubmitting || Object.keys(selectedAnswers).length === 0
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl hover:shadow-purple-500/30'
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Submit Assessment
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg flex items-center gap-2 transition-all hover:shadow-xl hover:shadow-purple-500/30"
                        >
                            Next Question
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
                
                {/* Keyboard Shortcuts Help */}
                <div className="mt-6 p-4 bg-slate-800/30 rounded-lg">
                    <details className="group">
                        <summary className="text-sm text-slate-400 cursor-pointer list-none flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Keyboard Shortcuts
                        </summary>
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-300">← →</span>
                                <span className="text-slate-400">Navigate questions</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-300">1-4</span>
                                <span className="text-slate-400">Select answer option</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-300">Space</span>
                                <span className="text-slate-400">Toggle explanation</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-300">Ctrl+B</span>
                                <span className="text-slate-400">Toggle bookmark</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-300">Esc</span>
                                <span className="text-slate-400">Close panels</span>
                            </div>
                        </div>
                    </details>
                </div>
            </div>
        </div>
    );
};

export default AssessmentPage;