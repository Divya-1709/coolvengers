import { Router, Request, Response } from 'express';
import { Database } from '../db.js';
import { authenticate, requireRole } from './auth.js';

export const auditRouter = Router();

auditRouter.get('/', authenticate, requireRole('SUPER_ADMIN'), async (req: Request, res: Response) => {
  const { search, entityType, limit } = req.query;
  const db = await Database.get();

  let logs = [...db.auditLogs];

  if (entityType && entityType !== 'ALL') {
    logs = logs.filter(l => l.entityType === entityType);
  }

  if (search) {
    const term = String(search).toLowerCase();
    logs = logs.filter(l =>
      l.details.toLowerCase().includes(term) ||
      l.actorName.toLowerCase().includes(term) ||
      l.action.toLowerCase().includes(term) ||
      l.entityId.toLowerCase().includes(term)
    );
  }

  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (limit) {
    logs = logs.slice(0, Number(limit));
  }

  res.json({ logs });
});
