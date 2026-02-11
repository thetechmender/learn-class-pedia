import React, { useState, useEffect, useCallback } from 'react';
import { 
    Play,
    CheckCircle2,
    Circle,
    ChevronDown,
    ChevronRight,
    Clock,
    BookOpen,
    Award,
    BarChart3,
    Menu,
    X,
    AlertCircle,
    RefreshCw,
    Star,
    Users,
    FileText,
    Download,
    Share2,
    Bookmark,
    MessageSquare,
    ThumbsUp,
    HelpCircle,
    Bell,
    Search,
    Home,
    GraduationCap,
    Video
} from 'lucide-react';
import VideoCourseExplainerSimple from '../components/VideoCourseExplainerSimple';
import ChatBox from '../components/video-explainer/ChatBox';
import { transformApiResponse } from '../utils/courseTransformer';
import { 
    getCourseDetails, 
    getLectureSections, 
    getStudentProgress,
    markLectureComplete,
    toggleLectureBookmark,
    saveLectureNotes,
    updateLectureWatch
} from '../services/learningApi';

// Default IDs for development/testing (overridden by authenticated props)
const DEFAULT_STUDENT_ID = 1;
const DEFAULT_COURSE_ID = 15;

const parseDurationToSeconds = (duration) => {
    if (!duration) return 0;
    const hoursMatch = duration.match(/(\d+)\s*h/);
    const minutesMatch = duration.match(/(\d+)\s*m/);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    return (hours * 60 + minutes) * 60;
};

/**
 * LinkedInStyleDemo - Main classroom component
 * 
 * @param {number} authenticatedStudentId - Student ID from authenticated session (optional)
 * @param {number} authenticatedCourseId - Course ID from authenticated session (optional)
 * @param {string} initialLectureId - Lecture ID to start with (optional)
 */
