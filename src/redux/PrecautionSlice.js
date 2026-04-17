import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/Api';

// --- THUNKS ---

// 1. List Precautions (with Pagination & Filters)
export const fetchPrecautions = createAsyncThunk(
  'precautions/fetchPrecautions',
  async (params, { rejectWithValue }) => {
    try {
      const filteredParams = Object.entries(params || {}).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) acc[key] = value;
        return acc;
      }, {});

      const response = await api.get('/v1/admin/precautions', { 
        params: filteredParams 
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch precautions');
    }
  }
);

// 2. Create Precaution
export const createPrecaution = createAsyncThunk(
  'precautions/createPrecaution',
  async (precautionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/v1/admin/precautions', precautionData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create precaution');
    }
  }
);

// 3. Update Precaution
export const updatePrecaution = createAsyncThunk(
  'precautions/updatePrecaution',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/v1/admin/precautions/${id}`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update precaution');
    }
  }
);

// 4. Delete Precaution
export const deletePrecaution = createAsyncThunk(
  'precautions/deletePrecaution',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/v1/admin/precautions/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete precaution');
    }
  }
);

// --- SLICE ---

const precautionSlice = createSlice({
  name: 'precautions',
  initialState: {
    list: [],
    meta: null,           
    loading: false,       
    actionLoading: false, 
    error: null,
    success: false,
  },
  reducers: {
    resetPrecautionStatus: (state) => {
      state.success = false;
      state.error = null;
      state.actionLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch List
      .addCase(fetchPrecautions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrecautions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.meta = action.payload.meta; 
      })
      .addCase(fetchPrecautions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createPrecaution.pending, (state) => {
        state.actionLoading = true;
        state.success = false;
      })
      .addCase(createPrecaution.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        state.list.unshift(action.payload.data);
      })
      .addCase(createPrecaution.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updatePrecaution.pending, (state) => {
        state.actionLoading = true;
        state.success = false;
      })
      .addCase(updatePrecaution.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        const index = state.list.findIndex(p => p.id === action.payload.data.id);
        if (index !== -1) state.list[index] = action.payload.data;
      })
      .addCase(updatePrecaution.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deletePrecaution.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deletePrecaution.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.list = state.list.filter(p => p.id !== action.payload);
      })
      .addCase(deletePrecaution.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetPrecautionStatus } = precautionSlice.actions;
export default precautionSlice.reducer;