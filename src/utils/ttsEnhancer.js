/**
 * Simple Text-to-Speech enhancer for gentle, clear teaching speech
 * Focuses on natural pronunciation and comfortable pacing
 */


/**
 * Simple text preprocessing for clear, gentle teaching speech
 */
export function enhanceTextForTTS(text) {
    if (!text) return '';
    
    let enhanced = text.toString().trim();

    // Remove markdown formatting but preserve paragraph breaks
    enhanced = enhanced
        .replace(/[*_~`#]/g, '') // Remove markdown symbols
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
        .replace(/<[^>]+>/g, ' '); // Remove HTML tags

    // Preserve paragraph breaks by converting them to a placeholder
    enhanced = enhanced
        .replace(/\n\s*\n/g, ' [PARAGRAPH_BREAK] ') // Double line breaks = paragraph break
        .replace(/\n/g, ' [LINE_BREAK] '); // Single line breaks = line break placeholder

    // Handle numbered lists and bullet points with proper pauses
    enhanced = enhanced
        .replace(/\[LINE_BREAK\]\s*(\d+)\.\s+/g, (match, num) => {
            const ordinals = {
                '1': 'first', '2': 'second', '3': 'third', '4': 'fourth', '5': 'fifth',
                '6': 'sixth', '7': 'seventh', '8': 'eighth', '9': 'ninth', '10': 'tenth',
                '11': 'eleventh', '12': 'twelfth', '13': 'thirteenth', '14': 'fourteenth',
                '15': 'fifteenth', '16': 'sixteenth', '17': 'seventeenth', '18': 'eighteenth',
                '19': 'nineteenth', '20': 'twentieth'
            };
            const ordinal = ordinals[num] || `${num}th`;
            return `.   ${ordinal}, `;
        })
        .replace(/\[LINE_BREAK\]\s*([•\-\*])\s+/g, '.   ') // Bullet points
        .replace(/\[LINE_BREAK\]/g, ' '); // Convert remaining line breaks to spaces

    // Clean up whitespace within paragraphs
    enhanced = enhanced
        .replace(/\s+/g, ' ') // Multiple spaces to single
        .replace(/\s*([.,!?;:])\s*/g, '$1 ') // Normalize punctuation spacing
        .trim();

    // Add gentle pauses after sentences for teaching clarity
    enhanced = enhanced
        .replace(/([.!?])\s+/g, '$1  ') // Double space after sentences
        .replace(/([,;:])\s+/g, '$1 '); // Single space after commas

    // Convert paragraph breaks to longer pauses for better comprehension
    enhanced = enhanced
        .replace(/\[PARAGRAPH_BREAK\]/g, '.   '); // Add extra pause between paragraphs

    // Handle common abbreviations naturally
    enhanced = enhanced
        .replace(/\be\.g\./gi, 'for example')
        .replace(/\bi\.e\./gi, 'that is')
        .replace(/\betc\./gi, 'etcetera')
        .replace(/\bvs\./gi, 'versus');

    // Simple number improvements
    enhanced = enhanced
        .replace(/(\d+)%/g, '$1 percent')
        .replace(/\$(\d+)/g, '$1 dollars');

    return enhanced;
}

/**
 * Handle various input formats (Markdown, HTML, plain text)
 */
function handleInputFormats(text, config) {
    let processed = text;

    // Markdown processing
    if (config.handleMarkdown) {
        processed = processMarkdown(processed);
    }

    // HTML tag removal with content preservation
    processed = processed
        .replace(/<[^>]+>/g, ' ') // Remove HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

    // Remove markdown formatting but preserve content
    processed = processed
        .replace(/[#*_~`]+/g, ' ') // Remove formatting chars
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Convert images to alt text

    // Handle tables (convert to readable format)
    processed = processed.replace(/\|/g, ' ') // Remove table pipes
        .replace(/-{3,}/g, ''); // Remove table separators

    return processed;
}

/**
 * Apply basic text enhancements for TTS
 */
