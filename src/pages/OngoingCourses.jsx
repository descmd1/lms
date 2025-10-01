import { useEffect, useState } from 'react';
import axios from 'axios';
import { CourseCard } from '../components/CourseCard';
import { useTheme } from '../components/ThemeContext';

const base_url = process.env.REACT_APP_BASE_URL;

export function OngoingCourses({ user }) {
    const [ongoingCourses, setOngoingCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {theme} = useTheme()

    useEffect(() => {
        const fetchOngoingCourses = async () => {
            const token = sessionStorage.getItem("user");

            try {
                const response = await axios.get(`${base_url}/ongoingcourses`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setOngoingCourses(response.data);
            } catch (error) {
                console.error('Failed to fetch ongoing courses:', error);
                setError('Failed to fetch ongoing courses');
            } finally {
                setLoading(false);
            }
        };

        fetchOngoingCourses();
    }, [user]);

    if (loading) return (
        <div className={`app-container ${theme} p-4 sm:p-6`}>
            <div className="mb-6">
                <h1 className={`text-color ${theme} text-2xl sm:text-3xl font-bold mb-2`}>Ongoing Courses</h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, index) => (
                    <div key={index} className={`field-color ${theme} rounded-lg p-4 animate-pulse`}>
                        <div className="bg-gray-300 h-40 rounded mb-4"></div>
                        <div className="bg-gray-300 h-4 rounded mb-2"></div>
                        <div className="bg-gray-300 h-3 rounded mb-2 w-3/4"></div>
                        <div className="bg-gray-300 h-3 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        </div>
    );
    
    if (error) return (
        <div className={`app-container ${theme} p-4 sm:p-6`}>
            <div className={`field-color ${theme} p-8 rounded-lg text-center`}>
                <div className="mb-4">
                    <span className="text-4xl mb-4 block">⚠️</span>
                </div>
                <h3 className={`text-color ${theme} text-lg font-semibold mb-2`}>Error Loading Courses</h3>
                <p className={`fade-color ${theme} text-sm mb-4`}>{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                    Try Again
                </button>
            </div>
        </div>
    );

    return (
        <div className={`app-container ${theme} p-4 sm:p-6`}>
            <div className="mb-6">
                <h1 className={`text-color ${theme} text-2xl sm:text-3xl font-bold mb-2`}>Ongoing Courses</h1>
                <p className={`fade-color ${theme} text-sm sm:text-base`}>Courses you are currently taking</p>
            </div>
            
            {ongoingCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {ongoingCourses.map(course => (
                        <CourseCard key={course._id} course={course} user={user} isEnrolled={true}/>
                    ))}
                </div>
            ) : (
                <div className={`field-color ${theme} p-8 rounded-lg text-center`}>
                    <div className="mb-4">
                        <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">🎯</span>
                        </div>
                    </div>
                    <h3 className={`text-color ${theme} text-lg font-semibold mb-2`}>No Ongoing Courses</h3>
                    <p className={`fade-color ${theme} text-sm mb-4`}>You don't have any courses in progress at the moment.</p>
                    <button 
                        onClick={() => window.location.href = '/home'}
                        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                        Find Courses
                    </button>
                </div>
            )}
        </div>
    );
}
