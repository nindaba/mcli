const React = require('react');
const { useState, useEffect, useCallback } = React;
const { Box, Text, useInput, useApp } = require('ink');
const chalk = require('chalk');
const { MessengerService } = require('./services/MessengerService');
const { NetworkService } = require('./services/NetworkService');

const App = ({ flags, input }) => {
	const { exit } = useApp();
	const [lines, setLines] = useState([]);
	const [command, setCommand] = useState('');
	const [networkService] = useState(() => new NetworkService());
	const [messengerService] = useState(() => new MessengerService());
	const [connectedUsers, setConnectedUsers] = useState([]);
	const [connectedDevices, setConnectedDevices] = useState([]);
	const [currentUser, setCurrentUser] = useState(flags.username || '');
	const [isConnected, setIsConnected] = useState(false);
	const [showPrompt, setShowPrompt] = useState(true);

	const addLine = useCallback((type, content) => {
		const line = {
			id: Date.now().toString() + Math.random(),
			type,
			content,
			timestamp: new Date()
		};
		setLines(prev => [...prev, line]);
	}, []);

	const formatTime = (timestamp) => {
		return timestamp.toLocaleTimeString('en-US', { 
			hour12: false, 
			hour: '2-digit', 
			minute: '2-digit', 
			second: '2-digit' 
		});
	};

	useEffect(() => {
		addLine('system', '🚀 WiFi Messenger CLI v2.0.0');
		addLine('system', 'Type "help" for available commands');
		addLine('system', 'Press Ctrl+C to exit');
		
		if (flags.server) {
			addLine('system', `Starting server on port ${flags.port}...`);
		} else {
			addLine('system', 'Scanning network for devices...');
		}

		// Set up message listeners
		messengerService.onMessage((message) => {
			addLine('output', `${message.username}: ${message.content}`);
		});

		messengerService.onPrivateMessage((message) => {
			addLine('output', `[PRIVATE] ${message.from}: ${message.content}`);
		});

		messengerService.onUserJoined((user) => {
			addLine('system', `${user.username} joined the chat`);
			setConnectedUsers(prev => [...prev, user]);
		});

		messengerService.onUserLeft((user) => {
			addLine('system', `${user.username} left the chat`);
			setConnectedUsers(prev => prev.filter(u => u.id !== user.id));
		});

		messengerService.onUsersList((users) => {
			setConnectedUsers(users);
		});

		messengerService.onMessageHistory((messages) => {
			addLine('system', `Loaded ${messages.length} previous messages`);
			messages.forEach(message => {
				addLine('output', `${message.username}: ${message.content}`);
			});
		});

		// Initial network scan
		if (!flags.server) {
			networkService.scanNetwork().then(devices => {
				setConnectedDevices(devices);
				const messengerDevices = devices.filter(d => d.hasMessenger);
				if (messengerDevices.length > 0) {
					addLine('system', `Found ${messengerDevices.length} devices running WiFi Messenger`);
					messengerDevices.forEach(device => {
						addLine('output', `  ${device.ip} - ${device.hostname || 'Unknown'} [MESSENGER]`);
					});
				} else {
					addLine('system', 'No other WiFi Messenger instances found on network');
				}
			});
		}

		return () => {
			messengerService.disconnect();
			networkService.stopPeriodicScan();
		};
	}, []);

	const executeCommand = async (cmd) => {
		addLine('input', cmd);
		
		const [command, ...args] = cmd.trim().split(' ');
		
		switch (command.toLowerCase()) {
			case 'help':
				addLine('output', 'Available commands:');
				addLine('output', '  help - Show this help message');
				addLine('output', '  scan - Scan network for devices');
				addLine('output', '  devices - List discovered devices');
				addLine('output', '  connect <ip> [username] - Connect to a messenger server');
				addLine('output', '  disconnect - Disconnect from server');
				addLine('output', '  users - List connected users');
				addLine('output', '  msg <message> - Send a message');
				addLine('output', '  pm <username> <message> - Send private message');
				addLine('output', '  clear - Clear terminal');
				addLine('output', '  status - Show connection status');
				addLine('output', '  exit - Exit application');
				break;

			case 'scan':
				addLine('system', 'Scanning network...');
				try {
					const devices = await networkService.scanNetwork();
					setConnectedDevices(devices);
					addLine('output', `Found ${devices.length} devices on network`);
					devices.forEach(device => {
						const status = device.hasMessenger ? '[MESSENGER]' : '[ONLINE]';
						addLine('output', `  ${device.ip} - ${device.hostname || 'Unknown'} ${status}`);
					});
				} catch (error) {
					addLine('output', 'Error scanning network: ' + error.message);
				}
				break;

			case 'devices':
				if (connectedDevices.length === 0) {
					addLine('output', 'No devices found. Run "scan" first.');
				} else {
					addLine('output', 'Discovered devices:');
					connectedDevices.forEach(device => {
						const status = device.hasMessenger ? '[MESSENGER]' : '[ONLINE]';
						addLine('output', `  ${device.ip} - ${device.hostname || 'Unknown'} ${status}`);
					});
				}
				break;

			case 'connect':
				if (args.length === 0) {
					addLine('output', 'Usage: connect <ip> [username]');
					break;
				}
				
				const ip = args[0];
				const username = args[1] || currentUser || `User-${Date.now().toString().slice(-4)}`;
				
				try {
					addLine('system', `Connecting to ${ip}:3001...`);
					await messengerService.connect(`http://${ip}:3001`, username);
					setCurrentUser(username);
					setIsConnected(true);
					addLine('system', `Connected as ${username}`);
				} catch (error) {
					addLine('output', 'Connection failed: ' + error.message);
				}
				break;

			case 'disconnect':
				if (!isConnected) {
					addLine('output', 'Not connected to any server');
					break;
				}
				
				messengerService.disconnect();
				setIsConnected(false);
				setCurrentUser('');
				setConnectedUsers([]);
				addLine('system', 'Disconnected from server');
				break;

			case 'users':
				if (!isConnected) {
					addLine('output', 'Not connected to any server');
					break;
				}
				
				if (connectedUsers.length === 0) {
					addLine('output', 'No other users connected');
				} else {
					addLine('output', 'Connected users:');
					connectedUsers.forEach(user => {
						addLine('output', `  ${user.username} (${user.ip})`);
					});
				}
				break;

			case 'msg':
				if (!isConnected) {
					addLine('output', 'Not connected to any server');
					break;
				}
				
				if (args.length === 0) {
					addLine('output', 'Usage: msg <message>');
					break;
				}
				
				const message = args.join(' ');
				messengerService.sendMessage(message);
				addLine('output', `You: ${message}`);
				break;

			case 'pm':
				if (!isConnected) {
					addLine('output', 'Not connected to any server');
					break;
				}
				
				if (args.length < 2) {
					addLine('output', 'Usage: pm <username> <message>');
					break;
				}
				
				const targetUsername = args[0];
				const privateMessage = args.slice(1).join(' ');
				const targetUser = connectedUsers.find(u => u.username === targetUsername);
				
				if (!targetUser) {
					addLine('output', `User ${targetUsername} not found`);
					break;
				}
				
				messengerService.sendPrivateMessage(targetUser.id, privateMessage);
				addLine('output', `[PRIVATE to ${targetUsername}]: ${privateMessage}`);
				break;

			case 'clear':
				setLines([]);
				break;

			case 'status':
				addLine('output', `Connection: ${isConnected ? 'Connected' : 'Disconnected'}`);
				if (isConnected) {
					addLine('output', `Username: ${currentUser}`);
					addLine('output', `Connected users: ${connectedUsers.length}`);
				}
				addLine('output', `Devices on network: ${connectedDevices.length}`);
				break;

			case 'exit':
				exit();
				break;

			default:
				addLine('output', `Unknown command: ${command}. Type "help" for available commands.`);
		}
	};

	useInput((input, key) => {
		if (key.ctrl && key.name === 'c') {
			exit();
		} else if (key.return) {
			if (command.trim()) {
				executeCommand(command);
				setCommand('');
			}
		} else if (key.backspace || key.delete) {
			setCommand(prev => prev.slice(0, -1));
		} else if (input) {
			setCommand(prev => prev + input);
		}
	});

	return React.createElement(Box, { flexDirection: "column" },
		React.createElement(Box, { borderStyle: "round", borderColor: "green", padding: 1 },
			React.createElement(Text, { color: "green", bold: true }, "WiFi Messenger CLI")
		),
		
		React.createElement(Box, { flexDirection: "column", marginTop: 1, height: 20 },
			lines.slice(-18).map((line) => 
				React.createElement(Box, { key: line.id },
					React.createElement(Text, { color: "gray", dimColor: true }, `[${formatTime(line.timestamp)}] `),
					React.createElement(Text, { 
						color: line.type === 'input' ? 'green' : 
							   line.type === 'system' ? 'yellow' : 
							   'white'
					}, 
						(line.type === 'input' ? '$ ' : '') + line.content
					)
				)
			)
		),
		
		showPrompt && React.createElement(Box, { marginTop: 1 },
			React.createElement(Text, { color: "green", bold: true }, "$ "),
			React.createElement(Text, { color: "green" }, command),
			React.createElement(Text, { color: "green" }, "▊")
		)
	);
};

module.exports = App;