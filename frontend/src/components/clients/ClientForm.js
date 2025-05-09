import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createClient, clearClientError, clearClientState } from '../../store/clientSlice';
import Navbar from '../layout/Navbar';
import Sidebar from '../layout/Sidebar';

const ClientForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    details: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { loading, error, success } = useSelector((state) => state.clients);
  const { attendances } = useSelector((state) => state.attendance);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  useEffect(() => {
    // Clear any existing errors and success state
    dispatch(clearClientState());
    
    return () => {
      dispatch(clearClientState());
    };
  }, [dispatch]);

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
      navigate('/clients');
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
    
    if (!formData.name.trim()) {
      errors.name = 'Client name is required';
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
    dispatch(clearClientError());
    
    dispatch(createClient(formData));
  };

  // Check if the user has attended or been excused today
  const canAddClient = () => {
    if (!attendances) return false;
    
    const todayAttendance = attendances.find(
      attendance => attendance.date === today && 
      (attendance.status === 'present' || attendance.status === 'excused')
    );
    
    return !!todayAttendance;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Add Client</h1>
              <button
                onClick={() => navigate('/clients')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Clients
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
            
            {formErrors.non_field_errors && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{formErrors.non_field_errors}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Attendance Check Banner */}
            {!canAddClient() && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      You must record your attendance as "present" or be excused by a Sales Staff member today before adding clients.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Client Name */}
                  <div className="sm:col-span-6">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Client Name *
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!canAddClient()}
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          formErrors.name ? 'border-red-300' : ''
                        } ${!canAddClient() ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      />
                    </div>
                    {formErrors.name && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="sm:col-span-6">
                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                      Contact Information
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="contact"
                        id="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        disabled={!canAddClient()}
                        placeholder="Phone number, email, etc."
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          formErrors.contact ? 'border-red-300' : ''
                        } ${!canAddClient() ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      />
                    </div>
                    {formErrors.contact && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.contact}</p>
                    )}
                  </div>

                  {/* Details */}
                  <div className="sm:col-span-6">
                    <label htmlFor="details" className="block text-sm font-medium text-gray-700">
                      Details
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="details"
                        name="details"
                        rows={4}
                        value={formData.details}
                        onChange={handleChange}
                        disabled={!canAddClient()}
                        placeholder="Additional information about the client"
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          formErrors.details ? 'border-red-300' : ''
                        } ${!canAddClient() ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      />
                    </div>
                    {formErrors.details && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.details}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/clients')}
                    className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || submitting || !canAddClient()}
                    className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      (loading || submitting || !canAddClient()) ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {(loading || submitting) ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      'Create Client'
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

export default ClientForm;
