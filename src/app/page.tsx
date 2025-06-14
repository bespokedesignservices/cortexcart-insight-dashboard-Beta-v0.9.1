'use client';

import { useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SignInPage() {
  // Corrected: Removed unused 'session' variable. We only need the 'status'.
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If the session is loaded and the user is authenticated,
    // redirect them away from the sign-in page to their dashboard.
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  // While the session is loading, show a simple loading message
  // to prevent the sign-in button from flashing for authenticated users.
  if (status === 'loading') {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <p>Loading...</p>
        </div>
    );
  }

  // Only show the sign-in UI if the user is unauthenticated.
  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to CortexCart</h1>
            <p className="mt-2 text-gray-600">Sign in to view your dashboard</p>
          </div>
          <button
            onClick={() => signIn('google')}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Image 
                src="/google.svg" // Assuming you have a Google logo in your /public folder
                alt="Google logo"
                width={20}
                height={20}
                className="mr-2 bg-white rounded-full p-0.5"
                onError={(e) => e.currentTarget.style.display = 'none'}
            />
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // Fallback for authenticated users before redirect kicks in
  return null;
}
