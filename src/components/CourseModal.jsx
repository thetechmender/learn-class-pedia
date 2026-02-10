import  { useState, useEffect } from 'react';
import {
  XCircle,
  Trash2,
  Save,
  DollarSign,
  Image,
  BookOpen,
  Plus,
  GripVertical,
  Upload
} from 'lucide-react';

import GenericDropdown from './GenericDropdown';
import MultiSelectDropdown from './MultiSelectDropdown';
import CategoryDropdown from './CategoryDropdown';
import LmsLecturesDropdown from './LmsLecturesDropdown';
import SelectedLecturesTable from './SelectedLecturesTable';

const CourseModal = ({
  isOpen,
  onClose,
  mode, 
  course, 
  categories,
  courseLevels,
  courseTypes,
  badges,
  loading,
  error,
  onSubmit,
  dropdownLoading,
  dropdownError
}) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    overview: '',
    languageCode: 'EN',
    courseTypeId: 0,
    categoryId: 0,
    courseLevelId: 0,
    isPaid: true,
    price: '',
    discountedPrice: '',
    currencyCode: 'USD',
    thumbnailUrl: '',
    promoVideoUrl: '',
    badgeIds: [],
    sections: [],
    directLectures: [],
    thumbnailFile: null,
    promoVideoFile: null
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (course && mode === 'edit') {
      // Transform sections to include moduleName and lectures properly
      const transformedSections = (course.sections || []).map(section => ({
        moduleName: section.moduleName || '',
        title: section.title || '',
        description: section.description || '',
        sortOrder: section.sortOrder || 0,
        lectures: (section.lectures || section.courseDetails || []).map(lecture => ({
          id: lecture.id || lecture.lmscourseMappingId,
          title: lecture.title || '',
          lectureType: lecture.lectureType || 1,
          isFreePreview: lecture.isFreePreview || false,
          sortOrder: lecture.sortOrder || 0,
          lmscourseMappingId: lecture.lmscourseMappingId || lecture.id,
          displayName: lecture.displayName || lecture.title,
          lmsCourseName: lecture.lmsCourseName || '',
          lmsModuleName: lecture.lmsModuleName || '',
          lmsLectureName: lecture.lmsLectureName || lecture.title
        }))
      }));

      // Transform direct lectures
      const transformedDirectLectures = (course.directLectures || course.courseDetails || [])
        .filter(lecture => !lecture.sectionId)
        .map(lecture => ({
          id: lecture.id || lecture.lmscourseMappingId,
          title: lecture.title || '',
          lectureType: lecture.lectureType || 1,
          isFreePreview: lecture.isFreePreview || false,
          sortOrder: lecture.sortOrder || 0,
          lmscourseMappingId: lecture.lmscourseMappingId || lecture.id,
          displayName: lecture.displayName || lecture.title,
          lmsCourseName: lecture.lmsCourseName || '',
          lmsModuleName: lecture.lmsModuleName || '',
          lmsLectureName: lecture.lmsLectureName || lecture.title
        }));

      setFormData({
        title: course.title || '',
        subtitle: course.subtitle || '',
        description: course.description || '',
        overview: course.overview || '',
        languageCode: course.languageCode || 'EN',
        courseTypeId: course.courseTypeId || 0,
        categoryId: course.categoryId || 0,
        courseLevelId: course.courseLevelId || 0,
        isPaid: course.isPaid || false,
        price: course.price || '',
        discountedPrice: course.discountedPrice || '',
        currencyCode: course.currencyCode || 'USD',
        thumbnailUrl: course.thumbnailUrl || '',
        promoVideoUrl: course.promoVideoUrl || '',
        badgeIds: course.badgeIds || [],
        sections: transformedSections,
        directLectures: transformedDirectLectures,
        thumbnailFile: null,
        promoVideoFile: null
      });
    } else if (mode === 'create') {
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        overview: '',
        languageCode: 'EN',
        courseTypeId: 0,
        categoryId: 0,
        courseLevelId: 0,
        isPaid: false,
        price: '',
        discountedPrice: '',
        currencyCode: 'USD',
        thumbnailUrl: '',
        promoVideoUrl: '',
        badgeIds: [],
        sections: [],
        directLectures: [],
        thumbnailFile: null,
        promoVideoFile: null
      });
    }
  }, [course, mode]);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      if (name === 'isPaid' && !checked) {
        newData.price = '0';
        newData.discountedPrice = '0';
        newData.currencyCode = 'USD';
      }
      
      // Handle course type changes - preserve lectures and move them appropriately
      if (name === 'courseTypeId') {
        const newCourseTypeId = parseInt(value);
        const oldCourseTypeId = prev.courseTypeId;
        
        // If switching from Basic (3 - direct lectures) to Intermediate/Advanced (1/2 - sections)
        if (oldCourseTypeId === 3 && (newCourseTypeId === 1 || newCourseTypeId === 2)) {
          // Move directLectures to first section
          if (prev.directLectures && prev.directLectures.length > 0) {
            const newSection = {
              moduleName: newCourseTypeId === 1 ? 'Module 1' : '',
              title: `Section 1`,
              description: '',
              sortOrder: 0,
              lectures: prev.directLectures.map((lecture, index) => ({
                ...lecture,
                sortOrder: index
              }))
            };
            newData.sections = [newSection];
            newData.directLectures = [];
          }
        }
        // If switching from Intermediate/Advanced (1/2 - sections) to Basic (3 - direct lectures)
        else if ((oldCourseTypeId === 1 || oldCourseTypeId === 2) && newCourseTypeId === 3) {
          // Move all lectures from all sections to directLectures
          let allLectures = [];
          if (prev.sections && prev.sections.length > 0) {
            prev.sections.forEach(section => {
              if (section.lectures && section.lectures.length > 0) {
                allLectures = [...allLectures, ...section.lectures];
              }
            });
            // Reassign sort order for direct lectures
            allLectures = allLectures.map((lecture, index) => ({
              ...lecture,
              sortOrder: index
            }));
          }
          newData.directLectures = allLectures;
          newData.sections = [];
        }
      }
      
      return newData;
    });
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  const addSection = () => {
    const newSection = {
      moduleName: '',
      title: '',
      description: '',
      sortOrder: formData.sections.length,
      lectures: []
    };
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };
  const updateSection = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  const removeSection = (index) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index).map((section, i) => ({
        ...section,
        sortOrder: i
      }))
    }));
  };

  const moveSection = (dragIndex, dropIndex) => {
    const newSections = [...formData.sections];
    const draggedSection = newSections[dragIndex];
    newSections.splice(dragIndex, 1);
    newSections.splice(dropIndex, 0, draggedSection);
    newSections.forEach((section, i) => {
      section.sortOrder = i;
    });
    
    setFormData(prev => ({
      ...prev,
      sections: newSections
    }));
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex !== dropIndex) {
      moveSection(dragIndex, dropIndex);
    }
  };

  const handleLectureSelect = (lecture, targetSectionIndex = null) => {
    // Use lmscourseMappingId from the API response (backend returns this field)
    const mappingId = lecture.lmscourseMappingId || lecture.id;
    
    const lectureData = {
      id: mappingId,
      title: lecture.lmsLectureName,
      lectureType: 1, // Default to video type
      isFreePreview: false,
      sortOrder: 0, // Will be updated when added
      lmscourseMappingId: mappingId, // This is the correct ID to send to backend
      displayName: lecture.displayName,
      lmsCourseId: lecture.lmsCourseId,
      lmsCourseName: lecture.lmsCourseName,
      lmsModuleId: lecture.lmsModuleId,
      lmsModuleName: lecture.lmsModuleName,
      lmsSubjectId: lecture.lmsSubjectId,
      lmsSubjectName: lecture.lmsSubjectName,
      lmsLectureId: lecture.lmsLectureId,
      lmsLectureName: lecture.lmsLectureName,
      lectureOverview: lecture.lectureOverview,
      lectureDescription: lecture.lectureDescription,
      tags: lecture.tags
    };

    if (formData.courseTypeId === 3) {
      // For courseType 3 (Short Course), add to directLectures
      lectureData.sortOrder = formData.directLectures.length;
      setFormData(prev => ({
        ...prev,
        directLectures: [...prev.directLectures, lectureData]
      }));
    } else if (formData.courseTypeId === 1 || formData.courseTypeId === 2) {
      // For courseType 1 (Professional Certificate) / 2 (Certification), add to sections
      if (formData.sections.length === 0) {
        // If no sections exist, create one first
        const newSection = {
          moduleName: formData.courseTypeId === 1 ? 'Module 1' : '',
          title: `Section 1`,
          description: '',
          sortOrder: 0,
          lectures: [lectureData]
        };
        setFormData(prev => ({
          ...prev,
          sections: [newSection]
        }));
      } else {
        // Add to the specified section or the first one
        const sectionIndex = targetSectionIndex !== null ? targetSectionIndex : 0;
        const updatedSections = [...formData.sections];
        const sectionLectures = updatedSections[sectionIndex].lectures || [];
        lectureData.sortOrder = sectionLectures.length;
        
        updatedSections[sectionIndex] = {
          ...updatedSections[sectionIndex],
          lectures: [...sectionLectures, lectureData]
        };
        
        setFormData(prev => ({
          ...prev,
          sections: updatedSections
        }));
      }
    }
  };

  const handleLectureRemove = (lectureId) => {
    if (formData.courseTypeId === 3) {
      setFormData(prev => ({
        ...prev,
        directLectures: prev.directLectures.filter(lecture => lecture.id !== lectureId)
      }));
    } else if (formData.courseTypeId === 1 || formData.courseTypeId === 2) {
      // Remove from sections
      const updatedSections = formData.sections.map(section => ({
        ...section,
        lectures: (section.lectures || []).filter(lecture => lecture.id !== lectureId)
      }));
      setFormData(prev => ({
        ...prev,
        sections: updatedSections
      }));
    }
  };

  const handleLectureReorder = (dragIndex, dropIndex) => {
    if (formData.courseTypeId === 3) {
      const newLectures = [...formData.directLectures];
      const draggedLecture = newLectures[dragIndex];
      newLectures.splice(dragIndex, 1);
      newLectures.splice(dropIndex, 0, draggedLecture);
      
      // Update sortOrder
      newLectures.forEach((lecture, index) => {
        lecture.sortOrder = index;
      });
      
      setFormData(prev => ({
        ...prev,
        directLectures: newLectures
      }));
    } else if (formData.courseTypeId === 1 || formData.courseTypeId === 2) {
      // Handle section lecture reordering
      // For simplicity, we'll handle the first section's lectures
      if (formData.sections.length > 0 && formData.sections[0].lectures) {
        const updatedSections = [...formData.sections];
        const newLectures = [...updatedSections[0].lectures];
        const draggedLecture = newLectures[dragIndex];
        newLectures.splice(dragIndex, 1);
        newLectures.splice(dropIndex, 0, draggedLecture);
        
        // Update sortOrder
        newLectures.forEach((lecture, index) => {
          lecture.sortOrder = index;
        });
        
        updatedSections[0] = {
          ...updatedSections[0],
          lectures: newLectures
        };
        
        setFormData(prev => ({
          ...prev,
          sections: updatedSections
        }));
      }
    }
  };

  const validateVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        if (duration > 180) { // 180 seconds = 3 minutes
          reject(new Error('Video duration must be less than 3 minutes'));
        } else if (duration < 10) { // Minimum 10 seconds
          reject(new Error('Video duration must be at least 10 seconds'));
        } else {
          resolve(duration);
        }
      };
      
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        reject(new Error('Invalid video file'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title || !formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description || !formData.description.trim()) errors.description = 'Description is required';
    if (!formData.overview || !formData.overview.trim()) errors.overview = 'Overview is required';
    if (formData.courseTypeId === 0) errors.courseTypeId = 'Course type is required';
    if (formData.categoryId === 0) errors.categoryId = 'Category is required';
    if (formData.courseLevelId === 0) errors.courseLevelId = 'Course level is required';
    if (formData.isPaid && (!formData.price || parseFloat(formData.price) <= 0)) {
      errors.price = 'Price must be greater than 0';
    }
    // Course Type 1: Professional Certificate - requires sections with Module 1, 2, 3
    if (formData.courseTypeId === 1) {
      if (!formData.sections || formData.sections.length === 0) {
        errors.sections = 'Professional Certificate courses must have sections';
      } else {
        // Check for required modules
        const moduleNames = formData.sections
          .map(s => (s.moduleName || '').trim())
          .filter(x => x.length > 0);
        
        const requiredModules = ['Module 1', 'Module 2', 'Module 3'];
        requiredModules.forEach(required => {
          if (!moduleNames.some(m => m.toLowerCase() === required.toLowerCase())) {
            errors.sections = `Professional Certificate must include sections for ${required}`;
          }
        });

        formData.sections.forEach((section, index) => {
          if (!section.moduleName || !section.moduleName.trim()) {
            errors[`section_moduleName_${index}`] = 'Module name is required for Professional Certificate';
          }
          if (!section.title || !section.title.trim()) {
            errors[`section_title_${index}`] = 'Section title is required';
          }
          if (!section.lectures || section.lectures.length === 0) {
            errors[`section_lectures_${index}`] = 'At least one lecture is required in this section';
          }
        });
      }
    }
    // Course Type 2: Certification - requires exactly 1 section
    else if (formData.courseTypeId === 2) {
      if (!formData.sections || formData.sections.length !== 1) {
        errors.sections = 'Certification courses must have exactly 1 section';
      } else {
        const section = formData.sections[0];
        if (!section.title || !section.title.trim()) {
          errors[`section_title_0`] = 'Section title is required';
        }
        if (!section.lectures || section.lectures.length === 0) {
          errors[`section_lectures_0`] = 'At least one lecture is required in this section';
        }
      }
    }
    // Course Type 3: Short Course - uses directLectures (no sections)
    else if (formData.courseTypeId === 3) {
      if (formData.sections && formData.sections.length > 0) {
        errors.sections = 'Short courses cannot have sections. Use direct lectures instead.';
      }
      if (!formData.directLectures || formData.directLectures.length === 0) {
        errors.directLectures = 'At least one lecture is required for Short Course';
      }
    }

    // Validate promo video file if present
    if (formData.promoVideoFile) {
      // Check file size (max 50MB for promo video)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (formData.promoVideoFile.size > maxSize) {
        errors.promoVideoFile = 'Promo video size must be less than 50MB';
      }
      
      // Check file type
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      if (!allowedTypes.includes(formData.promoVideoFile.type)) {
        errors.promoVideoFile = 'Invalid video format. Please upload MP4, WebM, or OGG format';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (mode === 'delete') {
      onSubmit();
      return;
    }
    
    // Validate video duration if promo video file is present
    if (formData.promoVideoFile) {
      try {
        await validateVideoDuration(formData.promoVideoFile);
      } catch (error) {
        setFormErrors({ promoVideoFile: error.message });
        return;
      }
    }
    
    if (validateForm()) {
      let submitData;
      let isFormData = false;
      
      // If there's a file, use FormData
      if (formData.thumbnailFile || formData.promoVideoFile) {
        isFormData = true;
        submitData = new FormData();
        submitData.append('title', formData.title);
        submitData.append('subtitle', formData.subtitle);
        submitData.append('description', formData.description);
        submitData.append('overview', formData.overview);
        submitData.append('languageCode', formData.languageCode);
        submitData.append('courseTypeId', parseInt(formData.courseTypeId));
        submitData.append('categoryId', parseInt(formData.categoryId));
        submitData.append('courseLevelId', parseInt(formData.courseLevelId));
        submitData.append('isPaid', formData.isPaid);
        submitData.append('price', parseFloat(formData.price) || 0);
        submitData.append('discountedPrice', parseFloat(formData.discountedPrice) || 0);
        submitData.append('currencyCode', formData.currencyCode);
        submitData.append('promoVideoUrl', formData.promoVideoUrl);
        submitData.append('IsThumbnailRemoved', formData.IsThumbnailRemoved || false);
        submitData.append('IsPromoVideoRemoved', formData.IsPromoVideoRemoved || false);
   
        
        // Add badges array (always include, even if empty)
        if (formData.badgeIds && formData.badgeIds.length > 0) {
          formData.badgeIds.forEach((badgeId, index) => {
            submitData.append(`badgeIds[${index}]`, parseInt(badgeId));
          });
        } else {
          // Always include badges, even if empty array
          submitData.append('badgeIds', JSON.stringify([]));
        }
        
        // Add LMS lectures data based on course type
        // Course Type 3: Short Course - uses directLectures
        if (formData.courseTypeId === 3) {
          if (formData.directLectures && formData.directLectures.length > 0) {
            formData.directLectures.forEach((lecture, index) => {
              submitData.append(`directLectures[${index}].title`, lecture.title || '');
              submitData.append(`directLectures[${index}].lectureType`, lecture.lectureType || 1);
              submitData.append(`directLectures[${index}].isFreePreview`, lecture.isFreePreview || false);
              submitData.append(`directLectures[${index}].sortOrder`, lecture.sortOrder || index);
              submitData.append(`directLectures[${index}].lmscourseMappingId`, lecture.lmscourseMappingId || lecture.id);
            });
          }
        } 
        // Course Type 1 & 2: Professional Certificate / Certification - uses sections
        else if (formData.courseTypeId === 1 || formData.courseTypeId === 2) {
          if (formData.sections && formData.sections.length > 0) {
            formData.sections.forEach((section, sectionIndex) => {
              submitData.append(`sections[${sectionIndex}].moduleName`, section.moduleName || '');
              submitData.append(`sections[${sectionIndex}].title`, section.title || '');
              submitData.append(`sections[${sectionIndex}].description`, section.description || '');
              submitData.append(`sections[${sectionIndex}].sortOrder`, section.sortOrder || sectionIndex);
              
              // Add lectures for this section
              if (section.lectures && section.lectures.length > 0) {
                section.lectures.forEach((lecture, lectureIndex) => {
                  submitData.append(`sections[${sectionIndex}].lectures[${lectureIndex}].title`, lecture.title || '');
                  submitData.append(`sections[${sectionIndex}].lectures[${lectureIndex}].lectureType`, lecture.lectureType || 1);
                  submitData.append(`sections[${sectionIndex}].lectures[${lectureIndex}].isFreePreview`, lecture.isFreePreview || false);
                  submitData.append(`sections[${sectionIndex}].lectures[${lectureIndex}].sortOrder`, lecture.sortOrder || lectureIndex);
                  submitData.append(`sections[${sectionIndex}].lectures[${lectureIndex}].lmscourseMappingId`, lecture.lmscourseMappingId || lecture.id);
                });
              }
            });
          }
        }
        
        // Add the files
        if (formData.thumbnailFile) {
          submitData.append('File', formData.thumbnailFile);
        }
        if (formData.promoVideoFile) {
          submitData.append('PromoVideoFile', formData.promoVideoFile);
        }
      } else {
        // No file, use regular JSON
        submitData = {
          ...formData,
          courseTypeId: parseInt(formData.courseTypeId),
          categoryId: parseInt(formData.categoryId),
          courseLevelId: parseInt(formData.courseLevelId),
          price: parseFloat(formData.price) || 0,
          discountedPrice: parseFloat(formData.discountedPrice) || 0,
          badgeIds: formData.badgeIds.map(id => parseInt(id)),
           IsThumbnailRemoved: formData.IsThumbnailRemoved || false,
  IsPromoVideoRemoved: formData.IsPromoVideoRemoved || false
        };
        
        // Add LMS lectures data based on course type
        // Course Type 3: Short Course - uses directLectures
        if (formData.courseTypeId === 3) {
          submitData.directLectures = formData.directLectures.map((lecture, index) => ({
            title: lecture.title || '',
            lectureType: lecture.lectureType || 1,
            isFreePreview: lecture.isFreePreview || false,
            sortOrder: lecture.sortOrder || index,
            lmscourseMappingId: lecture.lmscourseMappingId || lecture.id
          }));
        } 
        // Course Type 1 & 2: Professional Certificate / Certification - uses sections
        else if (formData.courseTypeId === 1 || formData.courseTypeId === 2) {
          submitData.sections = formData.sections.map((section, sectionIndex) => ({
            moduleName: section.moduleName || '',
            title: section.title || '',
            description: section.description || '',
            sortOrder: section.sortOrder || sectionIndex,
            lectures: (section.lectures || []).map((lecture, lectureIndex) => ({
              title: lecture.title || '',
              lectureType: lecture.lectureType || 1,
              isFreePreview: lecture.isFreePreview || false,
              sortOrder: lecture.sortOrder || lectureIndex,
              lmscourseMappingId: lecture.lmscourseMappingId || lecture.id
            }))
          }));
        }
        
        // Don't send blob URLs
        if (submitData.thumbnailUrl && submitData.thumbnailUrl.startsWith('blob:')) {
          submitData.thumbnailUrl = '';
        }
      }
      
      onSubmit(submitData, isFormData);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create':
        return 'Create New Course';
      case 'edit':
        return 'Update Course';
      case 'delete':
        return 'Delete Course';
      default:
        return 'Course';
    }
  };

  const getSubmitButtonText = () => {
    switch (mode) {
      case 'create':
        return 'Create Course';
      case 'edit':
        return 'Update Course';
      case 'delete':
        return 'Delete Course';
      default:
        return 'Submit';
    }
  };

  const getSubmitButtonIcon = () => {
    switch (mode) {
      case 'create':
      case 'edit':
        return <Save className="w-4 h-4" />;
      case 'delete':
        return <Trash2 className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getSubmitButtonClass = () => {
    return mode === 'delete'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{getModalTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Global Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {/* Delete Confirmation */}
          {mode === 'delete' && course && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center mb-2">
                <Trash2 className="w-5 h-5 text-yellow-600 mr-2" />
                <h3 className="text-lg font-semibold text-yellow-800">Confirm Deletion</h3>
              </div>
              <p className="text-yellow-700 mb-2">
                Are you sure you want to delete the course "{course.title}"?
              </p>
              <p className="text-yellow-600 text-sm">
                This action cannot be undone and will permanently remove the course and all associated data.
              </p>
            </div>
          )}

          {/* Create/Edit Form */}
          {(mode === 'create' || mode === 'edit') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter course title"
                  disabled={loading}
                />
                {formErrors.title && <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>}
              </div>

              {/* Subtitle */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter course subtitle"
                  disabled={loading}
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter course description"
                  disabled={loading}
                />
                {formErrors.description && <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>}
              </div>

              {/* Overview */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Overview *</label>
                <textarea
                  name="overview"
                  value={formData.overview}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.overview ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter course overview"
                  disabled={loading}
                />
                {formErrors.overview && <p className="mt-1 text-sm text-red-600">{formErrors.overview}</p>}
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  name="languageCode"
                  value={formData.languageCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="EN">English</option>
                  <option value="ES">Spanish</option>
                  <option value="FR">French</option>
                  <option value="DE">German</option>
                  <option value="IT">Italian</option>
                  <option value="PT">Portuguese</option>
                  <option value="RU">Russian</option>
                  <option value="ZH">Chinese</option>
                  <option value="JA">Japanese</option>
                  <option value="KO">Korean</option>
                </select>
              </div>

              {/* Course Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Type *</label>
                <GenericDropdown
                  items={courseTypes}
                  value={formData.courseTypeId}
                  onChange={value => handleInputChange({ target: { name: 'courseTypeId', value } })}
                  placeholder="Select course type"
                  loading={dropdownLoading.courseTypes}
                  error={dropdownError.courseTypes}
                  disabled={loading}
                />
                {formErrors.courseTypeId && <p className="mt-1 text-sm text-red-600">{formErrors.courseTypeId}</p>}
                
                {/* Course Type Info */}
                {formData.courseTypeId > 0 && (
                  <div className={`mt-2 p-2 rounded-lg text-xs ${
                    formData.courseTypeId === 1 ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                    formData.courseTypeId === 2 ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    'bg-green-50 text-green-700 border border-green-200'
                  }`}>
                    {formData.courseTypeId === 1 && (
                      <span><strong>Professional Certificate:</strong> Requires sections with Module 1, Module 2, and Module 3. Each section must have lectures.</span>
                    )}
                    {formData.courseTypeId === 2 && (
                      <span><strong>Certification:</strong> Requires exactly 1 section with lectures. Module name is optional.</span>
                    )}
                    {formData.courseTypeId === 3 && (
                      <span><strong>Short Course:</strong> Uses direct lectures without sections.</span>
                    )}
                  </div>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <CategoryDropdown
                  categories={categories}
                  value={formData.categoryId}
                  onChange={value => handleInputChange({ target: { name: 'categoryId', value } })}
                  placeholder="Select category"
                  loading={dropdownLoading.categories}
                  error={dropdownError.categories}
                  disabled={loading}
                />
                {formErrors.categoryId && <p className="mt-1 text-sm text-red-600">{formErrors.categoryId}</p>}
              </div>

              {/* Course Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Level *</label>
                <GenericDropdown
                  items={courseLevels}
                  value={formData.courseLevelId}
                  onChange={value => handleInputChange({ target: { name: 'courseLevelId', value } })}
                  placeholder="Select course level"
                  loading={dropdownLoading.courseLevels}
                  error={dropdownError.courseLevels}
                  disabled={loading}
                />
                {formErrors.courseLevelId && <p className="mt-1 text-sm text-red-600">{formErrors.courseLevelId}</p>}
              </div>

              {/* Pricing */}
              <div className="md:col-span-2">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    name="isPaid"
                    checked={formData.isPaid}
                    onChange={handleInputChange}
                    className="mr-2"
                    disabled={loading}
                  />
                  <label className="text-sm font-medium text-gray-700">This is a paid course</label>
                </div>

                {formData.isPaid && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.price ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="0.00"
                          disabled={loading}
                        />
                      </div>
                      {formErrors.price && <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Discounted Price</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="number"
                          name="discountedPrice"
                          value={formData.discountedPrice}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <select
                        name="currencyCode"
                        value={formData.currencyCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                        <option value="CAD">CAD</option>
                        <option value="AUD">AUD</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Media */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Thumbnail Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Thumbnail</label>
                  <div className="flex items-start gap-4">
                    {/* Thumbnail Preview */}
                    <div className="flex-shrink-0">
                      {formData.thumbnailUrl ? (
                        <div className="relative">
                          <img
                            src={formData.thumbnailUrl}
                            alt="Course thumbnail"
                            className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, thumbnailUrl: '', thumbnailFile: null, IsThumbnailRemoved: true }))}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            disabled={loading}
                          >
                            <XCircle className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                          <Image className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="file"
                          id="thumbnail-upload"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              // Create a temporary preview URL
                              const previewUrl = URL.createObjectURL(file);
                            setFormData(prev => ({
  ...prev,
  thumbnailUrl: previewUrl,
  thumbnailFile: file,
  IsThumbnailRemoved: false
}));
                            }
                          }}
                          className="hidden"
                          disabled={loading}
                        />
                        <label
                          htmlFor="thumbnail-upload"
                          className="inline-flex items-center px-4 py-2 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                        >
                          <Upload className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="text-sm text-blue-600 font-medium">
                            {formData.thumbnailUrl ? 'Change Thumbnail' : 'Upload Thumbnail'}
                          </span>
                        </label>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Upload a course thumbnail (JPEG, PNG, GIF, or WebP, max 5MB)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Promo Video Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Promo Video</label>
                  <div className="flex items-start gap-4">
                    {/* Video Preview */}
                    <div className="flex-shrink-0">
                      {formData.promoVideoFile ? (
                        <div className="relative">
                          <video
                            src={URL.createObjectURL(formData.promoVideoFile)}
                            className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                            muted
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({
  ...prev,
  promoVideoFile: null,
  promoVideoUrl: '',
  IsPromoVideoRemoved: true
}))}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            disabled={loading}
                          >
                            <XCircle className="w-3 h-3" />
                          </button>
                        </div>
                      ) : formData.promoVideoUrl ? (
                        <div className="relative">
                          <video
                            src={formData.promoVideoUrl}
                            className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                            muted
                          />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center">
                            <BookOpen className="w-3 h-3" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                          <BookOpen className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="file"
                          id="promo-video-upload"
                          accept="video/mp4,video/webm,video/ogg"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              try {
                                // Validate video duration
                                await validateVideoDuration(file);
                                setFormData(prev => ({ 
                                  ...prev, 
                                  promoVideoFile: file
                                }));
                                // Clear any existing errors
                                if (formErrors.promoVideoFile) {
                                  setFormErrors(prev => ({ ...prev, promoVideoFile: '' }));
                                }
                              } catch (error) {
                                setFormErrors(prev => ({ ...prev, promoVideoFile: error.message }));
                              }
                            }
                          }}
                          className="hidden"
                          disabled={loading}
                        />
                        <label
                          htmlFor="promo-video-upload"
                          className="inline-flex items-center px-4 py-2 border-2 border-dashed border-green-300 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all"
                        >
                          <Upload className="w-4 h-4 mr-2 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">
                            {formData.promoVideoFile ? 'Change Promo Video' : formData.promoVideoUrl ? 'Replace Promo Video' : 'Upload Promo Video'}
                          </span>
                        </label>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        {formData.promoVideoUrl ? 'Current video from URL. Upload new file to replace.' : 'Upload a promo video (MP4, WebM, or OGG, max 50MB, 10 seconds to 3 minutes)'}
                      </p>
                      {formErrors.promoVideoFile && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.promoVideoFile}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Promo Video URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Promo Video URL</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="url"
                      name="promoVideoUrl"
                      value={formData.promoVideoUrl}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/video.mp4"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Badges</label>
                <MultiSelectDropdown
                  items={badges}
                  values={formData.badgeIds}
                  onChange={badgeIds => handleInputChange({ target: { name: 'badgeIds', value: badgeIds } })}
                  placeholder="Select badges"
                  loading={dropdownLoading.badges}
                  error={dropdownError.badges}
                  disabled={loading}
                />
              </div>

              {/* LMS Lectures - Show for Short Course (Type 3) only */}
              {formData.courseTypeId === 3 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LMS Lectures * (Direct Lectures for Short Course)
                  </label>
                  
                  {/* Search Dropdown */}
                  <div className="mb-4">
                    <LmsLecturesDropdown
                      onLectureSelect={handleLectureSelect}
                      selectedLectures={formData.directLectures}
                      disabled={loading}
                      placeholder="Search and add LMS lectures..."
                    />
                  </div>
                  
                  {formErrors.directLectures && (
                    <p className="mb-2 text-sm text-red-600">{formErrors.directLectures}</p>
                  )}

                  {/* Selected Lectures Table */}
                  <SelectedLecturesTable
                    selectedLectures={formData.directLectures}
                    onLectureRemove={handleLectureRemove}
                    onLectureReorder={handleLectureReorder}
                    courseType={formData.courseTypeId}
                    disabled={loading}
                  />
                </div>
              )}

              {/* Sections - Show for Professional Certificate (Type 1) and Certification (Type 2) */}
              {(formData.courseTypeId === 1 || formData.courseTypeId === 2) && (
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">Course Sections *</label>
                    <button
                      type="button"
                      onClick={addSection}
                      className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      disabled={loading}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Section
                    </button>
                  </div>
                  
                  {formErrors.sections && (
                    <p className="mb-2 text-sm text-red-600">{formErrors.sections}</p>
                  )}

                  {/* Drag and Drop Guide */}
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <GripVertical className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">How to reorder sections:</p>
                        <ul className="text-xs space-y-1 text-blue-700">
                          <li>• Click and hold the <span className="font-semibold">grip icon</span> on the left of any section</li>
                          <li>• Drag the section to your desired position</li>
                          <li>• Release to drop and reorder automatically</li>
                          <li>• Section numbers will update automatically</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {formData.sections.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <GripVertical className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 mb-2">No sections added yet.</p>
                      <p className="text-sm text-gray-400">Click "Add Section" to create your first section, then drag to reorder.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.sections.map((section, index) => (
                        <div
                          key={index}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                          className="border border-gray-200 rounded-lg p-4 bg-gray-50 cursor-move hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                              </div>
                              <h4 className="text-sm font-medium text-gray-900">Section {index + 1}</h4>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSection(index)}
                              className="p-1 text-red-400 hover:text-red-600 disabled:opacity-50"
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Module Name - Required for Professional Certificate (Type 1) and optional for Certification (Type 2) */}
                            {(formData.courseTypeId === 1 || formData.courseTypeId === 2) && (
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Module Name {formData.courseTypeId === 1 ? '*' : ''}
                                </label>
                                {formData.courseTypeId === 1 ? (
                                  <select
                                    value={section.moduleName || ''}
                                    onChange={(e) => updateSection(index, 'moduleName', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                      formErrors[`section_moduleName_${index}`] ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    disabled={loading}
                                  >
                                    <option value="">Select Module</option>
                                    <option value="Module 1">Module 1</option>
                                    <option value="Module 2">Module 2</option>
                                    <option value="Module 3">Module 3</option>
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={section.moduleName || ''}
                                    onChange={(e) => updateSection(index, 'moduleName', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                      formErrors[`section_moduleName_${index}`] ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter module name (optional)"
                                    disabled={loading}
                                  />
                                )}
                                {formErrors[`section_moduleName_${index}`] && (
                                  <p className="mt-1 text-xs text-red-600">{formErrors[`section_moduleName_${index}`]}</p>
                                )}
                              </div>
                            )}
                            <div className={(formData.courseTypeId === 1 || formData.courseTypeId === 2) ? '' : 'md:col-span-2'}>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Section Title *</label>
                              <input
                                type="text"
                                value={section.title}
                                onChange={(e) => updateSection(index, 'title', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                  formErrors[`section_title_${index}`] ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter section title"
                                disabled={loading}
                              />
                              {formErrors[`section_title_${index}`] && (
                                <p className="mt-1 text-xs text-red-600">{formErrors[`section_title_${index}`]}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Section Description</label>
                            <textarea
                              value={section.description}
                              onChange={(e) => updateSection(index, 'description', e.target.value)}
                              rows={2}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                formErrors[`section_description_${index}`] ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Enter section description"
                              disabled={loading}
                            />
                            {formErrors[`section_description_${index}`] && (
                              <p className="mt-1 text-xs text-red-600">{formErrors[`section_description_${index}`]}</p>
                            )}
                          </div>

                          {/* Section Lectures */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-xs font-medium text-gray-700">Section Lectures *</label>
                              <span className="text-xs text-gray-500">
                                {(section.lectures || []).length} lecture{(section.lectures || []).length !== 1 ? 's' : ''}
                              </span>
                            </div>

                            {/* LMS Lectures Dropdown for this section */}
                            <div className="mb-3">
                              <LmsLecturesDropdown
                                onLectureSelect={(lecture) => handleLectureSelect(lecture, index)}
                                selectedLectures={formData.sections.flatMap(s => s.lectures || [])}
                                disabled={loading}
                                placeholder={`Search and add lectures to ${section.title || `Section ${index + 1}`}...`}
                              />
                            </div>
                            
                            {formErrors[`section_lectures_${index}`] && (
                              <p className="mb-2 text-xs text-red-600">{formErrors[`section_lectures_${index}`]}</p>
                            )}

                            {(section.lectures || []).length === 0 ? (
                              <div className="text-center py-4 border border-dashed border-gray-300 rounded bg-gray-50">
                                <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-xs text-gray-500">No lectures in this section yet.</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Use the search dropdown above to add lectures.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {(section.lectures || []).map((lecture, lectureIndex) => (
                                  <div
                                    key={lecture.id}
                                    className="flex items-center space-x-2 p-2 bg-gray-50 rounded border border-gray-200"
                                  >
                                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                    <span className="text-xs font-medium text-gray-500">
                                      #{lectureIndex + 1}
                                    </span>
                                    <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-gray-900 truncate">
                                        {lecture.displayName || lecture.lmsLectureName}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">
                                        {lecture.lmsCourseName} - {lecture.lmsModuleName}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedSections = [...formData.sections];
                                        updatedSections[index] = {
                                          ...updatedSections[index],
                                          lectures: updatedSections[index].lectures.filter(l => l.id !== lecture.id)
                                        };
                                        setFormData(prev => ({
                                          ...prev,
                                          sections: updatedSections
                                        }));
                                      }}
                                      className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                      title="Remove lecture from section"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${getSubmitButtonClass()}`}
              disabled={loading}
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {getSubmitButtonIcon()}
              {getSubmitButtonText()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseModal;
