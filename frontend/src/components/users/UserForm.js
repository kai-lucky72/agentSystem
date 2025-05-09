import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createUser, clearUserError, clearUserState } from '../../store/userSlice';
import Navbar from '../layout/Navbar';
import Sidebar from '../layout/Sidebar';
import { ROLES } from '../../utils/roles';

const UserForm = () => {
  const [formData, setFormData] = useState({
    work_id: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { loading, error, success } = useSelector((state) => state.users);
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    // Clear any existing errors and success state
    dispatch(clearUserState());
    
    return () => {
      dispatch(clearUserState());
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
      navigate('/users');
    }
  }, [error, success, navigate]);

  // Get available roles based on current user's role
  const getAvailableRoles = () => {
    const roleHierarchy = {
      [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_STAFF, ROLES.TEAM_LEADER, ROLES.INDIVIDUAL_AGENT, ROLES.SALES_AGENT],
      [ROLES.MANAGER]: [ROLES.SALES_STAFF, ROLES.TEAM_LEADER, ROLES.INDIVIDUAL_AGENT, ROLES.SALES_AGENT],
      [ROLES.SALES_STAFF]: [ROLES.TEAM_LEADER, ROLES.INDIVIDUAL_AGENT, ROLES.SALES_AGENT],
      [ROLES.TEAM_LEADER]: [ROLES.SALES_AGENT],
    };

    return roleHierarchy[currentUser?.role] || [];
  };

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
    
    if (!formData.work_id.trim()) {
      errors.work_id = 'Work ID is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.role) {
      errors.role = 'Role is required';
    }
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
    dispatch(clearUserError());
    
    // Create user data without confirmPassword field
    const userData = {
      work_id: formData.work_id,
      email: formData.email,
      role: formData.role,
    };
    
    // Only include password if one was provided
    if (formData.password) {
      userData.password = formData.password;
    }
    
    dispatch(createUser(userData));
  };

  const availableRoles = getAvailableRoles();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Add User</h1>
              <button
                onClick={() => navigate('/users')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Users
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
            
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Work ID */}
                  <div className="sm:col-span-3">
                    <label htmlFor="work_id" className="block text-sm font-medium text-gray-700">
                      Work ID
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="work_id"
                        id="work_id"
                        value={formData.work_id}
                        onChange={handleChange}
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          formErrors.work_id ? 'border-red-300' : ''
                        }`}
                      />
                    </div>
                    {formErrors.work_id && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.work_id}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="sm:col-span-3">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          formErrors.email ? 'border-red-300' : ''
                        }`}
                      />
                    </div>
                    {formErrors.email && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Role */}
                  <div className="sm:col-span-3">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <div className="mt-1">
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          formErrors.role ? 'border-red-300' : ''
                        }`}
                      >
                        <option value="">Select a role</option>
                        {availableRoles.map((role) => (
                          <option key={role} value={role}>
                            {role.replace('_', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>
                    {formErrors.role && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.role}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="sm:col-span-3">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password (Optional)
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        name="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          formErrors.password ? 'border-red-300' : ''
                        }`}
                      />
                    </div>
                    {formErrors.password && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.password}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      If left blank, the user can log in with just their email.
                    </p>
                  </div>

                  {/* Confirm Password */}
                  {formData.password && (
                    <div className="sm:col-span-3">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm Password
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            formErrors.confirmPassword ? 'border-red-300' : ''
                          }`}
                        />
                      </div>
                      {formErrors.confirmPassword && (
                        <p className="mt-2 text-sm text-red-600">{formErrors.confirmPassword}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/users')}
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
                        Creating...
                      </>
                    ) : (
                      'Create User'
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

export default UserForm;
