#!/usr/bin/env node
const React = require('react');
const { render } = require('ink');

const ui = require('./ui');

// Simple argument parsing
const args = process.argv.slice(2);
const flags = {};

if (args.includes('--help') || args.includes('-h')) {
	console.log(`
Usage
  $ wifi-messenger

Options
  --username, -u  Set your username
  --server, -s    Start server mode
  --port, -p      Server port (default: 3001)
  --help, -h      Show help

Examples
  $ wifi-messenger
  $ wifi-messenger --username Alice
  $ wifi-messenger --server --port 3001
	`);
	process.exit(0);
}

for (let i = 0; i < args.length; i++) {
	if (args[i] === '--username' || args[i] === '-u') {
		flags.username = args[i + 1];
		i++;
	} else if (args[i] === '--server' || args[i] === '-s') {
		flags.server = true;
	} else if (args[i] === '--port' || args[i] === '-p') {
		flags.port = parseInt(args[i + 1]) || 3001;
		i++;
	}
}

if (!flags.port) flags.port = 3001;

render(React.createElement(ui, { flags, input: args }));