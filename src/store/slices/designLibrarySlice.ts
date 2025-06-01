import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { cache } from '@/utils/cache';

interface DesignLibraryState {
  designs: any[];
  loading: boolean;
  error: string | null;
  lastEvaluatedKey: any | null;
  totalDesigns: number;
}

const initialState: DesignLibraryState = {
  designs: [],
  loading: false,
  error: null,
  lastEvaluatedKey: null,
  totalDesigns: 0,
};

export const fetchDesigns = createAsyncThunk(
  'designLibrary/fetchDesigns',
  async ({ limit = 50, lastKey = null }: { limit?: number; lastKey?: any | null }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ limit: String(limit) });
      if (lastKey) params.append('lastKey', JSON.stringify(lastKey));
      const response = await axios.get(`/api/design-library/designs?${params}`);
      return response.data; // { items, lastEvaluatedKey }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch designs');
    }
  }
);

export const uploadDesign = createAsyncThunk(
  'designLibrary/uploadDesign',
  async (designData: FormData) => {
    const response = await axios.post('/api/design-library/designs', designData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
);

export const updateDesign = createAsyncThunk(
  'designLibrary/updateDesign',
  async (design: any) => {
    const response = await axios.put('/api/design-library/designs', design);
    return response.data;
  }
);

export const deleteDesign = createAsyncThunk(
  'designLibrary/deleteDesign',
  async (uid: string) => {
    const response = await axios.delete('/api/design-library/designs', { data: { uid } });
    return { uid };
  }
);

const designLibrarySlice = createSlice({
  name: 'designLibrary',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetDesigns: (state) => {
      state.designs = [];
      state.lastEvaluatedKey = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Designs
      .addCase(fetchDesigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDesigns.fulfilled, (state, action) => {
        state.loading = false;
        const { items, lastEvaluatedKey, total } = action.payload || {};
        if (action.meta.arg && action.meta.arg.lastKey) {
          // Pagination: append
          state.designs = [...state.designs, ...(items || [])];
        } else {
          // First page: replace
          state.designs = items || [];
        }
        state.lastEvaluatedKey = lastEvaluatedKey || null;
        state.totalDesigns = typeof total === 'number' ? total : state.designs.length;
      })
      .addCase(fetchDesigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch designs';
      })
      // Upload Design
      .addCase(uploadDesign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadDesign.fulfilled, (state, action) => {
        state.loading = false;
        state.designs.push(action.payload);
      })
      .addCase(uploadDesign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to upload design';
      })
      // Update Design
      .addCase(updateDesign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDesign.fulfilled, (state, action) => {
        state.loading = false;
        state.designs = state.designs.map((d) => d.uid === action.payload.uid ? action.payload : d);
      })
      .addCase(updateDesign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update design';
      })
      // Delete Design
      .addCase(deleteDesign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDesign.fulfilled, (state, action) => {
        state.loading = false;
        state.designs = state.designs.filter((d) => d.uid !== action.payload.uid);
      })
      .addCase(deleteDesign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete design';
      });
  },
});

export const { clearError, resetDesigns } = designLibrarySlice.actions;
export default designLibrarySlice.reducer; 