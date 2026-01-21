import { useCallback } from 'react';

export function useSlideProcessing(setSlides) {
    
    const parseSlideContent = useCallback((content, index) => {
        if (!content) return null;

        const lines = content.split('\n').map(line => line.trim()).filter(line => line);
        let title = '';
        const bullets = [];
        let type = 'content';
        let duration = 45;
        let slideNumber = index + 1;

        // First line after [SLIDE]: marker is typically the title/heading
        if (lines.length > 0) {
            let firstLine = lines[0];
            // Remove leading colon and whitespace (from [SLIDE]: marker split)
            firstLine = firstLine.replace(/^:\s*/, '').trim();
            // Check if first line looks like a heading (not a bullet point, not too long)
            if (firstLine && !firstLine.startsWith('-') && !firstLine.startsWith('•') && !firstLine.startsWith('*') && firstLine.length < 100) {
                title = firstLine;
                lines.shift(); // Remove the title from lines to process
            }
        }

        lines.forEach(line => {
            const lowerLine = line.toLowerCase();

            if (lowerLine.includes('title:')) {
                title = line.split(':')[1].trim();
            } else if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* ')) {
                bullets.push(line);
            } else if (line.length > 0) {
                bullets.push(line);
            }
        });

        const wordCount = bullets.join(' ').split(/\s+/).length;
        duration = Math.max(30, Math.min(120, Math.ceil(wordCount / 3)));

        return {
            title: title || `Slide ${slideNumber}`,
            content: bullets.join('\n'),
            type,
            duration,
            slideNumber,
            wordCount
        };
    }, []);

    const processLessonText = useCallback((text) => {
        const cleanText = text
            .replace(/\*\*/g, '').replace(/##/g, '').replace(/#/g, '')
            .replace(/&nbsp;/g, ' ').trim();

        const slideRegex = /\[SLIDE\s*\d*[:\]]/gi;
        const slideMarkers = cleanText.match(slideRegex);
        let processedSlides = [];

        if (slideMarkers && slideMarkers.length > 0) {
            const slidesSplit = cleanText.split(slideRegex);
            if (slidesSplit[0].trim() === '') slidesSplit.shift();

            slidesSplit.forEach((slideContent, index) => {
                const slideData = parseSlideContent(slideContent.trim(), index);
                if (slideData) processedSlides.push(slideData);
            });
        } else {
            const paragraphs = cleanText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
            paragraphs.forEach((paragraph, index) => {
                processedSlides.push({
                    title: `Section ${index + 1}`,
                    content: paragraph.trim(),
                    slideNumber: index + 1,
                    type: 'content',
                    duration: 60
                });
            });
        }

        setSlides(processedSlides);
    }, [setSlides, parseSlideContent]);

    return { processLessonText };
}
