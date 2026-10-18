import { Router, Request, Response } from 'express';
import { Database } from '../db.js';
import { authenticate } from './auth.js';
import { User } from '../types.js';

export const notificationsRouter = Router();

notificationsRouter.get('/', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as User | undefined;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const db = await Database.get();
  const userNotifs = db.notifications
    .filter(n => n.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = userNotifs.filter(n => !n.isRead).length;

  res.json({
    notifications: userNotifs,
    unreadCount,
  });
});

notificationsRouter.put('/:id/read', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as User | undefined;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  await Database.withLock((db) => {
    const notif = db.notifications.find(n => n.id === req.params.id && n.userId === user.id);
    if (notif) {
      notif.isRead = true;
    }
  });

  res.json({ success: true });
});

notificationsRouter.put('/mark-all-read', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as User | undefined;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  await Database.withLock((db) => {
    db.notifications
      .filter(n => n.userId === user.id)
      .forEach(n => {
        n.isRead = true;
      });
  });

  res.json({ success: true });
});
