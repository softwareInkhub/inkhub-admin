import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface ShopifyState {
  orders: any[];
  products: any[];
  loading: boolean;
  error: string | null;
  ordersLastEvaluatedKey: any | null;
  productsLastEvaluatedKey: any | null;
  totalOrders: number;
  totalProducts: number;
  hasMore: boolean;
  currentPage: number;
}

const initialState: ShopifyState = {
  orders: [],
  products: [],
  loading: false,
  error: null,
  ordersLastEvaluatedKey: null,
  productsLastEvaluatedKey: null,
  totalOrders: 0,
  totalProducts: 0,
  hasMore: true,
  currentPage: 1,
};

export const setInitialOrders = createAsyncThunk(
  'shopify/setInitialOrders',
  async (data: { items: any[]; lastEvaluatedKey: any; total: number; hasMore?: boolean; page?: number }) => {
    return data;
  }
);

export const fetchOrders = createAsyncThunk(
  'shopify/fetchOrders',
  async ({ page = 1 }: { page?: number }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page: String(page) });
      const url = `/api/orders?${params}`;
      console.log('[Redux fetchOrders] Fetching orders from:', url);
      const response = await axios.get(url);
      return response.data; // { items, page, hasMore }
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
    resetOrders: (state) => {
      state.orders = [];
      state.hasMore = true;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initial orders
      .addCase(setInitialOrders.fulfilled, (state, action) => {
        state.orders = action.payload.items;
        state.ordersLastEvaluatedKey = action.payload.lastEvaluatedKey;
        state.totalOrders = action.payload.total;
        state.hasMore = typeof action.payload.hasMore === 'boolean' ? action.payload.hasMore : true;
        state.currentPage = action.payload.page || 1;
      })
      // Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.items;
        state.hasMore = typeof action.payload.hasMore === 'boolean' ? action.payload.hasMore : true;
        state.currentPage = action.payload.page || 1;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error instanceof Error ? action.error.message : 'Failed to fetch orders';
      })
      // Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const { items = [], lastEvaluatedKey, total } = action.payload || {};
        if (action.meta.arg && action.meta.arg.lastKey) {
          // Pagination: append
          state.products = [...state.products, ...(items || [])];
        } else {
          // First page: replace
          state.products = items || [];
        }
        state.productsLastEvaluatedKey = lastEvaluatedKey || null;
        state.totalProducts = typeof total === 'number' ? total : state.products.length;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error instanceof Error ? action.error.message : 'Failed to fetch products';
      });
  },
});

export const { clearError, resetOrders } = shopifySlice.actions;
export default shopifySlice.reducer; 