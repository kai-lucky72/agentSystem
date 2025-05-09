import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Get all users
export const getUsers = createAsyncThunk(
  'users/getUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch users');
    }
  }
);

// Get user by ID
export const getUserById = createAsyncThunk(
  'users/getUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch user');
    }
  }
);

// Create user
export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/users/', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create user');
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${userId}/`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update user');
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${userId}/`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete user');
    }
  }
);

// Reset user password
export const resetUserPassword = createAsyncThunk(
  'users/resetUserPassword',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/${userId}/reset_password/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to reset password');
    }
  }
);

// Get team leaders
export const getTeamLeaders = createAsyncThunk(
  'users/getTeamLeaders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/team_leaders/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch team leaders');
    }
  }
);

// Get sales staff
export const getSalesStaff = createAsyncThunk(
  'users/getSalesStaff',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/sales_staff/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch sales staff');
    }
  }
);

// Get agents
export const getAgents = createAsyncThunk(
  'users/getAgents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/agents/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch agents');
    }
  }
);

const initialState = {
  users: [],
  user: null,
  teamLeaders: [],
  salesStaff: [],
  agents: [],
  loading: false,
  error: null,
  success: false,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserState: (state) => {
      state.user = null;
      state.error = null;
      state.success = false;
    },
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Users
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get User By ID
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create User
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        );
        state.user = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
        state.error = null;
        state.success = true;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reset User Password
      .addCase(resetUserPassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(resetUserPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.success = true;
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Team Leaders
      .addCase(getTeamLeaders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTeamLeaders.fulfilled, (state, action) => {
        state.loading = false;
        state.teamLeaders = action.payload;
        state.error = null;
      })
      .addCase(getTeamLeaders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Sales Staff
      .addCase(getSalesStaff.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSalesStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.salesStaff = action.payload;
        state.error = null;
      })
      .addCase(getSalesStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Agents
      .addCase(getAgents.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAgents.fulfilled, (state, action) => {
        state.loading = false;
        state.agents = action.payload;
        state.error = null;
      })
      .addCase(getAgents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserState, clearUserError } = userSlice.actions;

export default userSlice.reducer;
