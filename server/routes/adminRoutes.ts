import { Router } from 'express';
import crypto from 'crypto';
import { db, Course, VideoLecture, PDFNote, Quiz, Category, User } from '../db.js';
import { AuthRequest, requireAdmin } from '../auth.js';

export const adminRouter = Router();

// Protect ALL admin routes with requireAdmin
adminRouter.use(requireAdmin);

// 1. App Statistics
adminRouter.get('/stats', (req: AuthRequest, res) => {
  const users = db.getUsers();
  const courses = db.getCourses();
  const videos = db.getVideos();
  const notes = db.getNotes();
  const quizzes = db.getQuizzes();
  const payments = db.getPayments();

  const totalStudents = users.filter((u) => u.role === 'student').length;
  const premiumUsers = users.filter(
    (u) =>
      u.subscription.status === 'active' &&
      (u.subscription.plan === 'premium' || u.subscription.plan === 'trial')
  ).length;

  const trialUsers = users.filter(
    (u) => u.subscription.status === 'active' && u.subscription.plan === 'trial'
  ).length;

  const totalRevenue = payments
    .filter((p) => p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalQuizAttempts = users.reduce(
    (sum, u) => sum + (u.progress?.quizAttempts?.length || 0),
    0
  );

  res.json({
    stats: {
      totalStudents,
      premiumUsers,
      trialUsers,
      totalRevenue,
      totalCourses: courses.length,
      totalVideos: videos.length,
      totalNotes: notes.length,
      totalQuizzes: quizzes.length,
      totalQuizAttempts,
      recentPaymentsCount: payments.length,
    },
  });
});

// 2. Manage Users
adminRouter.get('/users', (req: AuthRequest, res) => {
  const users = db.getUsers().map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    preferredLanguage: u.preferredLanguage,
    targetCategory: u.targetCategory,
    targetExam: u.targetExam,
    subscription: u.subscription,
    streak: u.streak,
    totalScore: u.totalScore,
    quizAttemptsCount: u.progress?.quizAttempts?.length || 0,
    completedVideosCount: u.progress?.completedVideos?.length || 0,
    createdAt: u.createdAt,
    lastActiveDate: u.lastActiveDate,
  }));
  res.json({ users });
});

// Update user role or subscription manually
adminRouter.put('/users/:id', (req: AuthRequest, res) => {
  const { role, plan, status, extendDays } = req.body;
  const user = db.findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const updates: Partial<User> = {};
  if (role && ['student', 'admin'].includes(role)) {
    updates.role = role;
  }

  if (plan || status || extendDays) {
    const sub = { ...user.subscription };
    if (plan) sub.plan = plan;
    if (status) sub.status = status;
    if (extendDays) {
      const baseDate = sub.premiumExpiresAt ? new Date(sub.premiumExpiresAt) : new Date();
      sub.premiumExpiresAt = new Date(
        baseDate.getTime() + Number(extendDays) * 24 * 60 * 60 * 1000
      ).toISOString();
      sub.plan = 'premium';
      sub.status = 'active';
    }
    updates.subscription = sub;
  }

  const updated = db.updateUser(user.id, updates);
  res.json({ message: 'User updated successfully', user: updated });
});

// Delete user
adminRouter.delete('/users/:id', (req: AuthRequest, res) => {
  const user = db.findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (user.email === 'aarthak21@gmail.com') {
    return res.status(400).json({ error: 'Cannot delete Owner Super Admin' });
  }

  db.deleteUser(user.id);
  res.json({ message: 'User deleted successfully' });
});

// 3. Manage Categories
adminRouter.get('/categories', (req, res) => {
  res.json({ categories: db.getCategories() });
});

