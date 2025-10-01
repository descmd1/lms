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
        <div className={` app-container ${theme} flex flex-col items-center justify-start bg-white p-3 gap-4 
        shadow-md rounded-md md:visible invisible md:w-[220px] min-h-screen dark:bg-black dark:shadow-2xl`}>
{dashboardData.map((page, index) => {
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
 {managecourseData.map((item, index) => {
    // Check if any sub-item is active
    const hasActiveSubItem = item.subItems && item.subItems.some(subItem => location.pathname === subItem.path);
    
    return (
  <div key={index} className="w-full">
    <div 
      onClick={toggleDropdown} 
      className={`flex justify-between items-center p-2 shadow-sm h-16 rounded-md cursor-pointer transition-all duration-300 ease-in-out ${
        hasActiveSubItem 
          ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-500' 
          : 'hover:bg-gray-100 hover:text-blue-500 hover:animate-pulse'
      }`}
    >
      <div className="flex gap-3 items-center">
        <span>{item.icon}</span>
        <span className="text-sm font-semibold">{item.name}</span>
      </div>
    </div>
    
    {(isOpen || hasActiveSubItem) && item.subItems && (
      <ul className="ml-8 mt-2 flex flex-col space-y-2">
        {item.subItems.map((subItem, subIndex) => {
          const isSubActive = location.pathname === subItem.path;
          return (
            <li key={subIndex}>
              <Link 
                to={subItem.path} 
                className={`flex gap-3 items-center p-2 rounded-md transition-all duration-300 ease-in-out ${
                  isSubActive 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'hover:bg-gray-100 hover:text-blue-500'
                }`}
              >
                <span className="text-base font-medium">{subItem.name}</span>
                <span className="text-base font-medium">{subItem.icon}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    )}
  </div>
    );
  })}

    {sidebarData.map((page, index) => {
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