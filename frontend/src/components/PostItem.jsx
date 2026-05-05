import React from "react";

function PostItem({ post }) {
  return (
    <div style={styles.card}>
      <h4>
        {post.type === "Lost" ? "❌" : "✅"} {post.title}
      </h4>
      <p>{post.desc}</p>
      <small>{post.date}</small>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ddd",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
  },
};

export default PostItem;