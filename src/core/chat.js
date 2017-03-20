import socket from '../socket';
import Chat from './chat-class'


const chat = new Chat(socket);
window._chat = chat; // for debugging

socket.on('connect', ([,, friendsInfo]) => {
	chat.setFriends(friendsInfo);
});


socket.send('joinChannels', chat.openChannels())
	.then(history => chat.joinedChannels(history));


export default chat;