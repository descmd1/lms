import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pageData, getProfileData, dashboardData, managecourseData, sidebarData, studentCourseData } from './pageData';
import { useNavigate, useParams } from 'react-router-dom';
import { BiMoon, BiSearch, BiSun } from 'react-icons/bi';
import * as jwt_decode from 'jwt-decode';
import { MdArrowDropDown } from 'react-icons/md';
import { FaBell, FaUser } from 'react-icons/fa';
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
    <div className={`app-container ${theme} flex justify-between items-center px-4 sm:px-6 md:px-8 lg:px-[150px] w-full relative backdrop-blur-md bg-white/95 dark:bg-gray-900/95 border-b border-gray-200/20 dark:border-gray-700/20 shadow-lg`}>
      
      {/* Left: Logo and Search */}
      <div className="flex gap-3 sm:gap-4 md:gap-6 items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src="/logo.jpg" alt="logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-md ring-2 ring-blue-500/20"/>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">EduHub</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Learning Platform</p>
          </div>
        </div>
        <div className={`app-container ${theme} hidden md:flex gap-2 items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-3 rounded-2xl border border-blue-100 dark:border-gray-600 min-w-0 flex-1 max-w-sm shadow-inner`}>
          <BiSearch size={18} className="flex-shrink-0 text-blue-500" />
          <input
            name="search"
            placeholder="Search courses, topics..."
            type="text"
            className="outline-none border-none text-gray-800 dark:text-gray-200 font-md bg-transparent w-full min-w-0 text-sm placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex gap-2 lg:gap-4 items-center">
        {pageData.map((page, index) => (
          <Link
            to={page.path}
            key={index}
            className="group relative px-3 py-2 rounded-xl text-sm lg:text-base font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:shadow-md flex items-center gap-2"
          >
            <span className="flex-shrink-0 group-hover:scale-110 transition-transform duration-200 text-blue-500">{page.icon}</span>
            <span className="hidden lg:inline group-hover:text-blue-600 dark:group-hover:text-blue-400">{page.name}</span>
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
          </Link>
        ))}
        {/* Bell, Profile, Dropdown */}
        <div className="relative flex items-center gap-3 lg:gap-4 ml-4 lg:ml-6">
          <button onClick={handleBellClick} className="group relative p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 rounded-xl transition-all duration-300 hover:shadow-md">
            <FaBell size={16} className="text-gray-600 dark:text-gray-300 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-200" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
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
          <button onClick={toggleDropdown} className="group relative flex items-center gap-2 p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 rounded-xl transition-all duration-300 hover:shadow-md">
            {profileData.profileImage ? (
              <img src={profileData.profileImage} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-blue-200 dark:border-gray-600 group-hover:border-blue-400 transition-colors duration-200 shadow-sm" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <MdArrowDropDown className={`text-gray-500 group-hover:text-blue-500 transition-all duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {isDropdownOpen && (
            <div className={`app-container ${theme} absolute top-full mt-3 right-0 w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200`}>
              <div className="p-2">
                <Link to={profileData.path} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-200 group">
                  <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-sm font-medium">View Profile</span>
                </Link>
                <Link to={`/profileupdate/${user._id}`} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-200 group">
                  <div className="w-2 h-2 bg-green-500 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-sm font-medium">Update Profile</span>
                </Link>
                <hr className="my-2 border-gray-200/50 dark:border-gray-700/50" />
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 transition-all duration-200 group w-full text-left">
                  <div className="w-2 h-2 bg-red-500 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">Log Out</span>
                </button>
              </div>
            </div>
          )}
          <button onClick={toggleTheme} className="group relative p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 rounded-xl transition-all duration-300 hover:shadow-md">
            <div className="relative">
              {theme === "light" ? 
                <BiMoon size={16} className="text-gray-600 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-200" /> : 
                <BiSun size={16} className="text-yellow-500 group-hover:text-yellow-400 group-hover:scale-110 transition-all duration-200" />
              }
            </div>
          </button>
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

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Right Drawer */}
      <div className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 max-w-[85vw] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-l border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-y-auto z-50 transform transition-all duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user?.role === 'tutor' ? 'T' : 'S'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                {user?.role === 'tutor' ? '🎓 Tutor Panel' : '📚 Student Panel'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.name || 'User'}
              </p>
            </div>
          </div>
          <button 
            onClick={toggleMobileMenu} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Content */}
        <div className="p-6 space-y-2">
          {/* Mobile Search */}
          <div className="mb-6">
            <div className="relative">
              <div className="flex gap-2 items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-3 rounded-2xl border border-blue-100 dark:border-gray-600 shadow-inner">
                <BiSearch size={18} className="flex-shrink-0 text-blue-500" />
                <input
                  name="mobileSearch"
                  placeholder="Search courses, topics..."
                  type="text"
                  className="outline-none border-none text-gray-800 dark:text-gray-200 font-medium bg-transparent w-full text-sm placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {user?.role === "tutor" && (
            <>
              {/* Page Navigation */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Navigation</h4>
                <div className="space-y-1">
                  {pageData.map((page, index) => (
                    <Link 
                      key={index} 
                      to={page.path} 
                      onClick={toggleMobileMenu} 
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-200 group"
                    >
                      <span className="text-blue-500 group-hover:scale-110 transition-transform duration-200">{page.icon}</span>
                      <span className="font-medium">{page.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Dashboard */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Dashboard</h4>
                <div className="space-y-1">
                  {dashboardData.map((page, index) => (
                    <Link 
                      key={index} 
                      to={page.path} 
                      onClick={toggleMobileMenu} 
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-200 group"
                    >
                      <span className="text-blue-500 group-hover:scale-110 transition-transform duration-200">{page.icon}</span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">{page.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Course Management */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Course Management</h4>
                <div className="space-y-1">
                  {managecourseData.map((item, index) => (
                    <div key={index} className="w-full">
                      <div 
                        onClick={toggleDropdowns} 
                        className="flex justify-between items-center p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 cursor-pointer transition-all duration-200 group"
                      >
                        <div className="flex gap-3 items-center">
                          <span className="text-blue-500 group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                          <span className="font-medium text-gray-700 dark:text-gray-200">{item.name}</span>
                        </div>
                        <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                          <div className="w-2 h-2 border-r-2 border-b-2 border-current rotate-45"></div>
                        </div>
                      </div>

                      {isOpen && item.subItems && (
                        <div className="ml-6 mt-2 space-y-1 border-l-2 border-blue-200 dark:border-blue-800 pl-4">
                          {item.subItems.map((subItem, subIndex) => (
                            <Link 
                              key={subIndex} 
                              to={subItem.path} 
                              onClick={toggleMobileMenu}
                              className="flex gap-3 items-center p-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-200 group"
                            >
                              <div className="w-2 h-2 rounded-full bg-blue-400 group-hover:scale-125 transition-all duration-200"></div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{subItem.name}</span>
                              <span className="text-blue-500 group-hover:scale-110 transition-transform duration-200">{subItem.icon}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tools */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Tools</h4>
                <div className="space-y-1">
                  {sidebarData.map((page, index) => (
                    <Link 
                      key={index} 
                      to={page.path} 
                      onClick={toggleMobileMenu} 
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-200 group"
                    >
                      <span className="text-blue-500 group-hover:scale-110 transition-transform duration-200">{page.icon}</span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">{page.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}

          {user?.role === "student" && (
            <>
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Student Dashboard</h4>
                <div className="space-y-1">
                  {studentCourseData.map((page, index) => (
                    <Link 
                      key={index} 
                      to={page.path} 
                      onClick={toggleMobileMenu} 
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-200 group"
                    >
                      <span className="text-green-500 group-hover:scale-110 transition-transform duration-200">{page.icon}</span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">{page.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Profile Actions */}
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-6 mt-6">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Account</h4>
            <div className="space-y-1">
              <button 
                onClick={handleBellClick} 
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-200 group w-full text-left"
              >
                <FaBell className="text-blue-500 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium text-gray-700 dark:text-gray-200">Notifications</span>
              </button>
              
              <Link 
                to={profileData.path} 
                onClick={toggleMobileMenu} 
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-200 group"
              >
                <FaUser className="text-blue-500 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium text-gray-700 dark:text-gray-200">View Profile</span>
              </Link>
              
              <Link 
                to={`/profileupdate/${user._id}`} 
                onClick={toggleMobileMenu} 
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-200 group"
              >
                <span className="text-blue-500 group-hover:scale-110 transition-transform duration-200">⚙️</span>
                <span className="font-medium text-gray-700 dark:text-gray-200">Update Profile</span>
              </Link>
              
              <button 
                onClick={toggleTheme} 
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-200 group w-full text-left"
              >
                {theme === "light" ? 
                  <BiMoon className="text-blue-500 group-hover:scale-110 transition-transform duration-200" /> : 
                  <BiSun className="text-yellow-500 group-hover:scale-110 transition-transform duration-200" />
                }
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                </span>
              </button>
              
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 transition-all duration-200 group w-full text-left"
              >
                <span className="text-red-500 group-hover:scale-110 transition-transform duration-200">🚪</span>
                <span className="font-medium text-red-600 dark:text-red-400">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
