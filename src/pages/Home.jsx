import React from 'react';
import { Link } from 'react-router-dom';
import ThreeScene from '../components/ThreeScene';
import { ArrowRight, BookOpen, Users, Award } from 'lucide-react';

export default function Home() {
  return (
    <div className="pt-16">
      {/* Hero Section with 3D Animation */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-700 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <ThreeScene />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Learn Without Limits
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Discover thousands of courses from expert instructors and advance your career
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Explore Courses
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose ClassPedia?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide the best learning experience with cutting-edge technology and expert instructors
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
              <BookOpen className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Expert-Led Courses</h3>
              <p className="text-gray-600">
                Learn from industry professionals with years of real-world experience
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-lg shadow-md">
              <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Community Learning</h3>
              <p className="text-gray-600">
                Join a community of learners and collaborate on projects together
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-lg shadow-md">
              <Award className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Certificates</h3>
              <p className="text-gray-600">
                Earn recognized certificates to showcase your new skills
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of students already learning on our platform
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Browse Courses
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}