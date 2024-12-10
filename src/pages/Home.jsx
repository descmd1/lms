import { getCourses } from "../api"
import { useState, useEffect } from "react"
import { CourseCard } from "../components/CourseCard"

export function Home(){
    const [courses, setCourses] = useState([])
    
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
        <div className="flex justify-between items-center w-full">
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