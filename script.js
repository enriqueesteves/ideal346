const roomSelection = document.getElementById('room-selection');
const chatContainer = document.getElementById('chat-container');
const roomPasswordInput = document.getElementById('room-password');
const joinRoomButton = document.getElementById('join-room');
const leaveRoomButton = document.getElementById('leave-room');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const roomTitle = document.getElementById('room-title');
const errorMessage = document.getElementById('error-message');
const typingIndicator = document.getElementById('typing-indicator');

let currentRoom = '';
let rooms = {
    'grupo': '1234',
    '02': 'senha02',
    '03': 'senha03',
    '04': 'senha04',
    '05': 'senha05',
    '06': 'senha06',
    '07': 'senha07',
    '08': 'senha08',
    '09': 'senha09',
    '10': 'senha10'
};
let typingTimeout;

function displayMessages() {
    const messages = JSON.parse(localStorage.getItem(`room_${currentRoom}`)) || [];
    messagesDiv.innerHTML = messages.map(msg => `<p>${msg.text}</p>`).join('');
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function addMessage(text) {
    if (text.trim()) {
        const messages = JSON.parse(localStorage.getItem(`room_${currentRoom}`)) || [];
        messages.push({ text });
        localStorage.setItem(`room_${currentRoom}`, JSON.stringify(messages));
        displayMessages();
        messageInput.value = '';
        clearTypingIndicator();
    }
}

function showChat() {
    roomSelection.style.display = 'none';
    chatContainer.style.display = 'block';
    roomTitle.textContent = `Sala ${currentRoom}`;
    displayMessages();
}

function showRoomSelection() {
    chatContainer.style.display = 'none';
    roomSelection.style.display = 'block';
}

joinRoomButton.addEventListener('click', () => {
    const password = roomPasswordInput.value;
    const room = Object.keys(rooms).find(key => rooms[key] === password);
    if (room) {
        currentRoom = room;
        showChat();
    } else {
        errorMessage.textContent = 'Senha incorreta.';
    }
});

leaveRoomButton.addEventListener('click', () => {
    currentRoom = '';
    showRoomSelection();
});

sendButton.addEventListener('click', () => {
    addMessage(messageInput.value);
});

messageInput.addEventListener('input', () => {
    showTypingIndicator();
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(clearTypingIndicator, 1000);
});

function showTypingIndicator() {
    typingIndicator.textContent = `Alguém está digitando...`; // Mensagem genérica
}

function clearTypingIndicator() {
    typingIndicator.textContent = '';
}

showRoomSelection();
