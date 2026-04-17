import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/Api';


export const fetchCommunities = createAsyncThunk('communities/fetch', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get('/v1/admin/communities', { params });
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch communities');
    }
});
export const fetchCommunityList = createAsyncThunk('communities/fetchList', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get('/v1/admin/communities/lookup');
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch communities');
    }
});

export const createCommunity = createAsyncThunk('communities/create', async (data, { rejectWithValue }) => {
    try {
        const response = await api.post('/v1/admin/communities', data);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to create community');
    }
});

export const updateCommunity = createAsyncThunk('communities/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/v1/admin/communities/${id}`, data);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to update community');
    }
});

export const deleteCommunity = createAsyncThunk('communities/delete', async (id, { rejectWithValue }) => {
    try {
        await api.delete(`/v1/admin/communities/${id}`);
        return id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to delete community');
    }
});

// --- Slice ---

const communitySlice = createSlice({
    name: 'communities',
    initialState: {
        communityList: [],            
        communityMeta: null,        
        communitiesLoading: false,     
        communityActionLoading: false, 
        communitySuccess: false,      
        communityError: null ,
        list:[]        
    },
    reducers: {
        resetCommunityStatus: (state) => {
            state.communitySuccess = false;
            state.communityError = null;
            state.communityActionLoading = false;
        },
        clearCommunities: (state) => {
            state.communityList = [];
            state.communityMeta = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Communities
            .addCase(fetchCommunities.pending, (state) => {
                state.communitiesLoading = true;
                state.communityError = null;
            })
            .addCase(fetchCommunities.fulfilled, (state, action) => {
                state.communitiesLoading = false;
                state.communityList = action.payload.data;
                state.communityMeta = action.payload.meta;
            })
            .addCase(fetchCommunities.rejected, (state, action) => {
                state.communitiesLoading = false;
                state.communityError = action.payload;
            })

            // Create Community
            .addCase(createCommunity.pending, (state) => {
                state.communityActionLoading = true;
                state.communitySuccess = false;
                state.communityError = null;
            })
            .addCase(createCommunity.fulfilled, (state, action) => {
                state.communityActionLoading = false;
                state.communitySuccess = true;
                state.communityList.unshift(action.payload.data);
            })
            .addCase(createCommunity.rejected, (state, action) => {
                state.communityActionLoading = false;
                state.communityError = action.payload;
            })

            // Update Community
            .addCase(updateCommunity.pending, (state) => {
                state.communityActionLoading = true;
                state.communitySuccess = false;
                state.communityError = null;
            })
            .addCase(updateCommunity.fulfilled, (state, action) => {
                state.communityActionLoading = false;
                state.communitySuccess = true;
                const index = state.communityList.findIndex(c => c.id === action.payload.data.id);
                if (index !== -1) {
                    state.communityList[index] = action.payload.data;
                }
            })
            .addCase(updateCommunity.rejected, (state, action) => {
                state.communityActionLoading = false;
                state.communityError = action.payload;
            })

            // Delete Community
            .addCase(deleteCommunity.pending, (state) => {
                state.communityActionLoading = true;
                state.communitySuccess = false;
                state.communityError = null;
            })
            .addCase(deleteCommunity.fulfilled, (state, action) => {
                state.communityActionLoading = false;
                state.communitySuccess = true;
                state.communityList = state.communityList.filter(c => c.id !== action.payload);
            })
            .addCase(deleteCommunity.rejected, (state, action) => {
                state.communityActionLoading = false;
                state.communityError = action.payload;
            })
            .addCase(fetchCommunityList.pending, (state) => {
                state.communitiesLoading = true;
                state.communityError = null;
            })
            .addCase(fetchCommunityList.fulfilled, (state, action) => {
                state.communitiesLoading = false;
                state.list = action.payload.data; 
            })
            .addCase(fetchCommunityList.rejected, (state, action) => {
                state.communitiesLoading = false;
                state.communityError = action.payload;
             })
            ;
    }
});

export const { resetCommunityStatus, clearCommunities } = communitySlice.actions;
export default communitySlice.reducer;