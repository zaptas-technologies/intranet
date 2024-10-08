import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './Posts.css'; // Import the CSS file

export const Posts = () => {
  const accessToken = localStorage.getItem('linkedinToken');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized fetchPosts function
  const fetchPosts = useCallback(async () => {
    try {
      const response = await axios.get(`http://162.241.149.204:3060/fetch?access_token=${accessToken}`);
      setPosts(response.data.data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  }, [accessToken]); // Make sure 'accessToken' is in the dependency array

  // Like a post
  const likePost = async (postId) => {
    try {
      const response = await axios.post('http://162.241.149.204:3060/like-post', {
        postId,
      });
      console.log('Post liked:', response.data);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // Comment on a post
  const commentOnPost = async (postId, comment) => {
    try {
      const response = await axios.post('http://162.241.149.204:3060/comment-post', {
        postId,
        comment,
      });
      console.log('Comment added:', response.data);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Fetch posts when the component mounts
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]); // Now 'fetchPosts' is included in the dependency array

  return (
    <div>
      <h1>Zaptas Technology Posts</h1>
      {loading ? (
        <p>Loading posts...</p>
      ) : error ? (
        <p>{error}</p>
      ) : posts && posts.length > 0 ? (
        <div className="grid">
          {posts.map((post) => (
            <div key={post.id} className="post">
              <h9>{post.commentary}</h9>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post visual content"
                  className="post-image"
                />
              )}
              <button onClick={() => likePost(post.id)}>Like</button>
              <input
                type="text"
                placeholder="Add a comment"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    commentOnPost(post.id, e.target.value);
                    e.target.value = ''; // Clear the input field
                  }
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <p>No posts available.</p>
      )}
    </div>
  );
};
