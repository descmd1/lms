import { useState, useEffect } from 'react';
import axios from 'axios';
import * as jwt_decode from "jwt-decode";
import { useTheme } from './ThemeContext';
import { FaPlay, FaStop, FaEdit, FaTrash, FaUsers, FaClock } from 'react-icons/fa';
import Swal from 'sweetalert2';

const base_url = process.env.REACT_APP_BASE_URL;

export function LiveSessionList({ courseId, isRefresh }) {
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userRole, setUserRole] = useState('');
    const { theme } = useTheme();

    useEffect(() => {
        // Get user role
        const token = sessionStorage.getItem('user');
        if (token) {
            const decodedUser = jwt_decode.jwtDecode(token);
            setUserRole(decodedUser.role);
        }
        
        fetchSessions();
    }, [courseId, isRefresh]);

    const fetchSessions = async () => {
        setIsLoading(true);
        try {
            const token = sessionStorage.getItem('user');
            if (!token) return;

            const response = await axios.get(`${base_url}/live-session/course/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setSessions(response.data);
        } catch (error) {
            console.error('Error fetching live sessions:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: `${base_url}/live-session/course/${courseId}`
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartSession = async (sessionId) => {
        try {
            const token = sessionStorage.getItem('user');
            const response = await axios.put(`${base_url}/live-session/${sessionId}/start`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            Swal.fire('Success', 'Live session started!', 'success');
            fetchSessions(); // Refresh the list
            
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
                fetchSessions(); // Refresh the list
            }
        } catch (error) {
            console.error('Error ending session:', error);
            Swal.fire('Error', error.response?.data?.error || 'Failed to end session', 'error');
        }
    };

    const handleJoinSession = async (sessionId) => {
        try {
            const token = sessionStorage.getItem('user');
            const response = await axios.post(`${base_url}/live-session/${sessionId}/join`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Open the live session room
            window.open(`/live-room/${sessionId}`, '_blank');
        } catch (error) {
            console.error('Error joining session:', error);
            Swal.fire('Error', error.response?.data?.error || 'Failed to join session', 'error');
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
                fetchSessions(); // Refresh the list
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

    if (isLoading) {
        return (
            <div className={`app-container ${theme} p-4 text-center`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className={`text-color ${theme} mt-2`}>Loading live sessions...</p>
            </div>
        );
    }

    return (
        <div className={`app-container ${theme} shadow-lg rounded-md p-4 sm:p-6`}>
            <h2 className={`text-color ${theme} text-xl sm:text-2xl font-bold mb-4 sm:mb-6`}>Live Sessions</h2>
            
            {sessions.length === 0 ? (
                <p className={`fade-color ${theme} text-center py-8 text-sm sm:text-base`}>
                    No live sessions scheduled for this course yet.
                </p>
            ) : (
                <div className="space-y-4 sm:space-y-6">
                    {sessions.map((session) => (
                        <div
                            key={session._id}
                            className={`field-color ${theme} border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow`}
                        >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className={`text-color ${theme} font-semibold text-lg break-words`}>
                                        {session.title}
                                    </h3>
                                    {session.description && (
                                        <p className={`fade-color ${theme} text-sm mt-2 break-words`}>
                                            {session.description}
                                        </p>
                                    )}
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(session.status)} self-start flex-shrink-0`}
                                >
                                    {session.status.toUpperCase()}
                                </span>
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
                                {/* Actions for tutors */}
                                {userRole === 'tutor' && (
                                    <>
                                        {session.status === 'scheduled' && (
                                            <>
                                                <button
                                                    onClick={() => handleStartSession(session._id)}
                                                    className="flex items-center justify-center gap-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition-colors text-sm font-medium w-full sm:w-auto"
                                                >
                                                    <FaPlay className="w-3 h-3" />
                                                    <span className="sm:inline">Start Session</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSession(session._id)}
                                                    className="flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-colors text-sm font-medium w-full sm:w-auto"
                                                >
                                                    <FaTrash className="w-3 h-3" />
                                                    <span className="sm:inline">Delete</span>
                                                </button>
                                            </>
                                        )}
                                        {session.status === 'live' && (
                                            <button
                                                onClick={() => handleEndSession(session._id)}
                                                className="flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-colors text-sm font-medium w-full sm:w-auto"
                                            >
                                                <FaStop className="w-3 h-3" />
                                                <span className="sm:inline">End Session</span>
                                            </button>
                                        )}
                                    </>
                                )}

                                {/* Actions for students */}
                                {userRole === 'student' && session.status === 'live' && (
                                    <button
                                        onClick={() => handleJoinSession(session._id)}
                                        className="flex items-center justify-center gap-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors text-sm font-medium w-full sm:w-auto"
                                    >
                                        <FaPlay className="w-3 h-3" />
                                        <span className="sm:inline">Join Live Session</span>
                                    </button>
                                )}

                                {/* Recording playback for completed sessions */}
                                {session.status === 'completed' && session.recordingUrl && (
                                    <a
                                        href={session.recordingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-1 bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 transition-colors text-sm font-medium w-full sm:w-auto"
                                    >
                                        <FaPlay className="w-3 h-3" />
                                        <span className="sm:inline">Watch Recording</span>
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