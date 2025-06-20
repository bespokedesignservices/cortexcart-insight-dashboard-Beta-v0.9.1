'use client';

import { useState } from 'react';
import Layout from '@/app/components/Layout';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

export default function ContactPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('idle'); // idle | sending | success | error
    const [statusMessage, setStatusMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        setStatusMessage('');

        // Get form data including the honeypot field
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('/api/contact/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'An unknown error occurred.');

            setStatus('success');
            setStatusMessage('Thank you! Your message has been sent.');
            setName('');
            setEmail('');
            setMessage('');
        } catch (error) {
            setStatus('error');
            setStatusMessage(error.message);
        }
    };


    return (
        <Layout>
            <div className="relative isolate bg-white">
                <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
                    <div className="relative px-6 pb-20 pt-24 sm:pt-32 lg:static lg:px-8 lg:py-48">
                        <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-lg">
                             <div className="absolute inset-y-0 left-0 -z-10 w-full overflow-hidden bg-gray-100 ring-1 ring-gray-900/10 lg:w-1/2">
                                <svg className="absolute inset-0 h-full w-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]" aria-hidden="true">
                                <defs><pattern id="83fd4e5a-9d52-4224-87a4-9045863c5379" width="200" height="200" x="100%" y="-1" patternUnits="userSpaceOnUse"><path d="M130 200V.5M.5 .5H200" fill="none"></path></pattern></defs>
                                <rect width="100%" height="100%" strokeWidth="0" fill="url(#83fd4e5a-9d52-4224-87a4-9045863c5379)"></rect>
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Get in touch</h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                We’re here to help you with any questions you might have about our platform, features, or anything else. Fill out the form, and we’ll get back to you as soon as possible.
                            </p>
                            <div className="mt-10 rounded-md bg-blue-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800">Please note</h3>
                                        <div className="mt-2 text-sm text-blue-700">
                                            <p>Responses may take up to 48 hours. For faster help, please try our <a href="/faq" className="font-bold underline">FAQ page</a> or use the live chat feature for instant support.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="px-6 pb-24 pt-20 sm:pb-32 lg:px-8 lg:py-48">
                        <div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
                            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label htmlFor="name" className="block text-sm font-semibold leading-6 text-gray-900">Full Name</label>
                                    <div className="mt-2.5"><input type="text" name="name" id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"/></div>
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">Email</label>
                                    <div className="mt-2.5"><input type="email" name="email" id="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"/></div>
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-900">Message</label>
                                    <div className="mt-2.5"><textarea name="message" id="message" rows="4" value={message} onChange={(e) => setMessage(e.target.value)} required className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"></textarea></div>
                                </div>
                                {/* Honeypot field for spam prevention - hidden from users */}
                                <div className="hidden" aria-hidden="true">
                                    <label htmlFor="website">Website</label>
                                    <input id="website" name="website" type="text" tabIndex="-1" autoComplete="off" />
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end">
                                <button type="submit" disabled={status === 'sending'} className="rounded-md bg-blue-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-300">
                                    {status === 'sending' ? 'Sending...' : 'Send message'}
                                </button>
                            </div>
                            {statusMessage && (
                                <p className={`mt-4 text-sm ${status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                                    {statusMessage}
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
