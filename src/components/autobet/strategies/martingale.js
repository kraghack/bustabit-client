var config = {
	baseBet: { value: 100, type: 'balance', label: 'Base Bet' },
	payout: { value: 2, type: 'multiplier', label: 'Payout' },
	stop: { value: 1e8, type: 'balance', label: 'if bet is greater than' },
	loss: {
		value: 'base', type: 'radio', label: 'On Loss',
		options: {
			base: { type: 'noop', label: 'Return to base bet' },
			increase: { type: 'multiplier', label: 'Increase bet by' },
		}
	},
	win: {
		value: 'base', type: 'radio', label: 'On Win',
		options: {
			base: { type: 'noop', label: 'Return to base bet' },
			increase: { type: 'multiplier', label: 'Increase bet by' },
		}
	}
};