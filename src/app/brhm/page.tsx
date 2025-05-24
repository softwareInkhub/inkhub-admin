import { redirect } from 'next/navigation';

export default function BrhmIndexRedirect() {
  redirect('/brhm/dashboard');
  return null;
} 