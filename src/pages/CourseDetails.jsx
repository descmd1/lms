import { useEffect, useState } from "react";
import { getCourse } from "../api";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaPencil } from "react-icons/fa6";
import { Comments } from "../components/Comments";
import * as jwt_decode from "jwt-decode";
import { AllComments } from "../components/AllComments";
import { useTheme } from "../components/ThemeContext";


export function CourseDetails() {
  const [course, setCourse] = useState({});
  const [role, setRole] = useState(""); 
  const params = useParams();
  const navigate = useNavigate();
  let id = params.id;
  const {theme} = useTheme()

  useEffect(() => {
    async function loadCourse() {
      let data = await getCourse(id);
      let date = new Date(data.dateCreated);
      data.dateCreated = date.toString();
      setCourse(data);
    }
    function getUserRole() {
      const token = sessionStorage.getItem("user");
      if (token) {
        try {
         const decodedToken = jwt_decode.jwtDecode(token);
          setRole(decodedToken.role); 
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
    }

    loadCourse();
    getUserRole();
  }, [id]);

  return (
    <div className={` app-container ${theme} flex flex-col justify-center items-center gap-4 
    shadow-md rounded-md p-4 w-full`}>
      {/* Back Button */}
      <div className="flex justify-between items-center w-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-start text-blue-400 font-medium cursor-pointer"
        >
          Back
        </button>

        {/* Show Edit Button only if the role is "tutor" */}
        {role === "tutor" && (
          <Link to={`/editcourse/${course._id}`} className="flex items-center gap-1">
            <FaPencil size={12} />
            <p className="text-blue-500 font-medium">Edit</p>
          </Link>
        )}
      </div>

      {/* Course Content */}
      <div className="flex flex-col w-full shadow-sm justify-center items-center gap-2">
        <h1 className={`font-bold text-blue-400`}>{course.title}</h1>
        <p className={`text-sm`}>{course.description}</p>

        {/* Display Chapters */}
        {course.chapters && course.chapters.length > 0 && (
          <div className="w-full mt-4">
            <h2 className={`text-xl font-semibold`}>Chapters</h2>
            <ul className="mt-2">
              {course.chapters.map((chapter, index) => (
                <li key={index} className="border-b py-2 shadow-md px-2">
                  <h3 className={`text-lg font-medium`}>{chapter.title}</h3>
                  <p className={`text-sm`}>{chapter.content}</p>
                  {chapter.video ? (
                    <video controls className="w-full mt-2">
                      <source src={chapter.video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <p className="text-red-500">No video available for this chapter.</p>
                  )}
                  <h3 className={`text-sm font-semibold`}>
                    Created on {new Date(course.dateCreated).toLocaleDateString()}
                  </h3>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Comments courseId={course._id} />
        <AllComments courseId={course._id}/>
      </div>
    </div>
  );
}
