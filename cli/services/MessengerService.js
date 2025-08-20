// Node.js version of MessengerService for CLI
const { io } = require('socket.io-client');

class MessengerService {
  constructor() {
    this.socket = null;
    this.messageCallbacks = [];
    this.userJoinedCallbacks = [];
    this.userLeftCallbacks = [];
    this.usersListCallbacks = [];
    this.typingCallbacks = [];
    this.messageHistoryCallbacks = [];
    this.privateMessageCallbacks = [];
  }

  connect(serverUrl, username) {
    return new Promise((resolve, reject) => {
      this.socket = io(serverUrl);

      this.socket.on('connect', () => {
        console.log('Connected to server');
        this.socket?.emit('join', { username });
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection failed:', error);
        reject(error);
      });

      this.socket.on('message', (message) => {
        message.timestamp = new Date(message.timestamp);
        this.messageCallbacks.forEach(callback => callback(message));
      });

      this.socket.on('privateMessage', (message) => {
        message.timestamp = new Date(message.timestamp);
        this.privateMessageCallbacks.forEach(callback => callback(message));
      });

      this.socket.on('userJoined', (user) => {
        user.joinedAt = new Date(user.joinedAt);
        this.userJoinedCallbacks.forEach(callback => callback(user));
      });

      this.socket.on('userLeft', (user) => {
        this.userLeftCallbacks.forEach(callback => callback(user));
      });

      this.socket.on('usersList', (users) => {
        users.forEach(user => user.joinedAt = new Date(user.joinedAt));
        this.usersListCallbacks.forEach(callback => callback(users));
      });

      this.socket.on('userTyping', (typing) => {
        this.typingCallbacks.forEach(callback => callback(typing));
      });

      this.socket.on('messageHistory', (messages) => {
        messages.forEach(message => message.timestamp = new Date(message.timestamp));
        this.messageHistoryCallbacks.forEach(callback => callback(messages));
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(content) {
    if (this.socket) {
      this.socket.emit('message', { content });
    }
  }

  sendPrivateMessage(targetUserId, content) {
    if (this.socket) {
      this.socket.emit('privateMessage', { targetUserId, content });
    }
  }

  setTyping(isTyping) {
    if (this.socket) {
      this.socket.emit('typing', isTyping);
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  // Event listeners
  onMessage(callback) {
    this.messageCallbacks.push(callback);
  }

  onPrivateMessage(callback) {
    this.privateMessageCallbacks.push(callback);
  }

  onUserJoined(callback) {
    this.userJoinedCallbacks.push(callback);
  }

  onUserLeft(callback) {
    this.userLeftCallbacks.push(callback);
  }

  onUsersList(callback) {
    this.usersListCallbacks.push(callback);
  }

  onUserTyping(callback) {
    this.typingCallbacks.push(callback);
  }

  onMessageHistory(callback) {
    this.messageHistoryCallbacks.push(callback);
  }
}

module.exports = { MessengerService };