import { useState, useEffect } from "react";
import axios from "axios";

export function Comments({ courseId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
  
    useEffect(() => {
      fetch(`http://localhost:5001/comments?courseId=${courseId}`)
        .then((res) => res.json())
        .then(setComments);
    }, [courseId]);
  
    const handleSubmit = async () => {
      await fetch('http://localhost:5001/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, commentText: newComment })
      });
      setNewComment('');
      // Refresh comments
    };
  
    return (
      <div>
        {comments.map(comment => (
        
            <div key={comment._id}>
              {comment.commentText}
            </div>
          
        
        ))}
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button onClick={handleSubmit}>Post Comment</button>
      </div>
    );
  }
  