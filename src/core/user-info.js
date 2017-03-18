import socket from '../socket';
import UserInfo from './user-info-class'


const userInfo = new UserInfo(socket);
window._userInfo = userInfo; // for debugging

socket.on('connect', ([loggedIn,,]) => {
	if (loggedIn) {
		userInfo.initialize(loggedIn.userInfo);
	}
});


export default userInfo;