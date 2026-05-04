import { inject, Injectable, PLATFORM_ID, signal } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
    providedIn: 'root'
})
export class SpeechService {
    private platformId = inject(PLATFORM_ID);
    private synth: SpeechSynthesis | null = null;
    private utterance: SpeechSynthesisUtterance | null = null;
    private words: string[] = [];
    private fullText: string = '';
    private startTime: number = 0;
    private intervalId: any = null;
    private startWordOffset: number = 0;
    private charToWordMap: number[] = [];
    private pausedTime: number = 0;
    private isCancelling: boolean = false;
    private preferredVoice: SpeechSynthesisVoice | null = null;
    private voicesReady: Promise<void>;
    private resolveVoicesReady!: () => void;

    // Preferred voices in priority order (soft female US English first)
    private voicePreferences = [
        'Google US English',
        'Microsoft Zira',
        'Google UK English Female',
        'Microsoft Aria Online',
        'Samantha',
        'Karen',
        'Moira',
        'Fiona',
    ];

    constructor() {
        this.voicesReady = new Promise<void>(resolve => {
            this.resolveVoicesReady = resolve;
        });
        // Eagerly initialize synth so voices start loading immediately
        this.getSynth();
    }

    currentWordIndex = signal<number>(-1);
    currentTime = signal<number>(0);
    totalDuration = signal<number>(0);
    rate = signal<number>(1);
    isPaused = signal<boolean>(false);
    isCompleted = signal<boolean>(false);

    setCurrentTime(time: number) {
        this.currentTime.set(time);
    }

    private getSynth(): SpeechSynthesis | null {
        if (!this.synth && isPlatformBrowser(this.platformId)) {
            this.synth = window.speechSynthesis;
            this.loadVoices();
        }
        return this.synth;
    }

    private loadVoices() {
        if (!this.synth) return;

        const pickBest = () => {
            const voices = this.synth!.getVoices();
            if (!voices.length) return;
            for (const pref of this.voicePreferences) {
                const found = voices.find(v => v.name === pref);
                if (found) {
                    this.preferredVoice = found;
                    this.resolveVoicesReady();
                    return;
                }
            }

            // Fallback: pick first English female-sounding or any English voice
            const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
                || voices.find(v => v.lang.startsWith('en-') && !v.localService)
                || voices.find(v => v.lang.startsWith('en'));
            if (englishVoice) {
                this.preferredVoice = englishVoice;
            } else {
            }
            this.resolveVoicesReady();
        };

        // Voices may already be available
        pickBest();

        // Chrome loads voices async — listen for the event
        this.synth.onvoiceschanged = () => {
            pickBest();
        };

        // Safety timeout — don't wait forever
        setTimeout(() => this.resolveVoicesReady(), 2000);
    }

    calculateDuration(text: string): number {
        const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
        const wordsPerMinute = 150 * this.rate();
        return Math.ceil((wordCount / wordsPerMinute) * 60);
    }

