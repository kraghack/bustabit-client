import EventEmitter from 'eventemitter3';
import { objectEntries } from '../util/belt'
import CBuffer from '../util/cbuffer'

// events:
//  TABS_CHANGED: the channel list has changed, or focusedChannel, or friends changed...
//  FOCUSED_HISTORY_CHANGED:  the focused channel history history changed
//  SHOW_ADD_CHANNELS_CHANGED: ...
//  FRIENDS_CHANGED

const MaxMessagesPerChannel = 1000;

export default class Chat extends EventEmitter {

  constructor(socket) {
		super();
		this._socket = socket;


		this.showAddChannels = false;

		this.focusKind = 'CHANNEL'; // or 'UNAME'
		this.focused = 'english'; // or can be the uname of the person...


		// TODO: local storage or something.. ?
		// map of channel name, to { unread: int,  history: { message, uname, created } }
		this.channels = new Map([
			['english', { unread: 0, history: new CBuffer(MaxMessagesPerChannel) }],
			['polish',  { unread: 0, history: new CBuffer(MaxMessagesPerChannel) }],
			['spanish', { unread: 0, history: new CBuffer(MaxMessagesPerChannel) }]
		]);

		// map of friend uname to  { unread: int, history: { message, uname, created } }
		this.friends = new Map([]);


		socket.on('friendRemoved', uname => {
			this.friends.delete(uname);
			this.emit('TABS_CHANGED');
		});

		socket.on('friendStatus', ({uname, online}) => {
			this.friends.get(uname).online =  online;
			this.emit('TABS_CHANGED');
		});

		socket.on('friendAdded', ({uname, details}) => {
			this.friends.set(uname, details);
			this.emit('TABS_CHANGED');
		});

		socket.on('said', message => {
			const { channel } = message;

			if (!this.channels.has(channel)) {
				console.warn("Chat didn't have channel ", channel, " to append to");
				return;
			}

			message.created = new Date(message.created);
			this.channels.get(channel).history.push(message);

			this.emit('FOCUSED_HISTORY_CHANGED'); // TODO: not strictly accurate...
		});

		socket.on('privateMessaged', message => {


			message.created = new Date(message.created);

			const { uname, to } = message;


			// Since we're not sure which direction the PM was, just search both

			if (this.friends.has(uname)) {
				this.friends.get(uname).history.push(message)
			}
			if (this.friends.has(to)) {
				this.friends.get(to).history.push(message)
			}

			this.emit('FOCUSED_HISTORY_CHANGED'); // TODO: not strictly accurate...
		});

		socket.on('logout', () => {
			this.friends.clear();
		});
	}

	initialize(info) {

		console.assert(info.channels instanceof Map);
		console.assert(info.friends instanceof Map);


		Object.assign(this, info);

		// all events should be emitted
		this.emit('TABS_CHANGED');
		this.emit('FOCUSED_HISTORY_CHANGED');
		this.emit('SHOW_ADD_CHANNELS_CHANGED');
		this.emit('FRIENDS_CHANGED');
	}

	setFriends(statusObj) {
		const entries = objectEntries(statusObj);

		for (const [uname, { online, history}] of entries) {

			const newHistory = new CBuffer(MaxMessagesPerChannel);

			for (const message of history) {
				message.created = new Date(message.created);
				newHistory.push(message);
			}

			this.friends.set(uname, { unread: 0, online, history: newHistory });
		}


		this.friends = new Map(objectEntries(statusObj));
		this.emit('TABS_CHANGED');
	}

	openChannels() {
  	return Array.from(this.channels.keys())
	}

	setShowAddChannels(v) {
		this.showAddChannels = v;
		this.emit('SHOW_ADD_CHANNELS_CHANGED')
	}

	focusTab(name, kind) {
  	this.focused = name;
  	this.focusKind = kind;
		this.emit('TABS_CHANGED');
		this.emit('FOCUSED_HISTORY_CHANGED');
	}

	focusedHistory() {
		const focused = (this.focusKind === 'CHANNEL' ?  this.channels : this.friends).get(this.focused);
		let r = focused ? focused.history.toArray() : [];
		console.log('focused history: ', r);
		return r;
	}

	joinedChannels(channels) {

		const entries = objectEntries(channels);
		for (const [channel, messages] of entries) {

			const history = new CBuffer(MaxMessagesPerChannel);
			for (const message of messages) {
				message.created = new Date(message.created);
				history.push(message);
			}
			this.channels.set(channel, { unread: 0, history });
		}

		this.emit('FOCUSED_HISTORY_CHANGED');
	}

	isFriend(uname) {
  	return this.friends.has(uname)
	}

	openChannel(channel) {
  	if (this.channels.has(channel)) {
  		this.focusTab(channel, 'CHANNEL');
  		return;
		}

		this.channels.set(channel, { unread: 0, history: new CBuffer(MaxMessagesPerChannel) });

		// kind of conflating logic, but w/e
		this.focused = channel;
		this.showAddChannels = false;

		this.emit('TABS_CHANGED');
		this.emit('SHOW_ADD_CHANNELS_CHANGED');


		this._socket.send('joinChannels', [channel])
			.then(history => this.joinedChannels(history));
	}

	leaveChannel(channel) {
		this.channels.delete(channel);

		if (this.focusKind === 'CHANNEL' && channel === this.focused) {
			const { value } = this.channels.keys().next();
			this.focused = value; // might be null
			this.emit('FOCUSED_HISTORY_CHANGED');
		}

		this.emit('TABS_CHANGED');

		this._socket.send('leaveChannel', channel)
	}

	getState() {
		let data = {};
		for (const key in this){
			if (!this.hasOwnProperty(key) || key.startsWith("_")) continue;

			data[key] = this[key];
			if (data[key] instanceof CBuffer){
				data[key] = data[key].toArray();
			}

		}
		return data;
	}

}