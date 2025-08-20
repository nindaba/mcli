import React, { useState, useEffect, useCallback } from 'react';
import Terminal from './components/Terminal';
import { NetworkService, NetworkDevice } from './services/NetworkService';
import { MessengerService, Message, User } from './services/MessengerService';
import './App.css';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'system';
  content: string;
  timestamp: Date;
}

function App() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [networkService] = useState(() => new NetworkService());
  const [messengerService] = useState(() => new MessengerService());
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<NetworkDevice[]>([]);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  const addLine = useCallback((type: 'input' | 'output' | 'system', content: string) => {
    const line: TerminalLine = {
      id: Date.now().toString() + Math.random(),
      type,
      content,
      timestamp: new Date()
    };
    setLines(prev => [...prev, line]);
  }, []);

  useEffect(() => {
    addLine('system', 'WiFi Messenger CLI v1.0.0');
    addLine('system', 'Type "help" for available commands');
    addLine('system', 'Scanning network for devices...');

    // Set up message listeners
    messengerService.onMessage((message: Message) => {
      addLine('output', `${message.username}: ${message.content}`);
    });

    messengerService.onPrivateMessage((message: Message) => {
      addLine('output', `[PRIVATE] ${message.from}: ${message.content}`);
    });

    messengerService.onUserJoined((user: User) => {
      addLine('system', `${user.username} joined the chat`);
      setConnectedUsers(prev => [...prev, user]);
    });

    messengerService.onUserLeft((user: User) => {
      addLine('system', `${user.username} left the chat`);
      setConnectedUsers(prev => prev.filter(u => u.id !== user.id));
    });

    messengerService.onUsersList((users: User[]) => {
      setConnectedUsers(users);
    });

    messengerService.onMessageHistory((messages: Message[]) => {
      addLine('system', `Loaded ${messages.length} previous messages`);
      messages.forEach(message => {
        addLine('output', `${message.username}: ${message.content}`);
      });
    });

    // Initial network scan
    networkService.scanNetwork().then(devices => {
      setConnectedDevices(devices);
      const messengerDevices = devices.filter(d => d.hasMessenger);
      if (messengerDevices.length > 0) {
        addLine('system', `Found ${messengerDevices.length} devices running WiFi Messenger`);
      } else {
        addLine('system', 'No other WiFi Messenger instances found on network');
      }
    });

    return () => {
      messengerService.disconnect();
      networkService.stopPeriodicScan();
    };
  }, [addLine, messengerService, networkService]);

  const handleCommand = useCallback(async (command: string) => {
    addLine('input', command);
    
    const [cmd, ...args] = command.trim().split(' ');
    
    switch (cmd.toLowerCase()) {
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
          addLine('output', 'Error scanning network: ' + (error as Error).message);
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
        const username = args[1] || `User-${Date.now().toString().slice(-4)}`;
        
        try {
          addLine('system', `Connecting to ${ip}:3001...`);
          await messengerService.connect(`http://${ip}:3001`, username);
          setCurrentUser(username);
          setIsConnected(true);
          addLine('system', `Connected as ${username}`);
        } catch (error) {
          addLine('output', 'Connection failed: ' + (error as Error).message);
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

      default:
        addLine('output', `Unknown command: ${cmd}. Type "help" for available commands.`);
    }
  }, [addLine, networkService, messengerService, connectedDevices, connectedUsers, isConnected, currentUser]);

  return (
    <div className="App">
      <Terminal lines={lines} onCommand={handleCommand} />
    </div>
  );
}

export default App;
