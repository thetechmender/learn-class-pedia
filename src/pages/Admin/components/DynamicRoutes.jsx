import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
  
  const { user } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRoutes = async () => {
      console.log('DynamicRoutes - user:', user);
      console.log('DynamicRoutes - user.roleId:', user?.roleId);
      
      // Check if user exists and has roleId
      if (!user) {
        console.log('DynamicRoutes - No user found, setting loading to false');
        setLoading(false);
        setError('No user authenticated');
        return;
      }

      if (!user.roleId) {
        console.log('DynamicRoutes - No roleId found in user object');
        console.log('DynamicRoutes - User object structure:', JSON.stringify(user, null, 2));
        setLoading(false);
        setError('User role not found');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('DynamicRoutes - Calling adminApiService.getRoutesByRole with roleId:', user.roleId);
        const userRoutes = await adminApiService.getRoutesByRole(user.roleId);
        console.log('DynamicRoutes - Routes received:', userRoutes);
        
        if (!userRoutes || !Array.isArray(userRoutes)) {
          throw new Error('Invalid routes data received');
        }
        
        setRoutes(userRoutes);
      } catch (err) {
        console.error('DynamicRoutes - Error loading routes:', err);
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
  const getRoutePath = (fullPath) => {
    return fullPath.split('/').pop();
  };

  return (
    <Routes>
      {/* Default redirect to dashboard */}
      <Route index element={<Navigate to="/admin/dashboard" replace />} />
      
      {/* Career Path Detail Route */}
      <Route path="career-paths/:id" element={<CareerPathDetail />} />
      
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
            element={<Component />}
          />
        );
      })}

      {/* Fallback for unauthorized routes */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default DynamicRoutes;
