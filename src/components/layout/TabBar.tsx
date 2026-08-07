"use client";
import React, { useState, useRef, useEffect } from "react";
import { X, Pin, Plus, Search, MoreHorizontal, RefreshCw, AlertCircle, CheckCircle, Clock, Star, Folder, Settings, Users, BarChart3, Palette, Shield } from "lucide-react";

interface Tab {
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

interface TabBarProps {
  tabs: Tab[];
  activeTabIdx: number;
  pinnedTabs: string[];
  onTabClick: (idx: number) => void;
  onTabClose: (idx: number) => void;
  onTabPin: (key: string) => void;
  onNewTab: () => void;
  onTabReorder?: (fromIdx: number, toIdx: number) => void;
  onTabDuplicate?: (idx: number) => void;
  onTabRename?: (idx: number, newTitle: string) => void;
  onTabRefresh?: (idx: number) => void;
}

// Icon mapping for different tab types
const getTabIcon = (type: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'dashboard': <BarChart3 size={14} />,
    'shopify': <BarChart3 size={14} />,
    'pinterest': <Palette size={14} />,
    'design-library': <Palette size={14} />,
    'settings': <Settings size={14} />,
    'user-management': <Users size={14} />,
    'orders': <BarChart3 size={14} />,
    'products': <BarChart3 size={14} />,
    'pins': <Palette size={14} />,
    'boards': <Folder size={14} />,
    'designs': <Palette size={14} />,
    'health': <CheckCircle size={14} />,
    'indexing': <RefreshCw size={14} />,
    'register': <Users size={14} />,
    'existing': <Users size={14} />,
    'access-control': <Shield size={14} />,
  };
  return iconMap[type] || <BarChart3 size={14} />;
};

// Status icon mapping
const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'loading': return <RefreshCw size={12} className="animate-spin text-blue-500" />;
    case 'error': return <AlertCircle size={12} className="text-red-500" />;
    case 'success': return <CheckCircle size={12} className="text-green-500" />;
    case 'warning': return <AlertCircle size={12} className="text-yellow-500" />;
    default: return null;
  }
};

