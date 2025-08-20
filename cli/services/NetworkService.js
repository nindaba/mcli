// Node.js version of NetworkService for CLI
const os = require('os');

class NetworkService {
  constructor() {
    this.devices = new Map();
    this.scanInterval = null;
    this.messengerPort = 3001;
  }

  async getLocalIP() {
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
    
    return localIP;
  }

  getNetworkRange(ip) {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.${parts[2]}`;
  }

  async checkMessengerService(ip) {
    try {
      const http = require('http');
      
      return new Promise((resolve) => {
        const req = http.get(`http://${ip}:${this.messengerPort}/ping`, {
          timeout: 1000
        }, (res) => {
          resolve(res.statusCode === 200);
        });
        
        req.on('error', () => resolve(false));
        req.on('timeout', () => {
          req.destroy();
          resolve(false);
        });
      });
    } catch {
      return false;
    }
  }

  async scanNetwork() {
    const localIP = await this.getLocalIP();
    const networkRange = this.getNetworkRange(localIP);
    const devices = [];
    
    const scanPromises = [];
    
    // Scan fewer IPs for faster results in CLI
    for (let i = 1; i <= 254; i += 10) {
      const targetIP = `${networkRange}.${i}`;
      scanPromises.push(this.checkDevice(targetIP));
    }

    const results = await Promise.allSettled(scanPromises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const ip = `${networkRange}.${(index * 10) + 1}`;
        devices.push(result.value);
        this.devices.set(ip, result.value);
      }
    });

    return devices;
  }

  async checkDevice(ip) {
    try {
      const hasMessenger = await this.checkMessengerService(ip);
      const localIP = await this.getLocalIP();
      
      if (hasMessenger || ip === localIP) {
        return {
          ip,
          hostname: ip === localIP ? 'localhost' : `device-${ip.split('.').pop()}`,
          isOnline: true,
          hasMessenger,
          lastSeen: new Date()
        };
      }
      
      return null;
    } catch {
      return null;
    }
  }

  startPeriodicScan(intervalMs = 30000) {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
    
    this.scanInterval = setInterval(() => {
      this.scanNetwork();
    }, intervalMs);
  }

  stopPeriodicScan() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }

  getDevices() {
    return Array.from(this.devices.values());
  }

  getMessengerDevices() {
    return this.getDevices().filter(device => device.hasMessenger);
  }
}

module.exports = { NetworkService };