
// converts 123.8  -> 1.23

export function formatBalance(n,decimals) {
  var sat = Math.floor(n);

  if (typeof decimals !== 'number')
    decimals = sat % 100 === 0 ? 0 : 2;

  return (sat/100).toFixed(decimals).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}


export function validateUname(uname) {
  const allowedCharacters = /^[0-9a-zA-Z_\-]+$/;

	if (!uname)
		return 'Please enter a username.';

	if (uname.length < 3)
		return 'This is not a valid username. Usernames must have at least 3 characters.';

  if (!allowedCharacters.test(uname))
    return 'The username contains invalid characters. The valid characters for a username are letters, numbers, underscore(_) and hyphen(-).';

}

export function isAValidEmailAddress(emailAddress){
  return /^[a-z0-9_\-\.]{2,}@[a-z0-9_\-\.]{2,}\.[a-z]{2,}$/i.test(emailAddress);
}

export function randomPassword(length) {
  let chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNP23456789";
  let pass = "";
  for (let x = 0; x < length; x++) {
    let i = Math.floor(Math.random() * chars.length);
    pass += chars.charAt(i);
  }
  return pass;
}

// returns a reason, if it's invalid, otherwise it returns null
// amount is assumed to be from a text box, so it is always x100 of what
// it should be. (e.g. '1' gets treated as 100).
// minAmount (optional) is a number in satoshis. If no minAmount, it is
// assumed to be 100
export function isAmountInvalid(amount, minAmount, maxAmount) {

	if (amount === '')
		return 'You must enter an amount.';

	const isNumberRegex = /^-?[1-9]\d*$/; // handle against leading zeros

	if (!isNumberRegex.test(amount) && amount !== '0')
		return 'The amount should be a whole number.';

	amount = Number.parseFloat(amount) * 100;

	minAmount = minAmount === undefined ? 100 : minAmount;

	if (amount < minAmount)
		return 'The amount must be at least ' + formatBalance(minAmount);

	if (maxAmount && amount > maxAmount)
		return 'The amount must be less than ' + formatBalance(maxAmount);

	return null;
}

export function generateUuid() {
	let uuid = '';
	for (let i = 0; i < 32; i++) {
		const random = Math.random() * 16 | 0;

		if (i === 8 || i === 12 || i === 16 || i === 20) {
			uuid += '-'
		}
		uuid += (i === 12 ? 4 : (i === 16 ? ((random & 3) | 8) : random)).toString(16);
	}
	return uuid;
}


export function getAvatarColor(uname){
	let hash = 0;
	for (let i = 0; i < uname.length; i++) {
		hash = uname.charCodeAt(i) + ((hash << 5) - hash);
	}
	let c = (hash & 0x00FFFFFF)
		.toString(16)
		.toUpperCase();

	return "#00000".substring(0, 7 - c.length) + c;
}


export function validatePasscode(passcode) {

		if (!passcode)
			return 'Please enter the code from your Authenticator App.';

		if (passcode.length !== 6 )
			return 'The 2FA code should have 6 digits';

}

export function validatePassword(password) {
	if (!password)
		return 'Please enter your password.';
}

export function validateEmail(email) {
	if (!email)
		return 'Please enter an email.';

	if (!isAValidEmailAddress(email))
		return 'This does not look like a valid email.'
}


// a copy of Object.entries, cause safari doesn't support
export function objectEntries(obj) {
	const entries = [];
	// eslint-disable-next-line
	for (const key in obj) {
		entries.push([key, obj[key]])
	}
	return entries;
}

// HELPERS


// Converts timestamp string into HH:MM format for chat
export function simpleDate (date) {
	const hh = date.getHours().toString();
	const mm = date.getMinutes().toString();
	return ('00' + hh).slice(-2) + ':' + ('00' + mm).slice(-2);
}
