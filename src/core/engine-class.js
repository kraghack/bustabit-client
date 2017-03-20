import EventEmitter from 'eventemitter3';

import { dilutionFee }  from '../util/config'
import { growthFunc } from '../util/math'
import {  objectEntries } from '../util/belt'


// POSSIBLE EVENTS:
//  ... GAME_STATE_CHANGED
//  ... BANKROLL_CHANGED
//  ... BET_STATUS_CHANGED  (anything to do with placing new bets...)
//  ... PLAYERS_CHANGED     (anything to do with the player list..)
//  ... HISTORY_CHANGED (new item in the history)



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
		this.next = null; // { wager, payout, resolve, reject};


		/** Store the id of the timer to check for lag **/
		this.tickTimer = null;

		/** Tell if the game is lagging but only  when the game is in progress **/
		this.lag = false;

		/** The hash of the last game **/
		this.lastHash = null;

		/** Animation Events triggers**/
		this.nyan = false;

		this.bankroll = 0;
		this.invested = 0; // how much in total has been invested
		this.divested = 0; // how much in total has been divested

		// an array of { gameId, bust, hash, wager, cashOut }
		this.history = [];

		/// events: ...

		socket.on('gameStarting', info => {
			this.gameId = info.gameId;
			this.playing = new Map();
			this.cashOuts = [];

			this.wager = 0;
			this.cashedAt = 0;

			this.gameState = 'GAME_STARTING';
			this.bankroll = info.bankroll;

			const timeTillStart = 5000; // TODO: this should be sent by the server?

			this.startTime = Date.now() + timeTillStart;


			// Every time a game is starting, we check if there's a queued bet
			if (this.next) {
				const { wager, payout, resolve, reject } = this.next;

				this.next = null;
				socket.send('bet', { wager, payout }).then(resolve, reject);
			}

			this.emit('BANKROLL_CHANGED');
			this.emit('PLAYERS_CHANGED');
			this.emit('GAME_STATE_CHANGED');
		});

		socket.on('gameStarted', () => {
			this.gameState = 'GAME_IN_PROGRESS';
			this.startTime = Date.now();
			this.lastGameTick = this.startTime;
			this.placingBet = false;


			this.emit('GAME_STATE_CHANGED');
			this.emit('PLAYERS_CHANGED'); // Not quite sure this is required
		});


		socket.on('gameEnded', info => {
			this.gameState = 'GAME_ENDED';
			this.bust = info.bust;
			this.forced = info.forced;
			this.lastHash = info.hash;

			// TODO: .... handle bankroll info..


			this.history.push({
				gameId: this.gameId,
				bust: this.bust,
				hash: info.hash,
				cashedAt: this.cashedAt,
				wager: this.wager,
			});

			if (this.history.length > 100) {
				this.history.shift()
			}

			this.emit('HISTORY_CHANGED');
			this.emit('GAME_STATE_CHANGED');
			this.emit('PLAYERS_CHANGED');
		});

		socket.on('gameStopped', () => {
			this.gameState = 'GAME_STOPPED';
			this.emit('GAME_STATE_CHANGED');
		});


		socket.on('betPlaced', bet => {

			this.playing.set(bet.uname, bet.wager);

			if (bet.uname === userInfo.uname) {
				this.placingBet = false;
				this.wager = bet.wager;


				userInfo.changeBalanceFromBet(bet.wager);
				this.emit('BET_STATUS_CHANGED');
			}

			this.emit('PLAYERS_CHANGED');
		});


		socket.on('cashedOut', (cashOuts) => {
			let changeBalance = 0;

			for (const [cashedAt, ...unames] of cashOuts) {

				for (const uname of unames) {
					const wager = this.playing.get(uname);

					this.playing.delete(uname);
					this.cashOuts.push({ uname, cashedAt, wager });


					if (uname === userInfo.uname) {
						this.cashingOut = false;
						this.cashedAt = cashedAt;

						// We should emit bet_status_changed, but let's do that at the end
						// we will change changeBalance so we know
						changeBalance = wager * cashedAt;
					}
				}

			}

			if (changeBalance !== 0) {
				userInfo.changeBalance(changeBalance);
				this.emit('BET_STATUS_CHANGED');
			}

			this.emit('PLAYERS_CHANGED');
		});


// ---


// we invested,
		socket.on('youInvested', amount => {

			const { stake } = userInfo;
			const { bankroll } = this;

			let scaler = 1 - dilutionFee;
			let newStake = (scaler * amount + stake * bankroll) / (bankroll + scaler * amount);

			this.bankroll += amount;
			this.invested += amount;

			this.emit('BANKROLL_CHANGED');
			userInfo.invest(amount, newStake);
		});

// someone else invested
		socket.on('invested', amount => {
			this.bankroll += amount;
			this.invested += amount;
			this.emit('BANKROLL_CHANGED');
		});


// we divested
		socket.on('youDivested', divested => {
			const { stake } = userInfo;
			const { bankroll } = this;

			const total = divested.balance + divested.silver;
			const newBankroll = bankroll - total;

			let newStake = newBankroll > 0 ? (stake * bankroll - total) / newBankroll : 0;

			this.bankroll -= total;
			this.divested += total;
			this.emit('BANKROLL_CHANGED');
			userInfo.divest(divested.balance, divested.silver, newStake);

		});

	}

	_getElapsedTime() {
		return Date.now() - this.startTime;
	}

	getMaxBet() {
		return this.bankroll * 0.002; // TODO: use config..
	}

	getMaxProfit() {
		return this.bankroll * 0.01; // TODO: use the config
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


	bet(wager, payout) {
		// TODO: if we're a few miliseconds before GAME_STARTED, perhaps we should queue instead of failing?
		if (this.gameState === 'GAME_STARTING') {
			if (this.placingBet || this.wager) {
				console.warn('You were already placing a bet');
				return Promise.reject('You were already placing a bet');
			}

			this.placingBet = true;

			this.emit('BET_STATUS_CHANGED');
			return this._socket.send('bet', { wager, payout });
		}

		return new Promise((resolve, reject) => {

			this.next = { wager, payout, resolve, reject };
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

	sendCashOut() {
		console.assert(this.gameState === 'GAME_IN_PROGRESS');
		console.assert(this.currentlyPlaying());

		this.cashingOut = true;
		this._socket.send('cashOut', this.getCurrentPayout());
		this.emit('BET_STATUS_CHANGED');
	}

	bankrollProfit() {
		return this.invested - this.divested - this.bankroll;
	}

	initialize(info) {
		if (!(info.playing instanceof Map)) {
			info.playing = new Map(objectEntries(info.playing));
		}

		Object.assign(this, info);
		if (this.elapsed) {
			this.startTime = Date.now() - this.elapsed;
			delete this.elapsed;
		}

		this.emit('GAME_STATE_CHANGED');
		this.emit('BANKROLL_CHANGED');
		this.emit('PLAYERS_CHANGED');
		this.emit('BET_STATUS_CHANGED');
		this.emit('HISTORY_CHANGED');
	}

	getState() {
		let data = {};
		for (const key in this){
			if (this.hasOwnProperty(key) && !key.startsWith("_")) {
				data[key] = this[key];
			}
		}
		return data;
	}
}
