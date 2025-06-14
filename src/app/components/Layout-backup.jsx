'use client';

import React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react'; // <-- Import NextAuth hooks
import { ChartPieIcon, Cog6ToothIcon, ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { data: session, status } = useSession(); // <-- Get session data

  // Handle Sign In / Sign Out button
  const handleAuthClick = () => {
    if (session) {
      signOut();
    } else {
      signIn('google');
    }
  };

  return (
    <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-6">CortexCart</h1>
      <nav className="flex-grow">
        <ul className="space-y-2">
          {session && ( // Only show dashboard link if logged in
            <li>
              <a href="/dashboard" className="flex items-center p-2 bg-gray-700 rounded-lg text-white">
                <ChartPieIcon className="h-6 w-6 mr-3" />
                <span>Dashboard</span>
              </a>
            </li>
          )}
        </ul>
      </nav>

      {/* Auth Section at the bottom */}
      <div>
        {status === 'authenticated' && (
          <div className="mb-4 text-sm">
            <p className="font-semibold">{session.user.name}</p>
            <p className="text-gray-400 truncate">{session.user.email}</p>
          </div>
        )}
        <button
          onClick={handleAuthClick}
          className="w-full flex items-center justify-center p-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-colors"
        >
          <ArrowRightEndOnRectangleIcon className="h-6 w-6 mr-3" />
          <span>{session ? 'Sign Out' : 'Sign In'}</span>
        </button>
      </div>
    </aside>
  );
};


const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
