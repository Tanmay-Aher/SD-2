import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface DecodedToken {
  id: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  iat: number;
  exp: number;
}

export interface AuthRequest extends Request {
  user?: DecodedToken;
}

// Middleware to verify JWT token
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    req.user = decoded;
    next();
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Middleware to check user role
export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

// Middleware for error handling
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
