import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Login from './components/auth/Login';
import PasswordReset from './components/auth/PasswordReset';
import LoginHelp from './components/auth/LoginHelp';
import Dashboard from './components/layout/Dashboard';
import UserList from './components/users/UserList';
import UserForm from './components/users/UserForm';
import UserDetail from './components/users/UserDetail';
import AttendanceForm from './components/attendance/AttendanceForm';
import AttendanceList from './components/attendance/AttendanceList';
import ClientForm from './components/clients/ClientForm';
import ClientList from './components/clients/ClientList';
import ReportForm from './components/reports/ReportForm';
import ReportList from './components/reports/ReportList';
import PerformanceCharts from './components/performance/PerformanceCharts';
import NotificationList from './components/notifications/NotificationList';
import NotificationForm from './components/notifications/NotificationForm';
import { checkAuth } from './store/authSlice';
import { ROLES } from './utils/roles';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Define routes based on user role
  const getRoutesForRole = (role) => {
    const routes = [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'notifications', element: <NotificationList /> },
      { path: 'performance', element: <PerformanceCharts /> },
    ];

    // Routes for admin
    if (role === ROLES.ADMIN) {
      routes.push(
        { path: 'users', element: <UserList /> },
        { path: 'users/new', element: <UserForm /> },
        { path: 'users/:id', element: <UserDetail /> },
        { path: 'attendance', element: <AttendanceList /> },
        { path: 'clients', element: <ClientList /> },
        { path: 'reports', element: <ReportList /> },
        { path: 'notifications/new', element: <NotificationForm /> }
      );
    }

    // Routes for manager
    if (role === ROLES.MANAGER) {
      routes.push(
        { path: 'users', element: <UserList /> },
        { path: 'users/new', element: <UserForm /> },
        { path: 'users/:id', element: <UserDetail /> },
        { path: 'attendance', element: <AttendanceList /> },
        { path: 'clients', element: <ClientList /> },
        { path: 'reports', element: <ReportList /> },
        { path: 'notifications/new', element: <NotificationForm /> }
      );
    }

    // Routes for sales staff
    if (role === ROLES.SALES_STAFF) {
      routes.push(
        { path: 'users', element: <UserList /> },
        { path: 'users/new', element: <UserForm /> },
        { path: 'users/:id', element: <UserDetail /> },
        { path: 'attendance', element: <AttendanceList /> },
        { path: 'attendance/record', element: <AttendanceForm /> },
        { path: 'clients', element: <ClientList /> },
        { path: 'reports', element: <ReportList /> },
        { path: 'reports/new', element: <ReportForm /> },
        { path: 'notifications/new', element: <NotificationForm /> }
      );
    }

    // Routes for team leader
    if (role === ROLES.TEAM_LEADER) {
      routes.push(
        { path: 'users', element: <UserList /> },
        { path: 'users/new', element: <UserForm /> },
        { path: 'attendance/record', element: <AttendanceForm /> },
        { path: 'attendance', element: <AttendanceList /> },
        { path: 'clients', element: <ClientList /> },
        { path: 'clients/new', element: <ClientForm /> },
        { path: 'reports', element: <ReportList /> },
        { path: 'reports/new', element: <ReportForm /> }
      );
    }

    // Routes for individual agent
    if (role === ROLES.INDIVIDUAL_AGENT) {
      routes.push(
        { path: 'attendance/record', element: <AttendanceForm /> },
        { path: 'clients/new', element: <ClientForm /> },
        { path: 'clients', element: <ClientList /> },
        { path: 'reports/new', element: <ReportForm /> },
        { path: 'reports', element: <ReportList /> }
      );
    }

    // Routes for sales agent
    if (role === ROLES.SALES_AGENT) {
      routes.push(
        { path: 'attendance/record', element: <AttendanceForm /> },
        { path: 'clients/new', element: <ClientForm /> },
        { path: 'clients', element: <ClientList /> },
        { path: 'reports/new', element: <ReportForm /> },
        { path: 'reports', element: <ReportList /> }
      );
    }

    return routes;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      {!isAuthenticated ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/login-help" element={<LoginHelp />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/reset-password/:userId" element={<PasswordReset />} />
          
          {getRoutesForRole(user?.role).map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      )}
    </Routes>
  );
}

export default App;
