import socket from '../socket';
import Bankroll from './bankroll-class'


const bankroll = new Bankroll(socket);
window._bankroll = bankroll; // for debugging


socket.on('connect', ([,,bankrollInfo]) => {
	bankroll.initialize(bankrollInfo);
});


export default bankroll;