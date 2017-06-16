import React from 'react'
import { render } from 'react-dom'
import Admin from './components/admin/index'
import App from './containers/app'
import Login from './components/login'
import Register from './components/register'
import Logout from './components/logout'
import Account from './components/account/container'
import Faucet from './components/faucet'
import Support from './components/support'
import Deposit from './components/deposit'
import Withdraw from './components/withdraw'
import Tip from './components/tip'
import Transactions from './components/transactions/index'
import Modalize from './containers/modalized'
import Fair from './components/fair'


import Faq from './components/faq'

import Bankroll from './components/bankroll/index'

// TODO: ...
//import AddFriend from './components/add-friend'

import GameInformation from './components/game-information'
import BetInformation from './components/bet-information'

import UserPage from './components/user-page'

import ForgotPassword from './components/forgot-password'
import ResetPassword from './components/reset-password'
import Mute from './components/chat/mute'

import { Route, Switch } from 'react-router'
import { BrowserRouter } from 'react-router-dom'




function NoMatch() {
  return <img src={ require('./img/dice.png') } alt="dice"/>;
}


if (!localStorage.getItem('devwarning')) {
	alert('This is a *VERY ROUGH* DEV version, that uses bitcoin TESTCOINS (not real bitcoin) and the database will regularly be reset.');
	localStorage.setItem('devwarning', true);
}

function modalize(title, body) {
	return ({history}) =>
		<Modalize
			title={ <span>{title}</span> }
			body={body}
			history={history}
		/>
}


render(
    <BrowserRouter>
			<div>
				<App/>
				<Switch>
					<Route exact path="/" />
					<Route path="/login" component={ modalize('login', Login) }/>
					<Route path="/logout" component={ modalize('logout', Logout) }/>
					<Route path="/register" component={ modalize('register', Register) }/>
					<Route path="/forgot-password" component={ modalize('Forgot Password', ForgotPassword) }/>
					<Route path="reset-password/:uuid" component={ modalize('Reset Password', ResetPassword) }/>
					<Route path="/account" component={ modalize('Account', Account) } />
					<Route path="/transactions" component={ modalize('Transactions', Transactions) } />
					<Route path="/bankroll"  component={ modalize('Bankroll', Bankroll) } />
					<Route path="/game/:gameId" component={ modalize('Game Information', GameInformation) } />
					<Route path="/bet/:betId" component={ modalize('Bet Information', BetInformation) } />
					<Route path="/user/:uname" component={ modalize('User Stats', UserPage) } />
					<Route path="/faucet" component={ modalize('Faucet', Faucet) }/>
					<Route path="/support" component={ modalize('Support', Support) }/>
					<Route path="/fair" components={ modalize('Provably Fair', Fair) }/>
					<Route path="/deposit" component={ modalize('Deposit', Deposit) }/>
					<Route path="/withdraw" component={ modalize('Withdraw', Withdraw) }/>
					<Route path="/tip" component={ modalize('Send a Tip', Tip) }/>
					<Route path="/faq" component={ modalize('Frequently Asked Questions', Faq) } />
					<Route path="/mute" component={ modalize('Mute', Mute) }/>
					<Route path="/admin" component={ modalize('Admin', Admin) }/>
					<Route component={ modalize('Route Not Found', NoMatch) } />
				</Switch>
			</div>
    </BrowserRouter>,
  document.getElementById('root')
);


/*
 <Route component={ModalizeSmall}>
 <Route path="add-friend" components={{title: createTitleComponent("Add Friend"), body: AddFriend}}/>
 </Route>
 <Route path="*" component={NoMatch}/>
 */