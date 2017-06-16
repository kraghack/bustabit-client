import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom'
import martingaleStrategy from './strategies/martingale'
import followStrategy from './strategies/follow'


class Listing extends PureComponent {

	constructor() {
		super();
		this.state = {
			strategies: [
				{ id: 1, name: 'Martingale', script: martingaleStrategy },
				{ id: 2, name: 'Follow',     script: followStrategy     },
			]
		}
	}

	render() {
		const { strategies } = this.state;
		return (
			<div>
					<div className="list-group">
						{ strategies.map(strategy =>
							<Link className="list-group-item" to="" key={ strategy.id }>{ strategy.name }
								<span style={{ float: 'right', marginLeft: '5px', marginRight: '5px'}}>
									<button
										className="btn btn-default btn-xs"
										onClick={ () => this.props.onRun(strategy.name, strategy.script) }
									>
										<i className="fa fa-play" aria-hidden="true"></i></button>
									<button
										className="btn btn-info btn-xs"
										onClick={ () => this.props.onView(strategy.name, strategy.script) }
									><i className="fa fa-eye" aria-hidden="true"></i></button>
								</span>

							</Link>
							)
						}
				</div>
				<Row style={{paddingTop: '5px'}}>
					<Col xs={11} xsOffset={1}>
						<h5>Custom:</h5>
					</Col>
					<Col xs={12}>
						<button className="btn btn-default" onClick={ this.props.onAdd }>
							<i className="fa fa-plus" aria-hidden="true"></i>
							Add
						</button>
					</Col>
				</Row>
			</div>
		);

	}

}

Listing.propTypes = {
	onAdd: PropTypes.func.isRequired,
	onView: PropTypes.func.isRequired,
	onRun: PropTypes.func.isRequired,
};


export default Listing;