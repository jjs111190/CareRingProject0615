export interface User {
  id: number;
  nickname: string;
  email: string;
  about?: string;
  profile_image?: string;
}

export interface BasicInfo {
  name: string;
  birth_date: string;
  gender: string;
  height: number;
  weight: number;
  image_url?: string;
}

export interface Lifestyle {
  id?: number;
  user_id?: number;
  medical_history: string;
  health_goals: string;
  diet_tracking: string;
  sleep_habits: string;
  smoking_alcohol: string;
}

export interface Post {
  id: number;
  user_id: number;
  phrase: string;
  hashtags?: string;
  location?: string;
  person_tag?: string;
  disclosure: string;
  image_url?: string;
  likes: number;
  comments: Comment[];
  user_name: string;
  created_at: string;
  liked?: boolean;
}

export interface Comment {
  id: number;
  content: string;
  user_id: number;
  user_nickname: string;
  user_name: string;
  user_profile_image?: string;
  created_at: string;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  timestamp: string;
  is_read: boolean;
}

export interface MessageUser {
  user_id: number;
  username: string;
  profile_image?: string;
  last_message: string;
  time: string;
  unread_count: number;
}

export interface MoodStory {
  id: number;
  nickname: string;
  image_url?: string;
  recentMood?: {
    emoji: string;
    phrase: string;
    created_at: string;
  };
}

export interface FollowData {
  follower_count: number;
  following_count: number;
  is_following: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  icon: string;
  color: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface WellnessChallenge {
  id: string;
  title: string;
  description: string;
  category: 'fitness' | 'nutrition' | 'mental' | 'sleep';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  participants: number;
  reward: string;
  icon: string;
  color: string;
}