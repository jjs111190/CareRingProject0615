import React, { useState } from 'react';
import { Image, MapPin, Hash, ArrowLeft, Upload, Heart, Target, Utensils, Activity } from 'lucide-react';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const wellnessCategories = [
    { id: 'fitness', name: 'Fitness', icon: Activity, color: '[#4387E5]', hashtag: '#fitness' },
    { id: 'nutrition', name: 'Nutrition', icon: Utensils, color: 'orange', hashtag: '#nutrition' },
    { id: 'mental', name: 'Mental Health', icon: Heart, color: 'purple', hashtag: '#mentalhealth' },
    { id: 'goals', name: 'Goals', icon: Target, color: 'blue', hashtag: '#goals' },
  ];

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

  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category.id);
    const currentHashtags = hashtags.split(',').map(tag => tag.trim()).filter(tag => tag);
    if (!currentHashtags.includes(category.hashtag.replace('#', ''))) {
      const newHashtags = [...currentHashtags, category.hashtag.replace('#', '')];
      setHashtags(newHashtags.join(', '));
    }
  };

  const handlePost = async () => {
    if (!phrase.trim()) {
      setError('Please share your wellness journey');
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
          <h2 className="text-lg font-semibold bg-gradient-to-r from-[#4387E5] to-blue-600 bg-clip-text text-transparent">
            Share Your Wellness Journey
          </h2>
          <button
            onClick={handlePost}
            disabled={!phrase.trim() || isPosting}
            className="px-6 py-2 bg-gradient-to-r from-[#4387E5] to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isPosting ? 'Sharing...' : 'Share'}
          </button>
        </div>

        <div className="p-6">
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#4387E5] to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {currentUser.nickname.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{currentUser.nickname}</h3>
              <p className="text-sm text-gray-500">Sharing wellness inspiration</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Wellness Categories */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Wellness Category (optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {wellnessCategories.map((category) => {
                const IconComponent = category.icon;
                const isSelected = selectedCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? category.id === 'fitness' 
                          ? 'border-[#4387E5] bg-blue-50'
                          : `border-${category.color}-500 bg-${category.color}-50`
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 ${
                      isSelected 
                        ? category.id === 'fitness'
                          ? 'text-[#4387E5]'
                          : `text-${category.color}-600`
                        : 'text-gray-500'
                    }`} />
                    <span className={`font-medium ${
                      isSelected 
                        ? category.id === 'fitness'
                          ? 'text-[#4387E5]'
                          : `text-${category.color}-700`
                        : 'text-gray-700'
                    }`}>
                      {category.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Image className="w-4 h-4 inline mr-1" />
              Photo (optional)
            </label>
            
            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-[#4387E5]" />
                  <p className="mb-2 text-sm text-blue-700">
                    <span className="font-semibold">Click to upload</span> your wellness photo
                  </p>
                  <p className="text-xs text-blue-600">PNG, JPG or GIF (MAX. 10MB)</p>
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
              Share your wellness story
            </label>
            <textarea
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="What's your wellness win today? Share your journey, tips, or inspiration..."
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
              Wellness Tags (optional)
            </label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="wellness, fitness, mindfulness, nutrition (comma separated)"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4387E5] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Help others discover your wellness content with relevant tags
            </p>
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
              placeholder="Where did this wellness moment happen?"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4387E5] focus:border-transparent"
            />
          </div>

          {/* Wellness Tip */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Heart className="w-5 h-5 text-[#4387E5] mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-700 mb-1">Wellness Tip</h4>
                <p className="text-sm text-blue-600">
                  Share authentic moments from your wellness journey. Your story might inspire someone else to start theirs!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;