import { useEffect } from 'react';
import { enhanceTextForTTS, analyzeTextForTTS } from '../../utils/ttsEnhancer';

export function useTTS({
    isPlaying,
    isMuted,
    useTTS,
    slides,
    currentSlide,
    voices,
    selectedVoice,
    playbackRate,
    setHighlightedCharIndex,
    setSpeechProgress,
    setIsAudioPlaying,
    setCurrentSlide,
    setIsPlaying,
    markSlideCompleted,
    setTimeSpent,
    durationSeconds
}) {
    useEffect(() => {
        // Cancel any ongoing speech first
        window.speechSynthesis.cancel();
        
        // If not playing or TTS disabled, just clean up and exit
        if (!useTTS || !isPlaying) {
            setHighlightedCharIndex(-1);
            setSpeechProgress(0);
            setIsAudioPlaying(false);
            return;
        }

        const currentSlideData = slides[currentSlide];
        if (!currentSlideData) return;

        // Split content into lines and remove the first line (heading)
        const contentLines = currentSlideData.content.split('\n');
        const paragraphs = contentLines.slice(1).filter(p => p.trim().length > 0);
        
        // Build paragraph word structure for tracking
        const paragraphWords = paragraphs.map(p => {
            const cleaned = p
                .replace(/\*\*/g, '').replace(/##/g, '').replace(/#/g, '')
                .replace(/^[-•*]\s*/g, '')
                .replace(/^(Visual|Diagram|Flowchart|Chart|Image|Loading|Title|Slide|Introduction|Main Topic Early|Main Topic Mid|Main Topic Advanced|Foundational Theories|Intermediate Applications|Advanced Topics|Case Studies and Data|Summary|Conclusion|Facts):\s*/gi, '')
                .replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
            return cleaned.split(/\s+/).filter(w => w.length > 0);
        });

        // Flatten for TTS but keep track of paragraph boundaries
        const wordToParagraph = []; // Maps global word index to {paragraphIndex, wordInParagraph}
        paragraphWords.forEach((words, pIdx) => {
            words.forEach((word, wIdx) => {
                wordToParagraph.push({ paragraphIndex: pIdx, wordInParagraph: wIdx });
            });
        });

        const contentWithoutHeading = contentLines.slice(1).join('\n');
        let ttsContent = contentWithoutHeading
            .replace(/\*\*/g, '').replace(/##/g, '').replace(/#/g, '')
            .replace(/^[-•*]\s*/gm, '')
            .replace(/^(Visual|Diagram|Flowchart|Chart|Image|Loading|Title|Slide|Introduction|Main Topic Early|Main Topic Mid|Main Topic Advanced|Foundational Theories|Intermediate Applications|Advanced Topics|Case Studies and Data|Summary|Conclusion|Facts):\s*/gim, '')
            .replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();

        // Use the content without heading
        const text = ttsContent;

        if (!text || text.trim() === '' || text.trim() === '.') return;

        setIsAudioPlaying(true);
        setSpeechProgress(0);

        // Enhanced text for professorial delivery
        const enhancedText = enhanceTextForTTS(text);

        const utterance = new SpeechSynthesisUtterance(enhancedText);
        
        // Look for mature female voices (50-60 age range)
        const findMatureFemaleVoice = () => {
            // First try exact match if user selected a specific voice
            if (selectedVoice) {
                const exactMatch = voices.find(v => v.name === selectedVoice);
                if (exactMatch) return exactMatch;
            }
            
            // Keywords for mature, experienced female voices (sound like 50-60)
            const matureFemaleKeywords = [
                // Common mature female voice names
                'susan', 'karen', 'linda', 'patricia', 'deborah', 'nancy', 'donna',
                'carol', 'sandra', 'sharon', 'kathleen', 'cynthia', 'elizabeth',
                'julie', 'anne', 'mary', 'jennifer', 'lisa', 'margaret',
                
                // Voice quality descriptors
                'mature', 'adult', 'woman', 'female',
                'natural', 'premium', 'enhanced', 'professional',
                'contemporary', 'studio', 'expressive',
                
                // Platform-specific mature voices
                'google uk female', 'microsoft zira', 'microsoft hazel',
                'ivona', 'cereproc', 'nuance'
            ];
            
            // First pass: Look for voices with mature female keywords
            const matureVoices = voices.filter(voice => {
                const lowerName = voice.name.toLowerCase();
                const lowerLang = (voice.lang || '').toLowerCase();
                
                // Must be female
                if (lowerName.includes('male') && !lowerName.includes('female')) {
                    return false;
                }
                
                // Check for mature female keywords
                return matureFemaleKeywords.some(keyword => 
                    lowerName.includes(keyword) || lowerLang.includes('female')
                );
            });
            
            if (matureVoices.length > 0) {
                // Sort by most "mature" sounding names first
                return matureVoices.sort((a, b) => {
                    const aName = a.name.toLowerCase();
                    const bName = b.name.toLowerCase();
                    
                    // Prioritize voices with names that sound more mature
                    const aScore = getMaturityScore(aName);
                    const bScore = getMaturityScore(bName);
                    
                    return bScore - aScore;
                })[0];
            }
            
            // Second pass: Look for any female voices
            const femaleVoices = voices.filter(voice => {
                const lowerName = voice.name.toLowerCase();
                return lowerName.includes('female') || 
                       !lowerName.includes('male') ||
                       (voice.lang && voice.lang.toLowerCase().includes('female'));
            });
            
            if (femaleVoices.length > 0) {
                return femaleVoices[0];
            }
            
            // Fallback to any available voice
            return voices.length > 0 ? voices[0] : null;
        };
        
        // Helper function to score voice maturity based on name
        const getMaturityScore = (voiceName) => {
            let score = 0;
            
            // Names that sound more mature/experienced
            const matureNameIndicators = [
                'susan', 'karen', 'linda', 'patricia', 'deborah', 'nancy',
                'donna', 'carol', 'sandra', 'sharon', 'kathleen', 'cynthia',
                'elizabeth', 'margaret', 'anne', 'mary', 'judith'
            ];
            
            // Voice quality indicators
            const qualityIndicators = [
                'mature', 'adult', 'natural', 'premium', 'enhanced',
                'professional', 'studio', 'expressive'
            ];
            
            matureNameIndicators.forEach(indicator => {
                if (voiceName.includes(indicator)) score += 3;
            });
            
            qualityIndicators.forEach(indicator => {
                if (voiceName.includes(indicator)) score += 2;
            });
            
            // Penalize young-sounding names
            const youngIndicators = ['teen', 'young', 'kid', 'child', 'girl'];
            youngIndicators.forEach(indicator => {
                if (voiceName.includes(indicator)) score -= 3;
            });
            
            return score;
        };

        const voice = findMatureFemaleVoice();
        if (voice) {
            utterance.voice = voice;
            console.log('Selected mature female voice:', voice.name);
        } else if (voices.length > 0) {
            utterance.voice = voices[0];
        } else {
            return;
        }

        // Mature female professorial voice parameters
        // Slightly slower, clear, authoritative yet warm delivery
        utterance.rate = playbackRate * 0.82; // 18% slower for thoughtful delivery
        utterance.pitch = 0.5; // Slightly higher pitch for clarity, but not too high
        utterance.volume = isMuted ? 0 : 1.0; // Confident but not loud volume
        
        // Set language - prefer American or British English
        if (voice.lang && (voice.lang.includes('en-US') || voice.lang.includes('en-GB'))) {
            utterance.lang = voice.lang;
        } else {
            utterance.lang = 'en-US';
        }
        
        // Use the enhanced text for TTS
        utterance.text = enhancedText;

        // Build word list from the TTS text to track word index
        const ttsWords = enhancedText.split(/\s+/).filter(w => w.length > 0);
        let currentWordIndex = 0;

        // Build char-to-word-index mapping for the enhanced text
        const charToWordIndex = [];
        let charPos = 0;
        ttsWords.forEach((word, wordIdx) => {
            const wordStart = enhancedText.indexOf(word, charPos);
            if (wordStart >= 0) {
                while (charToWordIndex.length < wordStart) {
                    charToWordIndex.push(Math.max(0, wordIdx - 1));
                }
                for (let i = 0; i < word.length; i++) {
                    charToWordIndex.push(wordIdx);
                }
                charPos = wordStart + word.length;
            }
        });

        // Word boundary handler - uses paragraph-based indexing
        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                const wordIndex = charToWordIndex[event.charIndex] !== undefined
                    ? charToWordIndex[event.charIndex]
                    : currentWordIndex;
                
                currentWordIndex = wordIndex;
                
                // Get paragraph info for this word and encode it
                const paragraphInfo = wordToParagraph[wordIndex];
                if (paragraphInfo) {
                    // Encode: paragraphIndex * 10000 + wordInParagraph
                    const encodedIndex = paragraphInfo.paragraphIndex * 10000 + paragraphInfo.wordInParagraph;
                    setHighlightedCharIndex(encodedIndex);
                } else {
                    setHighlightedCharIndex(wordIndex);
                }
                
                const progress = Math.min(99, Math.round((wordIndex / ttsWords.length) * 100));
                setSpeechProgress(progress);
            }
        };

        utterance.onend = () => {
            setHighlightedCharIndex(-1);
            setIsAudioPlaying(false);
            setSpeechProgress(100);
            markSlideCompleted(currentSlide);

            const pauseDuration = currentSlide < slides.length - 1 ? 1000 : 1500;
            
            setTimeout(() => {
                setSpeechProgress(0);
                if (currentSlide < slides.length - 1) {
                    setCurrentSlide(prev => prev + 1);
                } else {
                    if (setTimeSpent && durationSeconds) {
                        setTimeSpent(durationSeconds);
                    }
                    setIsPlaying(false);
                }
            }, pauseDuration);
        };

        utterance.onerror = (event) => {
            console.error('TTS Error:', event);
            setIsAudioPlaying(false);
        };

        setTimeout(() => {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
            window.speechSynthesis.speak(utterance);
        }, 100);

        return () => { 
            window.speechSynthesis.cancel(); 
        };
    }, [isPlaying, currentSlide, slides, voices, useTTS, isMuted, playbackRate, selectedVoice]);
}