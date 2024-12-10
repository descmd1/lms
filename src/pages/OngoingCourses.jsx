import { useEffect, useState } from 'react';
import axios from 'axios';
import { CourseCard } from '../components/CourseCard';

export function OngoingCourses({ user }) {
    const [ongoingCourses, setOngoingCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOngoingCourses = async () => {
            const token = sessionStorage.getItem("user");

            try {
                const response = await axios.get(`http://localhost:5001/ongoingcourses`, {
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

    if (loading) return <p>Loading ongoing courses...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="grid grid-cols-4 gap-4">
            {ongoingCourses.length > 0 ? (
                ongoingCourses.map(course => (
                    <CourseCard key={course._id} course={course} user={user} />
                ))
            ) : (
                <p>No ongoing courses found.</p>
            )}
        </div>
    );
}
