import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Heart, Target, Utensils, Moon, Coffee } from 'lucide-react';
import { apiClient } from '../services/api';
import type { Lifestyle } from '../types';

interface LifestyleFormProps {
  onComplete: () => void;
  onBack: () => void;
}

const LifestyleForm: React.FC<LifestyleFormProps> = ({ onComplete, onBack }) => {
  const [formData, setFormData] = useState<Lifestyle>({
    medical_history: '',
    health_goals: '',
    diet_tracking: '',
    sleep_habits: '',
    smoking_alcohol: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof Lifestyle, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that all fields are filled
    const requiredFields = ['medical_history', 'health_goals', 'diet_tracking', 'sleep_habits', 'smoking_alcohol'];
    const emptyFields = requiredFields.filter(field => !formData[field as keyof Lifestyle]?.trim());
    
    if (emptyFields.length > 0) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await apiClient.saveLifestyle(formData);
      onComplete();
    } catch (error: any) {
      setError(error.message || 'Failed to save lifestyle information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 mb-20 md:mb-0">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Lifestyle Information</h2>
          <div className="w-9"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Medical History */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <Heart className="w-4 h-4 mr-2 text-red-500" />
              Medical History
            </label>
            <textarea
              value={formData.medical_history}
              onChange={(e) => handleInputChange('medical_history', e.target.value)}
              placeholder="Any chronic conditions, allergies, medications, or past surgeries..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4387E5] focus:border-transparent resize-none"
              rows={3}
              required
            />
          </div>

          {/* Health Goals */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <Target className="w-4 h-4 mr-2 text-green-500" />
              Health Goals
            </label>
            <textarea
              value={formData.health_goals}
              onChange={(e) => handleInputChange('health_goals', e.target.value)}
              placeholder="What are your health and fitness goals? (e.g., lose weight, build muscle, improve endurance...)"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4387E5] focus:border-transparent resize-none"
              rows={3}
              required
            />
          </div>

          {/* Diet Tracking */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <Utensils className="w-4 h-4 mr-2 text-orange-500" />
              Diet & Nutrition
            </label>
            <textarea
              value={formData.diet_tracking}
              onChange={(e) => handleInputChange('diet_tracking', e.target.value)}
              placeholder="Describe your current diet, eating habits, restrictions, or preferences..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4387E5] focus:border-transparent resize-none"
              rows={3}
              required
            />
          </div>

          {/* Sleep Habits */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <Moon className="w-4 h-4 mr-2 text-purple-500" />
              Sleep Habits
            </label>
            <textarea
              value={formData.sleep_habits}
              onChange={(e) => handleInputChange('sleep_habits', e.target.value)}
              placeholder="How many hours do you sleep? What time do you go to bed and wake up? Any sleep issues?"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4387E5] focus:border-transparent resize-none"
              rows={3}
              required
            />
          </div>

          {/* Smoking & Alcohol */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <Coffee className="w-4 h-4 mr-2 text-amber-500" />
              Smoking & Alcohol
            </label>
            <textarea
              value={formData.smoking_alcohol}
              onChange={(e) => handleInputChange('smoking_alcohol', e.target.value)}
              placeholder="Do you smoke or drink alcohol? How often? Any other substances or habits to mention?"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4387E5] focus:border-transparent resize-none"
              rows={3}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-[#4387E5] text-white rounded-xl font-medium hover:bg-[#3a75d1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Saving...' : 'Save Lifestyle Information'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LifestyleForm;