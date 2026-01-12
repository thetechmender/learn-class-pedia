import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';

import { Clock, Star, Play, ArrowLeft, AlertCircle, BookOpen, FileText, MonitorPlay, BarChart3, CheckCircle2, ChevronDown, ChevronRight, GraduationCap } from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getCourseHierarchy(parseInt(id));
      if (data && data.metadata) {
        setCourse({
          ...data.metadata,
          modules: data.modules,
          lecture_statistics: data.lecture_statistics,
          data: data
        });

        // Auto-expand first module
        if (data.modules && data.modules.length > 0) {
          setExpandedModules({ [data.modules[0].module_number]: true });
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error('Failed to load course from API:', err);
      setError('Failed to load course structure.');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleNumber) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleNumber]: !prev[moduleNumber]
    }));
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 font-medium">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-auto">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Course not found'}
          </h1>
          <p className="text-gray-500 mb-6">We couldn't locate the course you're looking for.</p>
          <Link
            to="/courses"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-primary-700 bg-primary-100 hover:bg-primary-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-900/40 to-transparent"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-600/30 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto">
          <Link
            to="/courses"
            className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3 group-hover:bg-primary-600 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="font-medium">Back to Courses</span>
          </Link>

          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-sm font-semibold backdrop-blur-sm">
                  {course.metadata?.school || 'School'}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-gray-300 text-sm font-medium backdrop-blur-sm">
                  {course.metadata?.program}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
                {course.metadata?.courseName}
              </h1>

              <p className="text-lg text-gray-400 mb-8 max-w-2xl leading-relaxed flex items-center gap-4">
                <span className="flex items-center bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                  {course.metadata?.courseCode}
                </span>
                {course.metadata?.major && (
                  <span className="flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-primary-400" />
                    {course.metadata.major}
                  </span>
                )}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to={`/course/${id}/video`}
                  className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-lg font-bold shadow-lg shadow-primary-900/30 transition-all hover:-translate-y-1 hover:shadow-primary-600/30 group"
                >
                  <MonitorPlay className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                  Start Video Mode
                </Link>

                <button className="inline-flex items-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-lg font-bold backdrop-blur-md border border-white/10 transition-all">
                  <BookOpen className="w-6 h-6 mr-3" />
                  View Syllabus
                </button>
              </div>
            </div>

            {/* Glass Stats Card */}
            {course.lecture_statistics && (
              <div className="w-full lg:w-auto min-w-[300px]">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl">
                  <h3 className="text-white font-semibold mb-6 flex items-center opacity-80">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Course Progress
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300">Completion</span>
                        <span className="text-primary-300 font-bold">{course.lecture_statistics.completion_percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full transition-all duration-1000"
                          style={{ width: `${course.lecture_statistics.completion_percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-900/40 rounded-xl p-4 border border-white/5">
                        <p className="text-3xl font-bold text-white mb-1">{course.lecture_statistics.total_lectures}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Total Lectures</p>
                      </div>
                      <div className="bg-gray-900/40 rounded-xl p-4 border border-white/5">
                        <p className="text-3xl font-bold text-green-400 mb-1">{course.lecture_statistics.created_lectures_count}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Ready to Watch</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Curriculum */}
          <div className="lg:col-span-2 space-y-6">

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <BookOpen className="h-6 w-6 mr-3 text-primary-600" />
                  Course Curriculum
                </h2>
                <span className="text-sm text-gray-500 font-medium">
                  {course.modules?.length} Modules
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {course.modules?.map((module) => (
                  <div key={module.module_number} className="bg-white group">
                    <button
                      onClick={() => toggleModule(module.module_number)}
                      className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                    >
                      <div>
                        <span className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1 block">
                          Module {module.module_number}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900">
                          {module.module_name}
                        </h3>
                      </div>
                      <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 transition-transform duration-300 ${expandedModules[module.module_number] ? 'rotate-180 bg-primary-100 text-primary-600' : ''}`}>
                        <ChevronDown className="h-5 w-5" />
                      </div>
                    </button>

                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedModules[module.module_number] ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="p-6 pt-0 bg-gray-50/50">
                        <div className="space-y-6 border-l-2 border-gray-200 ml-4 pl-6 pt-4">
                          {module.subjects?.map((subject) => (
                            <div key={subject.subject_number}>
                              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                                <span className="w-2 h-2 bg-gray-300 rounded-full -ml-[31px] mr-4 ring-4 ring-white"></span>
                                {subject.subject_name}
                              </h4>

                              <div className="space-y-3">
                                {subject.lectures?.map((lecture) => (
                                  <div key={lecture.id} className="relative bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all group/lecture">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm group-hover/lecture:bg-blue-600 group-hover/lecture:text-white transition-colors">
                                          {lecture.lecture_number}
                                        </div>
                                        <div>
                                          <p className="font-semibold text-gray-900 group-hover/lecture:text-primary-700 transition-colors">
                                            {lecture.lecture_name}
                                          </p>
                                          <p className="text-xs text-gray-500 mt-1">Video • 15 mins</p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        {lecture.video_path && (
                                          <a
                                            href={lecture.video_path}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Watch Video"
                                          >
                                            <Play className="h-5 w-5" />
                                          </a>
                                        )}
                                        {lecture.lecture_pdf_path && (
                                          <a
                                            href={lecture.lecture_pdf_path}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Download PDF"
                                          >
                                            <FileText className="h-5 w-5" />
                                          </a>
                                        )}
                                        <Link
                                          to={`/course/${id}/video`}
                                          className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-gray-900 rounded-lg hover:bg-primary-600 transition-colors shadow-sm ml-2"
                                        >
                                          Start
                                          <ChevronRight className="h-3 w-3" />
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-6">
            {/* Assessment Card */}
            {course.data?.course_final_assessment && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full -mr-16 -mt-16 blur-2xl opacity-50"></div>

                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center relative z-10">
                  <Star className="h-6 w-6 mr-3 text-amber-500 fill-amber-500" />
                  Final Assessment
                </h2>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div>
                      <p className="text-amber-900 font-bold">{course.data.course_final_assessment.type}</p>
                      <p className="text-amber-700 text-xs mt-1">Written Examination</p>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-600 font-bold text-2xl">{course.data.course_final_assessment.questions?.length || 0}</span>
                      <p className="text-amber-600/70 text-xs font-medium">Questions</p>
                    </div>
                  </div>

                  <button className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-all hover:-translate-y-0.5">
                    Start Assessment
                  </button>
                </div>
              </div>
            )}

            {/* Info Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Course Features</h3>
              <ul className="space-y-4">
                <li className="flex items-center text-gray-600 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                  <span>Unlimited Access</span>
                </li>
                <li className="flex items-center text-gray-600 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                  <span>Expert Instructors</span>
                </li>
                <li className="flex items-center text-gray-600 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                  <span>Certificate of Completion</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}