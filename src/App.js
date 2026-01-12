import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CourseHierarchy from './pages/CourseHierarchy';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<CourseHierarchy />} />
          <Route path="/course-hierarchy" element={<CourseHierarchy />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
