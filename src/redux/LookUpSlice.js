import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/Api';

export const fetchLookupData = createAsyncThunk(
    'lookup/fetchData',
    async (type, { rejectWithValue }) => {
        try {
            const endpoints = {
                weather_threshold: '/v1/admin/weather-thresholds/lookup',
                health_tip: '/v1/admin/health-tips/lookup',
                precaution: '/v1/admin/precautions/lookup',
                safety_guide: '/v1/admin/safety-guide/lookup',
            };

            const response = await api.get(endpoints[type]);
            return response.data; // Assuming this returns an array of { id, title/name }
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch lookup data');
        }
    }
);

const lookupSlice = createSlice({
    name: 'lookup',
    initialState: {
        data: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearLookup: (state) => {
            state.data = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLookupData.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchLookupData.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data || action.payload; 
            })
            .addCase(fetchLookupData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearLookup } = lookupSlice.actions;
export default lookupSlice.reducer;