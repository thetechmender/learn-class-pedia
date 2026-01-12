import { useState } from 'react';
import {
  BookOpen, Target, ListChecks, Lightbulb, FileText, 
  HelpCircle, Globe, BookMarked, Code, BarChart3,
  ChevronDown, ChevronUp, CheckCircle, Layers
} from 'lucide-react';

// Collapsible Section Component
function CollapsibleSection({ title, icon: Icon, children, defaultOpen = false, accentColor = 'blue' }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 flex items-center justify-between ${colorClasses[accentColor]} border-b transition-colors hover:opacity-90`}
      >
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5" />
          <span className="font-semibold">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
}

// Format text with bullet points
function formatTextContent(text) {
  if (!text) return null;
  
  // Clean markdown code blocks
  const cleanText = text.replace(/```markdown\n?/g, '').replace(/```\n?/g, '');
  
  const lines = cleanText.split('\n').filter(line => line.trim());
  
  return lines.map((line, index) => {
    const trimmed = line.trim();
    
    // Numbered items (1. or 1.1)
    if (/^\d+\.(\d+\.?)?\s/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.(\d+\.?)?\s*/, '');
      const isSubItem = /^\d+\.\d+/.test(trimmed);
      return (
        <div key={index} className={`flex items-start mb-2 ${isSubItem ? 'ml-6' : ''}`}>
          <span className="text-blue-500 mr-2 font-mono text-sm mt-0.5">
            {trimmed.match(/^\d+\.(\d+\.?)?/)[0]}
          </span>
          <span className="text-gray-700">{content}</span>
        </div>
      );
    }
    
    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const content = trimmed.replace(/^[-•]\s*/, '');
      return (
        <div key={index} className="flex items-start mb-2 ml-2">
          <span className="text-blue-500 mr-2 mt-1">•</span>
          <span className="text-gray-700">{content}</span>
        </div>
      );
    }
    
    // Regular text
    return <p key={index} className="text-gray-700 mb-2">{trimmed}</p>;
  });
}

export default function AiContentViewer({ aiContent }) {
  if (!aiContent) return null;

  const {
    comprehensiveSummary,
    learningObjectives,
    keyConcepts,
    structuredOutline,
    practiceExercises,
    assessmentQuestions,
    detailedExamples,
    caseStudies,
    realWorldApplications,
    additionalResources,
    diagramsDescription,
    statistics,
    generatedAt
  } = aiContent;

  return (
    <div className="space-y-4">
      {/* Statistics Bar */}
      {statistics && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span className="font-semibold">Content Statistics</span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              {statistics.totalAudios > 0 && (
                <span className="bg-white/20 px-3 py-1 rounded-full">{statistics.totalAudios} Audios</span>
              )}
              {statistics.totalVideos > 0 && (
                <span className="bg-white/20 px-3 py-1 rounded-full">{statistics.totalVideos} Videos</span>
              )}
              {statistics.totalExamples > 0 && (
                <span className="bg-white/20 px-3 py-1 rounded-full">{statistics.totalExamples} Examples</span>
              )}
              {statistics.hasSlides && (
                <span className="bg-white/20 px-3 py-1 rounded-full">✓ Slides</span>
              )}
              {statistics.isComplete && (
                <span className="bg-green-400/30 px-3 py-1 rounded-full flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" /> Complete
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Summary */}
      {comprehensiveSummary && (
        <CollapsibleSection title="Course Summary" icon={BookOpen} defaultOpen={true} accentColor="blue">
          <p className="text-gray-700 leading-relaxed">{comprehensiveSummary}</p>
        </CollapsibleSection>
      )}

      {/* Learning Objectives */}
      {learningObjectives && (
        <CollapsibleSection title="Learning Objectives" icon={Target} accentColor="green">
          <div className="space-y-1">{formatTextContent(learningObjectives)}</div>
        </CollapsibleSection>
      )}

      {/* Key Concepts */}
      {keyConcepts && (
        <CollapsibleSection title="Key Concepts" icon={Lightbulb} accentColor="purple">
          <div className="space-y-1">{formatTextContent(keyConcepts)}</div>
        </CollapsibleSection>
      )}

      {/* Structured Outline */}
      {structuredOutline && (
        <CollapsibleSection title="Course Outline" icon={Layers} accentColor="indigo">
          <div className="space-y-1 font-mono text-sm">{formatTextContent(structuredOutline)}</div>
        </CollapsibleSection>
      )}

      {/* Practice Exercises */}
      {practiceExercises && (
        <CollapsibleSection title="Practice Exercises" icon={ListChecks} accentColor="teal">
          <div className="space-y-1">{formatTextContent(practiceExercises)}</div>
        </CollapsibleSection>
      )}

      {/* Assessment Questions */}
      {assessmentQuestions && (
        <CollapsibleSection title="Assessment Questions" icon={HelpCircle} accentColor="orange">
          <div className="space-y-1">{formatTextContent(assessmentQuestions)}</div>
        </CollapsibleSection>
      )}

      {/* Detailed Examples */}
      {detailedExamples && (
        <CollapsibleSection title="Detailed Examples" icon={Code} accentColor="purple">
          <div className="space-y-1">{formatTextContent(detailedExamples)}</div>
        </CollapsibleSection>
      )}

      {/* Case Studies */}
      {caseStudies && (
        <CollapsibleSection title="Case Studies" icon={FileText} accentColor="blue">
          <div className="space-y-1">{formatTextContent(caseStudies)}</div>
        </CollapsibleSection>
      )}

      {/* Real World Applications */}
      {realWorldApplications && (
        <CollapsibleSection title="Real-World Applications" icon={Globe} accentColor="green">
          <div className="space-y-1">{formatTextContent(realWorldApplications)}</div>
        </CollapsibleSection>
      )}

      {/* Diagrams Description */}
      {diagramsDescription && (
        <CollapsibleSection title="Diagrams & Visuals" icon={Layers} accentColor="indigo">
          <div className="space-y-1">{formatTextContent(diagramsDescription)}</div>
        </CollapsibleSection>
      )}

      {/* Additional Resources */}
      {additionalResources && (
        <CollapsibleSection title="Additional Resources" icon={BookMarked} accentColor="teal">
          <div className="space-y-1">{formatTextContent(additionalResources)}</div>
        </CollapsibleSection>
      )}

      {/* Generation Info */}
      {generatedAt && (
        <div className="text-center text-sm text-gray-500 pt-4 border-t">
          AI content generated on {new Date(generatedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}
