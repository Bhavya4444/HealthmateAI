import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useHealth } from '../../context/HealthContext';
import {
  HeartIcon,
  FireIcon,
  MoonIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { todayLog, getTodayLog, analytics, getAnalytics, loading } = useHealth();
  const [aiSummary, setAiSummary] = useState('');

  useEffect(() => {
    getTodayLog();
    getAnalytics(7);
  }, []);

  const quickStats = [
    {
      name: 'Daily Activity',
      primary: {
        label: 'Steps',
        value: todayLog?.steps?.count || 0,
        goal: todayLog?.steps?.goal || 10000,
        unit: 'steps'
      },
      secondary: {
        label: 'Calories Burned',
        value: (todayLog?.steps?.caloriesBurned || 0) + (todayLog?.exercise?.totalCaloriesBurned || 0),
        unit: 'cal'
      },
      icon: ArrowTrendingUpIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Nutrition & Balance',
      primary: {
        label: 'Calories Intake',
        value: todayLog?.diet?.totalCalories || 0,
        goal: 2000,
        unit: 'cal'
      },
      secondary: {
        label: 'Water Intake',
        value: todayLog?.diet?.waterIntake || 0,
        unit: 'glasses'
      },
      icon: FireIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      name: 'Wellness & Recovery',
      primary: {
        label: 'Sleep',
        value: todayLog?.sleep?.duration || 0,
        goal: 8,
        unit: 'hours'
      },
      secondary: null, // Removed Exercise Time
      icon: MoonIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Health Score',
      primary: {
        label: 'Overall Score',
        value: calculateHealthScore(),
        goal: 100,
        unit: '%'
      },
      secondary: {
        label: 'Energy Level',
        value: todayLog?.energy || 5,
        unit: '/10'
      },
      icon: HeartIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Body Composition',
      primary: {
        label: 'Body Fat',
        value: todayLog?.bodyComposition?.bodyFatPercentage || 0,
        goal: 15,
        unit: '%'
      },
      secondary: {
        label: 'Muscle Mass',
        value: todayLog?.bodyComposition?.muscleMass || 0,
        unit: 'kg'
      },
      icon: ({ className }) => (
        <div className={`rounded-lg ${className}`} 
             style={{ width: '1.5rem', height: '1.5rem', backgroundColor: 'currentColor' }} />
      ),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Blood Pressure',
      primary: {
        label: 'Systolic/Diastolic',
        value: todayLog?.bloodPressure?.systolic && todayLog?.bloodPressure?.diastolic 
          ? `${todayLog.bloodPressure.systolic}/${todayLog.bloodPressure.diastolic}` 
          : 'Not recorded',
        goal: '120/80',
        unit: 'mmHg'
      },
      secondary: {
        label: 'Category',
        value: todayLog?.bloodPressure?.category 
          ? todayLog.bloodPressure.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          : 'Unknown',
        unit: ''
      },
      icon: ({ className }) => (
        <div className={`rounded-full ${className}`} 
             style={{ width: '1.5rem', height: '1.5rem', backgroundColor: 'currentColor' }} />
      ),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
    
  ];

  function calculateHealthScore() {
    if (!todayLog) return 0;

    let score = 0;
    let factors = 0;

    // Steps score (20%)
    if (todayLog.steps?.count) {
      score += Math.min(20, (todayLog.steps.count / todayLog.steps.goal) * 20);
      factors += 20;
    }

    // Sleep score (20%)
    if (todayLog.sleep?.duration) {
      const sleepScore = todayLog.sleep.duration >= 7 && todayLog.sleep.duration <= 9 ? 20 :
                       todayLog.sleep.duration >= 6 && todayLog.sleep.duration <= 10 ? 15 : 10;
      score += sleepScore;
      factors += 20;
    }

    // Energy score (20%)
    if (todayLog.energy) {
      score += (todayLog.energy / 10) * 20;
      factors += 20;
    }

    // Exercise score (20%)
    if (todayLog.exercise?.length > 0) {
      score += 20;
      factors += 20;
    }

    // Body Composition score (10%)
    if (todayLog.bodyComposition?.bodyFatPercentage) {
      const bodyFat = todayLog.bodyComposition.bodyFatPercentage;
      const bfScore = bodyFat <= 15 ? 10 :
                     bodyFat <= 20 ? 8 :
                     bodyFat <= 25 ? 6 : 4;
      score += bfScore;
      factors += 10;
    }

    // Blood Pressure score (10%)
    if (todayLog.bloodPressure?.systolic && todayLog.bloodPressure?.diastolic) {
      const category = todayLog.bloodPressure.category;
      const bpScore = category === 'optimal' ? 10 :
                     category === 'normal' ? 8 :
                     category === 'high_normal' ? 6 : 4;
      score += bpScore;
      factors += 10;
    }

    return factors > 0 ? Math.round((score / factors) * 100) : 0;
  }

  const getProgressColor = (value, goal) => {
    const percentage = (value / goal) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const quickActions = [
    {
      name: 'Log Health Data',
      description: 'Update your daily health metrics',
      icon: DocumentTextIcon,
      href: '/log',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'View Analytics',
      description: 'See your health trends and insights',
      icon: ChartBarIcon,
      href: '/analytics',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      name: 'Chat with AI',
      description: 'Get personalized health advice',
      icon: ChatBubbleLeftRightIcon,
      href: '/chat',
      color: 'bg-green-500 hover:bg-green-600'
    }

  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <div className="mt-4 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">
                  Your health score today: <span className="font-bold">{calculateHealthScore()}%</span>
                </span>
              </div>
            </div>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 bg-white opacity-10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-24 w-24 bg-white opacity-10 rounded-full"></div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
        >
          {quickStats.map((stat, index) => (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <span className="text-sm text-gray-500">{stat.name}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {stat.primary.value.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">{stat.primary.unit}</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(stat.primary.value, stat.primary.goal)}`}
                    style={{ width: `${Math.min((stat.primary.value / stat.primary.goal) * 100, 100)}%` }}
                  ></div>
                </div>

                <p className="text-xs text-gray-500">
                  Goal: {stat.primary.goal.toLocaleString()} {stat.primary.unit}
                </p>

                {stat.secondary && (
                  <div className="mt-4">
                    <div className="flex items-end justify-between">
                      <span className="text-lg font-semibold text-gray-900">
                        {stat.secondary.value.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">{stat.secondary.unit}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {stat.secondary.label}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    to={action.href}
                    className="block group"
                  >
                    <div className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all group-hover:shadow-md">
                      <div className={`p-2 rounded-lg ${action.color} text-white mr-3`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-primary-600">
                          {action.name}
                        </p>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Activity & AI Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Today's Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>

              {todayLog ? (
                <div className="space-y-4">
                  {/* Meals */}
                  {todayLog.diet?.meals?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Recent Meals</h4>
                      <div className="space-y-2">
                        {todayLog.diet.meals.slice(-3).map((meal, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium capitalize">{meal.type}</span>
                            <span className="text-sm text-gray-600">{meal.calories} cal</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Exercise */}
                  {todayLog.exercise?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Exercise</h4>
                      <div className="space-y-2">
                        {todayLog.exercise.map((exercise, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium">{exercise.activity}</span>
                            <span className="text-sm text-gray-600">{exercise.duration} min</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mood & Energy */}
                  <div className="grid grid-cols-2 gap-4">
                    {todayLog.mood && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Mood</p>
                        <p className="font-medium capitalize">{todayLog.mood}</p>
                      </div>
                    )}
                    {todayLog.energy && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Energy</p>
                        <p className="font-medium">{todayLog.energy}/10</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No health data logged today</p>
                  <Link
                    to="/log"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Log Your First Entry
                  </Link>
                </div>
              )}
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-sm p-6 border border-purple-100">
              <div className="flex items-center mb-4">
                <SparklesIcon className="h-6 w-6 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">AI Health Insights</h3>
              </div>

              {todayLog?.aiSummary ? (
                <div className="space-y-3">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {todayLog.aiSummary}
                  </p>
                  {todayLog.aiRecommendations?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {todayLog.aiRecommendations.slice(0, 3).map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="text-purple-500 mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-3">Get AI-powered insights about your health</p>
                  <Link
                    to="/chat"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                    Chat with AI
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
