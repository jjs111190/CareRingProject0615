import React, { useState } from 'react';
import { ArrowLeft, Camera, Smile, Send, X } from 'lucide-react';
import { apiClient } from '../services/api';
import type { User } from '../types';

interface CreateMoodStoryProps {
  currentUser: User;
  onClose: () => void;
  onMoodCreated: () => void;
}

const CreateMoodStory: React.FC<CreateMoodStoryProps> = ({ currentUser, onClose, onMoodCreated }) => {
  const [selectedEmoji, setSelectedEmoji] = useState('😊');
  const [memo, setMemo] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState('');

  const moodEmojis = [
    '😊', '😍', '🥰', '😎', '🤗', '😴', '🤔', '😋',
    '🎉', '💪', '🧘‍♀️', '🌟', '❤️', '🔥', '✨', '🌈',
    '☀️', '🌙', '⭐', '💫', '🎯', '🏆', '🎨', '🎵'
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

  const handleSubmit = async () => {
    if (!selectedEmoji || !memo.trim()) {
      setError('Please select an emoji and add a memo');
      return;
    }

    setIsPosting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('emoji', selectedEmoji);
      formData.append('memo', memo);
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      await apiClient.createMood(formData);
      onMoodCreated();
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to create mood story');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold bg-gradient-to-r from-[#4387E5] to-blue-600 bg-clip-text text-transparent">
            Share Your Mood
          </h2>
          <button
            onClick={handleSubmit}
            disabled={!selectedEmoji || !memo.trim() || isPosting}
            className="px-4 py-2 bg-gradient-to-r from-[#4387E5] to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
              <p className="text-sm text-gray-500">Sharing a mood moment</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Emoji Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Smile className="w-4 h-4 inline mr-1" />
              How are you feeling?
            </label>
            <div className="grid grid-cols-8 gap-2">
              {moodEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-10 h-10 rounded-xl text-xl hover:bg-blue-50 transition-all ${
                    selectedEmoji === emoji 
                      ? 'bg-[#4387E5] text-white scale-110' 
                      : 'bg-gray-50 hover:scale-105'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Camera className="w-4 h-4 inline mr-1" />
              Photo (optional)
            </label>
            
            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-8 h-8 mb-2 text-[#4387E5]" />
                  <p className="text-sm text-blue-700 font-medium">Add a photo</p>
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
                  className="w-full h-32 object-cover rounded-xl"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Memo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's on your mind?
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Share what you're feeling right now..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4387E5] focus:border-transparent resize-none"
              rows={3}
              maxLength={150}
            />
            <div className="flex justify-end mt-2">
              <span className="text-sm text-gray-500">
                {memo.length}/150
              </span>
            </div>
          </div>

          {/* Preview */}
          {selectedEmoji && memo && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-medium text-blue-700 mb-2">Preview</h4>
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{selectedEmoji}</div>
                <div>
                  <p className="text-blue-600 text-sm">{memo}</p>
                  <p className="text-blue-500 text-xs">Expires in 12 hours</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateMoodStory;