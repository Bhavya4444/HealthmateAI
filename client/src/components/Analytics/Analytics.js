import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useHealth } from '../../context/HealthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const { analytics, getAnalytics, getHealthLogs } = useHealth();
  const [timeRange, setTimeRange] = useState('7');
  const [healthLogs, setHealthLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    await getAnalytics(parseInt(timeRange));

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const logs = await getHealthLogs(startDate.toISOString(), endDate.toISOString());
    setHealthLogs(logs);
    setLoading(false);
  };

  const timeRanges = [
    { value: '7', label: '7 Days' },
    { value: '30', label: '30 Days' },
    { value: '90', label: '3 Months' }
  ];

  // Chart configurations
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const caloriesChartData = {
    labels: analytics?.caloriesTrend?.map(item =>
      new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Calories',
        data: analytics?.caloriesTrend?.map(item => item.value) || [],
        backgroundColor: 'rgba(249, 115, 22, 0.8)',
        borderColor: 'rgb(249, 115, 22)',
        borderWidth: 1,
      },
    ],
  };

  const moodChartData = {
    labels: Object.keys(analytics?.moodDistribution || {}),
    datasets: [
      {
        data: Object.values(analytics?.moodDistribution || {}),
        backgroundColor: [
          '#ef4444', // red
          '#f97316', // orange
          '#eab308', // yellow
          '#22c55e', // green
          '#16a34a', // dark green
        ],
        borderWidth: 0,
      },
    ],
  };

  const bodyCompositionChartData = {
    labels: analytics?.bodyFatTrend?.map(item =>
      new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Body Fat %',
        data: analytics?.bodyFatTrend?.map(item => item.value) || [],
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 1,
      },
      {
        label: 'Muscle Mass (kg)',
        data: analytics?.muscleMassTrend?.map(item => item.value) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Bone Density',
        data: analytics?.boneDensityTrend?.map(item => item.value) || [],
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
        borderColor: 'rgb(251, 191, 36)',
        borderWidth: 1,
      }
    ]
  };

  const bloodPressureChartData = {
    labels: analytics?.bloodPressureSystolicTrend?.map(item =>
      new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Systolic',
        data: analytics?.bloodPressureSystolicTrend?.map(item => item.value) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Diastolic',
        data: analytics?.bloodPressureDiastolicTrend?.map(item => item.value) || [],
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 1,
      }
    ]
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Analytics</h1>
              <p className="text-gray-600">Track your progress and identify patterns</p>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center space-x-2">
              <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Calories Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Calorie Intake</h3>
            {analytics?.caloriesTrend?.length > 0 ? (
              <Bar data={caloriesChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No calorie data available</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Mood Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Distribution</h3>
            {Object.keys(analytics?.moodDistribution || {}).length > 0 ? (
              <div className="flex justify-center">
                <div className="w-64 h-64">
                  <Doughnut
                    data={moodChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No mood data available</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Body Composition Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Body Composition Trends</h3>
            {bodyCompositionChartData.labels.length > 0 ? (
              <Bar data={bodyCompositionChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No body composition data available</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Blood Pressure Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Blood Pressure Trends</h3>
            {bloodPressureChartData.labels.length > 0 ? (
              <Bar data={bloodPressureChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No blood pressure data available</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl shadow-sm p-6 border border-primary-100"
        >
          <div className="flex items-center mb-4">
            <SparklesIcon className="h-6 w-6 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Health Insights</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Activity Level Insight */}
            {analytics?.averageSteps > 0 && (
              <div className="bg-white/60 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Activity Level</h4>
                <p className="text-sm text-gray-600">
                  {analytics.averageSteps >= 10000
                    ? "🎉 Excellent! You're consistently hitting your step goals."
                    : analytics.averageSteps >= 7500
                    ? "👍 Good activity level. Try to reach 10,000 steps daily."
                    : "📈 Consider increasing your daily activity for better health."
                  }
                </p>
              </div>
            )}

            {/* Sleep Quality Insight */}
            {analytics?.averageSleep > 0 && (
              <div className="bg-white/60 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Sleep Quality</h4>
                <p className="text-sm text-gray-600">
                  {analytics.averageSleep >= 7 && analytics.averageSleep <= 9
                    ? "😴 Great sleep habits! Keep maintaining 7-9 hours nightly."
                    : analytics.averageSleep < 7
                    ? "⚠️ You may need more sleep for optimal health and recovery."
                    : "💤 You might be sleeping too much. Aim for 7-9 hours."
                  }
                </p>
              </div>
            )}

            {/* Consistency Insight */}
            <div className="bg-white/60 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Consistency</h4>
              <p className="text-sm text-gray-600">
                {healthLogs.length >= parseInt(timeRange) * 0.7
                  ? "📊 Great job logging your health data consistently!"
                  : "📝 Try to log your health data more regularly for better insights."
                }
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