function applyBasicEnhancements(text, config) {
    let enhanced = text;

    // Enhanced abbreviation handling with context awareness
    enhanced = enhanceAbbreviations(enhanced, config.targetLanguage);

    // Improved number handling with context
    enhanced = enhanceNumbers(enhanced, config.targetLanguage);

    // Technical term pronunciation
    if (config.handleTechnicalTerms) {
        enhanced = enhanceTechnicalTerms(enhanced);
    }

    // Symbol pronunciation
    enhanced = enhanceSymbols(enhanced);

    // Add natural pauses
    if (config.addPauses) {
        enhanced = addNaturalPauses(enhanced, config.speakingRate);
    }

    // Emphasize important terms
    enhanced = addEmphasis(enhanced);

    return enhanced;
}

/**
 * Convert to SSML format for advanced speech synthesis
 */
function convertToSSML(text, config) {
    // Start with basic SSML structure
    let ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${config.targetLanguage}">`;
    
    // Add prosody for rate control
    ssml += `<prosody rate="${config.speakingRate}">`;
    
    // Break the text into manageable segments
    const segments = splitIntoSegments(text, config.targetLanguage);
    
    segments.forEach(segment => {
        if (segment.trim()) {
            // Add appropriate breaks based on punctuation
            ssml += processSegmentForSSML(segment, config);
        }
    });
    
    ssml += '</prosody></speak>';
    return ssml;
}

/**
 * Enhanced abbreviation handling with context awareness
 */
