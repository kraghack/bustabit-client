import React, { Component } from 'react'
import { Row, Col, Form, FormGroup, InputGroup } from 'react-bootstrap'
import { Link, browserHistory } from 'react-router'
import userInfo from '../core/user-info'
import refresher from '../refresher';
import NotLoggedIn from './not-logged-in-well'
import socket from '../socket'
import { formatBalance } from '../util/belt'
import confirm from '../util/confirmation'
import notification from '../core/notification'
import {  newInputFee, newOutputFee } from '../util/config'
import browserSize from '../core/browser-size'


class Withdraw extends Component {
	constructor(props) {
		super(props);
		this.firstInput = null; // this is a ref
		this.state = {
			amount: null, // when it's null, render max withdrawal
			address: '',
			instantWithdrawal: false,
			error: null,
			amountError: null,
			addressError: null,
			submitting: false,
			touched: false
		};
	}
	componentDidMount(){
		this.firstInput.focus();
	}

	isInvalidAmount(amount) {

		if (!amount)
			return 'Please enter the amount of bits to withdraw.';

		if (amount < 100)
			return 'The minimum amount for withdrawal is 100 bits.';

		let total = Number.parseFloat(this.getTotal());


		if (total > userInfo.balance)
			return 'You don\'t have enough balance.';
	}

	validate() {
		let isValid = true;

		const amountError = this.isInvalidAmount(this.getAmount());

		this.setState({
			amountError
		});
		isValid = isValid && !amountError;


		const addressError = validateBtcAddress(this.state.address);

		this.setState({
			addressError
		});
		isValid = isValid && !addressError;


		return isValid;

	}

	onAmountChange(event) {
		const amount = event.target.value;
		const amountError = this.state.touched ? this.isInvalidAmount(amount) : null;
		this.setState({amount, amountError});
	}

	onAddressChange(event) {
		const address = event.target.value;
		const addressError = this.state.touched ? validateBtcAddress(address) : null;
		this.setState({address, addressError});
	}


	handleSubmit(event) {
		event.preventDefault();
		let { address, instantWithdrawal } = this.state;
		let amount = this.getAmount();

		console.log('instant withdrawal is: ', instantWithdrawal);

		if (!this.validate()) return;

		this.setState({ submitting: true, touched: true });
		amount = Number.parseFloat(amount) * 100;

		const confirmMessage = 'Are you sure you want to withdraw ' +
			formatBalance(amount)+' bits? Your total withdrawal would be '+
			formatBalance(this.getTotal()) +' bits. (Including the '+ formatBalance(this.getTotalFee())+' bits  fee).';


		confirm(confirmMessage).then(
			(result) => {
				socket.send('withdraw', {amount, address })
					.then(() => {

							if (instantWithdrawal) {
								socket.send('sendWithdrawals').then(() => {
									browserHistory.push('/transactions/withdrawals');
								}, () => {
									notification.setMessage('Your withdrawal was queued, but there seems to have been a problem with the' +
										'instant withdrawal. You were no charged for this, and we will process your withdrawal ASAP', 'error');
									browserHistory.push('/transactions/withdrawals');
								});
								return;
							}

							browserHistory.push('/transactions/withdrawals');
							notification.setMessage('Your withdrawal has been queued');
						},
						error => {
							this.setState({ submitting: false });
							switch (error) {
								case "INVALID_ADDRESS":
									console.error('The address ' + address + ' is not valid.');
									notification.setMessage(<span><span className="red-tag">Error </span> The address {address} is not valid. Please try again. </span>, 'error');
									break;
								default:
									console.error('Unexpected server error: ' + error);
									notification.setMessage(<span><span className="red-tag">Error </span> Unexpected server error: {error}.</span>, 'error');
							}
						}
					)
			},
			(result) => {
				this.setState({ submitting: false });
				console.log(result)
			}
		)

	}

	getTotal() {
	  let amount = this.getAmount();
	  amount = ( Number.parseFloat(amount) || 0 )  * 100;

    return amount + this.getTotalFee();
  }

  getTotalFee() {
		return newOutputFee + (this.state.instantWithdrawal ?  newOutputFee + newInputFee  : 0) +
				userInfo.unpaidDeposits * newInputFee;
	}

  // returns a number for the input box
  getAmount() {
		let { amount } = this.state;
		if ( amount === null) {
			const max = Math.max(Math.floor(userInfo.balance - this.getTotalFee()), 0);
			amount = (max / 100).toString();
		}
		return amount;
	}

	changeInstantWithdrawalSelected(){
		this.setState({instantWithdrawal: !this.state.instantWithdrawal});

	}


