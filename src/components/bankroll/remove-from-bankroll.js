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

class RemoveFromBankroll extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      amount: '',
      amountError: null,
			submitting: false,
			touched: false
    };
  }
	componentDidMount(){
		this.firstInput.focus();
	}

  onAmountChange(event) {
    const amount = event.target.value;
    const amountError = this.state.touched ? isAmountInvalid(amount, 1e6, engine.bankroll * userInfo.stake) : null;
    this.setState({amount, amountError});
  }

  /// this returns true if the form is valid
  validate() {
    const amountError = isAmountInvalid(this.state.amount, 1e6, engine.bankroll * userInfo.stake);
    this.setState({
      amountError
    });
    return !amountError;
  }


	handleSubmit(event, useAll) {
		event.preventDefault();

		if (!this.validate()) return;

		this.setState({ submitting: true, touched: true });

		let amount = useAll ? Number.MAX_VALUE : Number.parseFloat(this.state.amount) * 100;
		let formatedAmount = useAll ? 'all your ' : formatBalance(amount);


		const confirmMessage = 'Are you sure you want to remove ' + formatedAmount +' bits from the bankroll?';


		return confirm(confirmMessage).then(
			(result) => {
				console.log(result);
				socket.send('divest', amount)
					.then(() => {
							this.setState({ submitting: false });
							console.log('Removed from bankroll: ', amount);
							browserHistory.push('/');
							notification.setMessage('Removed '+ formatBalance(amount) + ' from the bankroll');
						},
						err => {
							this.setState({ submitting: false });
							console.error('Unexpected server error: ' + err);
							notification.setMessage(<span><span className="red-tag">Error </span> Unexpected server error: {err}.</span>, 'error');
						}
					)
			}, () => {
				this.setState({ submitting: false });
			}
		)

	}


  render() {
    const { amountError }  = this.state;
    return (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Col xs={24} sm={20}>
          <h4>Remove from Bankroll:</h4>
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
                />
              </InputGroup>
            </FormGroup>

						<Col xs={16} xsOffset={4} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
							<button className='btn btn-success btn-lg' type="submit" disabled={ this.state.submitting }>
								{ this.state.submitting ? <i className="fa fa-spinner fa-pulse fa-fw"></i> : 'Submit'}
							</button>
						</Col>
          </Form>
				</Col>
				<Col xs={24} sm={20}>
					<Form horizontal onSubmit={(event) => this.handleSubmit(event, true)}>
						<hr />
						<Col xs={16} xsOffset={4} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
							<button className='btn btn-warning btn-lg' type="submit" disabled={ this.state.submitting }>
								{ this.state.submitting ? <i className="fa fa-spinner fa-pulse fa-fw"></i> : 'Remove All'}
							</button>
						</Col>
					</Form>
				</Col>
        <Col xs={24} sm={20}>
          <p className="text-muted" style={{alignSelf: 'flex-start'}}><span className="hl-word">Hint: </span>If you
            want to learn more about the bankroll, click <Link to="/faq/how-does-the-bankroll-work">here</Link>.</p>
        </Col>
        <Col sm={6} xs={12} style={{marginTop: '20px'}}>
          <Link className="btn btn-info" to="/bankroll/history"><i className="fa fa-history"></i> History</Link>
        </Col>
      </div>);
  }

}

export default refresher(RemoveFromBankroll,
  [userInfo, 'BANKROLL_STATS_CHANGED', 'UNAME_CHANGED'],
  [engine, 'BANKROLL_CHANGED']
);
