import React, { Component } from 'react';
import EditStrategy from './edit-strategy'
import Listing from './listing'
import RunStrategy from './run-strategy'
import configParser from '../../config-parser'


class Autobet extends Component {

	constructor() {
		super();


			let dev = `var config = {
		baseBet: { value: 100, type: 'balance' },
		autoCashOut: { value: 1, type: 'multiplier' },
	};
	
	log('Betting: ', config.baseBet.value, config.autoCashOut.value);
	engine.bet(config.baseBet.value, config.autoCashOut.value)
	
  `;



		this.state = {
			showing: 'running', // listing, editing, running
			config: configParser(dev)[0],
			runnableScript: configParser(dev)[1],
		}
	}

	render() {
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
	}

}


export default Autobet;