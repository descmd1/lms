import { useState } from "react";
import { Link, useLocation } from "react-router-dom"
import { sidebarData, managecourseData, dashboardData } from "./pageData"
import { useTheme } from "./ThemeContext";

export function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const { theme } = useTheme();
    const location = useLocation();

    // Auto-open dropdown if any sub-item is active
    const hasActiveSubItem = managecourseData.some(item => 
        item.subItems && item.subItems.some(subItem => location.pathname === subItem.path)
    );

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };
    
    return (
        <div className={`app-container ${theme} flex flex-col justify-start bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-4 gap-3 shadow-2xl rounded-2xl md:visible invisible md:w-[240px] min-h-screen border border-gray-200/20 dark:border-gray-700/20`}>
        
        {/* Sidebar Header */}
        <div className="mb-6 pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">🎓 Tutor Panel</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manage & Create</p>
            </div>
          </div>
        </div>

        {/* Dashboard Section */}
        {dashboardData.map((page, index) => {
          const isActive = location.pathname === page.path;
          return (
            <Link
              to={page.path}
              key={index}
              className={`group relative flex p-4 w-full rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105' 
                  : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:shadow-md hover:transform hover:scale-102'
              }`}
            >
              <div className="flex gap-3 items-center w-full">
                <span className={`text-lg ${isActive ? 'text-white' : 'text-blue-500 group-hover:scale-110'} transition-all duration-200`}>{page.icon}</span>
                <span className={`text-sm font-semibold flex-1 ${isActive ? 'text-white' : 'text-black dark:text-gray-200'}`}>{page.name}</span>
                {isActive && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
              </div>
              {!isActive && <div className="absolute left-0 top-0 w-0 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-l-xl group-hover:w-1 transition-all duration-300"></div>}
            </Link>
          );
        })}

        {/* Course Management Section */}
        {managecourseData.map((item, index) => {
    // Check if any sub-item is active
    const hasActiveSubItem = item.subItems && item.subItems.some(subItem => location.pathname === subItem.path);
    
    return (
  <div key={index} className="w-full">
    <div 
      onClick={toggleDropdown} 
      className={`group relative flex justify-between items-center p-4 rounded-xl cursor-pointer transition-all duration-300 ${
        hasActiveSubItem 
          ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 shadow-md border-l-4 border-blue-500' 
          : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:shadow-md hover:transform hover:scale-102'
      }`}
    >
      <div className="flex gap-3 items-center">
        <span className={`text-lg ${hasActiveSubItem ? 'text-blue-500' : 'text-blue-500 group-hover:scale-110'} transition-all duration-200`}>{item.icon}</span>
        <span className={`text-sm font-semibold ${hasActiveSubItem ? 'text-blue-600 dark:text-blue-400' : 'text-black dark:text-gray-200'}`}>{item.name}</span>
      </div>
      <div className={`transform transition-transform duration-200 ${(isOpen || hasActiveSubItem) ? 'rotate-90' : ''}`}>
        <div className="w-2 h-2 border-r-2 border-b-2 border-current rotate-45"></div>
      </div>
    </div>
    
    {(isOpen || hasActiveSubItem) && item.subItems && (
      <ul className="ml-6 mt-2 flex flex-col space-y-1 border-l-2 border-blue-200 dark:border-blue-800 pl-4">
        {item.subItems.map((subItem, subIndex) => {
          const isSubActive = location.pathname === subItem.path;
          return (
            <li key={subIndex}>
              <Link 
                to={subItem.path} 
                className={`group relative flex gap-3 items-center p-3 rounded-lg transition-all duration-300 ${
                  isSubActive 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105' 
                    : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:shadow-md hover:transform hover:scale-102'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isSubActive ? 'bg-white' : 'bg-blue-400'} group-hover:scale-125 transition-all duration-200`}></div>
                <span className={`text-sm font-medium flex-1 ${isSubActive ? 'text-white' : 'text-black dark:text-gray-200'}`}>{subItem.name}</span>
                <span className={`text-sm ${isSubActive ? 'text-white' : 'text-blue-500 group-hover:scale-110'} transition-all duration-200`}>{subItem.icon}</span>
                {!isSubActive && <div className="absolute left-0 top-0 w-0 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-l-lg group-hover:w-1 transition-all duration-300"></div>}
              </Link>
            </li>
          );
        })}
      </ul>
    )}
          </div>
        );
      })}

      {/* Tools Section */}
      {sidebarData.map((page, index) => {
        const isActive = location.pathname === page.path;
        return (
          <Link
            to={page.path}
            key={index}
            className={`group relative flex p-4 w-full rounded-xl transition-all duration-300 ${
              isActive 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105' 
                : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:shadow-md hover:transform hover:scale-102'
            }`}
          >
            <div className="flex gap-3 items-center w-full">
              <span className={`text-lg ${isActive ? 'text-white' : 'text-blue-500 group-hover:scale-110'} transition-all duration-200`}>{page.icon}</span>
              <span className={`text-sm font-semibold flex-1 ${isActive ? 'text-white' : 'text-black dark:text-gray-200'}`}>{page.name}</span>
              {isActive && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
            </div>
            {!isActive && <div className="absolute left-0 top-0 w-0 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-l-xl group-hover:w-1 transition-all duration-300"></div>}
          </Link>
        );
      })}
    </div>
  );
}