import { Link, useLocation } from "react-router-dom"
import { studentCourseData } from "./pageData"
import { useTheme } from "./ThemeContext";

export function StudentSidebar() {
  const {theme} = useTheme();
  const location = useLocation();
    return (
      <div className={`app-container ${theme} flex flex-col justify-start bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-4 gap-3 shadow-2xl rounded-2xl md:visible invisible md:w-[240px] min-h-screen border border-gray-200/20 dark:border-gray-700/20`}>
      
      {/* Student Sidebar Header */}
      <div className="mb-6 pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">S</span>
          </div>
          <div>
            <h3 className="font-bold text-sm bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Student Panel</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Learn & Grow</p>
          </div>
        </div>
      </div>
    {studentCourseData.map((page, index) => {
      const isActive = location.pathname === page.path;
      return (
        <Link
          to={page.path}
          key={index}
          className={`group relative flex p-4 w-full rounded-xl transition-all duration-300 ${
            isActive 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105' 
              : 'hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:shadow-md hover:transform hover:scale-102'
          }`}
        >
        <div className="flex gap-3 items-center w-full">
            <span className={`text-lg ${isActive ? 'text-white' : 'text-green-500 group-hover:scale-110'} transition-all duration-200`}>{page.icon}</span>
            <span className="text-sm font-semibold flex-1">{page.name}</span>
            {isActive && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
          </div>
          {!isActive && <div className="absolute left-0 top-0 w-0 h-full bg-gradient-to-b from-green-500 to-emerald-500 rounded-l-xl group-hover:w-1 transition-all duration-300"></div>}
        </Link>
      );
    })}
  </div>
    )
}