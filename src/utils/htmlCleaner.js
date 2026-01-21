// HTML content cleaning utilities

/**
 * Clean HTML content to plain text slide format
 * @param {string} htmlContent - HTML content to clean
 * @returns {{ title: string, content: string }} - Extracted title and cleaned content
 */
export const cleanHtmlContent = (htmlContent) => {
    if (!htmlContent) return { title: '', content: '' };
    
    let text = htmlContent;
    // Extract h2 title if present
    const h2Match = text.match(/<h2>(.*?)<\/h2>/i);
    const slideTitle = h2Match ? h2Match[1] : '';
    
    // Clean HTML tags
    text = text.replace(/<section>/gi, '');
    text = text.replace(/<\/section>/gi, '');
    text = text.replace(/<h2>.*?<\/h2>/gi, '');
    text = text.replace(/<h3>(.*?)<\/h3>/gi, '\n\n$1\n');
    text = text.replace(/<\/p>/gi, '\n\n');
    text = text.replace(/<\/li>/gi, '\n');
    text = text.replace(/<ul>/gi, '\n');
    text = text.replace(/<\/ul>/gi, '\n');
    text = text.replace(/<ol>/gi, '\n');
    text = text.replace(/<\/ol>/gi, '\n');
    text = text.replace(/<li>/gi, '• ');
    text = text.replace(/<strong>(.*?)<\/strong>/gi, '$1');
    text = text.replace(/<em>(.*?)<\/em>/gi, '$1');
    text = text.replace(/<[^>]+>/g, '');
    text = text.replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');
    text = text.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return { title: slideTitle, content: text.trim() };
};

/**
 * Estimate reading/viewing duration based on content length
 * @param {string} content - Content to estimate duration for
 * @returns {string} - Duration string (e.g., "5m")
 */
export const estimateDuration = (content) => {
    if (!content) return '5m';
    const wordCount = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
    const minutes = Math.max(5, Math.ceil(wordCount / 150)); // ~150 words per minute
    return `${minutes}m`;
};
