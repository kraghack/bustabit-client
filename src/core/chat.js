import socket from '../socket';
import Chat from './chat-class'


const chat = new Chat(socket);
window._chat = chat; // for debugging

socket.on('connect', ([,, friendsInfo]) => {
	chat.initialize(friendsInfo);
});


export default chat;