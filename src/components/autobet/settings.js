import React, { Component, PropTypes } from 'react';

import { objectEntries } from '../../util/belt';

// This is a rather strange component, it takes a proper `config` and mutates it as the user changes it


class Settings extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}


	getConfigContents(name, item) {
		switch (item.type) {
			case 'noop':
				return null;
			case 'balance':
				return <input type="number"
											className="form-control"
											value={ item._textInput || Math.round(item.value) / 100 }
											onChange={ (event) => {
												const val = event.target.value;
												item._textInput = val;
												const n = Number.parseFloat(val);
												if (Number.isFinite(n)) {
													item.value = n*100;
												}

												this.forceUpdate();
											}}
				/>;
			case 'multiplier':
				console.log('mulitplier item: ', name, item);
				return <input type="number"
											className="form-control"
											value={ item._textInput || item.value }
											onChange={ (event) => {
												const val = event.target.value;
												item._textInput = val;
												const n = Number.parseFloat(val);
												if (Number.isFinite(n)) {
													item.value = n;
												}

												this.forceUpdate();
											}}
				/>;
			case 'radio':
				let items = [];
				for (const [oName, oItem] of objectEntries(item.options)) {

					items.push(<div key={oName} className="row">
							<div className="col-xs-1">
											<input type="checkbox" name={name} value={oName}
														 checked={oName === item.value}
														 onChange={ (event) => {
															 item.value = event.target.value;
															 this.forceUpdate();
														 }} />
							</div>
						  <div className="col-xs-11">{ this.interpretConfigItem(oName, oItem) }</div>
					</div>);

				}
				return <div>{ items }</div>;
			default:
				console.log('unknown: ', item.type);
				return <h1>Error: Unknown item type: { item.type }</h1>
		}
	}

	interpretConfigItem(name, item) {
		return <div className="input-group" key={name}>
				<span className="input-group-addon">{ item.label || name } </span>
				{ this.getConfigContents(name, item) }
				{ item.type === 'balance' && <span className="input-group-addon">bits</span>}
		  	{ item.type === 'multiplier' && <span className="input-group-addon">x</span>}
		</div>
	}



	render() {

		let items = [];

		for (const [name, item] of objectEntries(this.props.config)) {
			items.push(this.interpretConfigItem(name, item));
		}

		return <div>{items}</div>;
	}



}

Settings.propTypes = {
	config: PropTypes.object.isRequired
};


export default Settings;