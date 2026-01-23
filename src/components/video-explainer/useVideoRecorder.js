import { useState, useRef, useCallback } from 'react';

export function useVideoRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);
    const streamRef = useRef(null);

    // Start recording from a DOM element
    const startRecording = useCallback(async (elementToCapture, audioStream = null) => {
        if (!elementToCapture) {
            console.error('No element to capture');
            return false;
        }

        try {
            setIsGenerating(true);
            chunksRef.current = [];

            // Create a canvas to capture the element
            const canvas = document.createElement('canvas');
            const rect = elementToCapture.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            canvasRef.current = canvas;

            const ctx = canvas.getContext('2d');
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

            // Use html2canvas for DOM to canvas conversion
            const { default: html2canvas } = await import('html2canvas');

            // Capture function that runs on each frame
            const captureFrame = async () => {
                if (!isRecording && !mediaRecorderRef.current) return;
                
                try {
                    const capturedCanvas = await html2canvas(elementToCapture, {
                        canvas: canvas,
                        scale: window.devicePixelRatio,
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#0f172a', // slate-950
                        logging: false
                    });
                    
                    // Continue capturing if still recording
                    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                        animationFrameRef.current = requestAnimationFrame(() => {
                            setTimeout(captureFrame, 100); // ~10 fps for performance
                        });
                    }
                } catch (err) {
                    console.error('Frame capture error:', err);
                }
            };

            // Get canvas stream
            const canvasStream = canvas.captureStream(10); // 10 fps

            // Combine with audio if provided
            let combinedStream;
            if (audioStream) {
                const audioTracks = audioStream.getAudioTracks();
                combinedStream = new MediaStream([
                    ...canvasStream.getVideoTracks(),
                    ...audioTracks
                ]);
            } else {
                combinedStream = canvasStream;
            }

            streamRef.current = combinedStream;

            // Create MediaRecorder
            const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
                ? 'video/webm;codecs=vp9'
                : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
                    ? 'video/webm;codecs=vp8'
                    : 'video/webm';

            const mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType,
                videoBitsPerSecond: 2500000 // 2.5 Mbps
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                setRecordedBlob(blob);
                setIsRecording(false);
                setIsGenerating(false);
                
                // Cleanup
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
            };

            mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event);
                setIsRecording(false);
                setIsGenerating(false);
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start(1000); // Collect data every second
            setIsRecording(true);
            setIsGenerating(false);

            // Start frame capture loop
            captureFrame();

            return true;
        } catch (error) {
            console.error('Failed to start recording:', error);
            setIsGenerating(false);
            return false;
        }
    }, []);

    // Stop recording
    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    }, []);

    // Download the recorded video
    const downloadVideo = useCallback((filename = 'lecture-recording.webm') => {
        if (!recordedBlob) return;
        
        const url = URL.createObjectURL(recordedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [recordedBlob]);

    // Get video URL for playback
    const getVideoUrl = useCallback(() => {
        if (!recordedBlob) return null;
        return URL.createObjectURL(recordedBlob);
    }, [recordedBlob]);

    // Clear recorded video
    const clearRecording = useCallback(() => {
        setRecordedBlob(null);
        chunksRef.current = [];
    }, []);

    return {
        isRecording,
        isGenerating,
        recordedBlob,
        startRecording,
        stopRecording,
        downloadVideo,
        getVideoUrl,
        clearRecording
    };
}
