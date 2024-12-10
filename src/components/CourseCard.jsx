// import { FaPencil } from 'react-icons/fa6'
// import { Link} from 'react-router-dom'

// export function CourseCard({course}) {

//     let date = new Date(course?.dateCreated)
//     let stringDate = date.toString()

//     return (
//     <div className='w-[250px] bg-white shadow-sm border p-3 hover:bg-gray-100 rounded-md'>
//         <Link to={`/coursedetails/${course?._id}`}>
//             <img src={course.image} className='w-full h-40 border'/>
//             <h1 className='font-bold text-blue-400'>{course?.title}</h1>
//             <p className='truncate text-gray-500'>{course?.description}</p>
//             <div className='flex justify-between'>
//             <h3 className='text-green-400'>${course.price}</h3>
//             <p className='font-md text-sm'>{course.duration}</p>
//             </div>
//             </Link>
//             <div className='flex justify-between items-center'>
//             <h3 className='text-sm fornt-light'>{stringDate?.slice(4, 15)}</h3>
//             <Link to={`/editcourse/${course._id}`}> <p><FaPencil size={8}/></p> </Link>
//             </div>
//             <button className='flex bg-blue-400 text-white w-full 
//             items-center justify-center mt-3 rounded-md hover:bg-purple-300 hover:text-black'>
//                 Buy Course
//                 </button>
//             </div>
        
//     )
// }


// import { FaPencil } from 'react-icons/fa6';
// import { Link } from 'react-router-dom';

// export function CourseCard({ course }) {
//     let date = new Date(course?.dateCreated);
//     let stringDate = date.toString();

//     return (
//         <div className='w-[250px] bg-white shadow-sm border p-3 hover:bg-gray-100 rounded-md mb-4'>
//             <Link to={`/coursedetails/${course?._id}`}>
//                 <img src={course.image} className='w-full h-40 border' alt="course banner" />
//                 <h1 className='font-bold text-blue-400'>{course?.title}</h1>
//                 <p className='truncate text-gray-500'>{course?.description}</p>

//                 {/* Display chapter count if available */}
//                 {course?.chapters && course.chapters.length > 0 && (
//                     <p className='text-sm text-gray-600'>{course.chapters.length} chapters available</p>
//                 )}

//                 <div className='flex justify-between'>
//                     <h3 className='text-green-400'>${course.price}</h3>
//                     <p className='font-md text-sm'>{course.duration}</p>
//                 </div>
//             </Link>

//             <div className='flex justify-between items-center'>
//                 <h3 className='text-sm font-light'>{stringDate?.slice(4, 15)}</h3>
//                 <Link to={`/editcourse/${course._id}`}>
//                     <p><FaPencil size={8} /></p>
//                 </Link>
//             </div>

//             <button className='flex bg-blue-400 text-white w-full items-center justify-center mt-3 rounded-md hover:bg-purple-300 hover:text-black'>
//                 Buy Course
//             </button>
//         </div>
//     );
// }



import { FaPencil } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as jwt_decode from "jwt-decode";

export function CourseCard({ course, user }) {
    let date = new Date(course?.dateCreated);
    let stringDate = date.toString();
    const navigate = useNavigate();

    const handleBuyCourse = async () => {
        const token = sessionStorage.getItem("user");
        if (token) {
            const decodedUser = jwt_decode.jwtDecode(token);
            try {
                // Prepare data for the request
                const response = await axios.post('http://localhost:5001/buycourse', {
                    email: decodedUser?.email, // User's email
                    amount: parseInt(course.price) * 100, // Convert to kobo
                    courseId: course?._id, // Course ID
                    userId: decodedUser?._id // User ID
                });

                // Redirect to Paystack payment page
                if (response.data.paymentLink) {
                    // This will redirect the user to the Paystack payment page
                    window.location.href = response.data.paymentLink;
                }
            } catch (error) {
                console.error('Failed to initialize payment:', error);
            }
        }
    };


    const handleCompleteCourse = async () => {
        const token = sessionStorage.getItem("user");

        try {
            await axios.post(
                `http://localhost:5001/completecourse`,
                { courseId: course._id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert("Course completed!");
        } catch (error) {
            console.error('Error completing course:', error);
        }
    };

    return (
        <div className='w-[250px] bg-white shadow-sm border p-3 hover:bg-gray-100 rounded-md mb-4'>
            <Link to={`/coursedetails/${course?._id}`}>
                <img src={course.image} className='w-full h-40 border' alt="course banner" />
                <h1 className='font-bold text-blue-400'>{course?.title}</h1>
                <p className='truncate text-gray-500'>{course?.description}</p>

                {course?.chapters && course.chapters.length > 0 && (
                    <p className='text-sm text-gray-600'>{course.chapters.length} chapters available</p>
                )}

                <div className='flex justify-between'>
                    <h3 className='text-green-400'>${course.price}</h3>
                    <p className='font-md text-sm'>{course.duration}</p>
                </div>
            </Link>

            <div className='flex justify-between items-center'>
                <h3 className='text-sm font-light'>{stringDate?.slice(4, 15)}</h3>
                <Link to={`/editcourse/${course._id}`}>
                    <p><FaPencil size={8} /></p>
                </Link>
            </div>

            <button
                className='flex bg-blue-400 text-white w-full items-center justify-center mt-3 rounded-md hover:bg-purple-300 hover:text-black'
                onClick={handleBuyCourse}
            >
                Buy Course
            </button>
{/* Show Complete button only for ongoing courses */}
            {course.status === 'ongoing' && (
                <button onClick={handleCompleteCourse}>Complete Course</button>
            )}
        </div>
    );
}
