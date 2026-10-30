import { Router } from 'express';
import crypto from 'crypto';
import { db, User } from '../db.js';
import { AuthRequest, requireAuth } from '../auth.js';

export const quizRouter = Router();

function hasPremiumAccess(user?: User): boolean {
  if (!user) return false;
  if (user.role === 'admin' || user.email === 'aarthak21@gmail.com') return true;
  if (user.subscription.status !== 'active') return false;
  return user.subscription.plan === 'premium' || user.subscription.plan === 'trial';
}

// List all available quizzes
quizRouter.get('/', (req: AuthRequest, res) => {
  const isUserPremium = hasPremiumAccess(req.user);
  const quizzes = db.getQuizzes().map((q) => {
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
  res.json({ quizzes });
});

// Get quiz questions to start test (Answers hidden!)
quizRouter.get('/:id', (req: AuthRequest, res) => {
  const quiz = db.findQuizById(req.params.id);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  const isUserPremium = hasPremiumAccess(req.user);
  if (quiz.isPremium && !isUserPremium) {
    return res.status(403).json({
      error: 'This quiz is a Premium Mock Test. Please upgrade or activate free trial.',
      isLocked: true,
      requiresPremium: true,
    });
  }

  // Mask the correctAnswer and explanation before student submits
  const studentQuestions = quiz.questions.map((q) => ({
    id: q.id,
    questionEn: q.questionEn,
    questionHi: q.questionHi,
    questionMr: q.questionMr,
    optionsEn: q.optionsEn,
    optionsHi: q.optionsHi,
    optionsMr: q.optionsMr,
  }));

  res.json({
    quiz: {
      id: quiz.id,
      courseId: quiz.courseId,
      titleEn: quiz.titleEn,
      titleHi: quiz.titleHi,
      titleMr: quiz.titleMr,
      timeMinutes: quiz.timeMinutes,
      passingScore: quiz.passingScore,
      isPremium: quiz.isPremium,
      questions: studentQuestions,
    },
  });
});

// Submit quiz answers
quizRouter.post('/:id/submit', requireAuth, (req: AuthRequest, res) => {
  try {
    const quiz = db.findQuizById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const user = req.user!;
    const { answers, timeSpentSeconds } = req.body; // answers is an object: { [questionId: string]: number }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Answers must be provided as an object' });
    }

    let score = 0;
    const total = quiz.questions.length;
    const reviewDetails = quiz.questions.map((q) => {
      const selected = answers[q.id];
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) {
        score += 1;
      }
      return {
        id: q.id,
        questionEn: q.questionEn,
        questionHi: q.questionHi,
        questionMr: q.questionMr,
        optionsEn: q.optionsEn,
        optionsHi: q.optionsHi,
        optionsMr: q.optionsMr,
        selectedOption: selected !== undefined ? selected : null,
        correctOption: q.correctAnswer,
        isCorrect,
        explanationEn: q.explanationEn,
        explanationHi: q.explanationHi,
        explanationMr: q.explanationMr,
      };
    });

    const percentage = Math.round((score / total) * 100);
    const passed = score >= quiz.passingScore;
    const earnedPoints = score * 20;

    // Record user attempt
    const attempt = {
      id: `qa_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
      quizId: quiz.id,
      quizTitle: quiz.titleMr || quiz.titleEn,
      score,
      total,
      percentage,
      date: new Date().toISOString(),
      timeSpentSeconds: timeSpentSeconds || 60,
    };

    user.progress.quizAttempts.unshift(attempt);
    user.totalScore = (user.totalScore || 0) + earnedPoints;
    db.updateUser(user.id, { progress: user.progress, totalScore: user.totalScore });

    return res.json({
      score,
      total,
      percentage,
      passed,
      earnedPoints,
      totalScore: user.totalScore,
      review: reviewDetails,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Submission failed' });
  }
});

// Leaderboard endpoint
quizRouter.get('/leaderboard/top', (req, res) => {
  const { period } = req.query; // 'weekly' | 'monthly' | 'overall'

  const allUsers = db.getUsers().filter((u) => u.role === 'student' || u.role === 'admin');

  // Compute ranking by totalScore + completed quizzes
  const ranked = allUsers
    .map((u) => {
      const attempts = u.progress?.quizAttempts || [];
      const totalQuizzes = attempts.length;
      const avgScore =
        totalQuizzes > 0
          ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalQuizzes)
          : 0;

      return {
        id: u.id,
        name: u.name,
        targetCategory: u.targetCategory,
        targetExam: u.targetExam,
        totalScore: u.totalScore || 0,
        quizzesCompleted: totalQuizzes,
        avgScore,
        streak: u.streak || 1,
        isPremium: u.subscription?.plan === 'premium' || u.subscription?.plan === 'trial',
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 20)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  res.json({ leaderboard: ranked, period: period || 'overall' });
});
