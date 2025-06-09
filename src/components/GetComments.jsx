import axios from "axios";
import { useEffect, useState } from "react";

const base_url = process.env.REACT_APP_BASE_URL;

export function GetComments({ courseId }) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`${base_url}/comment/${courseId}`);
        setComments(response.data.comments);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [courseId]);

  return (
    <div className="flex flex-col items-center justify-center p-3 w-full gap-3">
      {/* <h3>Comments</h3> */}
      {comments.length > 0 ? (
        comments.map((comment, index) => (
          <div key={index} className="flex w-full text-justify gap-2">
            <strong className="text-blue-400">{comment.user}</strong>
            <p className="font-normal text-gray-400 w-full">{comment.text}</p>
            {/* <small>{new Date(comment.createdAt).toLocaleString()}</small> */}
          </div>
        ))
      ) : (
        <p>No comments yet.</p>
      )}
    </div>
  );
}
