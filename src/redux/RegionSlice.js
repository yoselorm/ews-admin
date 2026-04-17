import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/Api';


export const fetchRegions = createAsyncThunk('regions/fetch', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get('/v1/admin/regions', { params });
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch regions');
    }
});

export const createRegion = createAsyncThunk('regions/create', async (data, { rejectWithValue }) => {
    try {
        const response = await api.post('/v1/admin/regions', data);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to create region');
    }
});

export const updateRegion = createAsyncThunk('regions/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/v1/admin/regions/${id}`, data);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to update region');
    }
});

export const deleteRegion = createAsyncThunk('regions/delete', async (id, { rejectWithValue }) => {
    try {
        await api.delete(`/v1/admin/regions/${id}`);
        return id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to delete region');
    }
});


const regionSlice = createSlice({
    name: 'regions',
    initialState: {
        regionList: [],            
        regionMeta: null,          
        regionsLoading: false,     
        regionActionLoading: false,
        regionSuccess: false,       
        regionError: null           
    },
    reducers: {
        resetRegionStatus: (state) => {
            state.regionSuccess = false;
            state.regionError = null;
            state.regionActionLoading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Regions
            .addCase(fetchRegions.pending, (state) => {
                state.regionsLoading = true;
                state.regionError = null;
            })
            .addCase(fetchRegions.fulfilled, (state, action) => {
                state.regionsLoading = false;
                state.regionList = action.payload.data;
                state.regionMeta = action.payload.meta;
            })
            .addCase(fetchRegions.rejected, (state, action) => {
                state.regionsLoading = false;
                state.regionError = action.payload;
            })

            // Create Region
            .addCase(createRegion.pending, (state) => {
                state.regionActionLoading = true;
                state.regionSuccess = false;
                state.regionError = null;
            })
            .addCase(createRegion.fulfilled, (state, action) => {
                state.regionActionLoading = false;
                state.regionSuccess = true;
                state.regionList.unshift(action.payload.data);
            })
            .addCase(createRegion.rejected, (state, action) => {
                state.regionActionLoading = false;
                state.regionError = action.payload;
            })

            // Update Region
            .addCase(updateRegion.pending, (state) => {
                state.regionActionLoading = true;
                state.regionSuccess = false;
                state.regionError = null;
            })
            .addCase(updateRegion.fulfilled, (state, action) => {
                state.regionActionLoading = false;
                state.regionSuccess = true;
                const index = state.regionList.findIndex(r => r.id === action.payload.data.id);
                if (index !== -1) {
                    state.regionList[index] = action.payload.data;
                }
            })
            .addCase(updateRegion.rejected, (state, action) => {
                state.regionActionLoading = false;
                state.regionError = action.payload;
            })

            // Delete Region
            .addCase(deleteRegion.pending, (state) => {
                state.regionActionLoading = true;
                state.regionSuccess = false;
                state.regionError = null;
            })
            .addCase(deleteRegion.fulfilled, (state, action) => {
                state.regionActionLoading = false;
                state.regionSuccess = true;
                state.regionList = state.regionList.filter(r => r.id !== action.payload);
            })
            .addCase(deleteRegion.rejected, (state, action) => {
                state.regionActionLoading = false;
                state.regionError = action.payload;
            });
    }
});

export const { resetRegionStatus } = regionSlice.actions;
export default regionSlice.reducer;