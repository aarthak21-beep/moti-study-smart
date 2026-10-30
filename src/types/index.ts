export type Language = 'mr' | 'hi' | 'en';

export interface UserSubscription {
  plan: 'free' | 'trial' | 'premium';
  status: 'active' | 'expired';
  trialStartedAt?: string;
  trialExpiresAt?: string;
  premiumExpiresAt?: string;
  autoRenew: boolean;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  total: number;
  percentage: number;
  date: string;
  timeSpentSeconds: number;
}

export interface UserProgress {
  completedVideos: string[];
  quizAttempts: QuizAttempt[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  preferredLanguage: Language;
  targetCategory: string;
  targetExam?: string;
  subscription: UserSubscription;
  bookmarks?: {
    videos: string[];
    notes: string[];
  };
  progress?: UserProgress;
  streak: number;
  totalScore: number;
  createdAt?: string;
}

export interface Category {
  id: string;
  nameEn: string;
  nameHi: string;
  nameMr: string;
  icon: string;
  badge: string;
  descriptionEn: string;
  descriptionHi: string;
  descriptionMr: string;
}

export interface Course {
  id: string;
  titleEn: string;
  titleHi: string;
  titleMr: string;
  categoryId: string;
  grade: string;
  targetAudience: string;
  descriptionEn: string;
  descriptionHi: string;
  descriptionMr: string;
  thumbnail: string;
  isPremium: boolean;
  instructor: string;
  rating: number;
  totalStudents: number;
  tags: string[];
  createdAt: string;
}

export interface VideoLecture {
  id: string;
  courseId: string;
  titleEn: string;
  titleHi: string;
  titleMr: string;
  youtubeUrl: string;
  youtubeId: string;
  duration: string;
  order: number;
  isPremium: boolean;
  chapterName: string;
  summaryEn: string;
  summaryHi: string;
  summaryMr: string;
  isLocked?: boolean;
}

export interface PDFNote {
  id: string;
  courseId: string;
  titleEn: string;
  titleHi: string;
  titleMr: string;
  pages: number;
  size: string;
  isPremium: boolean;
  chapterName: string;
  downloadUrl: string;
  contentMarkdown: string;
  createdAt: string;
  isLocked?: boolean;
}

export interface QuizQuestion {
  id: string;
  questionEn: string;
  questionHi: string;
  questionMr: string;
  optionsEn: string[];
  optionsHi: string[];
  optionsMr: string[];
  correctAnswer?: number;
  explanationEn?: string;
  explanationHi?: string;
  explanationMr?: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  titleEn: string;
  titleHi: string;
  titleMr: string;
  timeMinutes: number;
  passingScore: number;
  isPremium: boolean;
  isLocked?: boolean;
  questionCount?: number;
  questions?: QuizQuestion[];
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  paymentId: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending';
  plan: string;
  signature?: string;
  createdAt: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  targetCategory: string;
  targetExam?: string;
  totalScore: number;
  quizzesCompleted: number;
  avgScore: number;
  streak: number;
  isPremium: boolean;
  rank: number;
}
