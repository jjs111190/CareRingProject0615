import React, { useState } from 'react';
import Navigation from './Navigation';
import Feed from './Feed';
import Profile from './Profile';
import Messages from './Messages';
import CreatePost from './CreatePost';
import LifestyleForm from './LifestyleForm';
import WellnessDashboard from './WellnessDashboard';
import ProfileCustomization from './ProfileCustomization';
import UserProfile from './UserProfile';
import type { User, BasicInfo } from '../types';

interface DashboardProps {
  currentUser: User;
  basicInfo: BasicInfo | null;
  onLogout: () => void;
}

type ActiveTab = 'feed' | 'profile' | 'messages' | 'create' | 'lifestyle' | 'wellness' | 'customize' | 'user-profile';

const Dashboard: React.FC<DashboardProps> = ({ currentUser, basicInfo, onLogout }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleUserClick = (userId: number) => {
    if (userId === currentUser.id) {
      setActiveTab('profile');
    } else {
      setSelectedUserId(userId);
      setActiveTab('user-profile');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return <Feed currentUser={currentUser} basicInfo={basicInfo} onUserClick={handleUserClick} />;
      case 'wellness':
        return <WellnessDashboard />;
      case 'profile':
        return <Profile user={currentUser} basicInfo={basicInfo} isOwnProfile={true} />;
      case 'user-profile':
        return selectedUserId ? (
          <UserProfile 
            userId={selectedUserId} 
            currentUserId={currentUser.id}
            onBack={() => setActiveTab('feed')} 
          />
        ) : <Feed currentUser={currentUser} basicInfo={basicInfo} onUserClick={handleUserClick} />;
      case 'messages':
        return <Messages currentUser={currentUser} />;
      case 'create':
        return <CreatePost currentUser={currentUser} onPostCreated={() => setActiveTab('feed')} />;
      case 'lifestyle':
        return (
          <LifestyleForm 
            onComplete={() => setActiveTab('profile')} 
            onBack={() => setActiveTab('profile')}
          />
        );
      case 'customize':
        return (
          <ProfileCustomization
            currentUser={currentUser}
            basicInfo={basicInfo}
            onBack={() => setActiveTab('profile')}
          />
        );
      default:
        return <Feed currentUser={currentUser} basicInfo={basicInfo} onUserClick={handleUserClick} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <Navigation 
        currentUser={currentUser}
        basicInfo={basicInfo}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
      />
      <main className="pt-16">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;