function enhanceAbbreviations(text, language = 'en-US') {
    let enhanced = text;
    
    // Language-specific abbreviation handling
    const abbreviationMaps = {
        'en-US': {
            // Technical/Programming
            'API': 'A P I',
            'REST': 'REST',
            'GraphQL': 'Graph Q L',
            'JSON': 'Jason',
            'XML': 'X M L',
            'SQL': 'sequel',
            'NoSQL': 'no sequel',
            'MongoDB': 'Mongo D B',
            'PostgreSQL': 'Postgres Q L',
            'MySQL': 'My S Q L',
            'Redis': 'redis',
            'Node.js': 'Node dot J S',
            'React.js': 'React dot J S',
            'Vue.js': 'Vue dot J S',
            'Angular': 'Angular',
            'TypeScript': 'TypeScript',
            'JavaScript': 'JavaScript',
            'WebAssembly': 'WebAssembly',
            'WASM': 'wasm',
            
            // Cloud/DevOps
            'AWS': 'A W S',
            'Azure': 'Azure',
            'GCP': 'G C P',
            'K8s': 'Kubernetes',
            'Kubernetes': 'Kubernetes',
            'Docker': 'Docker',
            'CI/CD': 'C I C D',
            'GitHub': 'GitHub',
            'GitLab': 'GitLab',
            'Bitbucket': 'Bitbucket',
            'JIRA': 'JIRA',
            'Confluence': 'Confluence',
            
            // Academic
            'e.g.': 'for example',
            'i.e.': 'that is',
            'etc.': 'et cetera',
            'vs.': 'versus',
            'cf.': 'compare',
            'viz.': 'namely',
            'et al.': 'and others',
            
            // Common tech patterns
            'src/': 'source ',
            'dist/': 'dist ',
            'lib/': 'lib ',
            'test/': 'test ',
            'docs/': 'docs ',
            
            // Version patterns
            'v1.0': 'version 1 point 0',
            'v2.x': 'version 2 point x',
            '@latest': 'at latest',
            '@next': 'at next',
        },
        
        'en-GB': {
            // British English specific
            'Dr.': 'Doctor',
            'Mr.': 'Mister',
            'Mrs.': 'Missus',
            'Ms.': 'Miss',
            'Prof.': 'Professor',
            'Ltd.': 'Limited',
            'Co.': 'Company',
        }
    };

    const map = abbreviationMaps[language] || abbreviationMaps['en-US'];
    
    // Sort by longest first to prevent partial replacements
    const sortedEntries = Object.entries(map)
        .sort(([a], [b]) => b.length - a.length);
    
    sortedEntries.forEach(([abbr, full]) => {
        // Case-sensitive replacement for proper casing
        const regex = new RegExp(`\\b${abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        enhanced = enhanced.replace(regex, full);
    });

    return enhanced;
}

/**
 * Advanced number handling with context awareness
 */
function enhanceNumbers(text, language = 'en-US') {
    let enhanced = text;
    
    // Handle different number formats based on language
    if (language === 'en-US') {
        // Convert large numbers with commas
        enhanced = enhanced.replace(/\b(\d{1,3}(?:,\d{3})+)+\b/g, match => {
            return match.replace(/,/g, '');
        });
        
        // Handle years
        enhanced = enhanced.replace(/\b(19|20)(\d{2})\b/g, (match, century, year) => {
            if (parseInt(year) < 10) {
                return `${century} oh ${year}`;
            } else if (parseInt(year) >= 10 && parseInt(year) <= 99) {
                return `${century} ${year}`;
            }
            return match;
        });
        
        // Handle version numbers
        enhanced = enhanced.replace(/(\d+)\.(\d+)\.(\d+)/g, (match, major, minor, patch) => {
            return `${major} point ${minor} point ${patch}`;
        });
        
        enhanced = enhanced.replace(/(\d+)\.(\d+)/g, (match, major, minor) => {
            return `${major} point ${minor}`;
        });
        
        // Handle phone numbers (US format)
        enhanced = enhanced.replace(/\b(\d{3})[-\s.]?(\d{3})[-\s.]?(\d{4})\b/g, 
            (match, area, prefix, line) => {
                return `${area} ${prefix} ${line}`;
            }
        );
        
        // Handle dates (MM/DD/YYYY)
        enhanced = enhanced.replace(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g, 
            (match, month, day, year) => {
                return `${month} ${day} ${year}`;
            }
        );
    }
    
    // Common number enhancements across languages
    enhanced = enhanced
        .replace(/\b(\d+)%/g, '$1 percent')
        .replace(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g, (match, amount) => {
            const clean = amount.replace(/,/g, '');
            const decimal = clean.includes('.') ? 
                ` and ${clean.split('.')[1]} cents` : '';
            const dollars = clean.split('.')[0];
            return `${dollars} dollars${decimal}`;
        })
        .replace(/€(\d+(?:,\d{3})*(?:\.\d{2})?)/g, '$1 euros')
        .replace(/£(\d+(?:,\d{3})*(?:\.\d{2})?)/g, '$1 pounds')
        .replace(/¥(\d+(?:,\d{3})*(?:\.\d{2})?)/g, '$1 yen');
    
    // Mathematical expressions
    const mathOperators = {
        '+': 'plus',
        '-': 'minus',
        '*': 'times',
        '/': 'divided by',
        '=': 'equals',
        '<': 'less than',
        '>': 'greater than',
        '≤': 'less than or equal to',
        '≥': 'greater than or equal to',
        '≠': 'not equal to',
        '≈': 'approximately',
        '±': 'plus or minus',
        '×': 'times',
        '÷': 'divided by',
        '√': 'square root of',
        '∑': 'sum of',
        '∫': 'integral of',
        '∂': 'partial derivative of',
        '∞': 'infinity',
        'π': 'pi',
        'θ': 'theta',
        'λ': 'lambda',
        'μ': 'mu',
        'σ': 'sigma'
    };
    
    Object.entries(mathOperators).forEach(([symbol, word]) => {
        const regex = new RegExp(`\\${symbol}`, 'g');
        enhanced = enhanced.replace(regex, ` ${word} `);
    });
    
    // Handle fractions
    const commonFractions = {
        '1/2': 'one half',
        '1/3': 'one third',
        '2/3': 'two thirds',
        '1/4': 'one quarter',
        '3/4': 'three quarters',
        '1/5': 'one fifth',
        '2/5': 'two fifths',
        '3/5': 'three fifths',
        '4/5': 'four fifths'
    };
    
    Object.entries(commonFractions).forEach(([fraction, word]) => {
        const regex = new RegExp(`\\b${fraction}\\b`, 'g');
        enhanced = enhanced.replace(regex, word);
    });
    
    // Handle ordinal numbers
    enhanced = enhanced.replace(/\b(\d+)(st|nd|rd|th)\b/g, (match, num, suffix) => {
        const n = parseInt(num);
        const lastDigit = n % 10;
        const lastTwoDigits = n % 100;
        
        if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
            return `${n}th`;
        }
        
        switch (lastDigit) {
            case 1: return `${n}st`;
            case 2: return `${n}nd`;
            case 3: return `${n}rd`;
            default: return `${n}th`;
        }
    });
    
    return enhanced;
}

/**
 * Enhanced technical term pronunciation
 */
function enhanceTechnicalTerms(text) {
    let enhanced = text;
    
    // Programming terms with contextual awareness
    const programmingTerms = {
        // General programming
        'function': 'function',
        'variable': 'variable',
        'parameter': 'parameter',
        'argument': 'argument',
        'return': 'return',
        'class': 'class',
        'object': 'object',
        'array': 'array',
        'string': 'string',
        'integer': 'integer',
        'boolean': 'boolean',
        'null': 'null',
        'undefined': 'undefined',
        'NaN': 'not a number',
        'Infinity': 'infinity',
        
        // Modern JavaScript/TypeScript
        'let': 'let',
        'const': 'const',
        'var': 'var',
        'async': 'async',
        'await': 'await',
        'Promise': 'promise',
        'async/await': 'async await',
        'TypeScript': 'TypeScript',
        'interface': 'interface',
        'type': 'type',
        'generic': 'generic',
        'enum': 'enum',
        'namespace': 'namespace',
        'decorator': 'decorator',
        
        // React/Vue/Angular specific
        'useState': 'use state',
        'useEffect': 'use effect',
        'useContext': 'use context',
        'props': 'props',
        'state': 'state',
        'component': 'component',
        'hook': 'hook',
        'mixin': 'mixin',
        'directive': 'directive',
        'service': 'service',
        
        // Common patterns
        'callback': 'callback',
        'closure': 'closure',
        'prototype': 'prototype',
        'inheritance': 'inheritance',
        'polymorphism': 'polymorphism',
        'encapsulation': 'encapsulation',
        'abstraction': 'abstraction',
        
        // Error handling
        'try-catch': 'try catch',
        'throw': 'throw',
        'Error': 'error',
        'Exception': 'exception',
        'finally': 'finally'
    };
    
    // File extensions with context
    const fileExtensions = {
        '.js': 'dot J S file',
        '.jsx': 'dot J S X file',
        '.ts': 'dot T S file',
        '.tsx': 'dot T S X file',
        '.py': 'dot P Y file',
        '.java': 'dot java file',
        '.cpp': 'dot C P P file',
        '.c': 'dot C file',
        '.h': 'dot H file',
        '.html': 'dot H T M L file',
        '.css': 'dot C S S file',
        '.scss': 'dot S C S S file',
        '.sass': 'dot S A S S file',
        '.json': 'dot jason file',
        '.xml': 'dot X M L file',
        '.md': 'dot markdown file',
        '.txt': 'dot text file',
        '.pdf': 'dot P D F file',
        '.docx': 'dot doc x file',
        '.xlsx': 'dot x l s x file',
        '.csv': 'dot C S V file',
        '.sql': 'dot S Q L file',
        '.env': 'dot env file'
    };
    
    // Apply programming terms
    Object.entries(programmingTerms).forEach(([term, pronunciation]) => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        enhanced = enhanced.replace(regex, pronunciation);
    });
    
    // Apply file extensions (case-insensitive)
    Object.entries(fileExtensions).forEach(([ext, pronunciation]) => {
        const regex = new RegExp(`\\${ext}\\b`, 'gi');
        enhanced = enhanced.replace(regex, pronunciation);
    });
    
    // Handle common mispronunciations in tech context
    enhanced = enhanced
        .replace(/\bSQLite\b/gi, 'S Q Lite')
        .replace(/\bPostgreSQL\b/gi, 'Postgres Q L')
        .replace(/\bMySQL\b/gi, 'My S Q L')
        .replace(/\bMongoDB\b/gi, 'Mongo D B')
        .replace(/\bRedis\b/gi, 'Redis')
        .replace(/\bGraphQL\b/gi, 'Graph Q L')
        .replace(/\bWebRTC\b/gi, 'Web R T C')
        .replace(/\bWebGL\b/gi, 'Web G L')
        .replace(/\bWebAssembly\b/gi, 'WebAssembly')
        .replace(/\bOAuth\b/gi, 'O Auth')
        .replace(/\bJWT\b/gi, 'J W T')
        .replace(/\bCORS\b/gi, 'Cors')
        .replace(/\bCSRF\b/gi, 'C Surf')
        .replace(/\bXSS\b/gi, 'X S S')
        .replace(/\bSEO\b/gi, 'S E O')
        .replace(/\bSSR\b/gi, 'S S R')
        .replace(/\bCSR\b/gi, 'C S R')
        .replace(/\bSSG\b/gi, 'S S G')
        .replace(/\bISR\b/gi, 'I S R');
    
    return enhanced;
}

/**
 * Enhanced symbol pronunciation
 */
function enhanceSymbols(text) {
    let enhanced = text;
    
    const symbolPronunciations = {
        // Programming symbols
        '->': 'arrow',
        '=>': 'fat arrow',
        '==': 'double equals',
        '===': 'triple equals',
        '!=': 'not equals',
        '!==': 'not triple equals',
        '+=': 'plus equals',
        '-=': 'minus equals',
        '*=': 'times equals',
        '/=': 'divided by equals',
        '++': 'plus plus',
        '--': 'minus minus',
        '&&': 'and',
        '||': 'or',
        '!': 'not',
        '~': 'tilde',
        '&': 'ampersand',
        '|': 'pipe',
        '^': 'caret',
        '%': 'percent',
        '@': 'at',
        '#': 'hash',
        '\\': 'backslash',
        '_': 'underscore',
        
        // Code blocks
        '```': '',
        '`': '',
        
        // Brackets and parentheses
        '{': 'open brace',
        '}': 'close brace',
        '[': 'open bracket',
        ']': 'close bracket',
        '(': 'open parenthesis',
        ')': 'close parenthesis',
        
        // Quotes
        '"': '',
        "'": '',
        '`': '',
        '«': '',
        '»': '',
        
        // Punctuation (for clearer speech)
        ';': 'semicolon',
        ':': 'colon',
        ',': 'comma',
        '.': 'period',
        '?': 'question mark',
        '!': 'exclamation mark'
    };
    
    // Process symbols from longest to shortest to avoid conflicts
    const sortedSymbols = Object.entries(symbolPronunciations)
        .sort(([a], [b]) => b.length - a.length);
    
    sortedSymbols.forEach(([symbol, pronunciation]) => {
        const escapedSymbol = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedSymbol, 'g');
        enhanced = enhanced.replace(regex, pronunciation ? ` ${pronunciation} ` : ' ');
    });
    
    return enhanced;
}

/**
 * Add natural pauses based on content and speaking rate
 */
function addNaturalPauses(text, speakingRate = 1.0) {
    let enhanced = text;
    
    // Calculate pause durations based on speaking rate
    const pauseFactor = Math.max(0.5, Math.min(2.0, 1.0 / speakingRate));
    
    // Sentence endings - longer pause
    enhanced = enhanced.replace(/([.!?])\s+/g, `$1${' '.repeat(Math.ceil(2 * pauseFactor))}`);
    
    // Mid-sentence pauses - shorter pause
    enhanced = enhanced.replace(/([,;:])\s+/g, `$1${' '.repeat(Math.ceil(pauseFactor))}`);
    
    // After transitional phrases
    const transitions = [
        'however', 'therefore', 'consequently', 'furthermore', 'moreover',
        'nevertheless', 'nonetheless', 'additionally', 'meanwhile',
        'subsequently', 'ultimately', 'finally', 'in conclusion',
        'for example', 'for instance', 'specifically', 'particularly',
        'on the other hand', 'in contrast', 'similarly', 'likewise'
    ];
    
    transitions.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        enhanced = enhanced.replace(regex, ` ${word} `);
    });
    
    // Before important conjunctions
    enhanced = enhanced.replace(/\s+(but|and|or|yet|so)\s+/gi, '  $1 ');
    
    // Clean up excessive spaces
    enhanced = enhanced.replace(/\s{3,}/g, '  ');
    
    return enhanced;
}

