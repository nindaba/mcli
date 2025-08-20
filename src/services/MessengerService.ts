import { io, Socket } from 'socket.io-client';

export interface Message {
  id: string;
  username: string;
  content: string;
  timestamp: Date;
  userId?: string;
  isPrivate?: boolean;
  from?: string;
}

export interface User {
  id: string;
  username: string;
  ip: string;
  joinedAt: Date;
  isOnline: boolean;
}

export interface TypingUser {
  userId: string;
  username: string;
  isTyping: boolean;
}

export class MessengerService {
  private socket: Socket | null = null;
  private messageCallbacks: ((message: Message) => void)[] = [];
  private userJoinedCallbacks: ((user: User) => void)[] = [];
  private userLeftCallbacks: ((user: User) => void)[] = [];
  private usersListCallbacks: ((users: User[]) => void)[] = [];
  private typingCallbacks: ((typing: TypingUser) => void)[] = [];
  private messageHistoryCallbacks: ((messages: Message[]) => void)[] = [];
  private privateMessageCallbacks: ((message: Message) => void)[] = [];

  connect(serverUrl: string, username: string): Promise<void> {
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

      this.socket.on('message', (message: Message) => {
        message.timestamp = new Date(message.timestamp);
        this.messageCallbacks.forEach(callback => callback(message));
      });

      this.socket.on('privateMessage', (message: Message) => {
        message.timestamp = new Date(message.timestamp);
        this.privateMessageCallbacks.forEach(callback => callback(message));
      });

      this.socket.on('userJoined', (user: User) => {
        user.joinedAt = new Date(user.joinedAt);
        this.userJoinedCallbacks.forEach(callback => callback(user));
      });

      this.socket.on('userLeft', (user: User) => {
        this.userLeftCallbacks.forEach(callback => callback(user));
      });

      this.socket.on('usersList', (users: User[]) => {
        users.forEach(user => user.joinedAt = new Date(user.joinedAt));
        this.usersListCallbacks.forEach(callback => callback(users));
      });

      this.socket.on('userTyping', (typing: TypingUser) => {
        this.typingCallbacks.forEach(callback => callback(typing));
      });

      this.socket.on('messageHistory', (messages: Message[]) => {
        messages.forEach(message => message.timestamp = new Date(message.timestamp));
        this.messageHistoryCallbacks.forEach(callback => callback(messages));
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(content: string): void {
    if (this.socket) {
      this.socket.emit('message', { content });
    }
  }

  sendPrivateMessage(targetUserId: string, content: string): void {
    if (this.socket) {
      this.socket.emit('privateMessage', { targetUserId, content });
    }
  }

  setTyping(isTyping: boolean): void {
    if (this.socket) {
      this.socket.emit('typing', isTyping);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Event listeners
  onMessage(callback: (message: Message) => void): void {
    this.messageCallbacks.push(callback);
  }

  onPrivateMessage(callback: (message: Message) => void): void {
    this.privateMessageCallbacks.push(callback);
  }

  onUserJoined(callback: (user: User) => void): void {
    this.userJoinedCallbacks.push(callback);
  }

  onUserLeft(callback: (user: User) => void): void {
    this.userLeftCallbacks.push(callback);
  }

  onUsersList(callback: (users: User[]) => void): void {
    this.usersListCallbacks.forEach(callback => callback);
  }

  onUserTyping(callback: (typing: TypingUser) => void): void {
    this.typingCallbacks.push(callback);
  }

  onMessageHistory(callback: (messages: Message[]) => void): void {
    this.messageHistoryCallbacks.push(callback);
  }
}