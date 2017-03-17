import socket from '../socket';
import Chat from './chat-class'


const chat = new Chat(socket);
window._chat = chat; // for debugging
export default chat;