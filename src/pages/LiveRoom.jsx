import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as jwt_decode from "jwt-decode";
import { useTheme } from '../components/ThemeContext';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhone, FaComments, FaUsers, FaDesktop, FaStop } from 'react-icons/fa';
import Swal from 'sweetalert2';

const base_url = process.env.REACT_APP_BASE_URL;

// Simple peer-to-peer configuration (in production, you'd use a TURN server)
const rtcConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

export function LiveRoom() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [userRole, setUserRole] = useState('');
    const [userName, setUserName] = useState('');
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [originalStream, setOriginalStream] = useState(null);
    
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const screenShareRef = useRef(null);
    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const wsRef = useRef(null);

    useEffect(() => {
        // Get user info
        const token = sessionStorage.getItem('user');
        if (!token) {
            navigate('/login');
            return;
        }

        const decodedUser = jwt_decode.jwtDecode(token);
        setUserRole(decodedUser.role);
        setUserName(decodedUser.name);

        // Initialize the live room
        initializeLiveRoom();

        return () => {
            cleanup();
        };
    }, [sessionId]);

    const initializeLiveRoom = async () => {
        try {
            const token = sessionStorage.getItem('user');
            
            // Fetch session details
            const response = await axios.post(`${base_url}/live-session/${sessionId}/join`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setSession(response.data.session);
            
            // Initialize media devices
            await initializeMedia();
            
            // Initialize WebSocket connection (you'd implement this for real-time communication)
            // initializeWebSocket(response.data.roomId);

        } catch (error) {
            console.error('Error joining live session:', error);
            Swal.fire('Error', error.response?.data?.error || 'Failed to join session', 'error');
            navigate(-1);
        } finally {
            setIsLoading(false);
        }
    };

    const initializeMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Initialize peer connection for WebRTC
            initializePeerConnection();

        } catch (error) {
            console.error('Error accessing media devices:', error);
            Swal.fire('Warning', 'Could not access camera/microphone. You may not be able to participate fully.', 'warning');
        }
    };

    const initializePeerConnection = () => {
        peerConnectionRef.current = new RTCPeerConnection(rtcConfiguration);

        // Add local stream to peer connection
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                peerConnectionRef.current.addTrack(track, localStreamRef.current);
            });
        }

        // Handle remote stream
        peerConnectionRef.current.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        // Handle ICE candidates
        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate && wsRef.current) {
                // Send ICE candidate to other peers via WebSocket
                wsRef.current.send(JSON.stringify({
                    type: 'ice-candidate',
                    candidate: event.candidate
                }));
            }
        };
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    const startScreenShare = async () => {
        try {
            // Check if user is tutor (only tutors can share screen)
            if (userRole !== 'tutor') {
                Swal.fire({
                    title: 'Permission Denied',
                    text: 'Only tutors can share their screen',
                    icon: 'warning'
                });
                return;
            }

            // Get screen share stream
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    mediaSource: 'screen',
                    width: { ideal: 1920, max: 1920 },
                    height: { ideal: 1080, max: 1080 },
                    frameRate: { ideal: 30, max: 60 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            // Store original camera stream
            setOriginalStream(localStreamRef.current);
            screenStreamRef.current = screenStream;

            // Update video display
            if (screenShareRef.current) {
                screenShareRef.current.srcObject = screenStream;
            }

            // Replace video track in peer connection
            if (peerConnectionRef.current) {
                const videoTrack = screenStream.getVideoTracks()[0];
                const sender = peerConnectionRef.current.getSenders().find(s => 
                    s.track && s.track.kind === 'video'
                );
                if (sender) {
                    await sender.replaceTrack(videoTrack);
                }
            }

            setIsScreenSharing(true);

            // Handle screen share end (when user clicks "Stop sharing" in browser)
            screenStream.getVideoTracks()[0].onended = () => {
                stopScreenShare();
            };

            Swal.fire({
                title: 'Screen Sharing Started',
                text: 'Your screen is now being shared with participants',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

        } catch (error) {
            console.error('Error starting screen share:', error);
            if (error.name === 'NotAllowedError') {
                Swal.fire({
                    title: 'Permission Denied',
                    text: 'Screen sharing permission was denied. Please allow screen sharing to continue.',
                    icon: 'error'
                });
            } else {
                Swal.fire({
                    title: 'Screen Share Failed',
                    text: 'Could not start screen sharing. Please try again.',
                    icon: 'error'
                });
            }
        }
    };

    const stopScreenShare = async () => {
        try {
            // Stop screen share stream
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach(track => track.stop());
                screenStreamRef.current = null;
            }

            // Restore original camera stream
            if (originalStream && peerConnectionRef.current) {
                const videoTrack = originalStream.getVideoTracks()[0];
                const sender = peerConnectionRef.current.getSenders().find(s => 
                    s.track && s.track.kind === 'video'
                );
                if (sender && videoTrack) {
                    await sender.replaceTrack(videoTrack);
                }
            }

            // Update video display back to camera
            if (localVideoRef.current && originalStream) {
                localVideoRef.current.srcObject = originalStream;
            }

            setIsScreenSharing(false);
            setOriginalStream(null);

            Swal.fire({
                title: 'Screen Sharing Stopped',
                text: 'You are no longer sharing your screen',
                icon: 'info',
                timer: 2000,
                showConfirmButton: false
            });

        } catch (error) {
            console.error('Error stopping screen share:', error);
            Swal.fire({
                title: 'Error',
                text: 'There was an issue stopping screen share',
                icon: 'error'
            });
        }
    };

    const leaveSession = async () => {
        try {
            const token = sessionStorage.getItem('user');
            await axios.post(`${base_url}/live-session/${sessionId}/leave`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error leaving session:', error);
        }
        
        cleanup();
        navigate(-1);
    };

    const cleanup = () => {
        // Stop local stream
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }

        // Stop screen share stream
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
        }

        // Stop original stream
        if (originalStream) {
            originalStream.getTracks().forEach(track => track.stop());
        }

        // Close peer connection
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }

        // Close WebSocket
        if (wsRef.current) {
            wsRef.current.close();
        }
    };

    const sendChatMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && wsRef.current) {
            const message = {
                type: 'chat-message',
                text: newMessage,
                userName,
                timestamp: new Date().toISOString()
            };
            
            wsRef.current.send(JSON.stringify(message));
            setChatMessages(prev => [...prev, message]);
            setNewMessage('');
        }
    };

    if (isLoading) {
        return (
            <div className={`app-container ${theme} min-h-screen flex items-center justify-center`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
                    <p className={`text-color ${theme} mt-4 text-lg`}>Joining live session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`app-container ${theme} min-h-screen flex flex-col`}>
            {/* Header */}
            <div className={`field-color ${theme} shadow-sm border-b p-4`}>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className={`text-color ${theme} text-xl font-bold`}>
                            {session?.title || 'Live Session'}
                            {isScreenSharing && (
                                <span className="ml-2 inline-flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                    <FaDesktop className="w-3 h-3" />
                                    Screen Sharing
                                </span>
                            )}
                        </h1>
                        <p className={`fade-color ${theme} text-sm`}>
                            {participants.length} participant{participants.length !== 1 ? 's' : ''} in session
                            {userRole === 'tutor' && !isScreenSharing && (
                                <span className={`fade-color ${theme} ml-2`}>• Click the screen icon to share your screen</span>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={leaveSession}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                        <FaPhone />
                        Leave Session
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* Video Area */}
                <div className="flex-1 p-4">
                    <div className={`${isScreenSharing ? 'grid grid-cols-1 lg:grid-cols-3 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'} h-full`}>
                        {/* Screen Share Display (when active) */}
                        {isScreenSharing && (
                            <div className="lg:col-span-2 relative bg-gray-900 rounded-lg overflow-hidden">
                                <video
                                    ref={screenShareRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    Screen Sharing
                                </div>
                                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                    {userName}'s Screen
                                </div>
                            </div>
                        )}

                        {/* Local Video */}
                        <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${isScreenSharing ? 'lg:col-span-1' : ''}`}>
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className={`w-full h-full object-cover ${isScreenSharing ? 'object-contain' : ''}`}
                            />
                            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                You ({userRole})
                            </div>
                            {isVideoOff && (
                                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                    <div className="text-white text-center">
                                        <FaVideoSlash className="mx-auto mb-2" size={24} />
                                        <p>Camera Off</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Remote Video */}
                        {!isScreenSharing && (
                            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                    {userRole === 'tutor' ? 'Students' : 'Tutor'}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex justify-center mt-4 space-x-4">
                        <button
                            onClick={toggleMute}
                            className={`p-3 rounded-full transition-colors ${
                                isMuted 
                                    ? 'bg-red-500 hover:bg-red-600' 
                                    : 'bg-gray-600 hover:bg-gray-700'
                            } text-white`}
                            title={isMuted ? 'Unmute' : 'Mute'}
                        >
                            {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                        </button>
                        <button
                            onClick={toggleVideo}
                            className={`p-3 rounded-full transition-colors ${
                                isVideoOff 
                                    ? 'bg-red-500 hover:bg-red-600' 
                                    : 'bg-gray-600 hover:bg-gray-700'
                            } text-white`}
                            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                        >
                            {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
                        </button>
                        
                        {/* Screen Share Button - Only show for tutors */}
                        {userRole === 'tutor' && (
                            <button
                                onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                                className={`p-3 rounded-full transition-colors ${
                                    isScreenSharing 
                                        ? 'bg-red-500 hover:bg-red-600' 
                                        : 'bg-blue-600 hover:bg-blue-700'
                                } text-white`}
                                title={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
                            >
                                {isScreenSharing ? <FaStop /> : <FaDesktop />}
                            </button>
                        )}
                    </div>
                    
                    {/* Screen Sharing Status */}
                    {isScreenSharing && (
                        <div className="mt-4 text-center">
                            <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                You are sharing your screen
                            </div>
                        </div>
                    )}
                </div>

                {/* Chat Sidebar */}
                <div className={`field-color ${theme} w-80 border-l flex flex-col`}>
                    {/* Participants List */}
                    <div className="p-4 border-b">
                        <h3 className={`text-color ${theme} font-semibold flex items-center gap-2 mb-2`}>
                            <FaUsers />
                            Participants ({participants.length})
                        </h3>
                        <div className="space-y-1">
                            {participants.map((participant, index) => (
                                <div key={index} className={`fade-color ${theme} text-sm py-1`}>
                                    {participant.name} {participant.role === 'tutor' && '(Tutor)'}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 flex flex-col">
                        <div className="p-4 border-b">
                            <h3 className={`text-color ${theme} font-semibold flex items-center gap-2`}>
                                <FaComments />
                                Chat
                            </h3>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {chatMessages.map((message, index) => (
                                <div key={index} className="text-sm">
                                    <div className={`fade-color ${theme} text-xs`}>
                                        {message.userName} - {new Date(message.timestamp).toLocaleTimeString()}
                                    </div>
                                    <div className={`text-color ${theme}`}>
                                        {message.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={sendChatMessage} className="p-4 border-t">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className={`field-color ${theme} flex-1 px-3 py-2 rounded-md text-sm bg-transparent outline-none`}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Send
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}