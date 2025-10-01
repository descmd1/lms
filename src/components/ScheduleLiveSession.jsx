import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as jwt_decode from "jwt-decode";
import { useTheme } from './ThemeContext';
import Swal from 'sweetalert2';

const base_url = process.env.REACT_APP_BASE_URL;

export function ScheduleLiveSession({ courseId, onSessionScheduled }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [scheduledDateTime, setScheduledDateTime] = useState('');
    const [duration, setDuration] = useState(60);
    const [maxParticipants, setMaxParticipants] = useState(100);
    const [isLoading, setIsLoading] = useState(false);
    const { theme } = useTheme();
    const navigate = useNavigate();

    // Get minimum date/time (current time)
    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30); // Minimum 30 minutes from now
        return now.toISOString().slice(0, 16);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = sessionStorage.getItem('user');
            if (!token) {
                Swal.fire('Error', 'Please log in to schedule a live session', 'error');
                return;
            }

            const decodedUser = jwt_decode.jwtDecode(token);
            if (decodedUser.role !== 'tutor') {
                Swal.fire('Error', 'Only tutors can schedule live sessions', 'error');
                return;
            }

            const response = await axios.post(`${base_url}/live-session`, {
                courseId,
                title,
                description,
                scheduledDateTime,
                duration: parseInt(duration),
                maxParticipants: parseInt(maxParticipants)
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            Swal.fire({
                title: 'Success!',
                text: 'Live session scheduled successfully!',
                icon: 'success',
                confirmButtonText: 'OK'
            });

            // Reset form
            setTitle('');
            setDescription('');
            setScheduledDateTime('');
            setDuration(60);
            setMaxParticipants(100);

            if (onSessionScheduled) {
                onSessionScheduled(response.data);
            }

        } catch (error) {
            console.error('Error scheduling live session:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.error || 'Failed to schedule live session',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`app-container ${theme} shadow-lg rounded-md p-4 sm:p-6`}>
            <h2 className={`text-color ${theme} text-xl sm:text-2xl font-bold mb-4 sm:mb-6`}>Schedule Live Session</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                    <label className={`fade-color ${theme} block text-sm sm:text-base font-medium mb-2`}>
                        Session Title *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        maxLength={100}
                        className={`field-color ${theme} w-full py-2 sm:py-3 px-3 sm:px-4 rounded-sm bg-transparent outline-none text-sm sm:text-base`}
                        placeholder="Enter session title"
                    />
                </div>

                <div>
                    <label className={`fade-color ${theme} block text-sm sm:text-base font-medium mb-2`}>
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        maxLength={500}
                        rows={3}
                        className={`field-color ${theme} w-full py-2 sm:py-3 px-3 sm:px-4 rounded-sm bg-transparent outline-none text-sm sm:text-base resize-none`}
                        placeholder="Describe what will be covered in this session"
                    />
                </div>

                <div>
                    <label className={`fade-color ${theme} block text-sm sm:text-base font-medium mb-2`}>
                        Scheduled Date & Time *
                    </label>
                    <input
                        type="datetime-local"
                        value={scheduledDateTime}
                        onChange={(e) => setScheduledDateTime(e.target.value)}
                        required
                        min={getMinDateTime()}
                        className={`field-color ${theme} w-full py-2 sm:py-3 px-3 sm:px-4 rounded-sm bg-transparent outline-none text-sm sm:text-base`}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                        <label className={`fade-color ${theme} block text-sm sm:text-base font-medium mb-2`}>
                            Duration (minutes) *
                        </label>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className={`field-color ${theme} w-full py-2 sm:py-3 px-3 sm:px-4 rounded-sm bg-transparent outline-none text-sm sm:text-base`}
                        >
                            <option className={`layout-container ${theme}`} value={30}>30 minutes</option>
                            <option className={`layout-container ${theme}`} value={45}>45 minutes</option>
                            <option className={`layout-container ${theme}`} value={60}>1 hour</option>
                            <option className={`layout-container ${theme}`} value={90}>1.5 hours</option>
                            <option className={`layout-container ${theme}`} value={120}>2 hours</option>
                        </select>
                    </div>

                    <div>
                        <label className={`fade-color ${theme} block text-sm sm:text-base font-medium mb-2`}>
                            Max Participants
                        </label>
                        <input
                            type="number"
                            value={maxParticipants}
                            onChange={(e) => setMaxParticipants(e.target.value)}
                            min={1}
                            max={500}
                            className={`field-color ${theme} w-full py-2 sm:py-3 px-3 sm:px-4 rounded-sm bg-transparent outline-none text-sm sm:text-base`}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`button-color ${theme} w-full bg-blue-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-md hover:bg-blue-600 transition-colors duration-300 font-medium text-sm sm:text-base ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {isLoading ? 'Scheduling...' : 'Schedule Live Session'}
                </button>
            </form>
        </div>
    );
}