import React, { useState } from 'react';
import { Home, MessageCircle, User, LogOut, Heart, Menu, X, Activity, Settings } from 'lucide-react';
import type { User as UserType, BasicInfo } from '../types';

interface NavigationProps {
  currentUser: UserType;
  basicInfo: BasicInfo | null;
  activeTab: string;
  onTabChange: (tab: 'feed' | 'profile' | 'messages' | 'create' | 'wellness' | 'challenges' | 'customize') => void;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentUser, basicInfo, activeTab, onTabChange, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'feed', icon: Home, label: 'Home' },
    { id: 'wellness', icon: Activity, label: 'Wellness' },
    { id: 'messages', icon: MessageCircle, label: 'Messages' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const avatarUrl = basicInfo?.image_url 
    ? `http://localhost:51235${basicInfo.image_url}`
    : null;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#4387E5] to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="text-white font-bold text-lg w-6 h-6" fill="currentColor" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#4387E5] to-blue-600 bg-clip-text text-transparent hidden sm:block">
                Carering
              </span>
            </div>

            {/* Desktop Navigation Items */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id as any)}
                  className={`p-3 rounded-xl transition-all relative group ${
                    activeTab === item.id 
                      ? 'text-[#4387E5] bg-gradient-to-br from-blue-50 to-indigo-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  {activeTab === item.id && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#4387E5] rounded-full"></div>
                  )}
                </button>
              ))}
              
              <div className="flex items-center space-x-3 ml-4">
                <button
                  onClick={() => onTabChange('customize')}
                  className={`p-3 rounded-xl transition-all ${
                    activeTab === 'customize'
                      ? 'text-[#4387E5] bg-gradient-to-br from-blue-50 to-indigo-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="w-6 h-6" />
                </button>
                
                <div className="flex items-center space-x-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={currentUser.nickname}
                      className="w-10 h-10 rounded-full border-2 border-blue-200 hover:border-[#4387E5] transition-colors cursor-pointer object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-[#4387E5] to-blue-600 rounded-full border-2 border-blue-200 hover:border-[#4387E5] transition-colors cursor-pointer flex items-center justify-center text-white font-semibold">
                      {currentUser.nickname.charAt(0).toUpperCase()}
                    </div>
                  )}
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
                        ? 'text-[#4387E5] bg-gradient-to-br from-blue-50 to-indigo-50' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
                
                <button
                  onClick={() => {
                    onTabChange('customize');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 p-4 rounded-xl transition-all ${
                    activeTab === 'customize'
                      ? 'text-[#4387E5] bg-gradient-to-br from-blue-50 to-indigo-50'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Customize</span>
                </button>
              </div>

              {/* Mobile User Section */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={currentUser.nickname}
                      className="w-12 h-12 rounded-full border-2 border-blue-200 object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-[#4387E5] to-blue-600 rounded-full border-2 border-blue-200 flex items-center justify-center text-white font-semibold">
                      {currentUser.nickname.charAt(0).toUpperCase()}
                    </div>
                  )}
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
                  ? 'text-[#4387E5] bg-gradient-to-br from-blue-50 to-indigo-50' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-6 h-6" />
            </button>
          ))}
          <button
            onClick={() => onTabChange('customize')}
            className={`p-3 rounded-xl transition-all ${
              activeTab === 'customize'
                ? 'text-[#4387E5] bg-gradient-to-br from-blue-50 to-indigo-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Navigation;