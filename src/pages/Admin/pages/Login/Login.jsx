import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { adminApiService } from '../../../../services/AdminApi';
import './Login.css';

const Login = () => {
  const { login ,isAuthenticated} = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // Password should be at least 6 characters
    return password.length >= 6;
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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

    if (name === 'email') {
      if (!value.trim()) {
        newErrors.email = 'Email address is required';
      } else if (!validateEmail(value)) {
        newErrors.email = 'Please enter a valid email address';
      } else {
        delete newErrors.email;
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
    
      const response = await adminApiService.login(formData.email, formData.password);
      
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
    debugger;
   if(isAuthenticated)
   {
     navigate('/admin/');
   }
  }, []);
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
                <label htmlFor="email">Email Address</label>
                <div className="input-container">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    placeholder="admin@example.com or student@example.com"
                    className={errors.email ? 'error' : ''}
                  />
                  <span className="input-icon">📧</span>
                </div>
                {errors.email && <div className="field-error">{errors.email}</div>}
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
