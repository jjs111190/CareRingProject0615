import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, MessageCircle, MoreHorizontal, Grid3X3, Heart, Activity, Calendar, MapPin, Shield } from 'lucide-react';
import { apiClient } from '../services/api';
import type { User, BasicInfo, Lifestyle, Post, FollowData } from '../types';

interface UserProfileProps {
  userId: number;
  onBack: () => void;
  currentUserId: number;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, onBack, currentUserId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);
  const [lifestyle, setLifestyle] = useState<Lifestyle | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followData, setFollowData] = useState<FollowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const [userData, basicData, lifestyleData, postsData, followInfo] = await Promise.all([
        apiClient.getUserById(userId),
        apiClient.getBasicInfoByUserId(userId).catch(() => null),
        apiClient.getLifestyleByUserId(userId).catch(() => null),
        apiClient.getPostsByUserId(userId).catch(() => []),
        apiClient.getFollowData(userId).catch(() => null)
      ]);

      setUser(userData);
      setBasicInfo(basicData);
      setLifestyle(lifestyleData);
      setPosts(postsData);
      setFollowData(followInfo);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!followData || followLoading) return;
    
    try {
      setFollowLoading(true);
      await apiClient.toggleFollow(userId);
      
      // Update follow data
      setFollowData(prev => prev ? {
        ...prev,
        is_following: !prev.is_following,
        follower_count: prev.is_following ? prev.follower_count - 1 : prev.follower_count + 1
      } : null);
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getHealthScore = () => {
    if (!lifestyle) return 0;
    // Simple health score calculation based on lifestyle data
    let score = 50; // Base score
    if (lifestyle.health_goals) score += 15;
    if (lifestyle.diet_tracking) score += 15;
    if (lifestyle.sleep_habits) score += 10;
    if (lifestyle.smoking_alcohol && lifestyle.smoking_alcohol.toLowerCase().includes('no')) score += 10;
    return Math.min(score, 100);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 mb-20 md:mb-0">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center space-x-6">
              <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 mb-20 md:mb-0">
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
          <button onClick={onBack} className="text-[#4387E5] hover:text-blue-600">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const avatarUrl = basicInfo?.image_url 
    ? `http://localhost:51235${basicInfo.image_url}`
    : null;

  const healthScore = getHealthScore();
  const isOwnProfile = userId === currentUserId;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 mb-20 md:mb-0">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">
          {basicInfo?.name || user.nickname}'s Profile
        </h1>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          {/* Profile Picture */}
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={basicInfo?.name || user.nickname}
                className="w-32 h-32 rounded-full border-4 border-blue-100 object-cover"
              />
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-[#4387E5] to-blue-600 rounded-full border-4 border-blue-100 flex items-center justify-center text-white text-4xl font-bold">
                {(basicInfo?.name || user.nickname).charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Health Score Badge */}
            {lifestyle && (
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg border-2 border-blue-200">
                <div className="w-12 h-12 bg-gradient-to-br from-[#4387E5] to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{healthScore}</span>
                </div>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {basicInfo?.name || user.nickname}
                </h1>
                <p className="text-gray-500">@{user.nickname}</p>
              </div>
              
              {!isOwnProfile && (
                <div className="flex space-x-3 mt-4 md:mt-0">
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`px-6 py-2.5 font-medium rounded-xl transition-all flex items-center space-x-2 ${
                      followData?.is_following
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        : 'bg-gradient-to-r from-[#4387E5] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{followLoading ? 'Loading...' : (followData?.is_following ? 'Following' : 'Follow')}</span>
                  </button>
                  <button className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-xl transition-colors flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                  <button className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex justify-center md:justify-start space-x-8 mb-6">
              <div className="text-center">
                <div className="font-bold text-xl text-gray-900">{posts.length}</div>
                <div className="text-gray-500 text-sm">posts</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl text-gray-900">{followData?.follower_count || 0}</div>
                <div className="text-gray-500 text-sm">followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl text-gray-900">{followData?.following_count || 0}</div>
                <div className="text-gray-500 text-sm">following</div>
              </div>
              {lifestyle && (
                <div className="text-center">
                  <div className="font-bold text-xl text-[#4387E5]">{healthScore}</div>
                  <div className="text-gray-500 text-sm">wellness</div>
                </div>
              )}
            </div>

            {/* Bio & Info */}
            <div className="text-gray-900">
              {/* Basic Info */}
              {basicInfo && (
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  {basicInfo.gender && (
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4" />
                      <span>{basicInfo.gender}</span>
                    </div>
                  )}
                  {basicInfo.birth_date && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{calculateAge(basicInfo.birth_date)} years old</span>
                    </div>
                  )}
                  {(basicInfo.height > 0 || basicInfo.weight > 0) && (
                    <div className="flex items-center space-x-1">
                      <Activity className="w-4 h-4" />
                      <span>
                        {basicInfo.height > 0 && `${basicInfo.height}cm`}
                        {basicInfo.height > 0 && basicInfo.weight > 0 && ' • '}
                        {basicInfo.weight > 0 && `${basicInfo.weight}kg`}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* About */}
              {user.about && (
                <p className="text-gray-600 mb-4">{user.about}</p>
              )}

              {/* Wellness Goals */}
              {lifestyle?.health_goals && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-medium text-blue-700 mb-2 flex items-center space-x-2">
                    <Heart className="w-4 h-4" />
                    <span>Wellness Goals</span>
                  </h4>
                  <p className="text-blue-600 text-sm">{lifestyle.health_goals}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button className="flex-1 flex items-center justify-center space-x-2 py-4 text-sm font-medium text-[#4387E5] border-b-2 border-[#4387E5]">
            <Grid3X3 className="w-4 h-4" />
            <span className="hidden sm:inline">Posts</span>
          </button>
        </div>

        <div className="p-6">
          {posts.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {posts.map((post) => (
                <div key={post.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer relative">
                  {post.image_url ? (
                    <img
                      src={`http://localhost:51235${post.image_url}`}
                      alt={post.phrase}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                      <p className="text-[#4387E5] text-sm text-center p-4 line-clamp-3 font-medium">
                        {post.phrase}
                      </p>
                    </div>
                  )}
                  
                  {/* Overlay with stats */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                    <div className="flex items-center space-x-1 text-white">
                      <Heart className="w-4 h-4" fill="currentColor" />
                      <span className="text-sm font-medium">{post.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-white">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">{post.comments.length}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid3X3 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500">
                {isOwnProfile ? 'Share your wellness journey!' : 'No posts to show'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;