import React from 'react';

import Tab from '../tab';
import userInfo from '../../core/user-info'
import refresher from '../../refresher';
import NotLoggedIn from '../not-logged-in-well'

import ChangeBankroll from './change-bankroll'
import History from './history'
import Overview from './overview'

import { Route, Switch, Redirect } from 'react-router'


function Transactions({ pathname }) {
	if (!userInfo.uname) return <NotLoggedIn />;

	return (
		<div style={{minHeight: '40vh', marginBottom: '20px'}}>
			<ul className="nav nav-tabs nav-justified">
				<Tab to={ '/bankroll/overview' } isActive={ pathname === '/bankroll/overview' }><span>Overview</span></Tab>
				<Tab to={ '/bankroll/change-bankroll' } isActive={ pathname === '/bankroll/change-bankroll' }><span>Change Bankroll</span></Tab>
				<Tab to={ '/bankroll/history' } isActive={ pathname === '/bankroll/history' }><span>History</span></Tab>
			</ul>
			<Switch>
				<Route path="/bankroll/overview" component={ Overview }/>
				<Route path="/bankroll/change-bankroll" component={ ChangeBankroll }/>
				<Route path="/bankroll/history" component={ History }/>
				<Redirect to="/bankroll/overview" />
			</Switch>

		</div>
	)
}


export default refresher(Transactions,
	[userInfo, 'UNAME_CHANGED']
);