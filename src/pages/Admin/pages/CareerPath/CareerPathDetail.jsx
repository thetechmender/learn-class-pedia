import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApiService } from '../../../../services/AdminApi';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  TrendingUp,
  Calendar,
  Users,
  Award,
  Target,
  Star,
  CheckCircle,
  PlayCircle,
  DollarSign,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';

const CareerPathDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [careerPath, setCareerPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
      console.error('Error fetching career path details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAllCourses = () => {
    return careerPath?.courses || [];
  };

  const getFilteredCourses = () => {
    let courses = getAllCourses();
    
    if (searchTerm) {
      courses = courses.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return courses;
  };

  const getLevelStats = () => {
    const allCourses = getAllCourses();
    return {
      [careerPath?.careerPathLevelName?.toLowerCase()]: {
        name: careerPath?.careerPathLevelName || 'Unknown',
        count: allCourses.length,
        paidCount: allCourses.filter(course => course.isPaid).length
      }
    };
  };

  const getTotalStats = () => {
    const allCourses = getAllCourses();
    return {
      total: allCourses.length,
      paid: allCourses.filter(course => course.isPaid).length,
      free: allCourses.filter(course => !course.isPaid).length
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
                onClick={() => navigate('/admin/career-paths')}
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
                onClick={() => navigate('/admin/career-paths')}
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
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{careerPath.title}</h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">{careerPath.description}</p>
                
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
                        style={{ width: `${(stat.count / stats.total) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{stat.paidCount} paid</span>
                      <span>{stat.count - stat.paidCount} free</span>
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
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search courses..."
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Level Filter */}
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Levels</option>
                    {Object.entries(levelStats).map(([key, stat]) => (
                      <option key={key} value={key}>{stat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Courses List */}
              <div className="space-y-4">
                {filteredCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h4>
                    <p className="text-gray-600">Try adjusting your search or filter</p>
                  </div>
                ) : (
                  filteredCourses.map((course, index) => (
                    <div key={`${course.levelId}-${course.courseId}`} className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {course.categoryName}
                            </span>
                            <span className="text-sm text-gray-500">Course #{course.courseSequence + 1 || index + 1}</span>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <PlayCircle className="w-4 h-4" />
                              {course.categoryName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Order: {course.sortOrder}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {course.isPaid ? (
                            <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-sm font-medium">
                              Paid
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                              Free
                            </span>
                          )}
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
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
