import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as jwt_decode from "jwt-decode";
import { useTheme } from '../components/ThemeContext';
import { FaPlay, FaStop, FaEdit, FaTrash, FaUsers, FaClock, FaPlus } from 'react-icons/fa';
import Swal from 'sweetalert2';

const base_url = process.env.REACT_APP_BASE_URL;

export function LiveSessionDashboard() {
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [filter, setFilter] = useState('all'); // all, scheduled, live, completed
    const { theme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is a tutor
        const token = sessionStorage.getItem('user');
        if (!token) {
            navigate('/login');
            return;
        }

        const decodedUser = jwt_decode.jwtDecode(token);
        if (decodedUser.role !== 'tutor') {
            navigate('/home');
            return;
        }

        setUserRole(decodedUser.role);
        fetchTutorSessions();
    }, []);

    const fetchTutorSessions = async () => {
        setIsLoading(true);
        try {
            const token = sessionStorage.getItem('user');
            const response = await axios.get(`${base_url}/live-session/tutor`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setSessions(response.data);
        } catch (error) {
            console.error('Error fetching tutor sessions:', error);
            Swal.fire('Error', 'Failed to fetch your live sessions', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartSession = async (sessionId) => {
        try {
            const token = sessionStorage.getItem('user');
            await axios.put(`${base_url}/live-session/${sessionId}/start`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            Swal.fire('Success', 'Live session started!', 'success');
            fetchTutorSessions();
            
            // Open the live session in a new window/tab
            window.open(`/live-room/${sessionId}`, '_blank');
        } catch (error) {
            console.error('Error starting session:', error);
            Swal.fire('Error', error.response?.data?.error || 'Failed to start session', 'error');
        }
    };

    const handleEndSession = async (sessionId) => {
        try {
            const result = await Swal.fire({
                title: 'End Live Session?',
                text: 'Are you sure you want to end this live session?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, end it!'
            });

            if (result.isConfirmed) {
                const token = sessionStorage.getItem('user');
                await axios.put(`${base_url}/live-session/${sessionId}/end`, {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                Swal.fire('Ended!', 'Live session has been ended.', 'success');
                fetchTutorSessions();
            }
        } catch (error) {
            console.error('Error ending session:', error);
            Swal.fire('Error', error.response?.data?.error || 'Failed to end session', 'error');
        }
    };

    const handleDeleteSession = async (sessionId) => {
        try {
            const result = await Swal.fire({
                title: 'Delete Session?',
                text: 'This action cannot be undone!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                const token = sessionStorage.getItem('user');
                await axios.delete(`${base_url}/live-session/${sessionId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                Swal.fire('Deleted!', 'Session has been deleted.', 'success');
                fetchTutorSessions();
            }
        } catch (error) {
            console.error('Error deleting session:', error);
            Swal.fire('Error', error.response?.data?.error || 'Failed to delete session', 'error');
        }
    };

    const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleString();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return 'text-blue-500';
            case 'live': return 'text-green-500';
            case 'completed': return 'text-gray-500';
            case 'cancelled': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-800';
            case 'live': return 'bg-green-100 text-green-800 animate-pulse';
            case 'completed': return 'bg-gray-100 text-gray-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredSessions = sessions.filter(session => {
        if (filter === 'all') return true;
        return session.status === filter;
    });

    const getUpcomingSessions = () => {
        return sessions.filter(session => 
            session.status === 'scheduled' && 
            new Date(session.scheduledDateTime) > new Date()
        ).length;
    };

    const getLiveSessions = () => {
        return sessions.filter(session => session.status === 'live').length;
    };

    const getCompletedSessions = () => {
        return sessions.filter(session => session.status === 'completed').length;
    };

    if (isLoading) {
        return (
            <div className={`app-container ${theme} min-h-screen flex items-center justify-center`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
                    <p className={`text-color ${theme} mt-4 text-lg`}>Loading your sessions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`app-container ${theme} min-h-screen p-4 sm:p-6`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h1 className={`text-color ${theme} text-2xl sm:text-3xl font-bold`}>Live Session Dashboard</h1>
                    <p className={`fade-color ${theme} mt-1 text-sm sm:text-base`}>Manage your live video sessions</p>
                </div>
                <button
                    onClick={() => navigate('/createcourse')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
                >
                    <FaPlus />
                    Schedule New Session
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className={`field-color ${theme} p-3 sm:p-4 rounded-lg shadow`}>
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <FaClock className="text-blue-600" />
                        </div>
                        <div className="ml-3">
                            <p className={`fade-color ${theme} text-sm`}>Upcoming</p>
                            <p className={`text-color ${theme} text-2xl font-bold`}>{getUpcomingSessions()}</p>
                        </div>
                    </div>
                </div>

                <div className={`field-color ${theme} p-4 rounded-lg shadow`}>
                    <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-full">
                            <FaPlay className="text-green-600" />
                        </div>
                        <div className="ml-3">
                            <p className={`fade-color ${theme} text-sm`}>Live Now</p>
                            <p className={`text-color ${theme} text-2xl font-bold`}>{getLiveSessions()}</p>
                        </div>
                    </div>
                </div>

                <div className={`field-color ${theme} p-4 rounded-lg shadow`}>
                    <div className="flex items-center">
                        <div className="bg-gray-100 p-3 rounded-full">
                            <FaUsers className="text-gray-600" />
                        </div>
                        <div className="ml-3">
                            <p className={`fade-color ${theme} text-sm`}>Completed</p>
                            <p className={`text-color ${theme} text-2xl font-bold`}>{getCompletedSessions()}</p>
                        </div>
                    </div>
                </div>

                <div className={`field-color ${theme} p-4 rounded-lg shadow`}>
                    <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-full">
                            <FaUsers className="text-purple-600" />
                        </div>
                        <div className="ml-3">
                            <p className={`fade-color ${theme} text-sm`}>Total Sessions</p>
                            <p className={`text-color ${theme} text-2xl font-bold`}>{sessions.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex space-x-1 min-w-max">
                    {['all', 'scheduled', 'live', 'completed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                                filter === status
                                    ? 'bg-blue-500 text-white'
                                    : `${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} hover:bg-gray-300`
                            }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sessions List */}
            {filteredSessions.length === 0 ? (
                <div className={`field-color ${theme} p-8 text-center rounded-lg`}>
                    <FaClock className={`fade-color ${theme} mx-auto mb-4`} size={48} />
                    <p className={`text-color ${theme} text-lg font-medium mb-2`}>
                        No {filter === 'all' ? '' : filter} sessions found
                    </p>
                    <p className={`fade-color ${theme}`}>
                        {filter === 'all' 
                            ? 'Schedule your first live session to get started!'
                            : `You don't have any ${filter} sessions yet.`
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredSessions.map((session) => (
                        <div
                            key={session._id}
                            className={`field-color ${theme} border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow`}
                        >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                        <h3 className={`text-color ${theme} font-semibold text-lg sm:text-xl break-words`}>
                                            {session.title}
                                        </h3>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(session.status)} self-start flex-shrink-0`}
                                        >
                                            {session.status.toUpperCase()}
                                        </span>
                                    </div>
                                    {session.description && (
                                        <p className={`fade-color ${theme} mb-3`}>
                                            {session.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className={`fade-color ${theme} text-sm space-y-2 mb-4`}>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <FaClock className="w-4 h-4 flex-shrink-0" />
                                    <span className="break-words">Scheduled: {formatDateTime(session.scheduledDateTime)}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <FaUsers className="w-4 h-4 flex-shrink-0" />
                                    <div className="flex flex-col sm:flex-row sm:gap-2 text-xs sm:text-sm">
                                        <span>Duration: {session.duration} min</span>
                                        <span className="hidden sm:inline">|</span>
                                        <span>Max: {session.maxParticipants}</span>
                                        <span className="hidden sm:inline">|</span>
                                        <span>Current: {session.participants?.length || 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                {session.status === 'scheduled' && (
                                    <>
                                        <button
                                            onClick={() => handleStartSession(session._id)}
                                            className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors text-sm font-medium w-full sm:w-auto"
                                        >
                                            <FaPlay className="w-4 h-4" />
                                            <span>Start Session</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSession(session._id)}
                                            className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors text-sm font-medium w-full sm:w-auto"
                                        >
                                            <FaTrash className="w-4 h-4" />
                                            <span>Delete</span>
                                        </button>
                                    </>
                                )}
                                {session.status === 'live' && (
                                    <>
                                        <button
                                            onClick={() => window.open(`/live-room/${session._id}`, '_blank')}
                                            className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm font-medium w-full sm:w-auto"
                                        >
                                            <FaPlay className="w-4 h-4" />
                                            <span>Join Session</span>
                                        </button>
                                        <button
                                            onClick={() => handleEndSession(session._id)}
                                            className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors text-sm font-medium w-full sm:w-auto"
                                        >
                                            <FaStop className="w-4 h-4" />
                                            <span>End Session</span>
                                        </button>
                                    </>
                                )}
                                {session.status === 'completed' && session.recordingUrl && (
                                    <a
                                        href={session.recordingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors text-sm font-medium w-full sm:w-auto"
                                    >
                                        <FaPlay className="w-4 h-4" />
                                        <span>Watch Recording</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}