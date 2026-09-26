import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'voltaku_jwt_secret_dev_key_2026';

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: { message: 'Authentication token required.' },
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      username: string;
      email: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired authentication token.' },
    });
  }
};

export const optionalAuth = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        username: string;
        email: string;
      };
      req.user = decoded;
    } catch {
      // Ignore invalid optional tokens
    }
  }

  next();
};
