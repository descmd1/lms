import { Link, useLocation } from "react-router-dom"
import { studentCourseData } from "./pageData"
import { useTheme } from "./ThemeContext";

export function StudentSidebar() {
  const {theme} = useTheme();
  const location = useLocation();
    return (
      <div className={` app-container ${theme} flex flex-col items-center justify-start p-3 gap-4 
      shadow-md rounded-md md:visible invisible md:w-[220px] min-h-screen`}>
    {studentCourseData.map((page, index) => {
      const isActive = location.pathname === page.path;
      return (
        <Link
          to={page.path}
          key={index}
          className={`flex p-2 shadow-sm w-full h-16 rounded-sm transition-all duration-200 ${
            isActive 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'hover:bg-gray-100 hover:text-blue-500 hover:animate-pulse'
          }`}
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