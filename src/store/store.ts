import { configureStore } from '@reduxjs/toolkit';
import shopifyReducer from './slices/shopifySlice';
import pinterestReducer from './slices/pinterestSlice';
import designLibraryReducer from './slices/designLibrarySlice';
import tabReducer from './slices/tabSlice';

export const store = configureStore({
  reducer: {
    shopify: shopifyReducer,
    pinterest: pinterestReducer,
    designLibrary: designLibraryReducer,
    tabs: tabReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        warnAfter: 100,
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 