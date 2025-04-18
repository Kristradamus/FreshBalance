import { useState} from "react";
import { useTranslation } from "react-i18next";
import "./Comments.css";

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const { t } = useTranslation();
  
  const handleAddComment = () => {
    if (newComment.trim() === "") return;
      
    setComments([...comments, newComment]);
    setNewComment("");
  };
  
  return (
    <div className="comments">
      <div className="commentsSection">
        <h2>Leave a Comment</h2>
        <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write your comment here..."/>
        <button onClick={handleAddComment}>Submit</button>
        <div className="commentsList">
          {comments.map((comment, index) => (
            <div key={index} className="comment">
              <p>{comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Comments;