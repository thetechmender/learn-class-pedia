/**
 * Authentication debugging utilities
 */

export const debugAuth = () => {
  const token = localStorage.getItem('adminToken');
  
  if (token) {
    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < now;
      
      if (isExpired) {
        console.warn('⚠️ Token is expired! This is likely causing 401 errors.');
      }
    } catch (error) {
      console.error('❌ Error decoding token:', error);
    }
  } else {
    console.warn('❌ No token found in localStorage');
  }
  
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
