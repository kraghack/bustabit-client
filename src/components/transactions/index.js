import React from 'react';

import Tab from '../tab';
import userInfo from '../../core/user-info'
import refresher from '../../refresher';
import NotLoggedIn from '../not-logged-in-well'


import DepositHistory from './deposit-history'
import WithdrawalHistory from './withdrawal-history'
import TipHistory from './tip-history'

import { Route, Switch, Redirect } from 'react-router'


function Transactions({ pathname }) {
	if (!userInfo.uname) return <NotLoggedIn />;

	return (
		<div style={{minHeight: '40vh', marginBottom: '20px'}}>
			<ul className="nav nav-tabs nav-justified">
				{ ['Deposits', 'Withdrawals', 'Tips'].map(item => {

					const url = '/transactions/' + item.toLowerCase();

					return <Tab
								to={ url }
								key={item}
								isActive={ pathname === url }
							><span>{item}</span></Tab>
					}
				)}
			</ul>
			<Switch>
				<Route path="/transactions/deposits" component={ DepositHistory }/>
				<Route path="/transactions/withdrawals" component={ WithdrawalHistory }/>
				<Route path="/transactions/tips" component={ TipHistory }/>
				<Redirect to="/transactions/deposits" />
			</Switch>

		</div>
	)
}


export default refresher(Transactions,
	[userInfo, 'UNAME_CHANGED']
);
