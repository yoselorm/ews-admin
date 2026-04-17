import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/Api';


export const fetchLanguages = createAsyncThunk(
  'languages/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/admin/languages', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch languages');
    }
  }
);

export const createLanguage = createAsyncThunk(
  'languages/create',
  async (langData, { rejectWithValue }) => {
    try {
      const response = await api.post('/v1/admin/languages', langData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create language');
    }
  }
);

export const fetchLanguageDetails = createAsyncThunk(
  'languages/fetchDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/v1/admin/languages/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch details');
    }
  }
);

export const updateLanguage = createAsyncThunk(
  'languages/update',
  async ({ id, langData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/v1/admin/languages/${id}`, langData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update language');
    }
  }
);

export const deleteLanguage = createAsyncThunk(
  'languages/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/v1/admin/languages/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete language');
    }
  }
);

const languageSlice = createSlice({
  name: 'languages',
  initialState: {
    languages: [],
    currentLanguage: null,
    loading: false,
    actionLoading: false,
    error: null,
    meta: {
      current_page: 1,
      last_page: 1,
      total: 0
    }
  },
  reducers: {
    clearLanguageStatus: (state) => {
      state.error = null;
      state.actionLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLanguages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLanguages.fulfilled, (state, action) => {
        state.loading = false;
        state.languages = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchLanguages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createLanguage.pending, (state) => { state.actionLoading = true; })
      .addCase(createLanguage.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.languages.unshift(action.payload.data);
      })

      .addCase(updateLanguage.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.languages.findIndex(l => l.id === action.payload.data.id);
        if (index !== -1) {
          state.languages[index] = action.payload.data;
        }
      })

      .addCase(deleteLanguage.fulfilled, (state, action) => {
        state.languages = state.languages.filter(l => l.id !== action.payload);
      });
  }
});

export const { clearLanguageStatus } = languageSlice.actions;
export default languageSlice.reducer;