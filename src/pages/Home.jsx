import { getCourses } from "../api"
import { useState, useEffect } from "react"
import { CourseCard } from "../components/CourseCard"
import { useTheme } from "../components/ThemeContext"

export function Home(){
    const [courses, setCourses] = useState([])
    const { theme } = useTheme();
    
    useEffect(() => {
        async function loadAllPosts(){
            const data = await getCourses()
            //order the courses by date created
            data.sort((d1, d2) => new Date(d2.dateCreated).getTime() - new Date(d1.dateCreated).getTime())
                setCourses(data)
        }
        loadAllPosts()
    }, [])
    return(
        <div className={`app-container ${theme} flex justify-between items-center w-full dark:bg-gray-800 dark:text-white`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 
        lg:grid-cols-3 w-full items-center">
            {courses.map((course) =>{
                return(
                    <CourseCard course={course}/>  
                )
            })}
        </div>
        </div>
    )
}