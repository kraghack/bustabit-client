import React, { PureComponent } from 'react';
import userInfo from '../core/user-info'
import refresher from '../refresher';
import { formatBalance } from '../util/belt';

class Balance extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
    	amount: 0
    };
	}

  render() {

    return (
			<span key={userInfo.balance} style={{ display: 'block'}}>
				Bits: { formatBalance(userInfo.displayBalance()) }
			</span>
    )
  }

}

export default refresher(Balance,
  [userInfo, 'UNAME_CHANGED', 'BALANCE_CHANGED']
);


