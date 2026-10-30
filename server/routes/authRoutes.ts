import { Router } from 'express';
import crypto from 'crypto';
import { db, hashPassword, User } from '../db.js';
import { generateToken, requireAuth, AuthRequest, refreshSubscriptionStatus } from '../auth.js';

export const authRouter = Router();

// Register new user
authRouter.post('/register', (req, res) => {
  try {
    const { name, email, password, targetCategory, preferredLanguage, targetExam } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const now = new Date().toISOString();
    const isOwner = email.toLowerCase() === 'aarthak21@gmail.com';

    const newUser: User = {
      id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(password),
      role: isOwner ? 'admin' : 'student',
      preferredLanguage: preferredLanguage || 'mr',
      targetCategory: targetCategory || 'competitive',
      targetExam: targetExam || 'MPSC / General',
      subscription: {
        plan: isOwner ? 'premium' : 'free',
        status: 'active',
        autoRenew: false,
        premiumExpiresAt: isOwner ? '2099-12-31T23:59:59.000Z' : undefined,
      },
      bookmarks: { videos: [], notes: [] },
      progress: { completedVideos: [], quizAttempts: [] },
      streak: 1,
      totalScore: 0,
      lastActiveDate: now,
      createdAt: now,
    };

    db.addUser(newUser);
    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        preferredLanguage: newUser.preferredLanguage,
        targetCategory: newUser.targetCategory,
        targetExam: newUser.targetExam,
        subscription: newUser.subscription,
        streak: newUser.streak,
        totalScore: newUser.totalScore,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// Login
authRouter.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const hashedInput = hashPassword(password);
    if (user.passwordHash !== hashedInput) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Refresh streak and active date
    const today = new Date().toISOString().split('T')[0];
    const lastActive = user.lastActiveDate ? user.lastActiveDate.split('T')[0] : '';
    let newStreak = user.streak || 1;
    if (lastActive !== today) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      if (lastActive === yesterday) {
        newStreak += 1;
      }
      user.streak = newStreak;
      user.lastActiveDate = new Date().toISOString();
      db.updateUser(user.id, { streak: newStreak, lastActiveDate: user.lastActiveDate });
    }

    const updatedUser = refreshSubscriptionStatus(user);
    const token = generateToken(updatedUser);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        preferredLanguage: updatedUser.preferredLanguage,
        targetCategory: updatedUser.targetCategory,
        targetExam: updatedUser.targetExam,
        subscription: updatedUser.subscription,
        streak: updatedUser.streak,
        totalScore: updatedUser.totalScore,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// Get current user profile
authRouter.get('/me', requireAuth, (req: AuthRequest, res) => {
  const user = req.user!;
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      targetCategory: user.targetCategory,
      targetExam: user.targetExam,
      subscription: user.subscription,
      bookmarks: user.bookmarks,
      progress: user.progress,
      streak: user.streak,
      totalScore: user.totalScore,
      createdAt: user.createdAt,
    },
  });
});

// Update profile
authRouter.put('/profile', requireAuth, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { name, preferredLanguage, targetCategory, targetExam } = req.body;

    const updates: Partial<User> = {};
    if (name) updates.name = name.trim();
    if (preferredLanguage && ['mr', 'hi', 'en'].includes(preferredLanguage)) {
      updates.preferredLanguage = preferredLanguage;
    }
    if (targetCategory) updates.targetCategory = targetCategory;
    if (targetExam) updates.targetExam = targetExam;

    const updated = db.updateUser(user.id, updates);
    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
});

// Update language preference
authRouter.put('/language', requireAuth, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { language } = req.body;
    if (!['mr', 'hi', 'en'].includes(language)) {
      return res.status(400).json({ error: 'Valid language must be mr, hi, or en' });
    }

    const updated = db.updateUser(user.id, { preferredLanguage: language });
    res.json({ message: 'Language updated', preferredLanguage: updated?.preferredLanguage });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update language' });
  }
});
