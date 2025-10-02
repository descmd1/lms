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
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const screenShareRef = useRef(null);
    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const wsRef = useRef(null);
    const chatMessagesEndRef = useRef(null);
    const chatMessagesContainerRef = useRef(null);

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

        // Set up periodic chat refresh and session info refresh to sync data across participants
        const chatRefreshInterval = setInterval(() => {
            loadChatMessages();
            refreshSessionInfo();
        }, 3000); // Refresh every 3 seconds for real-time feel

        // Close emoji picker when clicking outside
        const handleClickOutside = (event) => {
            if (showEmojiPicker && !event.target.closest('.emoji-picker-container')) {
                setShowEmojiPicker(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            cleanup();
            clearInterval(chatRefreshInterval);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [sessionId]);

    // Auto-scroll to bottom when new messages are added (only if user is already near bottom)
    useEffect(() => {
        if (chatMessagesContainerRef.current) {
            const container = chatMessagesContainerRef.current;
            const { scrollTop, scrollHeight, clientHeight } = container;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            
            // Only auto-scroll if user is already near the bottom (hasn't scrolled up to read older messages)
            if (isNearBottom) {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    }, [chatMessages]);

    // Handle scroll events to show/hide scroll-to-bottom button
    useEffect(() => {
        const container = chatMessagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
            setShowScrollToBottom(!isNearBottom);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    // Function to scroll to bottom manually
    const scrollToBottom = () => {
        if (chatMessagesContainerRef.current) {
            const container = chatMessagesContainerRef.current;
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    // Emoji data for quick reactions
    const gestureEmojis = [
        { emoji: '👋', name: 'Wave' },
        { emoji: '👍', name: 'Thumbs Up' },
        { emoji: '👎', name: 'Thumbs Down' },
        { emoji: '👏', name: 'Clap' },
        { emoji: '🙌', name: 'Raise Hands' },
        { emoji: '👌', name: 'OK' },
        { emoji: '✋', name: 'Stop/High Five' },
        { emoji: '🤚', name: 'Raised Hand' },
        { emoji: '🖐️', name: 'Open Hand' },
        { emoji: '✌️', name: 'Peace' },
        { emoji: '🤞', name: 'Fingers Crossed' },
        { emoji: '👆', name: 'Point Up' },
        { emoji: '👇', name: 'Point Down' },
        { emoji: '👈', name: 'Point Left' },
        { emoji: '👉', name: 'Point Right' },
        { emoji: '🤝', name: 'Handshake' },
        { emoji: '🙏', name: 'Pray/Thank You' },
        { emoji: '💪', name: 'Strong' },
        // Head gestures
        { emoji: '😊', name: 'Happy' },
        { emoji: '😄', name: 'Big Smile' },
        { emoji: '🤔', name: 'Thinking' },
        { emoji: '😮', name: 'Surprised' },
        { emoji: '😕', name: 'Confused' },
        { emoji: '😅', name: 'Nervous Laugh' },
        { emoji: '🤨', name: 'Raised Eyebrow' },
        { emoji: '😐', name: 'Neutral' },
        { emoji: '🙄', name: 'Eye Roll' },
        { emoji: '😴', name: 'Sleepy' },
        { emoji: '🤯', name: 'Mind Blown' },
        { emoji: '🤩', name: 'Star Eyes' }
    ];

    // Add emoji to message
    const addEmoji = (emoji) => {
        setNewMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    // Send quick emoji reaction
    const sendQuickEmoji = async (emoji) => {
        if (emoji) {
            const message = {
                type: 'chat-message',
                text: emoji,
                userName,
                userRole,
                timestamp: new Date().toISOString(),
                id: Date.now() + Math.random()
            };
            
            setChatMessages(prev => [...prev, message]);
            
            try {
                const token = sessionStorage.getItem('user');
                await axios.post(`${base_url}/live-session/${sessionId}/message`, {
                    message: emoji,
                    timestamp: message.timestamp
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (error) {
                console.error('Error sending emoji:', error);
                setChatMessages(prev => 
                    prev.map(msg => 
                        msg.id === message.id 
                            ? { ...msg, failed: true }
                            : msg
                    )
                );
            }
        }
        setShowEmojiPicker(false);
    };

    const initializeLiveRoom = async () => {
        try {
            const token = sessionStorage.getItem('user');
            const decodedUser = jwt_decode.jwtDecode(token);
            
            // Fetch session details
            const response = await axios.post(`${base_url}/live-session/${sessionId}/join`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Join response:', response.data);
            setSession(response.data.session);
            
            // Set participant count from backend response
            setParticipants([
                { 
                    id: decodedUser.id || 'current-user',
                    name: userName,
                    role: userRole,
                    isCurrentUser: true
                }
            ]);
            
            // Update participant count from server
            console.log('Session joined. Participant count:', response.data.session.participantCount);
            console.log('Full session data:', response.data.session);

            // Add welcome and demo messages to demonstrate chat functionality
            const welcomeMessage = {
                type: 'system-message',
                text: `Welcome to the live session! You can now chat with other participants.`,
                userName: 'System',
                userRole: 'system',
                timestamp: new Date().toISOString(),
                id: 'welcome-' + Date.now()
            };

            // Add a demo message from tutor (if current user is not tutor)
            const demoMessages = [welcomeMessage];
            
            if (userRole !== 'tutor') {
                demoMessages.push({
                    type: 'chat-message',
                    text: 'Hello everyone! Welcome to today\'s session. Feel free to ask questions anytime.',
                    userName: 'Dr. Smith',
                    userRole: 'tutor',
                    timestamp: new Date(Date.now() - 30000).toISOString(), // 30 seconds ago
                    id: 'demo-tutor-' + Date.now()
                });
            }
            
            setChatMessages(demoMessages);
            console.log('Demo messages set:', demoMessages);
            
            // Load existing chat messages
            await loadChatMessages(true);
            
            // Refresh session info to get current participant count
            await refreshSessionInfo();
            
            // Initialize media devices
            await initializeMedia();
            
            // Initialize WebSocket connection for real-time communication
            initializeWebSocket();

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
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100,
                    channelCount: 2
                }
            });

            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                // Local video should be muted to prevent feedback, but ensure volume is set for remote
                localVideoRef.current.muted = true;
                localVideoRef.current.volume = 0; // Ensure no local audio feedback
            }

            // Configure remote video for audio playback
            if (remoteVideoRef.current) {
                remoteVideoRef.current.muted = false; // Allow remote audio
                remoteVideoRef.current.volume = 1.0; // Full volume for remote participants
                remoteVideoRef.current.autoplay = true;
            }

            // Initialize peer connection for WebRTC
            initializePeerConnection();
            
            // Test audio functionality
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length > 0) {
                console.log('Audio track found:', audioTracks[0].label);
                console.log('Audio track enabled:', audioTracks[0].enabled);
                console.log('Audio track settings:', audioTracks[0].getSettings());
                console.log('Audio track constraints:', audioTracks[0].getConstraints());
                
                // Ensure audio track is not muted by default
                audioTracks[0].enabled = true;
                setIsMuted(false);
            }

        } catch (error) {
            console.error('Error accessing media devices:', error);
            let errorMessage = 'Could not access camera/microphone.';
            
            if (error.name === 'NotAllowedError') {
                errorMessage = 'Camera/microphone access denied. Please allow permissions and refresh the page.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'No camera/microphone found. Please ensure your devices are connected.';
            }
            
            Swal.fire('Warning', errorMessage, 'warning');
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
            console.log('Remote track received:', event.track.kind, event.track.label);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
                // Ensure remote audio is not muted
                remoteVideoRef.current.muted = false;
                remoteVideoRef.current.volume = 1.0;
                remoteVideoRef.current.autoplay = true;
                
                // Log audio track info for debugging
                const stream = event.streams[0];
                const audioTracks = stream.getAudioTracks();
                if (audioTracks.length > 0) {
                    console.log('Remote audio track:', audioTracks[0].label, 'enabled:', audioTracks[0].enabled);
                }
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
                
                console.log('Audio track toggled:', {
                    enabled: audioTrack.enabled,
                    muted: !audioTrack.enabled,
                    readyState: audioTrack.readyState,
                    label: audioTrack.label
                });
                
                // Show user feedback with toast
                const message = audioTrack.enabled ? 'Microphone unmuted' : 'Microphone muted';
                const icon = audioTrack.enabled ? 'success' : 'info';
                
                Swal.fire({
                    title: message,
                    icon: icon,
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
                
                console.log(message);
            } else {
                console.error('No audio track found');
                Swal.fire('Error', 'No audio track available. Please refresh and allow microphone access.', 'error');
            }
        } else {
            console.error('No local stream available');
            Swal.fire('Error', 'No audio stream available. Please refresh the page.', 'error');
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

    const endSession = async () => {
        try {
            // Check if user is a tutor
            if (userRole !== 'tutor') {
                Swal.fire('Permission Denied', 'Only tutors can end live sessions', 'error');
                return;
            }

            const result = await Swal.fire({
                title: 'End Session?',
                text: 'This will end the session for all participants. This action cannot be undone.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'End Session',
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                const token = sessionStorage.getItem('user');
                console.log('Ending session with token:', token ? 'Present' : 'Missing');
                
                const response = await axios.put(`${base_url}/live-session/${sessionId}/end`, {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('End session response:', response.data);
                
                Swal.fire({
                    title: 'Session Ended',
                    text: 'The live session has been ended successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                
                cleanup();
                navigate(-1);
            }
        } catch (error) {
            console.error('Error ending session:', error);
            console.error('Error details:', error.response?.data);
            
            let errorMessage = 'Failed to end session';
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.status === 401) {
                errorMessage = 'Authentication failed. Please log in again.';
            } else if (error.response?.status === 403) {
                errorMessage = 'You do not have permission to end this session.';
            } else if (error.response?.status === 404) {
                errorMessage = 'Session not found.';
            }
            
            Swal.fire('Error', errorMessage, 'error');
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

    const initializeWebSocket = () => {
        // For now, we'll create a mock WebSocket connection
        // In production, this would connect to your WebSocket server
        try {
            // This is a placeholder - replace with your actual WebSocket server URL
            // wsRef.current = new WebSocket(`ws://localhost:8080/live-session/${sessionId}`);
            
            // Mock WebSocket behavior for development
            wsRef.current = {
                readyState: WebSocket.CONNECTING,
                send: (data) => {
                    console.log('WebSocket send (mock):', data);
                    // In development, we'll just handle messages locally
                },
                close: () => {
                    console.log('WebSocket closed (mock)');
                }
            };

            // Simulate connection established
            setTimeout(() => {
                if (wsRef.current) {
                    wsRef.current.readyState = WebSocket.OPEN;
                    console.log('WebSocket connected (mock)');
                }
            }, 1000);
            
            // Uncomment below when you have a real WebSocket server
            /*
            wsRef.current.onopen = () => {
                console.log('WebSocket connected');
                // Join the room
                wsRef.current.send(JSON.stringify({
                    type: 'join-room',
                    sessionId,
                    userName,
                    userRole
                }));
            };

            wsRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                
                switch (data.type) {
                    case 'chat-message':
                        // Only add messages from other users
                        if (data.userName !== userName) {
                            setChatMessages(prev => [...prev, data]);
                        }
                        break;
                    case 'user-joined':
                        setParticipants(prev => [...prev, data.user]);
                        break;
                    case 'user-left':
                        setParticipants(prev => prev.filter(p => p.id !== data.userId));
                        break;
                    default:
                        console.log('Unknown message type:', data.type);
                }
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            wsRef.current.onclose = () => {
                console.log('WebSocket connection closed');
            };
            */

        } catch (error) {
            console.error('Error initializing WebSocket:', error);
        }
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
        if (wsRef.current && wsRef.current.close) {
            wsRef.current.close();
        }
    };

    const refreshSessionInfo = async () => {
        try {
            const token = sessionStorage.getItem('user');
            const response = await axios.get(`${base_url}/live-session/${sessionId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Refresh session response:', response.data);
            if (response.data.session) {
                const newParticipantCount = response.data.session.participantCount || response.data.session.participants?.length;
                console.log('Updating participant count to:', newParticipantCount);
                setSession(prev => ({
                    ...prev,
                    participantCount: newParticipantCount || prev?.participantCount || 1
                }));
            }
        } catch (error) {
            console.error('Error refreshing session info:', error);
        }
    };

    const loadChatMessages = async (isInitialLoad = false) => {
        try {
            const token = sessionStorage.getItem('user');
            const response = await axios.get(`${base_url}/live-session/${sessionId}/messages`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Chat messages response:', response.data);
            if (response.data.messages) {
                console.log('Raw messages from backend:', response.data.messages);
                const formattedMessages = response.data.messages
                    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) // Sort by timestamp
                    .map(msg => {
                        console.log('Processing message:', msg);
                        return {
                            type: 'chat-message',
                            text: msg.message || msg.text || '',
                            userName: msg.userName,
                            userRole: msg.userRole,
                            timestamp: msg.timestamp,
                            id: msg._id
                        };
                    });
                console.log('Formatted messages:', formattedMessages);
                
                if (isInitialLoad) {
                    // On initial load, set all messages
                    console.log('Setting initial messages:', formattedMessages);
                    setChatMessages(formattedMessages);
                } else {
                    // On refresh, merge with existing messages to avoid overwriting unsent ones
                    setChatMessages(prevMessages => {
                        const existingIds = new Set(formattedMessages.map(msg => msg.id));
                        const unseenMessages = prevMessages.filter(msg => 
                            typeof msg.id === 'number' || !existingIds.has(msg.id)
                        );
                        const mergedMessages = [...formattedMessages, ...unseenMessages];
                        console.log('Merged messages:', mergedMessages);
                        return mergedMessages;
                    });
                }
            }
        } catch (error) {
            console.error('Error loading chat messages:', error);
            // Don't show error to user, just log it
        }
    };

    const sendChatMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            const message = {
                type: 'chat-message',
                text: newMessage.trim(),
                userName,
                userRole,
                timestamp: new Date().toISOString(),
                id: Date.now() + Math.random() // Temporary ID
            };
            
            // Add message to local state immediately for better UX
            setChatMessages(prev => [...prev, message]);
            setNewMessage('');
            
            // Send message to backend for persistence
            try {
                const token = sessionStorage.getItem('user');
                const response = await axios.post(`${base_url}/live-session/${sessionId}/message`, {
                    message: message.text,
                    timestamp: message.timestamp
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                console.log('Message sent successfully:', response.data);
                console.log('Chat message from server:', response.data.chatMessage);
                
                // Update the message with the server response (including real ID)
                if (response.data.chatMessage) {
                    setChatMessages(prev => 
                        prev.map(msg => 
                            msg.id === message.id 
                                ? { ...msg, id: response.data.chatMessage._id }
                                : msg
                        )
                    );
                }
                
            } catch (error) {
                console.error('Error sending message to server:', error);
                console.error('Error details:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    message: error.message
                });
                
                // Show error indicator on the message
                setChatMessages(prev => 
                    prev.map(msg => 
                        msg.id === message.id 
                            ? { ...msg, failed: true }
                            : msg
                    )
                );
                
                let errorMessage = 'Failed to send message. Please try again.';
                if (error.response?.data?.error) {
                    errorMessage = error.response.data.error;
                } else if (error.response?.status === 403) {
                    errorMessage = 'You do not have permission to send messages. Please ensure you are enrolled in this course.';
                } else if (error.response?.status === 401) {
                    errorMessage = 'Authentication failed. Please log in again.';
                }
                
                Swal.fire({
                    title: 'Message Failed',
                    text: errorMessage,
                    icon: 'error',
                    timer: 4000,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false
                });
            }
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
        <div className={`app-container ${theme} h-screen flex flex-col overflow-hidden`}>
            {/* Header */}
            <div className={`field-color ${theme} shadow-sm border-b p-4 flex-shrink-0`}>
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
                            {session?.participantCount || participants.length} participant{(session?.participantCount || participants.length) !== 1 ? 's' : ''} in session
                            {userRole === 'tutor' && !isScreenSharing && (
                                <span className={`fade-color ${theme} ml-2`}>• Click the screen icon to share your screen</span>
                            )}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {userRole === 'tutor' && (
                            <button
                                onClick={endSession}
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                                <FaStop />
                                End Session
                            </button>
                        )}
                        <button
                            onClick={leaveSession}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center gap-2"
                        >
                            <FaPhone />
                            Leave Session
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex min-h-0">
                {/* Video Area */}
                <div className="flex-1 p-4 flex flex-col">
                    <div className={`${isScreenSharing ? 'grid grid-cols-1 lg:grid-cols-3 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'} flex-1 min-h-0`}>
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
                    <div className="flex justify-center mt-4 space-x-4 flex-shrink-0">
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
                        
                        {/* Debug: Show user role */}
                        <div className="text-xs text-gray-500 self-center">
                            Role: {userRole}
                        </div>
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
                <div className={`field-color ${theme} w-80 border-l flex flex-col min-h-0 overflow-hidden`}>
                    {/* Participants List */}
                    <div className="p-4 border-b flex-shrink-0">
                        <h3 className={`text-color ${theme} font-semibold flex items-center gap-2 mb-2`}>
                            <FaUsers />
                            Participants ({session?.participantCount || participants.length})
                        </h3>
                        <div className="space-y-1">
                            {participants.map((participant, index) => (
                                <div key={participant.id || index} className={`fade-color ${theme} text-sm py-1 flex items-center justify-between`}>
                                    <span>
                                        {participant.name}
                                        {participant.isCurrentUser && ' (You)'}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {participant.role === 'tutor' && (
                                            <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                                                Tutor
                                            </span>
                                        )}
                                        <div className="w-2 h-2 bg-green-500 rounded-full" title="Online"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 flex flex-col relative overflow-hidden">
                        <div className="p-4 border-b flex-shrink-0">
                            <h3 className={`text-color ${theme} font-semibold flex items-center gap-2`}>
                                <FaComments />
                                Chat
                            </h3>
                        </div>
                        
                        <div ref={chatMessagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth min-h-0">
                            {chatMessages.length === 0 ? (
                                <div className={`fade-color ${theme} text-sm text-center py-8`}>
                                    No messages yet. Start the conversation!
                                </div>
                            ) : (
                                chatMessages.map((message, index) => (
                                    <div key={message.id || index} className="text-sm">
                                        {message.userRole === 'system' ? (
                                            // System message styling
                                            <div className="text-center my-2">
                                                <div className={`fade-color ${theme} text-xs bg-gray-100 ${theme === 'dark' ? 'bg-gray-800' : ''} px-3 py-2 rounded-full inline-block`}>
                                                    {message.text}
                                                </div>
                                            </div>
                                        ) : (
                                            // Regular message styling
                                            <>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`font-medium ${message.userName === userName ? 'text-blue-600' : 'text-color'} ${theme}`}>
                                                        {message.userName}
                                                        {message.userName === userName && ' (You)'}
                                                    </span>
                                                    {message.userRole === 'tutor' && (
                                                        <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                                                            Tutor
                                                        </span>
                                                    )}
                                                    <span className={`fade-color ${theme} text-xs ml-auto`}>
                                                        {new Date(message.timestamp).toLocaleTimeString([], { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit' 
                                                        })}
                                                    </span>
                                                </div>
                                                <div className={`${message.userName === userName ? 'bg-blue-50' : 'bg-gray-50'} ${theme === 'dark' ? (message.userName === userName ? 'bg-blue-900/20' : 'bg-gray-800/20') : ''} p-2 rounded-md relative`}>
                                                    <div className={`text-color ${theme}`}>
                                                        {message.text || '[No message text]'}
                                                        {/* Debug info */}
                                                        {!message.text && (
                                                            <div className="text-red-500 text-xs mt-1">
                                                                Debug: message object = {JSON.stringify(message)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {message.failed && (
                                                        <div className="absolute top-1 right-1 text-red-500 text-xs">
                                                            <span title="Failed to send">⚠️</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                            <div ref={chatMessagesEndRef} />
                        </div>

                        {/* Scroll to bottom button */}
                        {showScrollToBottom && (
                            <div className="absolute bottom-20 right-4">
                                <button
                                    onClick={scrollToBottom}
                                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors z-10"
                                    title="Scroll to bottom"
                                >
                                    ↓
                                </button>
                            </div>
                        )}

                        {/* Chat Input */}
                        <form onSubmit={sendChatMessage} className="p-4 border-t relative flex-shrink-0">
                            <div className="flex space-x-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Escape') {
                                                setShowEmojiPicker(false);
                                            }
                                        }}
                                        placeholder="Type a message and press Enter..."
                                        className={`field-color ${theme} w-full pl-3 pr-10 py-2 rounded-md text-sm bg-transparent border-2 border-transparent focus:border-blue-500 outline-none transition-colors`}
                                        maxLength={500}
                                        autoComplete="off"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-lg"
                                        title="Add emoji"
                                    >
                                        😊
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    title="Send message (Enter)"
                                >
                                    Send
                                </button>
                            </div>
                            
                            {/* Emoji Picker */}
                            {showEmojiPicker && (
                                <div className={`emoji-picker-container absolute bottom-full right-0 mb-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border border-gray-300 rounded-lg shadow-lg p-3 w-80 max-h-60 overflow-y-auto z-20`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className={`text-sm font-medium text-color ${theme}`}>Quick Reactions</h4>
                                        <button
                                            type="button"
                                            onClick={() => setShowEmojiPicker(false)}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    
                                    {/* Quick reaction buttons */}
                                    <div className="grid grid-cols-8 gap-1 mb-3">
                                        {['👋', '👍', '👎', '👏', '🙌', '👌', '😊', '🤔'].map((emoji) => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => sendQuickEmoji(emoji)}
                                                className="p-1 text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                                title={`Send ${emoji}`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <div className="border-t pt-2">
                                        <p className={`text-xs text-gray-500 mb-2`}>Click to add to message:</p>
                                        <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                                            {gestureEmojis.map((item, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => addEmoji(item.emoji)}
                                                    className="p-1 text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                                    title={item.name}
                                                >
                                                    {item.emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className={`fade-color ${theme} text-xs mt-1 text-right`}>
                                {newMessage.length}/500
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}