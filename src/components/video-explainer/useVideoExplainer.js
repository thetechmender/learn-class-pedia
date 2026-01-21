import { useState, useEffect, useRef, useCallback } from 'react';

// Helper function to get audio stream URL
const getAudioStreamUrl = (audioId) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'https://localhost:7043/api';
    return `${baseUrl}/media/audio/${audioId}`;
};

export function useVideoExplainer(lessonText, audios, structuredOutline) {
    // State
    const [slides, setSlides] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioStreamUrl, setAudioStreamUrl] = useState('');
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [speechProgress, setSpeechProgress] = useState(0);
    const [userNotes, setUserNotes] = useState({});
    const [bookmarks, setBookmarks] = useState([]);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [selectedVoice, setSelectedVoice] = useState('');
    const [completedSlides, setCompletedSlides] = useState(new Set());
    const [timeSpent, setTimeSpent] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const [highlightedCharIndex, setHighlightedCharIndex] = useState(-1);
    const [voices, setVoices] = useState([]);
    const [useTTS, setUseTTS] = useState(true);

    // Refs
    const audioRef = useRef(null);
    const timerRef = useRef(null);

    // Initialize timers and load voices
    useEffect(() => {
        timerRef.current = setInterval(() => {
            if (isPlaying) {
                setTimeSpent(prev => prev + 1);
            }
        }, 1000);

        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
            if (availableVoices.length > 0 && !selectedVoice) {
                // Filter English voices (same as dropdown)
                const englishVoices = availableVoices.filter(v => v.lang.includes('en'));
                // Select the 4th voice (index 3) if available, otherwise fall back
                const preferredVoice = englishVoices[3] || englishVoices[0] || availableVoices[0];
                setSelectedVoice(preferredVoice.name);
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            clearInterval(timerRef.current);
            window.speechSynthesis.cancel();
        };
    }, []);

    // Audio/TTS Management
    useEffect(() => {
        if (audios && audios.length > currentSlide && audios[currentSlide]) {
            setAudioStreamUrl(getAudioStreamUrl(audios[currentSlide].id));
            setUseTTS(false);
        } else {
            setAudioStreamUrl('');
            setUseTTS(true);
        }
    }, [currentSlide, audios]);

    const markSlideCompleted = useCallback((slideIndex) => {
        setCompletedSlides(prev => new Set([...prev, slideIndex]));
    }, []);

    const toggleBookmark = useCallback(() => {
        if (bookmarks.includes(currentSlide)) {
            setBookmarks(prev => prev.filter(b => b !== currentSlide));
        } else {
            setBookmarks(prev => [...prev, currentSlide]);
        }
    }, [currentSlide, bookmarks]);

    const saveNote = useCallback((slideNum) => {
        const slideIndex = slideNum !== undefined ? slideNum : currentSlide;
        const note = prompt('Enter your note for this slide:');
        if (note) {
            setUserNotes(prev => ({
                ...prev,
                [slideIndex]: [...(prev[slideIndex] || []), {
                    text: note,
                    timestamp: new Date().toISOString(),
                    slide: slideIndex
                }]
            }));
        }
    }, [currentSlide]);

    const deleteNote = useCallback((slideNumber, timestamp) => {
        setUserNotes(prev => ({
            ...prev,
            [slideNumber]: prev[slideNumber].filter(note => note.timestamp !== timestamp)
        }));
    }, []);

    const editNote = useCallback((slideNumber, timestamp, newText) => {
        setUserNotes(prev => ({
            ...prev,
            [slideNumber]: prev[slideNumber].map(note => 
                note.timestamp === timestamp ? { ...note, text: newText } : note
            )
        }));
    }, []);

    const formatTime = useCallback((seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    return {
        // State
        slides,
        setSlides,
        currentSlide,
        setCurrentSlide,
        isPlaying,
        setIsPlaying,
        audioStreamUrl,
        isAudioPlaying,
        setIsAudioPlaying,
        isMuted,
        setIsMuted,
        speechProgress,
        setSpeechProgress,
        userNotes,
        bookmarks,
        playbackRate,
        setPlaybackRate,
        selectedVoice,
        setSelectedVoice,
        completedSlides,
        timeSpent,
        setTimeSpent,
        hasStarted,
        setHasStarted,
        highlightedCharIndex,
        setHighlightedCharIndex,
        voices,
        useTTS,
        setUseTTS,
        // Actions
        toggleBookmark,
        saveNote,
        deleteNote,
        editNote,
        markSlideCompleted,
        formatTime,
        // Refs
        audioRef,
    };
}
