import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// GET /api/users
router.get('/', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { id: 'asc' } });
    res.json(users);
  } catch (e) {
    next(e);
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e) {
    next(e);
  }
});

const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  calorieTarget: z.number().positive().optional(),
  proteinTarget: z.number().nonnegative().optional(),
  carbTarget: z.number().nonnegative().optional(),
  fatTarget: z.number().nonnegative().optional(),
});

// PUT /api/users/:id
router.put('/:id', async (req, res, next) => {
  try {
    const body = UpdateUserSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: body,
    });
    res.json(user);
  } catch (e) {
    next(e);
  }
});

export default router;
