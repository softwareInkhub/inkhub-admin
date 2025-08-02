"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import {
  openTab,
  closeTab,
  setActiveTab,
  togglePinTab,
  openNewTab,
  reorderTabs,
  renameTab,
  duplicateTab,
  updateTabStatus,
  openShopifyTab,
  openPinterestTab,
  openSettingsTab,
  openUserManagementTab,
  openDesignLibraryTab,
} from "@/store/slices/tabSlice";
import Sidebar from "./Sidebar";
import SecondarySidebar from "./SecondarySidebar";
import TabBar from "./TabBar";
import Navbar from "./Navbar";
import { useTheme } from "@/contexts/ThemeContext";

interface GlobalLayoutProps {
  children: React.ReactNode;
}

export default function GlobalLayout({ children }: GlobalLayoutProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isDarkMode, setTheme } = useTheme();
  
  const { openTabs, activeTabIdx, pinnedTabs } = useSelector((state: RootState) => state.tabs);

  // Secondary sidebar state
  const [secondarySidebarCollapsed, setSecondarySidebarCollapsed] = useState(false);
  const [activeSecondarySection, setActiveSecondarySection] = useState<string | null>(null);

  // Handle secondary sidebar item clicks
  const handleSecondarySidebarItemClick = (href: string, title: string, type: string) => {
    console.log('=== Secondary sidebar item clicked ===');
    console.log('href:', href);
    console.log('title:', title);
    console.log('type:', type);
    console.log('activeSecondarySection:', activeSecondarySection);

    const pathParts = href.split('/');
    const section = pathParts[1];
    const subsection = pathParts[2];

    // Open appropriate tab based on section and type
    if (section === 'shopify' && subsection) {
      console.log('Opening Shopify tab:', subsection, title);
      dispatch(openShopifyTab({ type: subsection as 'orders' | 'products', title }));
    } else if (section === 'pinterest' && subsection) {
      console.log('Opening Pinterest tab:', subsection, title);
      dispatch(openPinterestTab({ type: subsection as 'dashboard' | 'pins' | 'boards', title }));
    } else if (section === 'design-library' && subsection) {
      console.log('Opening Design Library tab:', subsection, title);
      dispatch(openDesignLibraryTab({ type: 'designs', title }));
    } else if (section === 'settings' && subsection) {
      console.log('Opening Settings tab:', subsection, title);
      dispatch(openSettingsTab({ type: subsection as 'general' | 'health' | 'indexing', title }));
    } else if (section === 'user-management' && subsection) {
      console.log('Opening User Management tab:', subsection, title);
      dispatch(openUserManagementTab({ type: subsection as 'register' | 'existing' | 'access-control', title }));
    } else {
      console.log('Opening generic tab:', href, title);
      dispatch(openTab({ type: href.replace(/\//g, '-').slice(1), title, href }));
    }
    
    console.log('Navigating to:', href);
    router.push(href);
    console.log('=== End secondary sidebar item click ===');
  };

  // Handle tab click
  const handleTabClick = (idx: number) => {
    console.log('=== Tab clicked ===');
    console.log('idx:', idx);
    console.log('tab:', openTabs[idx]);
    console.log('current activeTabIdx:', activeTabIdx);
    console.log('all openTabs:', openTabs);
    
    dispatch(setActiveTab(idx));
    const tab = openTabs[idx];
    if (tab) {
      console.log('Navigating to:', tab.href);
      router.push(tab.href);
    } else {
      console.error('Tab not found at index:', idx);
    }
    console.log('=== End tab click ===');
  };

  // Handle tab close
  const handleTabClose = (idx: number) => {
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

  // Handle tab pin toggle
  const handleTabPin = (tabKey: string) => {
    dispatch(togglePinTab(tabKey));
  };

  // Handle new tab
  const handleNewTab = () => {
    dispatch(openNewTab());
    router.push('/new-tab');
  };

  // Handle tab reordering
  const handleTabReorder = (fromIdx: number, toIdx: number) => {
    dispatch(reorderTabs({ fromIdx, toIdx }));
  };

  // Handle tab duplication
  const handleTabDuplicate = (idx: number) => {
    dispatch(duplicateTab(idx));
    const tab = openTabs[idx];
    if (tab) {
      router.push(tab.href);
    }
  };

  // Handle tab renaming
  const handleTabRename = (idx: number, newTitle: string) => {
    dispatch(renameTab({ idx, newTitle }));
  };

  // Handle tab refresh
  const handleTabRefresh = (idx: number) => {
    const tab = openTabs[idx];
    if (tab) {
      // Set loading status
      dispatch(updateTabStatus({ idx, status: 'loading' }));
      router.push(tab.href);
      // Clear loading status after a short delay
      setTimeout(() => {
        dispatch(updateTabStatus({ idx, status: 'success' }));
      }, 1000);
    }
  };

  // Handle sidebar navigation
  const handleSidebarNavClick = (section: string) => {
    console.log('=== Main sidebar navigation ===');
    console.log('section:', section);
    
    const navItems = [
      { type: 'dashboard', title: 'Dashboard', href: '/' },
      { type: 'shopify', title: 'Shopify', href: '/shopify' },
      { type: 'pinterest', title: 'Pinterest', href: '/pinterest' },
      { type: 'design-library', title: 'Design Library', href: '/design-library' },
      { type: 'settings', title: 'Settings', href: '/settings' },
      { type: 'user-management', title: 'User Management', href: '/user-management' },
    ];

    const item = navItems.find(nav => nav.type === section);
    if (item) {
      console.log('Opening main tab:', item.type, item.title);
      dispatch(openTab({ type: item.type, title: item.title, href: item.href }));
      router.push(item.href);
      
      // Update secondary sidebar section
      if (section !== 'dashboard') {
        console.log('Setting active secondary section:', section);
        setActiveSecondarySection(section);
        setSecondarySidebarCollapsed(false);
      } else {
        console.log('Clearing active secondary section');
        setActiveSecondarySection(null);
      }
    }
    console.log('=== End main sidebar navigation ===');
  };

  // Determine active sidebar tab based on current route
  const getActiveSidebarTab = () => {
    const currentTab = openTabs[activeTabIdx];
    if (!currentTab) return 'dashboard';

    const tabType = currentTab.type;
    if (tabType === 'dashboard') return 'dashboard';
    if (tabType.startsWith('shopify')) return 'shopify';
    if (tabType.startsWith('pinterest')) return 'pinterest';
    if (tabType.startsWith('design-library')) return 'design-library';
    if (tabType.startsWith('settings')) return 'settings';
    if (tabType.startsWith('user-management')) return 'user-management';
    
    return 'dashboard';
  };

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar 
        activeTab={getActiveSidebarTab()}
        onNavClick={handleSidebarNavClick}
      />
      
      {/* Secondary Sidebar */}
      {activeSecondarySection && activeSecondarySection !== 'dashboard' && (
        <SecondarySidebar 
          section={activeSecondarySection}
          onCollapseChange={setSecondarySidebarCollapsed}
          onItemClick={handleSecondarySidebarItemClick}
        />
      )}
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar 
          title="BRMH Dashboard"
          isDarkMode={isDarkMode}
          onThemeToggle={setTheme}
        />
        
        {/* Special Tab Bar Container - Always Visible */}
        <div className="relative bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-neutral-200 dark:border-gray-700 shadow-sm z-10">
          <TabBar
            tabs={openTabs}
            activeTabIdx={activeTabIdx}
            pinnedTabs={pinnedTabs}
            onTabClick={handleTabClick}
            onTabClose={handleTabClose}
            onTabPin={handleTabPin}
            onNewTab={handleNewTab}
            onTabReorder={handleTabReorder}
            onTabDuplicate={handleTabDuplicate}
            onTabRename={handleTabRename}
            onTabRefresh={handleTabRefresh}
          />
        </div>
        
        {/* Main Content Area - Allow Scrolling */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </div>
      </main>
    </div>
  );
}