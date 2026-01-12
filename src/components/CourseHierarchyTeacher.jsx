import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, ChevronDown, PlayCircle, X, Menu } from 'lucide-react';
import VideoCourseExplainerSimple from './VideoCourseExplainerSimple';

const CourseHierarchyTeacher = ({ courseData, onClose }) => {
    const [expandedModules, setExpandedModules] = useState(new Set());
    const [expandedSubjects, setExpandedSubjects] = useState(new Set());
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [showTeaching, setShowTeaching] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);

    useEffect(() => {
        if (courseData && courseData.module) {
            setExpandedModules(new Set([courseData.module.id]));
            if (courseData.module.subject) {
                setExpandedSubjects(new Set([courseData.module.subject.id]));
            }
        }
    }, [courseData]);

    const toggleModule = (moduleId) => {
        setExpandedModules(prev => {
            const newSet = new Set(prev);
            newSet.has(moduleId) ? newSet.delete(moduleId) : newSet.add(moduleId);
            return newSet;
        });
    };

    const toggleSubject = (subjectId) => {
        setExpandedSubjects(prev => {
            const newSet = new Set(prev);
            newSet.has(subjectId) ? newSet.delete(subjectId) : newSet.add(subjectId);
            return newSet;
        });
    };

    const handleLectureClick = (lecture) => {
        setSelectedLecture(lecture);
        setShowTeaching(true);
    };

    const handleBackToList = () => {
        setShowTeaching(false);
        setSelectedLecture(null);
    };

    const processLectureContent = (lecture) => {
        if (!lecture?.lectureContent) {
            return `[SLIDE]: ${lecture?.lectureName || 'Introduction'}\nNo content available for this lecture.`;
        }

        const content = lecture.lectureContent;
        let text = '';

        const sections = [
            { key: 'introduction', title: 'Introduction' },
            { key: 'mainTopicEarly', title: 'Foundational Theories' },
            { key: 'mainTopicMid', title: 'Intermediate Applications' },
            { key: 'mainTopicAdvanced', title: 'Advanced Topics' },
            { key: 'facts', title: 'Case Studies and Data' },
            { key: 'summary', title: 'Summary' },
            { key: 'conclusion', title: 'Conclusion' }
        ];

        sections.forEach(section => {
            if (content[section.key]) {
                let sectionText = content[section.key];
                const h2Match = sectionText.match(/<h2>(.*?)<\/h2>/i);
                const slideTitle = h2Match ? h2Match[1] : section.title;

                text += `\n[SLIDE]: ${slideTitle}\n`;

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

        return text.trim();
    };

    if (!courseData) return null;

    const { courseName, courseCode, school, module } = courseData;

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex">
            {/* Sidebar */}
            <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-slate-900/50 backdrop-blur-xl border-r border-slate-700/50 flex flex-col`}>
                {showSidebar && (
                    <>
                        {/* Sidebar Header */}
                        <div className="p-5 border-b border-slate-700/50">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">Course Content</h3>
                                        <p className="text-xs text-slate-400">{courseCode}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                            <h4 className="text-white font-medium text-sm leading-relaxed">{courseName}</h4>
                            <p className="text-xs text-slate-500 mt-1">{school}</p>
                        </div>

                        {/* Sidebar Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {/* Module */}
                            <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
                                <button
                                    onClick={() => toggleModule(module.id)}
                                    className="w-full p-4 flex items-center gap-3 hover:bg-slate-700/30 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                        {expandedModules.has(module.id) ? (
                                            <ChevronDown className="w-4 h-4 text-blue-400" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-blue-400" />
                                        )}
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-xs text-blue-400 font-medium">Module {module.moduleNumber}</p>
                                        <p className="text-sm font-medium text-white mt-0.5">{module.moduleName}</p>
                                    </div>
                                </button>

                                {expandedModules.has(module.id) && (
                                    <div className="border-t border-slate-700/50 bg-slate-800/30">
                                        {/* Subject */}
                                        <button
                                            onClick={() => toggleSubject(module.subject.id)}
                                            className="w-full p-4 pl-6 flex items-center gap-3 hover:bg-slate-700/30 transition-colors"
                                        >
                                            <div className="w-6 h-6 rounded-md bg-purple-500/20 flex items-center justify-center">
                                                {expandedSubjects.has(module.subject.id) ? (
                                                    <ChevronDown className="w-3 h-3 text-purple-400" />
                                                ) : (
                                                    <ChevronRight className="w-3 h-3 text-purple-400" />
                                                )}
                                            </div>
                                            <div className="text-left flex-1">
                                                <p className="text-xs text-purple-400 font-medium">Subject {module.subject.subjectNumber}</p>
                                                <p className="text-sm font-medium text-white mt-0.5">{module.subject.subjectName}</p>
                                            </div>
                                        </button>

                                        {expandedSubjects.has(module.subject.id) && (
                                            <div className="p-3 pl-8 space-y-2">
                                                {module.subject.lectures.map((lecture) => (
                                                    <button
                                                        key={lecture.id}
                                                        onClick={() => handleLectureClick(lecture)}
                                                        className={`w-full rounded-xl p-4 flex items-center gap-4 transition-all ${
                                                            selectedLecture?.id === lecture.id
                                                                ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/40'
                                                                : 'bg-slate-800/50 border border-slate-700/30 hover:border-purple-500/30 hover:bg-slate-700/50'
                                                        }`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                            selectedLecture?.id === lecture.id
                                                                ? 'bg-purple-500'
                                                                : 'bg-slate-700'
                                                        }`}>
                                                            <PlayCircle className={`w-5 h-5 ${
                                                                selectedLecture?.id === lecture.id ? 'text-white' : 'text-slate-400'
                                                            }`} />
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <p className="text-xs text-slate-400">Lecture {lecture.lectureNumber}</p>
                                                            <p className="text-sm font-medium text-white mt-0.5 line-clamp-2">{lecture.lectureName}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {showTeaching && selectedLecture ? (
                    <>
                        {/* Header */}
                        <div className="h-16 px-6 flex items-center justify-between bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowSidebar(!showSidebar)}
                                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                                >
                                    <Menu className="w-5 h-5 text-slate-400" />
                                </button>
                                <div className="h-8 w-px bg-slate-700" />
                                <div>
                                    <p className="text-xs text-purple-400 font-medium">Lecture {selectedLecture.lectureNumber}</p>
                                    <h2 className="text-sm font-semibold text-white">{selectedLecture.lectureName}</h2>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleBackToList}
                                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm text-white transition-colors"
                                >
                                    Exit
                                </button>
                            </div>
                        </div>

                        {/* Video Content */}
                        <div className="flex-1 overflow-hidden">
                            <VideoCourseExplainerSimple
                                lessonText={processLectureContent(selectedLecture)}
                                audios={[]}
                                diagrams={[]}
                                examples={[]}
                                assessments={[]}
                                courseId={courseData.courseGenerationWithGptId}
                            />
                        </div>
                    </>
                ) : (
                    /* Welcome Screen */
                    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
                        <div className="text-center max-w-md px-8">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25">
                                <BookOpen className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">
                                Ready to Learn?
                            </h3>
                            <p className="text-slate-400 leading-relaxed">
                                Select a lecture from the sidebar to begin your learning journey. 
                                Each lecture includes interactive content and assessments.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseHierarchyTeacher;
