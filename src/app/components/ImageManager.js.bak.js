// File: src/app/components/ImageManager.js

'use client';

import { useState, useEffect } from 'react';
import { XCircleIcon, TrashIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';

// Simplified from DraggableImage to DisplayImage
function DisplayImage({ image, onDelete, onSelect }) {
    const [imageError, setImageError] = useState(false);
    const handleError = () => setImageError(true);
    const handleDeleteClick = (e) => {
        e.stopPropagation(); 
        onDelete(image.id);
    };

    return (
        <div 
            onClick={() => onSelect(image)}
            className="relative group aspect-square bg-gray-200 rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="Select this image"
        >
            {imageError ? (
                <div className="flex items-center justify-center h-full w-full bg-red-100 text-red-600">
                    <XCircleIcon className="h-8 w-8" />
                </div>
            ) : (
                <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={image.image_url}
                        alt={image.filename || 'User image'}
                        className="w-full h-full object-cover"
                        onError={handleError}
                    />
                    <button
                        onClick={handleDeleteClick}
                        className="absolute bottom-1 right-1 bg-gray-900/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        aria-label="Delete image"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </>
            )}
        </div>
    );
}

export default function ImageManager({ onImageAdd }) {
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const fetchImages = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/images');
            if (!response.ok) throw new Error('Failed to fetch images.');
            setImages(await response.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const handleAddImage = async (e) => {
        e.preventDefault();
        if (!imageUrl) return;
        // ... (rest of the function is the same)
    };
    
    const handleDeleteImage = async (imageId) => {
        // ... (rest of the function is the same)
    };

    const handleFileUpload = async () => {
        // ... (rest of the function is the same)
    };

    return (
        <div className="p-6 bg-white border rounded-lg mt-8">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Image Manager</h3>
            <div className="space-y-4 mb-4">
                <form onSubmit={handleAddImage} className="flex items-center gap-2">
                    {/* ... URL input form ... */}
                </form>
                <div className="flex items-center gap-2">
                    {/* ... File upload form ... */}
                </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {isLoading ? <p>Loading images...</p> : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 max-h-96 overflow-y-auto pt-4 border-t">
                    {images.map(image => (
                        <DisplayImage 
                            key={image.id} 
                            image={image} 
                            onDelete={handleDeleteImage} 
                            onSelect={onImageAdd} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
}