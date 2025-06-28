import React, { useState, useEffect } from 'react';
import PostCard from './PostCard';
import Stories from './Stories';
import { Plus } from 'lucide-react';
import { apiClient } from '../services/api';
import type { User, BasicInfo, Post } from '../types';

interface FeedProps {
  currentUser: User;
  basicInfo: BasicInfo | null;
  onUserClick?: (userId: number) => void;
}

const Feed: React.FC<FeedProps> = ({ currentUser, basicInfo, onUserClick }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const postsData = await apiClient.getPosts();
      setPosts(postsData.map(post => ({ ...post, liked: false })));
    } catch (error: any) {
      setError(error.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      await apiClient.likePost(postId);
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                liked: !post.liked, 
                likes: post.liked ? post.likes - 1 : post.likes + 1 
              }
            : post
        )
      );
    } catch (error: any) {
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = async (postId: number, commentText: string) => {
    try {
      const newComment = await apiClient.addComment(postId, commentText);
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, comments: [...post.comments, newComment] }
            : post
        )
      );
    } catch (error: any) {
      console.error('Failed to add comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="w-full h-80 bg-gray-200 rounded-xl mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadPosts}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 mb-20 md:mb-0">
      <Stories currentUser={currentUser} />
      
      {/* Create Post Button */}
      <div className="mt-6 mb-8">
        <button
          onClick={() => setShowCreatePost(!showCreatePost)}
          className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#4387E5] to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {currentUser.nickname.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-left">
              <p className="text-gray-500 group-hover:text-gray-700 transition-colors">
                Share your wellness journey...
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-[#4387E5] to-blue-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5 text-white" />
            </div>
          </div>
        </button>
      </div>

      {/* Create Post Form */}
      {showCreatePost && (
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Post</h3>
              <button
                onClick={() => setShowCreatePost(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
            <textarea
              placeholder="What's your wellness win today?"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4387E5] focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-2">
                <button className="p-2 text-gray-400 hover:text-[#4387E5] transition-colors">
                  📷
                </button>
                <button className="p-2 text-gray-400 hover:text-[#4387E5] transition-colors">
                  📍
                </button>
                <button className="p-2 text-gray-400 hover:text-[#4387E5] transition-colors">
                  #
                </button>
              </div>
              <button className="px-6 py-2 bg-gradient-to-r from-[#4387E5] to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all">
                Share
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onComment={handleComment}
            onUserClick={onUserClick}
          />
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-emerald-600 text-3xl">🌱</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Start Your Wellness Journey</h3>
          <p className="text-gray-500">Share your first wellness post and inspire others!</p>
        </div>
      )}
    </div>
  );
};

export default Feed;