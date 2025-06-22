import { ReactNode } from 'react';

interface UserManagementLayoutProps {
  children: ReactNode;
}
 
export default function UserManagementLayout({ children }: UserManagementLayoutProps) {
  return <div className="h-full w-full">{children}</div>;
} 