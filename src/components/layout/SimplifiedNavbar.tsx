'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChatBubbleLeftRightIcon,
  BellIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  KeyIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useNavbar } from '@/contexts/NavbarContext';

export default function SimplifiedNavbar() {
  const router = useRouter();
  const {
    // Sidebar state
    isSidebarOpen,
    setIsSidebarOpen,
    
    // Notifications state
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadNotificationsCount,
    
    // Messages state
    messages,
    markMessageAsRead,
    getUnreadMessagesCount,
    
    // Settings state
    getSettingsCount,
    
    // User state
    currentUser,
    
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
  } = useNavbar();

  // Refs for click outside handling
  const notificationsRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) {
        setIsMessagesOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsNotificationsOpen, setIsMessagesOpen, setIsSettingsOpen, setIsUserMenuOpen]);

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 border-b border-blue-500/20 px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-6">
          {/* INKHUB Title */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-lg">
              INKHUB
            </h1>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Messages */}
          <div className="relative" ref={messagesRef}>
            <button
              onClick={() => setIsMessagesOpen(!isMessagesOpen)}
              className="p-2.5 rounded-xl hover:bg-white/10 transition-all duration-200 relative text-white"
              aria-label="Messages"
            >
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
              {getUnreadMessagesCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                  {getUnreadMessagesCount()}
                </span>
              )}
            </button>

            {/* Messages Dropdown */}
            {isMessagesOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-50">
                <div className="p-4 border-b border-gray-200/50">
                  <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => markMessageAsRead(message.id)}
                        className={`p-4 border-b border-gray-100/50 cursor-pointer hover:bg-blue-50/50 transition-colors ${
                          !message.read ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <UserIcon className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {message.sender}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatTimeAgo(message.timestamp)}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {message.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No messages
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2.5 rounded-xl hover:bg-white/10 transition-all duration-200 relative text-white"
              aria-label="Notifications"
            >
              <BellIcon className="w-6 h-6" />
              {getUnreadNotificationsCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                  {getUnreadNotificationsCount()}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-50">
                <div className="p-4 border-b border-gray-200/50 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => markNotificationAsRead(notification.id)}
                        className={`p-4 border-b border-gray-100/50 cursor-pointer hover:bg-blue-50/50 transition-colors ${
                          !notification.read ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 text-lg">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatTimeAgo(notification.timestamp)}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2.5 rounded-xl hover:bg-white/10 transition-all duration-200 relative text-white"
              aria-label="Settings"
            >
              <Cog6ToothIcon className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                {getSettingsCount()}
              </span>
            </button>

            {/* Settings Dropdown */}
            {isSettingsOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-50">
                <div className="p-4 border-b border-gray-200/50">
                  <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      router.push('/settings');
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-blue-50/50 transition-colors"
                  >
                    <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">General Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      router.push('/settings/security');
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-blue-50/50 transition-colors"
                  >
                    <ShieldCheckIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">Security</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      router.push('/settings/notifications');
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-blue-50/50 transition-colors"
                  >
                    <BellIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">Notifications</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      router.push('/settings/health');
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-blue-50/50 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-gray-900">Health Check</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-2.5 rounded-xl hover:bg-white/10 transition-all duration-200 text-white"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <UserCircleIcon className="w-6 h-6 text-white" />
              </div>
              <ChevronDownIcon className="w-4 h-4" />
            </button>

            {/* User Menu Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-50">
                <div className="p-4 border-b border-gray-200/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <UserCircleIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {currentUser.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {currentUser.email}
                      </p>
                      <p className="text-xs text-purple-600">
                        {currentUser.role}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      router.push('/profile');
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-blue-50/50 transition-colors"
                  >
                    <UserIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      router.push('/settings');
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-blue-50/50 transition-colors"
                  >
                    <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      router.push('/help');
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-blue-50/50 transition-colors"
                  >
                    <KeyIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">Help & Support</span>
                  </button>
                  <div className="border-t border-gray-200/50 mt-2 pt-2">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        router.push('/logout');
                      }}
                      className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-red-50/50 transition-colors text-red-600"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 