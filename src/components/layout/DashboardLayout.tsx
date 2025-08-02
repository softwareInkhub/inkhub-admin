"use client";
import React from "react";
import GlobalLayout from "./GlobalLayout";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <GlobalLayout>{children}</GlobalLayout>;
} 