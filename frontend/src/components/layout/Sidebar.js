import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROLES } from '../../utils/roles';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Define navigation items based on user role
  const getNavItems = () => {
    const navItems = [
      {
        path: '/dashboard',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
        label: 'Dashboard',
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_STAFF, ROLES.TEAM_LEADER, ROLES.INDIVIDUAL_AGENT, ROLES.SALES_AGENT],
      },
      {
        path: '/users',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
        label: 'Users',
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_STAFF, ROLES.TEAM_LEADER],
      },
      {
        path: '/attendance',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
        label: 'Attendance',
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_STAFF, ROLES.TEAM_LEADER, ROLES.INDIVIDUAL_AGENT, ROLES.SALES_AGENT],
      },
      {
        path: '/clients',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
        label: 'Clients',
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_STAFF, ROLES.TEAM_LEADER, ROLES.INDIVIDUAL_AGENT, ROLES.SALES_AGENT],
      },
      {
        path: '/reports',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        label: 'Reports',
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_STAFF, ROLES.TEAM_LEADER, ROLES.INDIVIDUAL_AGENT, ROLES.SALES_AGENT],
      },
      {
        path: '/performance',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
        label: 'Performance',
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_STAFF, ROLES.TEAM_LEADER, ROLES.INDIVIDUAL_AGENT, ROLES.SALES_AGENT],
      },
      {
        path: '/notifications',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        ),
        label: 'Notifications',
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_STAFF, ROLES.TEAM_LEADER, ROLES.INDIVIDUAL_AGENT, ROLES.SALES_AGENT],
      },
    ];

    // Filter navigation items based on user role
    return navItems.filter((item) => item.roles.includes(user?.role));
  };

  return (
    <div className={`bg-gray-800 text-white ${collapsed ? 'w-20' : 'w-64'} flex flex-col h-screen fixed transition-all duration-300`}>
      <div className="p-4 flex justify-between items-center border-b border-gray-700">
        <div className={`${collapsed ? 'hidden' : 'block'}`}>
          <h2 className="text-xl font-bold">Team App</h2>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          {collapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>
      
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="pt-5 px-2 space-y-1">
          {getNavItems().map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${
                isActive(item.path)
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              } ${
                collapsed ? 'justify-center' : 'justify-start'
              } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
            >
              <div className="mr-3 h-6 w-6">{item.icon}</div>
              <span className={`${collapsed ? 'hidden' : 'block'}`}>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
