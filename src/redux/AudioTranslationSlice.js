import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/Api';

export const fetchAudioTranslations = createAsyncThunk(
  'audioTranslations/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/admin/audio-translations', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch audio translations');
    }
  }
);

export const uploadAudioTranslation = createAsyncThunk(
  'audioTranslations/upload',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/v1/admin/audio-translations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to upload audio');
    }
  }
);

export const deleteAudioTranslation = createAsyncThunk(
  'audioTranslations/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/v1/admin/audio-translations/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete audio translation');
    }
  }
);

const audioTranslationSlice = createSlice({
  name: 'audioTranslations',
  initialState: {
    audioTranslations: [],
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
    clearAudioStatus: (state) => {
      state.error = null;
      state.actionLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetching List
      .addCase(fetchAudioTranslations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAudioTranslations.fulfilled, (state, action) => {
        state.loading = false;
        state.audioTranslations = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchAudioTranslations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Uploading
      .addCase(uploadAudioTranslation.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(uploadAudioTranslation.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.audioTranslations.unshift(action.payload.data);
      })
      .addCase(uploadAudioTranslation.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Deleting
      .addCase(deleteAudioTranslation.fulfilled, (state, action) => {
        state.audioTranslations = state.audioTranslations.filter(
          (audio) => audio.id !== action.payload
        );
      });
  }
});

export const { clearAudioStatus } = audioTranslationSlice.actions;
export default audioTranslationSlice.reducer;