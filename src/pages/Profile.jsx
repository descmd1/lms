import { CourseCard } from "../components/CourseCard"
import { useState, useEffect } from "react"
import { getCourses } from '../api'
import *as jwt_decode from "jwt-decode"

export function Profile(){
    const [courses, setCourses] =useState([])
    const [user, setUser] = useState({})

    useEffect(() => {
        async function loadUserData(course){
            const token = sessionStorage.getItem("user")
            const decodedUser = jwt_decode.jwtDecode(token)
            const allCourses = await getCourses()
            const filteredCourses = allCourses.filter((course) => course.author == decodedUser._id)
            console.log("Post author:", course?.author, "Decoded user ID:", decodedUser._id);

            setCourses(filteredCourses)
            setUser(decodedUser)
        }
        loadUserData()
    }, [])

    return(
        <div className="flex flex-col items-center justify-center gap-4 shadow-md w-3/4 bg-white rounded-md py-4 px-2 text">
            <img src={user.profileImage} alt="img" width={150} height={150} className="rounded-full object-cover bg-slate-50 border p-1 h-32 w-32"/>
            <div className="flex flex-col justify-center gap-4">
            <div className="flex w-full gap-4 items-center">
            <label className="text-sm font-semibold text-black">Name:</label>
            <h3 className="text-md font-semibold text-blue-400">{user.name}</h3>
            </div>
            <div className="flex w-full gap-4 items-center">
            <label className="text-sm font-semibold text-black">Email:</label>
            <h3 className="text-sm font-semibold text-gray-400">{user.email}</h3>
            </div>
            <div className="flex w-full gap-4 items-center">
            <label className="text-sm font-semibold text-black">Join Date:</label>
            <h3 className="text-sm font-semibold text-gray-400">{user?.joinDate?.slice(0, 10)}</h3>
            </div>
            </div>
            {courses.map((course) =>{
                return(
                    <CourseCard course={course}/>
                )
            })}
        </div>
    )
}