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
    TrendingUp,
    GraduationCap,
    Target,
    Calendar,
    Clock4,
    Percent,
    CheckCircle,
    Crown,
    Zap,
    Globe,
    Video,
    Headphones,
    FileCode,
    Brain,
    Rocket
} from 'lucide-react';
import VideoCourseExplainerSimple from '../components/VideoCourseExplainerSimple';
import ChatBox from '../components/video-explainer/ChatBox';

// Transform API response to LinkedIn-style course structure
// New API: https://localhost:7043/api/Learning/course/{courseId}/lecture-sections
// Returns array of: { id, sectionType, content, sectionOrder, lectureId }
const transformApiResponse = (apiData, courseId = 1) => {
    if (!apiData || !Array.isArray(apiData) || apiData.length === 0) return null;

    // Map section types to readable titles
    const sectionTypeToTitle = {
        'introduction': 'Introduction',
        'mainTopicEarly': 'Foundational Concepts',
        'mainTopicMid': 'Core Topics',
        'mainTopicAdvanced': 'Advanced Topics',
        'facts': 'Key Facts & Data',
        'summary': 'Summary',
        'conclusion': 'Conclusion'
    };

    // Clean HTML content to slide format
    const cleanHtmlContent = (htmlContent) => {
        if (!htmlContent) return '';
        
        let text = htmlContent;
        // Extract h2 title if present
        const h2Match = text.match(/<h2>(.*?)<\/h2>/i);
        const slideTitle = h2Match ? h2Match[1] : '';
        
        // Clean HTML tags
        text = text.replace(/<section>/gi, '');
        text = text.replace(/<\/section>/gi, '');
        text = text.replace(/<h2>.*?<\/h2>/gi, '');
        text = text.replace(/<h3>(.*?)<\/h3>/gi, '\n\n$1\n');
        text = text.replace(/<\/p>/gi, '\n\n');
        text = text.replace(/<\/li>/gi, '\n');
        text = text.replace(/<ul>/gi, '\n');
        text = text.replace(/<\/ul>/gi, '\n');
        text = text.replace(/<ol>/gi, '\n');
        text = text.replace(/<\/ol>/gi, '\n');
        text = text.replace(/<li>/gi, '• ');
        text = text.replace(/<strong>(.*?)<\/strong>/gi, '$1');
        text = text.replace(/<em>(.*?)<\/em>/gi, '$1');
        text = text.replace(/<[^>]+>/g, '');
        text = text.replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"');
        text = text.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        return { title: slideTitle, content: text.trim() };
    };

    // Group sections by lectureId
    const lectureGroups = apiData.reduce((acc, section) => {
        const lectureId = section.lectureId;
        if (!acc[lectureId]) {
            acc[lectureId] = [];
        }
        acc[lectureId].push(section);
        return acc;
    }, {});

    // Process each lecture's sections into slide format
    const processLectureSections = (sections) => {
        // Sort by sectionOrder
        const sortedSections = [...sections].sort((a, b) => a.sectionOrder - b.sectionOrder);
        
        let text = '';
        sortedSections.forEach(section => {
            const { title, content } = cleanHtmlContent(section.content);
            const sectionTitle = title || sectionTypeToTitle[section.sectionType] || section.sectionType;
            text += `\n[SLIDE]: ${sectionTitle}\n`;
            text += content + '\n';
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

    // Transform lectures from grouped sections
    const lectureIds = Object.keys(lectureGroups);
    const transformedLectures = lectureIds.map((lectureId, index) => {
        const sections = lectureGroups[lectureId];
        const firstSection = sections[0];
        const allContent = sections.map(s => s.content).join(' ');
        
        // Try to extract lecture title from first section's h2
        const h2Match = firstSection.content?.match(/<h2>(.*?)<\/h2>/i);
        const lectureTitle = h2Match ? h2Match[1] : `Lecture ${index + 1}`;
        
        return {
            id: `lecture-${lectureId}`,
            title: lectureTitle,
            duration: estimateDuration(allContent),
            completed: false,
            content: processLectureSections(sections),
            lectureNumber: index + 1,
            hasVideo: Math.random() > 0.3,
            hasResources: Math.random() > 0.5,
            hasQuiz: Math.random() > 0.6,
            icon: [Video, Headphones, FileCode, Brain][index % 4],
            studentCount: Math.floor(Math.random() * 1000) + 50
        };
    });

    // Calculate total duration
    const totalMinutes = transformedLectures.reduce((acc, l) => {
        const mins = parseInt(l.duration) || 5;
        return acc + mins;
    }, 0);

    // Create chapter structure
    const chapters = [{
        id: `chapter-course-${courseId}`,
        title: 'Course Content',
        duration: `${totalMinutes}m`,
        lectures: transformedLectures,
        project: true,
        certificate: true
    }];

    return {
        id: `course-${courseId}`,
        title: transformedLectures[0]?.title || 'Course',
        courseCode: `COURSE-${courseId}`,
        instructor: 'Instructor',
        instructorTitle: 'Course Instructor',
        duration: `${totalMinutes}m`,
        level: 'Professional',
        description: 'Course content loaded from lecture sections',
        chapters,
        rating: 4.8,
        reviews: 892,
        students: 23456,
        lastUpdated: '1 month ago',
        language: 'English',
        category: 'Education',
        difficulty: 'Intermediate',
        includes: [
            '10 hours on-demand video',
            '8 articles',
            '12 downloadable resources',
            'Certificate of completion',
            'Lifetime access'
        ],
        instructorImage: `https://ui-avatars.com/api/?name=Instructor&background=6366f1&color=fff`,
        badges: ['Popular', 'Highest Rated'],
        achievements: [
            { name: 'Fast Track', icon: Rocket, color: 'text-blue-400' },
            { name: 'Consistent Learner', icon: Clock4, color: 'text-indigo-400' },
            { name: 'Top Performer', icon: Award, color: 'text-orange-400' }
        ]
    };
};

const LinkedInStyleDemo = () => {
    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [expandedChapters, setExpandedChapters] = useState(new Set());
    const [completedLectures, setCompletedLectures] = useState(new Set());
    const [showSidebar, setShowSidebar] = useState(false);
    const [activeTab, setActiveTab] = useState('content');
    const [isLargeScreen, setIsLargeScreen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

    // Handle screen resize for responsive sidebar
    useEffect(() => {
        const handleResize = () => {
            setIsLargeScreen(window.innerWidth >= 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [notes, setNotes] = useState('');
    const [showNotes, setShowNotes] = useState(false);
    const [bookmarkedLectures, setBookmarkedLectures] = useState(new Set());
    const [showChatBox, setShowChatBox] = useState(true);

    // Fetch course data from API
    useEffect(() => {
        fetchCourseData();
    }, []);

    const fetchCourseData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('https://localhost:7043/api/Learning/course/1/lecture-sections');
            
            if (!response.ok) {
                throw new Error('Failed to fetch course data');
            }
            
            const apiData = await response.json();
            const transformedData = transformApiResponse(apiData);
            
            if (transformedData && transformedData.chapters.length > 0) {
                setCourseData(transformedData);
                setSelectedLecture(transformedData.chapters[0].lectures[0]);
                setExpandedChapters(new Set([transformedData.chapters[0].id]));
                
                // Initialize some completed lectures for demo
                const initialCompleted = new Set();
                if (transformedData.chapters[0].lectures.length > 2) {
                    initialCompleted.add(transformedData.chapters[0].lectures[0].id);
                    initialCompleted.add(transformedData.chapters[0].lectures[1].id);
                }
                setCompletedLectures(initialCompleted);
            }
        } catch (err) {
            console.error('Error fetching course data:', err);
            setError(err.message);
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

    const toggleBookmark = (lectureId) => {
        setBookmarkedLectures(prev => {
            const newSet = new Set(prev);
            newSet.has(lectureId) ? newSet.delete(lectureId) : newSet.add(lectureId);
            return newSet;
        });
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-950 flex flex-col">
            {/* Top Navigation Bar */}
            <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className="lg:hidden w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
                    >
                        {showSidebar ? <X className="w-5 h-5 text-gray-700 dark:text-white" /> : <Menu className="w-5 h-5 text-gray-700 dark:text-white" />}
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-gray-900 dark:text-white font-semibold text-sm line-clamp-1">{courseData.title}</h1>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600 dark:text-gray-400 text-xs">{courseData.instructor}</span>
                                <span className="text-gray-400 dark:text-gray-500">•</span>
                                <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                                    {courseData.level}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                        <Home className="w-4 h-4" />
                        <span className="text-sm font-medium">Overview</span>
                    </button>
                    <button className="flex items-center gap-2 text-blue-500 dark:text-blue-400">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm font-medium">Content</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">Community</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                        <Award className="w-4 h-4" />
                        <span className="text-sm font-medium">Certificates</span>
                    </button>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4">
                    <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
                        <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors relative">
                        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <div className="hidden md:flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-gray-900 dark:text-white text-sm font-medium">{getProgress()}% Complete</p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">{completedLectures.size} of {getTotalLectures()} lectures</p>
                        </div>
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 flex items-center justify-center">
                                <span className="text-white text-sm font-bold">{getProgress()}%</span>
                            </div>
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white border-r-white animate-spin"></div>
                        </div>
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
                    {/* Course Info Bar */}
                    <div className="px-6 py-3 bg-white dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                        <span className="text-gray-900 dark:text-white font-semibold">{courseData.rating}</span>
                                    </div>
                                    <span className="text-gray-500 dark:text-gray-400 text-sm">({courseData.reviews} reviews)</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                    <Users className="w-4 h-4" />
                                    <span className="text-sm">{courseData.students.toLocaleString()} students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {courseData.badges.map((badge, index) => (
                                        <span key={index} className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-full">
                                            {badge}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                    <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Share</span>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                    <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Resources</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Lecture Header */}
                    <div className="px-6 py-4 bg-white dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-800">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-blue-500 dark:text-blue-400 text-sm font-medium px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                                        {courseData.chapters.find(ch => ch.lectures.some(l => l.id === selectedLecture.id))?.title}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400 text-sm">•</span>
                                    <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {selectedLecture.duration}
                                    </span>
                                    {selectedLecture.hasVideo && (
                                        <>
                                            <span className="text-gray-500 dark:text-gray-400 text-sm">•</span>
                                            <span className="text-purple-600 dark:text-purple-400 text-sm flex items-center gap-1">
                                                <Video className="w-4 h-4" />
                                                Video
                                            </span>
                                        </>
                                    )}
                                </div>
                                <h2 className="text-gray-900 dark:text-white text-xl font-bold mb-2">{selectedLecture.title}</h2>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    Lecture {selectedLecture.lectureNumber} • {selectedLecture.studentCount.toLocaleString()} students viewed
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => toggleBookmark(selectedLecture.id)}
                                    className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <Bookmark className={`w-5 h-5 ${bookmarkedLectures.has(selectedLecture.id) ? 'text-blue-500 fill-blue-500' : 'text-gray-500 dark:text-gray-400'}`} />
                                </button>
                                {!completedLectures.has(selectedLecture.id) ? (
                                    <button
                                        onClick={() => markAsComplete(selectedLecture.id)}
                                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                                    >
                                        Mark Complete
                                    </button>
                                ) : (
                                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <CheckCircle2 className="w-5 h-5" />
                                        Completed
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Lecture Tabs */}
                        <div className="flex items-center gap-6 mt-4 border-b border-gray-200 dark:border-slate-800">
                            <button
                                onClick={() => setActiveTab('content')}
                                className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'content' ? 'text-blue-500 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'}`}
                            >
                                Content
                            </button>
                            <button
                                onClick={() => setActiveTab('resources')}
                                className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'resources' ? 'text-blue-500 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'}`}
                            >
                                Resources
                            </button>
                            <button
                                onClick={() => setActiveTab('discussion')}
                                className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'discussion' ? 'text-blue-500 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'}`}
                            >
                                Discussion
                            </button>
                            <button
                                onClick={() => setShowNotes(!showNotes)}
                                className={`pb-3 text-sm font-medium transition-colors ${showNotes ? 'text-blue-500 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'}`}
                            >
                                Notes
                            </button>
                            {selectedLecture.hasQuiz && (
                                <button
                                    onClick={() => setActiveTab('quiz')}
                                    className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'quiz' ? 'text-blue-500 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'}`}
                                >
                                    Quiz
                                </button>
                            )}
                        </div>
                    </div>
                    {/* Video Player Area with Notes Sidebar */}
                    <div className="flex-1 flex overflow-hidden">
                        <div className={`${showNotes ? 'w-3/4' : 'w-full'} transition-all duration-300`}>
                            <VideoCourseExplainerSimple
                                lessonText={selectedLecture.content}
                                audios={[]}
                                diagrams={[]}
                                examples={[]}
                                assessments={[]}
                                courseId={courseData.id}
                            />
                        </div>
                        
                        {showNotes && (
                            <div className="w-1/4 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 p-4 overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-900 dark:text-white font-semibold">My Notes</h3>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString()}</span>
                                </div>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Take notes here... You can save important points, questions, or insights from this lecture."
                                    className="w-full h-64 p-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                />
                                <div className="flex items-center gap-2 mt-4">
                                    <button className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors">
                                        Save Note
                                    </button>
                                    <button className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition-colors">
                                        Clear
                                    </button>
                                </div>
                                <div className="mt-6">
                                    <h4 className="text-gray-700 dark:text-gray-300 font-medium text-sm mb-2">Lecture Resources</h4>
                                    <div className="space-y-2">
                                        <button className="w-full p-2 flex items-center gap-2 text-left hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                            <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Lecture Slides</span>
                                        </button>
                                        <button className="w-full p-2 flex items-center gap-2 text-left hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                            <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Code Examples</span>
                                        </button>
                                        <button className="w-full p-2 flex items-center gap-2 text-left hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                            <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Reading Materials</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Interactive Footer */}
                    <div className="px-6 py-3 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                                <ThumbsUp className="w-5 h-5" />
                                <span className="text-sm">Helpful</span>
                            </button>
                            <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                                <MessageSquare className="w-5 h-5" />
                                <span className="text-sm">Ask Question</span>
                            </button>
                            <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                                <HelpCircle className="w-5 h-5" />
                                <span className="text-sm">Need Help?</span>
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2 border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg text-gray-700 dark:text-gray-300 text-sm transition-colors">
                                Previous
                            </button>
                            <button 
                                onClick={() => handleLectureSelect(getNextLecture())}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium text-sm transition-all duration-300 shadow-md hover:shadow-lg"
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
                        className="hidden lg:flex items-center justify-center w-12 flex-shrink-0 border-l border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        title="Open Chat"
                    >
                        <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
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
                                        <span className="text-blue-500 dark:text-blue-400 text-sm font-bold">{getProgress()}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                                            style={{ width: `${getProgress()}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        <span>{completedLectures.size} completed</span>
                                        <span>{getTotalLectures() - completedLectures.size} remaining</span>
                                    </div>
                                </div>

                                {/* Achievements */}
                                <div className="flex items-center gap-2">
                                    {courseData.achievements.slice(0, 2).map((achievement, index) => {
                                        const Icon = achievement.icon;
                                        return (
                                            <div key={index} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg">
                                                <Icon className={`w-4 h-4 ${achievement.color}`} />
                                                <span className="text-xs text-gray-700 dark:text-gray-300">{achievement.name}</span>
                                            </div>
                                        );
                                    })}
                                    {courseData.achievements.length > 2 && (
                                        <div className="px-2.5 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg">
                                            <span className="text-xs text-gray-700 dark:text-gray-300">+{courseData.achievements.length - 2} more</span>
                                        </div>
                                    )}
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
                                                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
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

                            {/* Instructor Info */}
                            <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                                <div className="flex items-center gap-3 mb-3">
                                    <img 
                                        src={courseData.instructorImage} 
                                        alt={courseData.instructor}
                                        className="w-12 h-12 rounded-full"
                                    />
                                    <div>
                                        <h4 className="text-gray-900 dark:text-white font-medium text-sm">{courseData.instructor}</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-xs">{courseData.instructorTitle}</p>
                                    </div>
                                </div>
                                <button className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                                    <Play className="w-4 h-4" />
                                    {getNextLecture() ? 'Continue Learning' : 'Course Complete!'}
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