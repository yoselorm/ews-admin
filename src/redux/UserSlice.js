import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/Api';


// 1. Fetching (Unified list)
export const fetchUsers = createAsyncThunk('users/fetch', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get('/v1/admin/users-list', { params });
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch users');
    }
});
export const fetchHealthWorkers = createAsyncThunk('users/fetchHealthWorkers', async (__, { rejectWithValue }) => {
    try {
        const response = await api.get('/v1/admin/health-workers/lookup');
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch health workers');
    }
});

// 2. Creation Thunks (Four distinct endpoints)
const createUserThunk = (name, url) => createAsyncThunk(`users/create${name}`, async (data, { rejectWithValue }) => {
    try {
        const response = await api.post(url, data);
        return response.data;
    } catch (err) { return rejectWithValue(err.response?.data?.message || `Failed to create ${name}`); }
});

export const createPregnantWoman = createUserThunk('Pregnant', '/v1/admin/users/pregnant-women');
export const createLactatingMother = createUserThunk('Lactating', '/v1/admin/users/lactating-mothers');
export const createHealthWorker = createUserThunk('HealthWorker', '/v1/admin/users/health-workers');
export const createAssemblyOfficial = createUserThunk('Assembly', '/v1/admin/users/assembly-officials');

// 3. Update Thunks (Four distinct endpoints)
const updateUserThunk = (name, urlPath) => createAsyncThunk(
    `users/update${name}`, 
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/v1/admin/users/${id}/${urlPath}`, data);
            return response.data;
        } catch (err) { 
            return rejectWithValue(err.response?.data?.message || `Failed to update ${name}`); 
        }
    }
);

// We now only pass the final segment of the URL
export const updatePregnantWoman = updateUserThunk('Pregnant', 'pregnant-woman'); 
export const updateLactatingMother = updateUserThunk('Lactating', 'lactating-mother');
export const updateHealthWorker = updateUserThunk('HealthWorker', 'health-worker');
export const updateAssemblyOfficial = updateUserThunk('Assembly', 'assembly-official');

// 4. Delete
export const deleteUser = createAsyncThunk('users/delete', async (id, { rejectWithValue }) => {
    try {
        await api.delete(`/v1/admin/users/${id}`);
        return id;
    } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to delete user'); }
});

// --- SLICE ---

const userSlice = createSlice({
    name: 'users',
    initialState: {
        userList: [],
        healthWorkers:[],
        userMeta: null,
        usersLoading: false,
        userActionLoading: false, 
        userSuccess: false,
        userError: null
    },
    reducers: {
        resetUserStatus: (state) => {
            state.userSuccess = false;
            state.userError = null;
            state.userActionLoading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Users Cases
            .addCase(fetchUsers.pending, (state) => {
                state.usersLoading = true;
                state.userError = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.usersLoading = false;
                state.userList = action.payload.data;
                state.userMeta = action.payload.meta;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.usersLoading = false;
                state.userError = action.payload;
            })
                // Fetch Health Workers Cases   
            .addCase(fetchHealthWorkers.pending, (state) => {
                state.usersLoading = true;
                state.userError = null;
            })
            .addCase(fetchHealthWorkers.fulfilled, (state, action) => {
                state.usersLoading = false;
                state.healthWorkers = action.payload.data; 
            })
            .addCase(fetchHealthWorkers.rejected, (state, action) => {
                state.usersLoading = false;
                state.userError = action.payload;
            })

            // Delete User Cases
            .addCase(deleteUser.pending, (state) => {
                state.userActionLoading = true;
                state.userSuccess = false;
                state.usersLoading= true;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.userActionLoading = false;
                state.userSuccess = true;
                state.usersLoading= false;
                state.userList = state.userList.filter(u => u.id !== action.payload);
            })

            // Global Matchers for all Create/Update types
            // This handles all 8 specific thunks (4 create, 4 update)
            .addMatcher(
                (action) => action.type.startsWith('users/create') || action.type.startsWith('users/update'),
                (state, action) => {
                    if (action.type.endsWith('/pending')) {
                        state.userActionLoading = true;
                        state.userSuccess = false;
                        state.userError = null;
                    }
                    if (action.type.endsWith('/fulfilled')) {
                        state.userActionLoading = false;
                        state.userSuccess = true;
                        
                        // If it's a creation, add to list. If update, replace in list.
                        if (action.type.includes('create')) {
                            state.userList.unshift(action.payload.data);
                        } else {
                            const index = state.userList.findIndex(u => u.id === action.payload.data.id);
                            if (index !== -1) state.userList[index] = action.payload.data;
                        }
                    }
                    if (action.type.endsWith('/rejected')) {
                        state.userActionLoading = false;
                        state.userError = action.payload;
                    }
                }
            );
    }
});

export const { resetUserStatus } = userSlice.actions;
export default userSlice.reducer;