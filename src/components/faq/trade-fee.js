import React, { PureComponent } from 'react'
import {  Col } from 'react-bootstrap'
import FaqFooter from './footer'
import { tradeFee } from '../../util/config'
import { formatBalance, formatCurrency } from '../../util/belt'

class TradeFee extends PureComponent {

  render() {

    return (
      <div>
        <Col xs={24}>
          <h3>What is the trade fee?</h3>
          <p>Creating a trade offer will result in a fee of {formatBalance(tradeFee) +' '+ formatCurrency('BALANCE',tradeFee)},
            either if the trade gets fulfilled or not.
					</p>
        </Col>
        <FaqFooter />
      </div>

    )
  }
}



export default TradeFee;