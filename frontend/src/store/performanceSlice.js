import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Get all performance records
export const getPerformanceRecords = createAsyncThunk(
  'performance/getPerformanceRecords',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/performance/', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch performance records');
    }
  }
);

// Get performance by user ID
export const getPerformanceByUser = createAsyncThunk(
  'performance/getPerformanceByUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get('/performance/', { params: { user_id: userId } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch performance records');
    }
  }
);

// Get performance by ID
export const getPerformanceById = createAsyncThunk(
  'performance/getPerformanceById',
  async (performanceId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/performance/${performanceId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch performance record');
    }
  }
);

// Create performance record
export const createPerformanceRecord = createAsyncThunk(
  'performance/createPerformanceRecord',
  async (performanceData, { rejectWithValue }) => {
    try {
      const response = await api.post('/performance/', performanceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create performance record');
    }
  }
);

// Update performance record
export const updatePerformanceRecord = createAsyncThunk(
  'performance/updatePerformanceRecord',
  async ({ performanceId, performanceData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/performance/${performanceId}/`, performanceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update performance record');
    }
  }
);

const initialState = {
  performanceRecords: [],
  userPerformance: [],
  currentRecord: null,
  loading: false,
  error: null,
  success: false,
};

const performanceSlice = createSlice({
  name: 'performance',
  initialState,
  reducers: {
    clearPerformanceState: (state) => {
      state.currentRecord = null;
      state.error = null;
      state.success = false;
    },
    clearPerformanceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Performance Records
      .addCase(getPerformanceRecords.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPerformanceRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.performanceRecords = action.payload;
        state.error = null;
      })
      .addCase(getPerformanceRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Performance By User
      .addCase(getPerformanceByUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPerformanceByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userPerformance = action.payload;
        state.error = null;
      })
      .addCase(getPerformanceByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Performance By ID
      .addCase(getPerformanceById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPerformanceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRecord = action.payload;
        state.error = null;
      })
      .addCase(getPerformanceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Performance Record
      .addCase(createPerformanceRecord.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(createPerformanceRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.performanceRecords.push(action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(createPerformanceRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update Performance Record
      .addCase(updatePerformanceRecord.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(updatePerformanceRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.performanceRecords = state.performanceRecords.map(record =>
          record.id === action.payload.id ? action.payload : record
        );
        state.currentRecord = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(updatePerformanceRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { clearPerformanceState, clearPerformanceError } = performanceSlice.actions;

export default performanceSlice.reducer;
