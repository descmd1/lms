import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from 'react';
import axios from 'axios';
import * as jwt_decode from 'jwt-decode';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    visits: 0,
    courseCount: 0,
    paidEnrollments: 0,
    ongoing: 0,
    completed: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = sessionStorage.getItem('user');
      if (token) {
        const decodedToken = jwt_decode.jwtDecode(token);
        const tutorId = decodedToken._id;

        try {
          const response = await axios.get(`http://localhost:5001/analytics/visits/${tutorId}`);
          
          // Assuming response.data contains all necessary fields
          if (response.data) {
            setAnalytics({
              visits: response.data.visitCount || 0,
              courseCount: response.data.courseCount || 0, // Change as per your response structure
              paidEnrollments: response.data.paidEnrollments || 0, // Adjust as needed
              ongoing: response.data.ongoing || 0, // Adjust as needed
              completed: response.data.completed || 0, // Adjust as needed
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
     
      <div className='flex flex-col w-full justify-center shadow-md rounded-md bg-white p-4'>
        <Line data={data} options={options} />
      </div>
  );
};
