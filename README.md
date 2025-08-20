# WiFi Messenger CLI

A terminal-based messaging app that allows real-time communication between devices on the same WiFi network.

## 🚀 Two Interface Options

### 1. **Web Interface** (Browser-based)
- Full React web application 
- Runs in your browser at localhost:3000
- Perfect for development and testing

### 2. **Native CLI** (Terminal-based) ⭐ **NEW!**
- Built with React Ink - same as Claude CLI and Gemini CLI
- Runs directly in your terminal
- True command-line experience like professional AI tools

## Features

- 🖥️ **Dual Interface**: Web browser + native terminal CLI
- 🔍 **Network Discovery**: Automatic WiFi device scanning
- 💬 **Real-time Messaging**: Instant communication via WebSockets
- 🔒 **Private Messaging**: Send direct messages to specific users
- 👥 **Connected Users**: Live user list and status
- 📚 **Message History**: Persistent chat history
- 🎨 **Professional Styling**: Terminal UI like Claude CLI/Gemini CLI

## Screenshots

### 1. Application Startup
The terminal interface loads with retro green styling and system messages:

```
┌─────────────────── WiFi Messenger CLI ──────────────────┐
│ ○ ○ ○                                                    │
├──────────────────────────────────────────────────────────┤
│ [10:30:15] WiFi Messenger CLI v1.0.0                    │
│ [10:30:15] Type "help" for available commands           │
│ [10:30:15] Scanning network for devices...              │
│ [10:30:16] No other WiFi Messenger instances found      │
│                                                          │
│ $ help                                                   │
│ Available commands:                                      │
│   help - Show this help message                         │
│   scan - Scan network for devices                       │
│   devices - List discovered devices                     │
│   connect <ip> [username] - Connect to messenger server │
│   disconnect - Disconnect from server                   │
│   users - List connected users                          │
│   msg <message> - Send a message                        │
│   pm <username> <message> - Send private message        │
│   clear - Clear terminal                                │
│   status - Show connection status                       │
│                                                          │
│ $ _                                                      │
└──────────────────────────────────────────────────────────┘
```

### 2. Network Scanning
Discovering devices on your WiFi network:

```
┌─────────────────── WiFi Messenger CLI ──────────────────┐
│ ○ ○ ○                                                    │
├──────────────────────────────────────────────────────────┤
│ [10:32:10] $ scan                                        │
│ [10:32:10] Scanning network...                          │
│ [10:32:12] Found 3 devices on network                   │
│   192.168.1.100 - laptop-alice [MESSENGER]              │
│   192.168.1.101 - phone-bob [ONLINE]                    │
│   192.168.1.102 - desktop-charlie [MESSENGER]           │
│                                                          │
│ $ devices                                                │
│ Discovered devices:                                      │
│   192.168.1.100 - laptop-alice [MESSENGER]              │
│   192.168.1.101 - phone-bob [ONLINE]                    │
│   192.168.1.102 - desktop-charlie [MESSENGER]           │
│                                                          │
│ $ _                                                      │
└──────────────────────────────────────────────────────────┘
```

### 3. Connecting to Another Device
Establishing connection and joining chat:

```
┌─────────────────── WiFi Messenger CLI ──────────────────┐
│ ○ ○ ○                                                    │
├──────────────────────────────────────────────────────────┤
│ [10:33:45] $ connect 192.168.1.100 Alice                │
│ [10:33:45] Connecting to 192.168.1.100:3001...          │
│ [10:33:46] Connected as Alice                            │
│ [10:33:46] Loaded 5 previous messages                   │
│ Bob: Hey everyone, how's it going?                       │
│ Charlie: Good morning! Just got my coffee ☕            │
│ Bob: Anyone up for a quick meeting?                      │
│ Charlie: Sure, let me know when                          │
│ [10:33:46] Alice joined the chat                         │
│                                                          │
│ $ users                                                  │
│ Connected users:                                         │
│   Bob (192.168.1.102)                                   │
│   Charlie (192.168.1.103)                               │
│                                                          │
│ $ _                                                      │
└──────────────────────────────────────────────────────────┘
```

### 4. Active Chat Session
Real-time messaging with multiple users:

```
┌─────────────────── WiFi Messenger CLI ──────────────────┐
│ ○ ○ ○                                                    │
├──────────────────────────────────────────────────────────┤
│ Charlie: Sure, let me know when                          │
│ [10:33:46] Alice joined the chat                         │
│                                                          │
│ [10:34:10] $ msg Hello everyone! 👋                     │
│ You: Hello everyone! 👋                                 │
│ Bob: Hey Alice! Welcome to the chat                      │
│ Charlie: Hi Alice! Good to see you online               │
│                                                          │
│ [10:34:32] $ msg Thanks! How is everyone doing?         │
│ You: Thanks! How is everyone doing?                      │
│ Bob: Pretty good, just working on some code             │
│ Charlie: Same here, debugging some issues               │
│                                                          │
│ [10:35:15] $ pm Bob Want to pair program later?         │
│ [PRIVATE to Bob]: Want to pair program later?           │
│ [PRIVATE] Bob: Absolutely! Let's do it after lunch      │
│                                                          │
│ $ _                                                      │
└──────────────────────────────────────────────────────────┘
```

### 5. Status and Management
Checking connection status and managing the session:

```
┌─────────────────── WiFi Messenger CLI ──────────────────┐
│ ○ ○ ○                                                    │
├──────────────────────────────────────────────────────────┤
│ [PRIVATE] Bob: Absolutely! Let's do it after lunch      │
│                                                          │
│ [10:36:20] $ status                                      │
│ Connection: Connected                                    │
│ Username: Alice                                          │
│ Connected users: 2                                       │
│ Devices on network: 3                                   │
│                                                          │
│ [10:36:45] Bob left the chat                             │
│                                                          │
│ [10:37:00] $ disconnect                                  │
│ [10:37:00] Disconnected from server                     │
│                                                          │
│ [10:37:05] $ clear                                       │
│                                                          │
│ $ _                                                      │
└──────────────────────────────────────────────────────────┘
```

## Quick Start

### Option 1: Native CLI (Recommended) ⭐

1. **Install dependencies:**
   ```bash
   npm install
   npm run install:server
   ```

2. **Run the CLI version:**
   ```bash
   # Start server and CLI together
   npm run cli:dev
   
   # Or run CLI only (server must be running separately)
   npm run cli
   
   # Or run directly
   node cli/index.js --help
   ```

3. **Usage examples:**
   ```bash
   # Basic usage
   wifi-messenger
   
   # Set username
   wifi-messenger --username Alice
   
   # Start in server mode
   wifi-messenger --server --port 3001
   ```

### Option 2: Web Interface

1. **Install dependencies:**
   ```bash
   npm install
   npm run install:server
   ```

2. **Run the web version:**
   ```bash
   npm run dev
   ```
   
   This starts both the React frontend (port 3000) and WebSocket server (port 3001).

## Usage

### Terminal Commands

- `help` - Show available commands
- `scan` - Scan network for devices
- `devices` - List discovered devices
- `connect <ip> [username]` - Connect to a messenger server
- `disconnect` - Disconnect from server
- `users` - List connected users
- `msg <message>` - Send a message to all users
- `pm <username> <message>` - Send private message
- `clear` - Clear terminal
- `status` - Show connection status

### Getting Started

1. **Launch the app** on your device:
   ```bash
   npm run dev
   ```

2. **Scan for other devices** on your network:
   ```
   $ scan
   ```

3. **Connect to another device** running WiFi Messenger:
   ```
   $ connect 192.168.1.100 YourUsername
   ```

4. **Start messaging:**
   ```
   $ msg Hello everyone!
   $ pm Alice Private message to Alice
   ```

## Network Discovery

The app automatically scans your local network (192.168.x.x, 10.x.x.x, etc.) to find:
- Devices that are online
- Devices running WiFi Messenger
- Their IP addresses and hostnames

## How It Works

WiFi Messenger creates a peer-to-peer messaging network on your local WiFi. Here's the complete workflow:

### 1. Network Discovery Process

**IP Detection:**
- Uses WebRTC STUN servers to discover your local IP address
- Determines network range (e.g., 192.168.1.x, 10.0.0.x)

**Device Scanning:**
- Scans all IPs in your network range (1-254)
- Attempts HTTP requests to port 3001 on each IP
- Identifies which devices are running WiFi Messenger

**Discovery Output:**
```
$ scan
Found 3 devices on network
  192.168.1.100 - laptop-alice [MESSENGER]
  192.168.1.101 - phone-bob [ONLINE]  
  192.168.1.102 - desktop-charlie [MESSENGER]
```

### 2. Connection Establishment

**Server Role:**
- Each device runs its own WebSocket server (port 3001)
- Server broadcasts device info and handles connections
- Acts as a hub for users connecting to that device

**Client Connection:**
- Choose a device running WiFi Messenger
- Connect with: `connect 192.168.1.100 YourUsername`
- Establishes WebSocket connection to target device's server

### 3. Messaging Flow

**Public Messages:**
```
$ msg Hello everyone!
You: Hello everyone!
Alice: Hey there!
Charlie: Welcome to the chat!
```