const LinkedInStyleDemo = ({ 
    authenticatedStudentId, 
    authenticatedCourseId, 
    initialLectureId 
}) => {
    // Parse URL parameters for courseId
    const urlParams = new URLSearchParams(window.location.search);
    const urlCourseId = urlParams.get('courseId');
    
    // Use authenticated IDs if provided, then URL params, otherwise fall back to defaults
    const STUDENT_ID = authenticatedStudentId || DEFAULT_STUDENT_ID;
    const COURSE_ID = authenticatedCourseId || (urlCourseId ? parseInt(urlCourseId, 10) : DEFAULT_COURSE_ID);

    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [expandedChapters, setExpandedChapters] = useState(new Set());
    const [completedLectures, setCompletedLectures] = useState(new Set());
    const [showSidebar, setShowSidebar] = useState(false);
    const [isLargeScreen, setIsLargeScreen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

    // Handle screen resize for responsive sidebar
    useEffect(() => {
        const handleResize = () => {
            setIsLargeScreen(window.innerWidth >= 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [lectureNotes, setLectureNotes] = useState({});
    const [bookmarkedLectures, setBookmarkedLectures] = useState(new Set());
    const [showChatBox, setShowChatBox] = useState(false);

    // Fetch course data from API
    const fetchCourseData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch course details, lecture sections, and student progress in parallel
            const [courseDetails, lectureSections, studentProgress] = await Promise.all([
                getCourseDetails(COURSE_ID).catch(() => null),
                getLectureSections(COURSE_ID),
                getStudentProgress(STUDENT_ID, COURSE_ID).catch(() => null)
            ]);
            
            const transformedData = transformApiResponse(lectureSections, courseDetails);
            
            if (transformedData && transformedData.chapters.length > 0) {
                setCourseData(transformedData);
                
                // Set initial lecture - priority: prop > last accessed > first lecture
                const targetLectureId = initialLectureId || studentProgress?.lastAccessedLectureId;
                let lectureToSelect = transformedData.chapters[0].lectures[0];
                let chapterToExpand = transformedData.chapters[0].id;
                
                if (targetLectureId) {
                    for (const chapter of transformedData.chapters) {
                        const found = chapter.lectures.find(l => l.id === targetLectureId || l.id === String(targetLectureId));
                        if (found) {
                            lectureToSelect = found;
                            chapterToExpand = chapter.id;
                            break;
                        }
                    }
                }
                
                setSelectedLecture(lectureToSelect);
                setExpandedChapters(new Set([chapterToExpand]));
                
                // Set completed lectures from API
                if (studentProgress?.completedLectureIds) {
                    setCompletedLectures(new Set(studentProgress.completedLectureIds.map(String)));
                }
                
                // Set bookmarked lectures from API
                if (studentProgress?.bookmarkedLectureIds) {
                    setBookmarkedLectures(new Set(studentProgress.bookmarkedLectureIds.map(String)));
                }
                
                // Set notes from API
                if (studentProgress?.notes) {
                    setLectureNotes(studentProgress.notes);
                }
            }
        } catch (err) {
            console.error('Error fetching course data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [STUDENT_ID, COURSE_ID, initialLectureId]);

    useEffect(() => {
        fetchCourseData();
    }, [fetchCourseData]);

    const toggleChapter = (chapterId) => {
        setExpandedChapters(prev => {
            const newSet = new Set(prev);
            newSet.has(chapterId) ? newSet.delete(chapterId) : newSet.add(chapterId);
            return newSet;
        });
    };

    const handleLectureSelect = (lecture) => {
        setSelectedLecture(lecture);
    };

    const markAsComplete = async (lectureId) => {
        try {
            await markLectureComplete(STUDENT_ID, lectureId);
            setCompletedLectures(prev => new Set([...prev, String(lectureId)]));
        } catch (err) {
            console.error('Error marking lecture complete:', err);
        }
    };

    const handleWatchProgress = useCallback(async ({ deltaSeconds, durationSeconds, positionSeconds }) => {
        if (!selectedLecture?.id) return;
        try {
            await updateLectureWatch(STUDENT_ID, selectedLecture.id, {
                deltaSeconds,
                durationSeconds,
                positionSeconds
            });
        } catch (err) {
            console.error('Error updating lecture watch progress:', err);
        }
    }, [selectedLecture]);

    const toggleBookmark = async (lectureId) => {
        try {
            const result = await toggleLectureBookmark(STUDENT_ID, lectureId);
            setBookmarkedLectures(prev => {
                const newSet = new Set(prev);
                if (result.isBookmarked) {
                    newSet.add(String(lectureId));
                } else {
                    newSet.delete(String(lectureId));
                }
                return newSet;
            });
        } catch (err) {
            console.error('Error toggling bookmark:', err);
        }
    };

    const getProgress = () => {
        if (!courseData) return 0;
        const totalLectures = courseData.chapters.reduce((acc, ch) => acc + ch.lectures.length, 0);
        return totalLectures > 0 ? Math.round((completedLectures.size / totalLectures) * 100) : 0;
    };

    const getNextLecture = () => {
        if (!courseData) return null;
        for (const chapter of courseData.chapters) {
            for (const lecture of chapter.lectures) {
                if (!completedLectures.has(lecture.id)) {
                    return lecture;
                }
            }
        }
        return null;
    };

    const getTotalLectures = () => {
        if (!courseData) return 0;
        return courseData.chapters.reduce((acc, ch) => acc + ch.lectures.length, 0);
    };

    const getTotalDuration = () => {
        if (!courseData) return '0h';
        let totalMinutes = 0;
        courseData.chapters.forEach(chapter => {
            chapter.lectures.forEach(lecture => {
                const mins = parseInt(lecture.duration) || 5;
                totalMinutes += mins;
            });
        });
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin mx-auto mb-4"></div>
                        <GraduationCap className="w-10 h-10 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-gray-800 dark:text-white text-lg font-medium mt-4">Loading your course...</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">Preparing the learning environment</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !courseData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
                <div className="text-center max-w-md px-6">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
                    </div>
                    <h2 className="text-gray-800 dark:text-white text-xl font-bold mb-2">Connection Issue</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">We're having trouble loading the course content. Please check your connection and try again.</p>
                    <button
                        onClick={fetchCourseData}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!courseData || !selectedLecture) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
            {/* Top Navigation Bar */}
            <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {showSidebar ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-800">Classpedia</span>
                    </div>
                </div>

                {/* Right Side - Progress */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2">
                        <Search className="w-5 h-5 text-gray-400" />
                        <Bell className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">{getProgress()}% Complete</span>
                        <span className="text-xs text-gray-500">{completedLectures.size} of {getTotalLectures()} lectures</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                        DA
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {showSidebar && !isLargeScreen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
                    onClick={() => setShowSidebar(false)} 
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Video/Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Lecture Header - Classpedia Style */}
                    <div className="px-4 py-3 bg-white border-b border-gray-200">
                        {/* Top row - Rating, Duration, Tabs */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="text-gray-800 font-semibold text-sm">{courseData.rating}</span>
                                    <span className="text-gray-400 text-sm">({courseData.reviews} reviews)</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-500 text-sm">
                                    <Clock className="w-4 h-4" />
                                    <span>{selectedLecture.duration}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-500 text-sm">
                                    <span>•</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                                        <Video className="w-4 h-4" />
                                        Video
                                    </button>
                                    <button className="flex items-center gap-1 px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-full text-sm">
                                        <FileText className="w-4 h-4" />
                                        PDF
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => toggleBookmark(selectedLecture.id)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <Bookmark className={`w-5 h-5 ${bookmarkedLectures.has(selectedLecture.id) ? 'text-accent fill-accent' : 'text-gray-400'}`} />
                                </button>
                                {!completedLectures.has(selectedLecture.id) ? (
                                    <button
                                        onClick={() => markAsComplete(selectedLecture.id)}
                                        className="px-4 py-1.5 bg-accent hover:bg-accent/90 text-white rounded-full text-sm font-medium transition-colors"
                                    >
                                        Mark Complete
                                    </button>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-accent text-sm font-medium px-3 py-1.5 bg-accent/10 rounded-full border border-accent/30">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Completed
                                    </span>
                                )}
                            </div>
                        </div>
                        {/* Title row */}
                        <h2 className="text-gray-800 text-lg font-bold mb-1">{selectedLecture.title}</h2>
                        <p className="text-gray-500 text-sm">
                            Lecture {selectedLecture.lectureNumber} • {selectedLecture.studentCount.toLocaleString()} students viewed
                        </p>
                    </div>

                    {/* Video Player Area */}
                    <div className="flex-1 flex overflow-hidden">
                        <div className="w-full">
                            <VideoCourseExplainerSimple
                                lessonText={selectedLecture.content}
                                audios={[]}
                                courseId={courseData.id}
                                lectureId={selectedLecture.id}
                                durationSeconds={parseDurationToSeconds(selectedLecture.duration)}
                                onWatchProgress={handleWatchProgress}
                            />
                        </div>
                    </div>

                    {/* Interactive Footer - Classpedia Style */}
                    <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
                        {/* Left side - Action buttons */}
                        <div className="flex items-center gap-4">
                            <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm transition-colors">
                                <ThumbsUp className="w-4 h-4" />
                                Helpful
                            </button>
                            <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm transition-colors">
                                <MessageSquare className="w-4 h-4" />
                                Ask Question
                            </button>
                            <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm transition-colors">
                                <HelpCircle className="w-4 h-4" />
                                Need Help?
                            </button>
                        </div>
                        {/* Right side - Navigation buttons */}
                        <div className="flex items-center gap-3">
                            <button className="px-5 py-2 border border-gray-300 hover:bg-gray-50 rounded-full text-gray-700 text-sm font-medium transition-colors">
                                Previous
                            </button>
                            <button 
                                onClick={() => handleLectureSelect(getNextLecture())}
                                className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium transition-colors"
                            >
                                Next Lesson
                            </button>
                        </div>
                    </div>
                </div>

                {/* ChatBox Panel - RIGHT SIDE - Fixed on desktop */}
                {showChatBox && (
                    <div className="hidden lg:block w-80 flex-shrink-0 border-l border-gray-200 dark:border-slate-800 bg-white relative">
                        <ChatBox 
                            isOpen={showChatBox}
                            onToggle={() => setShowChatBox(!showChatBox)}
                            courseId={courseData.id}
                            isEmbedded={true}
                        />
                    </div>
                )}
                {!showChatBox && (
                    <button 
                        onClick={() => setShowChatBox(true)}
                        className="hidden lg:flex items-center gap-2 px-4 py-2 flex-shrink-0 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-l-xl shadow-lg hover:shadow-xl transition-all duration-300 fixed right-0 top-1/2 -translate-y-1/2 z-30"
                        title="Start Chat"
                    >
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-sm font-medium">Start Chat</span>
                    </button>
                )}

                {/* Course Outline Sidebar - LEFT SIDE - Mobile overlay, Desktop always visible */}
                <div className={`
                    ${showSidebar || isLargeScreen ? 'translate-x-0' : '-translate-x-full'}
                    fixed lg:relative left-0 top-0 h-full lg:h-auto
                    w-[85vw] sm:w-72 lg:w-72
                    transition-all duration-300 ease-in-out
                    bg-white dark:bg-slate-900
                    border-r border-gray-200 dark:border-slate-800
                    flex flex-col overflow-hidden flex-shrink-0
                    shadow-lg lg:shadow-none
                    z-50 lg:z-auto
                    order-first
                `}>
                    {(showSidebar || isLargeScreen) && (
                        <>
                            {/* Sidebar Header */}
                            <div className="p-5 border-b border-gray-200 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-900 dark:text-white font-semibold text-lg">Course Content</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                            <BarChart3 className="w-4 h-4" />
                                            <span>{getTotalDuration()} total</span>
                                        </div>
                                        <button 
                                            onClick={() => setShowSidebar(false)}
                                            className="lg:hidden p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Progress Overview */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Your Progress</span>
                                        <span className="text-accent text-sm font-bold">{getProgress()}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-accent transition-all duration-500"
                                            style={{ width: `${getProgress()}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        <span>{completedLectures.size} completed</span>
                                        <span>{getTotalLectures() - completedLectures.size} remaining</span>
                                    </div>
                                </div>
                            </div>

                            {/* Chapter List */}
                            <div className="flex-1 overflow-y-auto">
                                {courseData.chapters.map((chapter, chapterIndex) => {
                                    const chapterCompleted = chapter.lectures.every(l => completedLectures.has(l.id));
                                    const chapterProgress = chapter.lectures.filter(l => completedLectures.has(l.id)).length;
                                    
                                    return (
                                        <div key={chapter.id} className="border-b border-gray-200 dark:border-slate-800">
                                            {/* Chapter Header */}
                                            <button
                                                onClick={() => toggleChapter(chapter.id)}
                                                className="w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                                            >
                                                <div className="mt-0.5">
                                                    {expandedChapters.has(chapter.id) ? (
                                                        <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-2">
                                                            {chapterCompleted ? (
                                                                <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                                                            ) : (
                                                                <Circle className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                                            )}
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">Chapter {chapterIndex + 1}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {chapter.project && (
                                                                <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
                                                                    Project
                                                                </span>
                                                            )}
                                                            {chapter.certificate && (
                                                                <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                                                                    Certificate
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <h4 className="text-gray-900 dark:text-white font-medium text-sm line-clamp-2">{chapter.title}</h4>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden mr-3">
                                                            <div 
                                                                className="h-full bg-accent transition-all"
                                                                style={{ width: `${(chapterProgress / chapter.lectures.length) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">{chapterProgress}/{chapter.lectures.length}</span>
                                                    </div>
                                                </div>
                                            </button>

                                            {/* Lectures List */}
                                            {expandedChapters.has(chapter.id) && (
                                                <div className="pb-2">
                                                    {chapter.lectures.map((lecture) => {
                                                        const isSelected = selectedLecture.id === lecture.id;
                                                        const isCompleted = completedLectures.has(lecture.id);
                                                        const isBookmarked = bookmarkedLectures.has(lecture.id);
                                                        const Icon = lecture.icon;
                                                        
                                                        return (
                                                            <div key={lecture.id} className="relative">
                                                                <button
                                                                    onClick={() => handleLectureSelect(lecture)}
                                                                    className={`w-full px-4 py-3 pl-12 flex items-center gap-3 transition-colors text-left ${
                                                                        isSelected 
                                                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                                                                            : 'hover:bg-gray-50 dark:hover:bg-slate-800/50 border-l-4 border-transparent'
                                                                    }`}
                                                                >
                                                                    <div className="absolute left-4">
                                                                        {isCompleted ? (
                                                                            <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
                                                                        ) : isSelected ? (
                                                                            <Play className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                                                                        ) : (
                                                                            <Circle className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center justify-between mb-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                                                                                <p className={`text-sm line-clamp-2 ${
                                                                                    isSelected ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-700 dark:text-gray-300'
                                                                                }`}>
                                                                                    {lecture.title}
                                                                                </p>
                                                                            </div>
                                                                            {isBookmarked && (
                                                                                <Bookmark className="w-4 h-4 text-blue-500 dark:text-blue-400 fill-current" />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="text-xs text-gray-500 dark:text-gray-400">{lecture.duration}</span>
                                                                            <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                                                                            <span className="text-xs text-gray-500 dark:text-gray-400">{lecture.studentCount.toLocaleString()} views</span>
                                                                            {lecture.hasQuiz && (
                                                                                <>
                                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                                                                                    <span className="text-xs px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
                                                                                        Quiz
                                                                                    </span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Course Complete Button */}
                            <div className="p-4 border-t border-gray-200">
                                <button 
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-accent/90 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Play className="w-4 h-4" />
                                    Course Complete!
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LinkedInStyleDemo;