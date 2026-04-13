const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data structures
const messages = [];
let onlineUsers = 0;

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    onlineUsers++;
    
    // Send current online count to everyone
    io.emit('onlineUsersUpdate', onlineUsers);

    socket.on('join', (username) => {
        socket.username = username;
        // Notify others
        socket.broadcast.emit('systemMessage', `${username} joined the chat`);
        
        // Send chat history to the new user
        socket.emit('chatHistory', messages);
    });

    socket.on('chatMessage', (data) => {
        const messageData = {
            id: Date.now(),
            username: socket.username || 'Anonymous',
            text: data.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        // Store in memory
        messages.push(messageData);
        // Keep only recent 100 messages to prevent memory leak
        if (messages.length > 100) messages.shift();
        
        // Broadcast message to everyone including sender
        io.emit('chatMessage', messageData);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        onlineUsers--;
        io.emit('onlineUsersUpdate', onlineUsers);
        
        if (socket.username) {
            io.emit('systemMessage', `${socket.username} left the chat`);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
