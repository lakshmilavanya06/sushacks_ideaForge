// Theme Toggle
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  themeToggle.innerHTML = document.body.classList.contains("dark-mode") 
    ? '<i class="fas fa-sun"></i>' 
    : '<i class="fas fa-moon"></i>';
});

// Dynamic Timestamp
function formatTimestamp(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// Message Handling
function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();
  if (!message) return;

  addMessage(message, "user");
  input.value = "";
  
  // Show typing indicator
  const typingIndicator = document.createElement("div");
  typingIndicator.className = "typing-indicator";
  typingIndicator.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  document.getElementById("chatBox").appendChild(typingIndicator);
  scrollToBottom();

  // Simulate bot response
  setTimeout(() => {
    typingIndicator.remove();
    const responses = [
      "I've processed your request...",
      "Here's what I found...",
      "Interesting question!",
      "According to my knowledge...",
      "Let me think about that..."
    ];
    addMessage(responses[Math.floor(Math.random() * responses.length)], "bot");
  }, 1500 + Math.random() * 2000);
}

function addMessage(text, sender) {
  const chatBox = document.getElementById("chatBox");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}`;
  messageDiv.innerHTML = `
    <div class="message-content">${text}</div>
    <div class="message-time">${formatTimestamp(new Date())}</div>
  `;
  chatBox.appendChild(messageDiv);
  scrollToBottom();
}

function scrollToBottom() {
  const chatBox = document.getElementById("chatBox");
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Event Listeners
document.getElementById("sendButton").addEventListener("click", sendMessage);
document.getElementById("userInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});