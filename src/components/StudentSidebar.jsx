import { Link } from "react-router-dom"
import { studentCourseData } from "./pageData"

export function StudentSidebar() {
    return (
        <div className="flex flex-col items-center justify-start bg-white p-3 gap-4 
        rounded-md md:visible invisible md:w-[220px] min-h-screen ">
    {studentCourseData.map((page, index) => {
      return (
        <Link
          to={page.path}
          key={index}
          className="flex p-2 shadow-sm w-full hover:bg-gray-100 hover:text-blue-500 h-16 hover:animate-pulse rounded-sm"
        >
        <div className="flex gap-2 items-center ">
            <span>{page.icon}</span>
          <button className="text-sm font-semibold">{page.name}</button>
          </div>
        </Link>
      );
    })}
  </div>
    )
}