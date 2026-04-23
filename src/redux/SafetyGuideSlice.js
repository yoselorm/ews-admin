import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/Api';


// 1. List Safety Guides
export const fetchSafetyGuides = createAsyncThunk(
  'safetyGuides/fetchSafetyGuides',
  async (params, { rejectWithValue }) => {
    try {
      const filteredParams = Object.entries({ 
        sort: '-created_at', 
        ...params 
      }).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) acc[key] = value;
        return acc;
      }, {});

      const response = await api.get('/v1/admin/safety-guides', { 
        params: filteredParams 
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch safety guides');
    }
  }
);

// 2. Create Safety Guide
export const createSafetyGuide = createAsyncThunk(
  'safetyGuides/createSafetyGuide',
  async (guideData, { rejectWithValue }) => {
    try {
      const response = await api.post('/v1/admin/safety-guides', guideData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create safety guide');
    }
  }
);

// 3. Update Safety Guide
export const updateSafetyGuide = createAsyncThunk(
  'safetyGuides/updateSafetyGuide',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/v1/admin/safety-guides/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update safety guide');
    }
  }
);

// 4. Delete Safety Guide
export const deleteSafetyGuide = createAsyncThunk(
  'safetyGuides/deleteSafetyGuide',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/v1/admin/safety-guides/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete safety guide');
    }
  }
);


const safetyGuideSlice = createSlice({
  name: 'safetyGuides',
  initialState: {
    list: [],
    meta: null,
    loading: false,
    actionLoading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetSafetyGuideStatus: (state) => {
      state.success = false;
      state.error = null;
      state.actionLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch List
      .addCase(fetchSafetyGuides.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSafetyGuides.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchSafetyGuides.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.data;
      })

      // Create
      .addCase(createSafetyGuide.pending, (state) => {
        state.actionLoading = true;
        state.success = false;
      })
      .addCase(createSafetyGuide.fulfilled, (state,action) => {
        state.actionLoading = false;
        state.success = true;
        state.list.unshift(action.payload.data || action.payload); 
      })
      .addCase(createSafetyGuide.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateSafetyGuide.pending, (state) => {
        state.actionLoading = true;
        state.success = false;
      })
      .addCase(updateSafetyGuide.fulfilled, (state,action) => {
        state.actionLoading = false;
        state.success = true;
        state.list = state.list.map(g => g.id === action.payload.data.id ? action.payload.data : g);
      })
      .addCase(updateSafetyGuide.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteSafetyGuide.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteSafetyGuide.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true; // Use this to trigger modal closure
        state.list = state.list.filter(g => g.id !== action.payload);
      })
      .addCase(deleteSafetyGuide.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetSafetyGuideStatus } = safetyGuideSlice.actions;
export default safetyGuideSlice.reducer;