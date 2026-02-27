import { GripVertical, Trash2, BookOpen, MoveUp, MoveDown } from 'lucide-react';

const SelectedLecturesTable = ({ 
  selectedLectures = [], 
  onLectureRemove, 
  onLectureReorder,
  courseType,
  disabled = false
}) => {
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex !== dropIndex) {
      onLectureReorder(dragIndex, dropIndex);
    }
  };

  const moveLecture = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < selectedLectures.length) {
      onLectureReorder(index, newIndex);
    }
  };

  const getLectureDisplayName = (lecture) => {
    return lecture.displayName || `${lecture.lmsCourseName} - ${lecture.lmsLectureName}`;
  };

  const getLectureTypeLabel = (lectureType) => {
    const types = {
      1: 'Video',
      2: 'Text', 
      3: 'Quiz',
      4: 'Assignment',
      5: 'Resource'
    };
    return types[lectureType] || 'Unknown';
  };

  const getMappedItemLabel = (lecture) => {
    if (lecture?.itemType === 'CERTIFICATE') return 'Course Certificate';
    if (lecture?.itemType === 'SHORT_COURSE') return 'Basic Course';
    return null;
  };

  if (selectedLectures.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
        <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500 mb-2">No lectures selected yet.</p>
        <p className="text-sm text-gray-400">
          {courseType === 1 
            ? 'Search and add lectures using the dropdown above.'
            : 'Search and add lectures using the dropdown above, then organize them into sections.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">
            Selected Lectures ({selectedLectures.length-1})
          </h3>
          <div className="text-xs text-gray-500">
            {courseType === 1 ? 'Direct Lectures' : 'Section Lectures'}
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {selectedLectures.map((lecture, index) => (
          <div
            key={lecture.id}
            draggable={!disabled}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={`p-4 ${!disabled ? 'cursor-move hover:bg-gray-50' : ''} transition-colors`}
          >
            <div className="flex items-start space-x-3">
              {/* Drag Handle */}
              {!disabled && (
                <div className="flex items-center space-x-1">
                  <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                  <div className="flex flex-col space-y-1">
                    <button
                      type="button"
                      onClick={() => moveLecture(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <MoveUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveLecture(index, 'down')}
                      disabled={index === selectedLectures.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <MoveDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Lecture Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <BookOpen className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">
                        #{index + 1}
                      </span>
                      {getMappedItemLabel(lecture) && (
                        <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                          {getMappedItemLabel(lecture)}
                        </span>
                      )}
                      <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {getLectureTypeLabel(lecture.lectureType)}
                      </span>
                      {lecture.isFreePreview && (
                        <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          Free Preview
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {getLectureDisplayName(lecture)}
                    </h4>
                    

                    {lecture.lectureOverview && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        <p className="line-clamp-2">{lecture.lectureOverview}</p>
                      </div>
                    )}

                    {lecture.tags && lecture.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {lecture.tags.slice(0, 5).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {lecture.tags.length > 5 && (
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            +{lecture.tags.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => onLectureRemove(lecture.id)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        title="Remove lecture"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default SelectedLecturesTable;