/**
 * Add emphasis to important terms
 */
function addEmphasis(text) {
    let enhanced = text;
    
    // Keywords that often need emphasis
    const emphasisTerms = [
        // Importance indicators
        'important', 'critical', 'crucial', 'essential', 'vital',
        'significant', 'major', 'key', 'primary', 'fundamental',
        
        // Warning/attention
        'warning', 'caution', 'danger', 'alert', 'note',
        'attention', 'beware', 'careful', 'dangerous',
        
        // Contrast
        'however', 'but', 'although', 'despite', 'nevertheless',
        
        // Conclusion
        'therefore', 'thus', 'hence', 'consequently', 'finally'
    ];
    
    // Add emphasis markers (compatible with SSML or basic TTS)
    emphasisTerms.forEach(term => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        enhanced = enhanced.replace(regex, `**${term}**`);
    });
    
    // Remove double emphasis markers for basic TTS
    enhanced = enhanced.replace(/\*\*/g, '');
    
    return enhanced;
}

/**
 * Split text into segments for SSML processing
 */
function splitIntoSegments(text, language = 'en-US') {
    // Split by sentence boundaries
    const sentenceRegex = /[^.!?]+[.!?]+|[^.!?]+$/g;
    const sentences = text.match(sentenceRegex) || [text];
    
    const segments = [];
    let currentSegment = '';
    
    sentences.forEach(sentence => {
        // Check if adding this sentence would make the segment too long
        if ((currentSegment + sentence).length > 150) {
            if (currentSegment) {
                segments.push(currentSegment.trim());
                currentSegment = sentence;
            } else {
                // If a single sentence is too long, split it further
                const words = sentence.split(' ');
                let tempSegment = '';
                
                words.forEach(word => {
                    if ((tempSegment + word).length > 150) {
                        segments.push(tempSegment.trim());
                        tempSegment = word + ' ';
                    } else {
                        tempSegment += word + ' ';
                    }
                });
                
                if (tempSegment) {
                    currentSegment = tempSegment;
                }
            }
        } else {
            currentSegment += sentence;
        }
    });
    
    if (currentSegment) {
        segments.push(currentSegment.trim());
    }
    
    return segments;
}

