'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PinterestPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard page on client side
    router.push('/pinterest/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Dashboard...</p>
      </div>
    </div>
  );
} 