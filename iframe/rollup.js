var { rollup } = require('rollup');
var nodeResolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');

rollup({
	entry: 'iframe.js',
	plugins: [
		nodeResolve({ jsnext: true, main: true }),
		commonjs()
	]
}).then(bundle => bundle.write({
	dest: '../public/iframe.autogen.js',
	moduleName: 'iframe',
	format: 'iife'
})).catch(err => console.log(err.stack));