/**
 * Process individual segment for SSML
 */
function processSegmentForSSML(segment, config) {
    let ssmlSegment = segment;
    
    // Add break tags based on punctuation
    ssmlSegment = ssmlSegment
        .replace(/\.\s+/g, '.<break time="500ms"/> ')
        .replace(/!\s+/g, '!<break time="400ms"/> ')
        .replace(/\?\s+/g, '?<break time="400ms"/> ')
        .replace(/;\s+/g, ';<break time="300ms"/> ')
        .replace(/,\s+/g, ',<break time="200ms"/> ');
    
    // Add emphasis for important terms
    const emphasisWords = ['important', 'critical', 'warning', 'note', 'caution'];
    emphasisWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        ssmlSegment = ssmlSegment.replace(regex, `<emphasis level="strong">${word}</emphasis>`);
    });
    
    // Add prosody for questions
    if (ssmlSegment.includes('?')) {
        ssmlSegment = `<prosody pitch="+10%">${ssmlSegment}</prosody>`;
    }
    
    return ssmlSegment;
}

/**
 * Process markdown for better TTS
 */
function processMarkdown(text) {
    let processed = text;
    
    // Headers - add emphasis
    processed = processed.replace(/^#{1,6}\s+(.+)$/gm, '$1');
    
    // Lists - add pauses
    processed = processed.replace(/^\s*[-*+]\s+(.+)$/gm, '$1');
    processed = processed.replace(/^\s*\d+\.\s+(.+)$/gm, '$1');
    
    // Code blocks - remove backticks but keep content
    processed = processed.replace(/```[\s\S]*?```/g, match => {
        // Extract code content without backticks
        return match.replace(/```[\w]*\n?/g, '').replace(/\n```/g, '');
    });
    
    // Inline code
    processed = processed.replace(/`([^`]+)`/g, '$1');
    
    // Blockquotes
    processed = processed.replace(/^>\s+(.+)$/gm, '$1');
    
    // Horizontal rules
    processed = processed.replace(/^[-*_]{3,}$/gm, '');
    
    return processed;
}

/**
 * Batch process multiple text chunks with optimization
 */
export function batchProcessTextForTTS(texts, options = {}) {
    const defaults = {
        parallelProcessing: false, // Web workers not implemented yet
        chunkSize: 1000,
        progressCallback: null
    };
    
    const config = { ...defaults, ...options };
    const results = [];
    
    // Sequential processing
    texts.forEach((text, index) => {
        if (config.progressCallback) {
            config.progressCallback((index + 1) / texts.length);
        }
        results.push(enhanceTextForTTS(text, config));
    });
    
    return results;
}

/**
 * Generate SSML with advanced speech features
 */
export function generateSSML(text, options = {}) {
    const defaults = {
        voice: 'en-US-Wavenet-D',
        rate: 'medium',
        pitch: 'medium',
        volume: 'medium',
        language: 'en-US'
    };
    
    const config = { ...defaults, ...options };
    
    // Convert rate to SSML value
    const rateMap = {
        'x-slow': 'x-slow',
        'slow': 'slow',
        'medium': 'medium',
        'fast': 'fast',
        'x-fast': 'x-fast'
    };
    
    const ssml = `<?xml version="1.0"?>
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.w3.org/2001/10/synthesis
                           http://www.w3.org/TR/speech-synthesis/synthesis.xsd"
       xml:lang="${config.language}">
    <voice name="${config.voice}">
        <prosody rate="${rateMap[config.rate] || 'medium'}"
                 pitch="${config.pitch}"
                 volume="${config.volume}">
            ${enhanceTextForTTS(text, { useSSML: true })}
        </prosody>
    </voice>
</speak>`;
    
    return ssml;
}

/**
 * Simple text analysis for gentle teaching speech
 * Returns comfortable speaking parameters
 */
export function analyzeTextForTTS(text) {
    // Simple, consistent parameters for gentle teaching
    return {
        suggestedRate: 0.9,  // Slightly slower for clarity
        suggestedPitch: 1.0  // Natural, neutral pitch
    };
}

/**
 * Create a pronunciation dictionary for custom terms
 */
export function createPronunciationDictionary(customTerms = {}) {
    const dictionary = {
        // Default tech pronunciations
        ...customTerms
    };
    
    return {
        add: (term, pronunciation) => {
            dictionary[term] = pronunciation;
        },
        remove: (term) => {
            delete dictionary[term];
        },
        apply: (text) => {
            let enhanced = text;
            const sortedTerms = Object.entries(dictionary)
                .sort(([a], [b]) => b.length - a.length);
            
            sortedTerms.forEach(([term, pronunciation]) => {
                const regex = new RegExp(`\\b${term}\\b`, 'gi');
                enhanced = enhanced.replace(regex, pronunciation);
            });
            
            return enhanced;
        },
        export: () => ({ ...dictionary }),
        import: (newDictionary) => {
            Object.assign(dictionary, newDictionary);
        }
    };
}

// Export utility functions for testing and customization
export const TTSUtils = {
    enhanceAbbreviations,
    enhanceNumbers,
    enhanceTechnicalTerms,
    enhanceSymbols,
    addNaturalPauses,
    addEmphasis,
    splitIntoSegments,
    analyzeTextForTTS
};