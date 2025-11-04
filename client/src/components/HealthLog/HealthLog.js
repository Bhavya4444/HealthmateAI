import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useHealth } from '../../context/HealthContext';
import {
  ArrowTrendingUpIcon,
  MoonIcon,
  FireIcon,
  HeartIcon,
  PlusIcon,
  XMarkIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const HealthLog = () => {
  const { todayLog, getTodayLog, updateHealthLog, addMeal } = useHealth();
  const [showMealForm, setShowMealForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    steps: { count: 0, goal: 10000 },
    sleep: { duration: 0, quality: 'fair' },
    diet: { waterIntake: 0 },
    mood: '',
    energy: 5,
    weight: '',
    notes: ''
  });

  const [mealData, setMealData] = useState({
    name: '',
    type: 'breakfast',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  useEffect(() => {
    getTodayLog();
  }, []);

  // Fixed: Only update form data when todayLog changes, preserve current user input
  useEffect(() => {
    if (todayLog) {
      setFormData(prev => ({
        steps: todayLog.steps || prev.steps,
        sleep: todayLog.sleep || prev.sleep,
        diet: { waterIntake: todayLog.diet?.waterIntake || prev.diet.waterIntake },
        mood: todayLog.mood || prev.mood,
        energy: todayLog.energy !== undefined ? todayLog.energy : prev.energy,
        weight: todayLog.weight || prev.weight,
        notes: todayLog.notes || prev.notes
      }));
    }
  }, [todayLog]);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleDirectChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const saveData = {
        steps: formData.steps,
        sleep: formData.sleep,
        diet: formData.diet,
        mood: formData.mood,
        energy: formData.energy,
        weight: formData.weight,
        notes: formData.notes
      };
      const result = await updateHealthLog(saveData);
      if (result.success) {
        await getTodayLog();
        toast.success('Health data saved successfully!');
      }
    } catch (error) {
      console.error('Error saving health data:', error);
      toast.error('Failed to save health data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMealSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      // First save current form data to preserve it
      const saveData = {
        steps: formData.steps,
        sleep: formData.sleep,
        diet: formData.diet,
        mood: formData.mood,
        energy: formData.energy,
        weight: formData.weight,
        notes: formData.notes
      };

      await updateHealthLog(saveData);

      // Then add the meal
      const result = await addMeal(mealData);

      if (result.success) {
        // Reset only meal form
        setMealData({
          name: '',
          type: 'breakfast',
          calories: '',
          protein: '',
          carbs: '',
          fat: ''
        });
        setShowMealForm(false);

        // Refresh data
        await getTodayLog();
        toast.success('Meal added successfully!');
      }
    } catch (error) {
      console.error('Error adding meal:', error);
      toast.error('Failed to add meal');
    } finally {
      setIsLoading(false);
    }
  };

  // Improved auto-save that only sends non-default, non-empty values
  const autoSave = async () => {
    try {
      const saveData = {};
      if (formData.steps.count > 0) saveData.steps = formData.steps;
      if (formData.sleep.duration > 0) saveData.sleep = formData.sleep;
      if (formData.diet.waterIntake > 0) saveData.diet = formData.diet;
      if (formData.mood) saveData.mood = formData.mood;
      if (formData.energy !== 5) saveData.energy = formData.energy;
      if (formData.weight) saveData.weight = formData.weight;
      if (formData.notes) saveData.notes = formData.notes;
      if (Object.keys(saveData).length > 0) {
        await updateHealthLog(saveData);
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  // Auto-save with better conditions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.steps.count > 0 ||
          formData.sleep.duration > 0 ||
          formData.mood ||
          formData.energy !== 5 ||
          formData.diet.waterIntake > 0 ||
          formData.weight ||
          formData.notes) {
        autoSave();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData.steps, formData.sleep, formData.diet, formData.mood, formData.energy, formData.weight, formData.notes]);

  const moodOptions = [
    { value: 'very_sad', label: '😢 Very Sad', color: 'text-red-500' },
    { value: 'sad', label: '😞 Sad', color: 'text-orange-500' },
    { value: 'neutral', label: '😐 Neutral', color: 'text-yellow-500' },
    { value: 'happy', label: '😊 Happy', color: 'text-green-500' },
    { value: 'very_happy', label: '😄 Very Happy', color: 'text-green-600' }
    
  ];

  const sleepQualityOptions = [
    { value: 'poor', label: 'Poor' },
    { value: 'fair', label: 'Fair' },
    { value: 'good', label: 'Good' },
    { value: 'excellent', label: 'Excellent' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Log</h1>
          <p className="text-gray-600">
            Track your daily health metrics for {new Date().toLocaleDateString()}
          </p>
          <div className="mt-2 text-sm text-blue-600">
            💡 Your data is automatically saved as you type
          </div>
        </motion.div>

        {/* Single Page Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left Column */}
            <div className="space-y-8">

              {/* Activity Section */}
              <div className="bg-blue-50 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Daily Activity</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Steps Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.steps.count}
                      onChange={(e) => handleInputChange('steps', 'count', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter steps count"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Goal
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.steps.goal}
                      onChange={(e) => handleInputChange('steps', 'goal', parseInt(e.target.value) || 10000)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Step goal"
                    />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((formData.steps.count / formData.steps.goal) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {Math.round((formData.steps.count / formData.steps.goal) * 100)}% of daily goal
                </p>
              </div>

              {/* Sleep Section */}
              <div className="bg-purple-50 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <MoonIcon className="h-6 w-6 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Sleep Tracking</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sleep Duration (hours)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={formData.sleep.duration}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        handleInputChange('sleep', 'duration', value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Hours of sleep"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sleep Quality
                    </label>
                    <select
                      value={formData.sleep.quality}
                      onChange={(e) => handleInputChange('sleep', 'quality', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {sleepQualityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sleep Quality Indicator */}
                <div className="mt-4 p-3 bg-white rounded-lg border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current: {formData.sleep.duration} hours</span>
                    <span className={`text-sm font-medium capitalize ${
                      formData.sleep.quality === 'excellent' ? 'text-green-600' :
                      formData.sleep.quality === 'good' ? 'text-blue-600' :
                      formData.sleep.quality === 'fair' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {formData.sleep.quality} quality
                    </span>
                  </div>
                </div>
              </div>

              {/* Nutrition Section */}
              <div className="bg-orange-50 p-6 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <FireIcon className="h-6 w-6 text-orange-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Nutrition</h3>
                  </div>
                  <button
                    onClick={() => setShowMealForm(true)}
                    disabled={isLoading}
                    className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Meal
                  </button>
                </div>

                {/* Water Intake */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Water Intake (glasses)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.diet.waterIntake}
                    onChange={(e) => handleInputChange('diet', 'waterIntake', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Number of glasses"
                  />
                </div>

                {/* Meals List */}
                {todayLog?.diet?.meals?.length > 0 ? (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Today's Meals</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {todayLog.diet.meals.map((meal, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                          <div>
                            <span className="font-medium capitalize">{meal.type}</span>
                            {meal.name && <span className="text-gray-600 ml-2">- {meal.name}</span>}
                          </div>
                          <span className="text-sm text-gray-600">{meal.calories} cal</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-3 bg-white rounded-lg border">
                      <p className="text-sm text-orange-800 font-medium">
                        Total Calories: {todayLog.diet.totalCalories || 0}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-white rounded-lg border">
                    <p className="text-sm text-gray-500">No meals logged today</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Add Meal" to start tracking</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">

              {/* Wellness Section */}
              <div className="bg-green-50 p-6 rounded-xl">
                <div className="flex items-center mb-6">
                  <HeartIcon className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Wellness Tracking</h3>
                </div>

                {/* Mood */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How are you feeling today?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {moodOptions.map(mood => (
                      <button
                        key={mood.value}
                        type="button"
                        onClick={() => handleDirectChange('mood', mood.value)}
                        className={`p-3 rounded-lg border-2 transition-all text-sm ${
                          formData.mood === mood.value
                            ? 'border-green-500 bg-green-100'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <span className="block">{mood.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Energy Level */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Energy Level (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.energy}
                    onChange={(e) => handleDirectChange('energy', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>Low (1)</span>
                    <span className="font-medium text-green-600">Current: {formData.energy}</span>
                    <span>High (10)</span>
                  </div>
                </div>

                {/* Weight */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg) - Optional
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight}
                    onChange={(e) => handleDirectChange('weight', parseFloat(e.target.value) || '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Current weight"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleDirectChange('notes', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Any additional notes about your day..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Manual Save Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-4 px-6 rounded-lg font-medium text-lg transition-colors shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="spinner border-2 border-white border-t-transparent rounded-full w-5 h-5 mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  💾 Save Health Data
                </>
              )}
            </button>
            <p className="text-center text-sm text-gray-500 mt-2">
              Data is auto-saved, but you can manually save anytime
            </p>
          </div>
        </motion.div>

        {/* Meal Form Modal */}
        {showMealForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Meal</h3>
                <button
                  onClick={() => setShowMealForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleMealSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
                  <select
                    value={mealData.type}
                    onChange={(e) => setMealData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                    

                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meal Name</label>
                  <input
                    type="text"
                    value={mealData.name}
                    onChange={(e) => setMealData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Chicken Salad"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
                    <input
                      type="number"
                      min="0"
                      value={mealData.calories}
                      onChange={(e) => setMealData(prev => ({ ...prev, calories: parseInt(e.target.value) || '' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
                    <input
                      type="number"
                      min="0"
                      value={mealData.protein}
                      onChange={(e) => setMealData(prev => ({ ...prev, protein: parseInt(e.target.value) || '' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="25"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowMealForm(false)}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="spinner border-2 border-white border-t-transparent rounded-full w-4 h-4"></div>
                    ) : (
                      'Add Meal'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthLog;
