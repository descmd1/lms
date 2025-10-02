import { CourseCard } from "../components/CourseCard"
import { useState, useEffect } from "react"
import { getCourses } from '../api'
import * as jwt_decode from "jwt-decode"
import { useTheme } from "../components/ThemeContext"
import { Link } from "react-router-dom"
import { FaUser, FaEnvelope, FaCalendar, FaGraduationCap, FaEdit, FaCog, FaBook, FaUsers, FaTrophy, FaStar } from 'react-icons/fa'

export function Profile(){
    const [courses, setCourses] = useState([])
    const [user, setUser] = useState({})
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalEnrollments: 0,
        completedCourses: 0,
        avgRating: 0
    })
    const { theme } = useTheme();

    useEffect(() => {
        async function loadUserData(){
            try {
                setLoading(true)
                const token = sessionStorage.getItem("user")
                if (token) {
                    const decodedUser = jwt_decode.jwtDecode(token)
                    const allCourses = await getCourses()
                    const filteredCourses = allCourses.filter((course) => course.author === decodedUser._id)
                    
                    // Calculate stats
                    const totalEnrollments = filteredCourses.reduce((total, course) => 
                        total + (course.enrolledUsers ? course.enrolledUsers.length : 0), 0
                    )
                    
                    const completedCourses = filteredCourses.filter(course => course.published).length
                    
                    setCourses(filteredCourses)
                    setUser(decodedUser)
                    setStats({
                        totalCourses: filteredCourses.length,
                        totalEnrollments,
                        completedCourses,
                        avgRating: 4.8 // Placeholder for now
                    })
                }
            } catch (error) {
                console.error("Error loading profile data:", error)
            } finally {
                setLoading(false)
            }
        }
        loadUserData()
    }, [])

    if (loading) {
        return (
            <div className={`app-container ${theme} min-h-screen flex items-center justify-center`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        )
    }

    return(
        <div className={`app-container ${theme} min-h-screen pt-4 sm:pt-6 md:pt-8 pb-8`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Profile Header Section */}
                <div className={`field-color ${theme} rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 shadow-lg border`}>
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">
                        
                        {/* Profile Image */}
                        <div className="relative">
                            <img 
                                src={user.profileImage || '/default-avatar.png'} 
                                alt="Profile" 
                                className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                                onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=3b82f6&color=fff&size=160`
                                }}
                            />
                            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-lg">
                                <FaUser className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 text-center lg:text-left">
                            <div className="mb-4">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{user.name}</h1>
                                <p className="text-blue-600 font-semibold text-lg capitalize">
                                    {user.role === 'tutor' ? '🎓 Instructor' : '📚 Student'}
                                </p>
                            </div>

                            {/* User Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center justify-center lg:justify-start gap-3">
                                    <FaEnvelope className="text-blue-500 text-lg" />
                                    <span className="text-gray-600 text-sm sm:text-base">{user.email}</span>
                                </div>
                                <div className="flex items-center justify-center lg:justify-start gap-3">
                                    <FaCalendar className="text-blue-500 text-lg" />
                                    <span className="text-gray-600 text-sm sm:text-base">
                                        Joined {user?.joinDate ? new Date(user.joinDate).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long',
                                            day: 'numeric'
                                        }) : 'Recently'}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                                <Link 
                                    to={`/profileupdate/${user._id}`}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shadow-md"
                                >
                                    <FaEdit className="w-4 h-4" />
                                    Edit Profile
                                </Link>
                                <Link 
                                    to="/settings"
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shadow-md"
                                >
                                    <FaCog className="w-4 h-4" />
                                    Settings
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section for Tutors */}
                {user.role === 'tutor' && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
                        <div className={`field-color ${theme} p-4 sm:p-6 rounded-xl text-center shadow-md border`}>
                            <FaBook className="text-blue-500 text-2xl sm:text-3xl mx-auto mb-2" />
                            <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.totalCourses}</div>
                            <div className="text-gray-600 text-sm sm:text-base">Total Courses</div>
                        </div>
                        <div className={`field-color ${theme} p-4 sm:p-6 rounded-xl text-center shadow-md border`}>
                            <FaUsers className="text-green-500 text-2xl sm:text-3xl mx-auto mb-2" />
                            <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.totalEnrollments}</div>
                            <div className="text-gray-600 text-sm sm:text-base">Total Students</div>
                        </div>
                        <div className={`field-color ${theme} p-4 sm:p-6 rounded-xl text-center shadow-md border`}>
                            <FaTrophy className="text-yellow-500 text-2xl sm:text-3xl mx-auto mb-2" />
                            <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.completedCourses}</div>
                            <div className="text-gray-600 text-sm sm:text-base">Published</div>
                        </div>
                        <div className={`field-color ${theme} p-4 sm:p-6 rounded-xl text-center shadow-md border`}>
                            <FaStar className="text-orange-500 text-2xl sm:text-3xl mx-auto mb-2" />
                            <div className="text-2xl sm:text-3xl font-bold text-orange-600">{stats.avgRating}</div>
                            <div className="text-gray-600 text-sm sm:text-base">Avg Rating</div>
                        </div>
                    </div>
                )}

                {/* Courses Section */}
                {user.role === 'tutor' && courses.length > 0 && (
                    <div className={`field-color ${theme} rounded-2xl p-6 sm:p-8 shadow-lg border`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold mb-2">My Courses</h2>
                                <p className="text-gray-600">Courses you've created and published</p>
                            </div>
                            <Link 
                                to="/createcourse"
                                className="mt-4 sm:mt-0 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md"
                            >
                                <FaGraduationCap className="w-4 h-4" />
                                Create New Course
                            </Link>
                        </div>

                        {/* Courses Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course) => (
                                <div key={course._id} className="transform hover:scale-105 transition-transform duration-200">
                                    <CourseCard course={course} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State for No Courses */}
                {user.role === 'tutor' && courses.length === 0 && (
                    <div className={`field-color ${theme} rounded-2xl p-8 sm:p-12 text-center shadow-lg border`}>
                        <FaGraduationCap className="text-gray-400 text-6xl sm:text-8xl mx-auto mb-6" />
                        <h3 className="text-xl sm:text-2xl font-bold mb-4">No Courses Yet</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Start sharing your knowledge with the world by creating your first course.
                        </p>
                        <Link 
                            to="/createcourse"
                            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg inline-flex items-center gap-2 transition-colors duration-200 shadow-md text-lg"
                        >
                            <FaGraduationCap className="w-5 h-5" />
                            Create Your First Course
                        </Link>
                    </div>
                )}

                {/* Student Profile Content */}
                {user.role === 'student' && (
                    <div className={`field-color ${theme} rounded-2xl p-6 sm:p-8 shadow-lg border text-center`}>
                        <FaGraduationCap className="text-blue-500 text-6xl sm:text-8xl mx-auto mb-6" />
                        <h3 className="text-xl sm:text-2xl font-bold mb-4">Welcome to Your Learning Journey!</h3>
                        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                            Explore courses, track your progress, and achieve your learning goals. Your educational adventure starts here.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link 
                                to="/home"
                                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg inline-flex items-center justify-center gap-2 transition-colors duration-200 shadow-md"
                            >
                                <FaBook className="w-4 h-4" />
                                Browse Courses
                            </Link>
                            <Link 
                                to="/enrolled"
                                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg inline-flex items-center justify-center gap-2 transition-colors duration-200 shadow-md"
                            >
                                <FaUsers className="w-4 h-4" />
                                My Enrollments
                            </Link>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}