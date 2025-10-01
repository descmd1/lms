import { useState, useEffect } from 'react';
import { useTheme } from '../components/ThemeContext';
import * as jwt_decode from 'jwt-decode';
import axios from 'axios';
import { FaUser, FaLock, FaBell, FaPalette, FaLanguage, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdEmail, MdSecurity } from 'react-icons/md';

const base_url = process.env.REACT_APP_BASE_URL || 'http://localhost:5001';

export function Settings() {
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    // Form states
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        profileImage: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        courseUpdates: true,
        newEnrollments: true,
        liveSessionReminders: true,
        marketingEmails: false
    });

    const [preferences, setPreferences] = useState({
        language: 'English',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        emailFrequency: 'immediate'
    });

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = () => {
        try {
            const token = sessionStorage.getItem('user');
            if (token) {
                const decodedUser = jwt_decode.jwtDecode(token);
                setUser(decodedUser);
                setProfileData({
                    name: decodedUser.name || '',
                    email: decodedUser.email || '',
                    profileImage: decodedUser.profileImage || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const token = sessionStorage.getItem('user');
            const updateData = {
                name: profileData.name,
                email: profileData.email,
                profileImage: profileData.profileImage
            };

            // If password is being changed
            if (profileData.newPassword) {
                if (profileData.newPassword !== profileData.confirmPassword) {
                    setErrorMessage('New passwords do not match');
                    setLoading(false);
                    return;
                }
                if (profileData.newPassword.length < 6) {
                    setErrorMessage('Password must be at least 6 characters long');
                    setLoading(false);
                    return;
                }
                updateData.currentPassword = profileData.currentPassword;
                updateData.newPassword = profileData.newPassword;
            }

            await axios.put(`${base_url}/user/profile/${user._id}`, updateData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setSuccessMessage('Profile updated successfully!');
            
            // Clear password fields
            setProfileData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));

            // Reload user data
            loadUserData();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationUpdate = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('user');
            await axios.put(`${base_url}/user/notifications/${user._id}`, notificationSettings, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSuccessMessage('Notification preferences updated!');
        } catch (error) {
            setErrorMessage('Failed to update notification preferences');
        } finally {
            setLoading(false);
        }
    };

    const handlePreferencesUpdate = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('user');
            await axios.put(`${base_url}/user/preferences/${user._id}`, preferences, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSuccessMessage('Preferences updated!');
        } catch (error) {
            setErrorMessage('Failed to update preferences');
        } finally {
            setLoading(false);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <FaUser className="text-blue-500" />
                            Profile Information
                        </h3>
                        
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Name</label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                    className={`field-color ${theme} w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                    className={`field-color ${theme} w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Profile Image URL</label>
                                <input
                                    type="url"
                                    value={profileData.profileImage}
                                    onChange={(e) => setProfileData({...profileData, profileImage: e.target.value})}
                                    className={`field-color ${theme} w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                    placeholder="https://example.com/your-image.jpg"
                                />
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
                                    <FaLock className="text-gray-500" />
                                    Change Password
                                </h4>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Current Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={profileData.currentPassword}
                                                onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})}
                                                className={`field-color ${theme} w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3 text-gray-500"
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">New Password</label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={profileData.newPassword}
                                            onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})}
                                            className={`field-color ${theme} w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                            minLength="6"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={profileData.confirmPassword}
                                            onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})}
                                            className={`field-color ${theme} w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                            minLength="6"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                <FaSave />
                                {loading ? 'Updating...' : 'Update Profile'}
                            </button>
                        </form>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <FaBell className="text-blue-500" />
                            Notification Preferences
                        </h3>
                        
                        <div className="space-y-4">
                            {Object.entries({
                                emailNotifications: 'Email Notifications',
                                courseUpdates: 'Course Updates',
                                newEnrollments: 'New Enrollments',
                                liveSessionReminders: 'Live Session Reminders',
                                marketingEmails: 'Marketing Emails'
                            }).map(([key, label]) => (
                                <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <label className="font-medium">{label}</label>
                                        <p className="text-sm text-gray-500">
                                            {key === 'emailNotifications' && 'Receive email notifications for important updates'}
                                            {key === 'courseUpdates' && 'Get notified when your courses are updated'}
                                            {key === 'newEnrollments' && 'Receive alerts for new course enrollments'}
                                            {key === 'liveSessionReminders' && 'Get reminders before live sessions start'}
                                            {key === 'marketingEmails' && 'Receive promotional emails and announcements'}
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings[key]}
                                            onChange={(e) => setNotificationSettings({
                                                ...notificationSettings,
                                                [key]: e.target.checked
                                            })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleNotificationUpdate}
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50"
                        >
                            <FaSave />
                            {loading ? 'Updating...' : 'Save Preferences'}
                        </button>
                    </div>
                );

            case 'appearance':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <FaPalette className="text-blue-500" />
                            Appearance Settings
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="p-4 border rounded-lg">
                                <label className="font-medium mb-2 block">Theme</label>
                                <p className="text-sm text-gray-500 mb-4">Choose your preferred theme</p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={toggleTheme}
                                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                                            theme === 'light' 
                                                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                                : 'border-gray-300 hover:border-blue-300'
                                        }`}
                                    >
                                        Light Theme
                                    </button>
                                    <button
                                        onClick={toggleTheme}
                                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                                            theme === 'dark' 
                                                ? 'border-blue-500 bg-blue-900 text-blue-100' 
                                                : 'border-gray-300 hover:border-blue-300'
                                        }`}
                                    >
                                        Dark Theme
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'preferences':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <FaLanguage className="text-blue-500" />
                            General Preferences
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Language</label>
                                <select
                                    value={preferences.language}
                                    onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                                    className={`field-color ${theme} w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                >
                                    <option value="English">English</option>
                                    <option value="Spanish">Spanish</option>
                                    <option value="French">French</option>
                                    <option value="German">German</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Timezone</label>
                                <select
                                    value={preferences.timezone}
                                    onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                                    className={`field-color ${theme} w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                >
                                    <option value="UTC">UTC</option>
                                    <option value="America/New_York">Eastern Time</option>
                                    <option value="America/Chicago">Central Time</option>
                                    <option value="America/Denver">Mountain Time</option>
                                    <option value="America/Los_Angeles">Pacific Time</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Date Format</label>
                                <select
                                    value={preferences.dateFormat}
                                    onChange={(e) => setPreferences({...preferences, dateFormat: e.target.value})}
                                    className={`field-color ${theme} w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                >
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Email Frequency</label>
                                <select
                                    value={preferences.emailFrequency}
                                    onChange={(e) => setPreferences({...preferences, emailFrequency: e.target.value})}
                                    className={`field-color ${theme} w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                >
                                    <option value="immediate">Immediate</option>
                                    <option value="daily">Daily Digest</option>
                                    <option value="weekly">Weekly Summary</option>
                                    <option value="never">Never</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handlePreferencesUpdate}
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50"
                        >
                            <FaSave />
                            {loading ? 'Updating...' : 'Save Preferences'}
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className={`app-container ${theme} min-h-screen p-6`}>
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Settings</h1>
                    <p className="text-gray-600">Manage your account settings and preferences</p>
                </div>

                {/* Success/Error Messages */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {errorMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Settings Navigation */}
                    <div className={`field-color ${theme} p-6 rounded-lg shadow-md h-fit`}>
                        <nav className="space-y-2">
                            {[
                                { id: 'profile', label: 'Profile', icon: FaUser },
                                { id: 'notifications', label: 'Notifications', icon: FaBell },
                                { id: 'appearance', label: 'Appearance', icon: FaPalette },
                                { id: 'preferences', label: 'Preferences', icon: FaLanguage }
                            ].map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                                        activeTab === id
                                            ? 'bg-blue-500 text-white'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <Icon className="text-lg" />
                                    {label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Settings Content */}
                    <div className={`lg:col-span-3 field-color ${theme} p-6 rounded-lg shadow-md`}>
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}