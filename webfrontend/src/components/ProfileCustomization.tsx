import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Palette, Layout, Clock, Calendar, Activity, Heart, Sun, Moon, Plus, Trash2, Move } from 'lucide-react';
import { apiClient } from '../services/api';
import type { User, BasicInfo } from '../types';

interface Widget {
  id: string;
  type: 'clock' | 'calendar' | 'weather' | 'activity' | 'mood' | 'quote';
  position: { x: number; y: number };
  size: 'small' | 'medium' | 'large';
}

interface ProfileCustomizationProps {
  currentUser: User;
  basicInfo: BasicInfo | null;
  onBack: () => void;
}

const ProfileCustomization: React.FC<ProfileCustomizationProps> = ({ currentUser, basicInfo, onBack }) => {
  const [backgroundType, setBackgroundType] = useState<'gradient' | 'solid' | 'image'>('gradient');
  const [backgroundColor, setBackgroundColor] = useState('#4387E5');
  const [gradientColors, setGradientColors] = useState(['#4387E5', '#6ba3f5']);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);

  const backgroundGradients = [
    ['#4387E5', '#6ba3f5'],
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#a8edea', '#fed6e3'],
    ['#ff9a9e', '#fecfef']
  ];

  const solidColors = [
    '#4387E5', '#667eea', '#f093fb', '#4facfe',
    '#43e97b', '#fa709a', '#a8edea', '#ff9a9e',
    '#1a1a1a', '#2d3748', '#4a5568', '#718096'
  ];

  const widgetTypes = [
    { type: 'clock', name: 'Clock', icon: Clock, color: 'blue' },
    { type: 'calendar', name: 'Calendar', icon: Calendar, color: 'green' },
    { type: 'activity', name: 'Activity', icon: Activity, color: 'purple' },
    { type: 'mood', name: 'Mood', icon: Heart, color: 'pink' },
    { type: 'weather', name: 'Weather', icon: Sun, color: 'yellow' },
    { type: 'quote', name: 'Quote', icon: Moon, color: 'indigo' }
  ];

  useEffect(() => {
    loadCustomization();
  }, []);

  const loadCustomization = async () => {
    try {
      const customization = await apiClient.getProfileCustomization();
      setBackgroundType(customization.background_type || 'gradient');
      setBackgroundColor(customization.background_color || '#4387E5');
      setGradientColors(customization.gradient_colors || ['#4387E5', '#6ba3f5']);
      setBackgroundImage(customization.background_image);
      setWidgets(customization.widgets || []);
    } catch (error) {
      console.error('Failed to load customization:', error);
    }
  };

  const addWidget = (type: Widget['type']) => {
    const newWidget: Widget = {
      id: Date.now().toString(),
      type,
      position: { x: 50 + Math.random() * 100, y: 100 + Math.random() * 100 },
      size: 'medium'
    };
    setWidgets([...widgets, newWidget]);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
    setSelectedWidget(null);
  };

  const handleMouseDown = (e: React.MouseEvent, widgetId: string) => {
    e.preventDefault();
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const previewRect = previewRef.current?.getBoundingClientRect();
    if (!previewRect) return;

    setDraggedWidget(widgetId);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setSelectedWidget(widgetId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedWidget || !previewRef.current) return;

    const previewRect = previewRef.current.getBoundingClientRect();
    const newX = e.clientX - previewRect.left - dragOffset.x;
    const newY = e.clientY - previewRect.top - dragOffset.y;

    // Constrain to preview bounds
    const constrainedX = Math.max(0, Math.min(newX, previewRect.width - 96)); // 96px = w-24
    const constrainedY = Math.max(0, Math.min(newY, previewRect.height - 96));

    setWidgets(widgets.map(widget => 
      widget.id === draggedWidget 
        ? { ...widget, position: { x: constrainedX, y: constrainedY } }
        : widget
    ));
  };

  const handleMouseUp = () => {
    setDraggedWidget(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const renderWidget = (widget: Widget) => {
    const sizeClasses = {
      small: 'w-16 h-16',
      medium: 'w-24 h-24',
      large: 'w-32 h-32'
    };

    const baseClasses = `absolute ${sizeClasses[widget.size]} bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 flex items-center justify-center text-white shadow-lg cursor-move select-none`;

    const style = {
      left: `${widget.position.x}px`,
      top: `${widget.position.y}px`,
      zIndex: draggedWidget === widget.id ? 1000 : 1
    };

    const content = () => {
      switch (widget.type) {
        case 'clock':
          return (
            <div className="text-center">
              <Clock className="w-6 h-6 mx-auto mb-1" />
              <div className="text-xs font-medium">
                {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          );
        case 'calendar':
          return (
            <div className="text-center">
              <Calendar className="w-6 h-6 mx-auto mb-1" />
              <div className="text-xs font-medium">
                {new Date().getDate()}
              </div>
            </div>
          );
        case 'activity':
          return (
            <div className="text-center">
              <Activity className="w-6 h-6 mx-auto mb-1" />
              <div className="text-xs font-medium">8.4K</div>
            </div>
          );
        case 'mood':
          return (
            <div className="text-center">
              <div className="text-2xl mb-1">😊</div>
              <div className="text-xs font-medium">Happy</div>
            </div>
          );
        case 'weather':
          return (
            <div className="text-center">
              <Sun className="w-6 h-6 mx-auto mb-1" />
              <div className="text-xs font-medium">22°C</div>
            </div>
          );
        case 'quote':
          return (
            <div className="text-center p-2">
              <div className="text-xs font-medium leading-tight">
                "Stay positive"
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div
        key={widget.id}
        className={`${baseClasses} ${selectedWidget === widget.id ? 'ring-2 ring-white' : ''}`}
        style={style}
        onMouseDown={(e) => handleMouseDown(e, widget.id)}
        onClick={() => setSelectedWidget(widget.id)}
      >
        {content()}
        {selectedWidget === widget.id && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeWidget(widget.id);
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  };

  const getBackgroundStyle = () => {
    switch (backgroundType) {
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`
        };
      case 'solid':
        return {
          backgroundColor
        };
      case 'image':
        return backgroundImage ? {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {
          background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`
        };
      default:
        return {};
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const customizationData = {
        background_type: backgroundType,
        background_color: backgroundColor,
        gradient_colors: gradientColors,
        background_image: backgroundImage,
        widgets: widgets
      };
      
      await apiClient.saveProfileCustomization(customizationData);
      alert('프로필 커스터마이징이 저장되었습니다!');
    } catch (error) {
      console.error('Failed to save customization:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 mb-20 md:mb-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#4387E5] to-blue-600 bg-clip-text text-transparent">
                프로필 꾸미기
              </h1>
              <p className="text-gray-600">나만의 특별한 프로필을 만들어보세요</p>
            </div>
          </div>

          {/* Background Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Palette className="w-5 h-5 mr-2 text-[#4387E5]" />
              배경 설정
            </h3>

            {/* Background Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">스타일</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: 'gradient', name: '그라데이션' },
                  { type: 'solid', name: '단색' },
                  { type: 'image', name: '이미지' }
                ].map((option) => (
                  <button
                    key={option.type}
                    onClick={() => setBackgroundType(option.type as any)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      backgroundType === option.type
                        ? 'border-[#4387E5] bg-blue-50 text-[#4387E5]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Gradient Colors */}
            {backgroundType === 'gradient' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">그라데이션 프리셋</label>
                <div className="grid grid-cols-4 gap-3">
                  {backgroundGradients.map((gradient, index) => (
                    <button
                      key={index}
                      onClick={() => setGradientColors(gradient)}
                      className={`w-full h-12 rounded-xl border-2 transition-all ${
                        JSON.stringify(gradientColors) === JSON.stringify(gradient)
                          ? 'border-white ring-2 ring-[#4387E5]'
                          : 'border-gray-200'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Solid Colors */}
            {backgroundType === 'solid' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">색상</label>
                <div className="grid grid-cols-8 gap-2">
                  {solidColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setBackgroundColor(color)}
                      className={`w-10 h-10 rounded-xl border-2 transition-all ${
                        backgroundColor === color
                          ? 'border-white ring-2 ring-[#4387E5]'
                          : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Widgets */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Layout className="w-5 h-5 mr-2 text-[#4387E5]" />
              위젯 추가
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {widgetTypes.map((widget) => {
                const IconComponent = widget.icon;
                return (
                  <button
                    key={widget.type}
                    onClick={() => addWidget(widget.type as Widget['type'])}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:border-[#4387E5] hover:bg-blue-50 transition-all"
                  >
                    <IconComponent className="w-5 h-5 text-[#4387E5]" />
                    <span className="font-medium text-gray-700">{widget.name}</span>
                    <Plus className="w-4 h-4 text-gray-400 ml-auto" />
                  </button>
                );
              })}
            </div>

            {widgets.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <Move className="w-4 h-4 inline mr-1" />
                  위젯을 드래그해서 위치를 변경하고, 선택 후 삭제할 수 있습니다
                </p>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#4387E5] to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? '저장 중...' : '커스터마이징 저장'}</span>
          </button>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">미리보기</h3>
            
            {/* iPhone-style Preview */}
            <div className="relative mx-auto w-80 h-96 bg-black rounded-3xl p-2">
              <div 
                ref={previewRef}
                className="w-full h-full rounded-2xl relative overflow-hidden"
                style={getBackgroundStyle()}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Status Bar */}
                <div className="flex justify-between items-center p-4 text-white text-sm">
                  <span>9:41</span>
                  <span>●●●</span>
                </div>

                {/* Profile Info */}
                <div className="text-center text-white p-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full mx-auto mb-2 flex items-center justify-center border border-white/30">
                    <span className="text-white font-semibold text-lg">
                      {(basicInfo?.name || currentUser.nickname).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-semibold">{basicInfo?.name || currentUser.nickname}</h3>
                  <p className="text-sm opacity-80">@{currentUser.nickname}</p>
                </div>

                {/* Widgets */}
                <div className="relative flex-1 p-4">
                  {widgets.map(renderWidget)}
                </div>

                {/* Bottom Dock */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex space-x-2 bg-white/20 backdrop-blur-md rounded-2xl p-2 border border-white/30">
                    <div className="w-8 h-8 bg-white/30 rounded-lg"></div>
                    <div className="w-8 h-8 bg-white/30 rounded-lg"></div>
                    <div className="w-8 h-8 bg-white/30 rounded-lg"></div>
                    <div className="w-8 h-8 bg-white/30 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCustomization;