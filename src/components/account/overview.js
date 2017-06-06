import React, { PureComponent } from 'react'
import { Row, Col } from 'react-bootstrap'
import userInfo from '../../core/user-info'
import refresher from '../../refresher';
import { formatBalance } from '../../util/belt';
import Breakdown from './breakdown';

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
					<Breakdown />
				</div>
			)

  }
}




export default refresher(AccountOverview,
	[userInfo, 'BALANCE_CHANGED', 'UNAME_CHANGED']
);
