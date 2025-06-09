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
       <div className={`app-container ${theme} w-full`}>
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full p-3">
    {courses.map((course, index) => (
      <CourseCard key={index} course={course} />
    ))}
  </div>
</div>

    )
}