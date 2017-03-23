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

if (!window.parent) {
	throw new Error('wtf no parrent?!');
}

function parentPost(k, v) {
	window.parent.postMessage([k, v], (window.location.protocol + "//" + window.location.host));
}


var fakeSocket = new EventEmitter();
var promises = {}; // eventName to [resolve, reject]
var eventNumber = 1;

fakeSocket.send = function(k, v) {
	var eventName = ':' + eventNumber++;
	parentPost(k, [eventName, v]);
	return new Promise(function(resolve, reject) {
		promises[eventName] = [resolve, reject];
	});
};

window.chat = new Chat(fakeSocket);
window.userInfo = new UserInfo(fakeSocket);
window.engine = new Engine(userInfo, fakeSocket);

let firstMessage = true;


window.addEventListener('message', function (e) {
	if (e.origin !== (window.location.protocol + "//" + window.location.host))
		return;


	function log() {
		var message = '';
		for (var i = 0; i < arguments.length; ++i) {
			message += String(arguments[i]);
			if (i != arguments.length - 1) {
				message += '\t';
			}
		}
		parentPost('log', message);
	}

	console.log('got message: ', e.data);

	if (firstMessage) {
		firstMessage = false;
		const { script, engineState, chatState, userInfoState } = e.data;

		chat.initialize(chatState);
		userInfo.initialize(userInfoState);
		engine.initialize(engineState);

		log('script starting'); // main reason is to stop log getting dead-code-eliminated lol

		eval(script);

	} else {
		let [k,v] = e.data;

		if (promises.hasOwnProperty(k)) {
			console.log('Got promisey response: ', v);
			let [index, obj] = v;
			promises[k][index](obj);
			delete promises[k];
			return;
		}

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

parentPost('ready', new Date());




