import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { getJwtSecret } from '../config/env';
import { AuthRequest } from '../middleware/authMiddleware';

const JWT_SECRET = getJwtSecret();
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,24}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const generateToken = (userId: string, username: string, email: string) => {
  return jwt.sign({ id: userId, username, email }, JWT_SECRET, {
    expiresIn: '14d',
  });
};

const sanitizeUser = (user: {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  banner: string | null;
  bio: string | null;
  favoriteGenre: string | null;
  joinedDate: Date;
}) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  banner: user.banner,
  bio: user.bio,
  favoriteGenre: user.favoriteGenre,
  joinedDate: user.joinedDate,
});

export const authController = {
  // Register new user
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, avatar, bio, favoriteGenre } = req.body;

      if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
        res.status(400).json({ success: false, error: { message: 'Username, Email, and Password are required.' } });
        return;
      }

      const cleanUsername = username.trim();
      const cleanEmail = email.trim().toLowerCase();

      if (!USERNAME_REGEX.test(cleanUsername)) {
        res.status(400).json({
          success: false,
          error: { message: 'Username must be 3–24 characters using letters, numbers, dots, underscores, or hyphens.' },
        });
        return;
      }

      if (!EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 254) {
        res.status(400).json({ success: false, error: { message: 'Please provide a valid email address.' } });
        return;
      }

      if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
        res.status(400).json({
          success: false,
          error: { message: 'Password must be at least 8 characters and include both letters and numbers.' },
        });
        return;
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: cleanEmail }, { username: cleanUsername }],
        },
      });

      if (existingUser) {
        res.status(409).json({ success: false, error: { message: 'Username or Email already registered.' } });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const newUser = await prisma.user.create({
        data: {
          username: cleanUsername,
          email: cleanEmail,
          passwordHash,
          avatar: typeof avatar === 'string' ? avatar : '',
          bio: typeof bio === 'string' ? bio.trim().slice(0, 280) : 'Anime enthusiast tracking anime with AnimeSenpai.',
          favoriteGenre: typeof favoriteGenre === 'string' ? favoriteGenre : 'Action',
        },
      });

      const token = generateToken(newUser.id, newUser.username, newUser.email);

      res.status(201).json({
        success: true,
        data: {
          user: sanitizeUser(newUser),
          token,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: 'Unable to complete registration.' } });
    }
  },

  // Login existing user
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { emailOrUsername, password } = req.body;

      if (typeof emailOrUsername !== 'string' || !emailOrUsername.trim() || typeof password !== 'string' || !password) {
        res.status(400).json({ success: false, error: { message: 'Email or Username and Password are required.' } });
        return;
      }

      const identifier = emailOrUsername.trim();

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: identifier.toLowerCase() }, { username: identifier }],
        },
      });

      if (!user || !user.passwordHash) {
        res.status(401).json({ success: false, error: { message: 'Invalid credentials.' } });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ success: false, error: { message: 'Invalid credentials.' } });
        return;
      }

      const token = generateToken(user.id, user.username, user.email);

      // Compute quick stats
      const animeCount = await prisma.watchlistItem.count({ where: { userId: user.id } });
      const completedCount = await prisma.watchlistItem.count({ where: { userId: user.id, status: 'completed' } });

      res.json({
        success: true,
        data: {
          user: {
            ...sanitizeUser(user),
            animeWatchedCount: animeCount,
            completedCount,
          },
          token,
        },
      });
    } catch {
      res.status(500).json({ success: false, error: { message: 'Unable to complete login.' } });
    }
  },

  // Quick Demo Login
  async demoLogin(_req: Request, res: Response): Promise<void> {
    try {
      let demoUser = await prisma.user.findUnique({
        where: { id: 'usr_demo_101' },
      });

      if (!demoUser) {
        demoUser = await prisma.user.create({
          data: {
            id: 'usr_demo_101',
            username: 'OtakuMaster',
            email: 'otakumaster@animesenpai.io',
            avatar: '',
            banner: '',
            bio: 'Anime enthusiast exploring new seasonal gems and 90s classics.',
            favoriteGenre: 'Sci-Fi / Psychological',
          },
        });
      }

      const token = generateToken(demoUser.id, demoUser.username, demoUser.email);

      res.json({
        success: true,
        data: {
          user: sanitizeUser(demoUser),
          token,
        },
      });
    } catch {
      res.status(500).json({ success: false, error: { message: 'Demo login unavailable.' } });
    }
  },

  // Get current user profile
  async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          _count: {
            select: { watchlistItems: true, reviews: true },
          },
        },
      });

      if (!user) {
        res.status(404).json({ success: false, error: { message: 'User not found.' } });
        return;
      }

      res.json({
        success: true,
        data: {
          user: {
            ...sanitizeUser(user),
            totalWatchlist: user._count.watchlistItems,
            totalReviews: user._count.reviews,
          },
        },
      });
    } catch {
      res.status(500).json({ success: false, error: { message: 'Unable to load profile.' } });
    }
  },

  // Update profile
  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const { username, avatar, banner, bio, favoriteGenre } = req.body;

      if (username !== undefined) {
        if (typeof username !== 'string' || !USERNAME_REGEX.test(username.trim())) {
          res.status(400).json({
            success: false,
            error: { message: 'Username must be 3–24 characters using letters, numbers, dots, underscores, or hyphens.' },
          });
          return;
        }
      }

      const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(typeof username === 'string' && { username: username.trim() }),
          ...(typeof avatar === 'string' && { avatar }),
          ...(typeof banner === 'string' && { banner }),
          ...(typeof bio === 'string' && { bio: bio.trim().slice(0, 280) }),
          ...(typeof favoriteGenre === 'string' && { favoriteGenre }),
        },
      });

      res.json({
        success: true,
        data: { user: sanitizeUser(updated) },
      });
    } catch {
      res.status(500).json({ success: false, error: { message: 'Unable to update profile.' } });
    }
  },
};
