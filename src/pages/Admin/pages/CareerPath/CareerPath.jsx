import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApiService } from '../../../../services/AdminApi';
import CareerPathForm from './CareerPathForm';
import {
  Plus,
  Filter,
  Clock,
  BookOpen,
  TrendingUp,
  Users,
  ChevronRight,
  Calendar,
  Search,
  X,
  Star,
  Award,
  Target,
  Sparkles,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';

const CareerPath = () => {
  const navigate = useNavigate();
  const [careerPaths, setCareerPaths] = useState([]);
  const [filteredCareerPaths, setFilteredCareerPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); 
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCareerPath, setEditingCareerPath] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Toast notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchCareerPaths();
  }, []);
  useEffect(() => {
    filterCareerPaths();
  }, [careerPaths, searchTerm, selectedLevel, selectedDuration, selectedCategory]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLevel, selectedDuration, selectedCategory]);

  const filterCareerPaths = () => {
    let filtered = careerPaths;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(path => 
        path.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        path.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(path => 
        path.careerPathLevelName?.toLowerCase() === selectedLevel
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(path => 
        path.categoryName?.toLowerCase() === selectedCategory
      );
    }

    // Filter by duration
    if (selectedDuration !== 'all') {
      filtered = filtered.filter(path => {
        const maxMonths = path.durationMaxMonths || 0;
        switch (selectedDuration) {
          case 'short': return maxMonths <= 3;
          case 'medium': return maxMonths > 3 && maxMonths <= 6;
          case 'long': return maxMonths > 6 && maxMonths <= 12;
          case 'extended': return maxMonths > 12;
          default: return true;
        }
      });
    }

    setFilteredCareerPaths(filtered);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredCareerPaths.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCareerPaths = filteredCareerPaths.slice(startIndex, endIndex);

  const fetchCareerPaths = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getAllCareerPaths();
      setCareerPaths(response);
      setError(null);
    } catch (err) {
      setError('Failed to fetch career paths. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUniqueCategories = () => {
    const categories = careerPaths
      .map(path => path.categoryName)
      .filter(Boolean);
    return [...new Set(categories)];
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLevel('all');
    setSelectedDuration('all');
    setSelectedCategory('all');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedLevel !== 'all') count++;
    if (selectedDuration !== 'all') count++;
    if (selectedCategory !== 'all') count++;
    return count;
  };

  // CRUD Operations
  const handleCreateCareerPath = () => {
    setEditingCareerPath(null);
    setShowCreateForm(true);
  };

  const handleEditCareerPath = async (careerPath) => {
    try {
      setFormLoading(true);
      // Fetch full career path details
      const careerPathDetails = await adminApiService.getCareerPathById(careerPath.id);
      setEditingCareerPath(careerPathDetails);
      setShowCreateForm(true);
    } catch (error) {
      showToast('Failed to fetch career path details. Please try again.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveCareerPath = async (careerPathData, isFormData = false) => {
   
    
    try {
      setFormLoading(true);
      
      let savedCareerPath;
      
      if (editingCareerPath) {
        if (isFormData) {
         
          savedCareerPath = await adminApiService.updateCareerPathWithFile(editingCareerPath.id, careerPathData);
        } else {   
        const formData = new FormData();
          if (careerPathData.title) formData.append('Title', careerPathData.title);
          if (careerPathData.description) formData.append('Description', careerPathData.description);
          if (careerPathData.price !== undefined) formData.append('Price', careerPathData.price);
          if (careerPathData.discountedPrice !== undefined) formData.append('DiscountedPrice', careerPathData.discountedPrice);
          if (careerPathData.durationMinMonths !== undefined) formData.append('DurationMinMonths', careerPathData.durationMinMonths);
          if (careerPathData.sortOrder !== undefined) formData.append('SortOrder', careerPathData.sortOrder);
          if (careerPathData.durationMaxMonths !== undefined) formData.append('DurationMaxMonths', careerPathData.durationMaxMonths);
          if (careerPathData.outcome) formData.append('Outcome', careerPathData.outcome);
          if (careerPathData.certificateCount !== undefined) formData.append('CertificateCount', careerPathData.certificateCount);
          if (careerPathData.roleId !== undefined) formData.append('RoleId', careerPathData.roleId);
          
          // Add arrays using proper notation
          if (careerPathData.levels && careerPathData.levels.length > 0) {
            careerPathData.levels.forEach((level, index) => {
              formData.append(`Levels[${index}].levelId`, level.levelId);
              level.courses.forEach((course, courseIndex) => {
                formData.append(`Levels[${index}].courses[${courseIndex}].courseId`, course.courseId);
                formData.append(`Levels[${index}].courses[${courseIndex}].courseSequence`, course.courseSequence);
              });
            });
          }
          
          if (careerPathData.skills && careerPathData.skills.length > 0) {
            careerPathData.skills.forEach((skill, index) => {
              formData.append(`Skills[${index}].skillId`, skill.skillId);
              formData.append(`Skills[${index}].proficiencyLevel`, skill.proficiencyLevel);
            });
          }
          
          if (careerPathData.careerPathBadges && careerPathData.careerPathBadges.length > 0) {
            careerPathData.careerPathBadges.forEach((badgeId, index) => {
              formData.append(`CareerPathBadges[${index}]`, badgeId);
            });
          }
          // Don't include CareerPathBadges field at all when empty
          
          savedCareerPath = await adminApiService.updateCareerPathWithFile(editingCareerPath.id, formData);
        }
        showToast('Career path updated successfully!', 'success');
      } else {
        // Create new career path - always use FormData to avoid 415 error
        console.log('Creating new career path, using FormData');
        if (isFormData) {
          // Use FormData for file uploads - need special handling
          console.log('Calling createCareerPathWithFile');
          savedCareerPath = await adminApiService.createCareerPathWithFile(careerPathData);
        } else {
          // Convert JSON to FormData for consistency
          console.log('Converting JSON to FormData and calling createCareerPathWithFile');
          const formData = new FormData();
          
          // Add all fields to FormData
          if (careerPathData.title) formData.append('Title', careerPathData.title);
          if (careerPathData.description) formData.append('Description', careerPathData.description);
          if (careerPathData.price !== undefined) formData.append('Price', careerPathData.price);
          if (careerPathData.discountedPrice !== undefined) formData.append('DiscountedPrice', careerPathData.discountedPrice);
          if (careerPathData.durationMinMonths !== undefined) formData.append('DurationMinMonths', careerPathData.durationMinMonths);
          if (careerPathData.sortOrder !== undefined) formData.append('SortOrder', careerPathData.sortOrder);
          if (careerPathData.durationMaxMonths !== undefined) formData.append('DurationMaxMonths', careerPathData.durationMaxMonths);
          if (careerPathData.outcome) formData.append('Outcome', careerPathData.outcome);
          if (careerPathData.certificateCount !== undefined) formData.append('CertificateCount', careerPathData.certificateCount);
          if (careerPathData.roleId !== undefined) formData.append('RoleId', careerPathData.roleId);
          
          // Add arrays using proper notation
          if (careerPathData.levels && careerPathData.levels.length > 0) {
            careerPathData.levels.forEach((level, index) => {
              formData.append(`Levels[${index}].levelId`, level.levelId);
              level.courses.forEach((course, courseIndex) => {
                formData.append(`Levels[${index}].courses[${courseIndex}].courseId`, course.courseId);
                formData.append(`Levels[${index}].courses[${courseIndex}].courseSequence`, course.courseSequence);
              });
            });
          }
          
          if (careerPathData.skills && careerPathData.skills.length > 0) {
            careerPathData.skills.forEach((skill, index) => {
              formData.append(`Skills[${index}].skillId`, skill.skillId);
              formData.append(`Skills[${index}].proficiencyLevel`, skill.proficiencyLevel);
            });
          }
          
          if (careerPathData.careerPathBadges && careerPathData.careerPathBadges.length > 0) {
            careerPathData.careerPathBadges.forEach((badgeId, index) => {
              formData.append(`CareerPathBadges[${index}]`, badgeId);
            });
          }
          // Don't include CareerPathBadges field at all when empty
          
          savedCareerPath = await adminApiService.createCareerPathWithFile(formData);
        }
        showToast('Career path created successfully!', 'success');
      }
      
      setShowCreateForm(false);
      setEditingCareerPath(null);
      fetchCareerPaths(); // Refresh the list
    } catch (error) {
      
      // Extract specific error message from API response
      let errorMessage = editingCareerPath 
        ? 'Failed to update career path. Please try again.' 
        : 'Failed to create career path. Please try again.';
      
      // Check if error has a specific message from the API
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = error.response.data;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (careerPath) => {
    setDeleteConfirm(careerPath);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    
    try {
      setFormLoading(true);
      await adminApiService.deleteCareerPath(deleteConfirm.id);
      showToast('Career path deleted successfully!', 'success');
      setDeleteConfirm(null);
      fetchCareerPaths(); // Refresh the list
    } catch (error) {
      showToast('Failed to delete career path. Please try again.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const calculateTotalCourses = (levels) => {
    return levels?.reduce((total, level) => total + (level.courses?.length || 0), 0) || 0;
  };

  const getFirstFewCourses = (levels, count = 3) => {
    const allCourses = [];
    levels?.forEach(level => {
      if (level.courses) {
        allCourses.push(...level.courses);
      }
    });
    return allCourses.slice(0, count);
  };

  const getSkillsSummary = (skills) => {
    if (!skills || skills.length === 0) return 'No skills specified';
    const totalSkills = skills.length;
    const avgProficiency = skills.reduce((sum, skill) => sum + (skill.proficiencyLevel || 0), 0) / totalSkills;
    return `${totalSkills} skills (Avg: ${avgProficiency.toFixed(1)})`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 max-w-full mx-auto bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <div className="h-10 lg:h-12 bg-gray-200 rounded-lg w-64 mb-3 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded-lg w-96 animate-pulse"></div>
            </div>
            <div className="mt-4 lg:mt-0">
              <div className="h-12 bg-gray-200 rounded-xl w-40 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded-xl w-32 animate-pulse"></div>
          </div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="flex gap-2">
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                </div>

                {/* Stats Skeleton */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="h-4 bg-gray-200 rounded w-8 mx-auto mb-1 animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded w-12 mx-auto animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-16 mx-auto animate-pulse"></div>
                    </div>
                  ))}
                </div>

                {/* Learning Path Skeleton */}
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                  {[1, 2].map((j) => (
                    <div key={j} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse mr-3"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Skeleton */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-12 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">{error}</div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Career Paths</h1>
                  <p className="text-sm text-gray-600 mt-1">Discover your perfect learning journey</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 font-medium ${
                  getActiveFiltersCount() > 0
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>
              <button 
                onClick={handleCreateCareerPath}
                className="flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Career Path
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search career paths by title or description..."
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white/60 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filter Options</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">All Durations</option>
                  <option value="short">0-3 months</option>
                  <option value="medium">3-6 months</option>
                  <option value="long">6-12 months</option>
                  <option value="extended">12+ months</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">All Categories</option>
                  {getUniqueCategories().map(category => (
                    <option key={category} value={category.toLowerCase()}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Summary */}
        {filteredCareerPaths.length !== careerPaths.length && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-800">
                Showing <span className="font-semibold">{filteredCareerPaths.length}</span> of {careerPaths.length} career paths
              </p>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}

        {filteredCareerPaths.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {careerPaths.length === 0 ? 'No career paths found' : 'No matching career paths'}
            </h3>
            <p className="text-gray-600 mb-6">
              {careerPaths.length === 0 
                ? 'Create your first career path to get started' 
                : 'Try adjusting your search or filters to find what you\'re looking for'
              }
            </p>
            {careerPaths.length === 0 && (
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
                <Plus className="w-4 h-4 mr-2 inline" />
                Create Your First Career Path
              </button>
            )}
            {careerPaths.length > 0 && filteredCareerPaths.length === 0 && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedCareerPaths.map((path) => {
              const totalCourses = calculateTotalCourses(path.levels);
              const firstCourses = getFirstFewCourses(path.levels, 3);
              const isHovered = hoveredCard === path.id;
              
              return (
                <div 
                  key={path.id} 
                  className={`group bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden ${
                    isHovered ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                  }`}
                  onMouseEnter={() => setHoveredCard(path.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Card Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 pr-4 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight">
                          <span className="line-clamp-2">{path.title}</span>
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex-shrink-0">
                            {path.status || 'Active'}
                          </span>
                          {path.price && (
                            <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full flex-shrink-0">
                              ${path.price}
                            </span>
                          )}
                          {path.discountedPrice && path.discountedPrice < path.price && (
                            <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex-shrink-0">
                              ${path.discountedPrice}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Award className="w-7 h-7 text-blue-600" />
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed line-clamp-3">
                      {path.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                      <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <div className="flex items-center justify-center text-blue-600 mb-2">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="text-xl font-bold text-gray-900">{totalCourses}</div>
                        <div className="text-xs text-gray-600 font-medium">Courses</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-xl">
                        <div className="flex items-center justify-center text-green-600 mb-2">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {path.durationMinMonths}-{path.durationMaxMonths}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Months</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-xl">
                        <div className="flex items-center justify-center text-purple-600 mb-2">
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {path.levels?.length || 0}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Levels</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-xl">
                        <div className="flex items-center justify-center text-orange-600 mb-2">
                          <Award className="w-5 h-5" />
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {path.certificateCount || 0}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Certificates</div>
                      </div>
                    </div>

                    {/* Skills Summary */}
                    {path.skills && path.skills.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Skills</div>
                          <Star className="w-4 h-4 text-yellow-500" />
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                          <p className="text-sm text-blue-800 font-medium">{getSkillsSummary(path.skills)}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {path.skills.slice(0, 3).map((skill, index) => (
                              <span key={index} className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full">
                                Lvl {skill.proficiencyLevel}
                              </span>
                            ))}
                            {path.skills.length > 3 && (
                              <span className="px-2 py-1 text-xs bg-gray-400 text-white rounded-full">
                                +{path.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Learning Path */}
                    {firstCourses.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Learning Path</div>
                          <Sparkles className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="space-y-2">
                          {firstCourses.map((course, index) => (
                            <div key={course.courseId} className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                              {/* <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 ${
                                index === 0 ? 'bg-blue-600 text-white' :
                                index === 1 ? 'bg-blue-500 text-white' :
                                'bg-blue-400 text-white'
                              }`}>
                                {course.courseSequence + 1 || index + 1}
                              </div> */}
                              <div className="flex-1 min-w-0 mr-2">
                                <div className="text-gray-900 font-semibold text-sm truncate" title={course.title}>
                                  {course.title}
                                </div>
                                <div className="text-xs text-gray-500 truncate" title={course.categoryName}>
                                  {course.categoryName}
                                </div>
                              </div>
                              {course.isPaid && (
                                <span className="px-2 py-1 text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full font-medium flex-shrink-0">
                                  Paid
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                        {totalCourses > 3 && (
                          <div className="text-center mt-3">
                            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                              +{totalCourses - 3} more courses
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-500 flex-shrink-0">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(path.creationTime || path.createdAt)}
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button 
                          onClick={() => navigate(`/admin/career-paths/${path.id}`)}
                          className="flex items-center px-2 py-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold group whitespace-nowrap"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </button>
                        <button 
                          onClick={() => handleEditCareerPath(path)}
                          className="flex items-center px-2 py-1.5 text-xs text-green-600 hover:text-green-700 font-semibold group whitespace-nowrap"
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(path)}
                          className="flex items-center px-2 py-1.5 text-xs text-red-600 hover:text-red-700 font-semibold group whitespace-nowrap"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredCareerPaths.length)} of{' '}
              {filteredCareerPaths.length} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm border rounded-md ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <CareerPathForm
              careerPath={editingCareerPath}
              onSave={handleSaveCareerPath}
              onCancel={() => {
                setShowCreateForm(false);
                setEditingCareerPath(null);
              }}
              loading={formLoading}
              showToast={showToast}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Delete Career Path
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={formLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={formLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {formLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerPath;
