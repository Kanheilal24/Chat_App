const socket = io();

// UI Elements
const joinScreen = document.getElementById('join-screen');
const joinForm = document.getElementById('join-form');
const usernameInput = document.getElementById('username-input');

const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const chatHistory = document.getElementById('chat-history');

const headerOnlineStatus = document.getElementById('header-online-status');
const sidebarOnlineStatus = document.getElementById('sidebar-online-status');

let currentUsername = '';

// Join Chat
joinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = usernameInput.value.trim();
    if (name) {
        currentUsername = name;
        joinScreen.classList.remove('active');
        socket.emit('join', currentUsername);
        messageInput.focus();
    }
});

// Send Message
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (text) {
        socket.emit('chatMessage', { text });
        messageInput.value = '';
    }
});

// Socket Events

// Receive chat history
socket.on('chatHistory', (messages) => {
    messages.forEach(msg => {
        appendMessage(msg);
    });
    scrollToBottom();
});

// Receive new message
socket.on('chatMessage', (msg) => {
    appendMessage(msg);
    scrollToBottom();
});

// Receive system message
socket.on('systemMessage', (text) => {
    const sysElem = document.createElement('div');
    sysElem.className = 'system-message';
    sysElem.textContent = text;
    chatHistory.appendChild(sysElem);
    scrollToBottom();
});

// Online users update
socket.on('onlineUsersUpdate', (count) => {
    const text = `${count} member${count !== 1 ? 's' : ''} online`;
    headerOnlineStatus.textContent = text;
    if (sidebarOnlineStatus) {
        sidebarOnlineStatus.textContent = `Online: ${count}`;
    }
});


// Helper functions
function appendMessage(msg) {
    const wrapper = document.createElement('div');
    const isMine = msg.username === currentUsername;
    wrapper.className = `msg-wrapper ${isMine ? 'my-message' : 'other-message'} message`;

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    // Username (only for other people's messages)
    if (!isMine) {
        const userDiv = document.createElement('div');
        userDiv.className = 'msg-username';
        userDiv.textContent = msg.username;
        bubble.appendChild(userDiv);
    }

    // Text
    const textDiv = document.createElement('div');
    textDiv.className = 'msg-text';
    textDiv.textContent = msg.text;
    bubble.appendChild(textDiv);

    // Time
    const timeDiv = document.createElement('div');
    timeDiv.className = 'msg-time';
    timeDiv.textContent = msg.time;
    bubble.appendChild(timeDiv);

    wrapper.appendChild(bubble);
    chatHistory.appendChild(wrapper);
}

function scrollToBottom() {
    chatHistory.scrollTop = chatHistory.scrollHeight;
}
