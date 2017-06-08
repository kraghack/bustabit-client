import socket from '../socket';
import UserInfo from './user-info-class'


const userInfo = new UserInfo(socket);
window._userInfo = userInfo; // for debugging

socket.on('connect', ([loggedIn,engineInfo,]) => {
	if (loggedIn) {
		userInfo.initialize(loggedIn.userInfo, engineInfo);
	}
});


export default userInfo;