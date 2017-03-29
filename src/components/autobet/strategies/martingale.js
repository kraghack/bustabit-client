export default `var config = {
	baseBet: { value: 100, type: 'balance', label: 'base bet' },
	payout: { value: 2, type: 'multiplier' },
	stop: { value: 1e8, type: 'balance', label: 'stop if bet >' },
	loss: {
		value: 'base', type: 'radio', label: 'On Loss',
		options: {
			base: { type: 'noop', label: 'Return to base bet' },
			increase: { value: 1, type: 'multiplier', label: 'Increase bet by' },
		}
	},
	win: {
		value: 'base', type: 'radio', label: 'On Win',
		options: {
			base: { type: 'noop', label: 'Return to base bet' },
			increase: { value: 1, type: 'multiplier', label: 'Increase bet by' },
		}
	}
};`