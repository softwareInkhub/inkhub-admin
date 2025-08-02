import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Tab {
  key: string;
  title: string;
  type: string;
  href: string;
  pinned?: boolean;
  status?: 'loading' | 'error' | 'success' | 'warning';
  notifications?: number;
  icon?: string;
  category?: string;
  lastAccessed?: Date;
}

interface TabState {
  openTabs: Tab[];
  activeTabIdx: number;
  pinnedTabs: string[];
}

const initialState: TabState = {
  openTabs: [
    {
      key: `dashboard-${Date.now()}`,
      title: 'Dashboard',
      type: 'dashboard',
      href: '/',
    }
  ],
  activeTabIdx: 0,
  pinnedTabs: [],
};

const tabSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    openTab: (state, action: PayloadAction<{ type: string; title: string; href: string }>) => {
      const { type, title, href } = action.payload;
      
      // Check if tab already exists
      const existingIdx = state.openTabs.findIndex(tab => tab.type === type);
      if (existingIdx !== -1) {
        state.activeTabIdx = existingIdx;
        return;
      }
      
      // Add new tab
      const newTab: Tab = {
        key: `${type}-${Date.now()}`,
        title,
        type,
        href,
      };
      
      state.openTabs.push(newTab);
      state.activeTabIdx = state.openTabs.length - 1;
    },
    
    closeTab: (state, action: PayloadAction<number>) => {
      const idx = action.payload;
      state.openTabs.splice(idx, 1);
      
      // Adjust active tab index
      if (idx === state.activeTabIdx) {
        if (state.openTabs.length === 0) {
          // If no tabs left, open dashboard
          state.openTabs = [{
            key: `dashboard-${Date.now()}`,
            title: 'Dashboard',
            type: 'dashboard',
            href: '/',
          }];
          state.activeTabIdx = 0;
        } else {
          state.activeTabIdx = Math.max(0, idx - 1);
        }
      } else if (idx < state.activeTabIdx) {
        state.activeTabIdx = state.activeTabIdx - 1;
      }
    },
    
    setActiveTab: (state, action: PayloadAction<number>) => {
      state.activeTabIdx = action.payload;
    },
    
    togglePinTab: (state, action: PayloadAction<string>) => {
      const tabKey = action.payload;
      const index = state.pinnedTabs.indexOf(tabKey);
      if (index > -1) {
        state.pinnedTabs.splice(index, 1);
      } else {
        state.pinnedTabs.push(tabKey);
      }
    },
    
    openNewTab: (state) => {
      const newTab: Tab = {
        key: `new-tab-${Date.now()}`,
        title: 'New Tab',
        type: 'new-tab',
        href: '/new-tab',
      };
      
      state.openTabs.push(newTab);
      state.activeTabIdx = state.openTabs.length - 1;
    },
    
    // New reducers for advanced features
    reorderTabs: (state, action: PayloadAction<{ fromIdx: number; toIdx: number }>) => {
      const { fromIdx, toIdx } = action.payload;
      if (fromIdx === toIdx) return;
      
      const [movedTab] = state.openTabs.splice(fromIdx, 1);
      state.openTabs.splice(toIdx, 0, movedTab);
      
      // Adjust active tab index
      if (state.activeTabIdx === fromIdx) {
        state.activeTabIdx = toIdx;
      } else if (state.activeTabIdx > fromIdx && state.activeTabIdx <= toIdx) {
        state.activeTabIdx = state.activeTabIdx - 1;
      } else if (state.activeTabIdx < fromIdx && state.activeTabIdx >= toIdx) {
        state.activeTabIdx = state.activeTabIdx + 1;
      }
    },
    
    renameTab: (state, action: PayloadAction<{ idx: number; newTitle: string }>) => {
      const { idx, newTitle } = action.payload;
      if (idx >= 0 && idx < state.openTabs.length) {
        state.openTabs[idx].title = newTitle;
      }
    },
    
    duplicateTab: (state, action: PayloadAction<number>) => {
      const idx = action.payload;
      if (idx >= 0 && idx < state.openTabs.length) {
        const originalTab = state.openTabs[idx];
        const duplicatedTab: Tab = {
          ...originalTab,
          key: `${originalTab.key}-copy-${Date.now()}`,
          title: `${originalTab.title} (Copy)`,
        };
        state.openTabs.push(duplicatedTab);
        state.activeTabIdx = state.openTabs.length - 1;
      }
    },
    
    updateTabStatus: (state, action: PayloadAction<{ idx: number; status: Tab['status'] }>) => {
      const { idx, status } = action.payload;
      if (idx >= 0 && idx < state.openTabs.length) {
        state.openTabs[idx].status = status;
      }
    },
    
    updateTabNotifications: (state, action: PayloadAction<{ idx: number; notifications: number }>) => {
      const { idx, notifications } = action.payload;
      if (idx >= 0 && idx < state.openTabs.length) {
        state.openTabs[idx].notifications = notifications;
      }
    },
    
    clearTabNotifications: (state, action: PayloadAction<number>) => {
      const idx = action.payload;
      if (idx >= 0 && idx < state.openTabs.length) {
        state.openTabs[idx].notifications = 0;
      }
    },
    
    // Special handlers for different tab types
    openShopifyTab: (state, action: PayloadAction<{ type: 'orders' | 'products'; title: string }>) => {
      const { type, title } = action.payload;
      const tabType = `shopify-${type}`;
      const href = `/shopify/${type}`;
      
      // Check if this exact tab type already exists
      const existingIdx = state.openTabs.findIndex(tab => tab.type === tabType);
      if (existingIdx !== -1) {
        // If tab exists, just make it active
        state.activeTabIdx = existingIdx;
        return;
      }
      
      // Create new tab
      const newTab: Tab = {
        key: `${tabType}-${Date.now()}`,
        title,
        type: tabType,
        href,
      };
      
      state.openTabs.push(newTab);
      state.activeTabIdx = state.openTabs.length - 1;
    },
    
    openPinterestTab: (state, action: PayloadAction<{ type: 'dashboard' | 'pins' | 'boards'; title: string }>) => {
      const { type, title } = action.payload;
      const tabType = `pinterest-${type}`;
      const href = `/pinterest/${type}`;
      
      const existingIdx = state.openTabs.findIndex(tab => tab.type === tabType);
      if (existingIdx !== -1) {
        state.activeTabIdx = existingIdx;
        return;
      }
      
      const newTab: Tab = {
        key: `${tabType}-${Date.now()}`,
        title,
        type: tabType,
        href,
      };
      
      state.openTabs.push(newTab);
      state.activeTabIdx = state.openTabs.length - 1;
    },
    
    openSettingsTab: (state, action: PayloadAction<{ type: 'general' | 'health' | 'indexing'; title: string }>) => {
      const { type, title } = action.payload;
      const tabType = `settings-${type}`;
      const href = type === 'general' ? '/settings' : `/settings/${type}`;
      
      const existingIdx = state.openTabs.findIndex(tab => tab.type === tabType);
      if (existingIdx !== -1) {
        state.activeTabIdx = existingIdx;
        return;
      }
      
      const newTab: Tab = {
        key: `${tabType}-${Date.now()}`,
        title,
        type: tabType,
        href,
      };
      
      state.openTabs.push(newTab);
      state.activeTabIdx = state.openTabs.length - 1;
    },
    
    openUserManagementTab: (state, action: PayloadAction<{ type: 'register' | 'existing' | 'access-control'; title: string }>) => {
      const { type, title } = action.payload;
      const tabType = `user-management-${type}`;
      const href = `/user-management/${type}`;
      
      const existingIdx = state.openTabs.findIndex(tab => tab.type === tabType);
      if (existingIdx !== -1) {
        state.activeTabIdx = existingIdx;
        return;
      }
      
      const newTab: Tab = {
        key: `${tabType}-${Date.now()}`,
        title,
        type: tabType,
        href,
      };
      
      state.openTabs.push(newTab);
      state.activeTabIdx = state.openTabs.length - 1;
    },
    
    openDesignLibraryTab: (state, action: PayloadAction<{ type: 'designs'; title: string }>) => {
      const { type, title } = action.payload;
      const tabType = `design-library-${type}`;
      const href = `/design-library/${type}`;
      
      const existingIdx = state.openTabs.findIndex(tab => tab.type === tabType);
      if (existingIdx !== -1) {
        state.activeTabIdx = existingIdx;
        return;
      }
      
      const newTab: Tab = {
        key: `${tabType}-${Date.now()}`,
        title,
        type: tabType,
        href,
      };
      
      state.openTabs.push(newTab);
      state.activeTabIdx = state.openTabs.length - 1;
    },
  },
});

export const {
  openTab,
  closeTab,
  setActiveTab,
  togglePinTab,
  openNewTab,
  reorderTabs,
  renameTab,
  duplicateTab,
  updateTabStatus,
  updateTabNotifications,
  clearTabNotifications,
  openShopifyTab,
  openPinterestTab,
  openSettingsTab,
  openUserManagementTab,
  openDesignLibraryTab,
} = tabSlice.actions;

export default tabSlice.reducer; 