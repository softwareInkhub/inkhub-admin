import { redirect } from 'next/navigation';

export default function DesignLibraryIndexRedirect() {
  redirect('/design-library/designs');
  return null;
} 