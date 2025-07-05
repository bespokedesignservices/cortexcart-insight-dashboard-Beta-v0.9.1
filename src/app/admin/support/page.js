'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchTickets() {
            setIsLoading(true);
            const res = await fetch('/api/admin/support/tickets');
            if (res.ok) {
                const data = await res.json();
                setTickets(data);
            } else {
                console.error("Failed to fetch tickets");
            }
            setIsLoading(false);
        }
        fetchTickets();
    }, []);

    const StatusBadge = ({ status }) => {
        const styles = {
            open: 'bg-green-100 text-green-800',
            closed: 'bg-gray-100 text-gray-800',
        };
        const statusText = status.charAt(0).toUpperCase() + status.slice(1);
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.closed}`}>{statusText}</span>;
    };

    return (
        <div>
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
                    <p className="mt-1 text-sm text-gray-600">View and manage all tickets submitted by users.</p>
                </div>
            </div>

            <div className="mt-6 flow-root">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="py-3.5 pl-6 text-left text-sm font-semibold text-gray-900">User Email</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Subject</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {isLoading ? (
                                <tr><td colSpan="4" className="py-4 text-center text-gray-500">Loading tickets...</td></tr>
                            ) : tickets.map((ticket) => (
                                <tr key={ticket.id} onClick={() => router.push(`/admin/support/${ticket.id}`)} className="cursor-pointer hover:bg-gray-50">
                                    <td className="py-4 pl-6 text-sm font-medium text-gray-900">{ticket.user_email}</td>
                                    <td className="px-3 py-4 text-sm text-gray-900">{ticket.subject}</td>
                                    <td className="px-3 py-4 text-sm text-gray-500"><StatusBadge status={ticket.status} /></td>
                                    <td className="px-3 py-4 text-sm text-gray-500">{new Date(ticket.updated_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
