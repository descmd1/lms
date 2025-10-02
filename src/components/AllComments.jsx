import { useState, useEffect } from "react";
import axios from "axios";
import { ReplyForm } from "./ReplyForm";
import { useTheme } from "./ThemeContext";
import { FaComments, FaReply, FaUser, FaClock, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { BiMessage } from 'react-icons/bi';

const base_url = process.env.REACT_APP_BASE_URL;

export function AllComments({ courseId, refreshTrigger }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedReplies, setExpandedReplies] = useState({});
  const [showReplyForm, setShowReplyForm] = useState({});
  const { theme } = useTheme();

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/comment/${courseId}`);
      setComments(response.data.comments || []);
      setError("");
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Failed to load comments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchComments();
    }
  }, [courseId, refreshTrigger]);

  const handleReplyAdded = (commentId, newReply) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment._id === commentId
          ? { ...comment, replies: [...(comment.replies || []), newReply] }
          : comment
      )
    );
    setShowReplyForm({ ...showReplyForm, [commentId]: false });
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies({
      ...expandedReplies,
      [commentId]: !expandedReplies[commentId]
    });
  };

  const toggleReplyForm = (commentId) => {
    setShowReplyForm({
      ...showReplyForm,
      [commentId]: !showReplyForm[commentId]
    });
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return commentDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={`field-color ${theme} p-8 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading comments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`field-color ${theme} p-8 rounded-2xl shadow-lg border border-red-200 dark:border-red-800`}>
        <div className="text-center text-red-600">
          <BiMessage className="text-4xl mx-auto mb-2 opacity-50" />
          <p>{error}</p>
          <button 
            onClick={fetchComments}
            className="mt-3 text-blue-500 hover:text-blue-600 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`field-color ${theme} rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden`}>
      <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3">
          <FaComments className="text-blue-500 text-xl" />
          <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {comments.length > 0 ? (
          <div className="p-6 space-y-6">
            {comments.map((comment) => (

              <div key={comment._id} className={`field-color ${theme} p-4 rounded-xl border border-gray-200/30 dark:border-gray-700/30 hover:shadow-md transition-all duration-200`}>
                {/* Comment Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {comment.user?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{comment.user || 'Anonymous'}</span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <FaClock className="w-3 h-3" />
                        {formatTimeAgo(comment.createdAt)}
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed break-words">{comment.text}</p>
                  </div>
                </div>

                {/* Comment Actions */}
                <div className="flex items-center gap-4 ml-13">
                  <button
                    onClick={() => toggleReplyForm(comment._id)}
                    className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 transition-colors duration-200"
                  >
                    <FaReply className="w-3 h-3" />
                    Reply
                  </button>
                  
                  {comment.replies && comment.replies.length > 0 && (
                    <button
                      onClick={() => toggleReplies(comment._id)}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-600 transition-colors duration-200"
                    >
                      {expandedReplies[comment._id] ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                      {comment.replies.length} {comment.replies.length === 1 ? 'Reply' : 'Replies'}
                    </button>
                  )}
                </div>

                {/* Reply Form */}
                {showReplyForm[comment._id] && (
                  <div className="mt-4 ml-13">
                    <ReplyForm
                      commentId={comment._id}
                      onReplyAdded={(newReply) => handleReplyAdded(comment._id, newReply)}
                    />
                  </div>
                )}

                {/* Display Replies */}
                {expandedReplies[comment._id] && comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 ml-13 space-y-3 border-l-2 border-blue-200 dark:border-blue-800 pl-4">
                    {comment.replies.map((reply, index) => (
                      <div key={index} className={`field-color ${theme} p-3 rounded-lg border border-gray-100 dark:border-gray-800`}>
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {reply.user?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-green-600 dark:text-green-400 text-sm">{reply.user || 'Anonymous'}</span>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <FaClock className="w-2 h-2" />
                                {formatTimeAgo(reply.createdAt)}
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed break-words">{reply.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <BiMessage className="text-6xl text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No comments yet</h4>
            <p className="text-gray-500 dark:text-gray-500">Be the first to share your thoughts about this course!</p>
          </div>
        )}
      </div>
    </div>
  );
}