**Private Messages:**
```
$ pm Alice Secret message
[PRIVATE to Alice]: Secret message
[PRIVATE] Alice: Thanks for the info!
```

**Real-time Updates:**
- All messages broadcast instantly via WebSockets
- User join/leave notifications
- Message history loaded on connection

### 4. Multi-Device Scenarios

**Scenario A - Star Network:**
```
Device A (Server) ← Device B (Client)
       ↑
   Device C (Client)
```
- Device A runs server, B & C connect to A
- All messages go through A's server

**Scenario B - Multiple Servers:**
```
Device A (Server) ← Device B (Client)
Device C (Server) ← Device D (Client)
```
- Two separate chat rooms
- Devices must connect to same server to chat

**Scenario C - Mesh Discovery:**
- All devices run servers simultaneously  
- Users can discover and connect to any available server
- Creates flexible, decentralized messaging network

### 5. Technical Implementation

**Network Layer:**
- WebRTC for IP discovery (no servers needed)
- HTTP requests for device detection
- WebSocket for real-time messaging

**Data Flow:**
1. Browser → WebRTC → Local IP detection
2. JavaScript → HTTP requests → Network scanning  
3. User command → WebSocket → Server connection
4. Message input → Socket.io → Broadcast to all clients
5. Incoming messages → React state → Terminal display

**Message Structure:**
```javascript
{
  id: "1629123456789",
  username: "Alice",
  content: "Hello everyone!",
  timestamp: "2024-08-20T10:30:00Z",
  userId: "socket_abc123"
}
```

### 6. Why It Works on WiFi

**Same Network Requirement:**
- Devices must be on same subnet (192.168.1.x)
- Router allows inter-device communication
- No internet required - purely local networking

**Port Accessibility:**
- WebSocket server binds to 0.0.0.0:3001 (all interfaces)
- Accepts connections from any device on network
- Firewall must allow incoming connections on port 3001

**Real-world Example:**
```
Your WiFi Network (192.168.1.x)
├── Laptop (192.168.1.100) - Running WiFi Messenger
├── Phone (192.168.1.101) - Running WiFi Messenger  
├── Tablet (192.168.1.102) - Running WiFi Messenger
└── Router (192.168.1.1) - Enables device communication
```

Each device can discover others, connect to any server, and participate in real-time messaging - all without internet connectivity!

## Architecture

### CLI Interface (React Ink) ⭐
- **Built with React Ink** - Same technology as Claude CLI and Gemini CLI
- **Terminal Components:** Native terminal UI with Box and Text components
- **Interactive Input:** Real-time command processing and keyboard handling
- **Professional UX:** Styled borders, colors, and formatting like AI CLIs

### Frontend Options
1. **Native CLI (React Ink + Node.js)**
   - Direct terminal rendering with React components
   - No browser required - runs in any terminal
   - Command-line argument parsing and flag handling
   
2. **Web Interface (React + TypeScript)**
   - Browser-based terminal simulator
   - Development and testing interface
   - Full React web application

### Shared Services
- **Network Service:** Handles IP discovery and device scanning
- **Messenger Service:** WebSocket client for real-time communication  
- **Command Parser:** Processes user commands and executes actions

### Backend (Node.js + Socket.io)
- **WebSocket Server:** Handles real-time connections and messaging
- **User Management:** Tracks connected users and their metadata
- **Message Broadcasting:** Distributes messages to all connected clients
- **Health Endpoints:** Provides /ping for device discovery

## Development

### Run frontend only:
```bash
npm start
```

### Run server only:
```bash
npm run server:dev
```

### Run both (recommended):
```bash
npm run dev
```

## Technical Details

- **Frontend:** React 18 + TypeScript
- **Backend:** Node.js + Express + Socket.io
- **Styling:** CSS with terminal theme
- **Network:** WebRTC for IP discovery, Socket.io for messaging
- **Ports:** Frontend (3000), Backend (3001)

## Security Notes

- Communication is not encrypted by default
- Only use on trusted networks
- Messages are temporarily stored in server memory
- No authentication system implemented

## Troubleshooting

1. **Can't find other devices:**
   - Ensure all devices are on the same WiFi network
   - Check firewall settings
   - Try manual connection with known IP

2. **Connection fails:**
   - Verify the target device is running WiFi Messenger
   - Check if port 3001 is accessible
   - Try restarting both client and server

3. **Network scan shows no devices:**
   - Some networks block device discovery
   - Try connecting directly using IP address
   - Check network permissions

## Contributing

Feel free to submit issues and enhancement requests!
