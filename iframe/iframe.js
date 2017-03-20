import UserInfo from '../src/core/user-info-class'
import Engine from '../src/core/engine-class'
import Chat from '../src/core/chat-class'

import EventEmitter from 'eventemitter3';


let sandboxed = true;
try {
	window.localStorage.get('s');
	sandboxed = false;
} catch (e) {}

if (!sandboxed) {
	throw new Error('Aborting script, it appears we are not running in a sandbox');
}


let fakeSocket = new EventEmitter();

let chat = new Chat(fakeSocket);
let userInfo = new UserInfo(fakeSocket);
let engine = new Engine(userInfo, fakeSocket);

let firstMessage = true;


window.addEventListener('message', function (e) {
	console.log('event origin: ', e.origin);
	if (e.origin !== (window.location.protocol + "//" + window.location.host))
		return;

	let mainWindow = e.source;


	if (firstMessage) {
		firstMessage = false;
		const { script, engineState, chatState, userInfoState } = e.data;

		chat.initialize(chatState);
		userInfo.initialize(userInfoState);
		engine.initialize(engineState);

		console.log('should run script: ', script);

	} else {
		let [k,v] = e.data;
		console.log('iframe got event:', k, v);
		fakeSocket.emit(k, v);
	}


	// console.log('Data: ', e.data);
	//
	// var result;
	// try {
	// 	result = eval(e.data);
	// } catch (e) {
	// 	result = e.toString();
	// }
	//
	// console.log('Trying to post: ', result);
	// mainWindow.postMessage(result, e.origin);
});
