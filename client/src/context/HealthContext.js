import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const HealthContext = createContext();

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};

export const HealthProvider = ({ children }) => {
  const [todayLog, setTodayLog] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const getTodayLog = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/health/today`);
      setTodayLog(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching today log:', error);
      toast.error('Failed to fetch today\'s health data');
    } finally {
      setLoading(false);
    }
  };

  const updateHealthLog = async (data) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/health/log`, {
        date: new Date().toISOString(),
        ...data
      });
      setTodayLog(response.data.log);
      return { success: true, data: response.data.log };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update health data';
      toast.error(message);
      return { success: false, message };
    }
  };

  const addMeal = async (meal) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/health/meal`, { meal });
      setTodayLog(response.data.log);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add meal';
      toast.error(message);
      return { success: false, message };
    }
  };

  const getAnalytics = async (days = 7) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/health/analytics?days=${days}`);
      setAnalytics(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics data');
    }
  };

  const getCalorieBalance = async (days = 7) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/health/calorie-balance?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching calorie balance:', error);
      toast.error('Failed to fetch calorie balance data');
      return null;
    }
  };

  const getHealthLogs = async (startDate, endDate, limit = 30) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('limit', limit);

      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/health/logs?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching health logs:', error);
      toast.error('Failed to fetch health logs');
      return [];
    }
  };

  const value = {
    todayLog,
    analytics,
    loading,
    getTodayLog,
    updateHealthLog,
    addMeal,
    getAnalytics,
    getHealthLogs,
    getCalorieBalance
  };

  return (
    <HealthContext.Provider value={value}>
      {children}
    </HealthContext.Provider>
  );
};
