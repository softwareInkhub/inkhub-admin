import { configureStore } from '@reduxjs/toolkit';
import shopifyReducer from './slices/shopifySlice';
import pinterestReducer from './slices/pinterestSlice';
import designLibraryReducer from './slices/designLibrarySlice';
import brhmReducer from './slices/brhmSlice';

export const store = configureStore({
  reducer: {
    shopify: shopifyReducer,
    pinterest: pinterestReducer,
    designLibrary: designLibraryReducer,
    brhm: brhmReducer,
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