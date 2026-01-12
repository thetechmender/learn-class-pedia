import React, { useState, useEffect, useRef } from 'react';
import PreviewCanvas from './PreviewCanvas';
import Controls from './Controls';

const VideoCreator = () => {
    const [text, setText] = useState('Welcome to the future of content creation. This video was generated entirely in your browser.');
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentFrameText, setCurrentFrameText] = useState('');

    // Refs
    const canvasRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
            if (availableVoices.length > 0 && !selectedVoice) {
                // Prefer English voices
                const defaultVoice = availableVoices.find(v => v.lang.includes('en')) || availableVoices[0];
                setSelectedVoice(defaultVoice);
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, [selectedVoice]);

    // Initial preview text
    useEffect(() => {
        if (!isGenerating) {
            setCurrentFrameText(text);
        }
    }, [text, isGenerating]);


    const generateVideo = async () => {
        if (!canvasRef.current || !selectedVoice) return;
        setIsGenerating(true);
        chunksRef.current = [];

        // 1. Setup Stream & Recorder
        const stream = canvasRef.current.captureStream(30); // 30 FPS

        // Setup Media Recorder with better codec support check
        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm;codecs=vp8';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'video/webm';
            }
        }

        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `generated-video-${Date.now()}.webm`;
            a.click();
            setIsGenerating(false);
            setCurrentFrameText(text); // Reset preview
        };

        recorder.start();

        // 2. Process Text into Sentences
        // Simple sentence splitter
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

        // 3. Sequential Execution
        for (const sentence of sentences) {
            setCurrentFrameText(sentence.trim());

            await new Promise((resolve) => {
                const utterance = new SpeechSynthesisUtterance(sentence.trim());
                utterance.voice = selectedVoice;
                utterance.rate = 0.9; // Slightly slower for readability

                utterance.onend = () => {
                    // Small pause after each sentence
                    setTimeout(resolve, 500);
                };

                window.speechSynthesis.speak(utterance);
            });
        }

        // 4. Stop Recording
        recorder.stop();
        window.speechSynthesis.cancel(); // Safety cleanup
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-100px)]">
            {/* Left: Controls */}
            <div className="w-full lg:w-1/3 h-full">
                <Controls
                    text={text}
                    setText={setText}
                    voices={voices}
                    selectedVoice={selectedVoice}
                    setSelectedVoice={setSelectedVoice}
                    isGenerating={isGenerating}
                    onGenerate={generateVideo}
                />
            </div>

            {/* Right: Preview */}
            <div className="flex-1 flex flex-col justify-center items-center bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="relative w-full max-w-4xl">
                    <PreviewCanvas
                        text={currentFrameText}
                        onCanvasReady={(canvas) => canvasRef.current = canvas}
                    />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        <span className="text-xs font-mono text-cyan-400">
                            {isGenerating ? '🔴 RECORDING' : '🟢 PREVIEW'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCreator;
