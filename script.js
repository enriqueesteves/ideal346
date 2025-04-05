import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import { getDatabase, ref, push, onValue, serverTimestamp, get, set } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

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

const loginContainer = document.getElementById('login-container');
const loginUsernameInput = document.getElementById('login-username');
const loginPasswordInput = document.getElementById('login-password');
const loginButton = document.getElementById('login-button');
const loginError = document.getElementById('login-error');
const chatInterfaceDiv = document.getElementById('chat-interface');
const contactsListContainer = document.getElementById('contacts-list-container');
const contactsUl = document.getElementById('contacts');
const logoutButtonContacts = document.getElementById('logout-button-contacts');
const currentChatContainerDiv = document.getElementById('current-chat-container');
const backToContactsButton = document.getElementById('back-to-contacts');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatTitle = document.getElementById('chat-title');
const typingIndicator = document.getElementById('typing-indicator');
const showAllContactsButton = document.getElementById('show-all-contacts');
const showFavoritesButton = document.getElementById('show-favorites');

let currentUser = localStorage.getItem('currentUser') || '';
let currentChatWith = localStorage.getItem('currentChatWith') || null;
let favoriteContacts = JSON.parse(localStorage.getItem('favoriteContacts')) || {};
const users = {
    'Henrique🖤': 'as12',
    'morango🩷': '666',
    'macho💙': 'as12',


'linda🩷': 'as12'
};
let activeChatListeners = {};
let showingFavorites = false;

function displayMessages(messages) {
    messagesDiv.innerHTML = '';
    if (messages) {
        const messagesArray = Object.entries(messages).map(([key, value]) => ({ ...value, key }));
        messagesArray.sort((a, b) => a.timestamp - b.timestamp);
        messagesArray.forEach(message => {
            const messageElement = document.createElement('p');
            messageElement.innerHTML = `<strong>${message.sender}:</strong> ${message.text}`;
            if (message.sender === currentUser) {
                messageElement.classList.add('sent-by-me');
            } else {
                messageElement.classList.add('received');
            }
            messagesDiv.appendChild(messageElement);
        });
    }
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    if (currentChatWith) {
        updateLastRead(currentChatWith);
    }
}

function addMessage(text) {
    if (text.trim() && currentUser && currentChatWith) {
        const chatId = getChatId(currentUser, currentChatWith);
        const chatRef = ref(database, `chats/${chatId}`);
        push(chatRef, {
            sender: currentUser,
            text: text,
            timestamp: serverTimestamp()
        });
        messageInput.value = '';
        clearTypingIndicator();
    }
}

function showChatInterface() {
    loginContainer.style.display = 'none';
    chatInterfaceDiv.style.display = 'flex';
    contactsListContainer.style.display = 'block';
    currentChatContainerDiv.style.display = 'none';
    loadActiveChats();
}

function showLoginForm() {
    chatInterfaceDiv.style.display = 'none';
    loginContainer.style.display = 'block';
    loginUsernameInput.value = '';
    loginPasswordInput.value = '';
    loginError.textContent = '';
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentChatWith');
    currentUser = '';
    currentChatWith = null;
    Object.values(activeChatListeners).forEach(unsubscribe => unsubscribe());
    activeChatListeners = {};
    messagesDiv.innerHTML = '';
    chatTitle.textContent = '';
    updateContactList([]);
}

function showCurrentChat(otherUserId) {
    currentChatWith = otherUserId;
    localStorage.setItem('currentChatWith', otherUserId);
    contactsListContainer.style.display = 'none';
    currentChatContainerDiv.style.display = 'flex';
    chatTitle.textContent = otherUserId;
    messagesDiv.innerHTML = '';

    const chatId = getChatId(currentUser, otherUserId);
    const chatRef = ref(database, `chats/${chatId}`);

    if (activeChatListeners[otherUserId]) {
        activeChatListeners[otherUserId]();
        delete activeChatListeners[otherUserId];
    }

    const onValueCallback = onValue(chatRef, (snapshot) => {
        const data = snapshot.val();
        displayMessages(data);
    });
    activeChatListeners[otherUserId] = onValueCallback;

    updateLastRead(otherUserId);
    // When a chat is opened, the new message indicator should disappear
    const newMessageIndicator = document.getElementById(`new-message-${otherUserId}`);
    if (newMessageIndicator) {
        newMessageIndicator.style.display = 'none';
        newMessageIndicator.innerHTML = '';
    }
    updateContactList(Object.keys(users).filter(user => user !== currentUser));
}

function showContactList() {
    currentChatContainerDiv.style.display = 'none';
    contactsListContainer.style.display = 'block';
    currentChatWith = null;
    localStorage.removeItem('currentChatWith');
    messagesDiv.innerHTML = '';
    chatTitle.textContent = '';
    updateContactList(Object.keys(users).filter(user => user !== currentUser));
}

