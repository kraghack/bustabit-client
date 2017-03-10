import React, {  Component } from 'react';
import refresher from '../refresher'
import engine from '../core/engine'
import { formatBalance } from '../util/belt'


class MaxBet extends Component {
	render() {
		return <span>{ formatBalance(engine.getMaxBet()) }&nbsp;bits</span>
	}
}

export default refresher(MaxBet,
	[engine, 'BANKROLL_CHANGED']
)
