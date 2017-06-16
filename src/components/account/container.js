import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Tab from '../tab';
import userInfo from '../../core/user-info'
import refresher from '../../refresher';
import NotLoggedIn from '../not-logged-in-well'


class Account extends PureComponent {

  render() {

    let { body } = this.props;

		if (!userInfo.uname) {
			return (
        <NotLoggedIn />
			)
		}
	return (
		<div>
			<ul className="nav nav-tabs nav-justified">
				<Tab to="/account/overview"><span>Overview</span></Tab>
				<Tab to="/account/stats"><span>Stats</span></Tab>
				<Tab to="/account/security"><span>Security</span></Tab>
				<Tab to="/account/settings"><span>Settings</span></Tab>
			</ul>
			{ body }
		</div>
	)}
}

Account.propTypes = {
	body: PropTypes.node.isRequired
};

export default refresher(Account,
	[userInfo, 'UNAME_CHANGED']
);
