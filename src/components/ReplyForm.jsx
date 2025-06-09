import axios from "axios";
import { useState } from "react";

const base_url = process.env.REACT_APP_BASE_URL;

export function ReplyForm({ commentId, onReplyAdded }) {
  const [text, setText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${base_url}/comment/reply/${commentId}`,
        { text },
        { headers: { Authorization: "Bearer YOUR_TOKEN" } }
      );
      setText("");
      onReplyAdded(response.data.reply); // Update the UI
    } catch (error) {
      console.error("Error replying to comment:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-start w-full gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Reply to this comment"
        required
        className="flex w-full border rounded-md bg-transparent p-2"
      />
      <button type="submit"
      className="flex items-center p-2 bg-blue-400 text-white rounded-md"
      >Reply</button>
    </form>
  );
}
