import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/Api';


export const fetchAdminAlerts = createAsyncThunk(
  'alerts/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      // params: { page, limit, sort, risk_level, community_id, is_resolved }
      const response = await api.get('/v1/admin/alerts', { params });
      return response.data; 
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch alerts');
    }
  }
);

// GET /v1/admin/alerts/{id} (Get alert details)
export const fetchAlertDetails = createAsyncThunk(
  'alerts/fetchDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/v1/admin/alerts/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch alert details');
    }
  }
);

// DELETE /v1/admin/alerts/{id} (Delete an alert)
export const deleteAlert = createAsyncThunk(
  'alerts/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/v1/admin/alerts/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete alert');
    }
  }
);

// PATCH /v1/admin/alerts/{id}/resolve (Resolve an alert)
export const resolveAlert = createAsyncThunk(
  'alerts/resolve',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/v1/admin/alerts/${id}/resolve`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to resolve alert');
    }
  }
);

const alertSlice = createSlice({
  name: 'alerts',
  initialState: {
    alerts: [],
    currentAlert: null,
    loading: false,
    actionLoading: false, // For Delete/Resolve spinners
    error: null,
    meta: {
      current_page: 1,
      last_page: 1,
      total: 0
    }
  },
  reducers: {
    clearAlertError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      // Fetch List
      .addCase(fetchAdminAlerts.pending, (state) => { state.loading = true; })
      .addCase(fetchAdminAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchAdminAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Resolve Alert (Optimistic Update)
      .addCase(resolveAlert.pending, (state) => { state.actionLoading = true; })
      .addCase(resolveAlert.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.alerts.findIndex(a => a.id === action.payload.data.id);
        if (index !== -1) {
          state.alerts[index].is_resolved = true;
        }
      })

      // Delete Alert
      .addCase(deleteAlert.fulfilled, (state, action) => {
        state.alerts = state.alerts.filter(a => a.id !== action.payload);
      });
  }
});

export const { clearAlertError } = alertSlice.actions;
export default alertSlice.reducer;