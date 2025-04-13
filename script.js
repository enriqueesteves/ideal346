 import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
 import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
 import { getDatabase, ref, push, onValue, serverTimestamp, get, set, remove } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
 import { validateUser, isAdmin, users } from './user.js'; // Importando as funções de user.js

 console.log('Objeto users importado:', users); // Para verificar se 'users' está chegando corretamente

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
 const createGroupButton = document.getElementById('create-group-button');
 const groupsButton = document.getElementById('groups-button');
 const groupsContainerDiv = document.getElementById('groups-container');
 const groupsListUl = document.getElementById('groups-list');
 const backToContactsFromGroupsButton = document.getElementById('back-to-contacts-from-groups');
 const createGroupModal = document.getElementById('create-group-modal');
 const closeCreateGroupModal = document.getElementById('close-create-group-modal');
 const groupNameInput = document.getElementById('group-name');
 const groupPasswordInput = document.getElementById('group-password');
 const confirmCreateGroupButton = document.getElementById('confirm-create-group');
 const createGroupError = document.getElementById('create-group-error');
 const enterGroupPasswordModal = document.getElementById('enter-group-password-modal');
 const closeEnterPasswordModal = document.getElementById('close-enter-password-modal');
 const groupAccessPasswordInput = document.getElementById('group-access-password');
 const confirmEnterGroupButton = document.getElementById('confirm-enter-group');
 const enterPasswordTitle = document.getElementById('enter-password-title');
 const enterPasswordError = document.getElementById('enter-password-error');
 const groupToJoinInput = document.getElementById('group-to-join');
 const guestLoginContainer = document.getElementById('guest-login-container');
 const guestNameInput = document.getElementById('guest-name-input');
 const guestLoginButton = document.getElementById('guest-login-button');
 const fullLoginForm = document.getElementById('full-login-form'); // Adicionado
 const loginOptionsButton = document.getElementById('login-options-button'); // Adicionado
 const backToGuestLoginButton = document.getElementById('back-to-guest-login'); // Adicionado
 const contactSearchInput = document.getElementById('contact-search'); // Adicionado
 const showRegisterLink = document.getElementById('show-register');
 const registerContainer = document.getElementById('register-container');
 const showLoginLink = document.getElementById('show-login');
 const backToGuestFromRegisterButton = document.getElementById('back-to-guest-from-register');
 const registerUsernameInput = document.getElementById('register-username');
 const registerPasswordInput = document.getElementById('register-password');
 const registerButton = document.getElementById('register-button');
 const registerError = document.getElementById('register-error');

 let currentUser = localStorage.getItem('currentUser') || ''; // Tenta obter o usuário do localStorage
 let currentChatWith = localStorage.getItem('currentChatWith') || null;
 let favoriteContacts = JSON.parse(localStorage.getItem('favoriteContacts')) || {};
 let activeChatListeners = {};
 let showingFavorites = false;
 let unreadMessages = {};
 let globalChatListener;
 let groupChatListeners = {};
 let currentGroupId = null;

 imageInput.addEventListener('change', (event) => {
     const file = event.target.files[0];
     if (file) {
         const reader = new FileReader();
         reader.onload = function(e) {
             const imageDataURL = e.target.result;
             if (currentGroupId) {
                 addGroupMessage(imageDataURL);
             } else if (currentChatWith && currentChatWith !== 'global') {
                 addMessage(imageDataURL);
             }
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

             // Botão de exclusão para administradores
             if (isAdmin(currentUser) && message.sender !== currentUser && currentChatWith !== 'global' && !currentGroupId) {
                 const deleteButton = document.createElement('button');
                 deleteButton.classList.add('delete-message-button');
                 deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                 deleteButton.addEventListener('click', () => deleteMessage(message.key, currentChatWith));
                 messageElement.appendChild(deleteButton);
             }

             messagesDiv.appendChild(messageElement);
         });
     }
     messagesDiv.scrollTop = messagesDiv.scrollHeight;
     if (currentChatWith && currentChatWith !== 'global' && !currentGroupId) {
         updateLastRead(currentChatWith);
         unreadMessages[currentChatWith] = 0;
         updateContactList(Object.keys(users).filter(user => user !== currentUser));
     }
 }

 function addMessage(textOrImage) {
     if ((textOrImage && textOrImage.trim()) || textOrImage?.startsWith('data:image')) {
         if (!currentUser || !currentChatWith || currentChatWith === 'global' || currentGroupId) {
             console.error("currentUser or currentChatWith is not set or is global chat or group chat.");
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

 function deleteMessage(messageId, chatIdOrGroupId) {
     if (isAdmin(currentUser)) {
         if (chatIdOrGroupId && !currentGroupId) {
             const chatRef = ref(database, `chats/${getChatId(currentUser, chatIdOrGroupId)}/${messageId}`);
             remove(chatRef)
                 .then(() => console.log(`Mensagem ${messageId} excluída.`))
                 .catch((error) => console.error("Erro ao excluir mensagem:", error));
         } else if (chatIdOrGroupId && currentGroupId) {
             const groupChatRef = ref(database, `groups/${chatIdOrGroupId}/messages/${messageId}`);
             remove(groupChatRef)
                 .then(() => console.log(`Mensagem do grupo ${messageId} excluída.`))
                 .catch((error) => console.error("Erro ao excluir mensagem do grupo:", error));
         }
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
     const sender = currentUser || generateGuestName(); // Usa currentUser se logado, senão gera um nome de convidado
     if ((textOrImage && textOrImage.trim()) || textOrImage?.startsWith('data:image')) {
         const globalChatRef = ref(database, `globalChat`);
         const messageData = {
             sender: sender,
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

 function generateGuestName() {
     return `Convidado-${Math.floor(Math.random() * 1000)}`;
 }

 function displayGroupMessages(messages) {
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
                 img.style.cursor = 'pointer';
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

             // Botão de exclusão para administradores em grupos
             if (isAdmin(currentUser) && message.sender !== currentUser && currentGroupId) {
                 const deleteButton = document.createElement('button');
                 deleteButton.classList.add('delete-message-button');
                 deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                 deleteButton.addEventListener('click', () => deleteMessage(message.key, currentGroupId));
                 messageElement.appendChild(deleteButton);
             }

             messagesDiv.appendChild(messageElement);
         });
     }
     messagesDiv.scrollTop = messagesDiv.scrollHeight;
 }

 function addGroupMessage(textOrImage) {
     const sender = currentUser || generateGuestName(); // Usa currentUser se logado, senão gera um nome de convidado
     if ((textOrImage && textOrImage.trim()) || textOrImage?.startsWith('data:image')) {
         if (!currentGroupId) {
             console.error("currentGroupId is not set for group message.");
             return;
         }
         const groupChatRef = ref(database, `groups/${currentGroupId}/messages`);
         const messageData = {
             sender: sender,
             timestamp: serverTimestamp()
         };
         if (textOrImage?.startsWith('data:image')) {
             messageData.image = textOrImage;
         } else if (textOrImage?.trim()) {
             messageData.text = textOrImage.trim();
         }
         push(groupChatRef, messageData);
         messageInput.value = '';
         clearTypingIndicator();
     }
 }

 function showChatInterface() {
     loginContainer.style.display = 'none';
     registerContainer.style.display = 'none';
     chatInterfaceDiv.style.display = 'flex';
     contactsListContainer.style.display = 'block'; // Garante que o container da lista esteja visível
     currentChatContainerDiv.style.display = 'none';
     globalChatContainerDiv.style.display = 'none';
     groupsContainerDiv.style.display = 'none';
     loadGlobalChat();
     loadGroups();
     updateAdminUI();
     if (currentUser && users.hasOwnProperty(currentUser)) {
         loadActiveChats(); // Carrega os contatos privados para usuários logados
         // Habilita a interação para usuários logados
         messageInput.disabled = false;
         sendButton.disabled = false;
     } else {
         // Para convidados, exibe a lista de contatos, mas os desabilita para interação
         updateContactList(Object.keys(users).filter(user => user !== currentUser));
         messageInput.disabled = true;
         sendButton.disabled = true;
     }
 }

 function updateAdminUI() {
     if (isAdmin(currentUser)) {
         createGroupButton.style.display = 'block';
     } else {
         createGroupButton.style.display = 'none';
     }
 }

 function showLoginForm() {
     chatInterfaceDiv.style.display = 'none';
     registerContainer.style.display = 'none';
     loginContainer.style.display = 'flex';
     guestLoginContainer.style.display = 'block';
     fullLoginForm.style.display = 'none'; // Garante que o formulário de login completo esteja escondido inicialmente
     loginUsernameInput.value = '';
     loginPasswordInput.value = '';
     loginError.textContent = '';
     localStorage.removeItem('currentChatWith');
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
     Object.values(groupChatListeners).forEach(unsubscribe => unsubscribe());
     groupChatListeners = {};
     groupsListUl.innerHTML = '';
     currentGroupId = null;
     // localStorage.removeItem('currentUser'); // REMOVIDO PARA PERSISTÊNCIA
     currentUser = '';
 }

 function showRegisterForm() {
     chatInterfaceDiv.style.display = 'none';
     loginContainer.style.display = 'none';
     registerContainer.style.display = 'flex';
     registerUsernameInput.value = '';
     registerPasswordInput.value = '';
     registerError.textContent = '';
 }

function showCurrentChat(otherUserId) {
     if (!currentUser || !users.hasOwnProperty(currentUser)) { // Verifica se currentUser existe e se é um usuário registrado
         alert("Você precisa estar logado com uma conta para iniciar um chat privado.");
         return;
     }
     currentChatWith = otherUserId;
     currentGroupId = null;
     localStorage.setItem('currentChatWith', otherUserId);
     contactsListContainer.style.display = 'none';
     currentChatContainerDiv.style.display = 'flex';
     globalChatContainerDiv.style.display = 'none';
     groupsContainerDiv.style.display = 'none';
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
     groupsContainerDiv.style.display = 'none';
     contactsListContainer.style.display = 'block';
     currentChatWith = null;
     currentGroupId = null;
     localStorage.removeItem('currentChatWith');
     messagesDiv.innerHTML = '';
     chatTitle.textContent = '';
     if (currentUser && users.hasOwnProperty(currentUser)) {
         updateContactList(Object.keys(users).filter(user => user !== currentUser));
         messageInput.disabled = false;
         sendButton.disabled = false;
     } else {
         updateContactList(Object.keys(users).filter(user => user !== currentUser));
         messageInput.disabled = true;
         sendButton.disabled = true;
     }
 }

 function showGlobalChat() {
     contactsListContainer.style.display = 'none';
     currentChatContainerDiv.style.display = 'none';
     groupsContainerDiv.style.display = 'none';
     globalChatContainerDiv.style.display = 'flex';
     chatTitle.textContent = 'Chat Global';
     currentChatWith = 'global';
     currentGroupId = null;
     messagesDiv.innerHTML = ''; // Limpa a área de mensagens (pode ser redundante)
     if (!globalChatListener) {
         loadGlobalChat();
     }
     messageInput.disabled = !currentUser; // Desabilita se não houver usuário
     sendButton.disabled = !currentUser;
 }

 function showGroupsList() {
     contactsListContainer.style.display = 'none';
     currentChatContainerDiv.style.display = 'none';
     globalChatContainerDiv.style.display = 'none';
     groupsContainerDiv.style.display = 'flex';
     currentChatWith = null;
     currentGroupId = null;
     messagesDiv.innerHTML = '';
     chatTitle.textContent = '';
     loadGroups(); // Garante que a lista de grupos seja carregada ao abrir a seção
     messageInput.disabled = !currentUser;
     sendButton.disabled = !currentUser;
 }

 function showGroupChat(groupId, groupName) {
     currentGroupId = groupId;
     currentChatWith = null;
     localStorage.removeItem('currentChatWith');
     contactsListContainer.style.display = 'none';
     globalChatContainerDiv.style.display = 'none';
     groupsContainerDiv.style.display = 'none';
     currentChatContainerDiv.style.display = 'flex';
     chatTitle.textContent = groupName;
     messagesDiv.innerHTML = '';

     const groupChatRef = ref(database, `groups/${groupId}/messages`);

     if (groupChatListeners[groupId]) {
         groupChatListeners[groupId]();
         delete groupChatListeners[groupId];
     }

     const onValueCallback = onValue(groupChatRef, (snapshot) => {
         const data = snapshot.val();
         displayGroupMessages(data);
     });
     groupChatListeners[groupId] = onValueCallback;
     messageInput.disabled = !currentUser;
     sendButton.disabled = !currentUser;
 }

 function getChatId(user1, user2) {
     return user1 < user2 ? `${user1}_${user2}` : `${user2}_${user1}`;
 }

 function updateLastRead(otherUserId) {
     if (currentUser && users.hasOwnProperty(currentUser) && otherUserId !== 'global') {
         const lastReadRef = ref(database, `lastRead/${getChatId(currentUser, otherUserId)}/${currentUser}`);
         set(lastReadRef, serverTimestamp());
     }
 }

 function loadActiveChats() {
     if (currentUser && users.hasOwnProperty(currentUser)) {
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
     } else {
         // Se não houver currentUser registrado, não carregamos chats privados
         updateContactList([]); // Mostra uma lista de contatos vazia para não logados
     }
 }

 function loadGlobalChat() {
     const globalChatRef = ref(database, `globalChat`);
     globalChatListener = onValue(globalChatRef, (snapshot) => {
         const data = snapshot.val();
         displayGlobalMessages(data);
     });
 }

 function loadGroups() {
     const groupsRef = ref(database, `groups`);
     onValue(groupsRef, (snapshot) => {
         const data = snapshot.val();
         const groupsArray = data ? Object.entries(data).map(([key, value]) => ({ ...value, id: key })) : [];
         displayGroups(groupsArray);
     });
 }

 function displayGroups(groups) {
     groupsListUl.innerHTML = '';
     groups.forEach(group => {
         const li = document.createElement('li');
         li.classList.add('contact-item', 'group-item');
         li.textContent = group.name;
         const groupActions = document.createElement('div');
         groupActions.classList.add('group-actions');

         li.addEventListener('click', () => {
             if (group.password) {
                 enterPasswordTitle.textContent = `Entrar no Grupo: ${group.name}`;
                 groupToJoinInput.value = group.id;
                 enterGroupPasswordModal.style.display = 'block';
             } else {
                 showGroupChat(group.id, group.name);
             }
         });

         if (isAdmin(currentUser)) {
             const deleteButton = document.createElement('button');
             deleteButton.classList.add('delete-group-button');
             deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
             deleteButton.addEventListener('click', (event) => {
                 event.stopPropagation(); // Prevent group selection
                 deleteGroup(group.id);
             });
             groupActions.appendChild(deleteButton);
         }

         li.appendChild(groupActions);
         groupsListUl.appendChild(li);
     });
 }

 function deleteGroup(groupId) {
     if (isAdmin(currentUser) && groupId) {
         const groupRef = ref(database, `groups/${groupId}`);
         remove(groupRef)
             .then(() => {
                 console.log(`Grupo ${groupId} excluído.`);
                 loadGroups(); // Reload the group list after deletion
                 if (currentGroupId === groupId) {
                     showGroupsList(); // Go back to the group list if the deleted group was open
                 }
             })
             .catch((error) => console.error("Erro ao excluir grupo:", error));
     } else {
         console.log("Apenas administradores podem excluir grupos.");
     }
 }

 function toggleFavorite(user) {
     if (currentUser && users.hasOwnProperty(currentUser)) {
         if (favoriteContacts[user]) {
             delete favoriteContacts[user];
         } else {
             favoriteContacts[user] = true;
         }
         localStorage.setItem('favoriteContacts', JSON.stringify(favoriteContacts));
         updateContactList(Object.keys(users).filter(u => u !== currentUser));
     } else {
         alert("Você precisa estar logado para adicionar contatos aos favoritos.");
     }
 }

 function updateContactList(usersToDisplay) {
     contactsUl.innerHTML = '';
     const searchInput = contactSearchInput.value.toLowerCase();
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
         if (!currentUser) {
             li.classList.add('guest-disabled'); // Adiciona classe para desabilitar interação
         }
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

         if (currentUser) {
             const favoriteIcon = document.createElement('button');
             favoriteIcon.classList.add('favorite-button');
             favoriteIcon.innerHTML = favoriteContacts[user] ? '<i class="fas fa-star favorited"></i>' : '<i class="far fa-star"></i>';
             favoriteIcon.addEventListener('click', (event) => {
                 event.stopPropagation();
                 toggleFavorite(user);
             });
             actionsDiv.appendChild(favoriteIcon);
         }
         li.appendChild(actionsDiv);
         li.addEventListener('click', () => {
             if (currentUser && users.hasOwnProperty(currentUser)) { // Só permite iniciar chat privado se for usuário logado
                 showCurrentChat(user);
             } else {
                 alert("Você precisa estar logado com uma conta para iniciar um chat privado.");
             }
         });
         contactsUl.appendChild(li);
     });
 }

 loginButton.addEventListener('click', () => {
     console.log('Botão de login clicado!');
     const username = loginUsernameInput.value.trim();
     const password = loginPasswordInput.value;

     if (validateUser(username, password)) { // Usando a função de validação de user.js
         console.log('Login bem-sucedido para:', username);
         currentUser = username;
         localStorage.setItem('currentUser', currentUser);
         showChatInterface();
         loadActiveChats(); // Carrega os contatos privados após o login
     } else {
         console.log('Falha no login para:', username);
         loginError.textContent = 'Usuário ou senha incorretos.';
     }
 });

 registerButton.addEventListener('click', () => {
     const username = registerUsernameInput.value.trim();
     const password = registerPasswordInput.value;

     if (username && password) {
         // Aqui você implementaria a lógica de registro real
         // Por enquanto, apenas simulamos o registro e fazemos login
         users[username] = password; // Adiciona o novo usuário (apenas na memória - perderá ao recarregar)
         currentUser = username;
         localStorage.setItem('currentUser', currentUser);
         showChatInterface();
         loadActiveChats();
         showLoginForm(); // Volta para o formulário de login após o "registro"
     } else {
         registerError.textContent = 'Por favor, digite um nome de usuário e senha.';
     }
 });

 logoutButtonContacts.addEventListener('click', () => {
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
 backToContactsFromGroupsButton.addEventListener('click', () => {
     showContactList();
 });

 sendButton.addEventListener('click', () => {
     if (currentGroupId) {
         addGroupMessage(messageInput.value);
     } else if (currentUser && users.hasOwnProperty(currentUser)) {
         addMessage(messageInput.value);
     } else {
         alert("Você precisa estar logado para enviar mensagens privadas.");
     }
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
     if (currentUser && users.hasOwnProperty(currentUser)) {
         updateContactList(Object.keys(users).filter(u => u !== currentUser));
     } else {
         updateContactList(Object.keys(users).filter(u => u !== currentUser)); // Mostra a lista para convidados
     }
 });
showFavoritesButton.addEventListener('click', () => {
     showingFavorites = true;
     showFavoritesButton.classList.add('active');
     showAllContactsButton.classList.remove('active');
     if (currentUser && users.hasOwnProperty(currentUser)) {
         updateContactList(Object.keys(users).filter(u => u !== currentUser));
     } else {
         updateContactList(Object.keys(users).filter(u => u !== currentUser)); // Mostra a lista para convidados
     }
 });

 createGroupButton.addEventListener('click', () => {
     createGroupModal.style.display = 'block';
 });

 groupsButton.addEventListener('click', () => {
     showGroupsList();
 });

 closeCreateGroupModal.addEventListener('click', () => {
     createGroupModal.style.display = 'none';
     createGroupError.textContent = '';
     groupNameInput.value = '';
     groupPasswordInput.value = '';
 });

 confirmCreateGroupButton.addEventListener('click', () => {
     const groupName = groupNameInput.value.trim();
     const groupPassword = groupPasswordInput.value;

     if (!groupName) {
         createGroupError.textContent = 'Por favor, digite o nome do grupo.';
         return;
     }

     const newGroupRef = push(ref(database, 'groups'), {
         name: groupName,
         password: groupPassword || null,
         creator: currentUser,
         timestamp: serverTimestamp()
     });

     newGroupRef.then(() => {
         createGroupModal.style.display = 'none';
         createGroupError.textContent = '';
         groupNameInput.value = '';
         groupPasswordInput.value = '';
         loadGroups();
         showGroupsList();
     }).catch((error) => {
         createGroupError.textContent = `Erro ao criar grupo: ${error.message}`;
     });
 });

 closeEnterPasswordModal.addEventListener('click', () => {
     enterGroupPasswordModal.style.display = 'none';
     enterPasswordError.textContent = '';
     groupAccessPasswordInput.value = '';
     groupToJoinInput.value = '';
 });

 confirmEnterGroupButton.addEventListener('click', () => {
     const password = groupAccessPasswordInput.value;
     const groupId = groupToJoinInput.value;

     if (!groupId) {
         enterPasswordError.textContent = 'Erro: ID do grupo não encontrado.';
         return;
     }

     const groupRef = ref(database, `groups/${groupId}`);
     get(groupRef).then((snapshot) => {
         const groupData = snapshot.val();
         if (groupData) {
             if (groupData.password === password) {
                 enterGroupPasswordModal.style.display = 'none';
                 enterPasswordError.textContent = '';
                 groupAccessPasswordInput.value = '';
                 groupToJoinInput.value = '';
                 showGroupChat(groupId, groupData.name);
             } else if (groupData.password) {
                 enterPasswordError.textContent = 'Senha incorreta.';
             } else {
                 // Grupo sem senha
                 enterGroupPasswordModal.style.display = 'none';
                 enterPasswordError.textContent = '';
                 groupAccessPasswordInput.value = '';
                 groupToJoinInput.value = '';
                 showGroupChat(groupId, groupData.name);
             }
         } else {
             enterPasswordError.textContent = 'Grupo não encontrado.';
         }
     }).catch((error) => {
         enterPasswordError.textContent = `Erro ao verificar senha: ${error.message}`;
     });
 });

 modal.addEventListener('click', (event) => {
     if (event.target === modal) {
         modal.style.display = 'none';
     }
 });

 closeModal.addEventListener('click', () => {
     modal.style.display = 'none';
 });

 let typingTimeout;

 function showTypingIndicator() {
     typingIndicator.textContent = `${currentUser} está digitando...`;
 }

 function clearTypingIndicator() {
     typingIndicator.textContent = '';
 }

 guestLoginButton.addEventListener('click', () => {
     console.log('Botão de login convidado clicado!');
     const guestName = generateGuestName(); // Gera o nome automaticamente
     currentUser = guestName;
     localStorage.setItem('currentUser', currentUser);
     showChatInterface();
     updateContactList(Object.keys(users).filter(user => user !== currentUser)); // Carrega a lista para convidados
 });

 loginOptionsButton.addEventListener('click', () => {
     guestLoginContainer.style.display = 'none';
     fullLoginForm.style.display = 'block';
     registerContainer.style.display = 'none';
 });

 backToGuestLoginButton.addEventListener('click', () => {
     fullLoginForm.style.display = 'none';
     registerContainer.style.display = 'none';
     guestLoginContainer.style.display = 'block';
 });

 showRegisterLink.addEventListener('click', () => {
     guestLoginContainer.style.display = 'none';
     fullLoginForm.style.display = 'none';
     registerContainer.style.display = 'flex';
 });

 showLoginLink.addEventListener('click', () => {
     registerContainer.style.display = 'none';
     guestLoginContainer.style.display = 'block';
     fullLoginForm.style.display = 'block';
 });

 backToGuestFromRegisterButton.addEventListener('click', () => {
     registerContainer.style.display = 'none';
     guestLoginContainer.style.display = 'block';
     fullLoginForm.style.display = 'none';
 });

 // Inicialização: Verifica se há um usuário logado ao carregar a página
 if (currentUser) {
     showChatInterface();
 } else {
     showLoginForm();
     updateContactList(Object.keys(users).filter(user => user !== currentUser)); // Inicializa com a lista para não logados
 }

 // Carrega a lista de contatos (se houver um usuário logado) na inicialização
 if (currentUser && users.hasOwnProperty(currentUser)) {
     loadActiveChats();
 } else {
     updateContactList(Object.keys(users).filter(user => user !== currentUser)); // Inicializa com a lista para não logados
 }

 contactSearchInput.addEventListener('input', () => {
     if (currentUser && users.hasOwnProperty(currentUser)) {
         updateContactList(Object.keys(users).filter(u => u !== currentUser));
     } else {
         updateContactList(Object.keys(users).filter(u => u !== currentUser)); // Atualiza a lista para convidados também
     }
 });
