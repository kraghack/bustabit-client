import React, { Component, PropTypes } from 'react';
import { Col } from 'react-bootstrap'
import configParser from '../../config-parser'

const initialScript = `var config = {
	amount: { value: 100, type: 'balance' },
	payout: { value: 2, type: 'multiplier' }
};

log('Betting ', config.amount.value, '@', config.payout.value);
engine.bet(config.amount.value, config.payout.value);
`;



class AddStrategy extends Component {

	constructor(props) {
		super(props);
		this.state = {
			script: initialScript,
			error: null
		}
	}

	onRun() {
		try {
			configParser(this.state.script);
		} catch (error) {
			this.setState({error});
			return;
		}
		this.props.onRun(this.state.script);
	}

	render() {
		const { error, script } = this.state;

		return (
			<Col xs={24}>
					{ error && <strong className="red-error">{error}</strong>}
					<textarea className="form-control" rows={6} value={script} onChange={ event => this.setState({ script: event.target.value })} />
					<Col xs={12} style={{marginTop: '15px'}}><button className="btn btn-success" onClick={ () => this.onRun() }>Run</button></Col>
			</Col>
		);
	}

}

AddStrategy.propTypes = {
	onRun: PropTypes.func.isRequired
};

export default AddStrategy;