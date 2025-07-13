'use client';

import { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';


// A new component for a single draggable image
function DraggableImage({ image }) {
    const { attributes, listeners, setNodeRef, transform,  isDragging } = useDraggable({
        id: image.id,
        data: { image }, // Pass the entire image object in a data property
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div 
            ref={setNodeRef}
            style={style} 
            {...listeners} 
            {...attributes}
            className={`relative aspect-square bg-gray-white rounded-md touch-none ${isDragging ? 'opacity-50' : ''}`}
        >
            <img
                src={image.image_url}
                alt={image.filename || 'User image'}
                className="w-full h-full object-cover rounded-md"
            />
        </div> 
    );
}

export default function ImageManager() {
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await fetch('/api/images');
                if (!response.ok) throw new Error('Failed to fetch images.');
                const data = await response.json();
                setImages(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchImages();
    }, []);

    const handleAddImage = async (e) => {
        e.preventDefault();
        if (!imageUrl) return;
        try {
            const response = await fetch('/api/images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl }),
            });
            if (!response.ok) throw new Error('Failed to add image.');
            const newImage = await response.json();
            setImages(prevImages => [newImage, ...prevImages]); 
            setImageUrl(''); 
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="p-4 border rounded-lg mt-8">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Image Manager</h3>
            <form onSubmit={handleAddImage} className="flex items-center gap-2 mb-4">
                <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Add image by URL"
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    required
                />
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
                    Add Image
                </button>
            </form>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {isLoading ? (
                <p>Loading images...</p>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                    {images.map(image => (
                        <DraggableImage key={image.id} image={image} />
                    ))}
                </div>
            )}
        </div>
    );
}