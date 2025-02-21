import { useState } from "react";
import "./services.css";

export default function Services() {
  const [comments, setComments] = useState([]); // Store user comments
  const [newComment, setNewComment] = useState(""); // Input field value

  const handleAddComment = () => {
    if (newComment.trim() === "") return; // Prevent empty comments

    setComments([...comments, newComment]); // Add new comment to the list
    setNewComment(""); // Clear input field
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
