'use client';

import React, { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { 
    ChartPieIcon, 
    Cog6ToothIcon, 
    ArrowRightEndOnRectangleIcon,
    Bars3Icon, // Hamburger menu icon
    XMarkIcon   // Close (X) icon
} from '@heroicons/react/24/outline';

// The Sidebar component remains mostly the same but will be positioned differently by the parent
const SidebarContent = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const handleAuthClick = () => {
    if (session) {
      signOut({ callbackUrl: '/' }); // Redirect to homepage on sign out
    } else {
      signIn('google');
    }
  };
  
  const getLinkClass = (path) => {
    return pathname === path 
      ? 'flex items-center p-2 bg-gray-700 rounded-lg text-white' 
      : 'flex items-center p-2 text-gray-300 rounded-lg hover:bg-gray-600 hover:text-white transition-colors';
  }

  return (
    <>
      <div className="flex-grow">
        <a href="/" className="flex items-center pb-6 px-2">
            <h1 className="text-2xl font-bold text-white">CortexCart</h1>
        </a>
        <nav>
          <ul className="space-y-2">
            {session && (
              <>
                <li>
                  <a href="/dashboard" className={getLinkClass('/dashboard')}>
                    <ChartPieIcon className="h-6 w-6 mr-3" />
                    <span>Dashboard</span>
                  </a>
                </li>
                <li>
                  <a href="/settings" className={getLinkClass('/settings')}>
                    <Cog6ToothIcon className="h-6 w-6 mr-3" />
                    <span>Settings</span>
                  </a>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>

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
    </>
  );
};


const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative h-screen flex">
      
      {/* --- Mobile Sidebar --- */}
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-gray-900 bg-opacity-30 z-30 lg:hidden transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      {/* Sidebar Panel */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-gray-800 p-4 flex flex-col z-40 transform transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button 
          onClick={() => setSidebarOpen(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <SidebarContent />
      </aside>

      {/* --- Desktop Sidebar --- */}
      <aside className="hidden lg:flex lg:flex-shrink-0 w-64 bg-gray-800 p-4 flex-col">
        <SidebarContent />
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col w-0">
        {/* Top bar for mobile with hamburger menu */}
        <header className="lg:hidden flex items-center h-16 bg-white border-b border-gray-200 px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </header>

        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none p-6 lg:p-10 bg-gray-100">
            {children}
        </main>
      </div>

    </div>
  );
};

export default Layout;
