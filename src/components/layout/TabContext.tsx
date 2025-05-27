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
  if (!ctx) throw new Error("useTabContext must be used within a TabProvider");
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
    if (storedTabs) setOpenTabs(JSON.parse(storedTabs));
    if (storedActive) setActiveTabState(storedActive);
  }, []);

  // Persist tabs to localStorage
  useEffect(() => {
    localStorage.setItem("universalTabs", JSON.stringify(openTabs));
  }, [openTabs]);
  useEffect(() => {
    if (activeTab) localStorage.setItem("universalActiveTab", activeTab);
  }, [activeTab]);

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