export interface HttpResponse<T> {
  isSuccess: boolean;
  data: T;
  errorMessage: string | null;
  statusCode: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail?: string;
  duration: number;
  lessons: number;
  enrolled: number;
  rating: number;
  instructor: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: number;
  order: number;
}

export interface Progress {
  userId: string;
  courseId: string;
  completedLessons: string[];
  percentage: number;
  lastAccessedAt: Date;
}
