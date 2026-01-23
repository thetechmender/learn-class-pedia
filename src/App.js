import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LinkedInStyleDemo from './pages/LinkedInStyleDemo';
import AuthenticatedLecture from './pages/AuthenticatedLecture';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Direct access route (for development/testing) */}
          <Route path="/" element={<LinkedInStyleDemo />} />
          <Route path="/demo" element={<LinkedInStyleDemo />} />
          
          {/* Authenticated route - accessed from external apps with token */}
          <Route path="/lecture" element={<AuthenticatedLecture />} />
          <Route path="/classroom" element={<AuthenticatedLecture />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
