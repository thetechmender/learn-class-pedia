import React from 'react';
import { FileText, Volume2, Image, Calendar } from 'lucide-react';

export default function AiContentDebugger({ aiContent }) {
  if (!aiContent) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-gray-600">No AI content available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h4 className="font-medium text-gray-900 mb-4">AI Content Structure</h4>
      
      <div className="space-y-4">
        {/* Lesson Text */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center mb-2">
            <FileText className="h-4 w-4 text-blue-600 mr-2" />
            <span className="font-medium text-gray-900">Lesson Text</span>
          </div>
          <div className="text-sm text-gray-600">
            {aiContent.lessonText ? (
              <div>
                <p>Length: {aiContent.lessonText.length} characters</p>
                <p className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono max-h-20 overflow-y-auto">
                  {aiContent.lessonText.substring(0, 200)}
                  {aiContent.lessonText.length > 200 && '...'}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No lesson text available</p>
            )}
          </div>
        </div>

        {/* Audio Content */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Volume2 className="h-4 w-4 text-green-600 mr-2" />
            <span className="font-medium text-gray-900">Audio Content</span>
          </div>
          <div className="text-sm text-gray-600">
            {aiContent.audios && aiContent.audios.length > 0 ? (
              <div>
                <p>Count: {aiContent.audios.length} audio files</p>
                <div className="mt-2 space-y-1">
                  {aiContent.audios.map((audio, index) => (
                    <div key={audio.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                      <span>Audio {index + 1}</span>
                      <div className="flex items-center space-x-2">
                        <span>ID: {audio.id}</span>
                        <span>Seq: {audio.sequence}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No audio content available</p>
            )}
          </div>
        </div>

        {/* Video/Slide Content */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Image className="h-4 w-4 text-purple-600 mr-2" />
            <span className="font-medium text-gray-900">Video/Slide Content</span>
          </div>
          <div className="text-sm text-gray-600">
            {aiContent.videos && aiContent.videos.length > 0 ? (
              <div>
                <p>Count: {aiContent.videos.length} slides</p>
                <div className="mt-2 space-y-1">
                  {aiContent.videos.map((video, index) => (
                    <div key={video.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                      <span>Slide {index + 1}</span>
                      <div className="flex items-center space-x-2">
                        <span>ID: {video.id}</span>
                        <span>Seq: {video.sequence}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No video/slide content available</p>
            )}
          </div>
        </div>

        {/* Generation Info */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Calendar className="h-4 w-4 text-orange-600 mr-2" />
            <span className="font-medium text-gray-900">Generation Info</span>
          </div>
          <div className="text-sm text-gray-600">
            {aiContent.generatedAt ? (
              <p>Generated: {new Date(aiContent.generatedAt).toLocaleString()}</p>
            ) : (
              <p className="text-gray-500">No generation timestamp available</p>
            )}
          </div>
        </div>

        {/* Raw JSON */}
        <details className="border rounded-lg p-4">
          <summary className="font-medium text-gray-900 cursor-pointer">Raw JSON Data</summary>
          <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
            {JSON.stringify(aiContent, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}