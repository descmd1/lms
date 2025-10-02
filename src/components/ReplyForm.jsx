import axios from "axios";
import { useState } from "react";
import { useTheme } from "./ThemeContext";
import { FaReply, FaSpinner, FaTimes } from 'react-icons/fa';

const base_url = process.env.REACT_APP_BASE_URL;

export function ReplyForm({ commentId, onReplyAdded, onCancel }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please enter a reply");
      return;
    }

    const token = sessionStorage.getItem("user");
    if (!token) {
      setError("Please login to reply");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${base_url}/comment/reply/${commentId}`,
        { text: text.trim() },
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          } 
        }
      );
      
      setText("");
      if (onReplyAdded) {
        onReplyAdded(response.data.reply);
      }
    } catch (error) {
      console.error("Error replying to comment:", error);
      setError(error.response?.data?.error || "Failed to post reply. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setText("");
    setError("");
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className={`field-color ${theme} p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50`}>
      {error && (
        <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError("");
            }}
            placeholder="Write a thoughtful reply..."
            required
            rows={3}
            maxLength={300}
            className={`field-color ${theme} w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm placeholder-gray-500`}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            {text.length}/300
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <button 
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center gap-1"
          >
            <FaTimes className="w-3 h-3" />
            Cancel
          </button>
          
          <button 
            type="submit"
            disabled={loading || !text.trim()}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
          >
            {loading ? (
              <FaSpinner className="animate-spin w-3 h-3" />
            ) : (
              <FaReply className="w-3 h-3" />
            )}
            {loading ? 'Posting...' : 'Reply'}
          </button>
        </div>
      </form>
    </div>
  );
}
