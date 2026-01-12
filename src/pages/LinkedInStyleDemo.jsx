import React, { useState, useEffect } from 'react';
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
    Loader2,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import VideoCourseExplainerSimple from '../components/VideoCourseExplainerSimple';

// Transform API response to LinkedIn-style course structure
const transformApiResponse = (apiData) => {
    if (!apiData) return null;

    const { courseName, courseCode, school, program, module, courseGenerationWithGptId } = apiData;

    // Process lecture content to slide format
    const processLectureContent = (lectureContent) => {
        if (!lectureContent) return '[SLIDE]: No content available\n\nContent for this lecture is not yet available.';

        const sections = [
            { key: 'introduction', title: 'Introduction' },
            { key: 'mainTopicEarly', title: 'Foundational Concepts' },
            { key: 'mainTopicMid', title: 'Core Topics' },
            { key: 'mainTopicAdvanced', title: 'Advanced Topics' },
            { key: 'facts', title: 'Key Facts & Data' },
            { key: 'summary', title: 'Summary' },
            { key: 'conclusion', title: 'Conclusion' }
        ];

        let text = '';
        sections.forEach(section => {
            if (lectureContent[section.key]) {
                let sectionText = lectureContent[section.key];
                const h2Match = sectionText.match(/<h2>(.*?)<\/h2>/i);
                const slideTitle = h2Match ? h2Match[1] : section.title;

                text += `\n[SLIDE]: ${slideTitle}\n`;

                // Clean HTML tags
                sectionText = sectionText.replace(/<section>/gi, '');
                sectionText = sectionText.replace(/<\/section>/gi, '');
                sectionText = sectionText.replace(/<h2>.*?<\/h2>/gi, '');
                sectionText = sectionText.replace(/<h3>(.*?)<\/h3>/gi, '\n\n$1\n');
                sectionText = sectionText.replace(/<\/p>/gi, '\n\n');
                sectionText = sectionText.replace(/<\/li>/gi, '\n');
                sectionText = sectionText.replace(/<ul>/gi, '\n');
                sectionText = sectionText.replace(/<\/ul>/gi, '\n');
                sectionText = sectionText.replace(/<ol>/gi, '\n');
                sectionText = sectionText.replace(/<\/ol>/gi, '\n');
                sectionText = sectionText.replace(/<li>/gi, '• ');
                sectionText = sectionText.replace(/<strong>(.*?)<\/strong>/gi, '$1');
                sectionText = sectionText.replace(/<em>(.*?)<\/em>/gi, '$1');
                sectionText = sectionText.replace(/<[^>]+>/g, '');
                sectionText = sectionText.replace(/&nbsp;/g, ' ')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"');
                sectionText = sectionText.replace(/\n\s*\n\s*\n/g, '\n\n');

                text += sectionText.trim() + '\n';
            }
        });

        return text.trim() || '[SLIDE]: Content\n\nNo content available for this section.';
    };

    // Estimate duration based on content length
    const estimateDuration = (content) => {
        if (!content) return '5m';
        const wordCount = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
        const minutes = Math.max(5, Math.ceil(wordCount / 150)); // ~150 words per minute
        return `${minutes}m`;
    };

    // Transform lectures
    const transformedLectures = module?.subject?.lectures?.map((lecture, index) => ({
        id: `lecture-${lecture.id}`,
        title: lecture.lectureName,
        duration: estimateDuration(JSON.stringify(lecture.lectureContent)),
        completed: false,
        content: processLectureContent(lecture.lectureContent),
        lectureNumber: lecture.lectureNumber
    })) || [];

    // Create chapter structure (grouping by subject)
    const chapters = [{
        id: `chapter-${module?.subject?.id || 'default'}`,
        title: module?.subject?.subjectName || 'Course Content',
        duration: transformedLectures.reduce((acc, l) => {
            const mins = parseInt(l.duration) || 5;
            return acc + mins;
        }, 0) + 'm',
        lectures: transformedLectures
    }];

    // If there's a module, wrap it as a higher-level chapter
    if (module?.moduleName) {
        return {
            id: courseGenerationWithGptId || 'course-1',
            title: courseName,
            courseCode: courseCode,
            instructor: school,
            instructorTitle: program,
            duration: chapters[0].duration,
            level: 'Professional',
            description: `${courseName} - ${module.moduleName}`,
            chapters: [{
                id: `module-${module.id}`,
                title: `${module.moduleName}`,
                duration: chapters[0].duration,
                lectures: transformedLectures
            }]
        };
    }

    return {
        id: courseGenerationWithGptId || 'course-1',
        title: courseName,
        courseCode: courseCode,
        instructor: school,
        instructorTitle: program,
        duration: chapters[0].duration,
        level: 'Professional',
        description: courseName,
        chapters
    };
};


