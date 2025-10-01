import { getCourses } from "../api"
import { useState, useEffect } from "react"
import { CourseCard } from "../components/CourseCard"
import { useTheme } from "../components/ThemeContext"

export function Home(){
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { theme } = useTheme();
    
    useEffect(() => {
        async function loadAllPosts(){
            try {
                setLoading(true)
                const data = await getCourses()
                if (data) {
                    //order the courses by date created
                    data.sort((d1, d2) => new Date(d2.dateCreated).getTime() - new Date(d1.dateCreated).getTime())
                    setCourses(data)
                } else {
                    setCourses([])
                }
            } catch (err) {
                console.error('Error loading courses:', err)
                setError('Failed to load courses. Please try again later.')
            } finally {
                setLoading(false)
            }
        }
        loadAllPosts()
    }, [])

    if (loading) {
        return (
            <div className={`app-container ${theme} w-full min-h-screen`}>
                <div className="container mx-auto px-4 sm:px-6 py-6">
                    {/* Header Skeleton */}
                    <div className="mb-8">
                        <div className="bg-gray-300 h-8 w-64 rounded mb-2 animate-pulse"></div>
                        <div className="bg-gray-300 h-4 w-96 rounded animate-pulse"></div>
                    </div>
                    
                    {/* Course Grid Skeleton */}
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
            </div>
        )
    }

    if (error) {
        return (
            <div className={`app-container ${theme} w-full min-h-screen`}>
                <div className="container mx-auto px-4 sm:px-6 py-6">
                    <div className="text-center py-12">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className={`text-color ${theme} text-xl font-semibold mb-2`}>Unable to Load Courses</h2>
                        <p className={`fade-color ${theme} mb-6`}>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return(
        <div className={`app-container ${theme} w-full min-h-screen`}>
            <div className="container mx-auto px-4 sm:px-6 py-6">
                {/* Welcome Header */}
                <div className="mb-8">
                    <div className="text-center mb-6">
                        <h1 className={`text-color ${theme} text-3xl sm:text-4xl font-bold mb-3`}>
                            🎓 Welcome to Your Learning Journey
                        </h1>
                        <p className={`fade-color ${theme} text-lg max-w-2xl mx-auto`}>
                            Discover amazing courses and expand your knowledge with expert-led content
                        </p>
                    </div>
                </div>

                {/* Courses Section */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className={`text-color ${theme} text-2xl sm:text-3xl font-bold mb-2`}>
                                📚 Courses You Might Be Interested In
                            </h2>
                            <p className={`fade-color ${theme} text-sm sm:text-base`}>
                                {courses.length > 0 
                                    ? `Explore ${courses.length} available course${courses.length !== 1 ? 's' : ''} and start learning today`
                                    : 'New courses are being added regularly'
                                }
                            </p>
                        </div>
                        {courses.length > 0 && (
                            <div className={`fade-color ${theme} text-sm hidden sm:block`}>
                                Showing latest courses
                            </div>
                        )}
                    </div>
                </div>

                {courses.length > 0 ? (
                    <>
                        {/* Featured Course Banner (First Course) */}
                        {courses[0] && (
                            <div className={`field-color ${theme} rounded-lg p-6 mb-8 border-l-4 border-blue-500`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="text-2xl">⭐</div>
                                    <h3 className={`text-color ${theme} font-semibold text-lg`}>
                                        Featured Course
                                    </h3>
                                </div>
                                <h4 className={`text-color ${theme} font-bold text-xl mb-2`}>
                                    {courses[0].title}
                                </h4>
                                <p className={`fade-color ${theme} text-sm mb-3 line-clamp-2`}>
                                    {courses[0].description}
                                </p>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className={`fade-color ${theme}`}>
                                        💰 ${courses[0].price ? `$${courses[0].price}` : 'Free'}
                                    </span>
                                    <span className={`fade-color ${theme}`}>
                                        ⏱️ {courses[0].duration || 'Self-paced'}
                                    </span>
                                    <span className={`fade-color ${theme}`}>
                                        📂 {courses[0].category || 'General'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* All Courses Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {courses.map((course, index) => (
                                <div key={course._id || index} className="relative group">
                                    <CourseCard course={course} />
                                    {index === 0 && (
                                        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full p-1 shadow-lg">
                                            <div className="w-6 h-6 flex items-center justify-center text-xs font-bold">
                                                ⭐
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Course Statistics */}
                        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className={`field-color ${theme} rounded-lg p-4 text-center`}>
                                <div className="text-2xl mb-2">📖</div>
                                <div className={`text-color ${theme} text-xl font-bold`}>
                                    {courses.length}
                                </div>
                                <div className={`fade-color ${theme} text-sm`}>
                                    Available Courses
                                </div>
                            </div>
                            <div className={`field-color ${theme} rounded-lg p-4 text-center`}>
                                <div className="text-2xl mb-2">🎯</div>
                                <div className={`text-color ${theme} text-xl font-bold`}>
                                    {new Set(courses.map(c => c.category)).size}
                                </div>
                                <div className={`fade-color ${theme} text-sm`}>
                                    Categories
                                </div>
                            </div>
                            <div className={`field-color ${theme} rounded-lg p-4 text-center`}>
                                <div className="text-2xl mb-2">🆓</div>
                                <div className={`text-color ${theme} text-xl font-bold`}>
                                    {courses.filter(c => !c.price || c.price === '0').length}
                                </div>
                                <div className={`fade-color ${theme} text-sm`}>
                                    Free Courses
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className={`field-color ${theme} rounded-lg p-8 sm:p-12 text-center`}>
                        <div className="text-6xl mb-4">🚀</div>
                        <h3 className={`text-color ${theme} text-xl font-semibold mb-2`}>
                            Coming Soon!
                        </h3>
                        <p className={`fade-color ${theme} mb-6`}>
                            We're preparing amazing courses for you. Check back soon for exciting learning opportunities!
                        </p>
                        <div className="flex justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Refresh Page
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}