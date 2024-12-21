// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { pageData, getProfileData } from './pageData';
// import { useNavigate, useParams } from 'react-router-dom';
// import { BiSearch } from 'react-icons/bi';
// import * as jwt_decode from 'jwt-decode';
// import { MdArrowDropDown } from 'react-icons/md';
// import { FaBell } from 'react-icons/fa';
// import { GetComments } from './GetComments';

// export function Navbar() {
//   const navigate = useNavigate();
//   const [isDropdownOpen, setDropdownOpen] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false); 
//   const [user, setUser] = useState({});
//   const params = useParams();
//   let courseId = params.id;

//   useEffect(() => {
//     async function loadUserData() {
//       const token = sessionStorage.getItem('user');
//       const decodedUser = jwt_decode.jwtDecode(token);
//       setUser(decodedUser);
//     }
//     loadUserData();
//   }, []);

//   const profileData = getProfileData(user);

//   const toggleDropdown = () => {
//     setDropdownOpen(!isDropdownOpen);
//   };

//   const handleLogout = () => {
//     sessionStorage.removeItem('user');
//     navigate('/');
//   };
//   const handleBellClick = () => {
//     setIsModalOpen(true); // Open modal when bell icon is clicked
//   };
//   const closeModal = () => setIsModalOpen(false);

//   return (
//     <div className="flex justify-between items-center md:w-[1440px] md:px-[150px] w-full px-4">
//       <div className="flex gap-5 items-center">
//         <img src="/logo.jpg" alt="logo" width={40} height={40} />
//         <div className="flex gap-1 items-center bg-blue-50 p-2 rounded-xl">
//           <BiSearch size={16} />
//           <input
//             name="search"
//             placeholder="Search by title...."
//             type="text"
//             className="outline-none bg-transparent"
//           />
//         </div>
//       </div>
//       <div className="flex gap-5 md:visible invisible">
//         {pageData.map((page, index) => (
//           <Link to={page.path} key={index}>
//             <button className="hover:text-blue-500 items-center hover:border-b-2 hover:border-b-sky-400 active:hover:text-blue-500 active:border-b-2 active:border-b-sky-400 text-sm font-normal">
//               {page.icon}
//               {page.name}
//             </button>
//           </Link>
//         ))}
//       </div>
//       <div className="relative flex gap-5 items-center md:visible invisible">
//         {/* Bell Icon Button */}
//         <button onClick={handleBellClick}>
//           <FaBell />
//         </button>

//  {/* Notification Modal */}
//  {isModalOpen && (
//           <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//             <div className="modal-content bg-white p-5 rounded-lg w-80 relative">
//               <button
//                 className="close-button absolute top-2 right-2 text-xl"
//                 onClick={closeModal}
//               >
//                 &times;
//               </button>
//               <h2 className="text-lg font-semibold mb-4">Comments</h2>

//               {/* Fetch and Display Comments */}
//               <GetComments courseId={courseId} />
//             </div>
//           </div>
//         )}

//         {/* Profile Button */}
//         <button
//           onClick={toggleDropdown}
//           className="relative rounded-full hover:animate-pulse gap-0"
//         >
//           {profileData.profileImage ? (
//             <img
//               src={profileData.profileImage}
//               alt="Profile"
//               className="w-8 h-8 rounded-full object-cover bg-gray-50 border p-1"
//             />
//           ) : (
//             profileData.icon
//           )}
//           <div className="flex items-center">
//             <p className="text-sm text-gray-400">Me</p>
//             <MdArrowDropDown />
//           </div>
//         </button>
//         {isDropdownOpen && (
//           <div className="absolute top-full mt-2 bg-white border shadow-lg rounded-lg w-32">
//             <Link
//               to={profileData.path}
//               className="block px-4 py-2 hover:bg-gray-200 text-sm hover:text-blue-400"
//             >
//               View Profile
//             </Link>
//             <Link
//               to={`/profileupdate/${user._id}`}
//               className="block px-4 py-2 hover:bg-gray-200 text-sm hover:text-blue-400"
//             >
//               Update Profile
//             </Link>
//           </div>
//         )}
//         <button
//           onClick={handleLogout}
//           className="items-center text-blue-500 font-normal text-sm hover:text-gray-500"
//         >
//           Log Out
//         </button>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pageData, getProfileData } from './pageData';
import { useNavigate, useParams } from 'react-router-dom';
import { BiSearch } from 'react-icons/bi';
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
    <div className={`app-container ${theme} flex justify-between items-center 
    md:w-[1440px] md:px-[150px] w-full px-4 relative dark:bg-gray-800 dark:text-white dark:shadow-md dark:border`}>
      {/* Left: Logo and Search */}
      <div className="flex gap-5 items-center">
        <img src="/logo.jpg" alt="logo" width={40} height={40} />
        <div className={`app-container ${theme} flex gap-1 items-center bg-blue-50 p-2 rounded-xl dark:bg-gray-800 border`}>
          <BiSearch size={16} />
          <input
            name="search"
            placeholder="Search by title...."
            type="text"
            className="outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Center: Navigation Items */}
      <div
        className={`${
          isMobileMenuOpen ? 'flex' : 'hidden'
        } md:flex flex-col md:flex-row md:items-center md:static absolute top-full left-0 bg-white md:bg-transparent w-full md:w-auto shadow-md md:shadow-none z-50`}
      >
        {pageData.map((page, index) => (
          <Link
            to={page.path}
            key={index}
            className="block md:inline-block py-2 md:py-0 px-4 hover:text-blue-500"
          >
            {page.icon}
            {page.name}
          </Link>
        ))}
</div>
        {/* Profile Section */}
        <div
        className={`${
          isMobileMenuOpen ? 'flex' : 'hidden'
        } md:flex flex-col md:flex-row md:items-center md:static absolute top-full left-0 bg-white md:bg-transparent w-full md:w-auto shadow-md md:shadow-none z-50`}
      >
        <div className="relative flex items-center gap-5">
          <button onClick={handleBellClick}>
            <FaBell />
          </button>
          {isModalOpen && (
            <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="modal-content bg-white p-5 rounded-lg w-80">
                <button
                  className="absolute top-2 right-2 text-xl"
                  onClick={closeModal}
                >
                  &times;
                </button>
                <h2 className="text-lg font-semibold mb-4">Comments</h2>
                <GetComments courseId={courseId} />
              </div>
            </div>
          )}
          <button onClick={toggleDropdown} className="relative">
            {profileData.profileImage ? (
              <img
                src={profileData.profileImage}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border"
              />
            ) : (
              profileData.icon
            )}
            <MdArrowDropDown />
          </button>
          {isDropdownOpen && (
            <div className={`app-container ${theme} absolute top-full mt-2 bg-white border 
            shadow-lg rounded-lg w-36 dark:bg-gray-800`}>
              <Link
                to={profileData.path}
                className={`app-container ${theme} block px-4 py-2 hover:bg-gray-200 font-thin dark:text-white`}
              >
                View Profile
              </Link>
              <Link
                to={`/profileupdate/${user._id}`}
                className={`app-container ${theme}block px-4 py-2 hover:bg-gray-200 font-thin dark:text-white`}
              >
                Update Profile
              </Link>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="text-blue-500 text-sm hover:text-gray-500"
          >
            Log Out
          </button>
          <button onClick={toggleTheme} className="p-2">
                        {theme === "light" ? "🌙" : "☀️"}
                    </button>
        </div>
        </div>

      {/* Hamburger Icon */}
      <div className="md:hidden">
        <button onClick={toggleMobileMenu}>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
