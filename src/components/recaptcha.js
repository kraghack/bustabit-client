import React, { Component, PropTypes } from 'react'

import { recaptchaSiteKey } from '../util/config'


class Recaptcha extends Component {

	constructor(props) {
		super(props);
		this.unmounted = false;
		this.recaptchaRef = null;
		this.recaptchaId = null;
		this.callback = null;
		this.response = null;

		props.responder(callback => this.getResponse(callback));
	}

	componentDidMount(){

		const execute = () => {
			if (this.unmounted) return;

			if (typeof window.grecaptcha === 'undefined') {
				console.warn('No recaptcha yet waiting a second');
				setTimeout(execute, 1000);
				return;
			}

			this.recaptchaId = window.grecaptcha.render(this.recaptchaRef, {
				'sitekey': recaptchaSiteKey,
				'size': 'invisible',
				'badge': 'inline',
				'callback': (response) => this.recaptchaSubmitted(response)
			});


		};
		execute();
	}

	componentWillUnmount() {
		this.unmounted = true;
	}

	recaptchaSubmitted(response) {
		if (!this.callback) {
			console.error('No callback provided');
			return;
		}
		this.response = response;
		this.callback(response);
	}

	getResponse(callback) {
		if (this.response != null) { // it's already done...
			callback(this.response);
			return;
		}

		this.callback = callback;


		const execute = () => {
			if (this.unmounted) return;

			if (this.recaptchaId === null) {
				console.warn('Recaptcha not yet rendered yet waiting a second');
				setTimeout(execute, 1000);
				return;
			}

			window.grecaptcha.execute(this.recaptchaId);
		};
		execute();
	}

	render() {
		return <div ref={(recaptchaRef) => { this.recaptchaRef = recaptchaRef; }}></div>;
	}
}

Recaptcha.propTypes = {
	responder: PropTypes.func.isRequired
};


export default Recaptcha;