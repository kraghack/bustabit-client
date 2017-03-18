import socket from '../socket';
import Engine from './engine-class'

import userInfo from './user-info'

const engine = new Engine(userInfo, socket);
window._engine = engine; // for debugging


socket.on('connect', ([,engineInfo,]) => {
	engine.initialize(engineInfo);
});


export default engine;