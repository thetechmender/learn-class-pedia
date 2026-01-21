import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CourseHierarchy from './pages/CourseHierarchy';
import LinkedInStyleDemo from './pages/LinkedInStyleDemo';
import AdminApp from './pages/Admin/AdminApp';
import { ToastProvider } from './components/ToastProvider';

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LinkedInStyleDemo />} />
            <Route path="/course-hierarchy" element={<CourseHierarchy />} />
            <Route path="/demo" element={<LinkedInStyleDemo />} />
            <Route path="/admin/*" element={<AdminApp />} />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
