import { useState, useEffect } from "react";
import axios from "axios";
import { ReplyForm } from "./ReplyForm";
import * as jwt_decode from "jwt-decode";

const base_url = process.env.REACT_APP_BASE_URL;

export function AllComments({ courseId }) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
        const token = sessionStorage.getItem("user");
        if (token) {
        const decodedUser = jwt_decode.jwtDecode(token);  
        const userId = decodedUser?._id || decodedUser?.userId;  
        console.log('Decoded User ID:', userId);
      try {
        const response = await axios.get(`${base_url}/comment/${courseId}`);
        setComments(response.data.comments);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
}
    fetchComments();
  }, [courseId]);

  const handleReplyAdded = (commentId, newReply) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment._id === commentId
          ? { ...comment, replies: [...comment.replies, newReply] }
          : comment
      )
    );
  };

  return (
    <div className="w-full flex flex-col items-start justify-center shadow-md rounded-md gap-3 p-3">
      <h3>Comments</h3>
      {comments.length > 0 ? (
        comments.map((comment) => (
          <div key={comment._id} className="flex flex-col w-full text-justify gap-2">
            <div className="flex w-full text-justify gap-2">
            <strong>{comment.user}:</strong>
            <p className="text-gray-500 font-thin">{comment.text}</p>
            </div>
            <small className="flex justify-end">{new Date(comment.createdAt).toLocaleString()}</small>

            {/* Display replies */}
            <div className="flex w-full p-3"> 
              {comment.replies?.map((reply, index) => (
                <div key={index}>
                  <strong>{reply.user}</strong>
                  <p className="text-black font-thin">{reply.text}</p>
                  <small>{new Date(reply.createdAt).toLocaleString()}</small>
                </div>
              ))}
            </div>

            {/* Reply form */}
            <ReplyForm
              commentId={comment._id}
              onReplyAdded={(newReply) => handleReplyAdded(comment._id, newReply)}
            />
          </div>
        ))
      ) : (
        <p>No comments yet.</p>
      )}
    </div>
  );
}


