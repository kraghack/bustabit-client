import React, { Component } from 'react';
import PropTypes from 'prop-types';

import socket from '../../socket'
import chat from '../../core/chat'
import userInfo from '../../core/user-info'
import engine from '../../core/engine'
import { simpleDate } from '../../util/belt'
import configParser from '../../config-parser'
import ShowConfig from './show-config'



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

		this.config = {};
		this.scriptRest = '';

		try {
			[this.config, this.scriptRest] = configParser(this.props.script);
		} catch (ex) {
			console.error('couldnt parse script, got err: ', ex);
			this.state = { err: ex, ...this.state };
			return;
		}

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

		const script = "var config = " + JSON.stringify(this.config) + ";\n" + this.scriptRest;
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
			<ShowConfig config={this.config} />
			{
				!running && <button onClick={ () => this.run() } className="btn btn-primary">Run!</button>
			}
			{
				running && <div>
					<button onClick={ () => this.stop() } className="btn btn-danger">Stop!</button>
					<iframe style={{ width: 0, height: 0, border: 0, visibility: 'none' }}
									title="hidden script running iframe"
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
	name: PropTypes.string.isRequired,
	script:  PropTypes.string.isRequired,
};


export default RunStrategy;