const LinkedInStyleDemo = () => {
    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [expandedChapters, setExpandedChapters] = useState(new Set());
    const [completedLectures, setCompletedLectures] = useState(new Set());
    const [showSidebar, setShowSidebar] = useState(true);

    // Fetch course data from API
    useEffect(() => {
        fetchCourseData();
    }, []);

    const fetchCourseData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('https://gptassistant.thetechmenders.com/api/CourseData/specific-hierarchy');
            
            if (!response.ok) {
                throw new Error('Failed to fetch course data');
            }
            
            const apiData = await response.json();
            const transformedData = transformApiResponse(apiData);
            
            if (transformedData && transformedData.chapters.length > 0) {
                setCourseData(transformedData);
                // Set initial states
                setSelectedLecture(transformedData.chapters[0].lectures[0]);
                setExpandedChapters(new Set([transformedData.chapters[0].id]));
            } else {
                // Use fallback data if API returns empty
                // setCourseData(fallbackCourseData);
                // setSelectedLecture(fallbackCourseData.chapters[0].lectures[0]);
                // setExpandedChapters(new Set([fallbackCourseData.chapters[0].id]));
            }
        } catch (err) {
            console.error('Error fetching course data:', err);
            setError(err.message);
            // Use fallback data on error
            // setCourseData(fallbackCourseData);
            // setSelectedLecture(fallbackCourseData.chapters[0].lectures[0]);
            // setExpandedChapters(new Set([fallbackCourseData.chapters[0].id]));
        } finally {
            setLoading(false);
        }
    };

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

    const markAsComplete = (lectureId) => {
        setCompletedLectures(prev => new Set([...prev, lectureId]));
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

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg font-medium">Loading course content...</p>
                    <p className="text-slate-400 text-sm mt-2">Fetching from API</p>
                </div>
            </div>
        );
    }

    // Error state with fallback
    if (error && !courseData) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center max-w-md px-6">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-white text-xl font-bold mb-2">Failed to Load Course</h2>
                    <p className="text-slate-400 mb-6">{error}</p>
                    <button
                        onClick={fetchCourseData}
                        className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!courseData || !selectedLecture) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            {/* Top Navigation Bar */}
            <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className="lg:hidden w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
                    >
                        {showSidebar ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-white font-semibold text-sm line-clamp-1">{courseData.title}</h1>
                            <p className="text-slate-400 text-xs">{courseData.instructor}</p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-white text-sm font-medium">{getProgress()}% Complete</p>
                            <p className="text-slate-400 text-xs">{completedLectures.size} of {getTotalLectures()} lectures</p>
                        </div>
                        <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                                style={{ width: `${getProgress()}%` }}
                            />
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <Award className="w-5 h-5 text-white" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Video/Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Lecture Header */}
                    <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-400 text-sm font-medium mb-1">
                                    {courseData.chapters.find(ch => ch.lectures.some(l => l.id === selectedLecture.id))?.title}
                                </p>
                                <h2 className="text-white text-xl font-bold">{selectedLecture.title}</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-slate-400 text-sm flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {selectedLecture.duration}
                                </span>
                                {!completedLectures.has(selectedLecture.id) && (
                                    <button
                                        onClick={() => markAsComplete(selectedLecture.id)}
                                        className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Mark Complete
                                    </button>
                                )}
                                {completedLectures.has(selectedLecture.id) && (
                                    <span className="flex items-center gap-1 text-green-400 text-sm">
                                        <CheckCircle2 className="w-5 h-5" />
                                        Completed
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Video Player Area */}
                    <div className="flex-1 overflow-hidden">
                        <VideoCourseExplainerSimple
                            lessonText={selectedLecture.content}
                            audios={[]}
                            diagrams={[]}
                            examples={[]}
                            assessments={[]}
                            courseId={courseData.id}
                        />
                    </div>
                </div>

                {/* Course Outline Sidebar */}
                <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden flex-shrink-0`}>
                    {showSidebar && (
                        <>
                            {/* Sidebar Header */}
                            <div className="p-4 border-b border-slate-800">
                                <h3 className="text-white font-semibold mb-3">Course Content</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <BarChart3 className="w-4 h-4" />
                                    <span>{courseData.chapters.length} chapters</span>
                                    <span>•</span>
                                    <span>{courseData.duration} total</span>
                                </div>
                            </div>

                            {/* Chapter List */}
                            <div className="flex-1 overflow-y-auto">
                                {courseData.chapters.map((chapter, chapterIndex) => {
                                    const chapterCompleted = chapter.lectures.every(l => completedLectures.has(l.id));
                                    const chapterProgress = chapter.lectures.filter(l => completedLectures.has(l.id)).length;
                                    
                                    return (
                                        <div key={chapter.id} className="border-b border-slate-800">
                                            {/* Chapter Header */}
                                            <button
                                                onClick={() => toggleChapter(chapter.id)}
                                                className="w-full p-4 flex items-start gap-3 hover:bg-slate-800/50 transition-colors text-left"
                                            >
                                                <div className="mt-0.5">
                                                    {expandedChapters.has(chapter.id) ? (
                                                        <ChevronDown className="w-5 h-5 text-slate-400" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5 text-slate-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {chapterCompleted ? (
                                                            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                                                        ) : (
                                                            <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                                        )}
                                                        <span className="text-xs text-slate-500">Chapter {chapterIndex + 1}</span>
                                                    </div>
                                                    <h4 className="text-white font-medium text-sm line-clamp-2">{chapter.title}</h4>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-green-500 transition-all"
                                                                style={{ width: `${(chapterProgress / chapter.lectures.length) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-slate-500">{chapterProgress}/{chapter.lectures.length}</span>
                                                    </div>
                                                </div>
                                            </button>

                                            {/* Lectures List */}
                                            {expandedChapters.has(chapter.id) && (
                                                <div className="pb-2">
                                                    {chapter.lectures.map((lecture) => {
                                                        const isSelected = selectedLecture.id === lecture.id;
                                                        const isCompleted = completedLectures.has(lecture.id);
                                                        
                                                        return (
                                                            <button
                                                                key={lecture.id}
                                                                onClick={() => handleLectureSelect(lecture)}
                                                                className={`w-full px-4 py-3 pl-12 flex items-center gap-3 transition-colors text-left ${
                                                                    isSelected 
                                                                        ? 'bg-blue-500/20 border-l-2 border-blue-500' 
                                                                        : 'hover:bg-slate-800/50 border-l-2 border-transparent'
                                                                }`}
                                                            >
                                                                <div className="flex-shrink-0">
                                                                    {isCompleted ? (
                                                                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                                                                    ) : isSelected ? (
                                                                        <Play className="w-5 h-5 text-blue-400" />
                                                                    ) : (
                                                                        <Circle className="w-5 h-5 text-slate-600" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`text-sm line-clamp-2 ${
                                                                        isSelected ? 'text-white font-medium' : 'text-slate-300'
                                                                    }`}>
                                                                        {lecture.title}
                                                                    </p>
                                                                    <p className="text-xs text-slate-500 mt-0.5">{lecture.duration}</p>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Continue Learning Button */}
                            {getNextLecture() && (
                                <div className="p-4 border-t border-slate-800">
                                    <button
                                        onClick={() => handleLectureSelect(getNextLecture())}
                                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                                    >
                                        <Play className="w-4 h-4" />
                                        Continue Learning
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LinkedInStyleDemo;
