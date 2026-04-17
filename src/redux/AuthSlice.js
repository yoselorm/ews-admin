import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../services/Api';
import { api_url } from '../utils/config';

const getInitialData = () => {
  const data = localStorage.getItem('admin_data');
  return data ? JSON.parse(data) : null;
};

const initialData = getInitialData();


// 1. Admin Login
export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${api_url}/admin/login`, credentials);
      localStorage.setItem('admin_token', response.data.token);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

// 2. Admin Register
export const registerAdmin = createAsyncThunk(
  'auth/registerAdmin',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/register', userData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

// 3. Forgot Password (Send Reset Link)
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/forgot-password', { email });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send reset link');
    }
  }
);

// 4. Reset Password (The actual change)
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/reset-password', resetData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Password reset failed');
    }
  }
);

// 5. Admin Logout
export const logoutAdmin = createAsyncThunk(
  'auth/logoutAdmin',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/admin/logout');
      localStorage.removeItem('admin_token');
      return true;
    } catch (err) {
      localStorage.removeItem('admin_token'); // Clear it anyway
      return rejectWithValue('Logout error');
    }
  }
);

// --- SLICE ---

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    admin: initialData|| null,
    token: initialData?.token || null,
    isAuthenticated: !!initialData?.token,
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearStatus: (state) => {
      state.error = null;
      state.message = null;
    },
    forceLogout: (state) => {
      localStorage.removeItem('admin_data');
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAdmin.pending, (state) => { state.loading = true; })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('admin_data', JSON.stringify(action.payload));
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Forgot Password
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.message = "Reset link sent successfully";
      })

      // Reset Password
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.message = "Password reset successful";
        state.error = null;
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
      })
      
      // Logout
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.admin = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        localStorage.removeItem('admin_data');
        
      })
      .addCase(logoutAdmin.pending, (state) => {
        state.loading = true;
        })
      .addCase(logoutAdmin.rejected, (state) => {
        state.loading = false;
        state.admin = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('admin_data');
      });
  },
});

export const { clearStatus } = authSlice.actions;
export default authSlice.reducer;