import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, ChevronDown, PlayCircle, FileText, GraduationCap, BookMarked } from 'lucide-react';
import CourseHierarchyTeacher from '../components/CourseHierarchyTeacher';

const CourseHierarchy = () => {
    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedModules, setExpandedModules] = useState(new Set());
    const [expandedSubjects, setExpandedSubjects] = useState(new Set());
    const [showTeacher, setShowTeacher] = useState(false);

    useEffect(() => {
        fetchCourseData();
    }, []);

    const fetchCourseData = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://gptassistant.thetechmenders.com/api/CourseData/specific-hierarchy');
            
            if (!response.ok) {
                throw new Error('Failed to fetch course data');
            }
            
            const data = await response.json();
            setCourseData(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching course data:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleModule = (moduleId) => {
        setExpandedModules(prev => {
            const newSet = new Set(prev);
            if (newSet.has(moduleId)) {
                newSet.delete(moduleId);
            } else {
                newSet.add(moduleId);
            }
            return newSet;
        });
    };

    const toggleSubject = (subjectId) => {
        setExpandedSubjects(prev => {
            const newSet = new Set(prev);
            if (newSet.has(subjectId)) {
                newSet.delete(subjectId);
            } else {
                newSet.add(subjectId);
            }
            return newSet;
        });
    };

    const handleStartLearning = () => {
        setShowTeacher(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading course data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 max-w-md">
                    <h2 className="text-red-400 text-xl font-bold mb-2">Error Loading Course</h2>
                    <p className="text-white">{error}</p>
                    <button 
                        onClick={fetchCourseData}
                        className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!courseData) {
        return null;
    }

    const { courseName, courseCode, school, program, major, module } = courseData;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 pt-24">
            <div className="max-w-7xl mx-auto">
                {/* Course Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-6 shadow-2xl">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <GraduationCap className="w-8 h-8 text-white" />
                                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    {courseCode}
                                </span>
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-3">{courseName}</h1>
                            <div className="flex flex-wrap gap-4 text-white/90 mb-4">
                                <div className="flex items-center gap-2">
                                    <BookMarked className="w-5 h-5" />
                                    <span>{school}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5" />
                                    <span>{program}</span>
                                </div>
                                {major && (
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        <span>{major}</span>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleStartLearning}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                            >
                                <PlayCircle className="w-5 h-5" />
                                Start Learning
                            </button>
                        </div>
                    </div>
                </div>

                {/* Module Section */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                    <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            {expandedModules.has(module.id) ? (
                                <ChevronDown className="w-6 h-6 text-blue-400" />
                            ) : (
                                <ChevronRight className="w-6 h-6 text-blue-400" />
                            )}
                            <div className="text-left">
                                <div className="text-sm text-blue-400 font-medium mb-1">
                                    Module {module.moduleNumber}
                                </div>
                                <h2 className="text-2xl font-bold text-white">{module.moduleName}</h2>
                            </div>
                        </div>
                        <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium">
                            {module.subject.lectures.length} Lectures
                        </div>
                    </button>

                    {expandedModules.has(module.id) && (
                        <div className="border-t border-white/10">
                            {/* Subject Section */}
                            <div className="bg-white/5">
                                <button
                                    onClick={() => toggleSubject(module.subject.id)}
                                    className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {expandedSubjects.has(module.subject.id) ? (
                                            <ChevronDown className="w-5 h-5 text-purple-400" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-purple-400" />
                                        )}
                                        <div className="text-left">
                                            <div className="text-sm text-purple-400 font-medium mb-1">
                                                Subject {module.subject.subjectNumber}
                                            </div>
                                            <h3 className="text-xl font-semibold text-white">
                                                {module.subject.subjectName}
                                            </h3>
                                        </div>
                                    </div>
                                </button>

                                {expandedSubjects.has(module.subject.id) && (
                                    <div className="px-6 pb-4">
                                        {/* Lectures List */}
                                        <div className="space-y-2">
                                            {module.subject.lectures.map((lecture) => (
                                                <button
                                                    key={lecture.id}
                                                    onClick={handleStartLearning}
                                                    className="w-full bg-gradient-to-r from-slate-800/80 to-slate-900/80 hover:from-slate-700/80 hover:to-slate-800/80 rounded-lg p-4 flex items-center justify-between transition-all border border-white/10 hover:border-purple-500/50 group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-purple-500/20 p-3 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                                                            <PlayCircle className="w-6 h-6 text-purple-400" />
                                                        </div>
                                                        <div className="text-left">
                                                            <div className="text-sm text-purple-400 font-medium mb-1">
                                                                Lecture {lecture.lectureNumber}
                                                            </div>
                                                            <h4 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                                                                {lecture.lectureName}
                                                            </h4>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-purple-400 transition-colors" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Course Hierarchy Teacher Component */}
            {showTeacher && (
                <CourseHierarchyTeacher
                    courseData={courseData}
                    onClose={() => setShowTeacher(false)}
                />
            )}
        </div>
    );
};

export default CourseHierarchy;
