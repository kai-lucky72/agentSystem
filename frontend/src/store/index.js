import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import userReducer from './userSlice';
import attendanceReducer from './attendanceSlice';
import clientReducer from './clientSlice';
import reportReducer from './reportSlice';
import performanceReducer from './performanceSlice';
import notificationReducer from './notificationSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    attendance: attendanceReducer,
    clients: clientReducer,
    reports: reportReducer,
    performance: performanceReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
