import { Component, HostListener, NgZone } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './shared/header/header';
import { MobileNavComponent } from './shared/mobile-nav/mobile-nav';
import { LoadingComponent } from './shared/loading/loading';
import { SecurityService } from './services/security.service';
import { NetworkService } from './services/network.service';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Location } from '@angular/common';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, MobileNavComponent, LoadingComponent],
  templateUrl: './app.html',
  styleUrl: './app.sass'
})
export class App {
  constructor(
    private security: SecurityService,
    public network: NetworkService,
    public router: Router,
    private location: Location,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.security.init();

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
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#ffffff' });

    // Hide Splash Screen
    await SplashScreen.hide();
  }
}
