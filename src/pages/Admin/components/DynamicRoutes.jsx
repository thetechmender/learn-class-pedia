import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { adminApiService } from '../../../services/AdminApi';
import { useAuth } from '../../../context/AuthContext';

// Import all existing components
import Dashboard from '../pages/Dashboard/Dashboard';
import CourseManagement from '../pages/CourseManagement/CourseManagement';
import CareerPath from '../pages/CareerPath/CareerPath';
import CareerPathDetail from '../pages/CareerPath/CareerPathDetail';
import FeaturedMarking from '../pages/FeaturedMarking/FeaturedMarking';
import Reviews from '../pages/Reviews/Reviews';
import CourseUrlManagement from '../pages/CourseUrlManagement/CourseUrlManagement';
import MyCourses from '../pages/MyCourses/MyCourses';
import MyProfile from '../pages/MyProfile/MyProfile';
import Settings from '../pages/Settings/Settings';
import Notifications from '../pages/Notifications/Notifications';
import Support from '../pages/Support/Support';
import CategoryManagement from '../pages/CategoryManagement';
import CareerRoles from '../pages/CareerRoles';
import CareerSkills from '../pages/CareerSkills';
import CourseSkillMapping from '../pages/CourseSkillMapping/CourseSkillMapping';

// Component mapping
const componentMap = {
  Dashboard,
  CourseManagement,
  CareerPath,
  CareerPathDetail,
  FeaturedMarking,
  Reviews,
  CourseUrlManagement,
  MyCourses,
  MyProfile,
  Settings,
  Notifications,
  Support,
  CategoryManagement,
  CareerRoles,
  CareerSkills,
  CourseSkillMapping,
};

// Protected Route Component
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

const DynamicRoutes = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRoutes = async () => {
      // Check if user exists and has roleId
      if (!user) {
        setLoading(false);
        setError('No user authenticated');
        return;
      }

      if (!user.roleId) {
        setLoading(false);
        setError('User role not found');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const userRoutes = await adminApiService.getRoutesByRole(user.roleId);
        
        if (!userRoutes || !Array.isArray(userRoutes)) {
          throw new Error('Invalid routes data received');
        }
        
        setRoutes(userRoutes);
      } catch (err) {
        setError(`Failed to load routes: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadRoutes();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading routes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Extract route path from full path (e.g., /admin/dashboard -> dashboard)
  // But preserve the full path for navigation
  const getRoutePath = (fullPath) => {
    // Remove /admin prefix and keep the rest
    return fullPath.replace('/admin/', '');
  };

  return (
    <Routes>
      {/* Default redirect to dashboard */}
      <Route index element={<Navigate to="/admin/dashboard" replace />} />
      
      {/* Career Path Detail Route */}
      <Route path="career-paths/:id" element={
        <ProtectedRoute>
          <CareerPathDetail />
        </ProtectedRoute>
      } />
      
      {/* Career Roles Route */}
      <Route path="career-roles" element={
        <ProtectedRoute>
          <CareerRoles />
        </ProtectedRoute>
      } />
      
      {/* Career Skills Route */}
      <Route path="career-skills" element={
        <ProtectedRoute>
          <CareerSkills />
        </ProtectedRoute>
      } />
      
      {/* Course Skill Mapping Route */}
      <Route path="course-skill-mapping" element={
        <ProtectedRoute>
          <CourseSkillMapping />
        </ProtectedRoute>
      } />
      
      {/* Dynamic routes based on user role */}
      {routes.map((route) => {
        const Component = componentMap[route.component];
        const routePath = getRoutePath(route.path);
        
        if (!Component) {
          console.warn(`Component ${route.component} not found for route ${route.path}`);
          return null;
        }

        return (
          <Route
            key={route.id}
            path={routePath}
            element={
              <ProtectedRoute>
                <Component />
              </ProtectedRoute>
            }
          />
        );
      })}

      {/* Fallback for unauthorized routes */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default DynamicRoutes;
