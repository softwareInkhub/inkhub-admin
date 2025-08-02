"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

export interface Tab {
  key: string;
  label: string;
  path: string;
}

interface TabContextType {
  openTabs: Tab[];
  activeTab: string;
  openTab: (tab: Tab) => void;
  closeTab: (key: string) => void;
  setActiveTab: (key: string) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export const useTabContext = () => {
  const ctx = useContext(TabContext);
  if (!ctx) {
    console.warn("useTabContext must be used within a TabProvider");
    return {
      openTabs: [],
      activeTab: "",
      openTab: () => {},
      closeTab: () => {},
      setActiveTab: () => {},
    };
  }
  return ctx;
};

export const TabProvider = ({ children }: { children: ReactNode }) => {
  const [openTabs, setOpenTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTabState] = useState<string>("");
  const pathname = usePathname();
  const router = useRouter();

  // Restore tabs from localStorage on mount
  useEffect(() => {
    const storedTabs = localStorage.getItem("universalTabs");
    const storedActive = localStorage.getItem("universalActiveTab");
    let tabs = storedTabs ? JSON.parse(storedTabs) : [];
    if (tabs.length === 0) {
      // If no tabs, add the current page as a tab
      const label = pathname.split("/").filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ") || "Home";
      tabs = [{ key: pathname, label, path: pathname }];
    } else if (!tabs.find((tab: Tab) => tab.path === pathname)) {
      // If current page is not in tabs, add it
      const label = pathname.split("/").filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ") || "Home";
      tabs.push({ key: pathname, label, path: pathname });
    }
    setOpenTabs(tabs);
    if (storedActive) {
      setActiveTabState(storedActive);
    } else {
      setActiveTabState(pathname);
    }
  }, [pathname]);

  // Persist tabs to localStorage
  useEffect(() => {
    localStorage.setItem("universalTabs", JSON.stringify(openTabs));
  }, [openTabs]);
  useEffect(() => {
    if (activeTab) localStorage.setItem("universalActiveTab", activeTab);
  }, [activeTab]);

  // Restore active tab from localStorage on mount
  useEffect(() => {
    const storedActive = localStorage.getItem("universalActiveTab");
    if (storedActive) setActiveTabState(storedActive);
  }, []);

  // Update active tab on route change
  useEffect(() => {
    const found = openTabs.find(tab => tab.path === pathname);
    if (found) setActiveTabState(found.key);
  }, [pathname]);

  const openTab = (tab: Tab) => {
    setOpenTabs(prev => {
      if (prev.find(t => t.key === tab.key)) return prev;
      return [...prev, tab];
    });
    setActiveTabState(tab.key);
    router.push(tab.path);
  };

  const closeTab = (key: string) => {
    setOpenTabs(prev => {
      const updated = prev.filter(t => t.key !== key);
      if (activeTab === key) {
        if (updated.length > 0) {
          setActiveTabState(updated[updated.length - 1].key);
          router.push(updated[updated.length - 1].path);
        } else {
          setActiveTabState("");
          router.push("/");
        }
      }
      return updated;
    });
  };

  const setActiveTab = (key: string) => {
    const tab = openTabs.find(t => t.key === key);
    if (tab) {
      setActiveTabState(key);
      router.push(tab.path);
    }
  };

  return (
    <TabContext.Provider value={{ openTabs, activeTab, openTab, closeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  );
}; 