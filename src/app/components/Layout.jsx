'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
    ChartPieIcon, Cog6ToothIcon, ArrowRightEndOnRectangleIcon, LightBulbIcon,
    MapIcon, TagIcon, Bars3Icon, XMarkIcon, InformationCircleIcon, 
    ChatBubbleLeftRightIcon, ShareIcon, PuzzlePieceIcon, QuestionMarkCircleIcon,
    LifebuoyIcon, BellIcon
} from '@heroicons/react/24/outline';

// --- Sub-component: Top Navigation ---
const TopNav = () => {
    const { data: session, status } = useSession();
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const userDropdownRef = useRef(null);
    const notificationsRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const fetchNotifications = async () => {
        if (status !== 'authenticated') return;
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [status]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) setUserDropdownOpen(false);
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) setNotificationsOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = async (id) => {
        setNotifications(current => current.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId: id })
        });
        setNotificationsOpen(false);
    };

    if (status !== 'authenticated') return null;

    return (
        <div className="flex items-center space-x-4 h-full">
            <div className="relative h-full flex items-center" ref={notificationsRef}>
                <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 relative">
                    <BellIcon className="h-6 w-6" />
                    {unreadCount > 0 && <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>}
                </button>
                {notificationsOpen && (
                    <div className="absolute top-full right-0 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                        <div className="px-4 py-2 border-b"><p className="text-sm font-medium text-gray-900">Notifications</p></div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? <p className="text-center text-sm text-gray-500 py-4">No new notifications</p> : 
                            notifications.map(notif => <Link key={notif.id} href={notif.link || '#'}><div onClick={() => handleNotificationClick(notif.id)} className={`block px-4 py-3 text-sm hover:bg-gray-100 ${!notif.is_read ? 'bg-blue-50' : ''}`}><p className={!notif.is_read ? 'font-semibold':''}>{notif.message}</p><p className="text-xs text-gray-500 mt-1">{new Date(notif.created_at).toLocaleString()}</p></div></Link>)}
                        </div>
                    </div>
                )}
            </div>
            <div className="relative h-full flex items-center" ref={userDropdownRef}>
                <button onClick={() => setUserDropdownOpen(!userDropdownOpen)} className="flex items-center space-x-2 rounded-full h-full">
                    <img className="h-8 w-8 rounded-full" src={session.user.image || `https://avatar.vercel.sh/${session.user.email}`} alt="User avatar" />
                </button>
                {userDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                        <div className="px-4 py-2 border-b"><p className="text-sm font-medium text-gray-900 truncate">{session.user.name}</p><p className="text-xs text-gray-500 truncate">{session.user.email}</p></div>
                        <a href="/settings" className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><Cog6ToothIcon className="h-5 w-5 mr-2" /> Settings</a>
                        <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><ArrowRightEndOnRectangleIcon className="h-5 w-5 mr-2" /> Sign Out</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Sub-component: Footer ---
const Footer = () => {
    const footerLinks = [
        { name: 'About', href: '/about' }, { name: 'Contact', href: '/contact' },
        { name: 'Terms of Service', href: '/terms' }, { name: 'Privacy Policy', href: '/privacy' },
    ];
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <nav className="flex flex-wrap justify-center -mx-5 -my-2">
                    {footerLinks.map((link) => (
                        <div key={link.name} className="px-5 py-2"><a href={link.href} className="text-sm text-gray-500 hover:text-gray-900">{link.name}</a></div>
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
      <div className="flex-grow"><a href="/" className="flex items-center pb-6 px-2"><h1 className="text-2xl font-bold text-white">CortexCart</h1></a><nav><ul className="space-y-2">
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
      </ul></nav></div>
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
const BetaBanner = () => {
    const [isVisible, setIsVisible] = useState(true);
    if (!isVisible) return null;
    return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
            <div className="flex">
                <div className="flex-shrink-0"><InformationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" /></div>
                <div className="ml-3"><p className="text-sm text-yellow-700">This is a beta release. Some features may not work as expected. Please use the feedback button to report any issues.</p></div>
                <div className="ml-auto pl-3"><div className="-mx-1.5 -my-1.5">
                    <button type="button" onClick={() => setIsVisible(false)} className="inline-flex bg-yellow-50 rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600">
                        <span className="sr-only">Dismiss</span>
                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div></div>
            </div>
        </div>
    );
};

// --- Sub-component: Feedback Button ---
const FeedbackButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [subject, setSubject] = useState('bug');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('idle');
    const [statusMessage, setStatusMessage] = useState('');

    const feedbackSubjects = {
        'bug': 'Please describe the bug in as much detail as possible, including the steps you took to make it happen.',
        'feature': 'Please describe the new feature you\'d like to see and why it would be helpful.',
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        setStatusMessage('');
        try {
            const res = await fetch('/api/feedback/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, message })
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'An unknown error occurred.');
            setStatus('success');
            setStatusMessage('Thank you! Your feedback has been sent.');
            setMessage('');
            setTimeout(() => { setIsOpen(false); setStatus('idle'); }, 2000);
        } catch (error) {
            setStatus('error');
            setStatusMessage(error.message);
        }
    };

    if (!isOpen) {
        return <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 z-50"><ChatBubbleLeftRightIcon className="h-6 w-6" /></button>;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center" aria-modal="true">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsOpen(false)}></div>
            <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl transform transition-all sm:my-8">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Submit Feedback</h3>
                        <p className="mt-1 text-sm text-gray-500">We appreciate your help in making our app better!</p>
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                        <select id="subject" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            <option value="bug">Bug Report</option>
                            <option value="feature">Feature Request</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                        <div className="mt-1">
                            <p className="text-xs text-gray-500 mb-2">{feedbackSubjects[subject]}</p>
                            <textarea id="message" name="message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm sm:text-sm p-2 focus:ring-blue-500 focus:border-blue-500" required></textarea>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <button type="submit" disabled={status === 'sending'} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
                            {status === 'sending' ? 'Sending...' : 'Submit Feedback'}
                        </button>
                        <button type="button" onClick={() => setIsOpen(false)} className="text-sm font-medium text-gray-700 hover:text-gray-900">Cancel</button>
                    </div>
                    {statusMessage && (<p className={`text-sm ${status === 'error' ? 'text-red-600' : 'text-green-600'}`}>{statusMessage}</p>)}
                </form>
            </div>
        </div>
    );
};


// --- Main Layout Component ---
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="relative h-screen flex bg-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-shrink-0 w-64 bg-gray-800 p-4 flex-col">
        <SidebarContent />
      </aside>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-0">
        {/* Corrected Header Structure */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
            <button onClick={() => setSidebarOpen(true)} className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none lg:hidden">
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex-1 px-4 sm:px-6 md:px-8 flex justify-end">
                <TopNav />
            </div>
        </div>

        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none p-6 lg:p-10">
            <BetaBanner />
            {children}
        </main>
        
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
