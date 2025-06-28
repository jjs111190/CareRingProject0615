import React, { useState, useEffect } from 'react';
import { Activity, Heart, Droplets, Moon, TrendingUp, TrendingDown, Minus, Target, Award, Users } from 'lucide-react';
import type { HealthMetric, WellnessChallenge } from '../types';

const WellnessDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([
    {
      id: '1',
      name: 'Steps Today',
      value: 8420,
      unit: 'steps',
      icon: 'activity',
      color: '[#4387E5]',
      trend: 'up',
      change: 12
    },
    {
      id: '2',
      name: 'Heart Rate',
      value: 72,
      unit: 'bpm',
      icon: 'heart',
      color: 'red',
      trend: 'stable',
      change: 0
    },
    {
      id: '3',
      name: 'Water Intake',
      value: 6,
      unit: 'glasses',
      icon: 'droplets',
      color: 'blue',
      trend: 'down',
      change: -2
    },
    {
      id: '4',
      name: 'Sleep Quality',
      value: 85,
      unit: '%',
      icon: 'moon',
      color: 'purple',
      trend: 'up',
      change: 8
    }
  ]);

  const [challenges, setChallenges] = useState<WellnessChallenge[]>([
    {
      id: '1',
      title: '10K Steps Challenge',
      description: 'Walk 10,000 steps daily for a week',
      category: 'fitness',
      difficulty: 'medium',
      duration: '7 days',
      participants: 1247,
      reward: 'Wellness Badge + 50 points',
      icon: 'activity',
      color: '[#4387E5]'
    },
    {
      id: '2',
      title: 'Mindful Meditation',
      description: 'Practice 10 minutes of meditation daily',
      category: 'mental',
      difficulty: 'easy',
      duration: '14 days',
      participants: 892,
      reward: 'Zen Master Badge + 75 points',
      icon: 'heart',
      color: 'purple'
    },
    {
      id: '3',
      title: 'Hydration Hero',
      description: 'Drink 8 glasses of water daily',
      category: 'nutrition',
      difficulty: 'easy',
      duration: '5 days',
      participants: 2156,
      reward: 'Hydration Badge + 30 points',
      icon: 'droplets',
      color: 'blue'
    }
  ]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'activity': return Activity;
      case 'heart': return Heart;
      case 'droplets': return Droplets;
      case 'moon': return Moon;
      default: return Activity;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      case 'stable': return Minus;
      default: return Minus;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case '[#4387E5]': return 'bg-[#4387E5] text-[#4387E5] bg-blue-50';
      case 'red': return 'bg-red-500 text-red-600 bg-red-50';
      case 'blue': return 'bg-blue-500 text-blue-600 bg-blue-50';
      case 'purple': return 'bg-purple-500 text-purple-600 bg-purple-50';
      default: return 'bg-gray-500 text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 mb-20 md:mb-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4387E5] to-blue-600 bg-clip-text text-transparent mb-2">
          Your Wellness Dashboard
        </h1>
        <p className="text-gray-600">Track your health journey and join wellness challenges</p>
      </div>

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => {
          const IconComponent = getIcon(metric.icon);
          const TrendIcon = getTrendIcon(metric.trend);
          const colorClasses = getColorClasses(metric.color).split(' ');
          
          return (
            <div key={metric.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${colorClasses[2]} rounded-xl flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 ${colorClasses[1]}`} />
                </div>
                <div className={`flex items-center space-x-1 ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  <TrendIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {metric.change > 0 ? '+' : ''}{metric.change}
                  </span>
                </div>
              </div>
              
              <div className="mb-2">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {metric.value.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500 ml-1">{metric.unit}</span>
                </div>
                <p className="text-sm text-gray-600">{metric.name}</p>
              </div>
              
              {/* Progress bar for some metrics */}
              {metric.name.includes('Steps') && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${colorClasses[0]} h-2 rounded-full transition-all`}
                    style={{ width: `${Math.min((metric.value / 10000) * 100, 100)}%` }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Wellness Challenges */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Wellness Challenges</h2>
              <p className="text-gray-600">Join challenges and earn rewards</p>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-[#4387E5] to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all">
              View All
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => {
              const IconComponent = getIcon(challenge.icon);
              const colorClasses = getColorClasses(challenge.color).split(' ');
              
              return (
                <div key={challenge.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${colorClasses[2]} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`w-6 h-6 ${colorClasses[1]}`} />
                    </div>
                    <span className={`px-3 py-1 ${colorClasses[2]} ${colorClasses[1]} text-xs font-medium rounded-full`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-2">{challenge.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium text-gray-900">{challenge.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Participants:</span>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{challenge.participants.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Reward:</span>
                      <div className="flex items-center space-x-1">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium text-gray-900 text-xs">{challenge.reward}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button className={`w-full py-3 ${colorClasses[0]} text-white rounded-xl hover:opacity-90 transition-all font-medium`}>
                    Join Challenge
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all group">
          <Activity className="w-8 h-8 text-[#4387E5] mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium text-blue-700">Log Workout</span>
        </button>
        
        <button className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all group">
          <Droplets className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium text-blue-700">Add Water</span>
        </button>
        
        <button className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all group">
          <Heart className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium text-purple-700">Mood Check</span>
        </button>
        
        <button className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl hover:from-indigo-100 hover:to-blue-100 transition-all group">
          <Target className="w-8 h-8 text-indigo-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium text-indigo-700">Set Goal</span>
        </button>
      </div>
    </div>
  );
};

export default WellnessDashboard;