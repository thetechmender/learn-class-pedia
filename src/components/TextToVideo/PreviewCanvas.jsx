import React, { useRef, useEffect } from 'react';

const PreviewCanvas = ({
    text,
    backgroundColor = '#1a1a1a',
    textColor = '#ffffff',
    width = 1920,
    height = 1080,
    onCanvasReady
}) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (onCanvasReady) {
            onCanvasReady(canvas);
        }

        const ctx = canvas.getContext('2d');

        // Draw background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        // Draw text
        ctx.fillStyle = textColor;
        ctx.font = 'bold 60px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Simple word wrap
        const words = text.split(' ');
        let line = '';
        const lines = [];
        const maxWidth = width * 0.8;
        const lineHeight = 80;

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && i > 0) {
                lines.push(line);
                line = words[i] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        const startY = (height - (lines.length * lineHeight)) / 2;

        lines.forEach((l, i) => {
            ctx.fillText(l.trim(), width / 2, startY + (i * lineHeight));
        });

    }, [text, backgroundColor, textColor, width, height, onCanvasReady]);

    return (
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-800">
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="w-full h-full object-contain"
            />
        </div>
    );
};

export default PreviewCanvas;
