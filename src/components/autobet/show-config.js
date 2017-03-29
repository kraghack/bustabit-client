import React, { Component, PropTypes } from 'react';
import { Col } from 'react-bootstrap'

import { objectEntries } from '../../util/belt';

// This is a rather strange component, it takes a proper `config` and mutates it as the user changes it


class ShowConfig extends Component {
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
						  <div className="col-xs-22">{ this.interpretConfigItem(oName, oItem) }</div>
					</div>);

				}
				return <div>{ items }</div>;
			default:
				console.log('unknown: ', item.type);
				return <h1>Error: Unknown item type: { item.type }</h1>
		}
	}

	interpretConfigItem(name, item) {
		if (item.type === 'radio') {
			return <div className="form-group" key={name}>
				<hr className="hr-text" data-content={ item.label || name } />
				{ this.getConfigContents(name, item) }
			</div>
		}


		return <div className="form-group" key={name}>
			<div className="input-group">
					<span className="input-group-addon">{ item.label || name } </span>
					{ this.getConfigContents(name, item) }
					{ item.type === 'balance' && <span className="input-group-addon">bits</span>}
					{ item.type === 'multiplier' && <span className="input-group-addon">x</span>}
			</div>
		</div>
	}



	render() {

		let items = [];

		for (const [name, item] of objectEntries(this.props.config)) {
			items.push(this.interpretConfigItem(name, item));
		}

		return <Col xs={24}>
			<div className="visible-sm-block visible-xs-block" style={{ marginTop: '10px'}}></div>
			{items}
			</Col>;
	}



}

ShowConfig.propTypes = {
	config: PropTypes.object.isRequired
};


export default ShowConfig;