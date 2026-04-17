import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/Api';


export const fetchThresholds = createAsyncThunk(
  'thresholds/fetchThresholds',
  async (params, { rejectWithValue }) => {
    try {
      const filteredParams = Object.entries(params || {}).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) acc[key] = value;
        return acc;
      }, {});
      const response = await api.get('/v1/admin/weather-thresholds', { params: filteredParams });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch thresholds');
    }
  }
);

export const createThreshold = createAsyncThunk(
  'thresholds/createThreshold',
  async (thresholdData, { rejectWithValue }) => {
    try {
      const response = await api.post('/v1/admin/weather-thresholds', thresholdData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create threshold');
    }
  }
);

export const updateThreshold = createAsyncThunk(
  'thresholds/updateThreshold',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/v1/admin/weather-thresholds/${id}`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update threshold');
    }
  }
);

export const deleteThreshold = createAsyncThunk(
  'thresholds/deleteThreshold',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/v1/admin/weather-thresholds/${id}`);
      return id; 
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete threshold');
    }
  }
);


const thresholdSlice = createSlice({
  name: 'thresholds',
  initialState: {
    list: [],
    loading: false,       
    actionLoading: false, 
    meta: null, 
    error: null,
    success: false,
  },
  reducers: {
    resetThresholdStatus: (state) => {
      state.success = false;
      state.error = null;
      state.actionLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // 1. Fetch List
      .addCase(fetchThresholds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchThresholds.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || action.payload;
        state.meta = action.payload.meta || null;
      })
      .addCase(fetchThresholds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 2. Create
      .addCase(createThreshold.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createThreshold.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        state.list.unshift(action.payload); 
      })
      .addCase(createThreshold.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // 3. Update
      .addCase(updateThreshold.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateThreshold.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        const index = state.list.findIndex(item => item.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(updateThreshold.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // 4. Delete
      .addCase(deleteThreshold.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteThreshold.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.list = state.list.filter(item => item.id !== action.payload);
      })
      .addCase(deleteThreshold.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetThresholdStatus } = thresholdSlice.actions;
export default thresholdSlice.reducer;