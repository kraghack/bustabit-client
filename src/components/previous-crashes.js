import React, { PureComponent } from 'react'
import engine from '../core/engine'
import { Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import refresher from '../refresher'
import { bustToColor } from '../util/belt'

class PreviousCrashes extends PureComponent {


  getLastCrashes() {
		const h = engine.history;
		return h.slice(0, 5).map(
      (item) => <td key={item.gameId} style={{width: '20%' }} >
				<Link to={'/game/' + item.gameId} style={ {color: bustToColor(item.bust)} }>{item.bust}x</Link>
			</td>
    ).reverse();
  }


  render() {
    return (
    	<div className="table-responsive" style={{marginBottom: '0px'}}>
				<Table striped bordered condensed style={{marginBottom: '0px'}}>
					<tbody style={{textAlign: 'center'}}>
						<tr>
							{this.getLastCrashes()}
						</tr>
					</tbody>
					</Table>
			</div>
    )
  }
}

export default refresher(PreviousCrashes,
	[engine, 'HISTORY_CHANGED']
);