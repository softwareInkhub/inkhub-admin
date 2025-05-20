import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface ShopifyState {
  orders: any[];
  products: any[];
  collections: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ShopifyState = {
  orders: [],
  products: [],
  collections: [],
  loading: false,
  error: null,
};

// Async thunks for fetching data
export const fetchOrders = createAsyncThunk(
  'shopify/fetchOrders',
  async () => {
    const response = await axios.get('/api/shopify/orders');
    return response.data;
  }
);

export const fetchProducts = createAsyncThunk(
  'shopify/fetchProducts',
  async () => {
    const response = await axios.get('/api/shopify/products');
    return response.data;
  }
);

export const fetchCollections = createAsyncThunk(
  'shopify/fetchCollections',
  async () => {
    const response = await axios.get('/api/shopify/collections');
    return response.data;
  }
);

const shopifySlice = createSlice({
  name: 'shopify',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      // Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      // Collections
      .addCase(fetchCollections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.loading = false;
        state.collections = action.payload;
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch collections';
      });
  },
});

export const { clearError } = shopifySlice.actions;
export default shopifySlice.reducer; 