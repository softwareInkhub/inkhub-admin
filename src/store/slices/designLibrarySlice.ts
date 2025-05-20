import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface DesignLibraryState {
  designs: any[];
  loading: boolean;
  error: string | null;
}

const initialState: DesignLibraryState = {
  designs: [],
  loading: false,
  error: null,
};

export const fetchDesigns = createAsyncThunk(
  'designLibrary/fetchDesigns',
  async () => {
    const response = await axios.get('/api/design-library/designs');
    return response.data;
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

const designLibrarySlice = createSlice({
  name: 'designLibrary',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
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
        state.designs = action.payload;
      })
      .addCase(fetchDesigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch designs';
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
      });
  },
});

export const { clearError } = designLibrarySlice.actions;
export default designLibrarySlice.reducer; 