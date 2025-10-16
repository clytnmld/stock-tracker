import { Request, Response, NextFunction } from 'express';

export function sessionAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized: Please log in first' });
  }
  next();
}
