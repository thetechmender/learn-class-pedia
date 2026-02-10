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
      // Check if user exists
      if (!user) {
        setLoading(false);
        setError('No user authenticated');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const userRoutes = await adminApiService.getRoutesByRole();
        
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
