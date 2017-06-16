import React, { PureComponent } from 'react'
import { Row, Col, Table } from 'react-bootstrap'
import { formatBalance } from '../../util/belt';
import { Link } from 'react-router-dom'
import socket from '../../socket'


export default class Breakdown extends PureComponent {

	constructor() {
		super();
		this.state = {
			loading: true,
			error: null,
		}
	}

	componentWillMount() {
		socket.send('getUserBreakdown').then(
			breakdown => this.setState({ loading: false, ...breakdown }),
			error => this.setState({ loading: false, error})
		)
	}


	render() {
		if (this.state.loading) return <span>Loading...</span>;
		if (this.state.error) return <p>Error loading breakdown: { this.state.error }</p>;

		return (
			<Row>
				<Row>
					<Col sm={24} xs={24} style={{marginTop: '20px'}}>
						<h5 style={{textTransform: 'uppercase', letterSpacing: '3px'}}>Breakdown</h5>
					</Col>
				</Row>

				<Col sm={22} smOffset={1} xs={22} xsOffset={1} style={{marginTop: '20px', padding: '0px'}}>
					<Table condensed hover responsive className="table-light">
						<thead className="table-header">
						<tr>
							<th style={{width: '40%'}}>Type</th>
							<th style={{width: '20%'}}><i className="fa fa-btc bits-color" aria-hidden="true"></i> Bits</th>
						</tr>
						</thead>
						<tbody>
						<tr>
							<td><Link to="/transactions/deposits">Deposits</Link></td>
							<td><Link to="/transactions/deposits">{ formatBalance(this.state.deposits) } bits</Link></td>
						</tr>
						<tr>
							<td><Link to="/transactions/withdrawals">Withdrawals</Link></td>
							<td><Link to="/transactions/withdrawals">{ formatBalance(-this.state.withdrawals) } bits</Link></td>
						</tr>
						<tr>
							<td>Faucet [free bits]</td>
							<td>{ formatBalance(this.state.faucet) } bits</td>
						</tr>
						<tr>
							<td><Link to="/transactions/tips">Tips Recieved</Link></td>
							<td><Link to="/transactions/tips">{ formatBalance(this.state.incomingTips) } bits</Link></td>
						</tr>
						<tr>
							<td><Link to="/transactions/tips">Tips Sent</Link></td>
							<td><Link to="/transactions/tips">{ formatBalance(this.state.outgoingTips) } bits</Link></td>
						</tr>
						<tr>
							<td>Added to Bankroll</td>
							<td><Link to="/bankroll/history">{ formatBalance(-this.state.invested) } bits</Link></td>
						</tr>
						<tr>
							<td><Link to="/bankroll/history">Removed from Bankroll</Link></td>
							<td><Link to="/bankroll/history">{ formatBalance(this.state.divested) } bits</Link></td>
						</tr>
						<tr>
							<td>Game Profit</td>
							<td>{ formatBalance(this.state.gamblingProfit) } bit</td>
						</tr>
						<tr className="balance-tr">
							<td style={{letterSpacing: '1px', textTransform: 'uppercase'}}>= Balance</td>
							<td>{ formatBalance(this.state.balance) } bits</td>
						</tr>
						</tbody>
					</Table>
				</Col>
			</Row>
		)

	}
}
