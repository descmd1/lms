import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from 'react';
import axios from 'axios';
import * as jwt_decode from 'jwt-decode';
import { useTheme } from '../components/ThemeContext';

const base_url = 'https://lms-xfl6.vercel.app'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    visits: 0,
    courseCount: 0,
    paidEnrollments: 0,
    ongoing: 0,
    completed: 0,
  });
const {theme} = useTheme()

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = sessionStorage.getItem('user');
      if (token) {
        const decodedToken = jwt_decode.jwtDecode(token);
        const tutorId = decodedToken._id;

        try {
          const response = await axios.get(`http://localhost:5001/analytics/visits/${tutorId}`);
          if (response.data) {
            setAnalytics({
              visits: response.data.visitCount || 0,
              courseCount: response.data.courseCount || 0,
              paidEnrollments: response.data.paidEnrollments || 0, 
              ongoing: response.data.ongoing || 0, 
              completed: response.data.completed || 0, 
            });
          }
          console.log(response);
        } catch (error) {
          console.error('Error fetching analytics:', error);
        }
      }
    };

    fetchAnalytics();
  }, []);

  // Chart data
  const data = {
    labels: ['Site Visits', 'Courses Created', 'Ongoing Courses', 'Completed Courses'],
    datasets: [
      {
        label: 'Tutor Analytics',
        data: [analytics.visits, analytics.courseCount, analytics.ongoing, analytics.completed],
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Tutor Analytics' },
    },
  };

  return (
     
      <div className={`app-container ${theme} flex flex-col w-full justify-center 
      shadow-md rounded-md p-4 min-h-screen`}>
        <Line data={data} options={options} />
      </div>
  );
};
