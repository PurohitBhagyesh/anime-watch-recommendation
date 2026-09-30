import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'animesenpai_jwt_secret_dev_key_2026';

const generateToken = (userId: string, username: string, email: string) => {
  return jwt.sign({ id: userId, username, email }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const authController = {
  // Register new user
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, avatar, bio, favoriteGenre } = req.body;

      if (!username || !email) {
        res.status(400).json({ success: false, error: { message: 'Username and Email are required.' } });
        return;
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });

      if (existingUser) {
        res.status(409).json({ success: false, error: { message: 'Username or Email already registered.' } });
        return;
      }

      const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

      const newUser = await prisma.user.create({
        data: {
          username: username.trim(),
          email: email.trim().toLowerCase(),
          passwordHash,
          avatar: avatar || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80',
          bio: bio || 'Anime enthusiast tracking anime with AnimeSenpai.',
          favoriteGenre: favoriteGenre || 'Action',
        },
      });

      const token = generateToken(newUser.id, newUser.username, newUser.email);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            avatar: newUser.avatar,
            banner: newUser.banner,
            bio: newUser.bio,
            favoriteGenre: newUser.favoriteGenre,
            joinedDate: newUser.joinedDate,
          },
          token,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  // Login existing user
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { emailOrUsername, password } = req.body;

      if (!emailOrUsername) {
        res.status(400).json({ success: false, error: { message: 'Email or Username required.' } });
        return;
      }

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }],
        },
      });

      if (!user) {
        res.status(404).json({ success: false, error: { message: 'User account not found.' } });
        return;
      }

      if (user.passwordHash && password) {
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
          res.status(401).json({ success: false, error: { message: 'Invalid credentials.' } });
          return;
        }
      }

      const token = generateToken(user.id, user.username, user.email);

      // Compute quick stats
      const animeCount = await prisma.watchlistItem.count({ where: { userId: user.id } });
      const completedCount = await prisma.watchlistItem.count({ where: { userId: user.id, status: 'completed' } });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            banner: user.banner,
            bio: user.bio,
            favoriteGenre: user.favoriteGenre,
            joinedDate: user.joinedDate,
            animeWatchedCount: animeCount,
            completedCount,
          },
          token,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
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
            avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80',
            banner: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
            bio: 'Anime enthusiast exploring new seasonal gems and 90s classics.',
            favoriteGenre: 'Sci-Fi / Psychological',
          },
        });
      }

      const token = generateToken(demoUser.id, demoUser.username, demoUser.email);

      res.json({
        success: true,
        data: {
          user: demoUser,
          token,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
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
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            banner: user.banner,
            bio: user.bio,
            favoriteGenre: user.favoriteGenre,
            joinedDate: user.joinedDate,
            totalWatchlist: user._count.watchlistItems,
            totalReviews: user._count.reviews,
          },
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
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

      const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(username && { username: username.trim() }),
          ...(avatar !== undefined && { avatar }),
          ...(banner !== undefined && { banner }),
          ...(bio !== undefined && { bio }),
          ...(favoriteGenre !== undefined && { favoriteGenre }),
        },
      });

      res.json({
        success: true,
        data: { user: updated },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },
};
