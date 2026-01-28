import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Clock, 
  Award,
  TrendingUp,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const [stats] = useState({
    activeCourses: 12,
    hoursLearned: 48,
    completed: 6,
    averageScore: 92
  });

  const [courses] = useState([
    { id: 1, title: 'React Fundamentals', progress: 75, students: 234, image: '📚' },
    { id: 2, title: 'JavaScript Advanced', progress: 60, students: 189, image: '💻' },
    { id: 3, title: 'UI/UX Design', progress: 90, students: 156, image: '🎨' },
    { id: 4, title: 'Node.js Basics', progress: 45, students: 98, image: '⚙️' }
  ]);

  const [recentActivity] = useState([
    { id: 1, action: 'Completed React Fundamentals module', time: '2 hours ago', type: 'complete' },
    { id: 2, action: 'Started JavaScript Advanced course', time: '5 hours ago', type: 'start' },
    { id: 3, action: 'Submitted assignment for UI/UX', time: '1 day ago', type: 'assignment' },
    { id: 4, action: 'Earned certificate in React Basics', time: '2 days ago', type: 'certificate' }
  ]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-2xl font-bold mb-2" style={{fontSize: '1.8rem'}}>Welcome back, John! 👋</h1>
        <p className="text-blue-100 text-lg" style={{fontSize: '1rem'}}>Here's what's happening with your courses today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-green-500 dark:text-green-400 text-sm font-medium">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white" style={{fontSize: '1.5rem'}}>{stats.activeCourses}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm" style={{fontSize: '0.875rem'}}>Active Courses</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-green-500 dark:text-green-400 text-sm font-medium">+8%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white" style={{fontSize: '1.5rem'}}>{stats.hoursLearned}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm" style={{fontSize: '0.875rem'}}>Hours Learned</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-green-500 dark:text-green-400 text-sm font-medium">+15%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white" style={{fontSize: '1.5rem'}}>{stats.completed}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm" style={{fontSize: '0.875rem'}}>Completed</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-green-500 dark:text-green-400 text-sm font-medium">+5%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white" style={{fontSize: '1.5rem'}}>{stats.averageScore}%</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm" style={{fontSize: '0.875rem'}}>Average Score</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Courses Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white" style={{fontSize: '1.25rem'}}>My Courses</h2>
              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">View All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <div key={course.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-2xl">{course.image}</div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm" style={{fontSize: '0.875rem'}}>{course.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400" style={{fontSize: '0.75rem'}}>{course.students} students</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400" style={{fontSize: '0.75rem'}}>
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white" style={{fontSize: '1.25rem'}}>Recent Activity</h2>
              <Activity className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    activity.type === 'complete' ? 'bg-green-500' :
                    activity.type === 'start' ? 'bg-blue-500' :
                    activity.type === 'assignment' ? 'bg-yellow-500' :
                    'bg-purple-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white" style={{fontSize: '0.875rem'}}>{activity.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400" style={{fontSize: '0.75rem'}}>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
