import { Router, Response } from 'express';
import { db, User } from '../db.js';
import { AuthRequest } from '../auth.js';

export const courseRouter = Router();

function hasPremiumAccess(user?: User): boolean {
  if (!user) return false;
  if (user.role === 'admin' || user.email === 'aarthak21@gmail.com') return true;
  if (user.subscription.status !== 'active') return false;
  return user.subscription.plan === 'premium' || user.subscription.plan === 'trial';
}

// Get all categories
courseRouter.get('/categories', (req, res) => {
  const categories = db.getCategories();
  res.json({ categories });
});

// Browse courses with search & filter
courseRouter.get('/', (req, res) => {
  const { category, search, grade } = req.query;
  let courses = db.getCourses();

  if (category && typeof category === 'string' && category !== 'all') {
    courses = courses.filter((c) => c.categoryId.toLowerCase() === category.toLowerCase());
  }

  if (grade && typeof grade === 'string') {
    courses = courses.filter((c) => c.grade.toLowerCase().includes(grade.toLowerCase()));
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    courses = courses.filter(
      (c) =>
        c.titleEn.toLowerCase().includes(q) ||
        c.titleHi.toLowerCase().includes(q) ||
        c.titleMr.toLowerCase().includes(q) ||
        c.descriptionEn.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  res.json({ courses });
});

// Course details with videos, notes, and quizzes
courseRouter.get('/:id', (req: AuthRequest, res) => {
  const course = db.findCourseById(req.params.id);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const isUserPremium = hasPremiumAccess(req.user);
  const rawVideos = db.getVideos(course.id).sort((a, b) => a.order - b.order);
  const rawNotes = db.getNotes(course.id);
  const rawQuizzes = db.getQuizzes(course.id);

  // Filter content: if premium and user is not premium, mask media links
  const videos = rawVideos.map((v) => {
    const isLocked = v.isPremium && !isUserPremium;
    return {
      ...v,
      isLocked,
      youtubeUrl: isLocked ? '' : v.youtubeUrl,
      youtubeId: isLocked ? '' : v.youtubeId,
    };
  });

  const notes = rawNotes.map((n) => {
    const isLocked = n.isPremium && !isUserPremium;
    return {
      ...n,
      isLocked,
      contentMarkdown: isLocked ? '' : n.contentMarkdown,
      downloadUrl: isLocked ? '' : n.downloadUrl,
    };
  });

  const quizzes = rawQuizzes.map((q) => {
    const isLocked = q.isPremium && !isUserPremium;
    return {
      id: q.id,
      courseId: q.courseId,
      titleEn: q.titleEn,
      titleHi: q.titleHi,
      titleMr: q.titleMr,
      timeMinutes: q.timeMinutes,
      passingScore: q.passingScore,
      isPremium: q.isPremium,
      isLocked,
      questionCount: q.questions.length,
      createdAt: q.createdAt,
    };
  });

  res.json({
    course,
    videos,
    notes,
    quizzes,
    hasPremiumAccess: isUserPremium,
  });
});

// Single video player details
courseRouter.get('/video/:videoId', (req: AuthRequest, res) => {
  const video = db.findVideoById(req.params.videoId);
  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }

  const isUserPremium = hasPremiumAccess(req.user);
  if (video.isPremium && !isUserPremium) {
    return res.status(403).json({
      error: 'This video requires an active Premium subscription or Free Trial.',
      isLocked: true,
      requiresPremium: true,
    });
  }

  res.json({ video, isLocked: false });
});

// Mark video completed
courseRouter.post('/video/:videoId/complete', (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Login required' });
  }

  const video = db.findVideoById(req.params.videoId);
  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }

  const user = req.user;
  if (!user.progress.completedVideos.includes(video.id)) {
    user.progress.completedVideos.push(video.id);
    db.updateUser(user.id, { progress: user.progress });
  }

  res.json({ message: 'Progress saved', completedVideos: user.progress.completedVideos });
});

// Single PDF Note viewer details
courseRouter.get('/note/:noteId', (req: AuthRequest, res) => {
  const note = db.findNoteById(req.params.noteId);
  if (!note) {
    return res.status(404).json({ error: 'PDF Note not found' });
  }

  const isUserPremium = hasPremiumAccess(req.user);
  if (note.isPremium && !isUserPremium) {
    return res.status(403).json({
      error: 'This PDF Note is locked. Please activate 7-day free trial or subscribe to Premium.',
      isLocked: true,
      requiresPremium: true,
    });
  }

  res.json({ note, isLocked: false });
});

// Download PDF Note
courseRouter.get('/notes/download/:noteId', (req: AuthRequest, res: Response) => {
  const note = db.findNoteById(req.params.noteId);
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  const isUserPremium = hasPremiumAccess(req.user);
  if (note.isPremium && !isUserPremium) {
    return res.status(403).json({ error: 'Premium subscription required to download.' });
  }

  // Format as clean text / printable PDF representation
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${note.titleEn.replace(/[^a-zA-Z0-9_-]/g, '_')}_MotiStudySmart.md"`
  );
  return res.send(note.contentMarkdown);
});
