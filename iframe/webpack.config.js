var path = require('path');

module.exports = {
	entry: './index.js',
	output: {
		path: path.resolve(__dirname, '../public'),
		filename: 'iframe.autogen.js'
	}
};