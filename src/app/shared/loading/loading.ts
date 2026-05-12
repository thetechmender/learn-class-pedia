import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.html',
})
export class LoadingComponent {
  isLoading = this.loadingService.isLoading;

  constructor(private loadingService: LoadingService) {}
}
