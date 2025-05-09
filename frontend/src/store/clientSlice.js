import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Get all clients
export const getClients = createAsyncThunk(
  'clients/getClients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/clients/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch clients');
    }
  }
);

// Get client by ID
export const getClientById = createAsyncThunk(
  'clients/getClientById',
  async (clientId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/clients/${clientId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch client');
    }
  }
);

// Create client
export const createClient = createAsyncThunk(
  'clients/createClient',
  async (clientData, { rejectWithValue }) => {
    try {
      const response = await api.post('/clients/', clientData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create client');
    }
  }
);

// Update client
export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async ({ clientId, clientData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/clients/${clientId}/`, clientData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update client');
    }
  }
);

// Delete client
export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async (clientId, { rejectWithValue }) => {
    try {
      await api.delete(`/clients/${clientId}/`);
      return clientId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete client');
    }
  }
);

const initialState = {
  clients: [],
  client: null,
  loading: false,
  error: null,
  success: false,
};

const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearClientState: (state) => {
      state.client = null;
      state.error = null;
      state.success = false;
    },
    clearClientError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Clients
      .addCase(getClients.pending, (state) => {
        state.loading = true;
      })
      .addCase(getClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload;
        state.error = null;
      })
      .addCase(getClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Client By ID
      .addCase(getClientById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getClientById.fulfilled, (state, action) => {
        state.loading = false;
        state.client = action.payload;
        state.error = null;
      })
      .addCase(getClientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Client
      .addCase(createClient.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.loading = false;
        state.clients.push(action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(createClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update Client
      .addCase(updateClient.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = state.clients.map(client =>
          client.id === action.payload.id ? action.payload : client
        );
        state.client = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Delete Client
      .addCase(deleteClient.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = state.clients.filter(client => client.id !== action.payload);
        state.error = null;
        state.success = true;
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearClientState, clearClientError } = clientSlice.actions;

export default clientSlice.reducer;
