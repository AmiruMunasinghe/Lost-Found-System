import React from "react";
import PostItem from "./PostItem";

function PostList({ posts }) {
  return (
    <div>
      <h3>📌 Posts</h3>

      {posts.length === 0 ? (
        <p>No posts yet</p>
      ) : (
        posts.map((post) => <PostItem key={post.id} post={post} />)
      )}
    </div>
  );
}

export default PostList;