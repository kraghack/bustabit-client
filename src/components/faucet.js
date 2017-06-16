import React, { PureComponent } from 'react'
import { Col, Row } from 'react-bootstrap'

import socket from '../socket'
import notification from '../core/notification'
import userInfo from '../core/user-info'
import refresher from '../refresher';
import NotLoggedIn from './not-logged-in-well'
import Recaptcha from './recaptcha'


class Faucet extends PureComponent {

	constructor(props) {
		super(props);
		this.getRecaptchaResponse = null;
		this.state = {
			status: 'UNCLAIMED'
		};
	}

	claim() {

		this.getRecaptchaResponse(recaptchaResponse => {

			this.setState({ status: 'CLAIMING' });

			socket.send('claimFaucet', recaptchaResponse)
				.then(() => {
						console.log('faucet was claimed.');
						this.setState({
							status: 'CLAIMED'
						});
						this.history.push('/');
						notification.setMessage(<span><span className="green-tag">Success!</span> Faucet claimed.</span>);
					},
					err => {
						console.error('Got error claiming faucet: ', err);
						this.setState({status: 'ERROR', error: err.message || 'unknown error'})
						this.history.push('/');
						notification.setMessage(<span><span
							className="red-tag">Error </span> Error claiming faucet: {err}.</span>, 'error');
					}
				);
		});
	}


	render() {


		let faucetDisplay = (
			<Row>
				<Col xs={24} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
					<button onClick={() => this.claim() }>
						<h4>Claim faucet</h4>
					</button>
					<Recaptcha responder={ r => this.getRecaptchaResponse = r } />
				</Col>
			</Row>
		);

		if (!userInfo.uname) {
			return (
				<NotLoggedIn/>
			)
		}

		if (this.state.status === 'CLAIMING')
			return (
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
					<Col xs={20} style={{textAlign: 'center'}}>
						<i className="fa fa-spinner fa-pulse fa-3x fa-fw loading-animation-blue"></i>
					</Col>
				</div>
			);
		else if (this.state.status === 'ERROR')
			return (
				<div>
					<p><b>Oh noes!</b> There was an error claiming the faucet!</p>
					<p className="red-error">
						Got error: { this.state.error }
					</p>
				</div>
			);
		else
			return (
				<div>
					{ faucetDisplay }
				</div>
			);
	}
}

export default refresher(Faucet,
	[userInfo, 'UNAME_CHANGED']
);