import EventEmitter from 'eventemitter3';


// POSSIBLE EVENTS:
//  ... BANKROLL_CHANGED


export default class Bankroll extends EventEmitter {
	constructor(socket) {
		super();
		this._socket = socket;

		this.balance = 0;
		this.offsite = 0.0;
		this.pieces = 0.0;
		this.invested = 0.0;
		this.bets = 0.0;
		this.wagered = 0.0;


		const onInvested = (details) => {
			this.balance += details.bankrollBalanceChange;
			this.invested += details.bankrollBalanceChange;
			this.pieces += details.piecesChange;
			this.offsite += details.offsiteChange;
			this.emit('BANKROLL_CHANGED');
		};


    // as far as the global bankroll is concerned, it's identical...
		socket.on('invested', onInvested);
		socket.on('investment', onInvested);

	}


	initialize(info) {
		Object.assign(this, info);
		this.emit('BANKROLL_CHANGED');
	}

	getMaxBet() {
		return this.balance * 0.002; // TODO: use config..
	}

	getMaxProfit() {
		return this.balance * 0.01; // TODO: use the config
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
