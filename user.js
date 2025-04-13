 // user.js

 const users = {
  'Henrique': 'as12', // Exemplo de ADM
  'morango': '666',
  'Transante': 'Nett4',
  'pesopesado': '170311',
  'macho': 'as12',
  'lucas': 'lucas',
  'Bia18': 'bianca200610',
  'alan': 'qwe1234',
  'Kauan777': 'kauan2525',
  'Tammyson777': 'tammy25tammy',
  'Xkz': '102030',
  'Blachat': '0112',
  'tkg': '102030',
  'Voce': 'as12',
  'anonimo': 'as12',
  'Scarlett': '444',
  'convidado': '1234',
  'linda': 'as12',
  'almeidasx22': '251219',
  'almeidasx': '251219',
  'almeida22': '251219gaby',
  'bianca': 'isndjs', //bots
  'luis': 'bdhdhdhd',
  'gato': 'jdjdhdhd',
  'estefani': 'jendjd',
  'marlon': 'jendjd',
  'naruto': 'shbdhd',
  'neymar': 'ndndjd',
  'sabrina': 'hdudndjdnd',
  'dilma': 'jsndusjs',
  'lula': 'sjeneuej',
  'luna': 'usndudnddj'
 };

 const admins = ['Blachat'];

 // Função para validar se o nome contém apenas letras e números
 function isValidGuestName(name) {
  return /^[a-zA-Z0-9]+$/.test(name);
 }

 document.addEventListener('DOMContentLoaded', () => {
  const guestNameInput = document.getElementById('guest-name-input');
  const guestLoginButton = document.getElementById('guest-login-button');
  const loginContainer = document.getElementById('login-container');
  const chatInterface = document.getElementById('chat-interface');
  const contactsListContainer = document.getElementById('contacts-list-container');
  const globalChatContainer = document.getElementById('global-chat-container');

  // Impedir que caracteres inválidos sejam digitados no nome de convidado
  if (guestNameInput) {
   guestNameInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^a-zA-Z0-9]/g, '');
   });
  }

  if (guestLoginButton) {
   guestLoginButton.addEventListener('click', () => {
    const guestName = guestNameInput.value.trim();
    if (guestName && isValidGuestName(guestName)) {
     localStorage.setItem('chatUser', `guest-${guestName}`);
     loginContainer.style.display = 'none';
     chatInterface.style.display = 'flex';
     contactsListContainer.style.display = 'flex';
     globalChatContainer.style.display = 'none';
     // Envia um evento para o servidor indicando que um convidado se conectou
     const socket = io(); // Garante que a conexão Socket.IO esteja ativa
     socket.emit('userConnected', `guest-${guestName}`);
    } else {
     alert('Por favor, digite seu nome de convidado (apenas letras e números).');
     if (guestNameInput) {
      guestNameInput.value = ''; // Limpa o campo se for inválido
     }
    }
   });
  }
 });

 export function validateUser(username, password) {
  return users.hasOwnProperty(username) && users[username].trim() === password.trim();
 }

 export function isAdmin(username) {
  return admins.includes(username);
 }

 // Expondo o objeto de usuários (opcional)
 export {
  users
 };
