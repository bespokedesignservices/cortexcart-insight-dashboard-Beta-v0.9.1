'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, UserPlusIcon, NoSymbolIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function fetchUsers() {
            setIsLoading(true);
            try {
                const res = await fetch('/api/admin/users');
                if (!res.ok) {
                    throw new Error('Failed to fetch users. You may not have permission to view this page.');
                }
                const data = await res.json();
                setUsers(data);
                setFilteredUsers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
        fetchUsers();
    }, []);

    useEffect(() => {
        const results = users.filter(user =>
            user.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.site_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(results);
    }, [searchTerm, users]);

    return (
        <div>
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="mt-1 text-sm text-gray-600">View, manage, and monitor all registered users.</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button
                        type="button"
                        className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                    >
                        <UserPlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                        Add New User
                    </button>
                </div>
            </div>

            {/* Search Bar */}
             <div className="mb-4">
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        id="search"
                        className="block w-full max-w-md rounded-md border-0 bg-white py-2 pl-10 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400"
                        placeholder="Search by email or site name..."
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="mt-6 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">User Email</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Site Name</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Joined On</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {isLoading ? (
                                        <tr><td colSpan="5" className="py-4 text-center text-gray-500">Loading users...</td></tr>
                                    ) : error ? (
                                         <tr><td colSpan="5" className="py-4 text-center text-red-500">{error}</td></tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.user_email}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{user.user_email}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.site_name}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                        Active
                                                    </span>
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <div className="flex justify-end space-x-2">
                                                        <button className="text-gray-400 hover:text-gray-600"><PencilIcon className="h-5 w-5" /></button>
                                                        <button className="text-gray-400 hover:text-red-600"><NoSymbolIcon className="h-5 w-5" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
