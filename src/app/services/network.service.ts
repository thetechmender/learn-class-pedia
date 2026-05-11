import { Injectable, signal } from '@angular/core';
import { Network } from '@capacitor/network';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  isOnline = signal(true);

  constructor() {
    this.init();
  }

  async init() {
    const status = await Network.getStatus();
    this.isOnline.set(status.connected);

    Network.addListener('networkStatusChange', status => {
      this.isOnline.set(status.connected);
    });
  }
}
