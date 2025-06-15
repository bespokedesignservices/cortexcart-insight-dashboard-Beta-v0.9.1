'use client';

import React, { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { 
    ChartPieIcon, 
    Cog6ToothIcon, 
    ArrowRightEndOnRectangleIcon,
    LightBulbIcon,
    MapIcon,
    Bars3Icon,
    XMarkIcon,
    InformationCircleIcon // <-- New icon for banner
} from '@heroicons/react/24/outline';
import FeedbackButton from './FeedbackButton';

// This sub-component contains the actual sidebar content
const SidebarContent = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const handleAuthClick = () => {
    if (session) {
      signOut({ callbackUrl: '/' });
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
                  <a href="/recommendations" className={getLinkClass('/recommendations')}>
                    <LightBulbIcon className="h-6 w-6 mr-3" />
                    <span>Recommendations</span>
                  </a>
                </li>
                <li>
                  <a href="/roadmap" className={getLinkClass('/roadmap')}>
                    <MapIcon className="h-6 w-6 mr-3" />
                    <span>Roadmap</span>
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
            <p className="font-semibold text-white">{session.user.name}</p>
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

// --- NEW Beta Notification Banner Component ---
const BetaBanner = ({ onDismiss }) => {
    return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
                <div className="flex-shrink-0">
                    <InformationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                        This is a beta release. Some features may not work as expected. Please use the feedback button to report any issues.
                    </p>
                </div>
                <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                        <button
                            type="button"
                            onClick={onDismiss}
                            className="inline-flex bg-yellow-50 rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                        >
                            <span className="sr-only">Dismiss</span>
                            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  return (
    <div className="relative h-screen flex bg-gray-100">
      
      {/* --- Mobile Sidebar --- */}
      <div 
        className={`fixed inset-0 bg-gray-900 bg-opacity-30 z-30 lg:hidden transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      ></div>
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
        <header className="lg:hidden flex items-center h-16 bg-white border-b border-gray-200 px-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </header>

        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none p-6 lg:p-10">
            {isBannerVisible && <BetaBanner onDismiss={() => setIsBannerVisible(false)} />}
            {children}
        </main>
        
        <footer className="text-center p-4 text-xs text-gray-800 bg-white border-t border-gray-200">
          &copy; 2025 CortexCart v0.90 Beta
        </footer>
      </div>

      <FeedbackButton />

    </div>
  );
};

export default Layout;
