'use client';

import { useState, useEffect, useCallback } from 'react';
// import { useSession } from 'next-auth/react'; // <-- Unused import removed
// import { useRouter } from 'next/navigation'; // <-- Unused import removed
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { UserCircleIcon, ArrowUturnLeftIcon, CheckCircleIcon, LockClosedIcon } from '@heroicons/react/24/solid';

const TicketReply = ({ reply, isAdminReply }) => {
    // Check if the author is an admin based on a naming convention or a flag
    // For now, we'll assume any reply not from the ticket owner is an admin.
    // In a real app, you might have a list of admin emails to check against.
    const authorName = isAdminReply ? "CortexCart Support (You)" : "User";
    const bgColor = isAdminReply ? "bg-blue-100" : "bg-gray-100";
    const alignment = isAdminReply ? "flex-row-reverse space-x-reverse" : "flex-row";

    return (
        <div className={`flex items-start space-x-4 ${alignment}`}>
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center">
                <UserCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className={`flex-1 p-4 rounded-lg border ${bgColor}`}>
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{authorName}</p>
                    <p className="text-xs text-gray-500">
                        {new Date(reply.created_at).toLocaleString()}
                    </p>
                </div>
                <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{reply.message}</p>
            </div>
        </div>
    );
};

export default function ViewAdminTicketPage() {
    // const { data: session } = useSession(); // <-- Unused variable removed
    // const router = useRouter(); // <-- Unused variable removed
    const params = useParams();
    const { id: ticketId } = params;

    const [ticketData, setTicketData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [newReply, setNewReply] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    const fetchTicket = useCallback(async () => {
        if (!ticketId) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/support/tickets/${ticketId}`);
            if (!res.ok) throw new Error('Could not load the ticket.');
            const data = await res.json();
            setTicketData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [ticketId]);

    useEffect(() => {
        fetchTicket();
    }, [fetchTicket]);

    const handlePostReply = async (e) => {
        e.preventDefault();
        if (!newReply.trim()) return;

        setIsReplying(true);
        setError('');
        try {
            const res = await fetch(`/api/admin/support/tickets/${ticketId}/replies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: newReply }),
            });
            if (!res.ok) throw new Error('Failed to post reply.');
            setNewReply('');
            await fetchTicket(); 
        } catch (err) {
            setError(err.message);
        } finally {
            setIsReplying(false);
        }
    };
    
    const handleUpdateStatus = async (newStatus) => {
        setError('');
        try {
            const res = await fetch(`/api/admin/support/tickets/${ticketId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Failed to update ticket status.');
            await fetchTicket();
        } catch (err) {
            setError(err.message);
        }
    };

    if (isLoading) {
        return <p className="p-6">Loading ticket...</p>;
    }
    
    if (error) {
        return <p className="p-6 text-red-500">{error}</p>;
    }

    return (
        <div>
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <Link href="/admin/support" className="text-sm text-blue-600 hover:underline flex items-center">
                        <ArrowUturnLeftIcon className="h-4 w-4 mr-1"/>
                        Back to all tickets
                    </Link>
                    <h2 className="text-3xl font-bold mt-2">{ticketData?.ticket.subject}</h2>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>From: {ticketData?.ticket.user_email}</span>
                        <span>|</span>
                        <span>Status: {ticketData?.ticket.status}</span>
                    </div>
                </div>
                <div className="mt-4 sm:mt-0">
                    {ticketData?.ticket.status === 'open' ? (
                        <button onClick={() => handleUpdateStatus('closed')} className="inline-flex items-center rounded-md bg-yellow-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500">
                            <LockClosedIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                            Close Ticket
                        </button>
                    ) : (
                        <button onClick={() => handleUpdateStatus('open')} className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500">
                            <CheckCircleIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                            Re-open Ticket
                        </button>
                    )}
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border max-w-4xl space-y-6">
                {ticketData?.replies.map(reply => (
                    <TicketReply 
                        key={reply.id} 
                        reply={reply} 
                        isAdminReply={reply.author_email !== ticketData.ticket.user_email} 
                    />
                ))}
            </div>

            {ticketData?.ticket.status === 'open' && (
                <form onSubmit={handlePostReply} className="mt-8 max-w-4xl">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Post a Reply</h3>
                    <textarea
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        rows={5}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Type your reply here..."
                    />
                    <div className="mt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isReplying || !newReply.trim()}
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {isReplying ? 'Submitting...' : 'Submit Reply'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
