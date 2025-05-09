import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Get all notifications
export const getNotifications = createAsyncThunk(
  'notifications/getNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications/', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch notifications');
    }
  }
);

// Get unread notifications
export const getUnreadNotifications = createAsyncThunk(
  'notifications/getUnreadNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications/', { params: { unread: true } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch unread notifications');
    }
  }
);

// Send notification
export const sendNotification = createAsyncThunk(
  'notifications/sendNotification',
  async (notificationData, { rejectWithValue }) => {
    try {
      const response = await api.post('/notifications/', notificationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to send notification');
    }
  }
);

// Mark notification as read
export const markNotificationRead = createAsyncThunk(
  'notifications/markNotificationRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/notifications/${notificationId}/mark_read/`);
      return { id: notificationId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to mark notification as read');
    }
  }
);

// Mark all notifications as read
export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/notifications/mark_all_read/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to mark all notifications as read');
    }
  }
);

// Get login help requests
export const getLoginHelpRequests = createAsyncThunk(
  'notifications/getLoginHelpRequests',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/login-help/', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch login help requests');
    }
  }
);

// Resolve login help request
export const resolveLoginHelpRequest = createAsyncThunk(
  'notifications/resolveLoginHelpRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/login-help/${requestId}/resolve/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to resolve login help request');
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  helpRequests: [],
  loading: false,
  error: null,
  success: false,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationState: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Notifications
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(notification => !notification.is_read).length;
        state.error = null;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Unread Notifications
      .addCase(getUnreadNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUnreadNotifications.fulfilled, (state, action) => {
        state.loading = false;
        // Update only unread notifications, keep read ones
        const unreadIds = action.payload.map(n => n.id);
        state.notifications = [
          ...state.notifications.filter(n => n.is_read),
          ...action.payload
        ];
        state.unreadCount = action.payload.length;
        state.error = null;
      })
      .addCase(getUnreadNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send Notification
      .addCase(sendNotification.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(sendNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(sendNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Mark Notification Read
      .addCase(markNotificationRead.pending, (state) => {
        state.loading = true;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = state.notifications.map(notification =>
          notification.id === action.payload.id
            ? { ...notification, is_read: true }
            : notification
        );
        state.unreadCount = state.notifications.filter(notification => !notification.is_read).length;
        state.error = null;
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark All Notifications Read
      .addCase(markAllNotificationsRead.pending, (state) => {
        state.loading = true;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.loading = false;
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          is_read: true
        }));
        state.unreadCount = 0;
        state.error = null;
      })
      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Login Help Requests
      .addCase(getLoginHelpRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLoginHelpRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.helpRequests = action.payload;
        state.error = null;
      })
      .addCase(getLoginHelpRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Resolve Login Help Request
      .addCase(resolveLoginHelpRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(resolveLoginHelpRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.helpRequests = state.helpRequests.map(request =>
          request.id === action.payload.id ? action.payload : request
        );
        state.error = null;
      })
      .addCase(resolveLoginHelpRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearNotificationState } = notificationSlice.actions;

export default notificationSlice.reducer;
