import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/Api';

export const generateSendMatrix = createAsyncThunk(
    'sendMatrix/generate',
    async ({ threshold_id, community_id, forecast_date }, { rejectWithValue }) => {
        try {
            const res = await api.get(`/v1/admin/weather-thresholds/${threshold_id}/send-matrix`, {
                params: {
                    community_id,
                    forecast_date,
                }
            });
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to generate send matrix');
        }
    }
);

const sendMatrixSlice = createSlice({
    name: 'sendMatrix',
    initialState: {
        data: null,
        loading: false,
        error: null,
    },
    reducers: {
        resetSendMatrix: (state) => {
            state.data = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(generateSendMatrix.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(generateSendMatrix.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(generateSendMatrix.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetSendMatrix } = sendMatrixSlice.actions;
export default sendMatrixSlice.reducer;