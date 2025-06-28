import React, { useState } from 'react';
import { Heart, Shield, Users, Eye, EyeOff, Sparkles } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (nickname: string, email: string, password: string) => Promise<void>;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSignup }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await onLogin(formData.email, formData.password);
      } else {
        await onSignup(formData.nickname, formData.email, formData.password);
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#4387E5] to-blue-600 rounded-3xl mb-6 shadow-2xl transform hover:scale-105 transition-transform">
            <Heart className="w-10 h-10 text-white" fill="currentColor" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#4387E5] to-blue-600 bg-clip-text text-transparent mb-3">
            Carering
          </h1>
          <p className="text-gray-600 text-lg">Your wellness journey starts here</p>
          
          {/* Feature highlights */}
          <div className="flex justify-center space-x-6 mt-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-[#4387E5]" />
              <span>Health First</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Community</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Wellness</span>
            </div>
          </div>
        </div>

        {/* Login/Register Form */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="flex mb-6 bg-gray-50/80 rounded-2xl p-1">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                isLogin 
                  ? 'bg-white text-[#4387E5] shadow-lg' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Welcome Back
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                !isLogin 
                  ? 'bg-white text-[#4387E5] shadow-lg' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Join Community
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Wellness Name
                </label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4387E5] focus:border-transparent transition-all bg-white/50"
                  placeholder="Choose your community name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4387E5] focus:border-transparent transition-all bg-white/50"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-4 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4387E5] focus:border-transparent transition-all bg-white/50"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#4387E5] to-blue-600 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Please wait...</span>
                </div>
              ) : (
                isLogin ? 'Start Your Wellness Journey' : 'Join Carering Community'
              )}
            </button>
          </form>

          {isLogin && (
            <div className="text-center mt-6">
              <a href="#" className="text-sm text-[#4387E5] hover:text-blue-600 transition-colors">
                Forgot your password?
              </a>
            </div>
          )}
        </div>

        {/* Wellness Promise */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm mb-4">
            Join thousands on their wellness journey
          </p>
          <div className="flex justify-center space-x-8 text-xs text-gray-500">
            <div className="text-center">
              <div className="font-semibold text-[#4387E5]">10K+</div>
              <div>Active Members</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600">50K+</div>
              <div>Wellness Posts</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-indigo-600">100+</div>
              <div>Health Challenges</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;