import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

const QUEUE_KEY = 'location_queue';
const MAX_QUEUE_SIZE = 100;
const SYNC_RETRY_INTERVAL = 5000;
const MAX_RETRIES = 3;

interface QueuedLocation {
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: number;
  retryCount: number;
}

class OfflineQueue {
  private isOnline: boolean = true;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.checkOnlineStatus();
    this.startSyncInterval();
  }

  private checkOnlineStatus() {
    // For React Native, we'll assume online unless we get network errors
    // In production, use NetInfo from @react-native-community/netinfo
    this.isOnline = true; // Default to online, will be updated on API calls
  }

  private async getQueue(): Promise<QueuedLocation[]> {
    try {
      const data = await AsyncStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Failed to get queue:', err);
      return [];
    }
  }

  private async saveQueue(queue: QueuedLocation[]): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (err) {
      console.error('Failed to save queue:', err);
    }
  }

  async addLocation(location: {
    lat: number;
    lng: number;
    speed?: number;
    heading?: number;
    accuracy?: number;
  }): Promise<boolean> {
    this.checkOnlineStatus();

    if (this.isOnline) {
      try {
        await api.post('/driver/location', location);
        return true;
      } catch (err) {
        console.error('Failed to send location:', err);
        // Fall through to queue it
      }
    }

    // Queue for later
    const queue = await this.getQueue();
    
    // Remove duplicates (same timestamp within 1 second)
    const now = Date.now();
    const filtered = queue.filter(
      (q) => Math.abs(q.timestamp - now) > 1000
    );

    // Add new location
    filtered.push({
      ...location,
      timestamp: now,
      retryCount: 0
    });

    // Limit queue size
    if (filtered.length > MAX_QUEUE_SIZE) {
      filtered.shift(); // Remove oldest
    }

    await this.saveQueue(filtered);
    return false;
  }

  async syncQueue(): Promise<number> {
    this.checkOnlineStatus();
    if (!this.isOnline) return 0;

    const queue = await this.getQueue();
    if (queue.length === 0) return 0;

    const locations = queue.map((q) => ({
      lat: q.lat,
      lng: q.lng,
      speed: q.speed,
      heading: q.heading,
      accuracy: q.accuracy
    }));

    try {
      const { data } = await api.post('/driver/locations/bulk', { locations });
      
      // Remove successfully synced items
      const remaining = queue.filter((q, index) => {
        if (index < data.saved) return false;
        if (q.retryCount >= MAX_RETRIES) return false; // Remove after max retries
        q.retryCount++;
        return true;
      });

      await this.saveQueue(remaining);
      return data.saved;
    } catch (err) {
      console.error('Bulk sync failed:', err);
      
      // Increment retry count
      const updated = queue.map((q) => ({
        ...q,
        retryCount: q.retryCount + 1
      })).filter((q) => q.retryCount < MAX_RETRIES);

      await this.saveQueue(updated);
      return 0;
    }
  }

  private startSyncInterval() {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      this.syncQueue();
    }, SYNC_RETRY_INTERVAL);
  }

  stopSyncInterval() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async getQueueSize(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  }

  async clearQueue(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_KEY);
  }
}

export const offlineQueue = new OfflineQueue();

