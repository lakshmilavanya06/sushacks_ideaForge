document.addEventListener('DOMContentLoaded', function () {
    const usernameModal = document.getElementById('usernameModal');
    const usernameInput = document.getElementById('usernameInput');
    const startChattingBtn = document.getElementById('startChatting');
    const chatContainer = document.getElementById('chatContainer');
    const messageHistory = document.getElementById('messageHistory');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');
    const connectionStatus = document.getElementById('connectionStatus');
    const emojiBtn = document.getElementById('emojiBtn');
    const emojiPicker = document.getElementById('emojiPicker');
    const notification = document.getElementById('notification');
    const themeToggle = document.getElementById('themeToggle');
    const sidebarUsername = document.getElementById('sidebarUsername');
    const userAvatar = document.getElementById('userAvatar');
    const partnerName = document.getElementById('partnerName');

    let username = '';
    let partner = '';
    let isTyping = false;
    let typingTimeout;
    let messages = [];
    let isConnected = false;
    let isDarkTheme = true;

    const partners = ['nick_name1', 'nick_name2', 'nick_name3', 'nick_name4'];

    function init() {
        const savedUsername = localStorage.getItem('neonMessengerUsername');
        if (savedUsername) {
            username = savedUsername;
            startChat();
        } else {
            showUsernameModal();
        }

        setupEventListeners();
        simulateConnection();
    }

    function setupEventListeners() {
        startChattingBtn.addEventListener('click', handleUsernameSubmit);
        usernameInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') handleUsernameSubmit();
        });

        messageInput.addEventListener('input', handleTyping);
        messageInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        sendButton.addEventListener('click', sendMessage);
        emojiBtn.addEventListener('click', toggleEmojiPicker);
        themeToggle.addEventListener('click', toggleTheme);
    }

    function showUsernameModal() {
        usernameModal.style.display = 'flex';
        usernameInput.focus();
    }

    function hideUsernameModal() {
        usernameModal.style.display = 'none';
    }

    function handleUsernameSubmit() {
        const inputValue = usernameInput.value.trim();
        if (inputValue.length < 2) {
            showNotification('Please enter a name with at least 2 characters');
            return;
        }

        username = inputValue;
        localStorage.setItem('neonMessengerUsername', username);
        if (sidebarUsername) sidebarUsername.textContent = username;
        if (userAvatar) userAvatar.textContent = username.charAt(0).toUpperCase();
        hideUsernameModal();
        startChat();
    }

    function startChat() {
        partner = partners[Math.floor(Math.random() * partners.length)];
        partnerName.textContent = partner;
        chatContainer.style.display = 'flex';
        setTimeout(() => {
            chatContainer.classList.add('show');
        }, 50);

        messageInput.disabled = false;
        sendButton.disabled = false;

        setTimeout(() => {
            addReceivedMessage(`${partner} joined the chat`);
            simulateIncomingMessage();
        }, 500);
    }

    function handleTyping() {
        if (!isTyping) {
            isTyping = true;
            typingIndicator.textContent = `${partner} is typing...`;
        }

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            isTyping = false;
            typingIndicator.textContent = '';
        }, 1500);
    }

    function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText === '') return;

        addSentMessage(messageText);
        setTimeout(() => {
            simulateIncomingMessage();
        }, 1000 + Math.random() * 2000);

        messageInput.value = '';
        messageInput.focus();
    }

    function addSentMessage(text) {
        const message = {
            id: Date.now(),
            sender: username,
            text,
            timestamp: new Date(),
            isSent: true,
        };

        messages.push(message);
        renderMessage(message);
    }

    function addReceivedMessage(text) {
        const message = {
            id: Date.now(),
            sender: partner,
            text,
            timestamp: new Date(),
            isSent: false,
        };

        messages.push(message);
        renderMessage(message);
    }

    function renderMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.isSent ? 'sent' : 'received'}`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        if (!message.isSent) {
            const senderName = document.createElement('div');
            senderName.className = 'sender-name';
            senderName.textContent = message.sender;
            messageContent.appendChild(senderName);
        }

        const messageText = document.createElement('div');
        messageText.textContent = message.text;
        messageContent.appendChild(messageText);

        const messageMeta = document.createElement('div');
        messageMeta.className = 'message-meta';

        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = formatTime(message.timestamp);
        messageMeta.appendChild(timeSpan);

        if (message.isSent) {
            const statusIcon = document.createElement('span');
            statusIcon.className = 'message-status';
            statusIcon.innerHTML = ' <i class="fas fa-check"></i>';
            messageMeta.appendChild(statusIcon);
        }

        messageContent.appendChild(messageMeta);
        messageDiv.appendChild(messageContent);
        messageHistory.appendChild(messageDiv);
        messageHistory.scrollTop = messageHistory.scrollHeight;
    }

    function formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function simulateIncomingMessage() {
        const responses = [
            "Hey there! How are you doing?",
            "That's interesting! Tell me more.",
            "What’s up?",
            "😂 That’s hilarious!",
            "Nice idea!",
            "Thanks for letting me know!",
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addReceivedMessage(randomResponse);
    }

    function simulateConnection() {
        connectionStatus.textContent = '● Connecting...';
        connectionStatus.className = 'status waiting';

        setTimeout(() => {
            isConnected = true;
            connectionStatus.textContent = '● Connected';
            connectionStatus.className = 'status connected';
        }, 800);
    }

    function showNotification(text, duration = 3000) {
        notification.textContent = text;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    }

    function toggleEmojiPicker() {
        if (emojiPicker.style.display === 'block') {
            emojiPicker.style.display = 'none';
        } else {
            emojiPicker.style.display = 'block';
        }
    }

    function toggleTheme() {
        isDarkTheme = !isDarkTheme;
        document.body.classList.toggle('dark-theme', isDarkTheme);

        const icon = isDarkTheme ? 'fa-moon' : 'fa-sun';
        themeToggle.innerHTML = `<i class="fas ${icon}"></i>`;
        localStorage.setItem('neonMessengerTheme', isDarkTheme ? 'dark' : 'light');
    }

    const savedTheme = localStorage.getItem('neonMessengerTheme');
    if (savedTheme === 'light') {
        isDarkTheme = false;
        document.body.classList.remove('dark-theme');
    }

    init();
});