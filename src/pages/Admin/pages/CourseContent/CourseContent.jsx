import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, FileText, Download, Clock, Target, CheckCircle, ExternalLink, User, PlayCircle, Award, Calendar, ChevronDown, ChevronRight, Brain, X } from 'lucide-react';
import { useCourseContent } from '../../../../hooks/api/useCourseContent';

const CourseContent = () => {
  const { lectureId } = useParams();
  const navigate = useNavigate();
  const { courseContent, loading, error, fetchCourseContent } = useCourseContent();
  const [activeTab, setActiveTab] = useState('sections');
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [expandedQuizQuestions, setExpandedQuizQuestions] = useState(new Set());

  useEffect(() => {
    if (lectureId) {
      fetchCourseContent(lectureId);
    }
  }, [lectureId, fetchCourseContent]);

 
  const toggleSection = (sectionIndex) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionIndex)) {
      newExpanded.delete(sectionIndex);
    } else {
      newExpanded.add(sectionIndex);
    }
    setExpandedSections(newExpanded);
  };

  const toggleQuizQuestion = (questionIndex) => {
    const newExpanded = new Set(expandedQuizQuestions);
    if (newExpanded.has(questionIndex)) {
      newExpanded.delete(questionIndex);
    } else {
      newExpanded.add(questionIndex);
    }
    setExpandedQuizQuestions(newExpanded);
  };

  const renderSectionContent = (content) => {
    return { __html: content };
  };

  const getSectionTitle = (sectionType) => {
    const titles = {
      introduction: 'Introduction',
      main_topic_early: 'Foundational Concepts',
      main_topic_mid: 'Intermediate Applications',
      main_topic_advanced: 'Advanced Topics',
      facts: 'Case Studies & Examples',
      summary: 'Summary',
      conclusion: 'Conclusion'
    };
    return titles[sectionType] || sectionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getSectionIcon = (sectionType) => {
    const icons = {
      introduction: <BookOpen className="w-5 h-5" />,
      main_topic_early: <Target className="w-5 h-5" />,
      main_topic_mid: <Clock className="w-5 h-5" />,
      main_topic_advanced: <CheckCircle className="w-5 h-5" />,
      facts: <FileText className="w-5 h-5" />,
      summary: <BookOpen className="w-5 h-5" />,
      conclusion: <CheckCircle className="w-5 h-5" />
    };
    return icons[sectionType] || <BookOpen className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading course content</h3>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!courseContent) {
    return (
      <div className="p-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-gray-800 font-medium">No content available</h3>
          <p className="text-gray-600 mt-1">Course content could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/courses')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
          Back to Courses
        </button>
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center mb-3">
                <BookOpen className="w-8 h-8 mr-3" />
                <h1 className="text-3xl font-bold">Course Content</h1>
              </div>
              <div className="flex items-center space-x-4 text-blue-100">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Lecture ID: {courseContent.courseDetailLectureId}</span>
                </div>
                <div className="flex items-center">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  <span>{courseContent.sectionsContent?.length || 0} Sections</span>
                </div>
                {courseContent.lecturesKeyPoint && (
                  <div className="flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    <span>{courseContent.lecturesKeyPoint.length} Key Points</span>
                  </div>
                )}
              </div>
            </div>
            
            {courseContent.lecturePdfPath && (
              <div className="mt-4 md:mt-0">
                <a
                  href={courseContent.lecturePdfPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl group"
                >
                  <FileText className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  View PDF
                  <ExternalLink className="w-4 h-4 ml-2 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('sections')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'sections'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                Course Sections
                <span className="ml-2 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 py-1 px-2 rounded-full text-xs">
                  {courseContent.sectionsContent?.length || 0}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'quiz'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Brain className="w-4 h-4 mr-2" />
                Quiz
                <span className="ml-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300 py-1 px-2 rounded-full text-xs">
                  {courseContent.lectureQuiz?.length || 0}
                </span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'sections' && (
          <div>
            {/* Key Points */}
            {courseContent.lecturesKeyPoint && courseContent.lecturesKeyPoint.length > 0 && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center mb-6">
                    <div className="bg-amber-500 text-white p-2 rounded-lg mr-3">
                      <Award className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100">Key Learning Points</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courseContent.lecturesKeyPoint.map((point, index) => (
                      <div key={index} className="flex items-start bg-white dark:bg-gray-800 p-4 rounded-lg border border-amber-200 dark:border-amber-700 hover:shadow-md transition-shadow">
                        <div className="bg-amber-100 dark:bg-amber-900/50 p-1 rounded-full mr-3 mt-0.5">
                          <CheckCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed">{point.keyPoint}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Accordion Sections */}
            <div className="space-y-4">
              {courseContent.sectionsContent?.map((section, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <button
                    onClick={() => toggleSection(index)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-500 text-white p-2 rounded-lg mr-4 shadow-md">
                        {getSectionIcon(section.sectionType)}
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {getSectionTitle(section.sectionType)}
                        </h3>
                        <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <BookOpen className="w-4 h-4 mr-1" />
                          <span>Section {section.sortOrder}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {expandedSections.has(index) ? (
                        <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                  </button>
                  
                  {expandedSections.has(index) && (
                    <div className="p-6 border-t border-gray-200 dark:border-gray-600">
                      <div 
                        className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-ul:text-gray-700 dark:prose-ul:text-gray-300"
                        dangerouslySetInnerHTML={renderSectionContent(section.content)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div>
            {/* Quiz Section */}
            {courseContent.lectureQuiz && courseContent.lectureQuiz.length > 0 ? (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="bg-emerald-500 text-white p-2 rounded-lg mr-3">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Course Quiz Information</h2>
                    <p className="text-emerald-700 dark:text-emerald-300 mt-1">Review the quiz questions included in this course</p>
                  </div>
                </div>

                {/* Quiz Overview */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {courseContent.lectureQuiz.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Questions</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {courseContent.lectureQuiz.filter(q => q.options.length === 4).length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Multiple Choice</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {courseContent.lectureQuiz.reduce((acc, q) => acc + q.options.length, 0)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Options</div>
                    </div>
                  </div>
                </div>

                {/* Quiz Questions Accordion */}
                <div className="space-y-4">
                  {courseContent.lectureQuiz.map((quiz, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <button
                        onClick={() => toggleQuizQuestion(index)}
                        className="w-full px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-between hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-800 dark:hover:to-teal-800 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="bg-emerald-500 text-white p-2 rounded-lg mr-4 shadow-md">
                            <Brain className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              Question {quiz.questionOrder}
                            </h3>
                            <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                              <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded text-xs mr-2">
                                {quiz.options.length} Options
                              </span>
                              <span>Correct Answer: {quiz.correctAnswer}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {expandedQuizQuestions.has(index) ? (
                            <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          )}
                        </div>
                      </button>
                      
                      {expandedQuizQuestions.has(index) && (
                        <div className="p-6 border-t border-emerald-200 dark:border-emerald-700">
                          <div className="mb-4">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {quiz.question}
                            </h4>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Answer Options:</div>
                            {quiz.options.map((option, optIndex) => (
                              <div 
                                key={optIndex}
                                className={`p-3 rounded-lg border-2 ${
                                  option.optionLetter === quiz.correctAnswer
                                    ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-600'
                                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mr-3 ${
                                      option.optionLetter === quiz.correctAnswer
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                    }`}>
                                      {option.optionLetter}
                                    </div>
                                    <span className="text-gray-900 dark:text-gray-100 text-sm">
                                      {option.optionText}
                                    </span>
                                  </div>
                                  {option.optionLetter === quiz.correctAnswer && (
                                    <div className="flex items-center text-emerald-600 dark:text-emerald-400">
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      <span className="text-xs font-medium">Correct</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Expand/Collapse All */}
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => {
                      if (expandedQuizQuestions.size === courseContent.lectureQuiz.length) {
                        setExpandedQuizQuestions(new Set());
                      } else {
                        setExpandedQuizQuestions(new Set(courseContent.lectureQuiz.map((_, index) => index)));
                      }
                    }}
                    className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    {expandedQuizQuestions.size === courseContent.lectureQuiz.length ? 'Collapse All' : 'Expand All'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Quiz Available</h3>
                <p className="text-gray-600 dark:text-gray-400">This course doesn't have a quiz section yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseContent;
