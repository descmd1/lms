import { FaPencil } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as jwt_decode from "jwt-decode"; // Import jwt-decode
import { useTheme } from './ThemeContext';

const base_url = process.env.REACT_APP_BASE_URL;

export function CourseCard({ course, isEnrolled }) { 
    let date = new Date(course?.dateCreated);
    let stringDate = date.toString();
    const navigate = useNavigate();
    const { theme } = useTheme()

    // Retrieve and decode the token
    const token = sessionStorage.getItem("user");
    const decodedUser = token ? jwt_decode.jwtDecode(token) : null;
    const userRole = decodedUser?.role;
    
    // Debug: Log the decoded user to see what's available
    console.log('Decoded user object:', decodedUser);

    const handleBuyCourse = async () => {
        if (token) {
            try {
                console.log('Initiating payment for course:', course?._id);
                console.log('User details:', { email: decodedUser?.email, userId: decodedUser?._id });
                console.log('Course price:', course.price);
                
                // Validate email before sending
                if (!decodedUser?.email) {
                    alert('User email not found. Please log in again.');
                    return;
                }
                
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(decodedUser.email)) {
                    alert('Invalid email format. Please update your profile with a valid email.');
                    return;
                }
                
                const response = await axios.post(`${base_url}/buycourse`, {
                    amount: parseInt(course.price), // Backend will get email and userId from token
                    courseId: course?._id
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data.paymentLink) {
                    console.log('Payment link received:', response.data.paymentLink);
                    window.location.href = response.data.paymentLink;
                } else {
                    console.error('No payment link received in response');
                    alert('Failed to initialize payment. Please try again.');
                }
            } catch (error) {
                console.error('Failed to initialize payment:', error);
                console.error('Error response:', error.response?.data);
                alert(`Payment failed: ${error.response?.data?.error || error.message}`);
            }
        } else {
            alert('Please log in to purchase this course.');
        }
    };

    const handleCompleteCourse = async () => {
        try {
            await axios.post(
                `${base_url}/completecourse`,
                { courseId: course._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Course completed!");
        } catch (error) {
            console.error('Error completing course:', error);
        }
    };

    return (
        <div className={`app-container card-hover ${theme} w-full max-w-sm mx-auto shadow-lg 
         p-2 sm:p-3 rounded-md transition-all duration-300 hover:shadow-xl`}>
            <Link to={`/coursedetails/${course?._id}`}>
                <img src={course?.image} className='w-full h-28 sm:h-32 object-cover rounded-md' alt="course banner" />
                <h1 className={`text-color ${theme} font-bold text-blue-400 text-sm sm:text-base line-clamp-2 mt-1.5`}>{course?.title}</h1>
                <p className={`fade-color ${theme} text-gray-500 text-xs line-clamp-2 mt-0.5 leading-relaxed`}>{course?.description}</p>

                {course?.chapters && course.chapters.length > 0 && (
                    <p className={`fade-gray-color ${theme} text-xs text-gray-600 mt-0.5`}>{course.chapters.length} chapters available</p>
                )}

                <div className='flex justify-between items-center mt-1'>
                    <h3 className={`text-color ${theme} text-green-400 font-semibold text-sm`}>${course?.price}</h3>
                    <p className='font-medium text-xs text-gray-600'>{course?.duration}</p>
                </div>
            </Link>

            <div className='flex justify-between items-center mt-1'>
                <h3 className={`fade-gray-color ${theme} text-xs font-light`}>{stringDate?.slice(4, 15)}</h3>
                {/* Show Edit button only for tutors */}
                {userRole === "tutor" && (
                    <Link to={`/editcourse/${course._id}`} className="p-1 hover:bg-gray-100 rounded">
                        <FaPencil size={12} className="text-gray-600 hover:text-blue-500" />
                    </Link>
                )}
            </div>

            {/* Change button text based on enrollment status */}
            {isEnrolled ? (
                <button
                    className='flex bg-gray-400 text-white w-full items-center justify-center mt-2 py-1.5 px-3 rounded-md cursor-not-allowed text-sm transition-all duration-300'
                    disabled
                >
                    Enrolled
                </button>
            ) : (
                <button
                    className={`button-color ${theme} flex bg-blue-400 text-white w-full items-center justify-center mt-2 py-1.5 px-3 rounded-md hover:bg-blue-500 transition-all duration-300 text-sm font-medium`}
                    onClick={handleBuyCourse}
                >
                    Buy Course
                </button>
            )}

            {/* Show Complete button only for ongoing courses */}
            {course.status === 'ongoing' && (
                <button
                    className='mt-1.5 bg-green-400 text-white w-full flex items-center justify-center py-1.5 px-3 rounded-md hover:bg-green-500 transition-all duration-300 text-sm font-medium'
                    onClick={handleCompleteCourse}
                >
                    Complete Course
                </button>
            )}
        </div>
    );
}
