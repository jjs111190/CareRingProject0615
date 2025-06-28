import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { apiClient } from '../services/api';
import CreateMoodStory from './CreateMoodStory';
import type { MoodStory, User } from '../types';

interface StoriesProps {
  currentUser?: User;
}

const Stories: React.FC<StoriesProps> = ({ currentUser }) => {
  const [stories, setStories] = useState<MoodStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateMood, setShowCreateMood] = useState(false);

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

  const handleMoodCreated = () => {
    loadStories(); // Reload stories after creating a new mood
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
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-6 overflow-x-auto pb-2">
          {/* Add Story Button */}
          <div className="flex-shrink-0 text-center cursor-pointer group">
            <div className="relative">
              <button
                onClick={() => setShowCreateMood(true)}
                className="w-16 h-16 bg-gradient-to-br from-[#4387E5] to-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg group-hover:scale-105 transition-transform"
              >
                <Plus className="w-6 h-6 text-white" />
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2 max-w-[64px] truncate group-hover:text-gray-800 transition-colors">
              Your Story
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
                  <div className="absolute -bottom-1 -right-1 text-lg bg-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-sm">
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

      {/* Create Mood Story Modal */}
      {showCreateMood && currentUser && (
        <CreateMoodStory
          currentUser={currentUser}
          onClose={() => setShowCreateMood(false)}
          onMoodCreated={handleMoodCreated}
        />
      )}
    </>
  );
};

export default Stories;