import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUserById, updateUser, resetUserPassword, clearUserError, clearUserState } from '../../store/userSlice';
import Navbar from '../layout/Navbar';
import Sidebar from '../layout/Sidebar';
import { ROLES } from '../../utils/roles';

const UserDetail = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    work_id: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user, loading, error, success } = useSelector((state) => state.users);
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    // Clear any existing errors and success state
    dispatch(clearUserState());
    
    // Fetch user details
    if (id) {
      dispatch(getUserById(id));
    }
    
    return () => {
      dispatch(clearUserState());
    };
  }, [dispatch, id]);

  useEffect(() => {
    // Update form data when user data is fetched
    if (user) {
      setFormData({
        work_id: user.work_id || '',
        email: user.email || '',
        role: user.role || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);

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
      setIsEditing(false);
      setSubmitting(false);
      setShowResetPasswordModal(false);
    }
  }, [error, success]);

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
    
    // Update user data without confirmPassword field
    const userData = {
      work_id: formData.work_id,
      email: formData.email,
      role: formData.role,
    };
    
    // Only include password if one was provided
    if (formData.password) {
      userData.password = formData.password;
    }
    
    dispatch(updateUser({ userId: id, userData }));
  };

  const handleResetPassword = () => {
    setSubmitting(true);
    dispatch(resetUserPassword(id));
  };

  const canManageUser = () => {
    if (!user || !currentUser) return false;
    
    // Users can always manage themselves (except role changes)
    if (user.id === currentUser.id) return true;
    
    // Role hierarchy check
    const roleHierarchy = {
      [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_STAFF, ROLES.TEAM_LEADER, ROLES.INDIVIDUAL_AGENT, ROLES.SALES_AGENT],
      [ROLES.MANAGER]: [ROLES.SALES_STAFF, ROLES.TEAM_LEADER, ROLES.INDIVIDUAL_AGENT, ROLES.SALES_AGENT],
      [ROLES.SALES_STAFF]: [ROLES.TEAM_LEADER, ROLES.INDIVIDUAL_AGENT, ROLES.SALES_AGENT],
      [ROLES.TEAM_LEADER]: [ROLES.SALES_AGENT],
    };
    
    return roleHierarchy[currentUser.role]?.includes(user.role) || false;
  };

  const availableRoles = getAvailableRoles();

  if (loading && !user) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden ml-64">
          <Navbar />
          
          <main className="flex-1 overflow-y-auto p-4">
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden ml-64">
          <Navbar />
          
          <main className="flex-1 overflow-y-auto p-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900">User not found</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      The user you are looking for does not exist or you do not have permission to view it.
                    </p>
                  </div>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => navigate('/users')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Back to Users
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">User Details</h1>
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
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    User Information
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Details and settings for {user.work_id}.
                  </p>
                </div>
                
                {canManageUser() && !isEditing && (
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                    
                    {currentUser?.role === ROLES.ADMIN && (
                      <button
                        type="button"
                        onClick={() => setShowResetPasswordModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Reset Password
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {isEditing ? (
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
                          disabled={user.id === currentUser.id}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            formErrors.role ? 'border-red-300' : ''
                          } ${user.id === currentUser.id ? 'bg-gray-100' : ''}`}
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
                      {user.id === currentUser.id && (
                        <p className="mt-1 text-xs text-gray-500">
                          You cannot change your own role.
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="sm:col-span-3">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        New Password (Optional)
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
                        Leave blank to keep the current password.
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
                      onClick={() => setIsEditing(false)}
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
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="px-4 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Work ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user.work_id}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Role</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'manager' ? 'bg-indigo-100 text-indigo-800' :
                          user.role === 'sales_staff' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'team_leader' ? 'bg-green-100 text-green-800' :
                          user.role === 'individual_agent' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role.replace('_', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())}
                        </span>
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Created On</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(user.created_at).toLocaleDateString()}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Created By</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {user.created_by_name || 'System'}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      {/* Reset Password Confirmation Modal */}
      {showResetPasswordModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Reset Password
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to reset the password for {user.work_id}? This will remove their current password, allowing them to log in with just their email.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${
                    (loading || submitting) ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  onClick={handleResetPassword}
                  disabled={loading || submitting}
                >
                  {(loading || submitting) ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowResetPasswordModal(false)}
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

export default UserDetail;
