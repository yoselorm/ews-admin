import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/Api';

export const fetchCategories = createAsyncThunk('safetyCategories/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/v1/admin/safety-guide-categories');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load categories');
  }
});

export const createCategory = createAsyncThunk('safetyCategories/create', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post('/v1/admin/safety-guide-categories', data);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create category');
  }
});

export const updateCategory = createAsyncThunk('safetyCategories/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/v1/admin/safety-guide-categories/${id}`, data);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update category');
  }
});

export const deleteCategory = createAsyncThunk('safetyCategories/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/v1/admin/safety-guide-categories/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete category');
  }
});

const safetyCategorySlice = createSlice({
  name: 'safetyCategories',
  initialState: { list: [], loading: false, actionLoading: false, success: false, error: null },
  reducers: {
    resetStatus: (state) => { state.success = false; state.error = null; state.actionLoading = false; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => { state.loading = true; })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCategory.pending, (state) => { state.actionLoading = true; state.success = false; })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        state.list.unshift(action.payload); // Add new category to the top of the list
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      .addCase(updateCategory.pending, (state) => { state.actionLoading = true; state.success = false; })
      .addCase(updateCategory.fulfilled, (state) => {
        state.actionLoading = false;
        state.success = true;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteCategory.pending, (state) => { state.actionLoading = true; state.success = false; })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        state.list = state.list.filter(item => item.id !== action.payload); // Remove deleted category from the list
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  }
});

export const { resetStatus } = safetyCategorySlice.actions;
export default safetyCategorySlice.reducer;
      
