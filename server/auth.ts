import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db, User } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'moti_study_smart_jwt_secret_key_prod_2026';

export interface AuthRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;

    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return decoded;
  } catch {
    return null;
  }
}

// Automatically check and update trial / subscription expiration
export function refreshSubscriptionStatus(user: User): User {
  const now = new Date().getTime();
  let changed = false;

  if (user.subscription.plan === 'trial' && user.subscription.trialExpiresAt) {
    const trialEnd = new Date(user.subscription.trialExpiresAt).getTime();
    if (now > trialEnd && user.subscription.status === 'active') {
      user.subscription.status = 'expired';
      user.subscription.plan = 'free';
      changed = true;
    }
  }

  if (user.subscription.plan === 'premium' && user.subscription.premiumExpiresAt) {
    const premEnd = new Date(user.subscription.premiumExpiresAt).getTime();
    if (now > premEnd && user.subscription.status === 'active') {
      user.subscription.status = 'expired';
      user.subscription.plan = 'free';
      changed = true;
    }
  }

  if (changed) {
    db.updateUser(user.id, { subscription: user.subscription });
  }

  return user;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (decoded) {
    const user = db.findUserById(decoded.userId);
    if (user) {
      req.user = refreshSubscriptionStatus(user);
    }
  }
  next();
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please login.' });
  }
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please login.' });
  }
  if (req.user.role !== 'admin' && req.user.email !== 'aarthak21@gmail.com') {
    return res.status(403).json({ error: 'Admin access denied. Owner permissions required.' });
  }
  next();
}
