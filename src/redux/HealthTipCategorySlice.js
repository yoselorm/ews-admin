import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/Api';

export const fetchHealthTipCategories = createAsyncThunk(
    'healthTipCategories/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/v1/admin/health-tip-categories');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories');
        }
    }
);

export const createHealthTipCategory = createAsyncThunk(
    'healthTipCategories/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/v1/admin/health-tip-categories', data);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to create category');
        }
    }
);

export const updateHealthTipCategory = createAsyncThunk(
    'healthTipCategories/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/v1/admin/health-tip-categories/${id}`, data);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update category');
        }
    }
);

export const deleteHealthTipCategory = createAsyncThunk(
    'healthTipCategories/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/v1/admin/health-tip-categories/${id}`);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete category');
        }
    }
);

const healthTipCategorySlice = createSlice({
    name: 'healthTipCategories',
    initialState: {
        list: [],
        loading: false,
        actionLoading: false,
        success: false,
        error: null,
    },
    reducers: {
        resetCategoryStatus: (state) => {
            state.success = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchHealthTipCategories.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchHealthTipCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.data || action.payload;
            })
            .addCase(fetchHealthTipCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create
            .addCase(createHealthTipCategory.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(createHealthTipCategory.fulfilled, (state,action) => {
                state.actionLoading = false;
                state.success = true;
                state.list.unshift(action.payload.data || action.payload); 
            })
            .addCase(createHealthTipCategory.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })
            // Update
            .addCase(updateHealthTipCategory.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(updateHealthTipCategory.fulfilled, (state,action) => {
                state.actionLoading = false;
                state.success = true;
                const index = state.list.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = action.payload.data || action.payload;
                }   
            })
            .addCase(updateHealthTipCategory.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })
            // Delete
            .addCase(deleteHealthTipCategory.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(deleteHealthTipCategory.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.list = state.list.filter(item => item.id !== action.payload);
                state.success = true;
            })
            .addCase(deleteHealthTipCategory.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            });
    },
});

export const { resetCategoryStatus } = healthTipCategorySlice.actions;
export default healthTipCategorySlice.reducer;