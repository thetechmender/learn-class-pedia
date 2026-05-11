import { Component, HostListener, NgZone } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './shared/header/header';
import { MobileNavComponent } from './shared/mobile-nav/mobile-nav';
import { SecurityService } from './services/security.service';
import { NetworkService } from './services/network.service';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Location } from '@angular/common';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MobileNavComponent],
  templateUrl: './app.html',
  styleUrl: './app.sass'
})
export class App {
  isPaused = false;

  constructor(
    private security: SecurityService,
    public network: NetworkService,
    private router: Router,
    private location: Location,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.security.init();

    // Service se signal suno
    this.security.securityTriggered.subscribe((state) => {
      this.isPaused = state;
    });

    if (Capacitor.isNativePlatform()) {
      this.initNativeFeatures();
    }
  }

  private async initNativeFeatures() {
    // Handle Hardware Back Button
    CapApp.addListener('backButton', ({ canGoBack }) => {
      this.zone.run(() => {
        if (this.router.url === '/' || this.router.url === '/login' || !canGoBack) {
          CapApp.exitApp();
        } else {
          this.location.back();
        }
      });
    });

    // Style Status Bar
    try {
      await StatusBar.setStyle({ style: Style.Default });
      // In Capacitor 6+, Style.Default follows system, but we can force Light if we want white bg
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    } catch (e) {
      console.warn('StatusBar not available', e);
    }

    // Hide Splash Screen
    try {
      setTimeout(async () => {
        await SplashScreen.hide();
      }, 500);
    } catch (e) {
      console.warn('SplashScreen not available', e);
    }
  }

  resumeContent() {
    this.isPaused = false;
  }
}
