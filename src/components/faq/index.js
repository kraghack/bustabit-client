import React from 'react';

import { Route, Switch, Redirect } from 'react-router'
import { Link } from 'react-router-dom'
import { Col, Row } from 'react-bootstrap'




const sections = [
	{
		title: 'Basics',
		entries: [
			{ title: 'What is bustabit?',      url: 'bustabit',      component: require('./bustabit').default },
			{ title: 'How to play?',           url: 'how-to-play',   component: require('./how-to-play').default },
			{ title: 'What are bits?',         url: 'bits',          component: require('./bits').default },
			{ title: 'What is the house edge?',url: 'house-edge',    component: require('./house-edge').default }
		]
	},
	{
		title: 'Deposits',
		entries: [
			{ title: 'How do I deposit bits?', url: 'how-to-deposit',  component: require('./how-to-deposit')},
			{ title: 'How long is the deposit address valid for?', url: 'how-long-is-the-deposit-address-valid', component: require('./how-long-do-deposits-take') },
			{ title: 'How long do deposits take to be credited?', url: 'deposit-time', component: require('./how-long-do-deposits-take') },
		]
	}
	//, .... etc...  TODO:
];


export default function FaqIndex({ pathname }) {


	const routes = [];

	for (const section of sections) {
		for (const entry of section.entries) {
			routes.push(<Route
				key={entry.url}
				component={ entry.component }
				path={ '/faq/' + entry.url }
			/>);

		}
	}


	return (
			<Switch>
				<Route exact path="/faq" component={listing} />
				{ routes }
				<Redirect to="/faq-not-found" />
			</Switch>
	)
}

function listing() {
	return <Row>
		{
			sections.map(section => {
				return <Col sm={24} xs={24} style={{marginTop: '20px' }} key={section.title}>
					<h5 style={{ textTransform: 'uppercase', letterSpacing: '3px'}}>{section.title}</h5>
					<ul className="nav nav-pills nav-stacked">
						{
							section.entries.map(entry => {

								return 	<li role="presentation" key={entry.url}>
									<Link to={ '/faq/' + entry.url }>{ entry.title }</Link>
								</li>
							})
						}
					</ul>
				</Col>
			})
		}
	</Row>
}