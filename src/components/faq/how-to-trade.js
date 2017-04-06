import React, { PureComponent } from 'react'
import {  Col } from 'react-bootstrap'
import FaqFooter from './footer'
import { Link } from 'react-router'
import { tradeFee } from '../../util/config'
import { formatBalance } from '../../util/belt'

class HowToTrade extends PureComponent {

  render() {

    return (
      <div>
        <Col xs={24}>
          <h3>How can I trade in game?</h3>
          <p>You can create a trade offer that will be available for anyone in the game to fulfill through <Link to="/trade/create-trade">this form</Link>.
            Creating a trade offer will result in a fee of {formatBalance(tradeFee) } bits either if the trade gets fulfilled or not.
					</p>
        </Col>
        <FaqFooter />
      </div>

    )
  }
}



export default HowToTrade;