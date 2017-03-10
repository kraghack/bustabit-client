import React, {  Component } from 'react';
import refresher from '../refresher'
import engine from '../core/engine'
import { formatBalance } from '../util/belt'


class MaxProfit extends Component {
	render() {
		return <span>{ formatBalance(engine.getMaxProfit()) }&nbsp;bits</span>
	}
}

export default refresher(MaxProfit,
	[engine, 'BANKROLL_CHANGED']
)



