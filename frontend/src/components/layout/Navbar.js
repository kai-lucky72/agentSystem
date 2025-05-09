import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';
import { getUnreadNotifications, markNotificationRead } from '../../store/notificationSlice';

const Navbar = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector(state => state.auth);
  const { notifications, unreadCount } = useSelector(state => state.notifications);

  // Fetch unread notifications on component mount
  useEffect(() => {
    dispatch(getUnreadNotifications());
  }, [dispatch]);

  useEffect(() => {
    // Close menus when clicked outside
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleMarkNotificationRead = (notificationId) => {
    dispatch(markNotificationRead(notificationId));
  };

  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    
    // Less than a minute
    if (diffMs < 60000) {
      return 'Just now';
    }
    
    // Less than an hour
    if (diffMs < 3600000) {
      const minutes = Math.floor(diffMs / 60000);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // Less than a day
    if (diffMs < 86400000) {
      const hours = Math.floor(diffMs / 3600000);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // For older notifications, show the date
    return date.toLocaleDateString();
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Team Management</h1>
            </div>
          </div>
          
          <div className="flex items-center">
            {/* Notifications */}
            <div className="ml-4 relative" ref={notificationsRef}>
              <button
                type="button"
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {notificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100 font-medium">
                      Notifications
                    </div>
                    
                    {notifications && notifications.length > 0 ? (
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.slice(0, 5).map((notification) => (
                          <Link
                            key={notification.id}
                            to="/notifications"
                            onClick={() => handleMarkNotificationRead(notification.id)}
                            className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${!notification.is_read ? 'bg-blue-50' : ''}`}
                          >
                            <div className="flex justify-between">
                              <div className="font-medium">{notification.message}</div>
                              <div className="text-xs text-gray-500">
                                {formatNotificationTime(notification.created_at)}
                              </div>
                            </div>
                            {notification.sender && (
                              <div className="text-xs text-gray-500">
                                From: {notification.sender_details ? notification.sender_details.work_id : 'System'}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        No notifications
                      </div>
                    )}
                    
                    <div className="border-t border-gray-100 px-4 py-2">
                      <Link
                        to="/notifications"
                        className="block text-sm text-blue-600 hover:text-blue-500"
                        onClick={() => setNotificationsOpen(false)}
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* User menu */}
            <div className="ml-4 relative" ref={userMenuRef}>
              <div>
                <button
                  type="button"
                  className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {user?.work_id?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="ml-2 text-gray-700 hidden md:block">
                    {user?.work_id || 'User'}
                  </span>
                  <svg className="ml-1 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              {userMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium">{user?.work_id || 'User'}</div>
                      <div className="text-gray-500 capitalize">{user?.role?.replace('_', ' ') || 'User'}</div>
                    </div>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
