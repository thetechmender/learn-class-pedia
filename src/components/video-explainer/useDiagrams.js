import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';

export function useDiagrams(diagrams) {
    const [renderedDiagrams, setRenderedDiagrams] = useState({});
    const [diagramLoading, setDiagramLoading] = useState(false);
    const diagramRefs = useRef({});

    const generateMermaidFromDescription = (description) => {
        return `
graph TD
    A[Start] --> B[Process]
    B --> C{Decision}
    C -->|Yes| D[Result A]
    C -->|No| E[Result B]
    style A fill:#1e40af
    style D fill:#10b981
    style E fill:#ef4444
    `;
    };

    const renderDiagrams = async () => {
        if (!diagrams.length) return;

        setDiagramLoading(true);
        const rendered = {};

        for (const diagram of diagrams) {
            try {
                const elementId = `diagram-${diagram.id}`;
                diagramRefs.current[elementId] = diagramRefs.current[elementId] || document.createElement('div');

                const { svg } = await mermaid.render(
                    elementId, 
                    diagram.mermaidCode || generateMermaidFromDescription(diagram.description)
                );
                rendered[diagram.id] = svg;
            } catch (error) {
                console.error('Error rendering diagram:', error);
                rendered[diagram.id] = `<div class="text-red-400 p-4 bg-red-900/20 rounded-lg">Error rendering diagram</div>`;
            }
        }

        setRenderedDiagrams(rendered);
        setDiagramLoading(false);
    };

    useEffect(() => {
        renderDiagrams();
    }, [diagrams]);

    return { renderedDiagrams, diagramLoading };
}
