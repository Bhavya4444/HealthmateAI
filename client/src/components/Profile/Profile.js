import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  UserIcon,
  CogIcon,
  HeartIcon,
  ScaleIcon,
  ChartBarIcon,
  BellIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || '',
    height: user?.height || '',
    weight: user?.weight || '',
    gender: user?.gender || '',
    activityLevel: user?.activityLevel || 'moderate',
    healthGoals: user?.healthGoals || []
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'health', name: 'Health Info', icon: HeartIcon },
    { id: 'goals', name: 'Goals', icon: ChartBarIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon }
  ];

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
    { value: 'light', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
    { value: 'moderate', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
    { value: 'active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
    { value: 'very_active', label: 'Extremely Active', desc: 'Very hard exercise, physical job' }
  ];

  const healthGoalOptions = [
    { value: 'weight_loss', label: 'Weight Loss', icon: '🎯' },
    { value: 'weight_gain', label: 'Weight Gain', icon: '📈' },
    { value: 'muscle_gain', label: 'Muscle Gain', icon: '💪' },
    { value: 'maintain_weight', label: 'Maintain Weight', icon: '⚖️' },
    { value: 'improve_fitness', label: 'Improve Fitness', icon: '🏃' },
    { value: 'better_sleep', label: 'Better Sleep', icon: '😴' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoalToggle = (goal) => {
    setFormData(prev => ({
      ...prev,
      healthGoals: prev.healthGoals.includes(goal)
        ? prev.healthGoals.filter(g => g !== goal)
        : [...prev.healthGoals, goal]
    }));
  };

  const handleSave = async () => {
    const result = await updateProfile(formData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      age: user?.age || '',
      height: user?.height || '',
      weight: user?.weight || '',
      gender: user?.gender || '',
      activityLevel: user?.activityLevel || 'moderate',
      healthGoals: user?.healthGoals || []
    });
    setIsEditing(false);
  };

  const calculateBMI = () => {
    if (formData.height && formData.weight) {
      const heightM = formData.height / 100;
      const bmi = formData.weight / (heightM * heightM);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-1">{user?.name}</h1>
                  <p className="text-blue-100">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value) || '')}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Health Info Tab */}
          {activeTab === 'health' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Health Metrics</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', parseInt(e.target.value) || '')}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', parseInt(e.target.value) || '')}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
                  />
                </div>
              </div>

              {/* BMI Calculation */}
              {calculateBMI() && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Body Mass Index (BMI)</h4>
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold text-gray-900">{calculateBMI()}</div>
                    <div className={`font-medium ${getBMICategory(calculateBMI()).color}`}>
                      {getBMICategory(calculateBMI()).category}
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Activity Level</label>
                <div className="space-y-2">
                  {activityLevels.map((level) => (
                    <label key={level.value} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.activityLevel === level.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                    } ${!isEditing ? 'pointer-events-none opacity-60' : ''}`}>
                      <input
                        type="radio"
                        name="activityLevel"
                        value={level.value}
                        checked={formData.activityLevel === level.value}
                        onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                        disabled={!isEditing}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">{level.label}</div>
                        <div className="text-sm text-gray-600">{level.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Health Goals</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {healthGoalOptions.map((goal) => (
                  <label key={goal.value} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.healthGoals.includes(goal.value) ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                  } ${!isEditing ? 'pointer-events-none opacity-60' : ''}`}>
                    <input
                      type="checkbox"
                      checked={formData.healthGoals.includes(goal.value)}
                      onChange={() => handleGoalToggle(goal.value)}
                      disabled={!isEditing}
                      className="text-primary-600 focus:ring-primary-500 rounded"
                    />
                    <div className="ml-3 flex items-center">
                      <span className="text-xl mr-2">{goal.icon}</span>
                      <span className="font-medium text-gray-900">{goal.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">App Settings</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <BellIcon className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Push Notifications</p>
                      <p className="text-sm text-gray-600">Get reminders and health tips</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Data Privacy</p>
                      <p className="text-sm text-gray-600">Your health data is encrypted and secure</p>
                    </div>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Protected</span>
                </div>
              </div>
            </div>
          )}

          {/* Save/Cancel Buttons */}
          {isEditing && (
            <div className="pt-6 border-t border-gray-200 flex space-x-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
