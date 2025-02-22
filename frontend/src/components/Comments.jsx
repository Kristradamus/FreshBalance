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
        <h1>Our Services</h1>
        <p>Discover how we can help you achieve your health and wellness goals.</p>
      </div>

      {/* Services List */}
      <div className="servicesList">
        {/* Map through services here */}
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        <h2>Leave a Comment</h2>
        <textarea 
          value={newComment} 
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write your comment here..."
        />
        <button onClick={handleAddComment}>Submit</button>

        {/* Display Comments */}
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
