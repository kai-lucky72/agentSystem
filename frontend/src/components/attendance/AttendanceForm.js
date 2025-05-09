import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { recordAttendance, getTimeFrames, clearAttendanceState } from '../../store/attendanceSlice';
import Navbar from '../layout/Navbar';
import Sidebar from '../layout/Sidebar';

const AttendanceForm = () => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    sector: '',
    location: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { loading, error, success, timeFrames } = useSelector((state) => state.attendance);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get current time in HH:MM format
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  useEffect(() => {
    // Initialize form with current date and time
    setFormData({
      ...formData,
      date: today,
      time: currentTime,
    });
    
    // Get time frames for today
    dispatch(getTimeFrames({ date: today }));
    
    // Clear any existing errors and success state
    dispatch(clearAttendanceState());
    
    return () => {
      dispatch(clearAttendanceState());
    };
  }, [dispatch, today]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (error) {
      setSubmitting(false);
      if (typeof error === 'object') {
        setFormErrors(error);
      } else {
        setFormErrors({ general: error });
      }
    }
    
    if (success) {
      navigate('/attendance');
    }
  }, [error, success, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear the specific error when user starts typing in the field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  const validate = () => {
    const errors = {};
    
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    
    if (!formData.time) {
      errors.time = 'Time is required';
    }
    
    if (!formData.sector.trim()) {
      errors.sector = 'Sector is required';
    }
    
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }
    
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setSubmitting(true);
    dispatch(clearAttendanceState());
    
    dispatch(recordAttendance(formData));
  };

  // Check if we're within any time frame
  const getTimeFrameStatus = () => {
    if (!timeFrames || timeFrames.length === 0) {
      return {
        hasTimeFrames: false,
        withinTimeFrame: false,
        message: "No attendance time frames have been set for today.",
      };
    }

    // Parse current time
    const [hours, minutes] = currentTime.split(':').map(Number);
    const currentTimeMinutes = hours * 60 + minutes;
    
    // Check if we're within any time frame
    let withinTimeFrame = false;
    let closestTimeFrame = null;
    let minTimeDiff = Infinity;
    
    timeFrames.forEach(tf => {
      const [startHours, startMinutes] = tf.start_time.split(':').map(Number);
      const [endHours, endMinutes] = tf.end_time.split(':').map(Number);
      
      const startTimeMinutes = startHours * 60 + startMinutes;
      const endTimeMinutes = endHours * 60 + endMinutes;
      
      if (currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes) {
        withinTimeFrame = true;
      }
      
      // Find closest time frame
      const timeDiff = Math.abs(startTimeMinutes - currentTimeMinutes);
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        closestTimeFrame = tf;
      }
    });
    
    let message = "";
    if (withinTimeFrame) {
      message = "You are within the scheduled attendance time.";
    } else if (closestTimeFrame) {
      const [startHours, startMinutes] = closestTimeFrame.start_time.split(':');
      const [endHours, endMinutes] = closestTimeFrame.end_time.split(':');
      message = `Attendance time frame: ${startHours}:${startMinutes} - ${endHours}:${endMinutes}. Recording attendance outside this time frame will mark you as late.`;
    }
    
    return {
      hasTimeFrames: true,
      withinTimeFrame,
      message,
    };
  };

  const timeFrameStatus = getTimeFrameStatus();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Record Attendance</h1>
              <button
                onClick={() => navigate('/attendance')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Attendance
              </button>
            </div>
            
            {formErrors.general && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{formErrors.general}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Time Frame Status */}
            <div className={`p-4 mb-4 rounded-md ${
              !timeFrameStatus.hasTimeFrames
                ? 'bg-yellow-50 border-yellow-400'
                : timeFrameStatus.withinTimeFrame
                  ? 'bg-green-50 border-green-400'
                  : 'bg-red-50 border-red-400'
            } border`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {!timeFrameStatus.hasTimeFrames ? (
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : timeFrameStatus.withinTimeFrame ? (
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${
                    !timeFrameStatus.hasTimeFrames
                      ? 'text-yellow-700'
                      : timeFrameStatus.withinTimeFrame
                        ? 'text-green-700'
                        : 'text-red-700'
                  }`}>
                    {timeFrameStatus.message}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Date */}
                  <div className="sm:col-span-3">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        name="date"
                        id="date"
                        value={formData.date}
                        onChange={handleChange}
                        max={today}
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          formErrors.date ? 'border-red-300' : ''
                        }`}
                      />
                    </div>
                    {formErrors.date && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.date}</p>
                    )}
                  </div>

                  {/* Time */}
                  <div className="sm:col-span-3">
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                      Time
                    </label>
                    <div className="mt-1">
                      <input
                        type="time"
                        name="time"
                        id="time"
                        value={formData.time}
                        onChange={handleChange}
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          formErrors.time ? 'border-red-300' : ''
                        }`}
                      />
                    </div>
                    {formErrors.time && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.time}</p>
                    )}
                  </div>

                  {/* Sector */}
                  <div className="sm:col-span-3">
                    <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
                      Sector
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="sector"
                        id="sector"
                        value={formData.sector}
                        onChange={handleChange}
                        placeholder="e.g., North, South, Central"
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          formErrors.sector ? 'border-red-300' : ''
                        }`}
                      />
                    </div>
                    {formErrors.sector && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.sector}</p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="sm:col-span-3">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="location"
                        id="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., Office, Client Site, Remote"
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          formErrors.location ? 'border-red-300' : ''
                        }`}
                      />
                    </div>
                    {formErrors.location && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.location}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/attendance')}
                    className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || submitting}
                    className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      (loading || submitting) ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {(loading || submitting) ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Recording...
                      </>
                    ) : (
                      'Record Attendance'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AttendanceForm;
