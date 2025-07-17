'use client';

import { useState, useEffect } from 'react';
import { XCircleIcon, TrashIcon, ArrowUpTrayIcon} from '@heroicons/react/24/solid';

// Updated to include the onDelete function
function DisplayImage({ image, onDelete, onSelect }) {
    const [imageError, setImageError] = useState(false);

    const handleError = () => {
        setImageError(true);
    };

    const handleDeleteClick = (e, imageId) => {
        e.stopPropagation();
        onDelete(imageId);
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
                                // FIX: Added eslint-disable comment for the next line
                // eslint-disable-next-line @next/next/no-img-element

                    <img
                        src={image.image_url}
                        alt={image.filename || 'User image'}
                        className="w-full h-full object-cover"
                        onError={handleError}
                    />
                    <button
                        onClick={(e) => handleDeleteClick(e, image.id)}
                        // Added z-10 to make sure the button is on top
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

    const handleFileUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('/api/images/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'File upload failed.');
            }

            const newImage = await response.json();
            setImages(prevImages => [newImage, ...prevImages]);
            setSelectedFile(null); // Clear the file input
        } catch (err) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };
    
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
        setError('');
        try {
            const response = await fetch('/api/images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl }),
            });
            if (!response.ok) throw new Error('Failed to add image.');
            const newImage = await response.json();
            setImages(prevImages => [newImage, ...prevImages]);
            onImageAdd(newImage);
            setImageUrl('');
        } catch (err) {
            setError(err.message);
        }
    };
    
    // This new function handles the deletion logic
    const handleDeleteImage = async (imageId) => {
        if (!confirm('Are you sure you want to permanently delete this image?')) {
            return;
        }
        setError('');
        try {
            const response = await fetch(`/api/images/${imageId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'Failed to delete image.');
            }
            // Remove the image from the local state to update the UI instantly
            setImages(currentImages => currentImages.filter(image => image.id !== imageId));
        } catch (err) {
            setError(err.message);
        }
    };


    return (
        <div className="p-4 border rounded-lg mt-8 bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-3">Image Manager</h3>
            <p className="text-gray-400">Add an image to your post below..</p>
            <hr className="mb-3 mt-3"></hr>
            <div className="space-y-4 mb-4 mt-3">
                <form onSubmit={handleAddImage} className="flex items-center gap-2">
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Add image by URL"
                        className="flex-grow w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 whitespace-nowrap">
                        Add Image
                    </button>
                </form>

                <div className="flex items-center gap-2">
                    <label htmlFor="file-upload" className="flex-grow w-full cursor-pointer">
                        <span className="block w-full text-sm text-gray-500 border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-white">
                           {selectedFile ? selectedFile.name : 'Choose File'}
                        </span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setSelectedFile(e.target.files[0])} />
                    </label>
                    <button 
                        onClick={handleFileUpload}
                        disabled={!selectedFile || isUploading}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center whitespace-nowrap"
                    >
                        <ArrowUpTrayIcon className="h-5 w-5 mr-2"/>
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </button>
                                   </div>
            </div>
<hr className="mb-3"></hr>
<div className="text-center text-xs text-gray-400 mt-2">
                            Only JPEG and JPG images are supported for upload.
                        </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {isLoading ? (
                <p>Loading images...</p>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-h-96 overflow-y-auto mt-4">
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