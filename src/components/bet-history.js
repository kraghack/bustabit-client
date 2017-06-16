import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import engine from '../core/engine'
import  refresher from '../refresher'
import { formatBalance, bustToColor } from '../util/belt'
import CopyableHash from './copyable-hash'

class BetHistory extends Component {

  render() {
    return (
          <tbody>
					{
						engine.history.toArray().map(item => <tr key={item.gameId}>
              <td><Link to={"/game/" +item.gameId} style={ {color: bustToColor(item.bust)} }>{item.bust}x</Link></td>
								<td>{ item.cashedAt }</td>
								<td>{ formatBalance(item.wager) }</td>
								<td>{ formatBalance(item.wager * (item.cashedAt - 1)) }</td>
								<td>
									<CopyableHash hash={item.hash}/>
								</td>
							</tr>
						)
					}
          </tbody>
    )
  }

}



export default refresher(BetHistory,
	[engine, 'HISTORY_CHANGED']
);
