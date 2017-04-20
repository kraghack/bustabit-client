import React, {  Component } from 'react';
import refresher from '../refresher'
import bankroll from '../core/bankroll'
import { formatBalance } from '../util/belt'


class MaxBet extends Component {
	render() {
		return <span>{ formatBalance(bankroll.getMaxBet()) }&nbsp;bits</span>
	}
}

export default refresher(MaxBet,
	[bankroll, 'BANKROLL_CHANGED']
)
