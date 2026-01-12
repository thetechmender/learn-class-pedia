# ClassPedia - Online Learning Platform

A modern React-based online learning platform featuring 3D animations, responsive design, and an intuitive user interface.

## Features

- **3D Animated Landing Page**: Interactive Three.js animations on the homepage
- **Course Browsing**: Browse and search through available courses
- **Video Learning**: Watch course videos with progress tracking
- **Responsive Design**: Fully responsive UI built with Tailwind CSS
- **Course Progress**: Track lesson completion and overall progress
- **Clean Navigation**: Intuitive navigation between courses and lessons

## Tech Stack

- **React**: Frontend framework
- **React Router**: Client-side routing
- **Three.js**: 3D graphics and animations
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers for Three.js
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## API Integration

The application now includes full API integration with the LearnLoop backend:

### API Features
- **GET /api/courses** - Fetch all courses
- **GET /api/courses/{id}** - Fetch course by ID
- **GET /api/courses/{id}/ai-content** - Fetch AI-generated course content (returns IDs)
- **GET /api/media/audio/{id}** - Stream audio file by ID
- **GET /api/media/image/{id}** - Stream image file by ID
- **POST /api/courses** - Create new course
- **PUT /api/courses/{id}** - Update existing course
- **DELETE /api/courses/{id}** - Delete course

### AI Content Features
The course detail page now includes AI-generated content with:
- **Interactive Lesson Text**: AI-generated content displayed as animated Three.js slides with:
  - Typewriter animation effects
  - 3D floating text with smooth transitions
  - Animated background with distortion effects
  - Auto-play functionality with customizable timing
  - Progress tracking and slide navigation
  - Accessibility-friendly text display
- **PowerPoint-Style Presentation**: Professional slide presentation with:
  - Multiple slide transition animations (slide, fade, zoom, flip, bounce)
  - Educational slide themes with gradient backgrounds
  - Auto-play mode with 6-second intervals
  - Fullscreen presentation mode
  - Slide thumbnails for quick navigation
  - Progress tracking and completion percentage
  - Different slide types (title, content, question, example, important)
  - Bullet point formatting for better readability
  - **Text-to-Speech Narration**: AI-powered voice narration with:
    - Automatic reading of slide content when slides change
    - Multiple voice options (English voices)
    - Adjustable speech rate (0.5x to 1.5x speed)
    - Audio on/off toggle
    - Skip narration functionality
    - Visual speaking indicator
    - Extended auto-play timing when audio is enabled
- **Audio Content**: Multiple audio segments with ID-based streaming
- **Course Slides**: Interactive slide viewer with ID-based image streaming
- **Media Streaming**: Secure media delivery through ID-based endpoints
- **Tabbed Interface**: Switch between lessons, AI content, and presentation modes
- **Debug Panel**: API testing, content structure analysis, and environment information
- **Fallback Handling**: Graceful handling when AI content is not available

### Media Streaming Architecture
- AI content API returns only IDs for audio and video resources
- Separate media endpoints serve actual files by ID
- Supports range requests for audio streaming
- Database-backed media resolution for security
- Cross-origin resource sharing (CORS) enabled
- Error handling and retry mechanisms for failed media loads

### API Response Structure
```json
{
  "lessonText": "AI-generated lesson content",
  "audios": [
    {
      "id": 1,
      "sequence": 1
    }
  ],
  "videos": [
    {
      "id": 1,
      "sequence": 1
    }
  ],
  "generatedAt": "2024-01-01T00:00:00Z"
}
```

### Configuration
1. Copy `.env.example` to `.env`
2. Update `REACT_APP_API_URL` to match your backend URL
3. Default: `https://localhost:7238/api`
4. Set `REACT_APP_DEBUG=true` to enable debug panel

### PowerPoint-Style Presentation Features
- **Professional Slide Animations**: 8 different transition effects including slide, fade, zoom, flip, and bounce
- **Educational Slide Themes**: Color-coded slide types with gradient backgrounds:
  - Title slides (blue-purple gradient)
  - Content slides (indigo-blue gradient)  
  - Question slides (green-teal gradient)
  - Example slides (orange-red gradient)
  - Important slides (red-pink gradient)
- **Interactive Controls**: Play/pause, reset, manual navigation, and fullscreen mode
- **Smart Content Processing**: Automatically formats text into educational bullet points
- **Progress Tracking**: Visual progress bar and completion percentage
- **Thumbnail Navigation**: Quick access to any slide via thumbnail preview
- **Fullscreen Mode**: Immersive presentation experience for teaching
- **Text-to-Speech Integration**: Browser-based speech synthesis with:
  - Automatic narration of slide content
  - Voice selection from available system voices
  - Speech rate control (0.5x to 1.5x speed)
  - Audio toggle and skip functionality
  - Visual indicators for active narration
  - Smart timing coordination with slide transitions

### Three.js Interactive Features
- **3D Landing Page**: Interactive sphere animation with floating text and particle effects
- **Interactive Lesson Text Viewer**: 
  - Animated 3D text slides with typewriter effects
  - Floating particle systems and distorted background spheres
  - Smooth camera controls with auto-rotation during playback
  - Real-time text animation with fade-in/fade-out transitions
  - Intelligent text processing that splits content into digestible slides
  - Auto-play mode with customizable slide timing
  - Manual navigation with progress tracking

### Debug Features
- **API Test Panel**: Test all endpoints with real-time results
- **AI Content Debugger**: Visualize content structure and IDs
- **Environment Information**: View configuration and runtime details
- **Media URL Generation**: Test audio and image URL generation

### Fallback System
- If API is unavailable, the app falls back to static sample data
- Visual indicator shows API connection status
- Graceful error handling with user-friendly messages

### Course Management
- Create new courses with code, title, description, and credit hours
- Edit existing courses inline
- Delete courses with confirmation
- Real-time updates without page refresh
- Search and filter functionality works with both API and fallback data

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx          # Navigation component
│   ├── CourseCard.jsx      # Course display card
│   ├── VideoPlayer.jsx     # Video player component
│   └── ThreeScene.jsx      # 3D animation scene
├── pages/
│   ├── Home.jsx            # Landing page with 3D animations
│   ├── Courses.jsx         # Course listing page
│   └── CourseDetail.jsx    # Individual course page
├── data/
│   └── courses.js          # Sample course data
└── App.js                  # Main app component
```

## Features Overview

### Home Page
- 3D animated hero section with floating elements
- Feature highlights
- Call-to-action sections

### Courses Page
- Course grid layout
- Search functionality
- Filter by difficulty level
- Course cards with ratings and details

### Course Detail Page
- Video player for lessons
- Lesson navigation sidebar
- Progress tracking
- Course information and instructor details

## Sample Data

The application includes sample courses with:
- React Fundamentals (Beginner)
- Advanced JavaScript (Advanced)
- Node.js Backend Development (Intermediate)

Each course includes multiple lessons with video content and descriptions.

## Customization

- Modify `src/data/courses.js` to add your own courses
- Update colors in `tailwind.config.js`
- Customize 3D animations in `src/components/ThreeScene.jsx`

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)