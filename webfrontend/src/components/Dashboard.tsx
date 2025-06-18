import React, { useState } from 'react';
import Navigation from './Navigation';
import Feed from './Feed';
import Profile from './Profile';
import Messages from './Messages';
import CreatePost from './CreatePost';
import LifestyleForm from './LifestyleForm';
import type { User, BasicInfo } from '../types';

interface DashboardProps {
  currentUser: User;
  basicInfo: BasicInfo | null;
  onLogout: () => void;
}

type ActiveTab = 'feed' | 'profile' | 'messages' | 'create' | 'lifestyle';

const Dashboard: React.FC<DashboardProps> = ({ currentUser, basicInfo, onLogout }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return <Feed currentUser={currentUser} basicInfo={basicInfo} />;
      case 'profile':
        return <Profile user={currentUser} basicInfo={basicInfo} isOwnProfile={true} />;
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
      default:
        return <Feed currentUser={currentUser} basicInfo={basicInfo} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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