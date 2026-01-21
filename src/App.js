import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LinkedInStyleDemo from './pages/LinkedInStyleDemo';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LinkedInStyleDemo />} />
          <Route path="/demo" element={<LinkedInStyleDemo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
