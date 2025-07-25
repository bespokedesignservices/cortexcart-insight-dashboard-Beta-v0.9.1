import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { BellIcon, Cog6ToothIcon, ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/outline';
import NotificationsPanel from './NotificationsPanel';
import ThemeToggle from './ThemeToggle';
export default function TopNav() {
    const { data: session, status } = useSession();
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    
    const userDropdownRef = useRef(null);
    const notificationsRef = useRef(null);

    // --- Add logging here ---
    const unreadCount = notifications.filter(n => !n.is_read).length;
    console.log("TopNav Render: Unread count is", unreadCount);

    const fetchNotifications = async () => {
        console.log("Attempting to fetch notifications...");
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                console.log("Successfully fetched data:", data);
                setNotifications(data);
            } else {
                console.error("Fetch failed with status:", res.status);
            }
        } catch (error) {
            console.error("An error occurred while fetching notifications:", error);
        }
    };

    useEffect(() => {
        console.log("TopNav useEffect triggered. Auth status is:", status);
        if (status === 'authenticated') {
            fetchNotifications(); 

            const interval = setInterval(() => {
                console.log("Polling for new notifications...");
                fetchNotifications();
            }, 30000);

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

    if (status !== 'authenticated') {
        return null; 
    }

    return (
        
        <div className="flex items-center space-x-4 ml-auto">
           
            <div className="relative" ref={notificationsRef}>
                <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 relative">
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                    )}
                </button>
                {notificationsOpen && <NotificationsPanel notifications={notifications} onNotificationClick={handleNotificationClick} />}
            </div>

            <div className="relative" ref={userDropdownRef}>
                <button onClick={() => setUserDropdownOpen(!userDropdownOpen)} className="flex items-center space-x-2 rounded-full hover:bg-gray-100">
                    <img className="h-8 w-8 rounded-full" src={session.user.image || `https://avatar.vercel.sh/${session.user.email}`} alt="User avatar" />
                </button>
                {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                        <div className="px-4 py-2 border-b"><p className="text-sm font-medium text-gray-900 truncate">{session.user.name}</p><p className="text-xs text-gray-500 truncate">{session.user.email}</p></div>
                        <a href="/settings" className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><Cog6ToothIcon className="h-5 w-5 mr-2" /> Settings</a>
                        <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><ArrowRightEndOnRectangleIcon className="h-5 w-5 mr-2" /> Sign Out</button>
                    </div>
                )}
            </div>
        </div>
    );
}
