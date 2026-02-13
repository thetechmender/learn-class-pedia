import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { getAssessment, submitAssessment, saveAssessmentProgress } from "../services/assessmentApi";
import { getCourseDetails, getLectureSections, getStudentProgress } from "../services/learningApi";
import { transformApiResponse } from "../utils/courseTransformer";
import "./assest.css";

// Default IDs for development/testing
const DEFAULT_STUDENT_ID = 1;
const DEFAULT_COURSE_ID = 15;

export default function Assessment({ 
  lectureId: propLectureId, 
  lectureName: propLectureName, 
  studentId: propStudentId,
  courseId: propCourseId 
}) {
  const { lectureId: paramLectureId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const lectureId = propLectureId || paramLectureId || searchParams.get("lectureId") || 1005;
  const lectureName = propLectureName || searchParams.get("lectureName") || "Assessment";
  const studentId = propStudentId || searchParams.get("studentId") || DEFAULT_STUDENT_ID;
  const courseId = propCourseId || searchParams.get("courseId") || DEFAULT_COURSE_ID;

  // UI state
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(typeof window !== "undefined" ? window.innerWidth >= 1024 : true);

  // Course/Sidebar state
  const [courseData, setCourseData] = useState(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const [completedLectures, setCompletedLectures] = useState(new Set());
  const [selectedLecture, setSelectedLecture] = useState(null);

  // Assessment state
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [showReview, setShowReview] = useState(false);

  // Timer state
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);
  const progressSaveRef = useRef(null);

  // Current question
  const currentQuestion = questions[currentQuestionIndex];

  // Handle screen resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch course data for sidebar
  const fetchCourseData = useCallback(async () => {
    try {
      setCourseLoading(true);
      const [courseDetails, lectureSections, studentProgress] = await Promise.all([
        getCourseDetails(courseId).catch(() => null),
        getLectureSections(courseId),
        getStudentProgress(studentId, courseId).catch(() => null),
      ]);

      const transformedData = transformApiResponse(lectureSections, courseDetails);

      if (transformedData && transformedData.chapters.length > 0) {
        setCourseData(transformedData);

        // Find current lecture and expand its chapter
        let chapterToExpand = transformedData.chapters[0].id;
        for (const chapter of transformedData.chapters) {
          const found = chapter.lectures.find((l) => l.id === String(lectureId) || l.id === lectureId);
          if (found) {
            setSelectedLecture(found);
            chapterToExpand = chapter.id;
            break;
          }
        }
        setExpandedChapters(new Set([chapterToExpand]));

        // Set completed lectures from API
        if (studentProgress?.completedLectureIds) {
          setCompletedLectures(new Set(studentProgress.completedLectureIds.map(String)));
        }
      }
    } catch (err) {
      console.log("Error fetching course data:", err);
    } finally {
      setCourseLoading(false);
    }
  }, [studentId, courseId, lectureId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // Fetch assessment on mount
  useEffect(() => {
    fetchAssessment();
  }, [lectureId]);

  // Initialize timer
  useEffect(() => {
    if (!isSubmitted && !isLoading && questions.length > 0) {
      setIsTimerRunning(true);
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isSubmitted, isLoading, questions.length]);

  // Auto-save progress
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
          });
        } catch (err) {
          console.log("Auto-save failed:", err);
        }
      }, 3000);
    }

    return () => {
      if (progressSaveRef.current) {
        clearTimeout(progressSaveRef.current);
      }
    };
  }, [selectedAnswers, currentQuestionIndex, timeElapsed, questions.length, isSubmitted]);

  // Load saved progress
  useEffect(() => {
    const loadSavedProgress = async () => {
      try {
        const saved = localStorage.getItem(`assessment_progress_${lectureId}_${studentId}`);
        if (saved) {
          const { selectedAnswers: savedAnswers, currentQuestionIndex: savedIndex, timeElapsed: savedTime } = JSON.parse(saved);
          if (savedAnswers && Object.keys(savedAnswers).length > 0) {
            setSelectedAnswers(savedAnswers);
          }
          if (savedIndex !== undefined) {
            setCurrentQuestionIndex(savedIndex);
          }
          if (savedTime !== undefined) {
            setTimeElapsed(savedTime);
          }
        }
      } catch (err) {
        console.log("Failed to load saved progress:", err);
      }
    };

    if (questions.length > 0) {
      loadSavedProgress();
    }
  }, [questions.length, lectureId, studentId]);

  const fetchAssessment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAssessment(lectureId);
      setQuestions(data);
      setSelectedAnswers({});
      setIsSubmitted(false);
      setResults(null);
      setCurrentQuestionIndex(0);
      setTimeElapsed(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, optionLetter) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionLetter }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter((q) => !selectedAnswers[q.quizQuestionId]);

    if (unanswered.length > 0 && !window.confirm(`You have ${unanswered.length} unanswered question(s). Submit anyway?`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      setIsTimerRunning(false);

      // Calculate results
      const calculatedResults = questions.map((q) => ({
        questionId: q.quizQuestionId,
        selectedAnswer: selectedAnswers[q.quizQuestionId],
        correctAnswer: q.correctAnswer,
        isCorrect: selectedAnswers[q.quizQuestionId] === q.correctAnswer,
        explanation: q.explanation,
      }));

      const score = calculatedResults.filter((r) => r.isCorrect).length;
      const percentage = Math.round((score / questions.length) * 100);

      // Submit to API
      try {
        const answers = questions.map((q) => ({
          quizQuestionId: q.quizQuestionId,
          selectedAnswer: selectedAnswers[q.quizQuestionId],
        }));
        await submitAssessment(studentId, lectureId, answers);
      } catch (apiError) {
        console.log("API submission failed, using local results:", apiError);
      }

      setResults({
        score,
        total: questions.length,
        percentage,
        details: calculatedResults,
        timeSpent: timeElapsed,
      });

      setIsSubmitted(true);
      setShowReview(true);

      // Clear saved progress
      localStorage.removeItem(`assessment_progress_${lectureId}_${studentId}`);
    } catch (err) {
      setError("Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setResults(null);
    setShowReview(false);
    setCurrentQuestionIndex(0);
    setTimeElapsed(0);
    setIsTimerRunning(true);
    fetchAssessment();
  };

  const getAnsweredCount = () => Object.keys(selectedAnswers).length;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Sidebar helper functions
  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => {
      const newSet = new Set(prev);
      newSet.has(chapterId) ? newSet.delete(chapterId) : newSet.add(chapterId);
      return newSet;
    });
  };

  const getCourseProgress = () => {
    if (!courseData) return 0;
    const totalLectures = courseData.chapters.reduce((acc, ch) => acc + ch.lectures.length, 0);
    return totalLectures > 0 ? Math.round((completedLectures.size / totalLectures) * 100) : 0;
  };

  const getTotalLectures = () => {
    if (!courseData) return 0;
    return courseData.chapters.reduce((acc, ch) => acc + ch.lectures.length, 0);
  };

  const getTotalDuration = () => {
    if (!courseData) return "0h";
    let totalMinutes = 0;
    courseData.chapters.forEach((chapter) => {
      chapter.lectures.forEach((lecture) => {
        const mins = parseInt(lecture.duration) || 5;
        totalMinutes += mins;
      });
    });
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const handleLectureClick = (lecture) => {
    // Navigate to the lecture's assessment
    navigate(`/assessment?lectureId=${lecture.id}&lectureName=${encodeURIComponent(lecture.title)}&studentId=${studentId}&courseId=${courseId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="assessment-wrapper">
        <div className="loading-container">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Loading assessment questions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="assessment-wrapper">
        <div className="error-container">
          <i className="fa-solid fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={fetchAssessment} className="btn-primary">
            Try Again
          </button>
          <button onClick={() => navigate(-1)} className="btn-secondary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Results/Review state
  if (isSubmitted && showReview) {
    return (
      <div className="assessment-wrapper">
        <div className="results-container">
          <div className="results-header">
            <i className={`fa-solid fa-trophy ${results.percentage >= 70 ? "gold" : ""}`}></i>
            <h2>{results.percentage >= 90 ? "Outstanding!" : results.percentage >= 70 ? "Great Job!" : results.percentage >= 50 ? "Good Effort!" : "Keep Learning!"}</h2>
            <div className="results-score">{results.percentage}%</div>
            <p>
              You scored {results.score} out of {results.total}
            </p>
            <p className="time-spent">Time spent: {formatTime(results.timeSpent)}</p>
          </div>

          <div className="results-actions">
            <button onClick={handleRetake} className="btn-primary">
              <i className="fa-solid fa-redo"></i> Retake Assessment
            </button>
            <button onClick={() => navigate(-1)} className="btn-secondary">
              <i className="fa-solid fa-arrow-left"></i> Go Back
            </button>
          </div>

          <div className="review-questions">
            <h3>Review Your Answers</h3>
            {questions.map((question, index) => {
              const result = results.details.find((r) => r.questionId === question.quizQuestionId);
              return (
                <div key={question.quizQuestionId} className={`review-question-card ${result.isCorrect ? "correct" : "incorrect"}`}>
                  <div className="review-question-header">
                    <span className="question-number">Question {index + 1}</span>
                    <span className={`result-badge ${result.isCorrect ? "correct" : "incorrect"}`}>
                      {result.isCorrect ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-times"></i>}
                      {result.isCorrect ? " Correct" : " Incorrect"}
                    </span>
                  </div>
                  <p className="review-question-text">{question.question}</p>
                  <div className="review-options">
                    {question.options.map((option) => {
                      const isSelected = result.selectedAnswer === option.optionLetter;
                      const isCorrect = question.correctAnswer === option.optionLetter;
                      return (
                        <div
                          key={option.quizOptionId}
                          className={`review-option ${isCorrect ? "correct-answer" : ""} ${isSelected && !isCorrect ? "wrong-answer" : ""}`}
                        >
                          <span className="option-letter">{option.optionLetter}</span>
                          <span className="option-text">{option.optionText}</span>
                          {isCorrect && <i className="fa-solid fa-check correct-icon"></i>}
                          {isSelected && !isCorrect && <i className="fa-solid fa-times wrong-icon"></i>}
                        </div>
                      );
                    })}
                  </div>
                  {question.explanation && (
                    <div className="explanation">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-wrapper">
      {/* Top header */}
      <div className="assessment-header">
        <div className="header-left">
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? (
              <i className="fa-solid fa-times"></i>
            ) : (
              <i className="fa-solid fa-bars"></i>
            )}
          </button>
        </div>

        <div className="header-right">
          <div className="top-btns">
            <div className="search">
              <a href="#">
                <i className="fa-solid fa-magnifying-glass" />
              </a>
            </div>
            <div className="bell-icon">
              <a href="#">
                <i className="fa-regular fa-bell" />
              </a>
            </div>
          </div>

          <div className="top-side">
            <div className="top-side-c">
              <span>{getAnsweredCount()}/{questions.length} Answered</span>
              <p><i className="fa-regular fa-clock"></i> {formatTime(timeElapsed)}</p>
            </div>
            <div
              className="Dropdown"
              onClick={() => setIsStatusMenuOpen((open) => !open)}
            >
              <span>
                NA
              </span>
              {isStatusMenuOpen && (
                <div className="status-menu">
                  <a href="#profile" className="status-menu-item">
                    Profile
                  </a>
                  <a href="#settings" className="status-menu-item">
                    Settings
                  </a>
                  <a href="#logout" className="status-menu-item">
                    Logout
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && !isLargeScreen && (
        <div
          className="sidebar-overlay"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main layout */}
      <div className="assessment-wrapper-inner">
        {/* LEFT SIDEBAR */}
       <aside 
        className={`left-sidebar ${showSidebar || isLargeScreen ? "sidebar-visible" : "sidebar-hidden"}`}
      >
          <div className="cur-cont">
            <h5>Course Content</h5>
            <span>
              <i className="fa-regular fa-clock"></i> {getTotalDuration()} total
            </span>
          </div>

          <div className="progress-block">
            <div className="progress-header">
              <span className="progress-label">Your Progress</span>
              <span className="progress-value">{getCourseProgress()}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${getCourseProgress()}%` }} />
            </div>
            <div className="progress-meta">
              <span>{completedLectures.size} completed</span>
              <span>{getTotalLectures() - completedLectures.size} remaining</span>
            </div>
          </div>

          {/* Dynamic Chapter List */}
          <div className="chapter-list">
            {courseLoading ? (
              <div className="sidebar-loading">
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>Loading chapters...</span>
              </div>
            ) : courseData && courseData.chapters ? (
              courseData.chapters.map((chapter, chapterIndex) => {
                const chapterProgress = chapter.lectures.filter((l) => completedLectures.has(String(l.id))).length;
                const isExpanded = expandedChapters.has(chapter.id);

                return (
                  <div key={chapter.id} className="chapter-item">
                    <button
                      type="button"
                      className="chapter-header-toggle"
                      aria-expanded={isExpanded}
                      onClick={() => toggleChapter(chapter.id)}
                    >
                      <span className="accordion-icon">
                        <i className={isExpanded ? "fa-solid fa-angle-down" : "fa-solid fa-angle-right"} />
                      </span>
                      <span className="chapter-label">
                        {chapterProgress === chapter.lectures.length ? (
                          <i className="fa-regular fa-circle-check chapter-complete"></i>
                        ) : (
                          <i className="fa-regular fa-circle chapter-incomplete"></i>
                        )}
                        Chapter {chapterIndex + 1}
                      </span>
                    </button>

                    {isExpanded && (
                      <ul className="lesson-list">
                        <li className="section-row mt-3">
                          <div className="section-info">
                            <span className="section-title">{chapter.title}</span>
                            <div className="section-progress-bar">
                              <div
                                className="section-progress-fill"
                                style={{ width: `${(chapterProgress / chapter.lectures.length) * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="section-count">{chapterProgress}/{chapter.lectures.length}</span>
                        </li>

                        {chapter.lectures.map((lecture) => {
                          const isCompleted = completedLectures.has(String(lecture.id));
                          const isActive = String(lecture.id) === String(lectureId);

                          return (
                            <li
                              key={lecture.id}
                              className={`lesson-item ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
                              onClick={() => handleLectureClick(lecture)}
                            >
                              <div className="lesson-status-icon">
                                {isCompleted ? (
                                  <i className="fa-regular fa-circle-check"></i>
                                ) : (
                                  <i className="fa-regular fa-circle"></i>
                                )}
                              </div>
                              <div className="lesson-content">
                                <p className="lesson-title">{lecture.title}</p>
                                <span className="lesson-meta">
                                  {lecture.duration || "5 min"} · {lecture.studentCount?.toLocaleString() || 0} views
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="sidebar-empty">
                <p>No course content available</p>
              </div>
            )}
          </div>

          <button className="complete-btn">
            <i className="fa-solid fa-graduation-cap"></i> Course Complete!
          </button>
        </aside>

        {/* MAIN CONTENT */}
     {/* MAIN CONTENT */}
      <main className="content-mid">
        <div className="content-header">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{lectureName}</h3>
            <p className="text-sm text-gray-500 mt-1">Assessment Quiz</p>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {currentQuestionIndex + 1}/{questions.length} Questions
          </span>
        </div>

        {/* Question Indicators - Improved UX */}
        <div className="question-indicators">
          {questions.map((q, index) => (
            <button
              key={q.quizQuestionId}
              className={`question-indicator ${index === currentQuestionIndex ? "active" : ""} 
                ${selectedAnswers[q.quizQuestionId] ? "answered" : ""}`}
              onClick={() => setCurrentQuestionIndex(index)}
              aria-label={`Go to question ${index + 1}`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <section className="question-card">
            <header className="question-header">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium">
                  Question {currentQuestionIndex + 1}
                </span>
                {currentQuestion.category && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                    {currentQuestion.category}
                  </span>
                )}
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-6">
                {currentQuestion.question}
              </h4>
            </header>

            <div className="options-grid">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswers[currentQuestion.quizQuestionId] === option.optionLetter;
                return (
                  <label
                    key={option.quizOptionId}
                    className={`option-item ${isSelected ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name={`q-${currentQuestion.quizQuestionId}`}
                      value={option.optionLetter}
                      checked={isSelected}
                      onChange={() => handleAnswerSelect(currentQuestion.quizQuestionId, option.optionLetter)}
                      className="sr-only"
                    />
                    <span className="option-label">
                      <span className="option-letter">{option.optionLetter}.</span>
                      {option.optionText}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        )}

        {/* Footer Navigation */}
        <footer className="assessment-footer">
          <div className="footer-actions">
            <button className="footer-icon-btn" aria-label="Helpful">
              <i className="fa-regular fa-hand"></i>
              <span>Helpful</span>
            </button>
            <button className="footer-icon-btn" aria-label="Ask Question">
              <i className="fa-regular fa-circle-question"></i>
              <span>Ask Question</span>
            </button>
            <button className="footer-icon-btn" aria-label="Need Help">
              <i className="fa-regular fa-life-ring"></i>
              <span>Need Help?</span>
            </button>
          </div>

          <div className="footer-nav">
            <button
              className="btn-secondary"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <i className="fa-solid fa-arrow-left"></i>
              Previous
            </button>
            
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                className="btn-primary submit-btn"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit
                    <i className="fa-solid fa-paper-plane"></i>
                  </>
                )}
              </button>
            ) : (
              <button
                className="btn-primary"
                onClick={handleNext}
              >
                Next
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            )}
          </div>
        </footer>
      </main>
      </div>
    </div>
  );
}
