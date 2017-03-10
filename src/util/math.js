import { dilutionFee } from './config'
//const maxOutcome = Math.pow(2,32);


// export function payoutToOutcome(payout) {
//   const prob = 99.0 / (100.0 * payout);
//
//   const target = Math.ceil(maxOutcome - maxOutcome*prob);
//
//   if (target >= maxOutcome)
//       throw new Error('no such outcome exists for such a high payout')
//
//   return Math.floor(target);
// }
//
// export function probOfOutcome(outcome) {
//   return (maxOutcome - outcome) / maxOutcome;
// }
//
// export function outcomeToPayout(outcome) {
//   return 99.0 * maxOutcome / (100.0 * (maxOutcome - outcome));
// }
//

export function floorTo(value, exp) {
  // If the exp is undefined or zero...
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math.floor(value);
  }
  value = +value;
  exp = +exp;
  // If the value is not a number or the exp is not an integer...
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }
  // Shift
  value = value.toString().split('e');
  value = Math.floor(+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
  // Shift back
  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}



export function calcGamePayout(ms) {
	const gamePayout = Math.floor(100 * growthFunc(ms)) / 100;
	console.assert(isFinite(gamePayout));
	return gamePayout;
}

export function growthFunc(ms) {
	console.assert(typeof ms === 'number' && ms >= 0);
	const r = 0.0001;
	return Math.pow(2, r * ms);
}

// returns as a number
export function realDilutionFee(amount, oldStake, bankroll) {
	// derived using ...
	// const stake = (o * p + (1-f)*a) / (p + (1-f) * a);
	// const make = stake * f * a;
	// const dilutionFee = (f * a) - make;
	// const d = dilutionFee / a;

	return (dilutionFee * (-1 + oldStake) * bankroll)/(-amount + amount * dilutionFee - bankroll);
}