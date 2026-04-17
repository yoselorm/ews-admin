import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/Api';


export const fetchDistricts = createAsyncThunk('districts/fetch', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get('/v1/admin/districts', { params });
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch districts');
    }
});

export const createDistrict = createAsyncThunk('districts/create', async (data, { rejectWithValue }) => {
    try {
        const response = await api.post('/v1/admin/districts', data);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to create district');
    }
});

export const updateDistrict = createAsyncThunk('districts/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/v1/admin/districts/${id}`, data);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to update district');
    }
});

export const deleteDistrict = createAsyncThunk('districts/delete', async (id, { rejectWithValue }) => {
    try {
        await api.delete(`/v1/admin/districts/${id}`);
        return id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to delete district');
    }
});


const districtSlice = createSlice({
    name: 'districts',
    initialState: {
        districtList: [],            
        districtMeta: null,          
        districtsLoading: false,      
        districtActionLoading: false, 
        districtSuccess: false,      
        districtError: null           
    },
    reducers: {
        resetDistrictStatus: (state) => {
            state.districtSuccess = false;
            state.districtError = null;
            state.districtActionLoading = false;
        },
        // Call this when the user deselects a Region to wipe the middle column
        clearDistricts: (state) => {
            state.districtList = [];
            state.districtMeta = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Districts
            .addCase(fetchDistricts.pending, (state) => {
                state.districtsLoading = true;
                state.districtError = null;
            })
            .addCase(fetchDistricts.fulfilled, (state, action) => {
                state.districtsLoading = false;
                state.districtList = action.payload.data;
                state.districtMeta = action.payload.meta;
            })
            .addCase(fetchDistricts.rejected, (state, action) => {
                state.districtsLoading = false;
                state.districtError = action.payload;
            })

            // Create District
            .addCase(createDistrict.pending, (state) => {
                state.districtActionLoading = true;
                state.districtSuccess = false;
                state.districtError = null;
            })
            .addCase(createDistrict.fulfilled, (state, action) => {
                state.districtActionLoading = false;
                state.districtSuccess = true;
                state.districtList.unshift(action.payload.data);
            })
            .addCase(createDistrict.rejected, (state, action) => {
                state.districtActionLoading = false;
                state.districtError = action.payload;
            })

            // Update District
            .addCase(updateDistrict.pending, (state) => {
                state.districtActionLoading = true;
                state.districtSuccess = false;
                state.districtError = null;
            })
            .addCase(updateDistrict.fulfilled, (state, action) => {
                state.districtActionLoading = false;
                state.districtSuccess = true;
                const index = state.districtList.findIndex(d => d.id === action.payload.data.id);
                if (index !== -1) {
                    state.districtList[index] = action.payload.data;
                }
            })
            .addCase(updateDistrict.rejected, (state, action) => {
                state.districtActionLoading = false;
                state.districtError = action.payload;
            })

            // Delete District
            .addCase(deleteDistrict.pending, (state) => {
                state.districtActionLoading = true;
                state.districtSuccess = false;
                state.districtError = null;
            })
            .addCase(deleteDistrict.fulfilled, (state, action) => {
                state.districtActionLoading = false;
                state.districtSuccess = true;
                state.districtList = state.districtList.filter(d => d.id !== action.payload);
            })
            .addCase(deleteDistrict.rejected, (state, action) => {
                state.districtActionLoading = false;
                state.districtError = action.payload;
            });
    }
});

export const { resetDistrictStatus, clearDistricts } = districtSlice.actions;
export default districtSlice.reducer;