import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { getUnreadNotifications, getNotifications } from '../../store/notificationSlice';
import { getAttendanceByDate } from '../../store/attendanceSlice';
import { getReportsSubmittedToMe, getMySubmittedReports } from '../../store/reportSlice';
import { getPerformanceRecords } from '../../store/performanceSlice';
import { ROLES } from '../../utils/roles';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { notifications, unreadCount } = useSelector(state => state.notifications);
  const { attendances } = useSelector(state => state.attendance);
  const { submittedToMe, mySubmissions } = useSelector(state => state.reports);
  const { performanceRecords } = useSelector(state => state.performance);

  const [userAttendanceToday, setUserAttendanceToday] = useState(null);
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [myPendingReportsCount, setMyPendingReportsCount] = useState(0);

  // Get today's date in format YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Load dashboard data
    dispatch(getUnreadNotifications());
    dispatch(getNotifications());
    dispatch(getAttendanceByDate(today));
    dispatch(getReportsSubmittedToMe({ status: 'pending' }));
    dispatch(getMySubmittedReports());
    dispatch(getPerformanceRecords());
  }, [dispatch, today]);

  useEffect(() => {
    // Find user's attendance for today
    if (user && attendances && attendances.length > 0) {
      const userAttendance = attendances.find(a => a.user === user.id);
      setUserAttendanceToday(userAttendance || null);
    }

    // Count pending reports
    if (submittedToMe) {
      setPendingReportsCount(submittedToMe.filter(r => r.status === 'pending').length);
    }

    if (mySubmissions) {
      setMyPendingReportsCount(mySubmissions.filter(r => r.status === 'pending').length);
    }
  }, [user, attendances, submittedToMe, mySubmissions]);

  // Render performance chart if data exists
  useEffect(() => {
    if (performanceRecords && performanceRecords.length > 0) {
      const canvas = document.getElementById('performanceChart');
      if (canvas) {
        // Destroy previous chart instance if it exists
        const chartInstance = Chart.getChart(canvas);
        if (chartInstance) {
          chartInstance.destroy();
        }

        // Get latest performance record
        const latestRecord = performanceRecords[0];
        if (latestRecord && latestRecord.metrics) {
          const metrics = latestRecord.metrics;
          const labels = Object.keys(metrics);
          const data = Object.values(metrics);

          new Chart(canvas, {
            type: 'bar',
            data: {
              labels,
              datasets: [{
                label: `${latestRecord.period.charAt(0).toUpperCase() + latestRecord.period.slice(1)} Performance`,
                data,
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          });
        }
      }
    }
  }, [performanceRecords]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
            
            {/* Welcome Message */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-medium text-gray-900 mb-2">
                Welcome, {user?.work_id || 'User'}!
              </h2>
              <p className="text-gray-600">
                {`You are logged in as a ${user?.role?.replace('_', ' ').toUpperCase() || 'User'}`}
              </p>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* Notifications Card */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="bg-blue-500 px-4 py-2">
                  <h3 className="text-white font-medium">Notifications</h3>
                </div>
                <div className="p-4">
                  <div className="text-3xl font-bold text-gray-900 mb-2">{unreadCount}</div>
                  <div className="text-gray-600">Unread notifications</div>
                  <Link
                    to="/notifications"
                    className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-500"
                  >
                    View all notifications →
                  </Link>
                </div>
              </div>
              
              {/* Attendance Card */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="bg-green-500 px-4 py-2">
                  <h3 className="text-white font-medium">Today's Attendance</h3>
                </div>
                <div className="p-4">
                  {userAttendanceToday ? (
                    <>
                      <div className="flex items-center mb-2">
                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                          userAttendanceToday.status === 'present' ? 'bg-green-500' :
                          userAttendanceToday.status === 'late' ? 'bg-yellow-500' :
                          userAttendanceToday.status === 'excused' ? 'bg-blue-500' : 'bg-red-500'
                        }`}></span>
                        <span className="text-gray-900 capitalize">{userAttendanceToday.status}</span>
                      </div>
                      <div className="text-gray-600">Recorded at {userAttendanceToday.time}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-gray-900 mb-2">Not recorded yet</div>
                      <Link
                        to="/attendance/record"
                        className="inline-block text-sm text-blue-600 hover:text-blue-500"
                      >
                        Record attendance →
                      </Link>
                    </>
                  )}
                </div>
              </div>
              
              {/* Reports Card */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="bg-purple-500 px-4 py-2">
                  <h3 className="text-white font-medium">Reports</h3>
                </div>
                <div className="p-4">
                  {[ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_STAFF, ROLES.TEAM_LEADER].includes(user?.role) && (
                    <div className="mb-2">
                      <div className="text-3xl font-bold text-gray-900">{pendingReportsCount}</div>
                      <div className="text-gray-600">Reports awaiting your review</div>
                    </div>
                  )}
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{myPendingReportsCount}</div>
                    <div className="text-gray-600">Your pending reports</div>
                  </div>
                  <Link
                    to="/reports"
                    className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-500"
                  >
                    View all reports →
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Performance Chart */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Performance Overview</h2>
              {performanceRecords && performanceRecords.length > 0 ? (
                <div className="h-64">
                  <canvas id="performanceChart"></canvas>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p>No performance data available yet</p>
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Add Client Button (for agents) */}
                {[ROLES.TEAM_LEADER, ROLES.INDIVIDUAL_AGENT, ROLES.SALES_AGENT].includes(user?.role) && (
                  <Link
                    to="/clients/new"
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Add Client</span>
                  </Link>
                )}
                
                {/* Record Attendance Button (for agents) */}
                {[ROLES.TEAM_LEADER, ROLES.INDIVIDUAL_AGENT, ROLES.SALES_AGENT].includes(user?.role) && !userAttendanceToday && (
                  <Link
                    to="/attendance/record"
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Record Attendance</span>
                  </Link>
                )}
                
                {/* Submit Report Button */}
                <Link
                  to="/reports/new"
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Submit Report</span>
                </Link>
                
                {/* Add User Button (for admins, managers, sales staff) */}
                {[ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_STAFF].includes(user?.role) && (
                  <Link
                    to="/users/new"
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Add User</span>
                  </Link>
                )}
                
                {/* Send Notification Button (for admins) */}
                {user?.role === ROLES.ADMIN && (
                  <Link
                    to="/notifications/new"
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span>Send Notification</span>
                  </Link>
                )}
                
                {/* View Performance Button */}
                <Link
                  to="/performance"
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>View Performance</span>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
