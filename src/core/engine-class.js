import EventEmitter from 'eventemitter3';

import { growthFunc } from '../util/math'
import {  objectEntries } from '../util/belt'
import CBuffer from '../util/cbuffer'


// POSSIBLE EVENTS:
//  ... GAME_STATE_CHANGED
//  ... BET_STATUS_CHANGED  (anything to do with placing new bets...)
//  ... PLAYERS_CHANGED     (anything to do with the player list..)
//  ... HISTORY_CHANGED (new item in the history)

// events really strategies
// GAME_STARTING
// GAME_STARTED
// GAME_ENDED
// GAME_STOPPED
// BET_PLACED
// CASHED_OUT


export default class Engine extends EventEmitter {
	constructor(userInfo, socket) {
		super();
		this._userInfo = userInfo;
		this._socket = socket;


		this.bust = 0;
		this.force = false;


		// This is a mapping of uname to bet amount. All these have not yet cashed out!
		this.playing = new Map();

		// This is an array of cashouts (appended) of  { wager, uname, cashedAt }
		this.cashOuts = [];

		/**
		 * The state of the game
		 * Possible states: GAME_STARTING, GAME_IN_PROGRESS, GAME_ENDED,
		 */
		this.gameState = 'GAME_ENDED';

		/** Creation time of current game. This is the server time, not clients.. **/
		this.created = null;

		/** The game id of the current game */
		this.gameId = null;

		/**
		 * Client side times:
		 * if the game is pending, startTime is how long till it starts
		 * if the game is running, startTime is how long its running for
		 * if the game is ended, startTime is how long since the game started
		 */
		this.startTime = 0;  //Note it's in integers..


		/** If you are currently placing a bet
		 * True if the bet was sent to the server but the server has not responded yet
		 *
		 * Cleared in game_started
		 */
		this.placingBet = false;


		/** True if cashing out.. */
		this.cashingOut = false;


		this.wager = 0;  // When playing, this is how much we wagered (otherwise zero)
		this.cashedAt = 0;  // How much we cashed out at (otherwise zero)


		/**
		 * If a number, how much to bet next round
		 * Saves the queued bet if the game is not 'game_starting', cleared in 'bet_placed' by us and 'game_started' and 'cancel bet'
		 */
		this.next = null; // { wager, payout, isAuto, resolve, reject};


		/** Store the id of the timer to check for lag **/
		this.tickTimer = null;

		/** Tell if the game is lagging but only  when the game is in progress **/
		this.lag = false;

		/** The hash of the last game **/
		this.lastHash = null;

		/** Animation Events triggers**/
		this.nyan = false;

		this.pieces = 0;
		this.invested = 0; // how much in total has been invested

		// a cbuffer of of { gameId, bust, hash, wager, cashOut }
		this.history = new CBuffer(150);

		/// events: ...

		socket.on('gameStarting', info => {
			this.gameId = info.gameId;
			this.playing = new Map();
			this.cashOuts = [];

			this.wager = 0;
			this.cashedAt = 0;

			this.gameState = 'GAME_STARTING';

			const timeTillStart = 5000; // TODO: this should be sent by the server?

			this.startTime = Date.now() + timeTillStart;

			// Every time a game is starting, we check if there's a queued bet
			if (this.next) {
				const {wager, payout, isAuto, resolve, reject} = this.next;

				this.next = null;
				socket.send('bet', {wager, payout, isAuto}).then(resolve, reject);
			}

			this.emit('PLAYERS_CHANGED');
			this.emit('GAME_STATE_CHANGED');
			this.emit('GAME_STARTING', info);
		});

		socket.on('gameStarted', info => {
			this.gameState = 'GAME_IN_PROGRESS';
			this.startTime = Date.now();
			this.lastGameTick = this.startTime;
			this.placingBet = false;


			this.emit('GAME_STATE_CHANGED');
			this.emit('PLAYERS_CHANGED'); // Not quite sure this is required

			this.emit('GAME_STARTED', info);
		});


		socket.on('gameEnded', info => {
			this.gameState = 'GAME_ENDED';
			this.bust = info.bust;
			this.forced = info.forced;
			this.lastHash = info.hash;


			// TODO: adjust/assert bankroll...

			this.history.unshift({
				gameId: this.gameId,
				bust: this.bust,
				hash: info.hash,
				cashedAt: this.cashedAt,
				wager: this.wager,
			});

			this.emit('HISTORY_CHANGED');
			this.emit('GAME_STATE_CHANGED');
			this.emit('PLAYERS_CHANGED');

			this.emit('GAME_ENDED', info);
		});

		socket.on('gameStopped', (info) => {
			this.gameState = 'GAME_STOPPED';

			this.emit('GAME_STATE_CHANGED');
			this.emit('GAME_STOPPED', info);
		});


		socket.on('betPlaced', bet => {

			this.playing.set(bet.uname, bet.wager);

			if (bet.uname === userInfo.uname) {
				this.placingBet = false;
				this.wager = bet.wager;


				userInfo.changeBalance(-bet.wager);

				if (userInfo.balance !== bet.newBalance) {
					console.warn('user balance was off by ', bet.newBalance-userInfo.balance, ' syncing');
					userInfo.changeBalance(bet.newBalance-userInfo.balance);
				}

				this.emit('BET_STATUS_CHANGED');
			}

			this.emit('PLAYERS_CHANGED');
			this.emit('BET_PLACED', bet)
		});


		socket.on('cashedOut', (cashOuts) => {

			for (const [cashedAt, ...unames] of cashOuts) {

				for (const uname of unames) {
					const wager = this.playing.get(uname);

					this.playing.delete(uname);
					this.cashOuts.push({uname, cashedAt, wager});


					if (uname === userInfo.uname) {
						this.cashingOut = false;
						this.cashedAt = cashedAt;


						userInfo.changeBalance(wager * cashedAt);
						this.emit('BET_STATUS_CHANGED');
					}

					// A simpler event for scripts
					this.emit('CASHED_OUT', {uname, cashedAt, wager});
				}

			}

			this.emit('PLAYERS_CHANGED');
		});

	}

