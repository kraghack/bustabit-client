import React, { PureComponent } from 'react'
import { Col, Form, FormGroup, InputGroup } from 'react-bootstrap'
import socket from '../../socket'
import refresher from '../../refresher'
import notification from '../../core/notification'
import bankroll from '../../core/bankroll'
import userInfo from '../../core/user-info'
import { formatBalance, isAmountInvalid } from '../../util/belt'
import confirm from '../../util/confirmation'
import { minInvest } from '../../util/config'
//import { realDilutionFee } from '../../util/math'

class ChangeBankroll extends PureComponent {
	constructor(props) {
		super(props);
		this.firstInput = null; // ref to the first input
		this.state = {
			balance: '',
			balanceError: null,
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

	onBalanceChange(event) {
		const balance = event.target.value.trim();

		const balanceError = this.state.touched && balance !== '*' && balance !== '-*' ? isAmountInvalid(balance, Number.MIN_SAFE_INTEGER) : null;
		this.setState({balance, balanceError});
	}

	onOffsiteChanged(event) {
		const offsite = event.target.value.trim();
		const offsiteError = offsite !== '*' && offsite !== '-*' ?  isAmountInvalid(offsite, Number.MIN_SAFE_INTEGER) : null;
		this.setState({ offsite, offsiteError });
	}

	/// this returns true if the form is valid
	validate() {
		const { balance, offsite } = this.state;

		const useAllBalance = balance === '*' || balance === '-*';
		const useNothingBalance = Number.parseFloat(balance) === 0;

		let balanceError = null;
		if (!useAllBalance && !useNothingBalance) {
			balanceError = isAmountInvalid(balance, Number.MIN_SAFE_INTEGER);
			if (!balanceError && Math.abs(Number.parseFloat(balance) * 100) < minInvest) {
				balanceError = 'Must change bankroll by more than ' + formatBalance(minInvest) + ' bits'
			}
		}

		// TODO: validate the *  against their balance?
		// if (useAllAmount && userInfo.balance) { amountError = ... }


		const useAllOffsite = offsite === '*' || offsite === '-*';
		const useNothingOffsite = Number.parseFloat(offsite) === 0;

		let offsiteError = null;

		if (!useAllOffsite && !useNothingOffsite) {
			offsiteError =  isAmountInvalid(offsite, Number.MIN_SAFE_INTEGER);
			if (!offsiteError && Math.abs(Number.parseFloat(offsite) * 100) < minInvest) {
				offsiteError = 'Must change bankroll by more than ' + formatBalance(minInvest) + ' bits'
			}
		}
		// TODO: validate the *  against their balance?

		if (useNothingBalance && useNothingOffsite) {
			balanceError = 'Need to be investing something..';
		}

		this.setState({
			balanceError,
			offsiteError
		});


		return !balanceError && !offsiteError;
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


		let useAllBalance;
		let balance;

		if (this.state.balance === '*') {
			useAllBalance = true;
			balance = Number.MAX_SAFE_INTEGER
		} else if (this.state.balance === '-*') {
			useAllBalance = true;
			balance = Number.MIN_SAFE_INTEGER;
		} else {
			useAllBalance = false;
			balance = Math.round(Number.parseFloat(this.state.balance) * 100)
		}



		const formatedBalance = useAllBalance ? 'the most ' : formatBalance(Math.abs(balance));

		let useAllOffsite;
		let offsite;
		if (this.state.offsite === '*') {
			useAllOffsite = true;
			offsite = Number.MAX_SAFE_INTEGER;
		} else if (this.state.offsite === '-*') {
			useAllOffsite = true;
			offsite = Number.MIN_SAFE_INTEGER;
		} else {
			useAllOffsite = false;
			offsite = Math.round(Number.parseFloat(this.state.offsite) * 100)
		}


		let formatedOffsite = '';
		if (offsite !== 0) {
			formatedOffsite = useAllOffsite ? 'and max offsite' : 'and ' + formatBalance(offsite) + ' bits offsite'
		}

		const verb = balance >= 0 ? 'add' : 'remove';
		const confirmMessage = 'Are you sure you want to ' + verb + ' ' + formatedBalance +' bits to the bankroll? ' +
			formatedOffsite +
			'. Your stake will be calculated as if you had only added 90% of this (but the full amount will go into the bankroll)';


		confirm(confirmMessage).then(
			() => {
				this.setState({ submitting: false });

				const doAdd = () => {
					if (this.unmounted) return;
					this.setState({ blocking: false, submitting: true });
					socket.send('invest', { balance,  offsite })
						.then(() => {
								if (this.unmounted) return;
								this.setState({ blocking: false, submitting: false });


								this.props.history.push('/');
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
		const { balanceError }  = this.state;

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
					<h4>Change Bankroll:</h4>
					<p className="text-muted">
						Use positive values to add to the bankroll, and negative values to remove<br/>
					</p>
					<br/>
					<Form horizontal onSubmit={(event) => this.handleSubmit(event, false)}>
						{ balanceError && <strong className="red-error">{balanceError}</strong>}
						<FormGroup className={balanceError ? 'has-error' : ''}>
							<InputGroup>
								<InputGroup.Addon>
									Balance:
								</InputGroup.Addon>
								<input type="text"
											 placeholder="Balance"
											 className="form-control"
											 value={this.state.balance}
											 ref={(input) => { this.firstInput = input; }}
											 onChange={(event) => this.onBalanceChange(event)}
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

							if (this.state.balance === '') {
								this.setState({ balance: '0' })
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
					<strong>Tip:</strong> You can use <code>*</code> to add the max-possible, and <code>-*</code> to remove the most possible
				</p>
			</div>);
	}

}

export default refresher(ChangeBankroll,
	[userInfo, 'BANKROLL_STATS_CHANGED', 'UNAME_CHANGED'],
	[bankroll, 'BANKROLL_CHANGED']
);
