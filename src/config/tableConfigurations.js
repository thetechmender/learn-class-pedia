import { Eye, Edit2, Trash2, Award, Folder, FolderOpen, Users, Star } from 'lucide-react';

// Course table configuration
export const courseTableColumns = [
  {
    key: 'title',
    title: 'Course',
    width: '35%',
    minWidth: '250px',
    type: 'image',
    align: 'left',
    render: (value, item, index) => {
      
      
      
      const imageUrl = item.thumbnailUrl || item.imageUrl || item.image || item.courseImage || item.thumbnail || item.courseThumbnail;
      const hasImage = !!imageUrl;
      
      return (
        <div className="flex items-center">
          {hasImage ? (
            <img 
              src={imageUrl}
              alt={item.title}
              className="w-10 h-10 rounded-lg object-cover mr-3 border border-gray-200 dark:border-gray-600"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-3 border border-gray-200 dark:border-gray-600" 
               style={{ display: hasImage ? 'none' : 'flex' }}>
            <span className="text-white text-xs font-bold">
              {item.title?.charAt(0)?.toUpperCase() || 'C'}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.title}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{item.subtitle}</div>
          </div>
        </div>
      );
    },
    highlightSearch: true
  },
  {
    key: 'categoryName',
    title: 'Category',
    width: '20%',
    minWidth: '120px',
    type: 'badge',
    align: 'left',
    badgeClass: () => 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-700'
  },
  {
    key: 'courseLevelName',
    title: 'Level',
    width: '15%',
    minWidth: '80px',
    type: 'badge',
    align: 'left',
    badgeClass: () => 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-300 dark:border-orange-700'
  },
  {
    key: 'actions',
    title: 'Actions',
    width: '30%',
    minWidth: '140px',
    type: 'actions',
    align: 'center'
  }
];

// Category table configuration
export const categoryTableColumns = [
  {
    key: 'name',
    title: 'Category',
    width: '300px',
    render: (value, item) => (
      <div className="flex items-center">
        <button className="mr-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors">
          {item.children?.length > 0 ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
        </button>
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{item.slug}</div>
        </div>
      </div>
    ),
    highlightSearch: true
  },
  {
    key: 'description',
    title: 'Description',
    width: '300px',
    truncate: true
  },
  {
    key: 'isActive',
    title: 'Status',
    width: '100px',
    type: 'badge',
    badgeClass: (value) => value ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300 dark:border-red-700',
    badgeText: (value) => value ? 'Active' : 'Inactive'
  },
  {
    key: 'courseCount',
    title: 'Courses',
    width: '100px',
    render: (value) => (
      <div className="text-sm text-gray-900 dark:text-gray-100">{value || 0} courses</div>
    )
  },
  {
    key: 'actions',
    title: 'Actions',
    width: '150px',
    type: 'actions',
    align: 'center'
  }
];

// Badge table configuration
export const badgeTableColumns = [
  {
    key: 'badgeName',
    title: 'Badge',
    width: '250px',
    render: (value, item) => (
      <div className="flex items-center">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center text-2xl bg-white dark:bg-gray-800 mr-3">
          {item.badgeIcon || '🏆'}
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{item.badgeType}</div>
        </div>
      </div>
    ),
    highlightSearch: true
  },
  {
    key: 'description',
    title: 'Description',
    width: '300px',
    truncate: true
  },
  {
    key: 'badgeType',
    title: 'Type',
    width: '120px',
    type: 'badge',
    badgeClass: (value) => {
      const colorMap = {
        achievement: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
        completion: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700',
        excellence: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-700',
        featured: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700'
      };
      return colorMap[value] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600';
    }
  },
  {
    key: 'isActive',
    title: 'Status',
    width: '100px',
    type: 'badge',
    badgeClass: (value) => value ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300 dark:border-red-700',
    badgeText: (value) => value ? 'Active' : 'Inactive'
  },
  {
    key: 'courseCount',
    title: 'Assignments',
    width: '150px',
    render: (value, item) => (
      <div className="text-sm text-gray-900 dark:text-gray-100">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span>{value || 0} courses</span>
        </div>
        {item.totalStudents > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {item.totalStudents} students
          </div>
        )}
      </div>
    )
  },
  {
    key: 'actions',
    title: 'Actions',
    width: '200px',
    type: 'actions',
    align: 'center',
    customActions: [
      {
        key: 'assign',
        icon: <Award className="w-4 h-4" />,
        title: 'Assign Courses',
        className: 'text-purple-600 hover:text-purple-800 hover:bg-purple-100 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900'
      }
    ]
  }
];

// Default configurations for different data types
export const tableConfigs = {
  course: courseTableColumns,
  category: categoryTableColumns,
  badge: badgeTableColumns
};

// Helper function to get configuration by type
export const getTableConfig = (type) => {
  return tableConfigs[type] || courseTableColumns;
};
