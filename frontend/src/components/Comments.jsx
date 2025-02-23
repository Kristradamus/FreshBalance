import { useState, useRef, useEffect } from "react";
import "./Comments.css";

export default function Comments() {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim() === "") return;
    
    setComments([...comments, newComment]);
    setNewComment("");
  };

  return (
    <div className="services">
      <div className="servicesHeader">
        <h1>Comments</h1>
        <p>Check some of the comments other clients left us or leave one yourself.</p>
      </div>

      <div className="servicesList">
      </div>

      <div className="comments-section">
        <h2>Leave a Comment</h2>
        <textarea 
          value={newComment} 
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write your comment here..."
        />
        <button onClick={handleAddComment}>Submit</button>

        <div className="comments-list">
          {comments.map((comment, index) => (
            <div key={index} className="comment">
              <p>{comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
