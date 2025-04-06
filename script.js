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
 const globalChatButton = document.getElementById('global-chat-button');
 const globalChatContainerDiv = document.getElementById('global-chat-container');
 const globalMessagesDiv = document.getElementById('global-messages');
 const globalMessageInput = document.getElementById('global-message-input');
 const globalSendButton = document.getElementById('global-send-button');
 const backToContactsFromGlobalButton = document.getElementById('back-to-contacts-from-global');
 const imageInput = document.getElementById('image-input');
 const globalImageInput = document.getElementById('global-image-input');
 const modal = document.getElementById('image-modal');
 const modalImage = document.getElementById('modal-image');
 const closeModal = document.getElementById('close-modal');

 let currentUser = localStorage.getItem('currentUser') || ''; // Tenta obter o usuário do localStorage
 let currentChatWith = localStorage.getItem('currentChatWith') || null;
 let favoriteContacts = JSON.parse(localStorage.getItem('favoriteContacts')) || {};
 const users = {
     'Henrique🖤': 'as12',
     'morango🩷': '666',
     'Transante💙': 'Nett4',
     'peso pesado💙': '170311',
     'macho💙': 'as12',
     'lucas': '	lucas ',
     'alan': 'qwe1234',
     'Xkz': '102030',
     'tkg': '102030',
     'Voce': 'as12',
     'anonimo': 'as12',
     'Scarlett🩷': '444',
     'convidado': '1234',
     'linda🩷': 'as12'
 };
 let activeChatListeners = {};
 let showingFavorites = false;
 let unreadMessages = {};
 let globalChatListener;

 imageInput.addEventListener('change', (event) => {
     const file = event.target.files[0];
     if (file) {
         const reader = new FileReader();
         reader.onload = function(e) {
             const imageDataURL = e.target.result;
             addMessage(imageDataURL);
         }
         reader.readAsDataURL(file);
         imageInput.value = ''; // Reset the input
     }
 });

 globalImageInput.addEventListener('change', (event) => {
     const file = event.target.files[0];
     if (file) {
         const reader = new FileReader();
         reader.onload = function(e) {
             const imageDataURL = e.target.result;
             addGlobalMessage(imageDataURL);
         }
         reader.readAsDataURL(file);
         globalImageInput.value = ''; // Reset the input
     }
 });

 function displayMessages(messages) {
     messagesDiv.innerHTML = '';
     if (messages) {
         const messagesArray = Object.entries(messages).map(([key, value]) => ({ ...value, key }));
         messagesArray.sort((a, b) => a.timestamp - b.timestamp);
         messagesArray.forEach(message => {
             const messageElement = document.createElement('p');
             if (message.image) {
                 const img = document.createElement('img');
                 img.src = message.image;
                 img.style.maxWidth = '200px';
                 img.style.maxHeight = '200px';
                 img.style.borderRadius = '8px';
                 img.style.cursor = 'pointer'; // Indica que a imagem é clicável
                 img.addEventListener('click', () => {
                     modalImage.src = message.image;
                     modal.style.display = 'block';
                 });
                 messageElement.appendChild(img);
             } else {
                 messageElement.innerHTML = `<strong>${message.sender}:</strong> ${message.text}`;
             }
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
         unreadMessages[currentChatWith] = 0;
         updateContactList(Object.keys(users).filter(user => user !== currentUser));
     }
 }

 function addMessage(textOrImage) {
     if ((textOrImage && textOrImage.trim()) || textOrImage?.startsWith('data:image')) {
         if (!currentUser || !currentChatWith) {
             console.error("currentUser or currentChatWith is not set.");
             return;
         }
         const chatId = getChatId(currentUser, currentChatWith);
         const chatRef = ref(database, `chats/${chatId}`);
         const messageData = {
             sender: currentUser,
             timestamp: serverTimestamp()
         };
         if (textOrImage?.startsWith('data:image')) {
             messageData.image = textOrImage;
         } else if (textOrImage?.trim()) {
             messageData.text = textOrImage.trim();
         }
         push(chatRef, messageData);
         messageInput.value = '';
         clearTypingIndicator();
     }
 }

 function displayGlobalMessages(messages) {
     globalMessagesDiv.innerHTML = '';
     if (messages) {
         const messagesArray = Object.entries(messages).map(([key, value]) => ({ ...value, key }));
         messagesArray.sort((a, b) => a.timestamp - b.timestamp);
         messagesArray.forEach(message => {
             const messageElement = document.createElement('p');
             if (message.image) {
                 const img = document.createElement('img');
                 img.src = message.image;
                 img.style.maxWidth = '200px';
                 img.style.maxHeight = '200px';
                 img.style.borderRadius = '8px';
                 img.style.cursor = 'pointer'; // Indica que a imagem é clicável
                 img.addEventListener('click', () => {
                     modalImage.src = message.image;
                     modal.style.display = 'block';
                 });
                 messageElement.appendChild(img);
             } else {
                 messageElement.innerHTML = `<strong>${message.sender}:</strong> ${message.text}`;
             }
             if (message.sender === currentUser) {
                 messageElement.classList.add('sent-by-me');
             } else {
                 messageElement.classList.add('received');
             }
             globalMessagesDiv.appendChild(messageElement);
         });
     }
     globalMessagesDiv.scrollTop = globalMessagesDiv.scrollHeight;
 }

 function addGlobalMessage(textOrImage) {
     if ((textOrImage && textOrImage.trim()) || textOrImage?.startsWith('data:image')) {
         if (!currentUser) {
             console.error("currentUser is not set for global chat.");
             return;
         }
         const globalChatRef = ref(database, `globalChat`);
         const messageData = {
             sender: currentUser,
             timestamp: serverTimestamp()
         };
         if (textOrImage?.startsWith('data:image')) {
             messageData.image = textOrImage;
         } else if (textOrImage?.trim()) {
             messageData.text = textOrImage.trim();
         }
         push(globalChatRef, messageData);
         globalMessageInput.value = '';
     }
 }

 function showChatInterface() {
     loginContainer.style.display = 'none';
     chatInterfaceDiv.style.display = 'flex';
     contactsListContainer.style.display = 'block';
     currentChatContainerDiv.style.display = 'none';
     globalChatContainerDiv.style.display = 'none';
     loadActiveChats();
     loadGlobalChat();
 }

 function showLoginForm() {
     chatInterfaceDiv.style.display = 'none';
     loginContainer.style.display = 'block';
     loginUsernameInput.value = '';
     loginPasswordInput.value = '';
     loginError.textContent = '';
     localStorage.removeItem('currentChatWith'); // Mantém o currentUser no localStorage ao sair
     currentChatWith = null;
     Object.values(activeChatListeners).forEach(unsubscribe => unsubscribe());
     activeChatListeners = {};
     messagesDiv.innerHTML = '';
     chatTitle.textContent = '';
     updateContactList([]);
     unreadMessages = {};
     if (globalChatListener) {
         globalChatListener();
         globalChatListener = null;
     }
     globalMessagesDiv.innerHTML = '';
 }

 function showCurrentChat(otherUserId) {
     currentChatWith = otherUserId;
     localStorage.setItem('currentChatWith', otherUserId);
     contactsListContainer.style.display = 'none';
     currentChatContainerDiv.style.display = 'flex';
     globalChatContainerDiv.style.display = 'none';
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
     updateContactList(Object.keys(users).filter(user => user !== currentUser));
 }

 function showContactList() {
     currentChatContainerDiv.style.display = 'none';
     globalChatContainerDiv.style.display = 'none';
     contactsListContainer.style.display = 'block';
     currentChatWith = null;
     localStorage.removeItem('currentChatWith');
     messagesDiv.innerHTML = '';
     chatTitle.textContent = '';
     updateContactList(Object.keys(users).filter(user => user !== currentUser));
 }

 function showGlobalChat() {
     contactsListContainer.style.display = 'none';
     currentChatContainerDiv.style.display = 'none';
     globalChatContainerDiv.style.display = 'flex';
     chatTitle.textContent = 'Chat Global';
     if (!globalChatListener) {
         loadGlobalChat();
     }
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

             const onValueCallback = onValue(messagesRef, (snapshot) => {
                 const messages = snapshot.val();
                 get(lastReadRef).then((snapshot) => {
                     const lastReadTime = snapshot.val() || 0;
                     let hasNewMessages = false;
                     if (messages) {
                         Object.values(messages).forEach(msg => {
                             if (msg.sender !== currentUser && msg.timestamp > lastReadTime) {
                                 hasNewMessages = true;
                                 if (otherUser !== currentChatWith) {
                                     unreadMessages[otherUser] = (unreadMessages[otherUser] || 0) + 1;
                                     updateContactList(Object.keys(users).filter(u => u !== currentUser));
                                 }
                             }
                         });
                     }
                 });
             });
             activeChatListeners[otherUser] = onValueCallback;
         });
     }
 }

 function loadGlobalChat() {
     const globalChatRef = ref(database, `globalChat`);
     globalChatListener = onValue(globalChatRef, (snapshot) => {
         const data = snapshot.val();
         displayGlobalMessages(data);
     });
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
     const searchInput = document.getElementById('contact-search').value.toLowerCase();
     let filteredUsers = usersToDisplay.filter(user => user.toLowerCase().includes(searchInput));

     if (showingFavorites) {
         filteredUsers = filteredUsers.filter(user => favoriteContacts[user]);
     }

     // Sort users: unread messages first, then alphabetically
     filteredUsers.sort((a, b) => {
         const aHasNewMessages = unreadMessages[a] > 0;
         const bHasNewMessages = unreadMessages[b] > 0;

         if (aHasNewMessages && !bHasNewMessages) {
             return -1; // a comes first
         }
         if (!aHasNewMessages && bHasNewMessages) {
             return 1; // b comes first
         }
         return a.localeCompare(b); // sort alphabetically if both have or don't have new messages
     });

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

         // Bell icon for new messages
         const newMessageIcon = document.createElement('i');
         newMessageIcon.classList.add('fas', 'fa-bell', 'new-message-bell');
         newMessageIcon.style.display = (unreadMessages[user] > 0 && currentChatWith !== user) ? 'inline-block' : 'none';
         actionsDiv.appendChild(newMessageIcon);

         const favoriteIcon = document.createElement('button');
         favoriteIcon.classList.add('favorite-button');
         favoriteIcon.innerHTML = favoriteContacts[user] ? '<i class="fas fa-star favorited"></i>' : '<i class="far fa-star"></i>';
         favoriteIcon.addEventListener('click', (event) => {
             event.stopPropagation
             toggleFavorite(user);
         });
         actionsDiv.appendChild(favoriteIcon);

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
         localStorage.setItem('currentUser', currentUser); // Salva o usuário no localStorage
         showChatInterface();
     } else {
         loginError.textContent = 'Usuário ou senha incorretos.';
     }
 });

 logoutButtonContacts.addEventListener('click', () => {
     localStorage.removeItem('currentUser'); // Remove o usuário ao clicar em "Sair"
     showLoginForm();
 });

 backToContactsButton.addEventListener('click', () => {
     showContactList();
 });

 globalChatButton.addEventListener('click', () => {
     showGlobalChat();
 });

 backToContactsFromGlobalButton.addEventListener('click', () => {
     showContactList();
 });

 sendButton.addEventListener('click', () => {
     addMessage(messageInput.value);
 });

 globalSendButton.addEventListener('click', () => {
     addGlobalMessage(globalMessageInput.value);
 });

 messageInput.addEventListener('input', () => {
     showTypingIndicator();
     clearTimeout(typingTimeout);
     typingTimeout = setTimeout(clearTypingIndicator, 1000);
 });

 globalMessageInput.addEventListener('input', () => {
     // Opcional: Adicionar indicador de digitação global aqui
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

 // Add search input field
 const searchInput = document.createElement('input');
 searchInput.type = 'text';
 searchInput.id = 'contact-search';
 searchInput.placeholder = 'Pesquisar contatos...';
 contactsListContainer.insertBefore(searchInput, contactsListContainer.firstChild);

 // Event listener for search input
 searchInput.addEventListener('input', () => {
     updateContactList(Object.keys(users).filter(u => u !== currentUser));
 });

 // Initial setup
 if (currentUser) {
     showChatInterface();
     // Ensure the correct filter is applied on load if showing favorites
     if (showingFavorites) {
         showFavoritesButton.classList.add('active');
         showAllContactsButton.classList.remove('active');
         updateContactList(Object.keys(users).filter(u => u !== currentUser));
     } else {
         showAllContactsButton.classList.add('active');
         showFavoritesButton.classList.remove('active');
         updateContactList(Object.keys(users).filter(u => u !== currentUser));
     }
 } else {
     showLoginForm();
 }

 // Modal functionality for image zoom
 closeModal.addEventListener('click', () => {
     modal.style.display = 'none';
 });

 window.addEventListener('click', (event) => {
     if (event.target === modal) {
          
