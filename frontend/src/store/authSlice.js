import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';
import { setAuthToken, removeAuthToken, getAuthToken } from '../utils/authUtils';

// Check if user is authenticated
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No token found');
      }
      
      setAuthToken(token);
      const response = await api.get('/users/me/');
      return response.data;
    } catch (error) {
      removeAuthToken();
      return rejectWithValue(error.response?.data || 'Authentication failed');
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/token/', { email, password });
      const { access, refresh } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      
      // Set token in axios headers
      setAuthToken(access);
      
      // Get user data
      const userResponse = await api.get('/users/me/');
      return userResponse.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Login failed');
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      removeAuthToken();
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Logout failed');
    }
  }
);

// Request password reset
export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/${userId}/reset_password/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Password reset request failed');
    }
  }
);

// Submit login help request
export const submitLoginHelp = createAsyncThunk(
  'auth/submitLoginHelp',
  async ({ message }, { rejectWithValue }) => {
    try {
      const response = await api.post('/login-help/', { message });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Login help request failed');
    }
  }
);

const initialState = {
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: false,
  loading: true,
  user: null,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.loading = false;
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.loading = false;
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.loading = false;
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.error = null;
      })
      // Password Reset
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login Help
      .addCase(submitLoginHelp.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitLoginHelp.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(submitLoginHelp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;
