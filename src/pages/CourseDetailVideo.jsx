import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import VideoCourseExplainer from '../components/VideoCourseExplainer';
import { ArrowLeft, AlertCircle, RefreshCw, Loader2, Menu, X, PlayCircle, CheckCircle, ChevronDown, ChevronRight, Lock } from 'lucide-react';
import VideoCourseExplainerSimple from '../components/VideoCourseExplainerSimple';

export default function CourseDetailVideo() {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [currentLecture, setCurrentLecture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedModules, setExpandedModules] = useState({});

    useEffect(() => {
        loadContent();
    }, [id]);

    const loadContent = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiService.getCourseAiContent(parseInt(id));

            if (response && response.data) {
                setCourse(response.data);

                // Select first lecture of first module by default
                if (response.data.modules?.length > 0) {
                    const firstModule = response.data.modules[0];
                    setExpandedModules({ [firstModule.module_number]: true });

                    if (firstModule.subjects?.length > 0 && firstModule.subjects[0].lectures?.length > 0) {
                        setCurrentLecture(firstModule.subjects[0].lectures[0]);
                    }
                }
            } else {
                throw new Error("Invalid response format");
            }

        } catch (err) {
            console.error('Failed to load content:', err);
            setError('Failed to load course content. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLectureSelect = (lecture) => {
        setCurrentLecture(lecture);
        // On mobile, close sidebar after selection
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    const toggleModule = (moduleNumber) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleNumber]: !prev[moduleNumber]
        }));
    };

    const processContent = (lecture) => {
        if (!lecture?.content_requirements?.classroom_content_html) {
            // Fallback for missing content
            return `[SLIDE]: ${lecture?.lecture_name || 'Introduction'}\nNo content available for this lecture.`;
        }

        let text = lecture.content_requirements.classroom_content_html;

        // Convert HTML sections to Slides
        // Replace <section>...<h2>Title</h2>... with [SLIDE]: Title
        text = text.replace(/<section>[\s\S]*?<h2>(.*?)<\/h2>/gi, '\n[SLIDE]: $1\n');

        // Handle lists to ensure bullets are on new lines
        text = text.replace(/<\/li>/gi, '\n');
        text = text.replace(/<ul>/gi, '\n');
        text = text.replace(/<\/ul>/gi, '\n');

        // Replace paragraph breaks
        text = text.replace(/<\/p>/gi, '\n\n');

        // Strip remaining HTML tags
        text = text.replace(/<[^>]+>/g, '');

        // Clean up entities
        text = text.replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"');

        // Clean up excessive newlines
        text = text.replace(/\n\s*\n\s*\n/g, '\n\n');

        return text.trim();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-400">Loading course content...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
                <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Error Loading Content</h2>
                <p className="text-gray-400 mb-6 text-center">{error}</p>
                <div className="flex space-x-4">
                    <button
                        onClick={loadContent}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </button>
                    <Link
                        to={`/courses/${id}`}
                        className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Course Details
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-black overflow-hidden relative pt-16">

            {/* Sidebar - Playlist */}
            <div className={`fixed inset-y-0 left-0 z-[60] w-80 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:z-0 top-16 lg:top-0 h-[calc(100vh-4rem)] lg:h-full`}>
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white truncate pr-2" title={course?.metadata?.courseName}>
                            {course?.metadata?.courseName || 'Course Content'}
                        </h2>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                        {course?.modules?.map((module, mIdx) => (
                            <div key={mIdx} className="rounded-lg overflow-hidden bg-gray-800/50">
                                <button
                                    onClick={() => toggleModule(module.module_number)}
                                    className="w-full p-3 flex items-center justify-between text-left hover:bg-gray-800 transition-colors"
                                >
                                    <span className="text-sm font-semibold text-gray-300">Module {module.module_number}: {module.module_name}</span>
                                    {expandedModules[module.module_number] ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
                                </button>

                                {expandedModules[module.module_number] && (
                                    <div className="bg-gray-900/50 py-1">
                                        {module.subjects?.map((subject, sIdx) => (
                                            <div key={sIdx}>
                                                {subject.lectures?.map((lecture, lIdx) => {
                                                    const isActive = currentLecture?.id === lecture.id;
                                                    return (
                                                        <button
                                                            key={lIdx}
                                                            onClick={() => handleLectureSelect(lecture)}
                                                            className={`w-full flex items-start p-3 pl-6 hover:bg-white/5 transition-colors border-l-2 ${isActive ? 'border-blue-500 bg-white/5' : 'border-transparent'}`}
                                                        >
                                                            <div className={`mt-0.5 mr-3 flex-shrink-0`}>
                                                                {isActive ? (
                                                                    <PlayCircle className="h-4 w-4 text-blue-400" />
                                                                ) : (
                                                                    <div className="h-4 w-4 rounded-full border border-gray-600" />
                                                                )}
                                                            </div>
                                                            <div className="text-left">
                                                                <p className={`text-sm ${isActive ? 'text-blue-400 font-medium' : 'text-gray-400'}`}>
                                                                    {lecture.lecture_name}
                                                                </p>
                                                                <p className="text-xs text-gray-600 mt-0.5">15 min</p>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-gray-800">
                        <Link to={`/courses/${id}`} className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Course Details
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
                {/* Mobile Header */}
                <div className="lg:hidden p-4 bg-gray-900 border-b border-gray-800 flex items-center">
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white mr-4">
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="font-semibold text-white truncate">{currentLecture?.lecture_name || 'Select a Lecture'}</span>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    {currentLecture ? (
                        <div className="absolute inset-0">
                            {/* <VideoCourseExplainer
                                key={currentLecture.id} // Force reset on lecture change
                                lessonText={processContent(currentLecture)}
                                assessments={currentLecture?.content_requirements?.quiz?.map((q, i) => ({
                                    question: q.question,
                                    options: JSON.stringify(q.options),
                                    correctOptionIndex: q.options.indexOf(q.options.find(o => o.startsWith(q.answer) || o === q.answer)), // Auto-detect correct index
                                    explanation: `The correct answer is ${q.answer}`,
                                    difficulty: 'Medium'
                                })) || []}
                                audios={[]} // No audio chunks available yet
                            // If we had pre-generated video, we could potentially pass it, but Explainer works best with slides
                            /> */}

                            <VideoCourseExplainerSimple
                                key={currentLecture.id}
                                lessonText={processContent(currentLecture)}
                                assessments={currentLecture?.content_requirements?.quiz?.map((q, i) => ({
                                    question: q.question,
                                    options: JSON.stringify(q.options),
                                    correctOptionIndex: q.options.indexOf(q.options.find(o => o.startsWith(q.answer) || o === q.answer)),
                                    explanation: `The correct answer is ${q.answer}`,
                                    difficulty: 'Medium'
                                })) || []}
                                audios={[]}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <PlayCircle className="h-16 w-16 mb-4 opacity-50" />
                            <p className="text-lg">Select a lecture to start learning</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar toggle for desktop? No, generic layout usually keeps it open */}
        </div>
    );
}
