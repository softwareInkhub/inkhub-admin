'use client';
import React, { useState } from 'react';
import { User, Settings, Bell, MessageSquare, Sun, Moon, ChevronDown, LogOut, UserPlus, Shield, HelpCircle } from 'lucide-react';

interface NavbarProps {
  title?: string;
  onThemeToggle?: (isDark: boolean) => void;
  isDarkMode?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  title = "BRMH Dashboard",
  onThemeToggle,
  isDarkMode = false
}) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  const handleThemeToggle = () => {
    onThemeToggle?.(!isDarkMode);
  };

  return (
    <nav className="nav-modern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-4">
            {/* Messages */}
            <div className="relative">
              <button
                onClick={() => setShowMessages(!showMessages)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
              >
                <MessageSquare size={18} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
              >
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  5
                </span>
              </button>
            </div>

            {/* Settings */}
            <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <Settings size={18} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">B</span>
                </div>
                <span className="hidden md:block text-sm font-medium">User</span>
                <ChevronDown size={16} />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileDropdown && (
                <div className="dropdown-modern right-0 mt-2">
                  <div className="py-1">
                    <a href="#" className="dropdown-item flex items-center">
                      <User size={16} className="mr-2" />
                      Profile
                    </a>
                    <a href="#" className="dropdown-item flex items-center">
                      <Settings size={16} className="mr-2" />
                      Settings
                    </a>
                    <a href="#" className="dropdown-item flex items-center">
                      <Shield size={16} className="mr-2" />
                      Security
                    </a>
                    <a href="#" className="dropdown-item flex items-center">
                      <HelpCircle size={16} className="mr-2" />
                      Help
                    </a>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <a href="#" className="dropdown-item flex items-center text-red-600 dark:text-red-400">
                      <LogOut size={16} className="mr-2" />
                      Sign Out
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="absolute top-16 right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">New order received</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">System update completed</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Panel */}
      {showMessages && (
        <div className="absolute top-16 right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Messages</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">SJ</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Sarah Johnson</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Hey, can you check the latest...</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">MC</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Mike Chen</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">The project is ready for review...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 