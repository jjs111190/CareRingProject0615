import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { apiClient } from '../services/api';
import type { MoodStory } from '../types';

const Stories: React.FC = () => {
  const [stories, setStories] = useState<MoodStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const storiesData = await apiClient.getMoodStories();
      setStories(storiesData);
    } catch (error) {
      console.error('Failed to load stories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-6 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-shrink-0 text-center animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex space-x-6 overflow-x-auto pb-2">
        {/* Add Story Button */}
        <div className="flex-shrink-0 text-center cursor-pointer group">
          <div className="relative">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200 group-hover:border-gray-300 transition-colors">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2 max-w-[64px] truncate group-hover:text-gray-800 transition-colors">
            Add Story
          </p>
        </div>

        {/* Stories */}
        {stories.map((story) => (
          <div key={story.id} className="flex-shrink-0 text-center cursor-pointer group">
            <div className="relative">
              <div className={`w-16 h-16 rounded-full p-0.5 ${
                story.recentMood 
                  ? 'bg-gradient-to-r from-[#4387E5] to-[#6ba3f5]' 
                  : 'bg-gray-200'
              }`}>
                {story.image_url ? (
                  <img
                    src={`http://localhost:51235${story.image_url}`}
                    alt={story.nickname}
                    className="w-full h-full rounded-full border-2 border-white object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full border-2 border-white bg-[#4387E5] flex items-center justify-center text-white font-semibold">
                    {story.nickname.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {story.recentMood && (
                <div className="absolute -bottom-1 -right-1 text-lg">
                  {story.recentMood.emoji}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-2 max-w-[64px] truncate group-hover:text-gray-800 transition-colors">
              {story.nickname}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stories;