adminRouter.post('/categories', (req, res) => {
  const { nameEn, nameHi, nameMr, icon, badge, descriptionEn, descriptionHi, descriptionMr } =
    req.body;
  if (!nameEn || !nameMr) {
    return res.status(400).json({ error: 'English and Marathi category names are required' });
  }

  const newCat: Category = {
    id: `cat_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
    nameEn,
    nameHi: nameHi || nameEn,
    nameMr,
    icon: icon || 'BookOpen',
    badge: badge || 'General',
    descriptionEn: descriptionEn || '',
    descriptionHi: descriptionHi || '',
    descriptionMr: descriptionMr || '',
  };

  db.addCategory(newCat);
  res.status(201).json({ message: 'Category added', category: newCat });
});

adminRouter.put('/categories/:id', (req, res) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Category not found' });
  res.json({ message: 'Category updated', category: updated });
});

adminRouter.delete('/categories/:id', (req, res) => {
  const deleted = db.deleteCategory(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Category not found' });
  res.json({ message: 'Category deleted' });
});

// 4. Manage Courses
adminRouter.post('/courses', (req, res) => {
  const {
    titleEn,
    titleHi,
    titleMr,
    categoryId,
    grade,
    targetAudience,
    descriptionEn,
    descriptionHi,
    descriptionMr,
    thumbnail,
    isPremium,
    instructor,
    tags,
  } = req.body;

  if (!titleEn || !categoryId) {
    return res.status(400).json({ error: 'Title and category are required' });
  }

  const newCourse: Course = {
    id: `crs_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    titleEn,
    titleHi: titleHi || titleEn,
    titleMr: titleMr || titleEn,
    categoryId,
    grade: grade || 'All Grades',
    targetAudience: targetAudience || 'General Students',
    descriptionEn: descriptionEn || '',
    descriptionHi: descriptionHi || '',
    descriptionMr: descriptionMr || '',
    thumbnail:
      thumbnail ||
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    isPremium: Boolean(isPremium),
    instructor: instructor || 'Moti Study Faculty',
    rating: 5.0,
    totalStudents: 1,
    tags: Array.isArray(tags) ? tags : ['General', 'Study'],
    createdAt: new Date().toISOString(),
  };

  db.addCourse(newCourse);
  res.status(201).json({ message: 'Course created', course: newCourse });
});

