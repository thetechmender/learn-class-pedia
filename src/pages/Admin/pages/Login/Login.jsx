import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { useAdmin } from '../../../../hooks/api/useAdmin';
import './Login.css';

const Login = () => {
  const { login ,isAuthenticated} = useAuth();
  const { login: adminLogin } = useAdmin();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Clear cache and localStorage on login page access
  useEffect(() => {
    const clearAppCache = () => {
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(';').forEach((cookie) => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
    
    };

    clearAppCache();
  }, []);

  const validateUsername = (username) => {
    // Username should be at least 3 characters
    return username.length >= 3;
  };

  const validatePassword = (password) => {
    // Password should be at least 6 characters
    return password.length >= 6;
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!validateUsername(formData.username)) {
      newErrors.username = 'Username must be at least 3 characters long';
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const newErrors = { ...errors };

    if (name === 'username') {
      if (!value.trim()) {
        newErrors.username = 'Username is required';
      } else if (!validateUsername(value)) {
        newErrors.username = 'Username must be at least 3 characters long';
      } else {
        delete newErrors.username;
      }
    }

    if (name === 'password') {
      if (!value.trim()) {
        newErrors.password = 'Password is required';
      } else if (!validatePassword(value)) {
        newErrors.password = 'Password must be at least 6 characters long';
      } else {
        delete newErrors.password;
      }
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
    
      const response = await adminLogin(formData.username, formData.password);
      
      if (response.success) {
        login(response.user);
        navigate('/admin/');
      } else {
        setAuthError(response.message || 'Invalid credentials');
      }
    } catch (error) {
      setAuthError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
   if(isAuthenticated)
   {
     navigate('/admin/');
   }
  }, [isAuthenticated, navigate]);
  return (
    <div className="login-container">
      <div className="login-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>
      
      <div className="login-content">
        {/* Left Side - Animated Avatar */}
        <div className="login-left">
          <div className="avatar-container">
            <div className="reading-avatar">
              <div className="avatar-head">
                <div className="face">
                  <div className="eyes">
                    <div className="eye left-eye"></div>
                    <div className="eye right-eye"></div>
                  </div>
                  <div className="mouth"></div>
                </div>
                <div className="hair"></div>
              </div>
              <div className="avatar-body">
                <div className="book">
                  <div className="book-page left-page"></div>
                  <div className="book-page right-page"></div>
                  <div className="book-spine"></div>
                </div>
                <div className="arms">
                  <div className="arm left-arm"></div>
                  <div className="arm right-arm"></div>
                </div>
              </div>
            </div>
            <div className="floating-books">
              <div className="floating-book book-1">📚</div>
              <div className="floating-book book-2">📖</div>
              <div className="floating-book book-3">📘</div>
              <div className="floating-book book-4">📗</div>
            </div>
          </div>
          <div className="welcome-text">
            <h2>Welcome to ClassPedia</h2>
            <p>Your gateway to knowledge management and educational excellence</p>
            <div className="features">
              <div className="feature">
                <span className="feature-icon">🎓</span>
                <span>Course Management</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📊</span>
                <span>Analytics & Insights</span>
              </div>
              <div className="feature">
                <span className="feature-icon">👥</span>
                <span>Student Engagement</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-right">
          <div className="login-card">
            <div className="login-header">
              <div className="admin-image-container">
                <div className="admin-image">
                  <div className="security-shield">
                    <span className="shield-icon">🛡️</span>
                  </div>
                  <div className="security-badge">
                    <span className="badge-icon">🔐</span>
                  </div>
                </div>
              </div>
              <h1>Admin Portal</h1>
              <p> ClassPedia Management System</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <div className="input-container">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    placeholder="Enter your username"
                    className={errors.username ? 'error' : ''}
                  />
                  <span className="input-icon">�</span>
                </div>
                {errors.username && <div className="field-error">{errors.username}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-container">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    placeholder="password"
                    className={errors.password ? 'error' : ''}
                  />
                  <span className="input-icon">🔒</span>
                </div>
                {errors.password && <div className="field-error">{errors.password}</div>}
              </div>

              {authError && <div className="error-message">{authError}</div>}

              <button 
                type="submit" 
                className={`login-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
