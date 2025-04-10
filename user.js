 // user.js

 const users = {
  'Henrique': 'as12', // Exemplo de ADM
  'morango': '666',
  'Transante': 'Nett4',
  'peso pesado': '170311',
  'macho': 'as12',
  'lucas': 'lucas', // Removi espaços em branco extras
  'Bia18': 'bianca200610',
  'alan': 'qwe1234',
'Kauan777':'kauan2525',
'Tammyson777':'tammy25tammy',
  'Xkz': '102030',
  'Blachat.adm': '0112',
  'tkg': '102030',
  'Voce': 'as12',
  'anonimo': 'as12',
  'Scarlett': '444',
  'convidado': '1234',
  'linda': 'as12',
'almeidasx22':'251219',
'almeidasx':'251219',
'almeida22':'251219gaby',






'bianca':'isndjs', //bots
'luis':'bdhdhdhd',
'gato':'jdjdhdhd',
'estefani':'jendjd',
'marlon':'jendjd',
'naruto':'shbdhd',
'neymar':'ndndjd',
'sabrina':'hdudndjdnd',
'dilma':'jsndusjs',
'lula':'sjeneuej',
'luna':'usndudnddj'








 };

 
const admins = ['Blachat.adm'];

// Lista de administradores

 export function validateUser(username, password) {
  return users.hasOwnProperty(username) && users[username].trim() === password.trim(); // Adicionei .trim() para comparar corretamente
 }

 export function isAdmin(username) {
  return admins.includes(username);
 }

 // Expondo o objeto de usuários (opcional, para outras funcionalidades se necessário)
 export { users };
