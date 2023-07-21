// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const app = express();
// Use cors and body-parser
app.use(cors());
app.use(bodyParser.json());
const posts = {};
// Function to handle events
const handleEvent = (type, data) => {
    if (type === 'PostCreated') {
        const { id, title } = data;
        // Create a new post with id and title
        posts[id] = { id, title, comments: [] };
    }
    if (type === 'CommentCreated') {
        const { id, content, postId, status } = data;
        // Find the post with postId
        const post = posts[postId];
        // Create a new comment with id, content, status
        const comment = { id, content, status };
        // Push the comment to the post's comments array
        post.comments.push(comment);
    }
    if (type === 'CommentUpdated') {
        const { id, content, postId, status } = data;
        // Find the post with postId
        const post = posts[postId];
        // Find the comment with id
        const comment = post.comments.find(comment => {
            return comment.id === id;
        });
        // Update the comment's content and status
        comment.status = status;
        comment.content = content;
    }
};
// Get request to get all posts
app.get('/posts', (req, res) => {
    // Send posts object
    res.send(posts);
});
// Post request to receive events
app.post('/events', (req, res) => {
    const { type, data } = req.body;
    // Handle the event
    handleEvent(type, data);
    // Send response
    res.send({});
});
// Listen on port 4002
app.listen(4002, async () => {
    // Log that the server is listening
    console.log('Listening on 4002');
    // Get all events from event-bus
    const res = await axios.get('http://localhost:4005/events');
    // For each event, call handleEvent function
    for (let event of res.data) {
        console.log('Processing event:', event.type);
        handleEvent(event.type, event.data);
    }
});