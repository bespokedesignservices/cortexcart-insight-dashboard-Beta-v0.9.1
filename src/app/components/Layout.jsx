'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { 
    ChartPieIcon, Cog6ToothIcon, ArrowRightEndOnRectangleIcon, LightBulbIcon,
    MapIcon, TagIcon, Bars3Icon, XMarkIcon, InformationCircleIcon, 
    ChatBubbleLeftRightIcon, ShareIcon, PuzzlePieceIcon, QuestionMarkCircleIcon,
    LifebuoyIcon, BellIcon, UserCircleIcon
} from '@heroicons/react/24/outline';

// --- Sub-component: Top Navigation ---
const TopNav = () => {
    const { data: session } = useSession();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    if (!session) return null;

    return (
        <div className="flex items-center justify-end h-16 bg-white px-6 flex-shrink-0">
            <div className="flex items-center space-x-4">
                <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" />
                </button>
                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 rounded-full">
                        <span className="sr-only">Open user menu</span>
                        <img className="h-8 w-8 rounded-full" src={session.user.image || `https://avatar.vercel.sh/${session.user.email}`} alt="User avatar" />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                            <div className="px-4 py-2 border-b">
                                <p className="text-sm font-medium text-gray-900 truncate">{session.user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                            </div>
                            <a href="/settings" className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <Cog6ToothIcon className="h-5 w-5 mr-2" /> Settings
                            </a>
                            <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <ArrowRightEndOnRectangleIcon className="h-5 w-5 mr-2" /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Sub-component: Footer ---
const Footer = () => {
    const footerLinks = [
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Privacy Policy', href: '/privacy' },
    ];
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <nav className="flex flex-wrap justify-center -mx-5 -my-2">
                    {footerLinks.map((link) => (
                        <div key={link.name} className="px-5 py-2">
                            <a href={link.href} className="text-sm text-gray-500 hover:text-gray-900">{link.name}</a>
                        </div>
                    ))}
                </nav>
                <p className="mt-6 text-center text-xs text-gray-400">&copy; 2025 CortexCart v0.90 Beta. All rights reserved.</p>
            </div>
        </footer>
    );
};

// --- Sub-component: Sidebar Content ---
const SidebarContent = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const getLinkClass = (path) => {
    if (path === '/dashboard') {
        return pathname === path ? 'flex items-center p-2 bg-gray-700 rounded-lg text-white' : 'flex items-center p-2 text-gray-300 rounded-lg hover:bg-gray-600 hover:text-white transition-colors';
    }
    return pathname.startsWith(path) ? 'flex items-center p-2 bg-gray-700 rounded-lg text-white' : 'flex items-center p-2 text-gray-300 rounded-lg hover:bg-gray-600 hover:text-white transition-colors';
  };
  return (
    <>
      <div className="flex-grow">
        <a href="/" className="flex items-center pb-6 px-2"><h1 className="text-2xl font-bold text-white">CortexCart</h1></a>
        <nav><ul className="space-y-2">
            {session && (
            <>
                <li><a href="/dashboard" className={getLinkClass('/dashboard')}><ChartPieIcon className="h-6 w-6 mr-3" /><span>Dashboard</span></a></li>
                <li><a href="/recommendations" className={getLinkClass('/recommendations')}><LightBulbIcon className="h-6 w-6 mr-3" /><span>Homepage AI</span></a></li>
                <li><a href="/products/recommendations" className={getLinkClass('/products')}><TagIcon className="h-6 w-6 mr-3" /><span>Product AI</span></a></li>
                <li><a href="/social" className={getLinkClass('/social')}><ShareIcon className="h-6 w-6 mr-3" /><span>Social Manager</span></a></li>
                <li className="pt-4 border-t border-gray-700 mt-4"><span className="px-2 text-xs font-semibold text-gray-400">Help & Support</span></li>
                <li><a href="/install" className={getLinkClass('/install')}><PuzzlePieceIcon className="h-6 w-6 mr-3" /><span>Install Guides</span></a></li>
                <li><a href="/faq" className={getLinkClass('/faq')}><QuestionMarkCircleIcon className="h-6 w-6 mr-3" /><span>FAQ</span></a></li>
                <li><a href="/support" className={getLinkClass('/support')}><LifebuoyIcon className="h-6 w-6 mr-3" /><span>Support Tickets</span></a></li>
                <li className="pt-4 border-t border-gray-700 mt-4"><span className="px-2 text-xs font-semibold text-gray-400">General</span></li>
                <li><a href="/roadmap" className={getLinkClass('/roadmap')}><MapIcon className="h-6 w-6 mr-3" /><span>Roadmap</span></a></li>
                <li><a href="/notifications" className={getLinkClass('/notifications')}><BellIcon className="h-6 w-6 mr-3" /><span>Notifications</span></a></li>
                <li><a href="/settings" className={getLinkClass('/settings')}><Cog6ToothIcon className="h-6 w-6 mr-3" /><span>Settings</span></a></li>
            </>
            )}
        </ul></nav>
      </div>
      <div>
        {status === 'authenticated' && (
          <div className="mb-4 text-sm"><p className="font-semibold">{session.user.name}</p><p className="text-gray-400 truncate">{session.user.email}</p></div>
        )}
        <button onClick={() => session ? signOut({ callbackUrl: '/' }) : signIn('google')} className="w-full flex items-center justify-center p-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-colors">
          <ArrowRightEndOnRectangleIcon className="h-6 w-6 mr-3" /><span>{session ? 'Sign Out' : 'Sign In'}</span>
        </button>
      </div>
    </>
  );
};

// --- Sub-component: Beta Banner ---
const BetaBanner = () => { /* ... (This component remains the same) ... */ };

// --- Sub-component: Feedback Button ---
const FeedbackButton = () => { /* ... (This component remains the same) ... */ };


// --- Main Layout Component ---
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="relative h-screen flex bg-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-shrink-0 w-64 bg-gray-800 p-4 flex-col">
        <SidebarContent />
      </aside>
      
      <div className="flex-1 flex flex-col w-0">
        {/* Top Navigation Bar for Desktop and Mobile Header */}
        <div className="lg:border-b lg:border-gray-200">
          <div className="hidden lg:block">
            <TopNav />
          </div>
          <header className="lg:hidden flex items-center justify-between h-16 bg-white border-b border-gray-200 px-4 flex-shrink-0">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-500"><Bars3Icon className="h-6 w-6" /></button>
            <div className="lg:hidden">
               <TopNav />
            </div>
          </header>
        </div>

        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none p-6 lg:p-10">
            <BetaBanner />
            {children}
        </main>
        
        {/* App Footer */}
        <Footer />
      </div>

      {/* Mobile Sidebar Flyout */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)}></div>
        <div className={`relative max-w-xs w-full bg-gray-800 h-full flex flex-col p-4 transition-transform transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <button onClick={() => setSidebarOpen(false)} className="absolute top-2 right-2 text-gray-400"><XMarkIcon className="h-6 w-6"/></button>
            <SidebarContent />
        </div>
      </div>
      
      <FeedbackButton />
    </div>
  );
};

export default Layout;
