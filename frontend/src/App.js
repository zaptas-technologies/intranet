import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [posts, setPosts] = useState([]);

  // Fetch posts from the backend
  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:3060/fetch');
      setPosts(response.data.elements); // Update to match the structure of your fetched data
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

  // Fetch posts when the component mounts
  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div>
    <h1>Zaptas Technology Posts</h1>
    
    {posts && posts.elements && posts.elements.length > 0 ? (
      posts.elements.map((post) => {
        const postId = post.id.split(':').pop(); // Extracting the actual ID
  
        return (
          <div key={postId} className="post">
            <h3>{post.commentary}</h3>
            {post.content.media && (
              <img
                src={`https://media.licdn.com/media/${post.content.media.id}.jpg`} // Adjust the URL if necessary
                alt={post.content.media.altText}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            )}
            <button onClick={() => likePost(postId)}>Like</button>
            <input
              type="text"
              placeholder="Add a comment"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  commentOnPost(postId, e.target.value);
                  e.target.value = '';
                }
              }}
            />
          </div>
        );
      })
    ) : (
      <p>No posts available.</p>
    )}
  </div>
  
  );
};

export default App;
