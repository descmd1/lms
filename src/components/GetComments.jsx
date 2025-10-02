import axios from "axios";
import { useEffect, useState } from "react";
import { useTheme } from "./ThemeContext";
import { FaComments, FaClock } from 'react-icons/fa';
import { BiMessage } from 'react-icons/bi';

const base_url = process.env.REACT_APP_BASE_URL;

export function GetComments({ courseId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { theme } = useTheme();

  useEffect(() => {
    const fetchComments = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`${base_url}/comment/${courseId}`);
        setComments(response.data.comments || []);
        setError("");
      } catch (error) {
        console.error("Error fetching comments:", error);
        setError("Failed to load comments");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [courseId]);

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return commentDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-sm text-gray-600">Loading comments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 text-red-600">
        <BiMessage className="text-3xl mx-auto mb-2 opacity-50" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-h-80 overflow-y-auto">
      <div className="flex items-center gap-2 mb-4 px-2">
        <FaComments className="text-blue-500" />
        <h4 className="font-semibold text-sm">Recent Comments ({comments.length})</h4>
      </div>
      
      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.slice(0, 5).map((comment, index) => (
            <div key={comment._id || index} className={`field-color ${theme} p-3 rounded-lg border border-gray-200/30 dark:border-gray-700/30 hover:shadow-sm transition-all duration-200`}>
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {comment.user?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-blue-600 dark:text-blue-400 text-sm truncate">{comment.user || 'Anonymous'}</span>
                    <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                      <FaClock className="w-2 h-2" />
                      {formatTimeAgo(comment.createdAt)}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed break-words line-clamp-2">{comment.text}</p>
                </div>
              </div>
            </div>
          ))}
          {comments.length > 5 && (
            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">Showing 5 of {comments.length} comments</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-8">
          <BiMessage className="text-4xl text-gray-400 mx-auto mb-2" />
          <h4 className="font-medium text-gray-600 dark:text-gray-400 mb-1">No comments yet</h4>
          <p className="text-sm text-gray-500">Be the first to comment!</p>
        </div>
      )}
    </div>
  );
}
