import { useEffect, useState } from 'react';
import axios from 'axios';
import Confetti from 'react-confetti'; 
import { CourseCard } from '../components/CourseCard';
import { useTheme } from '../components/ThemeContext';

const base_url = process.env.REACT_APP_BASE_URL;

export function CompletedCourses({ user }) {
    const [completedCourses, setCompletedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const {theme} = useTheme();

    useEffect(() => {
        const fetchCompletedCourses = async () => {
            const token = sessionStorage.getItem("user");

            try {
                const response = await axios.get(`${base_url}/completedcourses`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCompletedCourses(response.data);

                if (response.data.length > 0) {
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 5000);
                }
            } catch (error) {
                console.error('Failed to fetch completed courses:', error);
                setError('Failed to fetch completed courses');
            } finally {
                setLoading(false);
            }
        };

        fetchCompletedCourses();
    }, [user]);

    if (loading) {
        return (
            <div className={`app-container ${theme} p-4 sm:p-6`}>
                <div className="mb-6">
                    <h1 className={`text-color ${theme} text-2xl sm:text-3xl font-bold mb-2`}>
                        Completed Courses
                    </h1>
                    <p className={`fade-color ${theme} text-sm sm:text-base`}>
                        Loading your completed courses...
                    </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {[...Array(8)].map((_, index) => (
                        <div key={index} className={`field-color ${theme} rounded-lg p-4 animate-pulse`}>
                            <div className="bg-gray-300 h-40 rounded-lg mb-4"></div>
                            <div className="bg-gray-300 h-4 rounded mb-2"></div>
                            <div className="bg-gray-300 h-3 rounded mb-2"></div>
                            <div className="bg-gray-300 h-3 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className={`app-container ${theme} p-4 sm:p-6`}>
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">❌</div>
                    <h2 className={`text-color ${theme} text-xl font-semibold mb-2`}>Error Loading Courses</h2>
                    <p className={`fade-color ${theme}`}>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`app-container ${theme} p-4 sm:p-6 relative`}>
            {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
            
            <div className="mb-6">
                <h1 className={`text-color ${theme} text-2xl sm:text-3xl font-bold mb-2`}>
                    🎉 Completed Courses
                </h1>
                <p className={`fade-color ${theme} text-sm sm:text-base`}>
                    Congratulations on your achievements! Here are all the courses you've successfully completed.
                </p>
            </div>
            
            {completedCourses.length > 0 ? (
                <>
                    {/* Achievement Banner */}
                    <div className={`field-color ${theme} rounded-lg p-4 sm:p-6 mb-6 border-l-4 border-green-500`}>
                        <div className="flex items-center gap-3">
                            <div className="text-3xl">🏆</div>
                            <div>
                                <h3 className={`text-color ${theme} font-semibold text-lg`}>
                                    Amazing Progress!
                                </h3>
                                <p className={`fade-color ${theme} text-sm`}>
                                    You've completed {completedCourses.length} course{completedCourses.length !== 1 ? 's' : ''}. Keep up the great work!
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Courses Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {completedCourses.map(course => (
                            <div key={course._id} className="relative">
                                <CourseCard course={course} user={user} />
                                {/* Completion Badge */}
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-lg">
                                    <div className="w-6 h-6 flex items-center justify-center">
                                        ✓
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className={`field-color ${theme} rounded-lg p-8 sm:p-12 text-center`}>
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className={`text-color ${theme} text-xl font-semibold mb-2`}>
                        No Completed Courses Yet
                    </h3>
                    <p className={`fade-color ${theme} mb-6`}>
                        Start learning and complete your first course to see it here!
                    </p>
                    <button
                        onClick={() => window.location.href = '/home'}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Browse Courses
                    </button>
                </div>
            )}
        </div>
    );
}
