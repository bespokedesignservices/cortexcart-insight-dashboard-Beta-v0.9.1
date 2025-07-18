'use client';

import { useState, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PlusIcon, TrashIcon, PencilIcon, Bars3Icon } from '@heroicons/react/24/outline';

// --- Individual Feature Card Component ---
const FeatureCard = ({ feature, onEdit, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: feature.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (
        <div ref={setNodeRef} style={style} {...attributes} className="p-4 bg-white rounded-lg shadow-sm border touch-none">
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-semibold text-gray-800">{feature.name}</p>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                    <button onClick={() => onEdit(feature)} className="text-gray-400 hover:text-blue-600"><PencilIcon className="h-4 w-4" /></button>
                    <button onClick={() => onDelete(feature.id)} className="text-gray-400 hover:text-red-600"><TrashIcon className="h-4 w-4" /></button>
                    <button {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400"><Bars3Icon className="h-5 w-5" /></button>
                </div>
            </div>
        </div>
    );
};

// --- Column Component to hold the cards ---
const RoadmapColumn = ({ id, title, features, onEdit, onDelete }) => {
    return (
        <div className="bg-gray-50 p-4 rounded-lg w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
            <SortableContext id={id} items={features} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                    {features.map(feature => (
                        <FeatureCard key={feature.id} feature={feature} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
};

// --- Main Admin Roadmap Page ---
export default function AdminRoadmapPage() {
    const [features, setFeatures] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFeature, setEditingFeature] = useState(null);
    const [newFeatureName, setNewFeatureName] = useState('');
    const [newFeatureDesc, setNewFeatureDesc] = useState('');
    const [newFeatureStatus, setNewFeatureStatus] = useState('future');

    const fetchFeatures = async () => {
        const res = await fetch('/api/admin/roadmap');
        const data = await res.json();
        setFeatures(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchFeatures();
    }, []);

    const columns = {
        future: features.filter(f => f.status === 'future'),
        in_progress: features.filter(f => f.status === 'in_progress'),
        completed: features.filter(f => f.status === 'completed'),
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
    
        const activeContainer = active.data.current.sortable.containerId;
        const overContainer = over.data.current.sortable.containerId;
    
        let newItems = [...features];
        const activeIndex = newItems.findIndex(item => item.id === active.id);
    
        if (activeContainer === overContainer) {
            const overIndex = newItems.findIndex(item => item.id === over.id);
            newItems = arrayMove(newItems, activeIndex, overIndex);
        } else {
            newItems[activeIndex].status = overContainer;
            const overIndex = newItems.findIndex(item => item.id === over.id);
            newItems = arrayMove(newItems, activeIndex, overIndex);
        }
    
        const updatedFeatures = newItems.map((item, index) => ({ ...item, sort_order: index }));
        setFeatures(updatedFeatures);
    
        const featuresToSave = updatedFeatures.map(({ id, status, sort_order }) => ({ id, status, sort_order }));
        fetch('/api/admin/roadmap/reorder', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(featuresToSave),
        });
    };

    const handleOpenModal = (feature = null) => {
        setEditingFeature(feature);
        setNewFeatureName(feature ? feature.name : '');
        setNewFeatureDesc(feature ? feature.description : '');
        setNewFeatureStatus(feature ? feature.status : 'future');
        setIsModalOpen(true);
    };

    const handleSaveFeature = async () => {
        const url = editingFeature ? `/api/admin/roadmap/${editingFeature.id}` : '/api/admin/roadmap';
        const method = editingFeature ? 'PUT' : 'POST';
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newFeatureName, description: newFeatureDesc, status: newFeatureStatus }),
        });
        setIsModalOpen(false);
        fetchFeatures();
    };

    const handleDeleteFeature = async (id) => {
        if (confirm('Are you sure you want to delete this feature?')) {
            await fetch(`/api/admin/roadmap/${id}`, { method: 'DELETE' });
            fetchFeatures();
        }
    };

    return (
        <div>
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Roadmap Management</h1>
                <button onClick={() => handleOpenModal()} className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                    <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                    Add New Feature
                </button>
            </div>

            {isLoading ? <p>Loading roadmap...</p> : (
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <RoadmapColumn id="future" title="Future Plans" features={columns.future} onEdit={handleOpenModal} onDelete={handleDeleteFeature} />
                        <RoadmapColumn id="in_progress" title="In Progress" features={columns.in_progress} onEdit={handleOpenModal} onDelete={handleDeleteFeature} />
                        <RoadmapColumn id="completed" title="Completed" features={columns.completed} onEdit={handleOpenModal} onDelete={handleDeleteFeature} />
                    </div>
                </DndContext>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">{editingFeature ? 'Edit Feature' : 'Add New Feature'}</h3>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Feature Name</label>
                            <input type="text" id="name" value={newFeatureName} onChange={(e) => setNewFeatureName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="description" value={newFeatureDesc} onChange={(e) => setNewFeatureDesc(e.target.value)} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                            <select id="status" value={newFeatureStatus} onChange={(e) => setNewFeatureStatus(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                                <option value="future">Future Plan</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                            <button onClick={handleSaveFeature} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">Save Feature</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
