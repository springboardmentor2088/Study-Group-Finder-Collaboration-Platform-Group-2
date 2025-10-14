import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CourseManager from '../courses/CourseManager';
import StudyGroups from './StudyGroups';
import PeerSuggestions from './PeerSuggestions';
import { useCourses } from '../../contexts/CoursesContext';
import { AcademicCapIcon, UserGroupIcon, UsersIcon, BookOpenIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = "http://localhost:8080/courses"; 

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const { enrolledCourses } = useCourses();
  const [stats, setStats] = useState({
    enrolledCourses: parseInt(localStorage.getItem('EnrolledCourses')) || 0,
    studyGroups: 0,
    suggestedPeers: 0
  });

  useEffect(() => {
    if (!user) return;
    loadDashboardStats();
  }, [user]);
  

const loadDashboardStats = async () => {
  try {
    const userId = user?.id || localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (!userId || !token) return;

    // 1️⃣ Load enrolled courses count (cached)
    const cachedCount = parseInt(localStorage.getItem("EnrolledCourses")) || 0;
    setStats(prev => ({ ...prev, enrolledCourses: cachedCount }));

    // 2️⃣ Fetch enrolled courses
    const courseResponse = await fetch(`${API_BASE_URL}/enrolled/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!courseResponse.ok)
      throw new Error(`HTTP error! status: ${courseResponse.status}`);

    const courseData = await courseResponse.json();
    const enrolledCount = Array.isArray(courseData)
      ? courseData.length
      : courseData.count || 0;

    setStats(prev => ({ ...prev, enrolledCourses: enrolledCount }));
    localStorage.setItem("EnrolledCourses", enrolledCount);

    // 3️⃣ Fetch joined groups
    const groupResponse = await fetch(`http://localhost:8080/api/groups/joined/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!groupResponse.ok)
      throw new Error(`HTTP error! status: ${groupResponse.status}`);

    const groupData = await groupResponse.json();
    const joinedGroupsCount = Array.isArray(groupData)
      ? groupData.length
      : groupData.count || 0;

    // 4️⃣ Fetch suggested peers
    const peersResponse = await fetch(`http://localhost:8080/courses/${userId}/peers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!peersResponse.ok)
      throw new Error(`HTTP error! status: ${peersResponse.status}`);

    const peersData = await peersResponse.json();
    const suggestedPeersCount = Array.isArray(peersData)
      ? peersData.length
      : peersData.count || 0;

    // 5️⃣ Update dashboard stats with all counts
    setStats(prev => ({
      ...prev,
      studyGroups: joinedGroupsCount,
      suggestedPeers: suggestedPeersCount,
    }));

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
  }
};



  const tabs = [
    { id: 'overview', name: 'Overview', icon: AcademicCapIcon },
    { id: 'courses', name: 'My Courses', icon: BookOpenIcon },
    { id: 'groups', name: 'Study Groups', icon: UserGroupIcon },
    { id: 'peers', name: 'Find Peers', icon: UsersIcon },
  ];

  const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => (
    <div className="card p-4 flex items-center gap-4 bg-white shadow-sm rounded-lg">
      <div className={`p-3 rounded-lg bg-${color}-100`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card p-4 bg-white shadow-sm rounded-lg">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {localStorage.getItem("name")?.split(" ")[0]}! 👋
        </h2>
        <p className="text-gray-600">Ready to connect with your study partners and ace your courses?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="Enrolled Courses" value={stats.enrolledCourses} icon={BookOpenIcon} color="blue" />
        <StatCard title="Study Groups" value={stats.studyGroups} icon={UserGroupIcon} color="green" />
        <StatCard title="Suggested Peers" value={stats.suggestedPeers} icon={UsersIcon} color="purple" />
      </div>

      {/* Quick Actions */}
      <div className="card p-4 bg-white shadow-sm rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button onClick={() => setActiveTab('courses')} className="p-4 border rounded-lg hover:bg-gray-50 text-left transition">
            <BookOpenIcon className="h-6 w-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Manage Courses</h4>
            <p className="text-sm text-gray-500">Add or remove courses</p>
          </button>
          <button onClick={() => setActiveTab('groups')} className="p-4 border rounded-lg hover:bg-gray-50 text-left transition">
            <UserGroupIcon className="h-6 w-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Study Groups</h4>
            <p className="text-sm text-gray-500">Join or create groups</p>
          </button>
          <button onClick={() => setActiveTab('peers')} className="p-4 border rounded-lg hover:bg-gray-50 text-left transition">
            <UsersIcon className="h-6 w-6 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Find Peers</h4>
            <p className="text-sm text-gray-500">Connect with classmates</p>
          </button>
          <button onClick={() => window.location.href = '/profile'} className="p-4 border rounded-lg hover:bg-gray-50 text-left transition">
            <AcademicCapIcon className="h-6 w-6 text-orange-600 mb-2" />
            <h4 className="font-medium text-gray-900">Update Profile</h4>
            <p className="text-sm text-gray-500">Edit your information</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-4 bg-white shadow-sm rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1 sm:mb-0">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <p className="text-sm text-gray-600">You joined the <span className="font-medium">CS101 Study Group</span></p>
            </div>
            <span className="text-xs text-gray-400">2 hours ago</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1 sm:mb-0">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <p className="text-sm text-gray-600">You enrolled in <span className="font-medium">MATH201 - Calculus II</span></p>
            </div>
            <span className="text-xs text-gray-400">1 day ago</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1 sm:mb-0">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <p className="text-sm text-gray-600"><span className="font-medium">Sarah Johnson</span> wants to connect with you</p>
            </div>
            <span className="text-xs text-gray-400">2 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-4 overflow-x-auto">
        <nav className="flex space-x-4 min-w-max">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-3 whitespace-nowrap font-medium text-sm border-b-2 ${
                  activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'courses' && <CourseManager />}
        {activeTab === 'groups' && <StudyGroups />}
        {activeTab === 'peers' && <PeerSuggestions />}
      </div>
    </div>
  );
};

export default Dashboard;
