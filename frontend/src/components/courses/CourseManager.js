import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = "http://localhost:8080/courses"; 
const USER_ID = localStorage.getItem("userId"); // 🔹 Replace with logged-in userId (from auth/JWT later)

const CourseManager = () => {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const loadDashboardStats = async () => {
    try {
      // fetch enrolled courses count
      const userId = user?.id || localStorage.getItem("userId"); 
      if (userId) {
        const response = await axios.get(`/courses/enrolled/${userId}`);
        
        // backend should return a list of enrolled courses → just take .length
        const enrolledCount = Array.isArray(response.data) 
          ? response.data.length 
          : response.data.count || 0;

        setStats({
          enrolledCourses: enrolledCount,
          studyGroups: 1,  // keep static for now
          suggestedPeers: 5 // keep static for now
        });
      }
    } catch (error) {
      console.error("Failed to load enrolled courses", error);
    }
  };


  // Load all courses
  const loadCourses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/detailes`);
      setAvailableCourses(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
      setError('Failed to load courses');
    }
  };

  // Load enrolled courses
  const loadEnrolledCourses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/enrolled/${USER_ID}`);
      setEnrolledCourses(response.data);
    } catch (error) {
      console.error('Error loading enrolled courses:', error);
      setError('Failed to load enrolled courses');
    }
  };

  useEffect(() => {
    loadCourses();
    loadEnrolledCourses();
  }, []);

  // Enroll in course
  const enrollInCourse = async (course) => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/enroll/${USER_ID}/${course.courseCode}`);
      setEnrolledCourses([...enrolledCourses, course]); // update UI
      setError('');
    } catch (error) {
      console.error('Error enrolling in course:', error);
      setError('Failed to enroll in course');
    }
    setLoading(false);
  };

  // Unenroll from course
  const unenrollFromCourse = async (course) => {
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/remove/${USER_ID}/${course.courseCode}`);
      setEnrolledCourses(enrolledCourses.filter(c => c.id !== course.id));
      setError('');
    } catch (error) {
      console.error('Error unenrolling from course:', error);
      setError('Failed to unenroll from course');
    }
    setLoading(false);
  };

  // Fix: check if courseName & courseCode exist before using toLowerCase()
  const filteredCourses = availableCourses.filter(course =>
    (course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     course.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Enrolled Courses */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          My Enrolled Courses ({enrolledCourses.length})
        </h3>
        
        {enrolledCourses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            You haven't enrolled in any courses yet. Browse available courses below to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.map((course) => (
              <div
                key={course.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{course.courseCode}</h4>
                    <p className="text-sm text-gray-600 mt-1">{course.courseName}</p>
                    <p className="text-xs text-gray-500 mt-2">{course.description}</p>
                  </div>
                  <button
                    onClick={() => unenrollFromCourse(course)}
                    disabled={loading}
                    className="ml-2 p-1 text-red-400 hover:text-red-600 disabled:opacity-50"
                    title="Unenroll from course"
                  >
                    {/* <XMarkIcon className="h-4 w-4" /> */}
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Courses */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Available Courses
          </h3>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourses.find(c => c.id === course.id);

            return (
              <div
                key={course.id}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  isEnrolled ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{course.courseCode}</h4>
                    <p className="text-sm text-gray-600 mt-1">{course.courseName}</p>
                    <p className="text-xs text-gray-500 mt-2">{course.description}</p>
                  </div>
                  {!isEnrolled && (
                    <button
                      onClick={() => enrollInCourse(course)}
                      disabled={loading}
                      className="ml-2 p-1 text-primary-600 hover:text-primary-800 disabled:opacity-50"
                      title="Enroll in course"
                    >
                      {/* < className="h-4 w-4" /> */}
                      Enroll
                    </button>
                  )}
                  {isEnrolled && (
                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Enrolled
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredCourses.length === 0 && searchTerm && (
          <p className="text-gray-500 text-center py-8">
            No courses found matching "{searchTerm}"
          </p>
        )}
      </div>
    </div>
  );
};

export default CourseManager;



