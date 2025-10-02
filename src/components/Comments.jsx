import axios from "axios";
import { useState } from "react";
import * as jwt_decode from "jwt-decode";
import { useTheme } from "./ThemeContext";
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { BiMessage } from 'react-icons/bi';

const base_url = process.env.REACT_APP_BASE_URL;

export function Comments({ courseId, onCommentAdded }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please enter a comment");
      return;
    }

    const token = sessionStorage.getItem("user");
    if (!token) {
      setError("Please login to post a comment");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const decodedUser = jwt_decode.jwtDecode(token);
      const response = await axios.post(`${base_url}/comment`, { 
        courseId, 
        text: text.trim() 
      }, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
      
      setText("");
      setSuccess("Comment posted successfully!");
      
      // Call callback to refresh comments
      if (onCommentAdded) {
        onCommentAdded(response.data.comment);
      }
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error('Failed to post comment:', error);
      setError(error.response?.data?.error || "Failed to post comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`field-color ${theme} p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50`}>
      <div className="flex items-center gap-3 mb-4">
        <BiMessage className="text-blue-500 text-xl" />
        <h3 className="text-lg font-semibold">Add a Comment</h3>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError("");
            }}
            placeholder="Share your thoughts about this course..."
            required
            rows={4}
            maxLength={500}
            className={`field-color ${theme} w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500`}
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-500">
            {text.length}/500
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={loading || !text.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
          >
            {loading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaPaperPlane />
            )}
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>
    </div>
  );
}