    private buildCharToWordMap(text: string): number[] {
        const map: number[] = [];
        let wordIndex = 0;
        let inWord = false;
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (/\s/.test(char)) {
                map.push(-1);
                if (inWord) {
                    wordIndex++;
                    inWord = false;
                }
            } else {
                map.push(wordIndex);
                inWord = true;
            }
        }
        return map;
    }

    speak(text: string, startFromWord: number = 0) {
        const synth = this.getSynth();
        if (!synth) return;

        // Wait for voices to load, then speak
        this.voicesReady.then(() => this.doSpeak(synth, text, startFromWord));
    }

    private doSpeak(synth: SpeechSynthesis, text: string, startFromWord: number) {
        this.stop();

        this.fullText = text;
        this.words = text.split(/\s+/).filter(w => w.length > 0);
        this.startWordOffset = startFromWord;
        this.isCompleted.set(false);

        const textToSpeak = startFromWord > 0
            ? this.words.slice(startFromWord).join(' ')
            : text;

        this.charToWordMap = this.buildCharToWordMap(textToSpeak);
        this.totalDuration.set(this.calculateDuration(text));

        this.utterance = new SpeechSynthesisUtterance(textToSpeak);
        this.utterance.pitch = 1;
        this.utterance.rate = this.rate();

        // Set the preferred voice
        if (this.preferredVoice) {
            this.utterance.voice = this.preferredVoice;
            console.log('[SpeechService] Speaking with voice:', this.preferredVoice.name);
        }

        this.currentWordIndex.set(startFromWord);
        this.startTime = Date.now();
        this.isCancelling = false;

        this.utterance.onboundary = (event: SpeechSynthesisEvent) => {
            if (event.name === 'word') {
                const charIndex = event.charIndex;
                if (charIndex < this.charToWordMap.length) {
                    const localWordIndex = this.charToWordMap[charIndex];
                    if (localWordIndex >= 0) {
                        const globalWordIndex = localWordIndex + this.startWordOffset;
                        this.currentWordIndex.set(globalWordIndex);
                    }
                }
            }
        };

        this.intervalId = setInterval(() => {
            const elapsed = (Date.now() - this.startTime) / 1000;
            this.currentTime.set(Math.min(elapsed, this.totalDuration()));
        }, 100);

        this.utterance.onend = () => {
            if (this.isCancelling) return;
            this.clearInterval();
            this.currentWordIndex.set(-1);
            this.currentTime.set(this.totalDuration());
            this.isCompleted.set(true);
        };

        synth.speak(this.utterance);
    }

    private clearInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    stop() {
        this.isCancelling = true;
        const synth = this.getSynth();
        if (synth) {
            synth.cancel();
        }
        this.clearInterval();
        this.currentWordIndex.set(-1);
        this.currentTime.set(0);
        this.isPaused.set(false);
    }

    pause() {
        this.pausedTime = this.currentTime();
        this.isCancelling = true;
        const synth = this.getSynth();
        if (synth) {
            synth.cancel();
        }
        this.clearInterval();
        this.utterance = null;
        this.isPaused.set(true);
    }

    resume() {
        if (!this.fullText || !this.isPaused()) return;
        this.seekToTime(this.pausedTime);
    }

    seekToTime(seconds: number) {
        const synth = this.getSynth();
        if (!synth || !this.fullText) return;

        // Calculate word index from time
        const totalWords = this.words.length;
        const totalDur = this.totalDuration();
        const wordIndex = totalDur > 0 ? Math.floor((seconds / totalDur) * totalWords) : 0;
        
        // Cancel current speech
        synth.cancel();
        this.clearInterval();
        
        // Set the current time to the seek position
        this.currentTime.set(seconds);
        this.startWordOffset = wordIndex;
        
        // Build text from the word index
        const textToSpeak = this.words.slice(wordIndex).join(' ');
        if (!textToSpeak) return;
        
        this.charToWordMap = this.buildCharToWordMap(textToSpeak);
        
        this.utterance = new SpeechSynthesisUtterance(textToSpeak);
        this.utterance.pitch = 1;
        this.utterance.rate = this.rate();
        
        this.currentWordIndex.set(wordIndex);
        
        // Set startTime so elapsed time calculation starts from seek position
        this.startTime = Date.now() - (seconds * 1000);
        
        this.utterance.onboundary = (event: SpeechSynthesisEvent) => {
            if (event.name === 'word') {
                const charIndex = event.charIndex;
                if (charIndex < this.charToWordMap.length) {
                    const localWordIndex = this.charToWordMap[charIndex];
                    if (localWordIndex >= 0) {
                        const globalWordIndex = localWordIndex + this.startWordOffset;
                        this.currentWordIndex.set(globalWordIndex);
                    }
                }
            }
        };
        
        this.intervalId = setInterval(() => {
            const elapsed = (Date.now() - this.startTime) / 1000;
            this.currentTime.set(Math.min(elapsed, this.totalDuration()));
        }, 100);
        
        this.utterance.onend = () => {
            if (this.isCancelling) return;
            this.clearInterval();
            this.currentWordIndex.set(-1);
            this.currentTime.set(this.totalDuration());
            this.isCompleted.set(true);
        };
        
        this.isCancelling = false;
        this.isPaused.set(false);
        synth.speak(this.utterance);
    }

    skipSeconds(seconds: number) {
        const newTime = Math.max(0, Math.min(this.currentTime() + seconds, this.totalDuration()));
        this.seekToTime(newTime);
    }

    getWords(): string[] {
        return this.words;
    }

    setRate(rate: number) {
        this.rate.set(rate);
    }
}