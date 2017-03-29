import React, { Component, PropTypes } from 'react';
import { FormGroup, Col, InputGroup } from 'react-bootstrap'
import configParser from '../../config-parser'

const initialScript = `var config = {
	baseBet: { value: 100, type: 'balance' },
	autoCashOut: { value: 1, type: 'multiplier' },
};

engine.on('gameStarting', function() {
	engine.bet(config.baseBet.value, config.autoCashOut.value))
})`;

function validateName(name) {
	if (!name)
		return 'Please enter a name.'
}

class EditStrategy extends Component {

	constructor(props) {
		super();
		this.state = {
			name: 'Flat Better',
			script: props.script || initialScript,
			error: null
		}
	}

	onNameChange(event) {
		const name = event.target.value;
		const error = validateName(name);
		this.setState({name, error});
	}

	onRun() {
		let config, script;
		try {
			[config, script] = configParser(this.state.script);
		} catch (error) {
			this.setState({error});
			return;
		}
		this.props.onRun(config, script);
	}

	render() {
		const { name, error, script } = this.state;

		return (
			<Col xs={24}>
					{ error && <strong className="red-error">{error}</strong>}
					<FormGroup  className={ error ? 'has-error' : ''}>
						<InputGroup>
							<InputGroup.Addon>
								Name:
							</InputGroup.Addon>
							<input type="text"
										 name="name"
										 className="form-control"
										 value={name}
										 onChange={(event) => this.onNameChange(event)}
							/>
						</InputGroup>
					</FormGroup>
					<textarea className="form-control" rows={6} value={script} onChange={ event => this.setState({ script: event.target.value })} />
					<Col xs={12} style={{marginTop: '15px'}}><button className="btn btn-success" onClick={ () => this.onRun() }>Run</button></Col>
			</Col>

		);
	}

}

EditStrategy.propTypes = {
	onRun: PropTypes.func.isRequired
};

export default EditStrategy;