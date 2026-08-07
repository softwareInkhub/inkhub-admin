'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
}

interface Message {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  read: boolean;
  avatar?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: 'online' | 'offline' | 'away';
}

interface NavbarContextType {
  // Sidebar state
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  
  // Notifications state
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  getUnreadNotificationsCount: () => number;
  
  // Messages state
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  markMessageAsRead: (id: string) => void;
  getUnreadMessagesCount: () => number;
  
  // Settings state
  getSettingsCount: () => number;
  
  // User state
  currentUser: User;
  setCurrentUser: (user: User) => void;
  
  // Dropdown states
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  isMessagesOpen: boolean;
  setIsMessagesOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: (open: boolean) => void;
  
  // Utility functions
  formatTimeAgo: (date: Date) => string;
  getNotificationIcon: (type: string) => string;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (context === undefined) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
};

interface NavbarProviderProps {
  children: ReactNode;
}

export const NavbarProvider: React.FC<NavbarProviderProps> = ({ children }) => {
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'System Update',
      message: 'New system update available for deployment',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      read: false,
    },
    {
      id: '2',
      title: 'High CPU Usage',
      message: 'CPU usage has exceeded 80% on server-01',
      type: 'warning',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      read: false,
    },
    {
      id: '3',
      title: 'Order Completed',
      message: 'Order #12345 has been successfully processed',
      type: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: true,
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'John Doe',
      message: 'Can you help me with the new feature?',
      timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      read: false,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    },
    {
      id: '2',
      sender: 'Jane Smith',
      message: 'The deployment was successful!',
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      read: false,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
    },
    {
      id: '3',
      sender: 'Mike Johnson',
      message: 'Thanks for the quick response',
      timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      read: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
    },
  ]);

  const [currentUser, setCurrentUser] = useState<User>({
    id: '1',
    name: 'Admin User',
    email: 'admin@inkhub.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    role: 'Administrator',
    status: 'online',
  });

  // Dropdown states
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Notification handlers
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };
  
  const getUnreadNotificationsCount = () => notifications.filter(n => !n.read).length;
  
  // Message handlers
  const markMessageAsRead = (id: string) => {
    setMessages(prev => 
      prev.map(message => 
        message.id === id ? { ...message, read: true } : message
      )
    );
  };
  
  const getUnreadMessagesCount = () => messages.filter(m => !m.read).length;
  
  // Settings count
  const getSettingsCount = () => 15; // Mock settings count
  
  // Utility functions
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };
  
  const value: NavbarContextType = {
    // Sidebar state
    isSidebarOpen,
    setIsSidebarOpen,
    
    // Notifications state
    notifications,
    setNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadNotificationsCount,
    
    // Messages state
    messages,
    setMessages,
    markMessageAsRead,
    getUnreadMessagesCount,
    
    // Settings state
    getSettingsCount,
    
    // User state
    currentUser,
    setCurrentUser,
    
    // Dropdown states
    isNotificationsOpen,
    setIsNotificationsOpen,
    isMessagesOpen,
    setIsMessagesOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isUserMenuOpen,
    setIsUserMenuOpen,
    
    // Utility functions
    formatTimeAgo,
    getNotificationIcon,
  };
  
  return (
    <NavbarContext.Provider value={value}>
      {children}
    </NavbarContext.Provider>
  );
}; 