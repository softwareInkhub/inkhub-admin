'use client';

import { useRouter } from 'next/navigation';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';

export default function SimpleNavbar() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear all localStorage and sessionStorage for a full cleanup
    localStorage.clear();
    sessionStorage.clear();

    // Remove the session cookie
    Cookies.remove('id_token');
    
    // Redirect to the login page to start a new session
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        {/* INKHUB Logo on the left */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">INKHUB</h1>
        </div>
        
        {/* Log out button on the right */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-x-2 p-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowRightOnRectangleIcon
              className="h-5 w-5 text-gray-500"
              aria-hidden="true"
            />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </nav>
  );
} 