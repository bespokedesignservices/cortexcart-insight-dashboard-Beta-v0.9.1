'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// This is the modal component for adding or editing an FAQ
const FaqModal = ({ isOpen, onClose, onSave, faq }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [category, setCategory] = useState('General');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (faq) {
            setQuestion(faq.question);
            setAnswer(faq.answer);
            setCategory(faq.category);
        } else {
            setQuestion('');
            setAnswer('');
            setCategory('General');
        }
    }, [faq]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave({ id: faq?.id, question, answer, category });
        } catch (error) {
            alert(`Failed to save: ${error.message}`);
        } finally {
            setIsSaving(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg space-y-4">
                <h3 className="text-lg font-medium text-gray-900">{faq ? 'Edit FAQ' : 'Create New FAQ'}</h3>
                <div>
                    <label htmlFor="question" className="block text-sm font-medium text-gray-700">Question</label>
                    <input type="text" id="question" value={question} onChange={(e) => setQuestion(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                </div>
                <div>
                    <label htmlFor="answer" className="block text-sm font-medium text-gray-700">Answer</label>
                    <textarea id="answer" value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required></textarea>
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                    <button type="button" onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                        {isSaving ? 'Saving...' : 'Save FAQ'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// This is the main page component
export default function FaqManagementPage() {
    const [faqs, setFaqs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);

    const fetchFaqs = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/faqs');
            if (!res.ok) throw new Error('Failed to fetch FAQs.');
            setFaqs(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, []);

    const handleOpenModal = (faq = null) => {
        setEditingFaq(faq);
        setIsModalOpen(true);
    };

    const handleSaveFaq = async (faqData) => {
        const url = faqData.id ? `/api/admin/faqs/${faqData.id}` : '/api/admin/faqs';
        const method = faqData.id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(faqData),
        });

        if (!res.ok) {
            const errorResult = await res.json();
            throw new Error(errorResult.message || 'Failed to save FAQ.');
        }

        await fetchFaqs(); // Refresh the list
    };

    const handleDeleteFaq = async (id) => {
        if (confirm('Are you sure you want to delete this FAQ?')) {
            await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
            await fetchFaqs(); // Refresh the list
        }
    };

    return (
        <div>
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">FAQ Management</h1>
                    <p className="mt-1 text-sm text-gray-600">Add, edit, and manage the questions on your public FAQ page.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                    <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                    Add New FAQ
                </button>
            </div>

            <FaqModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveFaq}
                faq={editingFaq}
            />

            <div className="mt-6 flow-root">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="py-3.5 pl-6 text-left text-sm font-semibold text-gray-900">Question</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-6"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {isLoading ? (
                                <tr><td colSpan="3" className="text-center py-4">Loading...</td></tr>
                            ) : faqs.map((faq) => (
                                <tr key={faq.id}>
                                    <td className="py-4 pl-6 text-sm font-medium text-gray-900">{faq.question}</td>
                                    <td className="px-3 py-4 text-sm text-gray-500">{faq.category}</td>
                                    <td className="py-4 pl-3 pr-6 text-right text-sm font-medium">
                                        <button onClick={() => handleOpenModal(faq)} className="text-gray-400 hover:text-blue-600 mr-4"><PencilIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDeleteFaq(faq.id)} className="text-gray-400 hover:text-red-600"><TrashIcon className="h-5 w-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
