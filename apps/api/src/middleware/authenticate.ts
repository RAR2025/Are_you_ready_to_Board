import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../lib/firebase-admin';
import { db } from '../db/client';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await firebaseAuth.verifyIdToken(token);

    const user = await db.query.users.findFirst({
      where: eq(users.firebaseUid, decodedToken.uid),
    });

    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: user.role,
      organizationId: user.organizationId,
      userId: user.id,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};