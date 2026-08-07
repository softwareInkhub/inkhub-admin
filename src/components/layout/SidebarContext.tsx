'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  secondarySidebarCollapsed: boolean;
  setSecondarySidebarCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [secondarySidebarCollapsed, setSecondarySidebarCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{
      secondarySidebarCollapsed,
      setSecondarySidebarCollapsed,
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
} 