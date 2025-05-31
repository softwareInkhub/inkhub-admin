import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface ShopifyState {
  orders: any[];
  products: any[];
  loading: boolean;
  error: string | null;
  ordersLastEvaluatedKey: any | null;
  productsLastEvaluatedKey: any | null;
}

const initialState: ShopifyState = {
  orders: [],
  products: [],
  loading: false,
  error: null,
  ordersLastEvaluatedKey: null,
  productsLastEvaluatedKey: null,
};

export const fetchOrders = createAsyncThunk(
  'shopify/fetchOrders',
  async ({ limit = 500, lastKey = null }: { limit?: number; lastKey?: any | null }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ limit: String(limit) });
      if (lastKey) params.append('lastKey', JSON.stringify(lastKey));
      const response = await axios.get(`/api/shopify/orders?${params}`);
      return response.data; // { items, lastEvaluatedKey }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch orders');
    }
  }
);

export const fetchProducts = createAsyncThunk(
  'shopify/fetchProducts',
  async ({ limit = 500, lastKey = null }: { limit?: number; lastKey?: any | null }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ limit: String(limit) });
      if (lastKey) params.append('lastKey', JSON.stringify(lastKey));
      const response = await axios.get(`/api/shopify/products?${params}`);
      return response.data; // { items, lastEvaluatedKey }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch products');
    }
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
        const { items = [], lastEvaluatedKey } = action.payload || {};
        if (action.meta.arg && action.meta.arg.lastKey) {
          // Pagination: append
          state.orders = [...state.orders, ...(items || [])];
        } else {
          // First page: replace
          state.orders = items || [];
        }
        state.ordersLastEvaluatedKey = lastEvaluatedKey || null;
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
        const { items = [], lastEvaluatedKey } = action.payload || {};
        if (action.meta.arg && action.meta.arg.lastKey) {
          // Pagination: append
          state.products = [...state.products, ...(items || [])];
        } else {
          // First page: replace
          state.products = items || [];
        }
        state.productsLastEvaluatedKey = lastEvaluatedKey || null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      });
  },
});

export const { clearError } = shopifySlice.actions;
export default shopifySlice.reducer; 