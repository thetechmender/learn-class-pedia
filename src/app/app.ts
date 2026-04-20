import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header';
import {SecurityService} from './services/security.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.sass'
})
export class App {
isPaused = false;

  constructor(private security: SecurityService) {}

  ngOnInit() {
    this.security.init();
    
    // Service se signal suno
    this.security.securityTriggered.subscribe((state) => {
      this.isPaused = state;
    });
  }

  resumeContent() {
    this.isPaused = false;
  }
}
