import React, { Component, PropTypes } from 'react';

import { objectEntries } from '../../util/belt';
import socket from '../../socket'
import chat from '../../core/chat'
import userInfo from '../../core/user-info'
import engine from '../../core/engine'
import { simpleDate } from '../../util/belt'



class RunStrategy extends Component {

	constructor(props) {
		super(props);
		this.iframeRef = null;
		this.listeningToSocket = []; // list of events
		this.messageListener = this.messageListener.bind(this);
		this.state = {
			logs: [],
			running: false,
		};
	}

	componentDidMount() {
		console.log('Adding message listener');
		window.addEventListener('message', this.messageListener);
	}

	componentWillUnmount() {
		console.log('Remove message listener');
		window.removeEventListener('message', this.messageListener);

		this.doStop()
	}


	interpretConfigItem(name, item) {
		switch (item.type) {
			case 'balance':
			case 'multiplier':
				return <input type="number"
											className="form-control"
											value={ this.state[name] || this.props.config[name].value }
					onChange={ (event) => this.setState({ [name]: event.target.value}) }
				/>;
			default:
				return <h1>Error: Unknown item type: { item.type }</h1>
		}

	}

	interpretConfig() {

		let items = [];

		for (const [name, item] of objectEntries(this.props.config)) {

			items.push(<div key={name}>
				{name}: { this.interpretConfigItem(name, item) }
			</div>);
		}

		return items;
	}

	getVals() {
		let vals = {};
		for (const [name, obj] of objectEntries(this.props.config)) {

			const override = this.state[name] ? { value: this.state[name] } : {};
			const res = Object.assign({}, obj, override);


			if (res.type === 'balance') {
				res.value = (Number.parseFloat(res.value) || 0) * 100
			} else if (obj.type === 'multiplier') {
				res.value = Number.parseFloat(res.value) || 0
			} else {
				console.error('Unknown config object type: ', res, ' is type: ', res.type);
			}


			vals[name] = res;
		}
		return vals;
	}

	messageListener(e) {
		if (!this.iframeRef || e.source !== this.iframeRef.contentWindow) return;

		// Remember, we need to sanitize this against malicious script
		if (!Array.isArray(e.data) || e.data.length !== 2) {
			console.warn('Script broke protocol and sent a non-array');
			return;
		}

		const [key, value] = e.data;

		if (key === 'log') {
			if (typeof value !== 'string') {
				console.warn('Script tried to send a non-string to log');
				return;
			}

			this.setState({
				logs: this.state.logs.concat([ simpleDate(new Date()) + ': ' + value])
			});
		} else if (key === 'ready') {
			console.log('iframe is ready: ', value);
			this.doRun();
		} else if (key === 'bet') {

			if (!Array.isArray(value) || value.length !== 2) {
				console.warn('malformed bet, not a proper array');
				return;
			}

			const responseName = value[0];
			const bet = value[1];

			if (typeof bet !== 'object') {
				console.warn('Tried to bet without a proper object');
				return;
			}

			const { wager, payout } = bet;
			if (!Number.isFinite(wager) || wager < 100 || !Number.isFinite(payout) || payout < 1.01) {
				console.warn('Tried to bet without a valid wager/payout');
				return;
			}

			engine.bet(wager, payout, true).then(
				x   => this.iframeRef.contentWindow.postMessage([responseName, [0, x]], '*'),
				err => this.iframeRef.contentWindow.postMessage([responseName, [1, err]], '*'),
			);

		} else if (key === 'cashOut') {

			if (!Array.isArray(value) || value.length !== 2) {
				console.warn('malformed cashout, not a proper array');
				return;
			}

			const responseName = value[0];

			engine.cashOut().then(
				x   => this.iframeRef.contentWindow.postMessage([responseName, [0, x]], '*'),
				err => this.iframeRef.contentWindow.postMessage([responseName, [1, err]], '*'),
			);
		} else {
			console.log('Got unknown: ', e.data);
		}

	}

	doStop() {
		for (const [eventName, f] of this.listeningToSocket) {
			socket.removeListener(eventName, f);
		}
		this.listeningToSocket = [];
	}

	stop() {
		this.doStop();
		this.setState({ running: false });
	}

	doRun() {
		const config = this.getVals();

		const script = "var config = " + JSON.stringify(config) + ";\n" + this.props.runnableScript;
		const chatState = chat.getState();
		const userInfoState = userInfo.getState();
		const engineState = engine.getState();

		let msg = { script, chatState, userInfoState, engineState };

		console.log('posting: ', msg);

		this.iframeRef.contentWindow.postMessage(msg, '*');


		// holy shit, crazy hack
		console.assert(this.listeningToSocket.length === 0);
		for (const eventName of socket.eventNames()) {
			const f = (data) => {
				this.iframeRef.contentWindow.postMessage([eventName, data], '*');
			};

			socket.on(eventName, f);
			this.listeningToSocket.push([eventName, f]);
		}
	}

	run() {
		this.setState({
			running: true,
			logs: []
		});
	}


	render() {
		const { running } = this.state;

		return <div>
			{ this.interpretConfig() }
			{
				!running && <button onClick={ () => this.run() } className="btn btn-primary">Run!</button>
			}
			{
				running && <div>
					<button onClick={ () => this.stop() } className="btn btn-danger">Stop!</button>
					<iframe style={{ width: 0, height: 0, border: 0, visibility: 'none' }}
									ref={ (ref) => this.iframeRef = ref }
									src="/iframe.html" sandbox="allow-scripts"
					></iframe>
				</div>
			}


			<br/>
			<textarea className="form-control" value={ this.state.logs.join('\n') } />
		</div>
	}

}

RunStrategy.propTypes = {
	config: PropTypes.object.isRequired,
	runnableScript:  PropTypes.string.isRequired,
};


export default RunStrategy;