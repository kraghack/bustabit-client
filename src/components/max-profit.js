import React, {  Component } from 'react';
import refresher from '../refresher'
import bankroll from '../core/bankroll'
import { formatBalance } from '../util/belt'


class MaxProfit extends Component {
	render() {
		return <span>{ formatBalance(bankroll.getMaxProfit()) }&nbsp;bits</span>
	}
}

export default refresher(MaxProfit,
	[bankroll, 'BANKROLL_CHANGED']
)



