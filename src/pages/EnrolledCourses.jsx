import { useEffect, useState } from 'react';
import axios from 'axios';
import { CourseCard } from '../components/CourseCard'; 
import * as jwt_decode from "jwt-decode";
import { useTheme } from '../components/ThemeContext';

export function EnrolledCourses() {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {theme} = useTheme()

    const fetchEnrolledCourses = async () => {
        const token = sessionStorage.getItem("user");
        if (token) {
            try {
                const decodedUser = jwt_decode.jwtDecode(token);  // Decode the token to get user info
                const userId = decodedUser?._id || decodedUser?.userId;  // Assuming the token has an "id" or "userId" field
                console.log('Decoded User ID:', userId);
                const response = await axios.get(`http://localhost:5001/enrolledcourses`, {
                    headers: {
                        Authorization: `Bearer ${token}`, 
                    },
                });

                console.log('Response Data:', response.data);
                setEnrolledCourses(response.data);
            } catch (error) {
                console.error('Failed to fetch enrolled courses:', error);
                setError('Failed to fetch enrolled courses');
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchEnrolledCourses();
    }, []);  // No dependency needed

    if (loading) return <p>Loading enrolled courses...</p>;
    if (error) return (
        <div>
            <p>{error}</p>
            <button onClick={fetchEnrolledCourses}>Retry</button>
        </div>
    );

    return (
        <div className={`app-container ${theme} flex flex-wrap gap-4 dark:bg-gray-800`}>
            {enrolledCourses.length > 0 ? (
                enrolledCourses.map(course => (
                    <CourseCard key={course.id} course={course} isEnrolled={true} />
                ))
            ) : (
                <p>No enrolled courses found.</p>
            )}
        </div>
    );
}
