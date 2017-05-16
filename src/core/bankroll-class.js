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


			if (this.balance !== details.newBankrollBalance) {
				console.warn('bankroll balance was off by ', details.newBankrollBalance-this.balance, ' syncing');
				this.balance = details.newBankrollBalance;
			}
			if (this.invested !== details.newBankrollInvested) {
				console.warn('bankroll invested was off by ', details.newBankrollInvested-this.invested, ' syncing');
				this.invested = details.newBankrollBalance;
			}
			if (this.offsite !== details.newBankrollOffsite) {
				console.warn('bankroll offsite was off by ', details.newBankrollOffsite-this.offsite, ' syncing');
				this.offsite = details.newBankrollOffsite;
			}
			if (this.pieces !== details.newBankrollPieces) {
				console.warn('bankroll pieces was off by ', details.newBankrollPieces-this.pieces, ' syncing');
				this.pieces = details.newBankrollPieces;
			}

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

