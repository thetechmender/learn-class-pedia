import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LinkedInStyleDemo from './pages/LinkedInStyleDemo';
import AuthenticatedLecture from './pages/AuthenticatedLecture';
import AssessmentPage from './pages/AssessmentPage';
import Assessment from './pages/Assessment';

const RootRoute = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || params.get('t');
  if (token) {
    return <AuthenticatedLecture />;
  }
  return <LinkedInStyleDemo />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Direct access route (for development/testing) */}
          <Route path="/" element={<RootRoute />} />
          {/* Authenticated route - accessed from external apps with token */}
          <Route path="/lecture" element={<AuthenticatedLecture />} />
          <Route path="/classroom" element={<AuthenticatedLecture />} />
          
          {/* Assessment route */}
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/assessment/:lectureId" element={<AssessmentPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
