import { useEffect, useState, useRef } from "react";
import { getCourse } from "../api";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaPencil } from 'react-icons/fa6';
import { Comments } from "../components/Comments";


export function CourseDetails() {
  const [course, setCourse] = useState({});
  const params = useParams();
  let id = params.id;
  const navigate = useNavigate();
  

  useEffect(() => {
    async function loadCourse() {
      let data = await getCourse(id);
      let date = new Date(data.dateCreated);
      data.dateCreated = date.toString();
      setCourse(data);
    }
    loadCourse();
  }, [id]);

  // Handle video playback and time updates here...
  return (
    <div className="flex flex-col justify-center items-center gap-4 bg-white shadow-md rounded-md p-4 w-full">
       <div className='flex justify-between items-center w-full'>
      <button onClick={() => navigate(-1)} className="flex items-start  text-blue-400 font-medium cursor-pointer">
        Back
      </button>
      <Link to={`/editcourse/${course._id}`}>
                    <p><FaPencil size={8} />edit</p>
                </Link>
                </div>
      <div className="flex flex-col w-full shadow-sm justify-center items-center gap-2">
        <h1 className="font-bold text-blue-400">{course.title}</h1>
        <p className="text-gray-500">{course.description}</p>
        
        {/* Display chapters (if available) */}
        {course.chapters && course.chapters.length > 0 && (
          <div className="w-full mt-4 ">
            <h2 className="text-xl font-semibold text-gray-700">Chapters</h2>
            <ul className="mt-2">
              {course.chapters.map((chapter, index) => (
                <li key={index} className="border-b py-2 shadow-md px-2">
                  <h3 className="text-lg font-medium text-gray-800">{chapter.title}</h3>
                  <p className="text-sm text-gray-600">{chapter.content}</p>
                  {/* Check if a video exists for the chapter */}
                  {chapter.video ? (
                    <video controls className="w-full mt-2">
                      <source src={chapter.video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <p className="text-red-500">No video available for this chapter.</p>
                  )}
                     <h3 className="text-gray-500 text-sm font-semibold">Created on {new Date(course.dateCreated).toLocaleDateString()}</h3>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Comments />
      </div>
    </div>
  );
}
