import React, { useState } from 'react';
import { Home, Search, PlusSquare, MessageCircle, User, LogOut, Heart, Menu, X } from 'lucide-react';
import type { User as UserType, BasicInfo } from '../types';
import { API_BASE_URL } from '../services/api';

interface NavigationProps {
  currentUser: UserType;
  basicInfo: BasicInfo | null;
  activeTab: string;
  onTabChange: (tab: 'feed' | 'profile' | 'messages' | 'create') => void;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentUser, basicInfo, activeTab, onTabChange, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { id: 'feed', icon: Home, label: 'Home' },
    { id: 'create', icon: PlusSquare, label: 'Create' },
    { id: 'messages', icon: MessageCircle, label: 'Messages' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const avatarUrl = basicInfo?.image_url
    ? `${API_BASE_URL}${basicInfo.image_url}`
    : `https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md">
                <img
                  src="/mylogo.png"
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                CareRing
              </span>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4387E5] focus:border-transparent text-gray-900 placeholder-gray-500 transition-all"
                />
              </div>
            </div>

            {/* Desktop Navigation Items */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id as any)}
                  className={`p-3 rounded-xl transition-all ${
                    activeTab === item.id 
                      ? 'text-[#4387E5] bg-blue-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                </button>
              ))}
              
              <div className="flex items-center space-x-2 ml-4">
                <button className="p-3 rounded-xl transition-all hover:bg-gray-50 text-gray-600 hover:text-gray-900 relative">
                  <Heart className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    3
                  </span>
                </button>
                
                <div className="flex items-center space-x-3 ml-2">
                  <img
                    src={avatarUrl}
                    alt={currentUser.nickname}
                    className="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-[#4387E5] transition-colors cursor-pointer object-cover"
                  />
                  <button
                    onClick={onLogout}
                    className="p-3 rounded-xl transition-all hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4387E5] focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Mobile Navigation Items */}
              <div className="grid grid-cols-2 gap-3">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-3 p-4 rounded-xl transition-all ${
                      activeTab === item.id 
                        ? 'bg-blue-50 text-[#4387E5]' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Mobile User Section */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <img
                    src={avatarUrl}
                    alt={currentUser.nickname}
                    className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{basicInfo?.name || currentUser.nickname}</p>
                    <p className="text-sm text-gray-500">@{currentUser.nickname}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-3 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as any)}
              className={`p-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'text-[#4387E5] bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-6 h-6" />
            </button>
          ))}
          <button className="p-3 rounded-xl transition-all text-gray-600 hover:text-gray-900 relative">
            <Heart className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
              3
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Navigation;