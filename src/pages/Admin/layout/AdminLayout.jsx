import {  useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";

import { Navbar } from "./navbar";
import SidebarComponent, { Sidebar } from "./SidebarComponent";

const AdminLayout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleMenuClick = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSidebarClose = () => {
    setMobileMenuOpen(false);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };



  return (
    <div className={`admin-dashboard ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen flex`}>
      {/* Sidebar */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={handleSidebarClose}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main area */}
      <div className="flex-1 transition-all duration-300">
        {/* Top Navbar - Fixed */}
        <div className={`fixed top-0 right-0 z-50 transition-all duration-300 ${
          isCollapsed ? 'lg:left-20' : 'lg:left-64'
        } left-0`}>
          <Navbar onMenuClick={handleMenuClick} />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-8 pt-20 lg:pt-16">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
