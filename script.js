 import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
 import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
 import { getDatabase, ref, push, onValue, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

 const firebaseConfig = {
     apiKey: "AIzaSyBaUW_ih2lxM9DRftochEBQUczXSPDx7vg",
     authDomain: "banco-40005.firebaseapp.com",
     databaseURL: "https://banco-40005-default-rtdb.firebaseio.com",
     projectId: "banco-40005",
     storageBucket: "banco-40005.firebasestorage.app",
     messagingSenderId: "979660568413",
     appId: "1:979660568413:web:24e2510d5f840d45121ab4",
     measurementId: "G-TDHZS843JH"
 };

 const app = initializeApp(firebaseConfig);
 const analytics = getAnalytics(app);
 const database = getDatabase(app);

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
     '10': 'senha10',
     '11': '11',
     '12': '12'
 };
 let typingTimeout;
 let roomMessagesUnsubscribe;

 function displayMessages(messages) {
     console.log("displayMessages chamada com:", messages); // LOG
     messagesDiv.innerHTML = '';
     if (messages) {
         const messagesArray = Object.entries(messages).map(([key, value]) => ({ ...value, key }));
         messagesArray.sort((a, b) => a.timestamp - b.timestamp);
         messagesArray.forEach(message => {
             console.log("Mensagem a ser exibida:", message.text); // LOG
             const messageElement = document.createElement('p');
             messageElement.textContent = `${message.text}`;
             messagesDiv.appendChild(messageElement);
         });
     }
     messagesDiv.scrollTop = messagesDiv.scrollHeight;
 }

 function addMessage(text) {
     console.log("addMessage chamada com:", text); // LOG
     if (text.trim()) {
         const roomMessagesRef = ref(database, `rooms/${currentRoom}/messages`);
         push(roomMessagesRef, {
             text: text,
             timestamp: serverTimestamp()
         });
         messageInput.value = '';
         clearTypingIndicator();
     }
 }

 function showChat() {
     roomSelection.style.display = 'none';
     chatContainer.style.display = 'block';
     roomTitle.textContent = `Sala ${currentRoom}`;
 }

 function showRoomSelection() {
     chatContainer.style.display = 'none';
     roomSelection.style.display = 'block';
     roomPasswordInput.value = '';
     errorMessage.textContent = '';
 }

 joinRoomButton.addEventListener('click', () => {
     const password = roomPasswordInput.value;
     console.log("Senha digitada:", password);
     console.log("Objeto rooms:", rooms);
     const room = Object.keys(rooms).find(key => rooms[key] === password);
     console.log("Sala encontrada:", room);
     if (room) {
         currentRoom = room;
         showChat();
         const roomMessagesRef = ref(database, `rooms/${currentRoom}/messages`);
         if (typeof roomMessagesUnsubscribe === 'function') {
             roomMessagesUnsubscribe();
         }
         const onValueCallback = onValue(roomMessagesRef, (snapshot) => {
             const data = snapshot.val();
             console.log("Dados recebidos do Firebase:", data); // LOG
             displayMessages(data);
         });
         roomMessagesUnsubscribe = onValueCallback;
     } else {
         errorMessage.textContent = 'Senha incorreta.';
     }
 });

 leaveRoomButton.addEventListener('click', () => {
     if (typeof roomMessagesUnsubscribe === 'function') {
         roomMessagesUnsubscribe();
     }
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
     typingIndicator.textContent = `Alguém está digitando...`;
 }

 function clearTypingIndicator() {
     typingIndicator.textContent = '';
 }

 showRoomSelection();
