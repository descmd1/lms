import { useEffect, useState } from 'react';
import axios from 'axios';
import Confetti from 'react-confetti'; 
import { CourseCard } from '../components/CourseCard';
import { useTheme } from '../components/ThemeContext';

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
                const response = await axios.get(`http://localhost:5001/completedcourses`, {
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

    if (loading) return <p>Loading completed courses...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className={` app-container ${theme} relative`}>
            {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
            <div className="grid grid-cols-4 gap-4">
                {completedCourses.length > 0 ? (
                    <>
                        <h2>Congratulations! You've completed these courses:</h2>
                        {completedCourses.map(course => (
                            <CourseCard key={course._id} course={course} user={user} />
                        ))}
                    </>
                ) : (
                    <p>No completed courses found.</p>
                )}
            </div>
        </div>
    );
}
