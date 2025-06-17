'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { BellIcon, Cog6ToothIcon, ArrowRightEndOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function TopNav() {
    const { data: session } = useSession();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
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
        <header className="flex items-center justify-end h-16 bg-white border-b border-gray-200 px-6 flex-shrink-0">
            <div className="flex items-center space-x-4">
                <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" />
                </button>

                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100">
                        <span className="sr-only">Open user menu</span>
                        <img className="h-8 w-8 rounded-full" src={session.user.image || `https://avatar.vercel.sh/${session.user.email}`} alt="User avatar" />
                    </button>

                    {dropdownOpen && (
                        // --- FIX: Added z-10 to ensure the dropdown appears above other content ---
                        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                            <div className="px-4 py-2 border-b">
                                <p className="text-sm font-medium text-gray-900 truncate">{session.user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                            </div>
                            <a href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <Cog6ToothIcon className="h-5 w-5 mr-2" />
                                Settings
                            </a>
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <ArrowRightEndOnRectangleIcon className="h-5 w-5 mr-2" />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
