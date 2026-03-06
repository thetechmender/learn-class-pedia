import { useState, useEffect, useCallback } from 'react';
import { Search, Edit2, RefreshCw, Globe, Link, BookOpen, Folder, Target, Save, X } from 'lucide-react';
import { useAdmin } from '../../../../hooks/api/useAdmin';
import { useSlugManagement } from '../../../../hooks/api/useSlugManagement';
import AdminPageLayout from '../../../../components/AdminPageLayout';
import ApiService from '../../../../services/ApiService';

const SlugManagement = () => {
  const { getAllCoursesAdmin, getAllCareerPaths, getAllCategories } = useAdmin();
  const { updateCourseSlug, updateAllCourseSlugs, updateCareerPathSlug, updateAllCareerPathSlugs, updateCategorySlug, updateAllCategorySlugs, loading: slugLoading } = useSlugManagement();

  const [activeModal, setActiveModal] = useState(null);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editingSlug, setEditingSlug] = useState('');
  const [courseCount, setCourseCount] = useState(0);
  const [careerPathCount, setCareerPathCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingCategorySlug, setEditingCategorySlug] = useState('');
  const [careerPaths, setCareerPaths] = useState([]);
  const [filteredCareerPaths, setFilteredCareerPaths] = useState([]);
  const [selectedCareerPath, setSelectedCareerPath] = useState(null);
  const [editingCareerPathSlug, setEditingCareerPathSlug] = useState('');

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setCoursesLoading(true);
      const response = await getAllCategories();
      const categoriesData = response.items || response || [];
      setCategories(categoriesData);
      setFilteredCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
      setFilteredCategories([]);
    } finally {
      setCoursesLoading(false);
    }
  }, [getAllCategories]);

  // Fetch career paths
  const fetchCareerPaths = useCallback(async () => {
    try {
      setCoursesLoading(true);
      const response = await getAllCareerPaths();
      const careerPathsData = response.items || response || [];
      setCareerPaths(careerPathsData);
      setFilteredCareerPaths(careerPathsData);
    } catch (error) {
      console.error('Failed to fetch career paths:', error);
      setCareerPaths([]);
      setFilteredCareerPaths([]);
    } finally {
      setCoursesLoading(false);
    }
  }, [getAllCareerPaths]);

  // Filter categories based on search term (only for empty search)
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCategories([]);
    }
    // Categories now use API search, so no frontend filtering needed
  }, [searchTerm]);

  // Filter career paths based on search term (only for empty search)
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCareerPaths([]);
    }
    // Career paths now use API search, so no frontend filtering needed
  }, [searchTerm]);

  // Handle category selection for editing
  const handleEditCategory = async (category) => {
    try {
      setCoursesLoading(true);
      const slugData = await ApiService.getSlugByCategoryId(category.id);
      setSelectedCategory(category);
      setEditingCategorySlug(slugData.slug || '');
    } catch (error) {
      console.error('Failed to fetch category slug:', error);
      // Still set category even if slug fetch fails
      setSelectedCategory(category);
      setEditingCategorySlug('');
    } finally {
      setCoursesLoading(false);
    }
  };

  // Update category slug
  const handleUpdateCategorySlug = async () => {
    if (!selectedCategory || !editingCategorySlug.trim()) {
      return;
    }

    try {
      await updateCategorySlug(selectedCategory.id, editingCategorySlug.trim());
      setSelectedCategory(null);
      setEditingCategorySlug('');
      if (searchTerm.trim()) {
        searchCategories(); // Refresh search results if there's a search term
      }
    } catch (error) {
      // Error is handled by the hook
    }
  };

  // Update all category slugs
  const handleUpdateAllCategorySlugs = async () => {
    try {
      await updateAllCategorySlugs();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  // Handle career path selection for editing
  const handleEditCareerPath = async (careerPath) => {
    try {
      setCoursesLoading(true);
      const slugData = await ApiService.getSlugByCareerPathId(careerPath.id);
      setSelectedCareerPath(careerPath);
      setEditingCareerPathSlug(slugData.slug || '');
    } catch (error) {
      console.error('Failed to fetch career path slug:', error);
      // Still set career path even if slug fetch fails
      setSelectedCareerPath(careerPath);
      setEditingCareerPathSlug('');
    } finally {
      setCoursesLoading(false);
    }
  };

  // Update career path slug
  const handleUpdateCareerPathSlug = async () => {
    if (!selectedCareerPath || !editingCareerPathSlug.trim()) {
      return;
    }

    try {
      await updateCareerPathSlug(selectedCareerPath.id, editingCareerPathSlug.trim());
      setSelectedCareerPath(null);
      setEditingCareerPathSlug('');
      if (searchTerm.trim()) {
        searchCareerPaths(); // Refresh search results if there's a search term
      }
    } catch (error) {
      // Error is handled by the hook
    }
  };
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch course count
        const courseResponse = await getAllCoursesAdmin();
        const coursesData = courseResponse.items || courseResponse || [];
        setCourseCount(coursesData.length);

        // Fetch career path count
        const careerPathResponse = await getAllCareerPaths();
        const careerPathsData = careerPathResponse.items || careerPathResponse || [];
        setCareerPathCount(careerPathsData.length);

        // Fetch category count
        const categoryResponse = await getAllCategories();
        const categoriesData = categoryResponse.items || categoryResponse || [];
        setCategoryCount(categoriesData.length);
      } catch (error) {
        console.error('Failed to fetch counts:', error);
        setCourseCount(0);
        setCareerPathCount(0);
        setCategoryCount(0);
      }
    };

    fetchCounts();
  }, [getAllCoursesAdmin]);

  // Filter courses based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCourses([]);
    } else {
      const filtered = courses.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [searchTerm, courses]);

  // Search courses
  const searchCourses = useCallback(async () => {
    if (!searchTerm.trim()) {
      setCourses([]);
      setFilteredCourses([]);
      return;
    }

    try {
      setCoursesLoading(true);
      const response = await getAllCoursesAdmin({ Title: searchTerm });
      const coursesData = response.items || response || [];
      setCourses(coursesData);
      setFilteredCourses(coursesData);
    } catch (error) {
      console.error('Failed to search courses:', error);
      setCourses([]);
      setFilteredCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  }, [searchTerm, getAllCoursesAdmin]);

  // Search categories
  const searchCategories = useCallback(async () => {
    if (!searchTerm.trim()) {
      setCategories([]);
      setFilteredCategories([]);
      return;
    }

    try {
      setCoursesLoading(true);
      const response = await getAllCategories({ Name: searchTerm });
      const categoriesData = response.items || response || [];
      setCategories(categoriesData);
      setFilteredCategories(categoriesData);
    } catch (error) {
      console.error('Failed to search categories:', error);
      setCategories([]);
      setFilteredCategories([]);
    } finally {
      setCoursesLoading(false);
    }
  }, [searchTerm, getAllCategories]);

  // Search career paths
  const searchCareerPaths = useCallback(async () => {
    if (!searchTerm.trim()) {
      setCareerPaths([]);
      setFilteredCareerPaths([]);
      return;
    }

    try {
      setCoursesLoading(true);
      const response = await getAllCareerPaths({ Title: searchTerm });
      const careerPathsData = response.items || response || [];
      setCareerPaths(careerPathsData);
      setFilteredCareerPaths(careerPathsData);
    } catch (error) {
      console.error('Failed to search career paths:', error);
      setCareerPaths([]);
      setFilteredCareerPaths([]);
    } finally {
      setCoursesLoading(false);
    }
  }, [searchTerm, getAllCareerPaths]);

  // Trigger search when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeModal === 'courses') {
        searchCourses();
      } else if (activeModal === 'categories') {
        searchCategories();
      } else if (activeModal === 'career-paths') {
        searchCareerPaths();
      }
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchCourses, searchCategories, searchCareerPaths, activeModal]);

  // Handle course selection for editing
  const handleEditCourse = async (course) => {
    try {
      setCoursesLoading(true);
      const slugData = await ApiService.getSlugByCourseId(course.id);
      setSelectedCourse(course);
      setEditingSlug(slugData.slug || '');
    } catch (error) {
      console.error('Failed to fetch course slug:', error);
      // Still set the course even if slug fetch fails
      setSelectedCourse(course);
      setEditingSlug('');
    } finally {
      setCoursesLoading(false);
    }
  };

  // Update slug
  const handleUpdateSlug = async () => {
    if (!selectedCourse || !editingSlug.trim()) {
      return;
    }

    try {
      await updateCourseSlug(selectedCourse.id, editingSlug.trim());
      setSelectedCourse(null);
      setEditingSlug('');
      if (searchTerm.trim()) {
        searchCourses(); // Refresh search results if there's a search term
      }
    } catch (error) {
      // Error is handled by the hook
    }
  };

  // Update all slugs
  const handleUpdateAllSlugs = async () => {
    try {
      await updateAllCourseSlugs();
      if (searchTerm.trim()) {
        searchCourses(); // Refresh search results if there's a search term
      }
    } catch (error) {
      // Error is handled by the hook
    }
  };

  // Update all career path slugs
  const handleUpdateAllCareerPathSlugs = async () => {
    try {
      await updateAllCareerPathSlugs();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const managementCards = [
    {
      id: 'courses',
      title: 'Course Slugs',
      description: 'Manage URL slugs for all courses',
      icon: BookOpen,
      count: courseCount,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'categories',
      title: 'Category Slugs',
      description: 'Manage URL slugs for categories',
      icon: Folder,
      count: categoryCount,
      color: 'green',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'career-paths',
      title: 'Career Path Slugs',
      description: 'Manage URL slugs for career paths',
      icon: Target,
      count: careerPathCount,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <AdminPageLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">URL & Slug Management</h1>
          <p className="text-gray-600">Manage and update URL slugs for courses, categories, and career paths</p>
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {managementCards.map((card) => (
            <div key={card.id} className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
              {/* Card Header with Gradient Background */}
              <div className={`bg-gradient-to-r ${card.gradient} p-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm`}>
                      <card.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-white text-opacity-80 text-sm">Total</p>
                      <p className="text-white text-2xl font-bold">{card.count}</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{card.title}</h3>
                  <p className="text-white text-opacity-90 text-sm">{card.description}</p>
                </div>
              </div>

              {/* Card Body with Buttons */}
              <div className="p-6">
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setActiveModal(card.id);
                      setSearchTerm('');
                      setFilteredCourses([]);
                      setFilteredCategories([]);
                      setFilteredCareerPaths([]);
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 flex items-center justify-center gap-2 font-medium shadow-md transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    <Globe className="w-4 h-4" />
                    Manage Slugs
                  </button>
                  
                  <button
                    onClick={() => {
                      if (card.id === 'courses') {
                        handleUpdateAllSlugs();
                      } else if (card.id === 'career-paths') {
                        handleUpdateAllCareerPathSlugs();
                      } else if (card.id === 'categories') {
                        handleUpdateAllCategorySlugs();
                      }
                    }}
                    disabled={(card.id !== 'courses' && card.id !== 'career-paths' && card.id !== 'categories') || slugLoading}
                    className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium shadow-md transition-all duration-200 transform hover:scale-[1.02] ${
                      (card.id === 'courses' || card.id === 'career-paths' || card.id === 'categories')
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw className={`w-4 h-4 ${slugLoading && (card.id === 'courses' || card.id === 'career-paths' || card.id === 'categories') ? 'animate-spin' : ''}`} />
                    {slugLoading && (card.id === 'courses' || card.id === 'career-paths' || card.id === 'categories') ? 'Updating...' : 'Update All'}
                  </button>
                </div>

                {/* Status Indicator */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (card.id === 'courses' || card.id === 'career-paths' || card.id === 'categories') 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {(card.id === 'courses' || card.id === 'career-paths' || card.id === 'categories') ? 'Active' : 'Coming Soon'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Course Slugs Modal */}
        {activeModal === 'courses' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                      <BookOpen className="w-6 h-6" />
                      Course Slug Management
                    </h3>
                    <p className="text-blue-100 mt-1">Search and manage URL slugs for courses</p>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Search Bar with Instructions */}
                <div className="mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800 flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Start typing to search for courses by title. Results will appear automatically.
                    </p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search courses by title (e.g., 'JavaScript', 'React', 'Python')..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      autoFocus
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  {searchTerm && (
                    <p className="text-sm text-gray-500 mt-2">
                      Found {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} matching "{searchTerm}"
                    </p>
                  )}
                </div>

                {/* Courses List */}
                <div className="max-h-96 overflow-y-auto border-2 border-gray-200 rounded-lg">
                  {coursesLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 font-medium">Searching courses...</p>
                      <p className="text-gray-500 text-sm mt-1">Finding matches for "{searchTerm}"</p>
                    </div>
                  ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium text-lg mb-2">
                        {searchTerm.trim() ? 'No courses found' : 'Start searching for courses'}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {searchTerm.trim() 
                          ? `No courses match "${searchTerm}". Try different keywords.`
                          : 'Type in search box above to find courses to manage.'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredCourses.map((course) => (
                        <div key={course.id} className="p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 group">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 pr-4">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                                    <BookOpen className="w-5 h-5 text-white" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 text-base truncate group-hover:text-blue-700 transition-colors">
                                    {course.title}
                                  </h4>
                                  <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border">
                                      <Globe className="w-3.5 h-3.5 text-gray-400" />
                                      <span className={
                                        course.slug ? 'text-gray-700' : 'text-gray-400 italic'
                                      }>
                                        {course.slug || 'No slug set'}
                                      </span>
                                    </div>
                                    {!course.slug && (
                                      <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium border border-amber-200">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                        Needs slug
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <button
                                onClick={() => handleEditCourse(course)}
                                disabled={coursesLoading}
                                className="group/btn relative w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98]"
                              >
                                <Edit2 className="w-4 h-4 transition-transform duration-200 group-hover/btn:rotate-12" />
                                <div className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity duration-200"></div>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Slug Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Edit2 className="w-5 h-5" />
                      Edit Course Slug
                    </h3>
                    <p className="text-purple-100 mt-1 text-sm">Modify URL slug for this course</p>
                  </div>
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Course Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Course Title</p>
                  <p className="font-semibold text-gray-900 text-lg">{selectedCourse.title}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                      ID: {selectedCourse.id}
                    </div>
                  </div>
                </div>

                {/* Slug Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Link className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={editingSlug}
                      onChange={(e) => setEditingSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))}
                      placeholder="course-url-slug"
                      className="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <span className="text-amber-500">💡</span>
                    Use lowercase letters, numbers, and hyphens only. No spaces or special characters.
                  </p>
                  {editingSlug && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Preview URL:</strong> /courses/{editingSlug}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateSlug}
                    disabled={slugLoading || !editingSlug.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg transition-all"
                  >
                    <Save className={`w-5 h-5 ${slugLoading ? 'animate-pulse' : ''}`} />
                    {slugLoading ? 'Updating...' : 'Update Slug'}
                  </button>
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Slugs Modal */}
        {activeModal === 'categories' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                      <Folder className="w-6 h-6" />
                      Category Slug Management
                    </h3>
                    <p className="text-green-100 mt-1">Manage URL slugs for categories</p>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Search Bar with Instructions */}
                <div className="mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-green-800 flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Start typing to search for categories by name. Results will appear automatically.
                    </p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search categories by name (e.g., 'Programming', 'Design', 'Business')..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                      autoFocus
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  {searchTerm && (
                    <p className="text-sm text-gray-500 mt-2">
                      Found {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'} matching "{searchTerm}"
                    </p>
                  )}
                </div>

                {/* Categories List */}
                <div className="max-h-96 overflow-y-auto border-2 border-gray-200 rounded-lg">
                  {coursesLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 font-medium">Searching categories...</p>
                      <p className="text-gray-500 text-sm mt-1">Finding matches for "{searchTerm}"</p>
                    </div>
                  ) : filteredCategories.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Folder className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium text-lg mb-2">
                        {searchTerm.trim() ? 'No categories found' : 'Start searching for categories'}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {searchTerm.trim() 
                          ? `No categories match "${searchTerm}". Try different keywords.`
                          : 'Type in search box above to find categories to manage.'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredCategories.map((category) => (
                        <div key={category.id} className="p-4 hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition-all duration-200 group">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 pr-4">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                                    <Folder className="w-5 h-5 text-white" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 text-base truncate group-hover:text-green-700 transition-colors">
                                    {category.name}
                                  </h4>
                                  <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border">
                                      <Globe className="w-3.5 h-3.5 text-gray-400" />
                                      <span className={
                                        category.slug ? 'text-gray-700' : 'text-gray-400 italic'
                                      }>
                                        {category.slug || 'No slug set'}
                                      </span>
                                    </div>
                                    {!category.slug && (
                                      <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium border border-amber-200">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                        Needs slug
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <button
                                onClick={() => handleEditCategory(category)}
                                disabled={coursesLoading}
                                className="group/btn relative w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98]"
                              >
                                <Edit2 className="w-4 h-4 transition-transform duration-200 group-hover/btn:rotate-12" />
                                <div className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity duration-200"></div>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Category Slug Modal */}
        {selectedCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Edit2 className="w-5 h-5" />
                      Edit Category Slug
                    </h3>
                    <p className="text-green-100 mt-1 text-sm">Modify URL slug for this category</p>
                  </div>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Category Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Category Name</p>
                  <p className="font-semibold text-gray-900 text-lg">{selectedCategory.name}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                      ID: {selectedCategory.id}
                    </div>
                  </div>
                </div>

                {/* Slug Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Link className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={editingCategorySlug}
                      onChange={(e) => setEditingCategorySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))}
                      placeholder="category-url-slug"
                      className="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <span className="text-amber-500">💡</span>
                    Use lowercase letters, numbers, and hyphens only. No spaces or special characters.
                  </p>
                  {editingCategorySlug && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Preview URL:</strong> /categories/{editingCategorySlug}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateCategorySlug}
                    disabled={slugLoading || !editingCategorySlug.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg transition-all"
                  >
                    <Save className={`w-5 h-5 ${slugLoading ? 'animate-pulse' : ''}`} />
                    {slugLoading ? 'Updating...' : 'Update Slug'}
                  </button>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Career Path Slugs Modal */}
        {activeModal === 'career-paths' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                      <Target className="w-6 h-6" />
                      Career Path Slug Management
                    </h3>
                    <p className="text-purple-100 mt-1">Manage URL slugs for career paths</p>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Search Bar with Instructions */}
                <div className="mb-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-purple-800 flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Start typing to search for career paths by title. Results will appear automatically.
                    </p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search career paths by title (e.g., 'Web Development', 'Data Science', 'UX Design')..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                      autoFocus
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  {searchTerm && (
                    <p className="text-sm text-gray-500 mt-2">
                      Found {filteredCareerPaths.length} career path{filteredCareerPaths.length !== 1 ? 's' : ''} matching "{searchTerm}"
                    </p>
                  )}
                </div>

                {/* Career Paths List */}
                <div className="max-h-96 overflow-y-auto border-2 border-gray-200 rounded-lg">
                  {coursesLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 font-medium">Searching career paths...</p>
                      <p className="text-gray-500 text-sm mt-1">Finding matches for "{searchTerm}"</p>
                    </div>
                  ) : filteredCareerPaths.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Target className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium text-lg mb-2">
                        {searchTerm.trim() ? 'No career paths found' : 'Start searching for career paths'}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {searchTerm.trim() 
                          ? `No career paths match "${searchTerm}". Try different keywords.`
                          : 'Type in search box above to find career paths to manage.'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredCareerPaths.map((careerPath) => (
                        <div key={careerPath.id} className="p-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-transparent transition-all duration-200 group">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 pr-4">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                                    <Target className="w-5 h-5 text-white" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 text-base truncate group-hover:text-purple-700 transition-colors">
                                    {careerPath.title}
                                  </h4>
                                  <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border">
                                      <Globe className="w-3.5 h-3.5 text-gray-400" />
                                      <span className={
                                        careerPath.slug ? 'text-gray-700' : 'text-gray-400 italic'
                                      }>
                                        {careerPath.slug || 'No slug set'}
                                      </span>
                                    </div>
                                    {!careerPath.slug && (
                                      <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium border border-amber-200">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                        Needs slug
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <button
                                onClick={() => handleEditCareerPath(careerPath)}
                                disabled={coursesLoading}
                                className="group/btn relative w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98]"
                              >
                                <Edit2 className="w-4 h-4 transition-transform duration-200 group-hover/btn:rotate-12" />
                                <div className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity duration-200"></div>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Career Path Slug Modal */}
        {selectedCareerPath && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Edit2 className="w-5 h-5" />
                      Edit Career Path Slug
                    </h3>
                    <p className="text-purple-100 mt-1 text-sm">Modify URL slug for this career path</p>
                  </div>
                  <button
                    onClick={() => setSelectedCareerPath(null)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Career Path Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Career Path Title</p>
                  <p className="font-semibold text-gray-900 text-lg">{selectedCareerPath.title}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                      ID: {selectedCareerPath.id}
                    </div>
                  </div>
                </div>

                {/* Slug Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Link className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={editingCareerPathSlug}
                      onChange={(e) => setEditingCareerPathSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))}
                      placeholder="career-path-slug"
                      className="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <span className="text-amber-500">💡</span>
                    Use lowercase letters, numbers, and hyphens only. No spaces or special characters.
                  </p>
                  {editingCareerPathSlug && (
                    <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-sm text-purple-800">
                        <strong>Preview URL:</strong> /career-paths/{editingCareerPathSlug}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateCareerPathSlug}
                    disabled={slugLoading || !editingCareerPathSlug.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg transition-all"
                  >
                    <Save className={`w-5 h-5 ${slugLoading ? 'animate-pulse' : ''}`} />
                    {slugLoading ? 'Updating...' : 'Update Slug'}
                  </button>
                  <button
                    onClick={() => setSelectedCareerPath(null)}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
};

export default SlugManagement;
