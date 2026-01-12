import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Star, Edit, Trash2, ChevronRight, BookOpen } from 'lucide-react';

export default function CourseCard({ course, onEdit, onDelete, showActions = false }) {
  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(course);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this course?')) {
      onDelete(course.id);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-gray-100">
      {/* Image Container with Overlay */}
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
        <img
          src={course.thumbnail || 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'}
          alt={course.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
          <span className="backdrop-blur-md bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30 shadow-lg">
            {course.code || course.level || 'Course'}
          </span>
          {course.price && (
            <span className="backdrop-blur-md bg-emerald-500/80 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30 shadow-lg">
              {course.price}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 relative">
        {/* Title & Description */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
          {course.description}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {course.duration && (
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
              <Clock className="h-4 w-4 mr-2 text-primary-500" />
              <span className="font-medium">{course.duration}</span>
            </div>
          )}
          <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
            <BookOpen className="h-4 w-4 mr-2 text-primary-500" />
            <span className="font-medium">{course.lessons || 12} Lessons</span>
          </div>
          {course.rating && (
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
              <Star className="h-4 w-4 mr-2 text-amber-400 fill-amber-400" />
              <span className="font-medium">{course.rating}</span>
            </div>
          )}
          {course.students && (
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
              <Users className="h-4 w-4 mr-2 text-blue-500" />
              <span className="font-medium">{course.students}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {course.instructor && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs ring-2 ring-white">
                {course.instructor.charAt(0)}
              </div>
              <span className="text-xs font-medium text-gray-600 truncate max-w-[100px]">
                {course.instructor}
              </span>
            </div>
          )}

          <div className="flex items-center space-x-2 ml-auto">
            <Link
              to={`/course/${course.id}`}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
              title="View Details"
            >
              <ChevronRight className="h-5 w-5" />
            </Link>

            {showActions && (
              <>
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-600 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                  title="Edit Course"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-600 hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                  title="Delete Course"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}