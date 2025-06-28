import React, { useState, useEffect } from 'react';
import { Grid3X3, Bookmark, Tag, Settings, Edit3, MapPin, Calendar, User as UserIcon } from 'lucide-react';
import { apiClient } from '../services/api';
import type { User, BasicInfo, Lifestyle, Post } from '../types';

interface ProfileProps {
  user: User;
  basicInfo: BasicInfo | null;
  isOwnProfile: boolean;
}

const Profile: React.FC<ProfileProps> = ({ user, basicInfo, isOwnProfile }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'tagged'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [lifestyle, setLifestyle] = useState<Lifestyle | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingAbout, setEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState(user.about || '');

  const tabs = [
    { id: 'posts', icon: Grid3X3, label: 'Posts' },
    { id: 'saved', icon: Bookmark, label: 'Saved' },
    { id: 'tagged', icon: Tag, label: 'Tagged' },
  ];

  useEffect(() => {
    loadUserData();
  }, [user.id]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [userPosts, userLifestyle] = await Promise.all([
        isOwnProfile ? apiClient.getMyPosts() : apiClient.getPostsByUserId(user.id),
        isOwnProfile ? 
          apiClient.getMyLifestyle().catch(() => null) : 
          apiClient.getLifestyleByUserId(user.id).catch(() => null)
      ]);
      
      setPosts(userPosts || []);
      setLifestyle(userLifestyle);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAbout = async () => {
    if (!isOwnProfile) return;
    
    try {
      await apiClient.updateUserAbout(aboutText);
      setEditingAbout(false);
      // Update the user object would need to be handled by parent component
    } catch (error) {
      console.error('Failed to update about:', error);
    }
  };

  const avatarUrl = basicInfo?.image_url 
    ? `http://localhost:8000${basicInfo.image_url}`
    : null;

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 mb-20 md:mb-0">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          {/* Profile Picture */}
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={basicInfo?.name || user.nickname}
                className="w-32 h-32 rounded-full border-4 border-gray-100 object-cover"
              />
            ) : (
              <div className="w-32 h-32 bg-[#4387E5] rounded-full border-4 border-gray-100 flex items-center justify-center text-white text-4xl font-bold">
                {(basicInfo?.name || user.nickname).charAt(0).toUpperCase()}
              </div>
            )}
            {isOwnProfile && (
              <button className="absolute bottom-2 right-2 w-10 h-10 bg-[#4387E5] rounded-full flex items-center justify-center hover:bg-[#3a75d1] transition-colors shadow-lg">
                <Settings className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
                {user.nickname}
              </h1>
              
              {isOwnProfile ? (
                <div className="flex space-x-3">
                  <button className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-xl transition-colors">
                    Edit Profile
                  </button>
                  <button className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-xl transition-colors">
                    Share Profile
                  </button>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <button className="px-6 py-2.5 bg-[#4387E5] hover:bg-[#3a75d1] text-white font-medium rounded-xl transition-colors">
                    Follow
                  </button>
                  <button className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-xl transition-colors">
                    Message
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
                <div className="font-bold text-xl text-gray-900">0</div>
                <div className="text-gray-500 text-sm">followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl text-gray-900">0</div>
                <div className="text-gray-500 text-sm">following</div>
              </div>
            </div>

            {/* Bio */}
            <div className="text-gray-900">
              <div className="font-semibold text-lg mb-2">
                {basicInfo?.name || user.nickname}
              </div>
              
              {/* Basic Info */}
              {basicInfo && (
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                  {basicInfo.gender && (
                    <div className="flex items-center space-x-1">
                      <UserIcon className="w-4 h-4" />
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
                      <span>
                        {basicInfo.height > 0 && `${basicInfo.height}cm`}
                        {basicInfo.height > 0 && basicInfo.weight > 0 && ' • '}
                        {basicInfo.weight > 0 && `${basicInfo.weight}kg`}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* About Section */}
              <div className="mb-4">
                {editingAbout && isOwnProfile ? (
                  <div className="space-y-3">
                    <textarea
                      value={aboutText}
                      onChange={(e) => setAboutText(e.target.value)}
                      placeholder="Tell people about yourself..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4387E5] focus:border-transparent resize-none"
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleUpdateAbout}
                        className="px-4 py-2 bg-[#4387E5] text-white rounded-lg hover:bg-[#3a75d1] transition-colors text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingAbout(false);
                          setAboutText(user.about || '');
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-2">
                    <div className="flex-1">
                      {user.about ? (
                        <p className="text-gray-600">{user.about}</p>
                      ) : isOwnProfile ? (
                        <p className="text-gray-400 italic">Add a bio to tell people about yourself</p>
                      ) : (
                        <p className="text-gray-400 italic">No bio available</p>
                      )}
                    </div>
                    {isOwnProfile && (
                      <button
                        onClick={() => setEditingAbout(true)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Lifestyle Info Preview */}
              {lifestyle && (
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Health & Lifestyle</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {lifestyle.health_goals && (
                      <div>
                        <span className="font-medium text-gray-700">Goals:</span>
                        <span className="text-gray-600 ml-1">{lifestyle.health_goals}</span>
                      </div>
                    )}
                    {lifestyle.diet_tracking && (
                      <div>
                        <span className="font-medium text-gray-700">Diet:</span>
                        <span className="text-gray-600 ml-1">{lifestyle.diet_tracking}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-[#4387E5] border-b-2 border-[#4387E5]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'posts' && (
            <>
              {loading ? (
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : posts.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {posts.map((post) => (
                    <div key={post.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer">
                      {post.image_url ? (
                        <img
                          src={`http://localhost:8000${post.image_url}`}
                          alt={post.phrase}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 group-hover:bg-gray-200 transition-colors">
                          <p className="text-gray-600 text-sm text-center p-4 line-clamp-3">
                            {post.phrase}
                          </p>
                        </div>
                      )}
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
                    {isOwnProfile ? 'Share your first post!' : 'No posts to show'}
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'saved' && (
            <div className="text-center py-16">
              <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved posts yet</h3>
              <p className="text-gray-500">Save posts you want to see again</p>
            </div>
          )}

          {activeTab === 'tagged' && (
            <div className="text-center py-16">
              <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tagged posts</h3>
              <p className="text-gray-500">When people tag you in photos, they'll appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;