import React, { PureComponent } from 'react'
import { Row, Col } from 'react-bootstrap'
import { formatBalance } from '../../util/belt'
import { Link } from 'react-router'


import userInfo from '../../core/user-info'
import bankroll  from '../../core/bankroll'
import refresher from '../../refresher'


class BankrollOverview extends PureComponent {

  render() {

    const stake = userInfo.pieces / bankroll.pieces;

		return (
      <div>
        <div className="account-header" style={{ display: 'flex', flexDirection: 'row', alignContent: 'center'}}>
          <Col sm={12} xs={24}>
            <h3>{userInfo.uname}</h3>
          </Col>
          <Col sm={6} xs={12} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <p><span className="key-muted">% Stake <i className="fa fa-pie-chart" aria-hidden="true"></i>: </span> { (stake * 100).toFixed(2) }%</p>
          </Col>
        </div>
        <Row>
          <Col sm={12} xs={24}>
            <Col xs={16}><span className="key-muted">Your Bankroll: </span></Col>
            <Col xs={8}><span className="bold">{ formatBalance(bankroll.balance * stake) } bits</span></Col>
          </Col>
					<Col sm={12} xs={24}>
						<Col xs={16}><span className="key-muted">Site's Bankroll: </span></Col>
						<Col xs={8}><span className="bold">{ formatBalance(bankroll.balance) } bits</span></Col>
					</Col>
        </Row>
				<Row>
					<Col sm={12} xs={24}>
						<Col xs={16}><span className="key-muted">Your Offsite: </span></Col>
						<Col xs={8}><span className="bold">{ formatBalance(userInfo.offsite) } bits</span></Col>
					</Col>
					<Col sm={12} xs={24}>
						<Col xs={16}><span className="key-muted">Site's Offsite: </span></Col>
						<Col xs={8}><span className="bold">{ formatBalance(bankroll.offsite) } bits</span></Col>
					</Col>
				</Row>
				<Row>
					<Col sm={12} xs={24}>
						<Col xs={16}><span className="key-muted">Your Onsite: </span></Col>
						<Col xs={8}><span className="bold">{ formatBalance(bankroll.balance * stake - userInfo.offsite) } bits</span></Col>
					</Col>
					<Col sm={12} xs={24}>
						<Col xs={16}><span className="key-muted">Site's Onsite: </span></Col>
						<Col xs={8}><span className="bold">{ formatBalance(bankroll.balance - bankroll.offsite) } bits</span></Col>
					</Col>
				</Row>
        <Row>
					<Col sm={12} xs={24}>
						<Col xs={16}><span className="key-muted">Your Investing Profit: </span></Col>
						<Col xs={8}><span className="bold">{ formatBalance(bankroll.balance * stake - userInfo.invested) } bits</span></Col>
					</Col>
          <Col sm={12} xs={24}>
            <Col xs={16}><span className="key-muted">Site's Profit: </span></Col>
            <Col xs={8}><span className="bold">{ formatBalance(bankroll.balance - bankroll.invested) } bits</span></Col>
          </Col>
        </Row>
        <Row>
          <Col sm={12} xs={24}>

          </Col>
        </Row>
        <br />
        <Col xs={24} sm={20}>
          <p className="text-muted" style={{alignSelf: 'flex-start'}}><span className="hl-word">Hint: </span>If you
            want to learn more about the bankroll, click <Link to="/faq/how-does-the-bankroll-work">here</Link>.</p>
        </Col>
      </div>
    )
  }
}


export default refresher(BankrollOverview,
	[userInfo, 'BANKROLL_STATS_CHANGED', 'UNAME_CHANGED'],
	[bankroll, 'BANKROLL_CHANGED']
);
