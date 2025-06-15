'use client';

import React, { useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const feedbackSubjects = {
    'bug': 'Please describe the bug in as much detail as possible. Include the steps you took to make it happen.',
    'feature': 'Please describe the new feature you\'d like to see and why it would be helpful for your workflow.',
};

export default function FeedbackButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [subject, setSubject] = useState('bug');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('idle'); // idle | sending | success | error
    const [statusMessage, setStatusMessage] = useState('');

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
            setTimeout(() => {
                setIsOpen(false);
                setStatus('idle');
            }, 2000); // Close modal after 2 seconds on success

        } catch (error) {
            setStatus('error');
            setStatusMessage(error.message);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-50"
                aria-label="Open feedback form"
            >
                <ChatBubbleLeftRightIcon className="h-6 w-6" />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center" aria-modal="true">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsOpen(false)}></div>

            <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl transform transition-all sm:my-8">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Submit Feedback</h3>
                        <p className="mt-1 text-sm text-gray-500">We appreciate your help in making our app better!</p>
                    </div>

                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                        <select
                            id="subject"
                            name="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option value="bug">Bug Report</option>
                            <option value="feature">Feature Request</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                        <div className="mt-1">
                            <p className="text-xs text-gray-500 mb-2">{feedbackSubjects[subject]}</p>
                            <textarea
                                id="message"
                                name="message"
                                rows={5}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="block w-full border border-gray-300 rounded-md shadow-sm sm:text-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            ></textarea>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                        >
                            {status === 'sending' ? 'Sending...' : 'Submit Feedback'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                            Cancel
                        </button>
                    </div>
                    
                    {statusMessage && (
                        <p className={`text-sm ${status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                            {statusMessage}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
