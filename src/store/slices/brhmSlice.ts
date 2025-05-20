import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface BRHMState {
  data: any[];
  loading: boolean;
  error: string | null;
}

const initialState: BRHMState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchBRHMData = createAsyncThunk(
  'brhm/fetchData',
  async () => {
    const response = await axios.get('/api/brhm/data');
    return response.data;
  }
);

export const updateBRHMData = createAsyncThunk(
  'brhm/updateData',
  async (data: any) => {
    const response = await axios.put('/api/brhm/data', data);
    return response.data;
  }
);

const brhmSlice = createSlice({
  name: 'brhm',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Data
      .addCase(fetchBRHMData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBRHMData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchBRHMData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch BRHM data';
      })
      // Update Data
      .addCase(updateBRHMData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBRHMData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(updateBRHMData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update BRHM data';
      });
  },
});

export const { clearError } = brhmSlice.actions;
export default brhmSlice.reducer; 