'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DesignLibraryPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to designs page on client side
    router.push('/design-library/designs');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Designs...</p>
      </div>
    </div>
  );
} 