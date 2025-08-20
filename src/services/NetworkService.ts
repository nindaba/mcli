export interface NetworkDevice {
  ip: string;
  hostname?: string;
  mac?: string;
  isOnline: boolean;
  hasMessenger: boolean;
  lastSeen: Date;
}

export class NetworkService {
  private devices: Map<string, NetworkDevice> = new Map();
  private scanInterval: NodeJS.Timeout | null = null;
  private messengerPort = 3001;

  async getLocalIP(): Promise<string> {
    return new Promise((resolve) => {
      const RTCPeerConnection = window.RTCPeerConnection || (window as any).webkitRTCPeerConnection;
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      pc.createDataChannel('');
      pc.createOffer().then(offer => pc.setLocalDescription(offer));
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
          if (ipMatch && !ipMatch[1].startsWith('127.')) {
            pc.close();
            resolve(ipMatch[1]);
          }
        }
      };
      
      setTimeout(() => {
        pc.close();
        resolve('127.0.0.1');
      }, 2000);
    });
  }

  getNetworkRange(ip: string): string {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.${parts[2]}`;
  }

  async checkMessengerService(ip: string): Promise<boolean> {
    try {
      const response = await fetch(`http://${ip}:${this.messengerPort}/ping`, {
        method: 'GET',
        mode: 'no-cors',
        signal: AbortSignal.timeout(1000)
      });
      return true;
    } catch {
      return false;
    }
  }

  async scanNetwork(): Promise<NetworkDevice[]> {
    const localIP = await this.getLocalIP();
    const networkRange = this.getNetworkRange(localIP);
    const devices: NetworkDevice[] = [];
    
    const scanPromises = [];
    
    for (let i = 1; i <= 254; i++) {
      const targetIP = `${networkRange}.${i}`;
      scanPromises.push(this.checkDevice(targetIP));
    }

    const results = await Promise.allSettled(scanPromises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const ip = `${networkRange}.${index + 1}`;
        devices.push(result.value);
        this.devices.set(ip, result.value);
      }
    });

    return devices;
  }

  private async checkDevice(ip: string): Promise<NetworkDevice | null> {
    try {
      const hasMessenger = await this.checkMessengerService(ip);
      
      if (hasMessenger || ip === await this.getLocalIP()) {
        return {
          ip,
          hostname: ip === await this.getLocalIP() ? 'localhost' : `device-${ip.split('.').pop()}`,
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

  startPeriodicScan(intervalMs: number = 30000): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
    
    this.scanInterval = setInterval(() => {
      this.scanNetwork();
    }, intervalMs);
  }

  stopPeriodicScan(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }

  getDevices(): NetworkDevice[] {
    return Array.from(this.devices.values());
  }

  getMessengerDevices(): NetworkDevice[] {
    return this.getDevices().filter(device => device.hasMessenger);
  }
}