import React, { Component } from 'react';
import EditStrategy from './edit-strategy'
import Listing from './listing'
import RunStrategy from './run-strategy'
import ViewCode from './view-code'

class Autobet extends Component {

	constructor() {
		super();

		this.state = {
			showing: 'listing', // listing, editStrategy, runStrategy, viewCode
		}
	}

	render() {

		const { showing } = this.state;

		if (showing === 'listing') {
			return <Listing
				onAdd={() => this.setState({ showing: 'editStrategy' })}
				onView={ (name, script) => this.setState({ showing: 'viewCode', name, script })  }
				onRun={ (name, script) => this.setState({ showing: 'runStrategy', name, script }) }
			/>
		}

		if (showing === 'editStrategy') {
			return <EditStrategy onRun={ (config, runnableScript) => this.setState({ showing: 'running', config, runnableScript }) } />
		}

		if (showing === 'runStrategy') {
			return <RunStrategy
					name={ this.state.name }
					script={ this.state.script }
				/>
		}

		if (showing === 'viewCode') {
			return <ViewCode
				name={ this.state.name }
				script={ this.state.script }
				onBack={ () => this.setState({ showing: 'listing' }) }
			/>
		}

		throw new Error('Unknown showing: ' + showing);
	}

}


export default Autobet;