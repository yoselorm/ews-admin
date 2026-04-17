import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/Api';

export const fetchAdmins = createAsyncThunk(
  'admins/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/admin/admins', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch admins');
    }
  }
);

export const createAdmin = createAsyncThunk(
  'admins/create',
  async (adminData, { rejectWithValue }) => {
    try {
      const response = await api.post('/v1/admin/admins', adminData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create admin');
    }
  }
);

export const updateAdmin = createAsyncThunk(
  'admins/update',
  async ({ id, adminData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/v1/admin/admins/${id}`, adminData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update admin');
    }
  }
);

export const deleteAdmin = createAsyncThunk(
  'admins/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/v1/admin/admins/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete admin');
    }
  }
);

const adminSlice = createSlice({
  name: 'admins',
  initialState: {
    admins: [],
    loading: false,
    actionLoading: false,
    error: null,
    meta: {
      current_page: 1,
      last_page: 1,
      total: 0
    }
  },
  reducers: {
    clearAdminStatus: (state) => {
      state.error = null;
      state.actionLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch List
      .addCase(fetchAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createAdmin.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.admins.unshift(action.payload.data);
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateAdmin.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.admins.findIndex(a => a.id === action.payload.data.id);
        if (index !== -1) {
          state.admins[index] = action.payload.data;
        }
      })
      .addCase(updateAdmin.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.admins = state.admins.filter(a => a.id !== action.payload);
      });
  }
});

export const { clearAdminStatus } = adminSlice.actions;
export default adminSlice.reducer;