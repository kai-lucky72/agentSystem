import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Get all reports
export const getReports = createAsyncThunk(
  'reports/getReports',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch reports');
    }
  }
);

// Get report by ID
export const getReportById = createAsyncThunk(
  'reports/getReportById',
  async (reportId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reports/${reportId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch report');
    }
  }
);

// Create report
export const createReport = createAsyncThunk(
  'reports/createReport',
  async (reportData, { rejectWithValue }) => {
    try {
      const response = await api.post('/reports/', reportData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create report');
    }
  }
);

// Update report
export const updateReport = createAsyncThunk(
  'reports/updateReport',
  async ({ reportId, reportData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/reports/${reportId}/`, reportData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update report');
    }
  }
);

// Approve/Reject report
export const approveRejectReport = createAsyncThunk(
  'reports/approveRejectReport',
  async ({ reportId, actionData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/reports/${reportId}/approve_reject/`, actionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to approve/reject report');
    }
  }
);

// Get reports submitted to me
export const getReportsSubmittedToMe = createAsyncThunk(
  'reports/getReportsSubmittedToMe',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/submitted_to_me/', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch reports submitted to you');
    }
  }
);

// Get my submitted reports
export const getMySubmittedReports = createAsyncThunk(
  'reports/getMySubmittedReports',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/my_submissions/', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch your submitted reports');
    }
  }
);

const initialState = {
  reports: [],
  report: null,
  submittedToMe: [],
  mySubmissions: [],
  loading: false,
  error: null,
  success: false,
};

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearReportState: (state) => {
      state.report = null;
      state.error = null;
      state.success = false;
    },
    clearReportError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Reports
      .addCase(getReports.pending, (state) => {
        state.loading = true;
      })
      .addCase(getReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
        state.error = null;
      })
      .addCase(getReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Report By ID
      .addCase(getReportById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getReportById.fulfilled, (state, action) => {
        state.loading = false;
        state.report = action.payload;
        state.error = null;
      })
      .addCase(getReportById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Report
      .addCase(createReport.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports.push(action.payload);
        state.mySubmissions.push(action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(createReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update Report
      .addCase(updateReport.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(updateReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = state.reports.map(report =>
          report.id === action.payload.id ? action.payload : report
        );
        state.mySubmissions = state.mySubmissions.map(report =>
          report.id === action.payload.id ? action.payload : report
        );
        state.report = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(updateReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Approve/Reject Report
      .addCase(approveRejectReport.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(approveRejectReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = state.reports.map(report =>
          report.id === action.payload.id ? action.payload : report
        );
        state.submittedToMe = state.submittedToMe.map(report =>
          report.id === action.payload.id ? action.payload : report
        );
        state.report = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(approveRejectReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Get Reports Submitted To Me
      .addCase(getReportsSubmittedToMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getReportsSubmittedToMe.fulfilled, (state, action) => {
        state.loading = false;
        state.submittedToMe = action.payload;
        state.error = null;
      })
      .addCase(getReportsSubmittedToMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get My Submitted Reports
      .addCase(getMySubmittedReports.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMySubmittedReports.fulfilled, (state, action) => {
        state.loading = false;
        state.mySubmissions = action.payload;
        state.error = null;
      })
      .addCase(getMySubmittedReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReportState, clearReportError } = reportSlice.actions;

export default reportSlice.reducer;
