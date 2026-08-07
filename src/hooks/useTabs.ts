import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store/store';
import {
  openTab,
  closeTab,
  setActiveTab,
  togglePinTab,
  openNewTab,
  openShopifyTab,
  openPinterestTab,
  openSettingsTab,
  openUserManagementTab,
} from '@/store/slices/tabSlice';

export const useTabs = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { openTabs, activeTabIdx, pinnedTabs } = useSelector((state: RootState) => state.tabs);

  const openTabAction = (type: string, title: string, href: string) => {
    dispatch(openTab({ type, title, href }));
    router.push(href);
  };

  const closeTabAction = (idx: number) => {
    dispatch(closeTab(idx));
    const newTabs = [...openTabs];
    newTabs.splice(idx, 1);
    
    if (idx === activeTabIdx) {
      if (newTabs.length === 0) {
        router.push('/');
      } else {
        const newActiveTab = newTabs[Math.max(0, idx - 1)];
        router.push(newActiveTab.href);
      }
    }
  };

  const setActiveTabAction = (idx: number) => {
    dispatch(setActiveTab(idx));
    const tab = openTabs[idx];
    if (tab) {
      router.push(tab.href);
    }
  };

  const togglePinTabAction = (tabKey: string) => {
    dispatch(togglePinTab(tabKey));
  };

  const openNewTabAction = () => {
    dispatch(openNewTab());
    router.push('/new-tab');
  };

  const openShopifyTabAction = (type: 'orders' | 'products', title: string) => {
    dispatch(openShopifyTab({ type, title }));
    router.push(`/shopify/${type}`);
  };

  const openPinterestTabAction = (type: 'dashboard' | 'pins' | 'boards', title: string) => {
    dispatch(openPinterestTab({ type, title }));
    router.push(`/pinterest/${type}`);
  };

  const openSettingsTabAction = (type: 'general' | 'health' | 'indexing', title: string) => {
    dispatch(openSettingsTab({ type, title }));
    const href = type === 'general' ? '/settings' : `/settings/${type}`;
    router.push(href);
  };

  const openUserManagementTabAction = (type: 'register' | 'existing' | 'access-control', title: string) => {
    dispatch(openUserManagementTab({ type, title }));
    router.push(`/user-management/${type}`);
  };

  return {
    openTabs,
    activeTabIdx,
    pinnedTabs,
    openTab: openTabAction,
    closeTab: closeTabAction,
    setActiveTab: setActiveTabAction,
    togglePinTab: togglePinTabAction,
    openNewTab: openNewTabAction,
    openShopifyTab: openShopifyTabAction,
    openPinterestTab: openPinterestTabAction,
    openSettingsTab: openSettingsTabAction,
    openUserManagementTab: openUserManagementTabAction,
  };
}; 