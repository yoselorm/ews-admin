import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/Api';


export const fetchWeatherData = createAsyncThunk(
  'weather/fetchWeatherData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/admin/weather-data', { params });
      return response.data; 
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch weather data');
    }
  }
);

export const fetchWeatherDetail = createAsyncThunk(
  'weather/fetchWeatherDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/v1/admin/weather-data/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch weather detail');
    }
  }
);


const weatherSlice = createSlice({
  name: 'weather',
  initialState: {
    list: [],
    pagination: {
      currentPage: 1,
      totalItems: 0,
      totalPages: 0,
    },
    selectedEntry: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearWeatherDetail: (state) => {
      state.selectedEntry = null;
    },
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch List
      .addCase(fetchWeatherData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeatherData.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || action.payload; 
        state.pagination.totalItems = action.payload.total || 0;
      })
      .addCase(fetchWeatherData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Detail
      .addCase(fetchWeatherDetail.fulfilled, (state, action) => {
        state.selectedEntry = action.payload;
      });
  },
});

export const { clearWeatherDetail, setPage } = weatherSlice.actions;
export default weatherSlice.reducer;