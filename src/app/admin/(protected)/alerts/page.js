'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function AlertBannersPage() {
    const [alerts, setAlerts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAlert, setEditingAlert] = useState(null);
    const [formData, setFormData] = useState({ title: '', message: '', type: 'info', is_active: false });

    const fetchAlerts = async () => {
        setIsLoading(true);
        const res = await fetch('/api/admin/alerts');
        if (res.ok) {
            const data = await res.json();
            setAlerts(data);
        }
        setIsLoading(false);
    };

    useEffect(() => { fetchAlerts(); }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleOpenModal = (alert = null) => {
        setEditingAlert(alert);
        setFormData(alert ? { ...alert } : { title: '', message: '', type: 'info', is_active: false });
        setIsModalOpen(true);
    };

    const handleSaveAlert = async (e) => {
        e.preventDefault();
        const url = editingAlert ? `/api/admin/alerts/${editingAlert.id}` : '/api/admin/alerts';
        const method = editingAlert ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (res.ok) {
            setIsModalOpen(false);
            fetchAlerts();
        } else {
            alert('Failed to save alert.');
        }
    };

    const handleDeleteAlert = async (id) => {
        if (confirm('Are you sure you want to delete this alert?')) {
            await fetch(`/api/admin/alerts/${id}`, { method: 'DELETE' });
            fetchAlerts();
        }
    };

    const StatusToggle = ({ alert }) => {
        const toggleStatus = async () => {
            const updatedAlert = { ...alert, is_active: !alert.is_active };
            await fetch(`/api/admin/alerts/${alert.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedAlert),
            });
            fetchAlerts();
        };

        return (
            <button onClick={toggleStatus}>
                {alert.is_active ? 
                    <CheckCircleIcon className="h-6 w-6 text-green-500" /> : 
                    <XCircleIcon className="h-6 w-6 text-gray-400" />
                }
            </button>
        );
    };

    return (
        <div>
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Alert Banners</h1>
                <p className="mt-1 text-sm text-gray-600">Create and manage sitewide alerts for your users.</p>
                <button onClick={() => handleOpenModal()} className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                    <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                    Create New Alert
                </button>
            </div>

            {/* Table of Alerts */}
            <div className="mt-6 flow-root">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="py-3.5 pl-6 text-left text-sm font-semibold text-gray-900">Title</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Active</th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-6"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {isLoading ? (
                                <tr><td colSpan="4" className="py-4 text-center text-gray-500">Loading alerts...</td></tr>
                            ) : alerts.map((alert) => (
                                <tr key={alert.id}>
                                    <td className="py-4 pl-6 text-sm font-medium text-gray-900">{alert.title}</td>
                                    <td className="px-3 py-4 text-sm text-gray-500">{alert.type}</td>
                                    <td className="px-3 py-4 text-sm text-gray-500"><StatusToggle alert={alert} /></td>
                                    <td className="py-4 pl-3 pr-6 text-right text-sm font-medium">
                                        <button onClick={() => handleOpenModal(alert)} className="text-gray-400 hover:text-blue-600 mr-4"><PencilIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDeleteAlert(alert.id)} className="text-gray-400 hover:text-red-600"><TrashIcon className="h-5 w-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <form onSubmit={handleSaveAlert} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">{editingAlert ? 'Edit Alert' : 'Create New Alert'}</h3>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                            <textarea name="message" id="message" value={formData.message} onChange={handleInputChange} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required></textarea>
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Alert Type</label>
                            <select name="type" id="type" value={formData.type} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                                <option value="info">Info (Blue)</option>
                                <option value="success">Success (Green)</option>
                                <option value="warning">Warning (Yellow)</option>
                                <option value="danger">Danger (Red)</option>
                            </select>
                        </div>
                         <div className="relative flex items-start">
                            <div className="flex h-6 items-center">
                                <input id="is_active" name="is_active" type="checkbox" checked={formData.is_active} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                            </div>
                            <div className="ml-3 text-sm leading-6">
                                <label htmlFor="is_active" className="font-medium text-gray-900">Activate this alert?</label>
                                <p className="text-gray-500">If checked, this alert will be visible to all users on their dashboard.</p>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 pt-2">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">Save Alert</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
