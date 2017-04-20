import EventEmitter from 'eventemitter3';

// events, balance-changed

// events:
//  UNAME_CHANGED:    called during login/log out the uname changes
//  BALANCE_CHANGED:  the balance has changed
//  BANKROLL_STATS_CHANGED: The bankroll{Stake, HighWater}, invested or divested changed
//  HAS_MFA_CHANGED
//  EMERGENCY_WITHDRAWAL_ADDRESS_CHANGED
//  EMAIL_CHANGED
//  UNPAID_DEPOSITS_CHANGED

export default class UserInfo extends EventEmitter {

  constructor(socket) {
    super();
		this.clear();


		socket.on('emergencyWithdrawalAddressChanged', address => {
			this.setEmergencyWithdrawalAddress(address);
		});


		socket.on('emailUpdated', email => {
			this.setEmail(email);
		});


		socket.on('youSentWithdrawal', fee => {
			this.unpaidDeposits = 0;
			this.changeBalance(-fee);
			this.emit('UNPAID_DEPOSITS_CHANGED');
		});


		socket.on('balanceChanged', (amount) => {
			console.assert(typeof amount === 'number');
			this.changeBalance(amount);
		});

		socket.on('logout', () => {
			localStorage.removeItem('secret');
			this.logOut();
		});

		socket.on('hasMFAChanged', b => {
			this.setHasMFA(b);
		});

		socket.on('deposit', d => {
			console.assert(typeof d.amount === 'number');
			this.changeBalance(d.amount);

			if (d.amount > 0) {
				this.unpaidDeposits++;
				this.emit('UNPAID_DEPOSITS_CHANGED');

				 // notification.setMessage("Your account has been credited "  + formatBalance(d.amount) + " bits from deposit " + d.txid);
			} else if (d.amount < 0) {
				this.unpaidDeposits--;
				this.emit('UNPAID_DEPOSITS_CHANGED');
			} else {
				// TODO: much smarter notifications...
				// notification.setMessage("incoming deposit detected")
			}


		});

		socket.on('tipped', d => {
			if (d.toUname === this.uname) {
				console.assert(typeof d.amount === 'number');
				this.balance += d.amount;
				this.emit('BALANCE_CHANGED');
			}

			if (d.uname === this.uname)  {
				console.assert(typeof d.amount === 'number');
				this.balance -= (d.amount + d.fee);
				this.emit('BALANCE_CHANGED');
			}
		});

  }

  clear() {
		this.balance = 0.0;
		this.bets = 0;
		this.created = new Date();
		this.divested = 0;
		this.email = '';
		this.emergencyWithdrawalAddress = '';
		this.hasMFA = false;
		this.kind = 'MEMBER'; // Can be MEMBER | TRUSTED | ADMIN
		this.highWater = 0;
		this.invested = 0;
		this.profit = 0;
		this.profitATH = 0;
		this.profitATL = 0;
		this.pieces = 0;
		this.uname = '';
		this.unpaidDeposits = 0;
		this.wagered = 0.0;
	}

	isTrusted() {
  	return this.kind === 'TRUSTED' || this.kind === 'ADMIN';
	}
  
  isLoggedIn() {
    return !!this.uname;
  }

  initialize(info) {
		console.assert(typeof info === 'object');
		console.assert(typeof info.uname === 'string');

		if (typeof info.created === 'string')
			info.created = new Date(info.created);


		Object.assign(this, info);

		// all events should be emitted
	  this.emit('UNAME_CHANGED');
		this.emit('BALANCE_CHANGED');
		this.emit('BANKROLL_STATS_CHANGED');
		this.emit('HAS_MFA_CHANGED');
		this.emit('EMERGENCY_WITHDRAWAL_ADDRESS_CHANGED');
		this.emit('UNPAID_DEPOSITS_CHANGED');
	}

	logOut() {
		this.clear();

		// all events should be emitted
		this.emit('UNAME_CHANGED');
		this.emit('BALANCE_CHANGED');
		this.emit('BANKROLL_STATS_CHANGED');
		this.emit('HAS_MFA_CHANGED');
		this.emit('EMERGENCY_WITHDRAWAL_ADDRESS_CHANGED');
		this.emit('UNPAID_DEPOSITS_CHANGED')
	}

  // increase the balance by amount
  changeBalance(amount) {
  	if (amount === 0) return;
    this.balance += amount;
    this.emit('BALANCE_CHANGED', amount);
  }

  // this also adds valor, but also probably will do something
	// different for the animations point of view (as it's not really a loss)
  changeBalanceFromBet(amount) {
		this.balance -= amount;
		this.emit('BALANCE_CHANGED', -amount);
	}

  invest(balanceChange, stakeChange, highWaterChange) {
		this.highWater += highWaterChange;
		this.stake += stakeChange;
		this.invested += balanceChange;

		// we have to call this last, because it has a sync emit:
		this.changeBalance(balanceChange);

		this.emit('BANKROLL_STATS_CHANGED');
	}

	divest(amount, newStake) {

		this.stake = newStake;
		this.divested += amount;

		// we have to call this last, because it has a sync emit:
		this.changeBalance(amount);

		this.emit('BANKROLL_STATS_CHANGED');
	}

	setHasMFA(b) {
  	if (this.hasMFA === b) return;

  	this.hasMFA = b;
  	this.emit('HAS_MFA_CHANGED');
	}

	setEmergencyWithdrawalAddress(address) {
  	this.emergencyWithdrawalAddress = address;
  	this.emit('EMERGENCY_WITHDRAWAL_ADDRESS_CHANGED')
	}

	setEmail(email) {
		this.email = email;
		this.emit('EMAIL_CHANGED')
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




// TODO: ...
// socket.on('withdrawalSent', withdrawal => {
// 	notification.setMessage('Your withdrawal of ' + formatBalance(withdrawal.amount) + ' bits to ' + withdrawal.address + ' has been sent!')
// });