adminRouter.put('/courses/:id', (req, res) => {
  const updated = db.updateCourse(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Course not found' });
  res.json({ message: 'Course updated', course: updated });
});

adminRouter.delete('/courses/:id', (req, res) => {
  const deleted = db.deleteCourse(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Course not found' });
  res.json({ message: 'Course and related content deleted' });
});

// 5. Manage Videos (YouTube Lectures)
adminRouter.get('/videos', (req, res) => {
  const { courseId } = req.query;
  const videos = db.getVideos(courseId as string);
  res.json({ videos });
});

adminRouter.post('/videos', (req, res) => {
  const {
    courseId,
    titleEn,
    titleHi,
    titleMr,
    youtubeUrl,
    duration,
    order,
    isPremium,
    chapterName,
    summaryEn,
    summaryHi,
    summaryMr,
  } = req.body;

  if (!courseId || !titleEn || !youtubeUrl) {
    return res.status(400).json({ error: 'courseId, titleEn, and youtubeUrl are required' });
  }

  // Extract youtube video ID
  let youtubeId = 'dQw4w9WgXcQ';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = youtubeUrl.match(regExp);
  if (match && match[2].length === 11) {
    youtubeId = match[2];
  }

  const newVideo: VideoLecture = {
    id: `vid_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    courseId,
    titleEn,
    titleHi: titleHi || titleEn,
    titleMr: titleMr || titleEn,
    youtubeUrl,
    youtubeId,
    duration: duration || '20:00',
    order: Number(order) || 1,
    isPremium: Boolean(isPremium),
    chapterName: chapterName || 'General',
    summaryEn: summaryEn || '',
    summaryHi: summaryHi || '',
    summaryMr: summaryMr || '',
  };

  db.addVideo(newVideo);
  res.status(201).json({ message: 'Video added', video: newVideo });
});

adminRouter.put('/videos/:id', (req, res) => {
  const updates = { ...req.body };
  if (updates.youtubeUrl) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = updates.youtubeUrl.match(regExp);
    if (match && match[2].length === 11) {
      updates.youtubeId = match[2];
    }
  }

  const updated = db.updateVideo(req.params.id, updates);
  if (!updated) return res.status(404).json({ error: 'Video not found' });
  res.json({ message: 'Video updated', video: updated });
});

adminRouter.delete('/videos/:id', (req, res) => {
  const deleted = db.deleteVideo(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Video not found' });
  res.json({ message: 'Video deleted' });
});

// 6. Manage PDF Notes
adminRouter.get('/notes', (req, res) => {
  const { courseId } = req.query;
  const notes = db.getNotes(courseId as string);
  res.json({ notes });
});

adminRouter.post('/notes', (req, res) => {
  const {
    courseId,
    titleEn,
    titleHi,
    titleMr,
    pages,
    size,
    isPremium,
    chapterName,
    contentMarkdown,
  } = req.body;

  if (!courseId || !titleEn) {
    return res.status(400).json({ error: 'courseId and title are required' });
  }

  const id = `not_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const newNote: PDFNote = {
    id,
    courseId,
    titleEn,
    titleHi: titleHi || titleEn,
    titleMr: titleMr || titleEn,
    pages: Number(pages) || 10,
    size: size || '1.8 MB',
    isPremium: Boolean(isPremium),
    chapterName: chapterName || 'प्रकरण १',
    downloadUrl: `/api/notes/download/${id}`,
    contentMarkdown:
      contentMarkdown || `# ${titleMr || titleEn}\n\n## Moti Study Smart Notes\n\nStudy material details...`,
    createdAt: new Date().toISOString(),
  };

  db.addNote(newNote);
  res.status(201).json({ message: 'PDF Note added', note: newNote });
});

adminRouter.put('/notes/:id', (req, res) => {
  const updated = db.updateNote(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Note not found' });
  res.json({ message: 'Note updated', note: updated });
});

adminRouter.delete('/notes/:id', (req, res) => {
  const deleted = db.deleteNote(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Note not found' });
  res.json({ message: 'Note deleted' });
});

// 7. Manage Quizzes
adminRouter.get('/quizzes', (req, res) => {
  const { courseId } = req.query;
  const quizzes = db.getQuizzes(courseId as string);
  res.json({ quizzes });
});

adminRouter.post('/quizzes', (req, res) => {
  const { titleEn, titleHi, titleMr, courseId, timeMinutes, passingScore, isPremium, questions } =
    req.body;

  if (!titleEn || !courseId || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'title, courseId, and questions array are required' });
  }

  const newQuiz: Quiz = {
    id: `quiz_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    courseId,
    titleEn,
    titleHi: titleHi || titleEn,
    titleMr: titleMr || titleEn,
    timeMinutes: Number(timeMinutes) || 10,
    passingScore: Number(passingScore) || 3,
    isPremium: Boolean(isPremium),
    questions: questions.map((q: any, i: number) => ({
      id: q.id || `q_${Date.now()}_${i}`,
      questionEn: q.questionEn || '',
      questionHi: q.questionHi || q.questionEn || '',
      questionMr: q.questionMr || q.questionEn || '',
      optionsEn: q.optionsEn || ['Option A', 'Option B', 'Option C', 'Option D'],
      optionsHi: q.optionsHi || q.optionsEn || [],
      optionsMr: q.optionsMr || q.optionsEn || [],
      correctAnswer: Number(q.correctAnswer) || 0,
      explanationEn: q.explanationEn || '',
      explanationHi: q.explanationHi || '',
      explanationMr: q.explanationMr || '',
    })),
    createdAt: new Date().toISOString(),
  };

  db.addQuiz(newQuiz);
  res.status(201).json({ message: 'Quiz created', quiz: newQuiz });
});

adminRouter.put('/quizzes/:id', (req, res) => {
  const updated = db.updateQuiz(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Quiz not found' });
  res.json({ message: 'Quiz updated', quiz: updated });
});

adminRouter.delete('/quizzes/:id', (req, res) => {
  const deleted = db.deleteQuiz(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Quiz not found' });
  res.json({ message: 'Quiz deleted' });
});

// 8. View Payment Records
adminRouter.get('/payments', (req, res) => {
  const payments = db.getPayments();
  res.json({ payments });
});
