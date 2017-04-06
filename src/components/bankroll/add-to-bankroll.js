import React, { PureComponent } from 'react'
import { Col, Form, FormGroup, InputGroup } from 'react-bootstrap'
import {  browserHistory } from 'react-router'
import socket from '../../socket'
import refresher from '../../refresher'
import notification from '../../core/notification'
import engine from '../../core/engine'
import userInfo from '../../core/user-info'
import { formatBalance, isAmountInvalid } from '../../util/belt'
import confirm from '../../util/confirmation'
import { minInvest } from '../../util/config'
//import { realDilutionFee } from '../../util/math'

class AddToBankroll extends PureComponent {
	constructor(props) {
		super(props);
		this.firstInput = null; // ref to the first input
		this.state = {
			amount: '',
			amountError: null,
			offsite: '0',
			offsiteError: null,
			submitting: false,
			blocking: false, // Are we waiting on the game to be ended
			touched: false,
			advanced: false // show offsite
		};
	}
	componentDidMount(){
		this.firstInput.focus();
	}

	componentWillUnmount(){
		this.unmounted = true;
	}

	onAmountChange(event) {
		const amount = event.target.value.trim();
		const amountError = this.state.touched ? isAmountInvalid(amount, 0) : null;
		this.setState({amount, amountError});
	}

	onOffsiteChanged(event) {
		const offsite = event.target.value.trim();
		const offsiteError = isAmountInvalid(offsite, 0);
		this.setState({ offsite, offsiteError });
	}

	/// this returns true if the form is valid
	validate() {
		const { amount, offsite } = this.state;

		const useAllAmount = amount === '*';
		const useNothingAmount = Number.parseFloat(amount) === 0;

		let amountError = null;
		if (!useAllAmount && !useNothingAmount) {
			amountError = isAmountInvalid(amount, minInvest);
		}

		// TODO: validate the *  against their balance?
		// if (useAllAmount && userInfo.balance) { amountError = ... }


		const useAllOffsite = offsite === '*';
		const useNothingOffsite = Number.parseFloat(offsite) === 0;

		let offsiteError = null;

		if (!useAllOffsite && !useNothingOffsite) {
			offsiteError =  isAmountInvalid(offsite, minInvest);
		}
		// TODO: validate the *  against their balance?

		if (useNothingAmount && useNothingOffsite) {
			amountError = 'Need to be investing something..';
		}

		this.setState({
			amountError,
			offsiteError
		});


		return !amountError && !offsiteError;
	}

	getDilutionFee() {
		// TODO all this crap...

		//
		// const amount = this.state.amount === '*' ? userInfo.balance : Number.parseFloat(this.state.amount) * 100;
		// const formatedAmount = useAllAmount ? 'all your ' : formatBalance(amount);
		//
		//
		// const useAllOffsite = this.state.offsite === '*';
		// const offsite = useAllOffsite ? Number.MAX_VALUE : Number.parseFloat(this.state.offsite) * 100;
		//
		// return (realDilutionFee(amount, userInfo.stake, engine.bankroll)*100).toFixed(2);
	}


	handleSubmit(event) {
		event.preventDefault();

		if (!this.validate()) return;

		this.setState({ submitting: true, touched: true });

		const useAllAmount = this.state.amount === '*';

		const amount = useAllAmount ? Number.MAX_VALUE : Math.round(Number.parseFloat(this.state.amount) * 100);
		const formatedAmount = useAllAmount ? 'all your ' : formatBalance(amount);


		const useAllOffsite = this.state.offsite === '*';
		const offsite = useAllOffsite ? Number.MAX_VALUE : Math.round(Number.parseFloat(this.state.offsite) * 100);
		let formatedOffsite = '';
		if (offsite !== 0) {
			formatedOffsite = useAllOffsite ? 'and max offsite' : 'and ' + formatBalance(offsite) + ' bits offsite'
		}


		const confirmMessage = 'Are you sure you want to add ' + formatedAmount +' bits to the bankroll? ' +
			formatedOffsite +
			'Your stake will be calculated as if you had only added 90% of this (but the full amount will go into the bankroll)';


		confirm(confirmMessage).then(
			() => {
				this.setState({ submitting: false });

				const doAdd = () => {
					if (this.unmounted) return;
					this.setState({ blocking: false, submitting: true });
					socket.send('invest', { amount,  offsite })
						.then(() => {
								if (this.unmounted) return;
								this.setState({ blocking: false, submitting: false });


								browserHistory.push('/');
							},
							err => {
								if (this.unmounted) return;

								if (err === 'NOT_IN_BETWEEN_GAMES') {
									this.setState({ blocking: true });
									socket.once('gameEnded', doAdd);
									return;
								}
								this.setState({ blocking: false, submitting: false });

								console.error('Unexpected server error: ' + err);
								notification.setMessage(<span><span className="red-tag">Error </span> Unexpected server error: {err}.</span>, 'error');
							}
						)
				};

				doAdd();

			}, () => {
				this.setState({ submitting: false });
			}
		)

	}


	render() {
		const { amountError }  = this.state;

		let buttonContents;
		let disabled;
		if (this.state.blocking) {
			buttonContents = <span><i className="fa fa-spinner fa-pulse fa-fw"></i> Please wait for the current game to end</span>;
			disabled = true;
		} else if (this.state.submitting) {
			buttonContents = <i className="fa fa-spinner fa-pulse fa-fw"></i>;
			disabled = true;
		} else {
			buttonContents = 'Submit';
			disabled = false;
		}


		return (
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<Col xs={24} sm={20}>
					<h4>Add to Bankroll:</h4>
					<br/>
					<Form horizontal onSubmit={(event) => this.handleSubmit(event, false)}>
						{ amountError && <strong className="red-error">{amountError}</strong>}
						<FormGroup className={amountError ? 'has-error' : ''}>
							<InputGroup>
								<InputGroup.Addon>
									Amount:
								</InputGroup.Addon>
								<input type="text"
											 placeholder="Amount"
											 className="form-control"
											 value={this.state.amount}
											 ref={(input) => { this.firstInput = input; }}
											 onChange={(event) => this.onAmountChange(event)}
											 disabled={ disabled  }
								/>
								<InputGroup.Addon>
									bits
								</InputGroup.Addon>
							</InputGroup>

						</FormGroup>

						{ this.state.advanced && <FormGroup>
							<InputGroup>
								<InputGroup.Addon>
									Offsite:
								</InputGroup.Addon>
								<input type="text"
											 placeholder="offsite"
											 className="form-control"
											 value={this.state.offsite}
											 onChange={(event) => this.onOffsiteChanged(event)}
											 disabled={ disabled  }
								/>
								<InputGroup.Addon>
									bits
								</InputGroup.Addon>
							</InputGroup>
						</FormGroup>}

						{ !this.state.advanced &&
						<a onClick={ () => {
							this.setState({ advanced: true});

							if (this.state.amount === '') {
								this.setState({ amount: '0' })
							}
						}}>Show Advanced</a>
						}




						<Col xs={16} xsOffset={4} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
							<button className='btn btn-success btn-lg' type="submit" disabled={  disabled }>
								{ buttonContents }
							</button>
						</Col>
					</Form>
				</Col>
				<p className="text-muted">
					Note: You can use * to represent max-possible value
				</p>
			</div>);
	}

}

export default refresher(AddToBankroll,
	[userInfo, 'BANKROLL_STATS_CHANGED', 'UNAME_CHANGED'],
	[engine, 'BANKROLL_CHANGED']
);
