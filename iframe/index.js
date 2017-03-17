import UserInfo from '../src/core/user-info-class'
import Engine from '../src/core/engine-class'
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
		establish(e.data);
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

function establish(script) {
	console.log('Running script: ', script);
}

console.log('Wowzer!');