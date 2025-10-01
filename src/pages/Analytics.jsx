import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from 'react';
import axios from 'axios';
import * as jwt_decode from 'jwt-decode';
import { useTheme } from '../components/ThemeContext';

const base_url = process.env.REACT_APP_BASE_URL || 'http://localhost:5001'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    visits: 0,
    courseCount: 0,
    paidEnrollments: 0,
    ongoing: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = sessionStorage.getItem('user');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const decodedToken = jwt_decode.jwtDecode(token);
        const tutorId = decodedToken._id;

        console.log('Fetching analytics with token:', token ? 'Token exists' : 'No token');
        console.log('Request URL:', `${base_url}/analytics/visits/${tutorId}`);
        console.log('Tutor ID:', tutorId);
        
        const response = await axios.get(`${base_url}/analytics/visits/${tutorId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Analytics response:', response.data);
        
        if (response.data) {
          setAnalytics({
            visits: response.data.visitCount || 0,
            courseCount: response.data.courseCount || 0,
            paidEnrollments: response.data.paidEnrollments || 0, 
            ongoing: response.data.ongoing || 0, 
            completed: response.data.completed || 0, 
          });
          console.log('Analytics state updated:', {
            visits: response.data.visitCount || 0,
            courseCount: response.data.courseCount || 0,
            paidEnrollments: response.data.paidEnrollments || 0, 
            ongoing: response.data.ongoing || 0, 
            completed: response.data.completed || 0, 
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        console.error('Error details:', error.response?.data);
        setError(`Failed to load analytics data: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Chart data
  const chartData = {
    labels: ['Site Visits', 'Courses Created', 'Ongoing Courses', 'Completed Courses'],
    datasets: [
      {
        label: 'Analytics Overview',
        data: [analytics.visits, analytics.courseCount, analytics.ongoing, analytics.completed],
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: { 
        display: true, 
        text: 'Performance Overview',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: theme === 'dark' ? '#fff' : '#000',
        }
      },
      x: {
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: theme === 'dark' ? '#fff' : '#000',
        }
      }
    }
  };

  // Calculate metrics
  const totalRevenue = analytics.paidEnrollments * 50; // Assuming average course price
  const completionRate = analytics.courseCount > 0 ? ((analytics.completed / analytics.courseCount) * 100).toFixed(1) : 0;
  const engagementRate = analytics.visits > 0 ? ((analytics.paidEnrollments / analytics.visits) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className={`app-container ${theme} min-h-screen p-4 sm:p-6`}>
        <div className="mb-6">
          <div className="bg-gray-300 h-8 w-64 rounded mb-2 animate-pulse"></div>
          <div className="bg-gray-300 h-4 w-96 rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className={`field-color ${theme} rounded-lg p-6 animate-pulse`}>
              <div className="bg-gray-300 h-12 w-12 rounded-full mb-4"></div>
              <div className="bg-gray-300 h-8 w-16 rounded mb-2"></div>
              <div className="bg-gray-300 h-4 w-24 rounded"></div>
            </div>
          ))}
        </div>
        
        <div className={`field-color ${theme} rounded-lg p-6 animate-pulse`}>
          <div className="bg-gray-300 h-64 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`app-container ${theme} min-h-screen p-4 sm:p-6`}>
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">📊</div>
          <h2 className={`text-color ${theme} text-xl font-semibold mb-2`}>Analytics Unavailable</h2>
          <p className={`fade-color ${theme} mb-6`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container ${theme} min-h-screen p-4 sm:p-6`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-color ${theme} text-2xl sm:text-3xl font-bold mb-2`}>
          📈 Analytics Dashboard
        </h1>
        <p className={`fade-color ${theme} text-sm sm:text-base`}>
          Track your teaching performance and student engagement metrics
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {/* Site Visits */}
        <div className={`field-color ${theme} rounded-lg p-6 hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <div className="text-blue-600 text-xl">👥</div>
            </div>
            <div className="text-green-500 text-sm font-medium">+12%</div>
          </div>
          <h3 className={`text-color ${theme} text-2xl font-bold mb-1`}>
            {analytics.visits.toLocaleString()}
          </h3>
          <p className={`fade-color ${theme} text-sm`}>Site Visits</p>
        </div>

        {/* Courses Created */}
        <div className={`field-color ${theme} rounded-lg p-6 hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <div className="text-green-600 text-xl">📚</div>
            </div>
            <div className="text-green-500 text-sm font-medium">Active</div>
          </div>
          <h3 className={`text-color ${theme} text-2xl font-bold mb-1`}>
            {analytics.courseCount}
          </h3>
          <p className={`fade-color ${theme} text-sm`}>Courses Created</p>
        </div>

        {/* Paid Enrollments */}
        <div className={`field-color ${theme} rounded-lg p-6 hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <div className="text-purple-600 text-xl">💰</div>
            </div>
            <div className="text-green-500 text-sm font-medium">+{engagementRate}%</div>
          </div>
          <h3 className={`text-color ${theme} text-2xl font-bold mb-1`}>
            {analytics.paidEnrollments}
          </h3>
          <p className={`fade-color ${theme} text-sm`}>Paid Enrollments</p>
        </div>

        {/* Completion Rate */}
        <div className={`field-color ${theme} rounded-lg p-6 hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <div className="text-orange-600 text-xl">🎯</div>
            </div>
            <div className="text-green-500 text-sm font-medium">{completionRate}%</div>
          </div>
          <h3 className={`text-color ${theme} text-2xl font-bold mb-1`}>
            {analytics.completed}
          </h3>
          <p className={`fade-color ${theme} text-sm`}>Completed Courses</p>
        </div>
      </div>

      {/* Chart and Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Chart */}
        <div className={`field-color ${theme} rounded-lg p-6 lg:col-span-2`}>
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className={`field-color ${theme} rounded-lg p-6`}>
          <h3 className={`text-color ${theme} text-lg font-semibold mb-4`}>Quick Stats</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`fade-color ${theme} text-sm`}>Total Revenue</span>
              <span className={`text-color ${theme} font-semibold`}>${totalRevenue.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className={`fade-color ${theme} text-sm`}>Engagement Rate</span>
              <span className={`text-color ${theme} font-semibold`}>{engagementRate}%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className={`fade-color ${theme} text-sm`}>Completion Rate</span>
              <span className={`text-color ${theme} font-semibold`}>{completionRate}%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className={`fade-color ${theme} text-sm`}>Ongoing Courses</span>
              <span className={`text-color ${theme} font-semibold`}>{analytics.ongoing}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className={`text-color ${theme} text-sm font-semibold mb-2`}>Performance</h4>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(completionRate, 100)}%` }}
              ></div>
            </div>
            <p className={`fade-color ${theme} text-xs mt-1`}>Course completion rate</p>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className={`field-color ${theme} rounded-lg p-6`}>
          <h3 className={`text-color ${theme} text-lg font-semibold mb-4 flex items-center gap-2`}>
            💡 Insights
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className={`fade-color ${theme} text-sm`}>
                Your course completion rate is {completionRate}% - {completionRate > 70 ? 'Excellent!' : 'Room for improvement'}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className={`fade-color ${theme} text-sm`}>
                {analytics.paidEnrollments} students have enrolled in your paid courses
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className={`fade-color ${theme} text-sm`}>
                Your engagement rate is {engagementRate}% of total visits
              </p>
            </div>
          </div>
        </div>

        <div className={`field-color ${theme} rounded-lg p-6`}>
          <h3 className={`text-color ${theme} text-lg font-semibold mb-4 flex items-center gap-2`}>
            🎯 Goals
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className={`fade-color ${theme}`}>Monthly Enrollments</span>
                <span className={`text-color ${theme}`}>{analytics.paidEnrollments}/20</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${Math.min((analytics.paidEnrollments / 20) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className={`fade-color ${theme}`}>Course Creation</span>
                <span className={`text-color ${theme}`}>{analytics.courseCount}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${Math.min((analytics.courseCount / 10) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
