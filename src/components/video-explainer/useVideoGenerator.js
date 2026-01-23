import { useState, useRef, useCallback } from 'react';

export function useVideoGenerator() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null);
    const [progress, setProgress] = useState(0);
    const canvasRef = useRef(null);

    // Generate video from slides data
    const generateVideo = useCallback(async (slides, durationSeconds) => {
        if (!slides || slides.length === 0) {
            console.error('No slides to generate video from');
            return null;
        }

        setIsGenerating(true);
        setProgress(0);

        try {
            // Create canvas for rendering slides
            const canvas = document.createElement('canvas');
            canvas.width = 1280;
            canvas.height = 720;
            canvasRef.current = canvas;
            const ctx = canvas.getContext('2d');

            // Calculate time per slide
            const timePerSlide = durationSeconds / slides.length;
            const fps = 10;
            const framesPerSlide = Math.ceil(timePerSlide * fps);

            // Get canvas stream
            const stream = canvas.captureStream(fps);
            
            // Create MediaRecorder
            const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
                ? 'video/webm;codecs=vp9'
                : 'video/webm';

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType,
                videoBitsPerSecond: 2500000
            });

            const chunks = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            // Start recording
            mediaRecorder.start();

            // Render each slide
            for (let slideIndex = 0; slideIndex < slides.length; slideIndex++) {
                const slide = slides[slideIndex];
                
                // Render frames for this slide with text animation
                for (let frame = 0; frame < framesPerSlide; frame++) {
                    await renderSlideFrame(ctx, canvas, slide, slideIndex, frame, framesPerSlide, slides.length);
                    
                    // Update progress
                    const totalFrames = slides.length * framesPerSlide;
                    const currentFrame = slideIndex * framesPerSlide + frame;
                    setProgress(Math.round((currentFrame / totalFrames) * 100));
                    
                    // Wait for next frame timing
                    await new Promise(resolve => setTimeout(resolve, 1000 / fps));
                }
            }

            // Stop recording and get blob
            return new Promise((resolve) => {
                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: mimeType });
                    const url = URL.createObjectURL(blob);
                    setGeneratedVideoUrl(url);
                    setIsGenerating(false);
                    setProgress(100);
                    resolve(url);
                };
                mediaRecorder.stop();
            });

        } catch (error) {
            console.error('Video generation failed:', error);
            setIsGenerating(false);
            return null;
        }
    }, []);

    // Render a single frame of a slide
    const renderSlideFrame = async (ctx, canvas, slide, slideIndex, frame, totalFrames, totalSlides) => {
        const { width, height } = canvas;
        
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#0f172a'); // slate-950
        gradient.addColorStop(0.5, '#1e293b'); // slate-800
        gradient.addColorStop(1, '#0f172a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Add subtle glow effects
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.beginPath();
        ctx.arc(100, 100, 200, 0, Math.PI * 2);
        ctx.fillStyle = '#a855f7'; // purple
        ctx.filter = 'blur(50px)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(width - 100, height - 100, 180, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6'; // blue
        ctx.fill();
        ctx.restore();
        ctx.filter = 'none';

        // Content area background
        const padding = 40;
        const contentX = padding;
        const contentY = padding + 60;
        const contentWidth = width - padding * 2;
        const contentHeight = height - padding * 2 - 80;

        ctx.fillStyle = 'rgba(30, 41, 59, 0.8)'; // slate-800 with opacity
        ctx.beginPath();
        ctx.roundRect(contentX, contentY, contentWidth, contentHeight, 16);
        ctx.fill();

        // Border
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)'; // slate-600
        ctx.lineWidth = 1;
        ctx.stroke();

        // Slide title badge
        const title = slide.title || `Slide ${slideIndex + 1}`;
        ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
        const titleWidth = ctx.measureText(title).width + 40;
        const titleX = (width - titleWidth) / 2;
        
        ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
        ctx.beginPath();
        ctx.roundRect(titleX, 20, titleWidth, 32, 16);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(title, width / 2, 42);

        // Slide content with progressive reveal animation
        const content = slide.content || '';
        const lines = content.split('\n').filter(l => l.trim());
        const lineHeight = 36;
        const textX = contentX + 40;
        let textY = contentY + 60;

        ctx.textAlign = 'left';
        ctx.font = '20px system-ui, -apple-system, sans-serif';

        // Calculate how many lines to show based on frame progress
        const revealProgress = frame / totalFrames;
        const linesToShow = Math.ceil(lines.length * Math.min(1, revealProgress * 1.5));

        for (let i = 0; i < Math.min(linesToShow, lines.length); i++) {
            const line = lines[i].replace(/^[-•*]\s*/, '• ');
            const lineOpacity = i < linesToShow - 1 ? 1 : Math.min(1, (revealProgress * 1.5 * lines.length) - i);
            
            ctx.fillStyle = `rgba(226, 232, 240, ${lineOpacity})`; // slate-200
            
            // Word wrap
            const words = line.split(' ');
            let currentLine = '';
            const maxWidth = contentWidth - 80;

            for (const word of words) {
                const testLine = currentLine + word + ' ';
                const metrics = ctx.measureText(testLine);
                
                if (metrics.width > maxWidth && currentLine !== '') {
                    ctx.fillText(currentLine.trim(), textX, textY);
                    currentLine = word + ' ';
                    textY += lineHeight;
                } else {
                    currentLine = testLine;
                }
            }
            ctx.fillText(currentLine.trim(), textX, textY);
            textY += lineHeight + 8;
        }

        // Slide counter
        ctx.font = '12px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.8)'; // slate-400
        ctx.textAlign = 'right';
        ctx.fillText(`${slideIndex + 1} / ${totalSlides}`, width - padding - 20, height - 20);

        // Progress indicator dots
        const dotY = height - 30;
        const dotSpacing = 12;
        const dotsWidth = totalSlides * dotSpacing;
        const dotsStartX = (width - dotsWidth) / 2;

        for (let i = 0; i < totalSlides; i++) {
            ctx.beginPath();
            ctx.arc(dotsStartX + i * dotSpacing, dotY, 3, 0, Math.PI * 2);
            ctx.fillStyle = i <= slideIndex ? '#a855f7' : 'rgba(71, 85, 105, 0.5)';
            ctx.fill();
        }
    };

    // Clear generated video
    const clearVideo = useCallback(() => {
        if (generatedVideoUrl) {
            URL.revokeObjectURL(generatedVideoUrl);
        }
        setGeneratedVideoUrl(null);
        setProgress(0);
    }, [generatedVideoUrl]);

    return {
        isGenerating,
        generatedVideoUrl,
        progress,
        generateVideo,
        clearVideo
    };
}
