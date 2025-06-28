import React, { useState } from 'react';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, User } from 'lucide-react';
import type { Post } from '../types';

interface PostCardProps {
  post: Post;
  onLike: (postId: number) => void;
  onComment: (postId: number, comment: string) => void;
  onUserClick?: (userId: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment, onUserClick }) => {
  const [newComment, setNewComment] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onComment(post.id, newComment.trim());
      setNewComment('');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => onUserClick?.(post.user_id)}
              className="w-12 h-12 bg-gradient-to-br from-[#4387E5] to-blue-600 rounded-full flex items-center justify-center text-white font-semibold hover:scale-105 transition-transform"
            >
              {post.user_name.charAt(0).toUpperCase()}
            </button>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <button
              onClick={() => onUserClick?.(post.user_id)}
              className="font-semibold text-gray-900 text-sm hover:text-[#4387E5] transition-colors"
            >
              {post.user_name}
            </button>
            <p className="text-gray-500 text-xs">{formatDate(post.created_at)}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="relative mx-6 mb-6">
          <img
            src={`http://localhost:51235${post.image_url}`}
            alt="Post content"
            className="w-full h-80 object-cover rounded-xl"
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onLike(post.id)}
              className={`p-2 rounded-xl transition-all hover:bg-gray-50 ${
                post.liked ? 'text-red-500' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Heart 
                className={`w-6 h-6 ${post.liked ? 'fill-current' : ''}`} 
              />
            </button>
            <button className="p-2 rounded-xl transition-all hover:bg-gray-50 text-gray-600 hover:text-gray-900">
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="p-2 rounded-xl transition-all hover:bg-gray-50 text-gray-600 hover:text-gray-900">
              <Share className="w-6 h-6" />
            </button>
          </div>
          <button className="p-2 rounded-xl transition-all hover:bg-gray-50 text-gray-600 hover:text-gray-900">
            <Bookmark className="w-6 h-6" />
          </button>
        </div>

        {/* Likes */}
        <div className="mb-3">
          <p className="font-semibold text-sm text-gray-900">
            {post.likes.toLocaleString()} likes
          </p>
        </div>

        {/* Caption */}
        <div className="mb-4">
          <p className="text-sm text-gray-900 leading-relaxed">
            <button
              onClick={() => onUserClick?.(post.user_id)}
              className="font-semibold mr-2 hover:text-[#4387E5] transition-colors"
            >
              {post.user_name}
            </button>
            {post.phrase}
          </p>
          {post.hashtags && (
            <p className="text-sm text-[#4387E5] mt-1">
              {post.hashtags.split(',').map(tag => `#${tag.trim()}`).join(' ')}
            </p>
          )}
          {post.location && (
            <p className="text-sm text-gray-500 mt-1">📍 {post.location}</p>
          )}
        </div>

        {/* Comments */}
        {post.comments.length > 0 && (
          <div className="mb-4">
            {!showAllComments && post.comments.length > 1 && (
              <button
                onClick={() => setShowAllComments(true)}
                className="text-sm text-gray-500 hover:text-gray-700 mb-3 transition-colors"
              >
                View all {post.comments.length} comments
              </button>
            )}
            
            <div className="space-y-2">
              {(showAllComments ? post.comments : post.comments.slice(-1)).map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <p className="text-sm text-gray-900 flex-1 leading-relaxed">
                    <button
                      onClick={() => onUserClick?.(comment.user_id)}
                      className="font-semibold mr-2 hover:text-[#4387E5] transition-colors"
                    >
                      {comment.user_name}
                    </button>
                    {comment.content}
                  </p>
                  <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <Heart className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Comment */}
        <form onSubmit={handleCommentSubmit} className="border-t border-gray-100 pt-4">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Add a wellness comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 text-sm placeholder-gray-500 bg-transparent text-gray-900 focus:outline-none"
            />
            {newComment.trim() && (
              <button
                type="submit"
                className="text-[#4387E5] hover:text-blue-600 font-semibold text-sm transition-colors"
              >
                Post
              </button>
            )}
          </div>
        </form>
      </div>
    </article>
  );
};

export default PostCard;