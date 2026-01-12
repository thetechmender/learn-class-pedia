import React, { useState, useEffect } from 'react';
import CourseCard from '../components/CourseCard';
import CreateCourseModal from '../components/CreateCourseModal';
import EditCourseModal from '../components/EditCourseModal';
import { apiService } from '../services/api';
import { courses as fallbackCourses } from '../data/courses';
import { Search, Filter, Plus, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useApi, setUseApi] = useState(true);

  // Pagination state
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Load courses on component mount
  useEffect(() => {
    loadCourses(pageNumber);
  }, [pageNumber]);

  const loadCourses = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      if (useApi) {
        const data = await apiService.getCoursesPaginated(page, pageSize);
        if (data && data.courses) {
          // Provide fallback images for courses without them
          const processedCourses = data.courses.map(course => ({
            ...course,
            title: course.courseName, // Map API courseName to title for display
            description: course.program, // Use program as description or similar
            image: course.image || 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            level: 'Intermediate', // Default level if not in API
            lessons: 10,
            duration: '4 weeks',
            ...course
          }));
          setCourses(processedCourses);
          setTotalPages(data.totalPages);
          setTotalRecords(data.totalRecords);
          setPageNumber(data.pageNumber);
        } else {
          setCourses([]);
        }
      } else {
        // Fallback to static data
        setCourses(fallbackCourses);
        setTotalPages(1);
        setTotalRecords(fallbackCourses.length);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
      setError('Failed to load courses from API. Using fallback data.');
      setCourses(fallbackCourses);
      setUseApi(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (courseData) => {
    setIsSubmitting(true);
    try {
      if (useApi) {
        const newCourse = await apiService.createCourse(courseData);
        setCourses(prev => [newCourse, ...prev]);
      } else {
        // Fallback: add to local state
        const newCourse = {
          id: Date.now(),
          ...courseData,
          createdAt: new Date().toISOString()
        };
        setCourses(prev => [newCourse, ...prev]);
      }
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Failed to create course:', err);
      setError('Failed to create course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setIsEditModalOpen(true);
  };

  const handleUpdateCourse = async (courseId, courseData) => {
    setIsSubmitting(true);
    try {
      if (useApi) {
        const updatedCourse = await apiService.updateCourse(courseId, courseData);
        setCourses(prev => prev.map(course =>
          course.id === courseId ? updatedCourse : course
        ));
      } else {
        // Fallback: update local state
        setCourses(prev => prev.map(course =>
          course.id === courseId ? { ...course, ...courseData } : course
        ));
      }
      setIsEditModalOpen(false);
      setEditingCourse(null);
    } catch (err) {
      console.error('Failed to update course:', err);
      setError('Failed to update course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      if (useApi) {
        await apiService.deleteCourse(courseId);
      }
      setCourses(prev => prev.filter(course => course.id !== courseId));
    } catch (err) {
      console.error('Failed to delete course:', err);
      setError('Failed to delete course. Please try again.');
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === '' || course.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 font-medium">Loading extraordinary content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-900 to-indigo-900 pt-32 pb-48 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-48 -left-24 w-72 h-72 bg-pink-500 rounded-full blur-3xl opacity-20"></div>

        <div className="relative max-w-7xl mx-auto text-center z-10 transition-all duration-700 transform translate-y-0 opacity-100">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Discover Knowledge</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Elevate Your Skills <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
              Without Limits
            </span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Explore our premium collection of courses designed to transform your career and expand your horizons.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">

        {/* Search & Statistics Panel */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-12">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">

            {/* Search Bar */}
            <div className="relative flex-1 w-full md:max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
              <input
                type="text"
                placeholder="What do you want to learn today?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:bg-white transition-all text-lg placeholder-gray-400"
              />
            </div>

            {/* Right Controls */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative min-w-[160px]">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-500 h-5 w-5" />
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none text-gray-700 font-medium cursor-pointer"
                >
                  <option value="">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <button
                onClick={() => loadCourses(pageNumber)}
                className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 hover:rotate-180 transition-all duration-500"
                title="Refresh courses"
              >
                <RefreshCw className="h-6 w-6" />
              </button>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transform hover:-translate-y-0.5 transition-all font-bold"
              >
                <Plus className="h-5 w-5" />
                New Course
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center animate-pulse">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <p className="text-red-700 font-medium">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-700">×</button>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Available Courses
            <span className="bg-primary-100 text-primary-700 text-sm py-1 px-3 rounded-full">{filteredCourses.length}</span>
          </h2>

          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
            <div className={`w-2 h-2 rounded-full ${useApi ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
            {useApi ? 'Live System' : 'Offline Mode'}
          </div>
        </div>

        {/* Course Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredCourses.map((course, index) => (
              <div
                key={course.id}
                className="opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
              >
                <CourseCard
                  course={course}
                  onEdit={handleEditCourse}
                  onDelete={handleDeleteCourse}
                  showActions={true}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              We couldn't find any courses matching your search. Try adjusting your filters or search terms.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedLevel(''); }}
              className="text-primary-600 font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredCourses.length > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between border-t border-gray-200 pt-8 gap-4">
            <div className="text-sm text-gray-500">
              Page <span className="font-bold text-gray-900">{pageNumber}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                disabled={pageNumber === 1}
                className="p-3 rounded-lg border border-gray-200 hover:bg-white hover:shadow-md disabled:opacity-50 disabled:hover:shadow-none transition-all"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                  // Simple logic to show first 5 pages or relevant window could be added
                  // For now just showing up to 5 for design demo
                  let p = idx + 1;
                  if (totalPages > 5 && pageNumber > 3) p = pageNumber - 2 + idx;
                  if (p > totalPages) return null;

                  return (
                    <button
                      key={p}
                      onClick={() => setPageNumber(p)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${p === pageNumber
                          ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 scale-105'
                          : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
                disabled={pageNumber === totalPages}
                className="p-3 rounded-lg border border-gray-200 hover:bg-white hover:shadow-md disabled:opacity-50 disabled:hover:shadow-none transition-all"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        <CreateCourseModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateCourse}
          isLoading={isSubmitting}
        />

        <EditCourseModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCourse(null);
          }}
          onSubmit={handleUpdateCourse}
          course={editingCourse}
          isLoading={isSubmitting}
        />

        {/* CSS for custom animation */}
        <style jsx>{`
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up {
                animation: fadeIn 0.6s ease-out forwards;
            }
        `}</style>
      </div>
    </div>
  );
}