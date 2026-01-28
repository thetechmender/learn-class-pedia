import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Home, User, GraduationCap } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">ClassPedia</span>
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/')
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-700 hover:text-primary-600'
                }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            {/* <Link
              to="/courses"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/courses')
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-700 hover:text-primary-600'
                }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Courses</span>
            </Link> */}

            <Link
              to="/course-hierarchy"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/course-hierarchy')
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-700 hover:text-primary-600'
                }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Course</span>
            </Link>

            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}