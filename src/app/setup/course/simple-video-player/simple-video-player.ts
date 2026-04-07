import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-simple-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simple-video-player.html',
  styleUrl: './simple-video-player.sass'
})
export class SimpleVideoPlayerComponent implements AfterViewInit, OnChanges {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  
  @Input() videoUrl: string | null = null;
  @Input() isPlaying: boolean = false;
  @Input() currentTime: number = 0;
  @Input() duration: number = 0;
  
  @Output() play = new EventEmitter<void>();
  @Output() pause = new EventEmitter<void>();
  @Output() timeupdate = new EventEmitter<number>();
  @Output() ended = new EventEmitter<void>();
  @Output() goToPrevious = new EventEmitter<void>();
  @Output() goToNext = new EventEmitter<void>();
  @Output() seekTo = new EventEmitter<number>();

  isVideoPlaying = false;
  videoLoaded = false;
  hasVideoError = false;
  isLoading = false;
  showControls = false;
  isMuted = false;
  volume = 1;
  isFullscreen = false;

  constructor() {
    console.log('SimpleVideoPlayerComponent constructor called');
  }

  ngAfterViewInit() {
    console.log('SimpleVideoPlayer ngAfterViewInit called');
    console.log('Video URL:', this.videoUrl);
    console.log('Full Video URL:', this.getValidVideoUrl());
    console.log('Is YouTube Video:', this.isYouTubeVideo());
    
    // Only setup video listeners for non-YouTube videos
    if (!this.isYouTubeVideo()) {
      console.log('Setting up video listeners for regular video');
      this.setupVideoListeners();
    } else {
      console.log('YouTube video detected - skipping video listeners');
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['videoUrl']) {
      console.log('ngOnChanges - videoUrl changed:', this.videoUrl);
      console.log('ngOnChanges - Is YouTube Video:', this.isYouTubeVideo());
      
      if (!this.isYouTubeVideo() && this.videoElement) {
        console.log('ngOnChanges - Loading regular video');
        this.loadVideo();
      } else if (this.isYouTubeVideo()) {
        console.log('ngOnChanges - YouTube video detected - no loading needed');
      }
    }
  }

  private setupVideoListeners() {
    if (this.videoElement && this.videoElement.nativeElement) {
      const video = this.videoElement.nativeElement;
      
      video.addEventListener('loadedmetadata', () => {
        this.duration = video.duration;
        this.videoLoaded = true;
        console.log('Video loaded, duration:', video.duration);
      });

      video.addEventListener('timeupdate', () => {
        this.currentTime = video.currentTime;
        this.timeupdate.emit(this.currentTime);
      });

      video.addEventListener('ended', () => {
        this.isVideoPlaying = false;
        this.ended.emit();
      });

      video.addEventListener('error', (e) => {
        console.error('Video error:', e);
        console.error('Video URL:', this.videoUrl);
        this.videoLoaded = false;
        // Try to handle the error gracefully
        this.handleVideoError();
      });

      video.addEventListener('canplay', () => {
        console.log('Video can play');
        this.videoLoaded = true;
      });

      video.addEventListener('loadstart', () => {
        console.log('Video loading started');
        this.videoLoaded = false;
      });
    }
  }

  private handleVideoError() {
    // Log more details about the error
    if (this.videoElement) {
      const video = this.videoElement.nativeElement;
      console.error('Video error code:', video.error?.code);
      console.error('Video error message:', video.error?.message);
      console.error('Video network state:', video.networkState);
      console.error('Video ready state:', video.readyState);
    }
  }

  private loadVideo() {
    if (this.videoElement && this.videoUrl) {
      const video = this.videoElement.nativeElement;
      this.hasVideoError = false;
      video.load();
      console.log('Loading video:', this.videoUrl);
    }
  }

