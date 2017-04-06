import React, { PureComponent } from 'react'
import { Row, Col, Table } from 'react-bootstrap'
import userInfo from '../../core/user-info'
import refresher from '../../refresher';
import { formatBalance } from '../../util/belt';
import { Link } from 'react-router'

// TODO: Apply conditional classes to td depending on actual value (positive or negative)


class AccountOverview extends PureComponent {

  render() {

			return (
				<div className="content">
					<Row className="account-header">
						<Col sm={12} xs={24}>
							<h3>{userInfo.uname}</h3>
						</Col>
						<Col sm={12} xs={24}
								 style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
							<p><span className="key-muted">Joined: </span><span
								className="bold">{userInfo.created.toUTCString()}</span></p>
						</Col>
					</Row>

					<Row>
						<Row>
							<Col sm={24} xs={24} style={{marginTop: '20px'}}>
								<h5 style={{textTransform: 'uppercase', letterSpacing: '3px'}}>Balance</h5>
							</Col>
							<Col sm={8} xs={24}>
								<Col xs={12}><span className="key-muted">
									<i className="fa fa-btc bits-color" aria-hidden="true"></i> Bits:
								</span></Col>
								<Col xs={12}><span className="bold">{formatBalance(userInfo.balance)}</span></Col>
							</Col>
						</Row>
					</Row>

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
									<th style={{width: '40%'}}>Concept</th>
									<th style={{width: '20%'}}><i className="fa fa-btc bits-color" aria-hidden="true"></i> Bits</th>
								</tr>
								</thead>
								<tbody>
								<tr>
									<td><Link to="/transactions/deposits">Deposits</Link></td>
									<td className="success"><Link to="/transactions/deposits">1000</Link></td>
								</tr>
								<tr>
									<td><Link to="/transactions/withdrawals">Withdrawals</Link></td>
									<td className="danger"><Link to="/transactions/withdrawals">1000</Link></td>
								</tr>
								<tr>
									<td><Link to="/trade/my-trades">Trades: Received</Link></td>
									<td className="success"><Link to="/trade/my-trades">1000</Link></td>
								</tr>
								<tr>
									<td><Link to="/trade/my-trades">Trades: Sent</Link></td>
									<td className="danger"><Link to="/trade/my-trades">100</Link></td>
								</tr>
								<tr>
									<td>Faucet [free bits]</td>
									<td className="success">10</td>
								</tr>
								<tr>
									<td><Link to="/transactions/tips">Tips</Link></td>
									<td className="success"><Link to="/transactions/tips">10</Link></td>
								</tr>
								<tr>
									<td>Added to Bankroll</td>
									<td className="danger"><Link to="/bankroll/history">1000</Link></td>
								</tr>
								<tr>
									<td><Link to="/bankroll/history">Bankroll Dilution Fees</Link></td>
									<td className="danger"><Link to="/bankroll/history">100</Link></td>
								</tr>
								<tr>
									<td><Link to="/bankroll/history">Removed from Bankroll</Link></td>
									<td className="success"><Link to="/bankroll/history">1000</Link></td>
								</tr>
								<tr>
									<td><Link to="/bankroll/history">Bankroll Profit</Link></td>
									<td className="success"><Link to="/bankroll/history">100</Link></td>
								</tr>
								<tr>
									<td>Game Profit</td>
									<td className="success">323</td>
								</tr>
								<tr className="balance-tr">
									<td style={{letterSpacing: '1px', textTransform: 'uppercase'}}>= Balance</td>
									<td>{formatBalance(userInfo.balance)}</td>
								</tr>
								</tbody>
							</Table>
						</Col>
					</Row>
				</div>
			)

  }
}




export default refresher(AccountOverview,
	[userInfo, 'BALANCE_CHANGED', 'UNAME_CHANGED']
);