export default function TabBar({
  tabs,
  activeTabIdx,
  pinnedTabs,
  onTabClick,
  onTabClose,
  onTabPin,
  onNewTab,
  onTabReorder,
  onTabDuplicate,
  onTabRename,
  onTabRefresh,
}: TabBarProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tabIdx: number } | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedTab, setDraggedTab] = useState<number | null>(null);
  const [dragOverTab, setDragOverTab] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter tabs based on search
  const filteredTabs = tabs.filter(tab => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase().trim();
    const titleMatch = tab.title.toLowerCase().includes(searchLower);
    const typeMatch = tab.type.toLowerCase().includes(searchLower);
    const hrefMatch = tab.href.toLowerCase().includes(searchLower);
    
    return titleMatch || typeMatch || hrefMatch;
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    console.log('Search term changed:', value);
    console.log('Filtered tabs:', filteredTabs.length, 'of', tabs.length);
  };

  // Clear search when search is closed
  const handleSearchToggle = () => {
    if (showSearch) {
      setSearchTerm('');
    }
    setShowSearch(!showSearch);
  };

  // Handle context menu
  const handleContextMenu = (e: React.MouseEvent, tabIdx: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, tabIdx });
  };

  // Handle tab actions
  const handleTabAction = (action: string, tabIdx: number) => {
    setContextMenu(null);
    switch (action) {
      case 'refresh':
        onTabRefresh?.(tabIdx);
        break;
      case 'duplicate':
        onTabDuplicate?.(tabIdx);
        break;
      case 'rename':
        const newTitle = prompt('Enter new tab name:', tabs[tabIdx].title);
        if (newTitle && newTitle.trim()) {
          onTabRename?.(tabIdx, newTitle.trim());
        }
        break;
      case 'pin':
        onTabPin(tabs[tabIdx].key);
        break;
      case 'close':
        onTabClose(tabIdx);
        break;
    }
  };

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, tabIdx: number) => {
    setDraggedTab(tabIdx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, tabIdx: number) => {
    e.preventDefault();
    if (draggedTab !== null && draggedTab !== tabIdx) {
      setDragOverTab(tabIdx);
    }
  };

  const handleDrop = (e: React.DragEvent, tabIdx: number) => {
    e.preventDefault();
    if (draggedTab !== null && draggedTab !== tabIdx && onTabReorder) {
      onTabReorder(draggedTab, tabIdx);
    }
    setDraggedTab(null);
    setDragOverTab(null);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F to open search
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        if (!showSearch) {
          setShowSearch(true);
          setSearchTerm('');
        }
      }
      
      // Escape to close search
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearch]);

  // Handle search
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      {/* Tab Bar Container */}
      <div className="flex items-center h-12 px-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        {/* Pinned Tabs Section */}
        <div className="flex items-center gap-1 pl-2">
          {filteredTabs.filter(tab => pinnedTabs.includes(tab.key)).map((tab) => {
            const globalIdx = tabs.findIndex(t => t.key === tab.key);
            const isActive = activeTabIdx === globalIdx;
            return (
              <div
                key={tab.key}
                className={`group relative flex items-center h-10 px-3 border-r border-neutral-200 dark:border-gray-700 cursor-pointer transition-all whitespace-nowrap min-w-max select-none rounded-t-lg
                  ${isActive 
                    ? "font-bold text-neutral-900 dark:text-white bg-white dark:bg-gray-800 shadow-sm" 
                    : "font-normal text-neutral-700 dark:text-gray-300 bg-white/60 dark:bg-gray-900/60 hover:bg-white dark:hover:bg-gray-800"
                  }
                  ${draggedTab === globalIdx ? "opacity-50" : ""}
                  ${dragOverTab === globalIdx ? "border-l-2 border-l-blue-500" : ""}
                `}
                onClick={() => onTabClick(globalIdx)}
                onContextMenu={(e) => handleContextMenu(e, globalIdx)}
                draggable
                onDragStart={(e) => handleDragStart(e, globalIdx)}
                onDragOver={(e) => handleDragOver(e, globalIdx)}
                onDrop={(e) => handleDrop(e, globalIdx)}
                style={{ 
                  borderRadius: '8px 8px 0 0',
                  borderBottom: isActive ? '3px solid #2563eb' : '1px solid transparent'
                }}
              >
                {/* Tab Icon */}
                <div className="mr-2 text-neutral-500 dark:text-gray-400">
                  {getTabIcon(tab.type)}
                </div>
                
                {/* Tab Title */}
                <span className="truncate max-w-[100px] text-sm">{tab.title}</span>
                
                {/* Status Icon */}
                {tab.status && (
                  <div className="ml-1">
                    {getStatusIcon(tab.status)}
                  </div>
                )}
                
                {/* Notification Badge */}
                {tab.notifications && tab.notifications > 0 && (
                  <div className="ml-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center min-w-[16px]">
                    {tab.notifications > 99 ? '99+' : tab.notifications}
                  </div>
                )}
                
                {/* Pin Button - Always visible for pinned */}
                <button
                  onClick={e => { e.stopPropagation(); onTabPin(tab.key); }}
                  className="ml-1 p-1 rounded transition-colors text-yellow-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  aria-label="Pin tab"
                  title="Unpin tab"
                >
                  <Pin size={12} className="fill-current" />
                </button>
                
                {/* Close Button */}
                <button
                  onClick={e => { e.stopPropagation(); onTabClose(globalIdx); }}
                  className="ml-1 p-1 rounded transition-colors text-neutral-400 dark:text-gray-400 hover:text-neutral-600 dark:hover:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100"
                  aria-label="Close tab"
                  title="Close tab"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Scrollable Tabs Section */}
        <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
          {filteredTabs.filter(tab => !pinnedTabs.includes(tab.key)).map((tab) => {
            const globalIdx = tabs.findIndex(t => t.key === tab.key);
            const isActive = activeTabIdx === globalIdx;
            return (
              <div
                key={tab.key}
                className={`group relative flex items-center h-10 px-3 border-r border-neutral-200 dark:border-gray-700 cursor-pointer transition-all whitespace-nowrap min-w-max select-none rounded-t-lg
                  ${isActive 
                    ? "font-bold text-neutral-900 dark:text-white bg-white dark:bg-gray-800 shadow-sm" 
                    : "font-normal text-neutral-700 dark:text-gray-300 bg-white/60 dark:bg-gray-900/60 hover:bg-white dark:hover:bg-gray-800"
                  }
                  ${draggedTab === globalIdx ? "opacity-50" : ""}
                  ${dragOverTab === globalIdx ? "border-l-2 border-l-blue-500" : ""}
                `}
                onClick={() => onTabClick(globalIdx)}
                onContextMenu={(e) => handleContextMenu(e, globalIdx)}
                draggable
                onDragStart={(e) => handleDragStart(e, globalIdx)}
                onDragOver={(e) => handleDragOver(e, globalIdx)}
                onDrop={(e) => handleDrop(e, globalIdx)}
                style={{ 
                  borderRadius: '8px 8px 0 0',
                  borderBottom: isActive ? '3px solid #2563eb' : '1px solid transparent'
                }}
              >
                {/* Tab Icon */}
                <div className="mr-2 text-neutral-500 dark:text-gray-400">
                  {getTabIcon(tab.type)}
                </div>
                
                {/* Tab Title */}
                <span className="truncate max-w-[100px] text-sm">{tab.title}</span>
                
                {/* Status Icon */}
                {tab.status && (
                  <div className="ml-1">
                    {getStatusIcon(tab.status)}
                  </div>
                )}
                
                {/* Notification Badge */}
                {tab.notifications && tab.notifications > 0 && (
                  <div className="ml-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center min-w-[16px]">
                    {tab.notifications > 99 ? '99+' : tab.notifications}
                  </div>
                )}
                
                {/* Pin Button - Show on hover */}
                <button
                  onClick={e => { e.stopPropagation(); onTabPin(tab.key); }}
                  className="ml-1 p-1 rounded transition-colors text-neutral-400 dark:text-gray-400 hover:text-neutral-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-neutral-100 dark:hover:bg-gray-700"
                  aria-label="Pin tab"
                  title="Pin tab"
                >
                  <Pin size={12} />
                </button>
                
                {/* Close Button */}
                <button
                  onClick={e => { e.stopPropagation(); onTabClose(globalIdx); }}
                  className="ml-1 p-1 rounded transition-colors text-neutral-400 dark:text-gray-400 hover:text-neutral-600 dark:hover:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100"
                  aria-label="Close tab"
                  title="Close tab"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
          
          {/* No results message */}
          {searchTerm && filteredTabs.filter(tab => !pinnedTabs.includes(tab.key)).length === 0 && (
            <div className="flex items-center px-4 py-2 text-neutral-500 dark:text-neutral-400 text-sm">
              No tabs match "{searchTerm}"
            </div>
          )}
        </div>

        {/* Action Buttons Section */}
        <div className="flex items-center gap-1 px-2 border-l border-neutral-200 dark:border-gray-700">
          {/* Search Button */}
          <button
            onClick={handleSearchToggle}
            className={`p-2 rounded transition-colors ${
              showSearch 
                ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" 
                : "text-neutral-400 dark:text-gray-400 hover:text-neutral-600 dark:hover:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-700"
            }`}
            aria-label="Search tabs"
            title="Search tabs"
          >
            <Search size={14} />
          </button>
          
          {/* New Tab Button */}
          <button
            onClick={onNewTab}
            className="p-2 rounded transition-colors text-neutral-400 dark:text-gray-400 hover:text-neutral-600 dark:hover:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-700"
            aria-label="New tab"
            title="New tab"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 py-2 bg-white dark:bg-gray-900 border-t border-neutral-200 dark:border-gray-700">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search tabs..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-8 pr-8 py-1 text-sm border border-neutral-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              Found {filteredTabs.length} of {tabs.length} tabs
            </div>
          )}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => handleTabAction('refresh', contextMenu.tabIdx)}
            className="w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Refresh Tab
          </button>
          <button
            onClick={() => handleTabAction('duplicate', contextMenu.tabIdx)}
            className="w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Plus size={14} />
            Duplicate Tab
          </button>
          <button
            onClick={() => handleTabAction('rename', contextMenu.tabIdx)}
            className="w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Settings size={14} />
            Rename Tab
          </button>
          <div className="border-t border-neutral-200 dark:border-gray-700 my-1"></div>
          <button
            onClick={() => handleTabAction('pin', contextMenu.tabIdx)}
            className="w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Pin size={14} />
            {pinnedTabs.includes(tabs[contextMenu.tabIdx]?.key) ? 'Unpin Tab' : 'Pin Tab'}
          </button>
          <div className="border-t border-neutral-200 dark:border-gray-700 my-1"></div>
          <button
            onClick={() => handleTabAction('close', contextMenu.tabIdx)}
            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
          >
            <X size={14} />
            Close Tab
          </button>
        </div>
      )}
    </>
  );
} 