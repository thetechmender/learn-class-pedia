/**
 * Authentication debugging utilities
 */

export const debugAuth = () => {
  const token = localStorage.getItem('adminToken');
  
  console.group('🔍 Authentication Debug');
  console.log('Token exists:', !!token);
  
  if (token) {
    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < now;
      
      console.log('Token payload:', payload);
      console.log('Token expires at:', new Date(payload.exp * 1000));
      console.log('Current time:', new Date(now * 1000));
      console.log('Token is expired:', isExpired);
      console.log('Time until expiration:', payload.exp - now, 'seconds');
      
      if (isExpired) {
        console.warn('⚠️ Token is expired! This is likely causing 401 errors.');
      }
    } catch (error) {
      console.error('❌ Error decoding token:', error);
      console.log('Token length:', token.length);
      console.log('Token starts with:', token.substring(0, 20) + '...');
    }
  } else {
    console.warn('❌ No token found in localStorage');
  }
  
  console.groupEnd();
  
  return {
    hasToken: !!token,
    isExpired: token ? (() => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp < Math.floor(Date.now() / 1000);
      } catch {
        return true; // Assume expired if we can't decode
      }
    })() : true
  };
};

export const checkTokenBeforeRequest = () => {
  const authStatus = debugAuth();
  
  if (!authStatus.hasToken) {
    throw new Error('No authentication token found. Please log in again.');
  }
  
  if (authStatus.isExpired) {
    localStorage.removeItem('adminToken'); // Clear expired token
    throw new Error('Authentication token has expired. Please log in again.');
  }
  
  return true;
};