	render() {
		const {amountError, addressError, address, instantWithdrawal}  = this.state;

		const total = this.getTotal();

		return (
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center' , marginTop: '20px'}}>
				<Form horizontal onSubmit={(event) => this.handleSubmit(event)}>
					<Col xs={20} xsOffset={2}>
						{ addressError && <strong className="red-error">{addressError}</strong>}
						<FormGroup className={addressError ? 'has-error' : ''}>
							<InputGroup className="responsive-input-group">
								<InputGroup.Addon>
									Bitcoin Address:
								</InputGroup.Addon>
								<input type="text"
											 className="form-control"
											 value={address}
											 ref={(input) => { this.firstInput = input; }}
											 onChange={(event) => this.onAddressChange(event)}
								/>
							</InputGroup>
						</FormGroup>
					</Col>

					<Col xs={20} xsOffset={2}>
						{ amountError && <strong className="red-error">{amountError}</strong>}
						<Row>
						<Col sm={20} xs={24}>
							<FormGroup className={amountError ? 'has-error' : ''}>
								<InputGroup>
									{ browserSize.isMobile() ? '' : <InputGroup.Addon>Amount:</InputGroup.Addon>}
									<input type="number"
												 placeholder="400"
												 className="form-control"
												 value={this.getAmount()}
												 onChange={(event) => this.onAmountChange(event)}
									/>
									<InputGroup.Addon>
										bits
									</InputGroup.Addon>
								</InputGroup>
							</FormGroup>
						</Col>
						<Col sm={3} smOffset={1} xs={24}>
							<FormGroup className={amountError ? 'has-error' : ''}>
								<InputGroup>
									<InputGroup.Button>
										<button className="btn btn-danger form-control" type="button"
														onClick={() => this.setState({ amount: null})}>
											Max
										</button>
									</InputGroup.Button>
								</InputGroup>
							</FormGroup>
						</Col>
						</Row>
					</Col>
					<Col xs={17} xsOffset={2} style={{marginBottom: '15px'}}>
						<div className="checkbox">
							<label>
								<input type="checkbox"
											 checked={instantWithdrawal}
											 onChange={() => this.changeInstantWithdrawalSelected()}

								/>
								Instant Withdrawal ( + {formatBalance(newInputFee + newOutputFee)} bits )
							</label>
						</div>
					</Col>

					<Col xs={20} xsOffset={2} className="well">
						<Col xs={12}>Amount to Withdraw: </Col>
						<Col xs={12}>{ formatBalance(Number.parseFloat(this.getAmount() || 0) * 100) } bits</Col>
						<Col xs={12}>Withdrawal Fee:</Col>
						<Col xs={12}>{formatBalance(newOutputFee)} bits</Col>
						<Col xs={12}>Unpaid Deposit Fee: <small><Link to="/faq/deposit-fee">What is this?</Link></small></Col>
						<Col xs={12}>{formatBalance(userInfo.unpaidDeposits * newInputFee)} bits ({ userInfo.unpaidDeposits } x {formatBalance(newInputFee)} bits)</Col>
						<Col xs={12}>Instant Withdrawal Fee:</Col>
						<Col xs={12} className="bold">{ instantWithdrawal ? formatBalance(newInputFee + newOutputFee) : 0 } bits</Col>
						<Col xs={12}>Total:</Col>
						<Col xs={12} className={ total > userInfo.balance ? "bold red-color" : "bold"}>{formatBalance(total)} bits</Col>
					</Col>



					<Col xs={16} xsOffset={4} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
						<button className='btn btn-success btn-lg' type="submit" disabled={ this.state.submitting }>
							{ this.state.submitting ? <i className="fa fa-spinner fa-pulse fa-fw"></i> : 'Submit'}
						</button>
					</Col>
				</Form>

				<Col xs={24} sm={20}>
					<p className="text-muted" style={{alignSelf: 'flex-start'}}><span className="hl-word">Important: </span>
						Your withdrawal will be sent from the hot wallet, do not withdraw to any site that uses the sending address, or returns to sender, because any returns will probably be credited to a different player.</p>
					<p className="text-muted" style={{alignSelf: 'flex-start'}}><span className="hl-word">Hint: </span>If you
						don't know how to withdraw, check the procedure <Link to="/faq/how-to-withdraw">here</Link>.</p>
					<p className="text-muted" style={{alignSelf: 'flex-start'}}>
					If you want to check your past withdrawals and their status:
					<span style={{marginLeft: '5px'}}>
						<Link className="btn btn-info btn-xs" to="/transactions/withdrawals">
							<i className="fa fa-history"></i> History</Link>
					</span>
				</p>
				</Col>
			</div>
		);
	}
}



function validateBtcAddress(address) {
	if (!address)
		return 'Please enter your bitcoin address for us to send your bits.';
}


function withdrawWrapper() {
	if (!userInfo.uname) { return <NotLoggedIn/> }
	return <Withdraw />
}


// TODO: missing listening for unpaid_deposits...
export default refresher(withdrawWrapper,
	[userInfo, 'UNAME_CHANGED', 'BALANCE_CHANGED'],
	[browserSize, 'WIDTH_CHANGED']
);