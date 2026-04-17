import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/Api';

// --- THUNKS ---

// 1. Get Aggregated Dashboard Statistics
export const fetchDashboardStats = createAsyncThunk(
  'stats/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/admin/dashboard-stats');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch statistics');
    }
  }
);

// 2. List System Audit Logs
export const fetchAuditLogs = createAsyncThunk(
  'stats/fetchAuditLogs',
  async ({ page = 1, search = '' ,sort ,limit } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/admin/audit-logs', {
        params: { page, search ,sort, limit },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch audit logs');
    }
  }
);

// 3. Get Detailed Audit Log Payload
export const fetchAuditLogDetail = createAsyncThunk(
  'stats/fetchAuditLogDetail',
  async (logId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/v1/admin/audit-logs/${logId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch log details');
    }
  }
);

// --- SLICE ---

const statsSlice = createSlice({
  name: 'stats',
  initialState: {
    dashboardData: null,
    auditLogs: [],
    meta: null,
    selectedLog: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedLog: (state) => {
      state.selectedLog = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Audit Logs List
    .addCase(fetchAuditLogs.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(fetchAuditLogs.fulfilled, (state, action) => {
  state.loading = false;
  state.auditLogs = action.payload.data; 
  state.meta = action.payload.meta; 
})
.addCase(fetchAuditLogs.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})

      // Audit Log Detail
      .addCase(fetchAuditLogDetail.fulfilled, (state, action) => {
        state.selectedLog = action.payload;
      });
  },
});

export const { clearSelectedLog } = statsSlice.actions;
export default statsSlice.reducer;