import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Get all attendances
export const getAttendances = createAsyncThunk(
  'attendance/getAttendances',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance/', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch attendance records');
    }
  }
);

// Get attendance by date
export const getAttendanceByDate = createAsyncThunk(
  'attendance/getAttendanceByDate',
  async (date, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance/', { params: { date } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch attendance records');
    }
  }
);

// Record attendance
export const recordAttendance = createAsyncThunk(
  'attendance/recordAttendance',
  async (attendanceData, { rejectWithValue }) => {
    try {
      const response = await api.post('/attendance/', attendanceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to record attendance');
    }
  }
);

// Excuse attendance
export const excuseAttendance = createAsyncThunk(
  'attendance/excuseAttendance',
  async ({ id, excuseData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/attendance/${id}/excuse/`, excuseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to excuse attendance');
    }
  }
);

// Get all time frames
export const getTimeFrames = createAsyncThunk(
  'attendance/getTimeFrames',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance-timeframes/', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch time frames');
    }
  }
);

// Create time frame
export const createTimeFrame = createAsyncThunk(
  'attendance/createTimeFrame',
  async (timeFrameData, { rejectWithValue }) => {
    try {
      const response = await api.post('/attendance-timeframes/', timeFrameData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create time frame');
    }
  }
);

// Update time frame
export const updateTimeFrame = createAsyncThunk(
  'attendance/updateTimeFrame',
  async ({ id, timeFrameData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/attendance-timeframes/${id}/`, timeFrameData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update time frame');
    }
  }
);

// Delete time frame
export const deleteTimeFrame = createAsyncThunk(
  'attendance/deleteTimeFrame',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/attendance-timeframes/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete time frame');
    }
  }
);

const initialState = {
  attendances: [],
  timeFrames: [],
  loading: false,
  error: null,
  success: false,
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearAttendanceState: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Attendances
      .addCase(getAttendances.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAttendances.fulfilled, (state, action) => {
        state.loading = false;
        state.attendances = action.payload;
        state.error = null;
      })
      .addCase(getAttendances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Attendance By Date
      .addCase(getAttendanceByDate.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAttendanceByDate.fulfilled, (state, action) => {
        state.loading = false;
        state.attendances = action.payload;
        state.error = null;
      })
      .addCase(getAttendanceByDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Record Attendance
      .addCase(recordAttendance.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(recordAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendances.push(action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(recordAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Excuse Attendance
      .addCase(excuseAttendance.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(excuseAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendances = state.attendances.map(attendance =>
          attendance.id === action.payload.id ? action.payload : attendance
        );
        state.success = true;
        state.error = null;
      })
      .addCase(excuseAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Get Time Frames
      .addCase(getTimeFrames.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTimeFrames.fulfilled, (state, action) => {
        state.loading = false;
        state.timeFrames = action.payload;
        state.error = null;
      })
      .addCase(getTimeFrames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Time Frame
      .addCase(createTimeFrame.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(createTimeFrame.fulfilled, (state, action) => {
        state.loading = false;
        state.timeFrames.push(action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(createTimeFrame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update Time Frame
      .addCase(updateTimeFrame.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(updateTimeFrame.fulfilled, (state, action) => {
        state.loading = false;
        state.timeFrames = state.timeFrames.map(timeFrame =>
          timeFrame.id === action.payload.id ? action.payload : timeFrame
        );
        state.success = true;
        state.error = null;
      })
      .addCase(updateTimeFrame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Delete Time Frame
      .addCase(deleteTimeFrame.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTimeFrame.fulfilled, (state, action) => {
        state.loading = false;
        state.timeFrames = state.timeFrames.filter(timeFrame => timeFrame.id !== action.payload);
        state.error = null;
        state.success = true;
      })
      .addCase(deleteTimeFrame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAttendanceState } = attendanceSlice.actions;

export default attendanceSlice.reducer;
