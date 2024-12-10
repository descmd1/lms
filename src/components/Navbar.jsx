import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pageData, getProfileData } from './pageData';
import { useNavigate } from 'react-router-dom';
import { BiSearch } from 'react-icons/bi';
import * as jwt_decode from 'jwt-decode';
import { MdArrowDropDown } from 'react-icons/md';
import { FaBell } from 'react-icons/fa';

export function Navbar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
  const [user, setUser] = useState({});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function loadUserData() {
      const token = sessionStorage.getItem('user');
      const decodedUser = jwt_decode.jwtDecode(token);
      setUser(decodedUser);
    }
    loadUserData();
  }, []);

  const profileData = getProfileData(user);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/');
  };

  const fetchNotifications = async () => {
    const response = await fetch('http://localhost:5001/notifications');
    const data = await response.json();
    setNotifications(data);
  };

  const handleBellClick = () => {
    setIsModalOpen(true);
    fetchNotifications(); // Load notifications when modal opens
  };

  const closeModal = () => setIsModalOpen(false);

  const markAsRead = async (id) => {
    await fetch(`http://localhost/5001/notifications/${id}/read`, { method: 'PUT' });
    setNotifications(notifications.filter((n) => n._id !== id));
  };

  return (
    <div className="flex justify-between items-center md:w-[1440px] md:px-[150px] w-full px-4">
      <div className="flex gap-5 items-center">
        <img src="/logo.jpg" alt="logo" width={40} height={40} />
        <div className="flex gap-1 items-center bg-blue-50 p-2 rounded-xl">
          <BiSearch size={16} />
          <input
            name="search"
            placeholder="Search by title...."
            type="text"
            className="outline-none bg-transparent"
          />
        </div>
      </div>
      <div className="flex gap-5 md:visible invisible">
        {pageData.map((page, index) => (
          <Link to={page.path} key={index}>
            <button className="hover:text-blue-500 items-center hover:border-b-2 hover:border-b-sky-400 active:hover:text-blue-500 active:border-b-2 active:border-b-sky-400 text-sm font-normal">
              {page.icon}
              {page.name}
            </button>
          </Link>
        ))}
      </div>
      <div className="relative flex gap-5 items-center md:visible invisible">
        {/* Bell Icon Button */}
        <button onClick={handleBellClick}>
          <FaBell />
        </button>

        {/* Modal for Notifications */}
        {isModalOpen && (
          <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="modal-content bg-white p-5 rounded-lg w-80 relative">
              <button
                className="close-button absolute top-2 right-2 text-xl"
                onClick={closeModal}
              >
                &times;
              </button>
              <h2 className="text-lg font-semibold mb-4">Notifications</h2>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className="notification-item p-2 border-b border-gray-200 cursor-pointer"
                    onClick={() => markAsRead(notification._id)}
                  >
                    {notification.type === 'comment'
                      ? 'New Comment'
                      : 'Reply to your Comment'}
                  </div>
                ))
              ) : (
                <p>No new notifications</p>
              )}
            </div>
          </div>
        )}

        {/* Profile Button */}
        <button
          onClick={toggleDropdown}
          className="relative rounded-full hover:animate-pulse gap-0"
        >
          {profileData.profileImage ? (
            <img
              src={profileData.profileImage}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover bg-gray-50 border p-1"
            />
          ) : (
            profileData.icon
          )}
          <div className="flex items-center">
            <p className="text-sm text-gray-400">Me</p>
            <MdArrowDropDown />
          </div>
        </button>
        {isDropdownOpen && (
          <div className="absolute top-full mt-2 bg-white border shadow-lg rounded-lg w-32">
            <Link
              to={profileData.path}
              className="block px-4 py-2 hover:bg-gray-200 text-sm hover:text-blue-400"
            >
              View Profile
            </Link>
            <Link
              to={`/profileupdate/${user._id}`}
              className="block px-4 py-2 hover:bg-gray-200 text-sm hover:text-blue-400"
            >
              Update Profile
            </Link>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="items-center text-blue-500 font-normal text-sm hover:text-gray-500"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
