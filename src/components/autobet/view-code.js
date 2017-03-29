import React, { Component, PropTypes } from 'react';
import { FormGroup, Col, InputGroup } from 'react-bootstrap'

class ViewCode extends Component {


	render() {

		const { name, script } = this.props;

		return (
			<Col xs={24}>
				<FormGroup>
					<InputGroup>
						<InputGroup.Addon>
							Name:
						</InputGroup.Addon>
						<input type="text"
									 name="name"
									 className="form-control"
									 value={name}
									 readOnly={true}
						/>
					</InputGroup>
				</FormGroup>
				<textarea className="form-control" rows={6} value={script} disabled={true} />
				<button
					className="btn btn-primary"
					onClick={ () => this.props.onBack() }
					readOnly={true}
				>Back</button>
			</Col>

		);
	}

}

ViewCode.propTypes = {
	name: PropTypes.string.isRequired,
	script: PropTypes.string.isRequired,
	onBack: PropTypes.func.isRequired,
};

export default ViewCode;