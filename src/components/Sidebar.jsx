import { useState } from "react";
import { Link } from "react-router-dom"
import { sidebarData, managecourseData, dashboardData } from "./pageData"

export function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };
    return (
        <div className="flex flex-col items-center justify-start bg-white p-3 gap-4 
        rounded-md md:visible invisible md:w-[220px] min-h-screen ">
{dashboardData.map((page, index) => {
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
 {managecourseData.map((item, index) => (
  <div key={index} className="w-full">
    <div 
      onClick={toggleDropdown} 
      className="flex justify-between items-center p-2 shadow-sm hover:bg-gray-100 hover:text-blue-500 h-16  hover:animate-pulse rounded-md cursor-pointer transition-all duration-300 ease-in-out"
    >
      <div className="flex gap-3 items-center">
        <span>{item.icon}</span>
        <span className="text-sm font-semibold">{item.name}</span>
      </div>
    </div>
    
    {isOpen && item.subItems && (
      <ul className="ml-8 mt-2 flex flex-col space-y-2">
        {item.subItems.map((subItem, subIndex) => (
          <li key={subIndex}>
            <Link to={subItem.path} className="flex gap-3 items-center p-2 hover:bg-gray-100 hover:text-blue-500 rounded-md transition-all duration-300 ease-in-out">
              <span className="text-base font-medium">{subItem.name}</span>
              <span className="text-base font-medium">{subItem.icon}</span>
            </Link>
          </li>
        ))}
      </ul>
    )}
  </div>
))}

    {sidebarData.map((page, index) => {
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