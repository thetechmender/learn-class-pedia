import React from 'react';

export default function MarkdownRenderer({ content }) {
    if (!content) return null;

    // Simple markdown rendering for chat messages
    const renderMarkdown = (text) => {
        // Split by code blocks first
        const parts = text.split(/(```[\s\S]*?```)/g);
        
        return parts.map((part, index) => {
            // Code blocks
            if (part.startsWith('```') && part.endsWith('```')) {
                const codeContent = part.slice(3, -3);
                const lines = codeContent.split('\n');
                const language = lines[0].trim();
                const code = lines.slice(1).join('\n') || codeContent;
                
                return (
                    <pre key={index} className="bg-slate-900 rounded-lg p-3 my-2 overflow-x-auto">
                        {language && (
                            <div className="text-xs text-slate-500 mb-2">{language}</div>
                        )}
                        <code className="text-sm text-green-400 font-mono">{code}</code>
                    </pre>
                );
            }
            
            // Regular text with inline formatting
            return (
                <span key={index}>
                    {renderInlineMarkdown(part)}
                </span>
            );
        });
    };

    const renderInlineMarkdown = (text) => {
        // Split by paragraphs
        const paragraphs = text.split('\n\n');
        
        return paragraphs.map((paragraph, pIndex) => {
            if (!paragraph.trim()) return null;
            
            // Handle bullet points
            if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('• ')) {
                const items = paragraph.split('\n').filter(line => line.trim());
                return (
                    <ul key={pIndex} className="list-disc list-inside my-2 space-y-1">
                        {items.map((item, iIndex) => (
                            <li key={iIndex} className="text-sm">
                                {formatInlineText(item.replace(/^[-•]\s*/, ''))}
                            </li>
                        ))}
                    </ul>
                );
            }
            
            // Handle numbered lists
            if (/^\d+\.\s/.test(paragraph.trim())) {
                const items = paragraph.split('\n').filter(line => line.trim());
                return (
                    <ol key={pIndex} className="list-decimal list-inside my-2 space-y-1">
                        {items.map((item, iIndex) => (
                            <li key={iIndex} className="text-sm">
                                {formatInlineText(item.replace(/^\d+\.\s*/, ''))}
                            </li>
                        ))}
                    </ol>
                );
            }
            
            // Handle headers
            if (paragraph.startsWith('### ')) {
                return <h4 key={pIndex} className="font-semibold text-base my-2">{formatInlineText(paragraph.slice(4))}</h4>;
            }
            if (paragraph.startsWith('## ')) {
                return <h3 key={pIndex} className="font-bold text-lg my-2">{formatInlineText(paragraph.slice(3))}</h3>;
            }
            if (paragraph.startsWith('# ')) {
                return <h2 key={pIndex} className="font-bold text-xl my-2">{formatInlineText(paragraph.slice(2))}</h2>;
            }
            
            // Regular paragraph
            return (
                <p key={pIndex} className="text-sm leading-relaxed my-1">
                    {formatInlineText(paragraph)}
                </p>
            );
        });
    };

    const formatInlineText = (text) => {
        // Handle bold **text**
        let parts = text.split(/(\*\*[^*]+\*\*)/g);
        
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>;
            }
            
            // Handle inline code `code`
            const codeParts = part.split(/(`[^`]+`)/g);
            return codeParts.map((codePart, codeIndex) => {
                if (codePart.startsWith('`') && codePart.endsWith('`')) {
                    return (
                        <code key={`${index}-${codeIndex}`} className="bg-slate-700 px-1.5 py-0.5 rounded text-cyan-300 text-xs font-mono">
                            {codePart.slice(1, -1)}
                        </code>
                    );
                }
                return codePart;
            });
        });
    };

    return (
        <div className="markdown-content">
            {renderMarkdown(content)}
        </div>
    );
}
