const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Store connected users
const connectedUsers = new Map();
const messageHistory = [];

// Get local network info
function getNetworkInfo() {
  const interfaces = os.networkInterfaces();
  let localIP = '127.0.0.1';
  
  for (const interfaceName in interfaces) {
    const addresses = interfaces[interfaceName];
    for (const address of addresses) {
      if (address.family === 'IPv4' && !address.internal) {
        localIP = address.address;
        break;
      }
    }
  }
  
  return {
    hostname: os.hostname(),
    ip: localIP,
    platform: os.platform()
  };
}

// Health check endpoint
app.get('/ping', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'wifi-messenger',
    ...getNetworkInfo()
  });
});

// Get connected users endpoint
app.get('/users', (req, res) => {
  const users = Array.from(connectedUsers.values());
  res.json(users);
});

// Get message history endpoint
app.get('/messages', (req, res) => {
  res.json(messageHistory);
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins the chat
  socket.on('join', (userData) => {
    const user = {
      id: socket.id,
      username: userData.username || `User-${socket.id.substring(0, 6)}`,
      ip: socket.handshake.address,
      joinedAt: new Date(),
      isOnline: true
    };
    
    connectedUsers.set(socket.id, user);
    
    // Broadcast user joined
    socket.broadcast.emit('userJoined', user);
    
    // Send current users list to new user
    socket.emit('usersList', Array.from(connectedUsers.values()));
    
    // Send message history to new user
    socket.emit('messageHistory', messageHistory);
    
    console.log(`User ${user.username} joined from ${user.ip}`);
  });

  // Handle messages
  socket.on('message', (messageData) => {
    const user = connectedUsers.get(socket.id);
    if (!user) return;
    
    const message = {
      id: Date.now().toString(),
      username: user.username,
      content: messageData.content,
      timestamp: new Date(),
      userId: socket.id
    };
    
    messageHistory.push(message);
    
    // Keep only last 100 messages
    if (messageHistory.length > 100) {
      messageHistory.shift();
    }
    
    // Broadcast message to all users
    io.emit('message', message);
    
    console.log(`Message from ${user.username}: ${message.content}`);
  });

  // Handle private messages
  socket.on('privateMessage', (data) => {
    const sender = connectedUsers.get(socket.id);
    if (!sender) return;
    
    const message = {
      id: Date.now().toString(),
      from: sender.username,
      content: data.content,
      timestamp: new Date(),
      isPrivate: true
    };
    
    // Send to specific user
    socket.to(data.targetUserId).emit('privateMessage', message);
    
    console.log(`Private message from ${sender.username} to ${data.targetUserId}`);
  });

  // Handle typing indicator
  socket.on('typing', (isTyping) => {
    const user = connectedUsers.get(socket.id);
    if (!user) return;
    
    socket.broadcast.emit('userTyping', {
      userId: socket.id,
      username: user.username,
      isTyping
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      connectedUsers.delete(socket.id);
      socket.broadcast.emit('userLeft', user);
      console.log(`User ${user.username} disconnected`);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const networkInfo = getNetworkInfo();
  console.log(`\n🚀 WiFi Messenger Server running on:`);
  console.log(`   Local:    http://localhost:${PORT}`);
  console.log(`   Network:  http://${networkInfo.ip}:${PORT}`);
  console.log(`   Hostname: ${networkInfo.hostname}`);
  console.log(`   Platform: ${networkInfo.platform}\n`);
});