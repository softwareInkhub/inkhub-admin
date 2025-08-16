import { redirect } from 'next/navigation';

export default function PinterestIndexRedirect() {
  redirect('/pinterest/pins');
  return null;
} 