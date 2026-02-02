import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApiService } from '../../../../services/AdminApi';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Award,
  Target,
  PlayCircle,
  DollarSign,
  ChevronRight,
  Search
} from 'lucide-react';

const CareerPathDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [careerPath, setCareerPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    fetchCareerPathDetails();
  }, [id]);

  const fetchCareerPathDetails = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getCareerPathById(id);
      setCareerPath(response);
      setError(null);
    } catch (err) {
      setError('Failed to fetch career path details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAllCourses = () => {
    if (!careerPath?.levels) return [];
    
    const allCourses = [];
    careerPath.levels.forEach(level => {
      if (level.courses && Array.isArray(level.courses)) {
        level.courses.forEach(course => {
          allCourses.push({
            ...course,
            levelId: level.levelId,
            levelName: level.levelName,
            courseSequence: course.courseSequence || 0
          });
        });
      }
    });
    
    return allCourses;
  };

  const getUniqueCategories = () => {
    const courses = getAllCourses();
    const categories = courses
      .map(course => course.categoryName)
      .filter(Boolean);
    return [...new Set(categories)];
  };

  const getFilteredCourses = () => {
    let courses = getAllCourses();
    
    // Filter by type/category first
    if (selectedType !== 'all') {
      courses = courses.filter(course => 
        course.categoryName === selectedType
      );
    }
    
    // Then filter by search term (title)
    if (searchTerm) {
      courses = courses.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return courses;
  };

  const getLevelStats = () => {
    if (!careerPath?.levels) return {};
    
    const stats = {};
    const allCourses = getAllCourses();
    
    careerPath.levels.forEach(level => {
      const levelCourses = allCourses.filter(course => course.levelId === level.levelId);
      stats[level.levelId] = {
        name: level.levelName || 'Unknown Level',
        count: levelCourses.length,
        paidCount: 0
      };
    });
    
    return stats;
  };

  const getTotalStats = () => {
    const allCourses = getAllCourses();
    return {
      total: allCourses.length,
      paid: 0,
      free: 0
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading career path details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={fetchCareerPathDetails}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/admin/career-path')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = getTotalStats();
  const levelStats = getLevelStats();
  const filteredCourses = getFilteredCourses();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/career-path')}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Career Paths
              </button>
              <div className="h-8 w-px bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{careerPath.title}</h1>
                  <p className="text-sm text-gray-600">{careerPath.slug}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-6 mb-4">
                  {/* Career Path Icon */}
                  {careerPath.iconUrl && (
                    <div className="flex-shrink-0">
                      <img
                        src={careerPath.iconUrl}
                        alt={`${careerPath.title} icon`}
                        className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                      />
                    </div>
                  )}
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{careerPath.title}</h2>
                    <p className="text-lg text-gray-600 leading-relaxed">{careerPath.description}</p>
                  </div>
                </div>
                
                {careerPath.outcome && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Award className="w-6 h-6 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Learning Outcome</h3>
                    </div>
                    <p className="text-gray-700">{careerPath.outcome}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600 font-medium">Total Courses</div>
              </div>
              <div className="bg-green-50 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {careerPath.durationMinMonths}-{careerPath.durationMaxMonths}
                </div>
                <div className="text-sm text-gray-600 font-medium">Months Duration</div>
              </div>
              <div className="bg-orange-50 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {careerPath.certificateCount || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">Certificates</div>
              </div>
              <div className="bg-yellow-50 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.paid}</div>
                <div className="text-sm text-gray-600 font-medium">Paid Courses</div>
              </div>
            </div>

            {/* Levels Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Learning Levels Structure</h3>
              <div className="space-y-4">
                {careerPath?.levels?.map((level, levelIndex) => (
                  <div key={level.levelId} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
                          {levelIndex + 1}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{level.levelName}</h4>
                          <p className="text-sm text-gray-600">{level.courses?.length || 0} courses</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-600">
                            {level.courses?.length || 0} Total Courses
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {level.courses && level.courses.length > 0 && (
                      <div className="space-y-2">
                        {level.courses
                          .sort((a, b) => (a.courseSequence || 0) - (b.courseSequence || 0))
                          .map((course, courseIndex) => {
                            const displaySequence = courseIndex + 1;
                            return (
                              <div key={course.courseId} className="flex items-center gap-3 bg-white rounded-lg p-3">
                                <div className="w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-xs font-bold">
                                  {displaySequence}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 text-sm">{course.title}</div>
                                  <div className="text-xs text-gray-500">{course.categoryName || 'General'}</div>
                                </div>
                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                  Course {displaySequence}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )) || (
                  <div className="text-center py-8 bg-gray-50 rounded-2xl">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No levels defined for this career path</p>
                  </div>
                )}
              </div>
            </div>

            {/* Level Progress */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Learning Progress by Level</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(levelStats).map(([key, stat]) => (
                  <div key={key} className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{stat.name}</h4>
                      <span className="text-sm text-gray-600">{stat.count} courses</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stat.count / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{stat.count} total courses</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div className="mt-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">All Courses ({filteredCourses.length})</h3>
                <div className="flex items-center gap-3">
                  {/* Type Filter */}
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="all">All Types</option>
                    {getUniqueCategories().map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search courses by title..."
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Clear Filters */}
                  {(searchTerm || selectedType !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedType('all');
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Courses List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h4>
                    <p className="text-gray-600">Try adjusting your search or filter</p>
                  </div>
                ) : (
                  filteredCourses.map((course, index) => {
                    const displaySequence = index + 1;
                    return (
                      <div key={`${course.levelId}-${course.courseId}`} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 hover:-translate-y-1">
                        {/* Course Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                              {course.levelName || 'Unknown Level'}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              {course.categoryName || 'General'}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">#{displaySequence}</span>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            Course {displaySequence}
                          </span>
                        </div>

                      {/* Course Title */}
                      <h4 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight min-h-[3.5rem]">
                        {course.title}
                      </h4>

                      {/* Course Meta */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Target className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{course.levelName || 'Unknown Level'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <PlayCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{course.categoryName || 'General'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>Sequence: {course.courseSequence || index + 1}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-xs text-gray-500 font-medium">Course Details</span>
                        </div>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 hover:scale-105">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerPathDetail;
