import { useCallback, useMemo } from 'react';

export function useSlideProcessing(setSlides, diagrams, examples, keyConcepts, learningObjectives, comprehensiveSummary, assessments) {
    
    // Stabilize array/object dependencies to prevent infinite loops
    const assessmentsLength = assessments?.length || 0;
    const hasDiagrams = diagrams?.length > 0;
    const hasExamples = examples?.length > 0;
    
    const parseSlideContent = useCallback((content, index) => {
        if (!content) return null;

        const lines = content.split('\n').map(line => line.trim()).filter(line => line);
        let title = '';
        const bullets = [];
        const notes = [];
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
            } else if (lowerLine.includes('objective:') || lowerLine.includes('agenda:')) {
                type = 'objective';
                bullets.push(`🎯 ${line}`);
            } else if (lowerLine.includes('example:') || lowerLine.includes('scenario:')) {
                type = 'example';
                bullets.push(`💡 ${line}`);
            } else if (lowerLine.includes('diagram:') || lowerLine.includes('visual:')) {
                type = 'diagram';
                bullets.push(`📊 ${line}`);
            } else if (lowerLine.includes('exercise:') || lowerLine.includes('practice:')) {
                type = 'exercise';
                bullets.push(`🏋️ ${line}`);
            } else if (lowerLine.includes('summary:') || lowerLine.includes('key takeaway:')) {
                type = 'summary';
                bullets.push(`📝 ${line}`);
            } else if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* ')) {
                bullets.push(line);
            } else if (line.includes('(Note:') || line.includes('[Note:')) {
                notes.push(line.replace(/[\(\)\[\]]/g, ''));
            } else if (line.length > 0) {
                bullets.push(line);
            }
        });

        const wordCount = bullets.join(' ').split(/\s+/).length;
        duration = Math.max(30, Math.min(120, Math.ceil(wordCount / 3)));

        const hasDiagram = diagrams.some(d => d.slideNumber === slideNumber);
        const hasExample = examples.some(e => e.slideNumber === slideNumber);

        return {
            title: title || `Slide ${slideNumber}`,
            content: bullets.join('\n'),
            notes: notes,
            type,
            duration,
            slideNumber,
            hasDiagram,
            hasExample,
            wordCount
        };
    }, [diagrams, examples]);

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
                    duration: 60,
                    hasDiagram: diagrams.some(d => d.slideNumber === index + 1),
                    hasExample: examples.some(e => e.slideNumber === index + 1)
                });
            });
        }

        // Add extra slides
        const enhancedSlides = [...processedSlides];

        if (keyConcepts) {
            enhancedSlides.splice(1, 0, {
                title: "Key Concepts",
                content: keyConcepts,
                type: "concepts",
                slideNumber: "KC",
                hasDiagram: false,
                hasExample: false,
                duration: 90
            });
        }

        if (learningObjectives) {
            enhancedSlides.splice(0, 0, {
                title: "Learning Objectives",
                content: learningObjectives,
                type: "objectives",
                slideNumber: "LO",
                hasDiagram: false,
                hasExample: false,
                duration: 60
            });
        }

        if (assessmentsLength > 0) {
            enhancedSlides.push({
                title: "Knowledge Check",
                content: "Test your understanding with these questions",
                type: "quiz",
                slideNumber: "QC",
                hasDiagram: false,
                hasExample: false,
                duration: 120
            });
        }

        if (comprehensiveSummary) {
            enhancedSlides.push({
                title: "Course Summary",
                content: comprehensiveSummary,
                type: "summary",
                slideNumber: "SUM",
                hasDiagram: false,
                hasExample: false,
                duration: 60
            });
        }

        setSlides(enhancedSlides);
    }, [setSlides, diagrams, examples, keyConcepts, learningObjectives, comprehensiveSummary, assessmentsLength, parseSlideContent]);

    return { processLessonText };
}
