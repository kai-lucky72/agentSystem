import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetUserPassword } from '../../store/userSlice';

const PasswordReset = () => {
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { loading, error, success } = useSelector((state) => state.users);

  useEffect(() => {
    if (error) {
      setIsError(true);
      setMessage(typeof error === 'object' ? Object.values(error).join(' ') : error);
    }
    
    if (success) {
      setIsSuccess(true);
      setIsError(false);
      setMessage('Password reset successful. The user will need to log in without a password.');
    }
  }, [error, success]);

  const handleResetPassword = () => {
    if (userId) {
      dispatch(resetUserPassword(userId));
    } else {
      setIsError(true);
      setMessage('Invalid user ID');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Reset User Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This will remove the user's password, allowing them to log in with just their email.
          </p>
        </div>
        
        {message && (
          <div className={`border-l-4 p-4 mb-4 ${isError ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {isError ? (
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm ${isError ? 'text-red-700' : 'text-green-700'}`}>{message}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col space-y-4">
          {!isSuccess ? (
            <>
              <p className="text-gray-700">
                Are you sure you want to reset this user's password?
              </p>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={loading}
                  className={`flex-1 rounded-md bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner"></div>
                      <span className="ml-2">Resetting...</span>
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleGoBack}
                  disabled={loading}
                  className="flex-1 rounded-md bg-gray-200 px-3.5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={handleGoBack}
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
