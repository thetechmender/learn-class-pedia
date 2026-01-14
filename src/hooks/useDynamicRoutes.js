import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import * as Icons from 'lucide-react';

export const useDynamicRoutes = () => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRoutes = async () => {
      if (!user?.roleId) {
        setLoading(false);
        return;
      }

      try {
        const userRoutes = await apiService.getRoutesByRole(user.roleId);
        setRoutes(userRoutes);
      } catch (err) {
        setError('Failed to load routes');
        console.error('Error loading routes:', err);
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
