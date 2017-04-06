import React, { PureComponent } from 'react'
import { Col, Form, FormGroup, InputGroup } from 'react-bootstrap'
import { browserHistory } from 'react-router'
import socket from '../../socket'
import refresher from '../../refresher'
import notification from '../../core/notification'
import engine from '../../core/engine'
import userInfo from '../../core/user-info'
import { formatBalance, isAmountInvalid } from '../../util/belt'
import confirm from '../../util/confirmation'
import { minDivest } from '../../util/config'

class RemoveFromBankroll extends PureComponent {
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
			advanced: false // show the offsite
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
		const {amount, offsite} = this.state;

		const useAllAmount = amount === '*';
		const useNothingAmount = Number.parseFloat(amount) === 0;
		let amountError = null;

		if (!useAllAmount && !useNothingAmount) {
			amountError = isAmountInvalid(amount, minDivest);
		}

		const useAllOffsite = offsite === '*';
		const useNothingOffsite = Number.parseFloat(offsite) === 0;
		let offsiteError = null;

		if (!useAllOffsite && !useNothingOffsite) {
			offsiteError = isAmountInvalid(offsite, minDivest);
		}


		if (useNothingAmount && useNothingOffsite) {
			amountError = 'Must actually be divesting something';
		}


		this.setState({
			amountError,
			offsiteError
		});


		return !amountError && !offsiteError;
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


		const confirmMessage = 'Are you sure you want to remove ' + formatedAmount +' bits from the bankroll? ' +
			formatedOffsite;



		confirm(confirmMessage).then(
			() => {
				this.setState({ submitting: false });

				const doRemove = () => {
					if (this.unmounted) return;
					this.setState({ blocking: false, submitting: true });
					socket.send('divest', { amount, offsite })
						.then(() => {
								if (this.unmounted) return;
								this.setState({ blocking: false, submitting: false });

								browserHistory.push('/');

								// TODO NOTIFICATION
							/*
								let extraMessage = '';
								if (divested.silver > 0) {
									extraMessage = '(' + formatBalance(divested.silver) + ' silver, as it was profit)';
								}

								notification.setMessage('You have removed '+ formatBalance(total) + ' bits from the bankroll ' + extraMessage);
								*/
							},
							err => {
								if (this.unmounted) return;

								if (err === 'NOT_IN_BETWEEN_GAMES') {
									this.setState({ blocking: true });
									socket.once('gameEnded', doRemove);
									return;
								}
								this.setState({ blocking: false, submitting: false });

								console.error('Unexpected server error: ' + err);
								notification.setMessage(<span><span className="red-tag">Error </span> Unexpected server error: {err}.</span>, 'error');
							}
						)
				};

				doRemove();

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
          <h4>Remove from Bankroll:</h4>
          <br/>
          <Form horizontal onSubmit={(event) => this.handleSubmit(event)}>
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
											 disabled={ disabled }
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

export default refresher(RemoveFromBankroll,
  [userInfo, 'BANKROLL_STATS_CHANGED', 'UNAME_CHANGED'],
  [engine, 'BANKROLL_CHANGED']
);