  getValidVideoUrl(): string | null {
    if (!this.videoUrl) return null;
    
    // Convert YouTube URL to embed format
    if (this.videoUrl.includes('youtube.com/watch?v=')) {
      const videoId = this.videoUrl.split('v=')[1]?.split('&')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Handle youtu.be URLs
    if (this.videoUrl.includes('youtu.be/')) {
      const videoId = this.videoUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Basic validation for other URLs
    try {
      const url = new URL(this.videoUrl, window.location.origin);
      return url.toString();
    } catch (e) {
      console.error('Invalid video URL:', this.videoUrl);
      this.hasVideoError = true;
      return null;
    }
  }

  onVideoError(event: Event) {
    console.error('Video error event:', event);
    this.hasVideoError = true;
    this.videoLoaded = false;
    this.handleVideoError();
  }

  retryVideo() {
    this.hasVideoError = false;
    if (this.videoElement) {
      const video = this.videoElement.nativeElement;
      video.load();
    }
  }

  isYouTubeVideo(): boolean {
    if (!this.videoUrl) return false;
    return this.videoUrl.includes('youtube.com/watch?v=') || 
           this.videoUrl.includes('youtu.be/') ||
           this.videoUrl.includes('youtube.com/embed/');
  }

  getYouTubeEmbedUrl(): string {
    if (!this.videoUrl) return '';
    
    // Convert YouTube URL to embed format
    if (this.videoUrl.includes('youtube.com/watch?v=')) {
      const videoId = this.videoUrl.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0`;
    }
    
    // Handle youtu.be URLs
    if (this.videoUrl.includes('youtu.be/')) {
      const videoId = this.videoUrl.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0`;
    }
    
    // Return as-is if already embed format
    return this.videoUrl;
  }

  onPlay() {
    if (this.videoElement && this.videoLoaded) {
      console.log('Playing video');
      this.videoElement.nativeElement.play();
      this.isVideoPlaying = true;
      this.play.emit();
    }
  }

  onPause() {
    if (this.videoElement) {
      console.log('Pausing video');
      this.videoElement.nativeElement.pause();
      this.isVideoPlaying = false;
      this.pause.emit();
    }
  }

  onTimeUpdate(event: Event) {
    const videoElement = event.target as HTMLVideoElement;
    this.currentTime = videoElement.currentTime;
    this.timeupdate.emit(this.currentTime);
  }

  onEnded() {
    this.isVideoPlaying = false;
    this.ended.emit();
  }

  onPrevious() {
    if (this.videoElement) {
      const video = this.videoElement.nativeElement;
      const newTime = Math.max(0, video.currentTime - 120);
      video.currentTime = newTime;
      this.seekTo.emit(newTime);
    }
    this.goToPrevious.emit();
  }

  onNext() {
    if (this.videoElement) {
      const video = this.videoElement.nativeElement;
      const newTime = Math.min(video.duration, video.currentTime + 120);
      video.currentTime = newTime;
      this.seekTo.emit(newTime);
    }
    this.goToNext.emit();
  }

  onSeek(event: Event) {
    const videoElement = event.target as HTMLVideoElement;
    this.currentTime = videoElement.currentTime;
    this.seekTo.emit(this.currentTime);
  }

  // Enhanced event handlers
  onLoadedMetadata(event: Event) {
    const video = event.target as HTMLVideoElement;
    this.duration = video.duration;
    this.videoLoaded = true;
    this.isLoading = false;
    console.log('Video metadata loaded, duration:', video.duration);
  }

  onCanPlay(event: Event) {
    this.videoLoaded = true;
    this.isLoading = false;
    console.log('Video can play');
  }

  onWaiting(event: Event) {
    this.isLoading = true;
    console.log('Video is buffering...');
  }

  onPlaying(event: Event) {
    this.isVideoPlaying = true;
    this.isLoading = false;
    console.log('Video is playing');
  }

  // Progress slider control
  onSeekSlider(event: Event) {
    const input = event.target as HTMLInputElement;
    const newTime = parseFloat(input.value);
    if (this.videoElement) {
      this.videoElement.nativeElement.currentTime = newTime;
      this.currentTime = newTime;
      this.seekTo.emit(newTime);
    }
  }

  // Volume control
  onVolumeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const newVolume = parseFloat(input.value) / 100;
    this.volume = newVolume;
    this.isMuted = newVolume === 0;
    
    if (this.videoElement) {
      this.videoElement.nativeElement.volume = newVolume;
      this.videoElement.nativeElement.muted = this.isMuted;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.videoElement) {
      this.videoElement.nativeElement.muted = this.isMuted;
      if (this.isMuted) {
        this.volume = 0;
      } else {
        this.volume = this.videoElement.nativeElement.volume || 1;
      }
    }
  }

  // Fullscreen control
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.videoElement?.nativeElement.requestFullscreen();
      this.isFullscreen = true;
    } else {
      document.exitFullscreen();
      this.isFullscreen = false;
    }
  }

  formatTime(seconds: number): string {
    if (!seconds || seconds < 0 || !isFinite(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
