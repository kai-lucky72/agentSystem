import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAttendances, getTimeFrames, excuseAttendance, createTimeFrame } from '../../store/attendanceSlice';
import Navbar from '../layout/Navbar';
import Sidebar from '../layout/Sidebar';
import { ROLES } from '../../utils/roles';

const AttendanceList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showExcuseModal, setShowExcuseModal] = useState(false);
  const [attendanceToExcuse, setAttendanceToExcuse] = useState(null);
  const [showAddTimeFrameModal, setShowAddTimeFrameModal] = useState(false);
  const [timeFrameData, setTimeFrameData] = useState({
    date: '',
    start_time: '',
    end_time: '',
  });

  const dispatch = useDispatch();
  const { attendances, timeFrames, loading, error, success } = useSelector((state) => state.attendance);
  const { user: currentUser } = useSelector((state) => state.auth);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Initialize with today's date if no date is selected
    if (!selectedDate) {
      setSelectedDate(today);
    }

    // Fetch attendances for the selected date
    if (selectedDate) {
      dispatch(getAttendances({ date: selectedDate }));
      dispatch(getTimeFrames({ date: selectedDate }));
    }
  }, [dispatch, selectedDate, today, success]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleExcuseClick = (attendance) => {
    setAttendanceToExcuse(attendance);
    setShowExcuseModal(true);
  };

  const confirmExcuse = () => {
    if (attendanceToExcuse) {
      dispatch(excuseAttendance({ id: attendanceToExcuse.id, excuseData: { status: 'excused' } }))
        .then(() => {
          setShowExcuseModal(false);
          setAttendanceToExcuse(null);
        });
    }
  };

  const cancelExcuse = () => {
    setShowExcuseModal(false);
    setAttendanceToExcuse(null);
  };

  const handleAddTimeFrameClick = () => {
    setTimeFrameData({
      date: selectedDate,
      start_time: '',
      end_time: '',
    });
    setShowAddTimeFrameModal(true);
  };

  const handleTimeFrameChange = (e) => {
    const { name, value } = e.target;
    setTimeFrameData({
      ...timeFrameData,
      [name]: value,
    });
  };

  const submitTimeFrame = () => {
    dispatch(createTimeFrame(timeFrameData))
      .then(() => {
        setShowAddTimeFrameModal(false);
      });
  };

  // Filter attendances based on search term and status filter
  const filteredAttendances = attendances.filter((attendance) => {
    // Filter by user_details
    const matchesSearch = attendance.user_details &&
      (attendance.user_details.work_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
       attendance.user_details.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by status
    const matchesStatus = statusFilter ? attendance.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  // Check if the current user can excuse attendance
  const canExcuseAttendance = () => {
    return currentUser?.role === ROLES.SALES_STAFF;
  };

  // Check if the current user can add time frames
  const canAddTimeFrames = () => {
    return currentUser?.role === ROLES.SALES_STAFF;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Attendance Records</h1>
              <div className="flex space-x-3">
                {currentUser?.role !== ROLES.ADMIN && currentUser?.role !== ROLES.MANAGER && (
                  <Link
                    to="/attendance/record"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Record Attendance
                  </Link>
                )}
                
                {canAddTimeFrames() && (
                  <button
                    onClick={handleAddTimeFrameClick}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Time Frame
                  </button>
                )}
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {typeof error === 'object' ? Object.values(error).join(' ') : error}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Time Frames Section */}
            {timeFrames && timeFrames.length > 0 && (
              <div className="bg-white shadow rounded-lg mb-4 p-4">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Time Frames for {selectedDate}</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          End Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Set By
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {timeFrames.map((timeFrame) => (
                        <tr key={timeFrame.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {timeFrame.start_time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {timeFrame.end_time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {timeFrame.sales_staff_name || 'Sales Staff'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col md:flex-row justify-between space-y-3 md:space-y-0 md:space-x-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <input
                      type="text"
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5"
                      placeholder="Search by work ID or email"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  {/* Date Filter */}
                  <div>
                    <input
                      type="date"
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                      value={selectedDate}
                      onChange={handleDateChange}
                      max={today}
                    />
                  </div>
                  
                  {/* Status Filter */}
                  <div>
                    <select
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                    >
                      <option value="">All Statuses</option>
                      <option value="present">Present</option>
                      <option value="late">Late</option>
                      <option value="excused">Excused</option>
                      <option value="absent">Absent</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="loading-spinner"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sector
                        </th>
                        {canExcuseAttendance() && (
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAttendances.length > 0 ? (
                        filteredAttendances.map((attendance) => (
                          <tr key={attendance.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {attendance.user_details?.work_id || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {attendance.user_details?.email || 'Unknown'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {attendance.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {attendance.time}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                attendance.status === 'present' ? 'bg-green-100 text-green-800' :
                                attendance.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                                attendance.status === 'excused' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {attendance.location}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {attendance.sector}
                            </td>
                            {canExcuseAttendance() && (
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {attendance.status === 'late' && (
                                  <button
                                    onClick={() => handleExcuseClick(attendance)}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    Excuse
                                  </button>
                                )}
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={canExcuseAttendance() ? "7" : "6"} className="px-6 py-4 text-center text-sm text-gray-500">
                            No attendance records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      {/* Excuse Attendance Modal */}
      {showExcuseModal && attendanceToExcuse && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Excuse Late Attendance
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to excuse the late attendance for {attendanceToExcuse.user_details?.work_id || 'this user'}? This will allow them to add clients for today.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmExcuse}
                >
                  Excuse
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={cancelExcuse}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Time Frame Modal */}
      {showAddTimeFrameModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Add Attendance Time Frame
                    </h3>
                    <div className="mt-4">
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        {/* Date */}
                        <div className="sm:col-span-6">
                          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                            Date
                          </label>
                          <div className="mt-1">
                            <input
                              type="date"
                              name="date"
                              id="date"
                              value={timeFrameData.date}
                              onChange={handleTimeFrameChange}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        </div>

                        {/* Start Time */}
                        <div className="sm:col-span-3">
                          <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                            Start Time
                          </label>
                          <div className="mt-1">
                            <input
                              type="time"
                              name="start_time"
                              id="start_time"
                              value={timeFrameData.start_time}
                              onChange={handleTimeFrameChange}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        </div>

                        {/* End Time */}
                        <div className="sm:col-span-3">
                          <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
                            End Time
                          </label>
                          <div className="mt-1">
                            <input
                              type="time"
                              name="end_time"
                              id="end_time"
                              value={timeFrameData.end_time}
                              onChange={handleTimeFrameChange}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={submitTimeFrame}
                >
                  Add Time Frame
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowAddTimeFrameModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceList;