	_getElapsedTime() {
		return Date.now() - this.startTime;
	}



	getElapsedTimeWithLag() {
		if(this.gameState === 'GAME_IN_PROGRESS') {
			if (this.lag) {
				return this.lag - this.startTime;
			} else {
				return this._getElapsedTime();
			}
		} else {
			return 0;
		}
	}

	getCurrentPayout() {
		const ms = this.getElapsedTimeWithLag();
		return growthFunc(ms);
	}

	/** If the user is currently playing return and object with the status else return undefined **/
	getCurrentBet() {
		if (!this._userInfo.uname)
			return undefined;

		return this.playing.get(this._userInfo.uname);
	}

	/** True if you are playing and haven't cashed out, it returns true on game_crash also, it clears until game_starting **/
	currentlyPlaying() {
		return this.getCurrentBet() !== undefined;
	}

	// If the game is starting and we're going to be in it
	isEnteringGame() {
		return this.gameState === 'GAME_STARTING' && this.playing.has(this._userInfo.uname);
	}


	bet(wager, payout, isAuto) {
		// TODO: if we're a few miliseconds before GAME_STARTED, perhaps we should queue instead of failing?
		if (this.gameState === 'GAME_STARTING') {
			if (this.placingBet || this.wager) {
				console.warn('You were already placing a bet');
				return Promise.reject('You were already placing a bet');
			}

			this.placingBet = true;

			this.emit('BET_STATUS_CHANGED');
			return this._socket.send('bet', { wager, payout, isAuto });
		}

		return new Promise((resolve, reject) => {

			this.next = { wager, payout, isAuto, resolve, reject };
			this.emit('BET_STATUS_CHANGED');

		});


	}

	isBetQueued() {
		return !!this.next;
	}

	cancelQueuedBet() {
		this.next = null;
		this.emit('BET_STATUS_CHANGED');
	}

	cashOut() {
		console.assert(this.gameState === 'GAME_IN_PROGRESS');
		console.assert(this.currentlyPlaying());

		this.cashingOut = true;
		this._socket.send('cashOut', this.getCurrentPayout());
		this.emit('BET_STATUS_CHANGED');
	}



	initialize(info) {
		if (!(info.playing instanceof Map)) {
			info.playing = new Map(objectEntries(info.playing));
		}
		if (!(info.history instanceof CBuffer)) {
			const cbuff = new CBuffer(info.history.length);
			cbuff.pushArray(info.history);
			info.history = cbuff;
		}

		Object.assign(this, info);
		if (this.elapsed) {
			this.startTime = Date.now() - this.elapsed;
			delete this.elapsed;
		}

		this.emit('GAME_STATE_CHANGED');
		this.emit('PLAYERS_CHANGED');
		this.emit('BET_STATUS_CHANGED');
		this.emit('HISTORY_CHANGED');
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
