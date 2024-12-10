import { useEffect, useState } from 'react';
import axios from 'axios';
import { CourseCard } from '../components/CourseCard'; 
import * as jwt_decode from "jwt-decode";

export function EnrolledCourses() {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {enrolledCourses.length > 0 ? (
                enrolledCourses.map(course => (
                    <CourseCard key={course._id} course={course} />
                ))
            ) : (
                <p>No enrolled courses found.</p>
            )}
        </div>
    );
}
