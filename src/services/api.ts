import { Course, Category, VideoLecture, PDFNote, Quiz, User, PaymentRecord, LeaderboardUser } from '../types';

const TOKEN_KEY = 'moti_auth_token';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data as T;
  },

  // Auth APIs
  async register(payload: {
    name: string;
    email: string;
    password: string;
    targetCategory?: string;
    preferredLanguage?: string;
    targetExam?: string;
  }) {
    const res = await this.request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    return res;
  },

  async login(payload: { email: string; password: string }) {
    const res = await this.request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    return res;
  },

  async getMe() {
    return this.request<{ user: User }>('/api/auth/me');
  },

  async updateProfile(updates: Partial<User>) {
    return this.request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async updateLanguage(language: string) {
    return this.request<{ preferredLanguage: string }>('/api/auth/language', {
      method: 'PUT',
      body: JSON.stringify({ language }),
    });
  },

  // Courses APIs
  async getCategories() {
    return this.request<{ categories: Category[] }>('/api/courses/categories');
  },

  async getCourses(params?: { category?: string; search?: string; grade?: string }) {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.grade) query.set('grade', params.grade);
    const qs = query.toString();
    return this.request<{ courses: Course[] }>(`/api/courses${qs ? `?${qs}` : ''}`);
  },

  async getCourseDetails(courseId: string) {
    return this.request<{
      course: Course;
      videos: VideoLecture[];
      notes: PDFNote[];
      quizzes: Quiz[];
      hasPremiumAccess: boolean;
    }>(`/api/courses/${courseId}`);
  },

  async getVideoDetails(videoId: string) {
    return this.request<{ video: VideoLecture; isLocked: boolean }>(`/api/courses/video/${videoId}`);
  },

  async markVideoCompleted(videoId: string) {
    return this.request<{ message: string; completedVideos: string[] }>(
      `/api/courses/video/${videoId}/complete`,
      { method: 'POST' }
    );
  },

  async getNoteDetails(noteId: string) {
    return this.request<{ note: PDFNote; isLocked: boolean }>(`/api/courses/note/${noteId}`);
  },

  // Quizzes APIs
  async getQuizzes() {
    return this.request<{ quizzes: Quiz[] }>('/api/quizzes');
  },

  async getQuizQuestions(quizId: string) {
    return this.request<{ quiz: Quiz }>(`/api/quizzes/${quizId}`);
  },

  async submitQuiz(quizId: string, answers: Record<string, number>, timeSpentSeconds: number) {
    return this.request<{
      score: number;
      total: number;
      percentage: number;
      passed: boolean;
      earnedPoints: number;
      totalScore: number;
      review: any[];
    }>(`/api/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers, timeSpentSeconds }),
    });
  },

  async getLeaderboard(period: 'weekly' | 'monthly' | 'overall' = 'overall') {
    return this.request<{ leaderboard: LeaderboardUser[]; period: string }>(
      `/api/quizzes/leaderboard/top?period=${period}`
    );
  },

  // Subscription APIs
  async getSubscriptionPlans() {
    return this.request<{ plans: any[]; razorpayKeyId: string }>('/api/subscription/plans');
  },

  async startFreeTrial() {
    return this.request<{ message: string; subscription: any; daysLeft: number }>(
      '/api/subscription/start-trial',
      { method: 'POST' }
    );
  },

  async createRazorpayOrder() {
    return this.request<{
      orderId: string;
      amount: number;
      amountInRupees: number;
      currency: string;
      keyId: string;
      user: { name: string; email: string };
    }>('/api/subscription/create-order', { method: 'POST' });
  },

  async verifyPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature?: string;
    isSimulation?: boolean;
  }) {
    return this.request<{ message: string; subscription: any; payment: PaymentRecord }>(
      '/api/subscription/verify-payment',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  // Bookmark APIs
  async getBookmarks() {
    return this.request<{
      videos: VideoLecture[];
      notes: PDFNote[];
      videoIds: string[];
      noteIds: string[];
    }>('/api/bookmarks');
  },

  async toggleVideoBookmark(videoId: string) {
    return this.request<{ message: string; isBookmarked: boolean }>(
      '/api/bookmarks/toggle-video',
      {
        method: 'POST',
        body: JSON.stringify({ videoId }),
      }
    );
  },

  async toggleNoteBookmark(noteId: string) {
    return this.request<{ message: string; isBookmarked: boolean }>(
      '/api/bookmarks/toggle-note',
      {
        method: 'POST',
        body: JSON.stringify({ noteId }),
      }
    );
  },

  // Admin APIs
  async getAdminStats() {
    return this.request<{ stats: any }>('/api/admin/stats');
  },

  async getAdminUsers() {
    return this.request<{ users: any[] }>('/api/admin/users');
  },

  async updateAdminUser(userId: string, data: any) {
    return this.request<{ user: any }>(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteAdminUser(userId: string) {
    return this.request<{ message: string }>(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  async addAdminCourse(courseData: any) {
    return this.request<{ course: Course }>('/api/admin/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  },

  async updateAdminCourse(courseId: string, courseData: any) {
    return this.request<{ course: Course }>(`/api/admin/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  },

  async deleteAdminCourse(courseId: string) {
    return this.request<{ message: string }>(`/api/admin/courses/${courseId}`, {
      method: 'DELETE',
    });
  },

  async addAdminVideo(videoData: any) {
    return this.request<{ video: VideoLecture }>('/api/admin/videos', {
      method: 'POST',
      body: JSON.stringify(videoData),
    });
  },

  async updateAdminVideo(videoId: string, videoData: any) {
    return this.request<{ video: VideoLecture }>(`/api/admin/videos/${videoId}`, {
      method: 'PUT',
      body: JSON.stringify(videoData),
    });
  },

  async deleteAdminVideo(videoId: string) {
    return this.request<{ message: string }>(`/api/admin/videos/${videoId}`, {
      method: 'DELETE',
    });
  },

  async addAdminNote(noteData: any) {
    return this.request<{ note: PDFNote }>('/api/admin/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  },

  async updateAdminNote(noteId: string, noteData: any) {
    return this.request<{ note: PDFNote }>(`/api/admin/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  },

  async deleteAdminNote(noteId: string) {
    return this.request<{ message: string }>(`/api/admin/notes/${noteId}`, {
      method: 'DELETE',
    });
  },

  async addAdminQuiz(quizData: any) {
    return this.request<{ quiz: Quiz }>('/api/admin/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  },

  async deleteAdminQuiz(quizId: string) {
    return this.request<{ message: string }>(`/api/admin/quizzes/${quizId}`, {
      method: 'DELETE',
    });
  },

  async getAdminPayments() {
    return this.request<{ payments: PaymentRecord[] }>('/api/admin/payments');
  },
};