function getChatId(user1, user2) {
    return user1 < user2 ? `${user1}_${user2}` : `${user2}_${user1}`;
}

function updateLastRead(otherUserId) {
    if (currentUser) {
        const lastReadRef = ref(database, `lastRead/${getChatId(currentUser, otherUserId)}/${currentUser}`);
        set(lastReadRef, serverTimestamp());
    }
}

function loadActiveChats() {
    if (currentUser) {
        const allUsers = Object.keys(users).filter(user => user !== currentUser);
        updateContactList(allUsers);

        allUsers.forEach(otherUser => {
            const chatId = getChatId(currentUser, otherUser);
            const messagesRef = ref(database, `chats/${chatId}`);
            const lastReadRef = ref(database, `lastRead/${chatId}/${currentUser}`);
            const newMessageIndicator = document.getElementById(`new-message-${otherUser}`);

            const onValueCallback = onValue(messagesRef, (snapshot) => {
                const messages = snapshot.val();
                get(lastReadRef).then((snapshot) => {
                    const lastReadTime = snapshot.val() || 0;
                    let hasNewMessages = false;
                    if (messages) {
                        Object.values(messages).forEach(msg => {
                            if (msg.sender !== currentUser && msg.timestamp > lastReadTime) {
                                hasNewMessages = true;
                            }
                        });
                    }
                    if (newMessageIndicator && currentChatWith !== otherUser) {
                        newMessageIndicator.style.display = hasNewMessages ? 'inline-block' : 'none';
                        newMessageIndicator.innerHTML = hasNewMessages ? '<i class="fas fa-circle notification-dot"></i>' : '';
                    }
                });
            });
            activeChatListeners[otherUser] = onValueCallback;
        });
    }
}

function toggleFavorite(user) {
    if (favoriteContacts[user]) {
        delete favoriteContacts[user];
    } else {
        favoriteContacts[user] = true;
    }
    localStorage.setItem('favoriteContacts', JSON.stringify(favoriteContacts));
    updateContactList(Object.keys(users).filter(u => u !== currentUser));
}

function updateContactList(usersToDisplay) {
    contactsUl.innerHTML = '';
    const filteredUsers = showingFavorites
        ? usersToDisplay.filter(user => favoriteContacts[user])
        : usersToDisplay;

    filteredUsers.forEach(user => {
        const li = document.createElement('li');
        li.classList.add('contact-item');
        li.dataset.user = user;

        const userSpan = document.createElement('span');
        userSpan.classList.add('contact-name');
        userSpan.textContent = user;
        li.appendChild(userSpan);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('contact-actions');

        const favoriteIcon = document.createElement('button');
        favoriteIcon.classList.add('favorite-button');
        favoriteIcon.innerHTML = favoriteContacts[user] ? '<i class="fas fa-star favorited"></i>' : '<i class="far fa-star"></i>';
        favoriteIcon.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleFavorite(user);
        });
        actionsDiv.appendChild(favoriteIcon);

        const newMessageSpan = document.createElement('span');
        newMessageSpan.classList.add('new-message-indicator');
        newMessageSpan.id = `new-message-${user}`;
        newMessageSpan.style.display = 'none';
        actionsDiv.appendChild(newMessageSpan);

        li.appendChild(actionsDiv);
        li.addEventListener('click', () => showCurrentChat(user));
        contactsUl.appendChild(li);
    });
}

loginButton.addEventListener('click', () => {
    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value;

    if (users[username] && users[username] === password) {
        currentUser = username;
        localStorage.setItem('currentUser', currentUser);
        showChatInterface();
    } else {
        loginError.textContent = 'Usuário ou senha incorretos.';
    }
});

logoutButtonContacts.addEventListener('click', () => {
    showLoginForm();
});

backToContactsButton.addEventListener('click', () => {
    showContactList();
});

sendButton.addEventListener('click', () => {
    addMessage(messageInput.value);
});

messageInput.addEventListener('input', () => {
    showTypingIndicator();
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(clearTypingIndicator, 1000);
});

showAllContactsButton.addEventListener('click', () => {
    showingFavorites = false;
    showAllContactsButton.classList.add('active');
    showFavoritesButton.classList.remove('active');
    updateContactList(Object.keys(users).filter(u => u !== currentUser));
});

showFavoritesButton.addEventListener('click', () => {
    showingFavorites = true;
    showFavoritesButton.classList.add('active');
    showAllContactsButton.classList.remove('active');
    updateContactList(Object.keys(users).filter(u => u !== currentUser));
});

// Typing indicator functions
let typingTimeout;
function showTypingIndicator() {
    typingIndicator.textContent = `Digitando...`;
}
function clearTypingIndicator() {
    typingIndicator.textContent = '';
}

// Initial setup
if (currentUser) {
    showChatInterface();
} else {
    showLoginForm();
            }
    
