import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pageData, getProfileData, dashboardData, managecourseData, sidebarData, studentCourseData } from './pageData';
import { useNavigate, useParams } from 'react-router-dom';
import { BiMoon, BiSearch, BiSun } from 'react-icons/bi';
import * as jwt_decode from 'jwt-decode';
import { MdArrowDropDown } from 'react-icons/md';
import { FaBell } from 'react-icons/fa';
import { GetComments } from './GetComments';
import { useTheme } from "./ThemeContext";

export function Navbar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState({});
  const params = useParams();
  let courseId = params.id;
  const { theme, toggleTheme } = useTheme();
   const [isOpen, setIsOpen] = useState(false);

    const toggleDropdowns = () => {
        setIsOpen(!isOpen);
    };

  useEffect(() => {
    async function loadUserData() {
      const token = sessionStorage.getItem('user');
      const decodedUser = jwt_decode.jwtDecode(token);
      setUser(decodedUser);
    }
    loadUserData();
  }, []);

  const profileData = getProfileData(user);

  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);
  const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/');
  };

  const handleBellClick = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className={`app-container ${theme} flex justify-between items-center px-2 sm:px-4 md:px-6 lg:px-[150px] w-full relative dark:text-white dark:shadow-md`}>
      
      {/* Left: Logo and Search */}
      <div className="flex gap-2 sm:gap-4 md:gap-5 items-center">
        <img src="/logo.jpg" alt="logo" width={32} height={32} className="sm:w-10 sm:h-10 rounded-lg"/>
        <div className={`app-container ${theme} hidden md:flex gap-1 items-center bg-blue-50 p-2 rounded-xl dark:bg-gray-800 min-w-0 flex-1 max-w-xs`}>
          <BiSearch size={16} className="flex-shrink-0" />
          <input
            name="search"
            placeholder="Search by title...."
            type="text"
            className="outline-none bg-transparent w-full min-w-0 text-sm"
          />
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex gap-3 lg:gap-6 items-center">
        {pageData.map((page, index) => (
          <Link
            to={page.path}
            key={index}
            className="hover:text-blue-500 flex items-center gap-1 text-sm lg:text-base transition-colors duration-200"
          >
            <span className="flex-shrink-0">{page.icon}</span>
            <span className="hidden lg:inline">{page.name}</span>
          </Link>
        ))}
        {/* Bell, Profile, Dropdown */}
        <div className="relative flex items-center gap-2 lg:gap-4">
          <button onClick={handleBellClick} className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200">
            <FaBell size={16} />
          </button>
          {isModalOpen && (
            <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="modal-content bg-white p-5 rounded-lg w-80 relative">
                <button className="absolute top-2 right-2 text-xl" onClick={closeModal}>&times;</button>
                <h2 className="text-lg font-semibold mb-4">Comments</h2>
                <GetComments courseId={courseId} />
              </div>
            </div>
          )}
          <button onClick={toggleDropdown} className="relative flex items-center gap-1">
            {profileData.profileImage ? (
              <img src={profileData.profileImage} alt="Profile" className="w-8 h-8 rounded-full object-cover border" />
            ) : profileData.icon}
            <MdArrowDropDown />
          </button>
          {isDropdownOpen && (
            <div className={`app-container ${theme} absolute top-full mt-2 right-0 shadow-lg rounded-lg w-36 bg-white dark:bg-gray-900`}>
              <Link to={profileData.path} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">View Profile</Link>
              <Link to={`/profileupdate/${user._id}`} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Update Profile</Link>
              <button onClick={handleLogout} className="block px-4 py-2 text-left text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 w-full">Log Out</button>
            </div>
          )}
          <button onClick={toggleTheme}>{theme === "light" ? <BiMoon size={16} /> : <BiSun size={16} />}</button>
        </div>
      </div>

      {/* Hamburger Icon */}
      <div className="md:hidden">
        <button onClick={toggleMobileMenu}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Right Drawer */}
<div className={`layout-container ${theme} fixed top-0 right-0 h-full w-64 shadow-lg overflow-y-auto z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
  <div className="flex justify-end p-4">
    <button onClick={toggleMobileMenu} className="text-2xl">&times;</button>
  </div>

  <div className="px-6 flex flex-col gap-4">
    {user?.role === "tutor" && (
      <>
        <div className="font-semibold text-lg">Tutor</div>
        
        {pageData.map((page, index) => (
          <Link key={index} to={page.path} onClick={toggleMobileMenu} className="flex items-center gap-2 py-2 hover:text-blue-500">
            {page.icon}
            {page.name}
          </Link>
        ))}

        {dashboardData.map((page, index) => (
          <Link key={index} to={page.path} onClick={toggleMobileMenu} className="hover:text-blue-500 flex items-center gap-1">
            {page.icon}
            {page.name}
          </Link>
        ))}

        {managecourseData.map((item, index) => (
          <div key={index} className="w-full">
            <div 
              onClick={toggleDropdowns} 
              className="flex justify-between items-center p-2 shadow-sm hover:bg-gray-100 hover:text-blue-500 h-16 hover:animate-pulse rounded-md cursor-pointer transition-all duration-300 ease-in-out"
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

        {sidebarData.map((page, index) => (
          <Link key={index} to={page.path} onClick={toggleMobileMenu} className="hover:text-blue-500 flex items-center gap-1">
            {page.icon}
            {page.name}
          </Link>
        ))}
      </>
    )}

    {user?.role === "student" && (
      <>
        <div className="font-semibold text-lg">Student</div>
        {studentCourseData.map((page, index) => (
          <Link key={index} to={page.path} onClick={toggleMobileMenu} className="hover:text-blue-500 flex items-center gap-1">
            {page.icon}
            {page.name}
          </Link>
        ))}
      </>
    )}

    <hr className="my-2" />

    {/* Profile Actions */}
    <button onClick={handleBellClick} className="flex items-center gap-2"><FaBell /> Notifications</button>
    <Link to={profileData.path} onClick={toggleMobileMenu} className="py-2">View Profile</Link>
    <Link to={`/profileupdate/${user._id}`} onClick={toggleMobileMenu} className="py-2">Update Profile</Link>
    <button onClick={toggleTheme} className="py-2 flex items-center gap-2">
      {theme === "light" ? <BiMoon /> : <BiSun />}
    </button>
    <button onClick={handleLogout} className="text-red-500 py-2">Log Out</button>
  </div>
</div>

    </div>
  );
}
