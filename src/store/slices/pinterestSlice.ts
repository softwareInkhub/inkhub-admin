import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface PinterestState {
  pins: any[];
  boards: any[];
  loading: boolean;
  error: string | null;
}

const initialState: PinterestState = {
  pins: [],
  boards: [],
  loading: false,
  error: null,
};

export const fetchPins = createAsyncThunk(
  'pinterest/fetchPins',
  async () => {
    const response = await axios.get('/api/pinterest/pins');
    return response.data;
  }
);

export const fetchBoards = createAsyncThunk(
  'pinterest/fetchBoards',
  async () => {
    const response = await axios.get('/api/pinterest/boards');
    return response.data;
  }
);

const pinterestSlice = createSlice({
  name: 'pinterest',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Pins
      .addCase(fetchPins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPins.fulfilled, (state, action) => {
        state.loading = false;
        state.pins = action.payload;
      })
      .addCase(fetchPins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch pins';
      })
      // Boards
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = action.payload;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch boards';
      });
  },
});

export const { clearError } = pinterestSlice.actions;
export default pinterestSlice.reducer; 