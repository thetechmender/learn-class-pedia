import { useState, useEffect } from 'react';
import { adminApiService } from '../services/AdminApi';
import { useAuth } from '../context/AuthContext';
import * as Icons from 'lucide-react';

export const useDynamicRoutes = () => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRoutes = async () => {
      console.log('useDynamicRoutes - user:', user);
      console.log('useDynamicRoutes - user.roleId:', user?.roleId);
      
      // Check if user exists and has roleId
      if (!user) {
        console.log('useDynamicRoutes - No user found, setting loading to false');
        setLoading(false);
        setError('No user authenticated');
        return;
      }

      if (!user.roleId) {
        console.log('useDynamicRoutes - No roleId found in user object');
        console.log('useDynamicRoutes - User object structure:', JSON.stringify(user, null, 2));
        setLoading(false);
        setError('User role not found');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('useDynamicRoutes - Calling adminApiService.getRoutesByRole with roleId:', user.roleId);
        const userRoutes = await adminApiService.getRoutesByRole(user.roleId);
        console.log('useDynamicRoutes - Routes received:', userRoutes);
        
        if (!userRoutes || !Array.isArray(userRoutes)) {
          throw new Error('Invalid routes data received');
        }
        
        setRoutes(userRoutes);
      } catch (err) {
        console.error('useDynamicRoutes - Error loading routes:', err);
        setError(`Failed to load routes: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadRoutes();
  }, [user]);

  // Get icon component by name
  const getIcon = (iconName) => {
    return Icons[iconName] || Icons.LayoutDashboard;
  };

  // Get routes by category
  const getRoutesByCategory = (category) => {
    return routes
      .filter(route => route.category === category)
      .map(route => ({
        ...route,
        icon: getIcon(route.icon)
      }));
  };

  // Get all main navigation items
  const getMainNavItems = () => getRoutesByCategory('main');

  // Get all management items
  const getManagementItems = () => getRoutesByCategory('management');

  // Get all bottom items
  const getBottomItems = () => getRoutesByCategory('bottom');

  return {
    routes,
    loading,
    error,
    getMainNavItems,
    getManagementItems,
    getBottomItems,
    getIcon
  };
};
