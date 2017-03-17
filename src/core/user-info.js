import socket from '../socket';
import UserInfo from './user-info-class'


const userInfo = new UserInfo(socket);
window._userInfo = userInfo; // for debugging
export default userInfo;