import React, { PureComponent } from 'react'
import { Col, Form, FormGroup, InputGroup } from 'react-bootstrap'
import { Link , browserHistory } from 'react-router'
import socket from '../../socket'
import refresher from '../../refresher'
import notification from '../../core/notification'
import engine from '../../core/engine'
import userInfo from '../../core/userInfo'
import { formatBalance, isAmountInvalid } from '../../util/belt'
import confirm from '../../util/confirmation'
import { minInvest } from '../../util/config'

class AddToBankroll extends PureComponent {
	constructor(props) {
		super(props);
		this.firstInput = null; // ref to the first input
		this.state = {
			amount: '',
			amountError: null,
			submitting: false,
			blocking: false, // Are we waiting on the game to be ended
			touched: false
		};
	}
	componentDidMount(){
		this.firstInput.focus();
	}

	componentWillUnmount(){
		this.unmounted = true;
	}

	onAmountChange(event) {
		const amount = event.target.value;
		const amountError = this.state.touched ? isAmountInvalid(amount, minInvest) : null;
		this.setState({amount, amountError});
	}

	/// this returns true if the form is valid
	validate(useAll) {
		const amountError = useAll ? false : isAmountInvalid(this.state.amount, minInvest);
		this.setState({
			amountError
		});
		return !amountError;
	}


	handleSubmit(event, useAll) {
		event.preventDefault();

		if (!this.validate(useAll)) return;

		this.setState({ submitting: true, touched: true });

		let amount = useAll ? Number.MAX_VALUE : Number.parseFloat(this.state.amount) * 100;
		let formatedAmount = useAll ? 'all your ' : formatBalance(amount);


		const confirmMessage = 'Are you sure you want to add ' + formatedAmount +' bits to the bankroll?';


		confirm(confirmMessage).then(
			() => {
				this.setState({ submitting: false });

				const doAdd = () => {
					if (this.unmounted) return;
					this.setState({ blocking: false, submitting: true });
					socket.send('invest', amount)
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
								<input type="number"
											 placeholder="Amount"
											 className="form-control"
											 value={this.state.amount}
											 ref={(input) => { this.firstInput = input; }}
											 onChange={(event) => this.onAmountChange(event)}
											 disabled={ disabled  }
								/>
							</InputGroup>
						</FormGroup>

						<Col xs={16} xsOffset={4} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
							<button className='btn btn-success btn-lg' type="submit" disabled={  disabled }>
								{ buttonContents }
							</button>
						</Col>
					</Form>
				</Col>
				{ !disabled &&
				<Col xs={24} sm={20}>
					<Form horizontal onSubmit={(event) => this.handleSubmit(event, true)}>
						<hr />
						<Col xs={16} xsOffset={4} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
							<button className='btn btn-warning btn-lg' type="submit" disabled={ userInfo.balance < minInvest }>
								Add All
							</button>
						</Col>
					</Form>
				</Col>
				}
				<Col sm={6} xs={12} style={{marginTop: '20px'}}>
					<Link className="btn btn-info" to="/bankroll/history"><i className="fa fa-history"></i> History</Link>
				</Col>
			</div>);
	}

}

export default refresher(AddToBankroll,
	[userInfo, 'BANKROLL_STATS_CHANGED', 'UNAME_CHANGED'],
	[engine, 'BANKROLL_CHANGED']
);
