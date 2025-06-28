import React, { useState } from 'react';
import { Trophy, Users, Clock, Star, Filter, Search, Target, Heart, Utensils, Moon } from 'lucide-react';
import type { WellnessChallenge } from '../types';

const ChallengesHub: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Challenges', icon: Target, color: 'gray' },
    { id: 'fitness', name: 'Fitness', icon: Target, color: '[#4387E5]' },
    { id: 'nutrition', name: 'Nutrition', icon: Utensils, color: 'orange' },
    { id: 'mental', name: 'Mental Health', icon: Heart, color: 'purple' },
    { id: 'sleep', name: 'Sleep', icon: Moon, color: 'indigo' },
  ];

  const challenges: WellnessChallenge[] = [
    {
      id: '1',
      title: '30-Day Fitness Transformation',
      description: 'Complete daily workouts and track your progress over 30 days',
      category: 'fitness',
      difficulty: 'hard',
      duration: '30 days',
      participants: 5420,
      reward: 'Transformation Badge + 200 points',
      icon: 'target',
      color: '[#4387E5]'
    },
    {
      id: '2',
      title: 'Mindful Mornings',
      description: 'Start each day with 15 minutes of meditation and gratitude',
      category: 'mental',
      difficulty: 'easy',
      duration: '21 days',
      participants: 3210,
      reward: 'Mindfulness Master + 150 points',
      icon: 'heart',
      color: 'purple'
    },
    {
      id: '3',
      title: 'Plant-Based Week',
      description: 'Explore plant-based meals for a full week',
      category: 'nutrition',
      difficulty: 'medium',
      duration: '7 days',
      participants: 2890,
      reward: 'Green Warrior Badge + 100 points',
      icon: 'utensils',
      color: 'green'
    },
    {
      id: '4',
      title: 'Sleep Optimization',
      description: 'Maintain consistent sleep schedule and improve sleep quality',
      category: 'sleep',
      difficulty: 'medium',
      duration: '14 days',
      participants: 1876,
      reward: 'Sleep Champion + 120 points',
      icon: 'moon',
      color: 'indigo'
    },
    {
      id: '5',
      title: '10K Steps Daily',
      description: 'Walk at least 10,000 steps every day',
      category: 'fitness',
      difficulty: 'medium',
      duration: '14 days',
      participants: 7654,
      reward: 'Step Master Badge + 140 points',
      icon: 'target',
      color: '[#4387E5]'
    },
    {
      id: '6',
      title: 'Hydration Hero',
      description: 'Drink 8 glasses of water daily and track your intake',
      category: 'nutrition',
      difficulty: 'easy',
      duration: '10 days',
      participants: 4321,
      reward: 'Hydration Hero + 80 points',
      icon: 'utensils',
      color: 'blue'
    }
  ];

  const filteredChallenges = challenges.filter(challenge => {
    const matchesCategory = selectedCategory === 'all' || challenge.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || challenge.difficulty === selectedDifficulty;
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'target': return Target;
      case 'heart': return Heart;
      case 'utensils': return Utensils;
      case 'moon': return Moon;
      default: return Target;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryColor = (color: string) => {
    switch (color) {
      case '[#4387E5]': return 'bg-[#4387E5] text-[#4387E5] bg-blue-50';
      case 'purple': return 'bg-purple-500 text-purple-600 bg-purple-50';
      case 'green': return 'bg-green-500 text-green-600 bg-green-50';
      case 'indigo': return 'bg-indigo-500 text-indigo-600 bg-indigo-50';
      case 'blue': return 'bg-blue-500 text-blue-600 bg-blue-50';
      case 'orange': return 'bg-orange-500 text-orange-600 bg-orange-50';
      default: return 'bg-gray-500 text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 mb-20 md:mb-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4387E5] to-blue-600 bg-clip-text text-transparent mb-2">
          Wellness Challenges
        </h1>
        <p className="text-gray-600">Join challenges, compete with friends, and earn rewards</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#4387E5] rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">12</div>
              <div className="text-sm text-blue-600">Completed</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-700">3</div>
              <div className="text-sm text-purple-600">Active</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">1,250</div>
              <div className="text-sm text-blue-600">Points Earned</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-700">47</div>
              <div className="text-sm text-orange-600">Rank</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4387E5] focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isActive = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-[#4387E5] text-white border-[#4387E5]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              );
            })}
          </div>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4387E5] focus:border-transparent"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChallenges.map((challenge) => {
          const IconComponent = getIcon(challenge.icon);
          const colorClasses = getCategoryColor(challenge.color).split(' ');
          
          return (
            <div key={challenge.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${colorClasses[2]} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <IconComponent className={`w-6 h-6 ${colorClasses[1]}`} />
                  </div>
                  <span className={`px-3 py-1 border rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#4387E5] transition-colors">
                  {challenge.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{challenge.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Duration</span>
                    </div>
                    <span className="font-medium text-gray-900">{challenge.duration}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>Participants</span>
                    </div>
                    <span className="font-medium text-gray-900">{challenge.participants.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Trophy className="w-4 h-4" />
                      <span>Reward</span>
                    </div>
                    <span className="font-medium text-gray-900 text-xs">{challenge.reward}</span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 pb-6">
                <button className={`w-full py-3 ${colorClasses[0]} text-white rounded-xl hover:opacity-90 transition-all font-medium group-hover:scale-105`}>
                  Join Challenge
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredChallenges.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
};

export default ChallengesHub;