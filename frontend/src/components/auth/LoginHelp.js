import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { submitLoginHelp, clearError } from '../../store/authSlice';

const LoginHelp = () => {
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    // Clear any existing errors
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    // Display API error if any
    if (error) {
      if (error.detail) {
        setFormError(error.detail);
      } else if (typeof error === 'object') {
        // Convert object errors to string
        const errorMessages = Object.values(error).flat();
        setFormError(errorMessages.join(' '));
      } else {
        setFormError(error);
      }
    }
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!message.trim()) {
      setFormError('Please describe your login issue');
      return;
    }
    
    // Clear form error
    setFormError('');
    
    // Dispatch login help request
    dispatch(submitLoginHelp({ message }))
      .then((action) => {
        if (!action.error) {
          setSubmitted(true);
        }
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Login Help
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Let us know what issue you're having with login
          </p>
        </div>
        
        {formError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{formError}</p>
              </div>
            </div>
          </div>
        )}
        
        {submitted ? (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Your request has been submitted successfully. An administrator will review your request and help you with login access.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="message" className="block text-sm font-medium leading-6 text-gray-900">
                Describe your issue
              </label>
              <div className="mt-2">
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="form-input"
                  placeholder="I can't log in because..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Back to login
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit request'
                )}
              </button>
            </div>
          </form>
        )}
        
        {submitted && (
          <div className="mt-6 flex justify-center">
            <Link
              to="/login"
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginHelp;
