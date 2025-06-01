import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { cache } from '@/utils/cache';

interface PinterestState {
  pins: any[];
  boards: any[];
  loading: boolean;
  error: string | null;
  pinsLastEvaluatedKey: any | null;
  boardsLastEvaluatedKey: any | null;
  totalPins: number;
  totalBoards: number;
}

const initialState: PinterestState = {
  pins: [],
  boards: [],
  loading: false,
  error: null,
  pinsLastEvaluatedKey: null,
  boardsLastEvaluatedKey: null,
  totalPins: 0,
  totalBoards: 0,
};

export const fetchPins = createAsyncThunk(
  'pinterest/fetchPins',
  async ({ limit = 100, lastKey = null }: { limit?: number; lastKey?: any | null }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ limit: String(limit) });
      if (lastKey) params.append('lastKey', JSON.stringify(lastKey));
      const response = await axios.get(`/api/pinterest/pins?${params}`);
      return response.data; // { items, lastEvaluatedKey }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch pins');
    }
  }
);

export const fetchBoards = createAsyncThunk(
  'pinterest/fetchBoards',
  async ({ limit = 100, lastKey = null }: { limit?: number; lastKey?: any | null }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ limit: String(limit) });
      if (lastKey) params.append('lastKey', JSON.stringify(lastKey));
      const response = await axios.get(`/api/pinterest/boards?${params}`);
      return response.data; // { items, lastEvaluatedKey }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch boards');
    }
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
        const { items = [], lastEvaluatedKey, total } = action.payload || {};
        if (action.meta.arg && action.meta.arg.lastKey) {
          // Pagination: append
          state.pins = [...state.pins, ...(items || [])];
        } else {
          // First page: replace
          state.pins = items || [];
        }
        state.pinsLastEvaluatedKey = lastEvaluatedKey || null;
        state.totalPins = typeof total === 'number' ? total : state.pins.length;
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
        const { items = [], lastEvaluatedKey, total } = action.payload || {};
        if (action.meta.arg && action.meta.arg.lastKey) {
          // Pagination: append
          state.boards = [...state.boards, ...(items || [])];
        } else {
          // First page: replace
          state.boards = items || [];
        }
        state.boardsLastEvaluatedKey = lastEvaluatedKey || null;
        state.totalBoards = typeof total === 'number' ? total : state.boards.length;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch boards';
      });
  },
});

export const { clearError } = pinterestSlice.actions;
export default pinterestSlice.reducer; 