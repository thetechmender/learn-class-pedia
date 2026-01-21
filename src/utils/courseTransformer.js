import { Video, Headphones, FileCode, Brain, Rocket, Clock4, Award } from 'lucide-react';
import { cleanHtmlContent, estimateDuration } from './htmlCleaner';

// Map section types to readable titles
const sectionTypeToTitle = {
    'introduction': 'Introduction',
    'mainTopicEarly': 'Foundational Concepts',
    'mainTopicMid': 'Core Topics',
    'mainTopicAdvanced': 'Advanced Topics',
    'facts': 'Key Facts & Data',
    'summary': 'Summary',
    'conclusion': 'Conclusion'
};

/**
 * Process lecture sections into slide format text
 * @param {Array} sections - Array of section objects
 * @returns {string} - Formatted slide text
 */
const processLectureSections = (sections) => {
    // Sort by sectionOrder
    const sortedSections = [...sections].sort((a, b) => a.sectionOrder - b.sectionOrder);
    
    let text = '';
    sortedSections.forEach(section => {
        const { title, content } = cleanHtmlContent(section.content);
        const sectionTitle = title || sectionTypeToTitle[section.sectionType] || section.sectionType;
        text += `\n[SLIDE]: ${sectionTitle}\n`;
        text += content + '\n';
    });
    
    return text.trim() || '[SLIDE]: Content\n\nNo content available for this section.';
};

/**
 * Format date to relative time string
 * @param {string} dateString - ISO date string
 * @returns {string} - Relative time like "2 weeks ago"
 */
const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
};

/**
 * Transform lecture sections and course details into LinkedIn-style course structure
 * 
 * @param {Array} lectureSections - Array of lecture section objects from API
 * @param {Object} courseDetails - Course details from API (optional)
 * @param {Object} lectureDetailsMap - Map of lectureId -> lecture details (optional)
 * @returns {Object|null} - Transformed course data or null if invalid
 */
export const transformApiResponse = (lectureSections, courseDetails = null, lectureDetailsMap = {}) => {
    if (!lectureSections || !Array.isArray(lectureSections) || lectureSections.length === 0) return null;

    const courseId = courseDetails?.id || 1;

    // Group sections by lectureId
    const lectureGroups = lectureSections.reduce((acc, section) => {
        const lectureId = section.lectureId;
        if (!acc[lectureId]) {
            acc[lectureId] = [];
        }
        acc[lectureId].push(section);
        return acc;
    }, {});

    // Transform lectures from grouped sections
    const lectureIds = Object.keys(lectureGroups);
    const transformedLectures = lectureIds.map((lectureId, index) => {
        const sections = lectureGroups[lectureId];
        const firstSection = sections[0];
        const allContent = sections.map(s => s.content).join(' ');
        const lectureDetail = lectureDetailsMap[lectureId] || {};
        
        // Try to extract lecture title from first section's h2 or use API data
        const h2Match = firstSection.content?.match(/<h2>(.*?)<\/h2>/i);
        const lectureTitle = lectureDetail.title || (h2Match ? h2Match[1] : `Lecture ${index + 1}`);
        
        return {
            id: lectureId,
            title: lectureTitle,
            duration: lectureDetail.duration || estimateDuration(allContent),
            completed: false,
            content: processLectureSections(sections),
            lectureNumber: lectureDetail.lectureNumber || index + 1,
            hasVideo: lectureDetail.hasVideo ?? true,
            hasResources: lectureDetail.hasResources ?? false,
            hasQuiz: lectureDetail.hasQuiz ?? false,
            icon: [Video, Headphones, FileCode, Brain][index % 4],
            studentCount: lectureDetail.studentCount || 0
        };
    });

    // Calculate total duration
    const totalMinutes = transformedLectures.reduce((acc, l) => {
        const mins = parseInt(l.duration) || 5;
        return acc + mins;
    }, 0);

    // Create chapter structure
    const chapters = [{
        id: `chapter-course-${courseId}`,
        title: 'Course Content',
        duration: `${totalMinutes}m`,
        lectures: transformedLectures,
        project: true,
        certificate: true
    }];

    // Use course details from API or fallback to defaults
    return {
        id: courseId,
        title: courseDetails?.title || transformedLectures[0]?.title || 'Course',
        courseCode: courseDetails?.courseCode || `COURSE-${courseId}`,
        instructor: courseDetails?.instructor || 'Instructor',
        instructorTitle: courseDetails?.instructorTitle || 'Course Instructor',
        duration: `${totalMinutes}m`,
        level: courseDetails?.level || 'Professional',
        description: courseDetails?.description || 'Course content',
        chapters,
        rating: courseDetails?.rating || 0,
        reviews: courseDetails?.reviews || 0,
        students: courseDetails?.students || 0,
        lastUpdated: formatRelativeTime(courseDetails?.lastUpdated),
        language: courseDetails?.language || 'English',
        category: courseDetails?.category || 'Education',
        difficulty: courseDetails?.difficulty || 'Intermediate',
        includes: courseDetails?.includes || [],
        instructorImage: courseDetails?.instructorImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(courseDetails?.instructor || 'Instructor')}&background=6366f1&color=fff`,
        badges: courseDetails?.badges || [],
        achievements: [
            { name: 'Fast Track', icon: Rocket, color: 'text-blue-400' },
            { name: 'Consistent Learner', icon: Clock4, color: 'text-indigo-400' },
            { name: 'Top Performer', icon: Award, color: 'text-orange-400' }
        ]
    };
};
