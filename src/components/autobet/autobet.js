import React, { Component } from 'react';
import EditStrategy from './edit-strategy'
import Listing from './listing'
import RunStrategy from './run-strategy'
import configParser from '../../config-parser'
import Settings from './settings'


class Autobet extends Component {

	constructor() {
		super();


			let dev = `var config = {
	baseBet: { value: 100, type: 'balance', label: 'base bet' },
	payout: { value: 2, type: 'multiplier' },
	stop: { value: 1e8, type: 'balance', label: 'stop if bet >' },
	loss: {
		value: 'base', type: 'radio', label: 'On Loss',
		options: {
			base: { type: 'noop', label: 'Return to base bet' },
			increase: { value: 1, type: 'multiplier', label: 'Increase bet by' },
		}
	},
	win: {
		value: 'base', type: 'radio', label: 'On Win',
		options: {
			base: { type: 'noop', label: 'Return to base bet' },
			increase: { value: 1, type: 'multiplier', label: 'Increase bet by' },
		}
	}
};
	
  `;



		this.state = {
			showing: 'listing', // listing, editing, running
			config: configParser(dev)[0],
			runnableScript: configParser(dev)[1],
		}
	}

	render() {

		return <Settings config={ this.state.config } />;

		/*
		const { showing } = this.state;

		if (showing === 'listing') {
			return <Listing onAdd={() => this.setState({ showing: 'edit' })}/>
		}

		if (showing === 'edit') {
			return <EditStrategy onRun={ (config, runnableScript) => this.setState({ showing: 'running', config, runnableScript }) } />
		}

		if (showing === 'running') {
			return <RunStrategy config={ this.state.config } runnableScript={ this.state.runnableScript } />
		}
		*/
	}

}


export default Autobet;