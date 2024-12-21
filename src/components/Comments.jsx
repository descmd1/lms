import axios from "axios";
import { useState } from "react";
import * as jwt_decode from "jwt-decode";

export function Comments({ courseId }) {
  const [text, setText] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  const token = sessionStorage.getItem("user");
         if (token) {
             try {
                 const decodedUser = jwt_decode.jwtDecode(token);  
                 const userId = decodedUser?._id || decodedUser?.userId;  
                 console.log('Decoded User ID:', userId);
                 const response = await axios.post(`http://localhost:5001/comment`, { courseId, text }, {
                     headers: {
                         Authorization: `Bearer ${token}`, 
                     },
                 });
                 console.log(response)
                 setText("");
                 alert("Comment added!");
             } catch (error) {
                 console.error('Failed to post comment:', error);
             } 
         }
        }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-start w-full gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment"
        required
        className="flex border w-full bg-transparent p-3 rounded-md"
      />
      <button type="submit"
      className="flex items-center p-3 justify-center bg-blue-400 text-white rounded-md"
      >Post Comment</button>
    </form>
  );
}
