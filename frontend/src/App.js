import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [posts, setPosts] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);

  // Redirect user to LinkedIn for authentication
  const handleLinkedInLogin = () => {
    window.location.href = 'http://localhost:3060/auth/linkedin';
  };

  // Fetch posts from the backend
  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:3060/fetch-posts');
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  // Like a post
  const likePost = async (postId) => {
    try {
      const response = await axios.post('http://localhost:3060/like-post', {
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
      const response = await axios.post('http://localhost:3060/comment-post', {
        postId,
        comment,
      });
      console.log('Comment added:', response.data);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Check if user is logged in and fetch posts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authResponse = await axios.get('http://localhost:3060/auth-status');
        setLoggedIn(authResponse.data.loggedIn);

        if (authResponse.data.loggedIn) {
          // Fetch posts after user is authenticated
          fetchPosts();
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    checkAuth();
  }, []);

  if (!loggedIn) {
    return <button onClick={handleLinkedInLogin}>Login with LinkedIn</button>;
  }

  return (
    <div>
      <h1>Zaptas Technology Posts</h1>
      {posts.length === 0 ? (
        <p>No posts available</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="post">
            <h3>{post.content}</h3>
            <button onClick={() => likePost(post.id)}>Like</button>
            <input
              type="text"
              placeholder="Add a comment"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  commentOnPost(post.id, e.target.value);
                  e.target.value = '';
                }
              }}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default App;
