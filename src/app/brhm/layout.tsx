"use client";
import React from "react";

export default function BrhmLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 p-4">
        {children}
      </div>
    </div>
  );
} 