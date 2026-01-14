import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { ThemeProvider } from '../../context/ThemeContext';
import { ProtectedRoute } from './components/DynamicRoutes';
import AdminLayout from './layout/AdminLayout';
import Login from './pages/Login/Login';
import { AuthProvider } from '../../context/AuthContext';
import DynamicRoutes from './components/DynamicRoutes';

const AdminApp = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <DynamicRoutes />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default AdminApp;
