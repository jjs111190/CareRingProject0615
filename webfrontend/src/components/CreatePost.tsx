import React, { useState } from 'react';
import { Image, MapPin, Hash, ArrowLeft, Upload } from 'lucide-react';
import { apiClient } from '../services/api';
import type { User } from '../types';

interface CreatePostProps {
  currentUser: User;
  onPostCreated: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onPostCreated }) => {
  const [phrase, setPhrase] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [location, setLocation] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async () => {
    if (!phrase.trim()) {
      setError('Please write something to share');
      return;
    }
    
    setIsPosting(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('phrase', phrase);
      formData.append('hashtags', hashtags);
      formData.append('location', location);
      formData.append('disclosure', 'public');
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      await apiClient.createPost(formData);
      onPostCreated();
    } catch (error: any) {
      setError(error.message || 'Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 mb-20 md:mb-0">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <button
            onClick={onPostCreated}
            className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Create new post</h2>
          <button
            onClick={handlePost}
            disabled={!phrase.trim() || isPosting}
            className="px-6 py-2 bg-[#4387E5] text-white rounded-xl font-medium hover:bg-[#3a75d1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPosting ? 'Posting...' : 'Share'}
          </button>
        </div>

        <div className="p-6">
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-[#4387E5] rounded-full flex items-center justify-center text-white font-semibold">
              {currentUser.nickname.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{currentUser.nickname}</h3>
              <p className="text-sm text-gray-500">{currentUser.email}</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Image className="w-4 h-4 inline mr-1" />
              Photo (optional)
            </label>
            
            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-80 object-cover rounded-xl"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-3 right-3 px-4 py-2 bg-black/50 text-white rounded-lg text-sm hover:bg-black/70 transition-all"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's on your mind?
            </label>
            <textarea
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4387E5] focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex justify-end mt-2">
              <span className="text-sm text-gray-500">
                {phrase.length}/2200
              </span>
            </div>
          </div>

          {/* Hashtags */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="w-4 h-4 inline mr-1" />
              Hashtags (optional)
            </label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="travel, food, lifestyle (comma separated)"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4387E5] focus:border-transparent"
            />
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location (optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where was this taken?"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4387E5] focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;