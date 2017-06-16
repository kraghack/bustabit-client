import React from 'react'
import {  Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import FaqFooter from './footer'

export default function() {
		return <div>
			<Col xs={24}>
				<h3>What is a bit?</h3>
				<p>A bit is a millionth of a bitcoin or 100 satoshis. At the time of this writing, a single bit is worth roughly $0.0003 USD. You are able to <Link to="/deposit">deposit</Link> and <Link to="/withdraw">withdraw</Link> bits at any time.</p>
			</Col>
			<FaqFooter />
		</div>
}
