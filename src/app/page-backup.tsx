// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function HomePage() {
  // This function tells Next.js to immediately send the user to the /dashboard route.
  redirect('/dashboard');
  
  // This component doesn't need to return any HTML.
  return null;
}
