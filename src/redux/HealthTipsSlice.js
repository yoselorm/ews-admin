import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/Api';


export const fetchAdminHealthTips = createAsyncThunk(
    'healthTips/fetchAdminHealthTips',
    async (params, { rejectWithValue }) => {
        try {
            const response = await api.get('/v1/admin/health-tips', { params });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch admin health tips');
        }
    }
);

export const createHealthTip = createAsyncThunk(
    'healthTips/createHealthTip',
    async (tipData, { rejectWithValue }) => {
        try {
            const response = await api.post('/v1/admin/health-tips', tipData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to create health tip');
        }
    }
);

export const updateHealthTip = createAsyncThunk(
    'healthTips/updateHealthTip',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/v1/admin/health-tips/${id}`, data);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update health tip');
        }
    }
);

export const deleteHealthTip = createAsyncThunk(
    'healthTips/deleteHealthTip',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/v1/admin/health-tips/${id}`);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete health tip');
        }
    }
);



const healthTipSlice = createSlice({
    name: 'healthTips',
    initialState: {
        list: [],
        meta: null,
        loading: false,
        actionLoading: false,
        error: null,
        success: false,
    },
    reducers: {
        resetHealthTipStatus: (state) => {
            state.success = false;
            state.error = null;
            state.actionLoading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Admin Health Tips
            .addCase(fetchAdminHealthTips.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminHealthTips.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.data;
                state.meta = action.payload.meta;
            })
            .addCase(fetchAdminHealthTips.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create
            .addCase(createHealthTip.pending, (state) => {
                state.actionLoading = true;
                state.success = false;
            })
            .addCase(createHealthTip.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.success = true;
                const newTip = action.payload.data || action.payload;
                state.list.unshift(newTip);
            })
            .addCase(createHealthTip.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })

            // Update
            .addCase(updateHealthTip.pending, (state) => {
                state.actionLoading = true;
                state.success = false;
            })
            .addCase(updateHealthTip.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.success = true;
                const updatedTip = action.payload.data || action.payload;
                const index = state.list.findIndex(t => t.id === updatedTip.id);
                if (index !== -1) {
                    state.list[index] = updatedTip;
                }
            })
            .addCase(updateHealthTip.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })

            // Delete
            .addCase(deleteHealthTip.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.success = true;
                state.list = state.list.filter(t => t.id !== action.payload);
            })

            .addCase(deleteHealthTip.pending, (state) => { state.actionLoading = true; })
        
            .addCase(deleteHealthTip.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            });
    },
});

export const { resetHealthTipStatus } = healthTipSlice.actions;
export default healthTipSlice.reducer;