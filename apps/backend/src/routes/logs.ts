import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// GET /api/logs?userId=1&date=2026-03-18
// GET /api/logs?userId=1&startDate=2026-03-01&endDate=2026-03-31
router.get('/', async (req, res, next) => {
  try {
    const userId = Number(req.query.userId);
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    let where: Record<string, unknown> = { userId };

    if (req.query.date) {
      const d = new Date(String(req.query.date));
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      where.logDate = { gte: d, lt: next };
    } else if (req.query.startDate && req.query.endDate) {
      where.logDate = {
        gte: new Date(String(req.query.startDate)),
        lte: new Date(String(req.query.endDate)),
      };
    }

    const logs = await prisma.foodLog.findMany({
      where,
      include: { foodItem: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(logs);
  } catch (e) {
    next(e);
  }
});

const CreateLogSchema = z.object({
  userId: z.number().positive(),
  foodItemId: z.number().positive(),
  logDate: z.string(), // YYYY-MM-DD
  meal: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  quantity: z.number().positive(),
});

// POST /api/logs
router.post('/', async (req, res, next) => {
  try {
    const body = CreateLogSchema.parse(req.body);

    const food = await prisma.foodItem.findUnique({ where: { id: body.foodItemId } });
    if (!food) return res.status(404).json({ error: 'Food item not found' });

    // Compute macros: quantity is in servings (1 serving = food.servingSize)
    const ratio = body.quantity / food.servingSize;
    const log = await prisma.foodLog.create({
      data: {
        userId: body.userId,
        foodItemId: body.foodItemId,
        logDate: new Date(body.logDate),
        meal: body.meal,
        quantity: body.quantity,
        caloriesConsumed: +(food.calories * ratio).toFixed(1),
        proteinConsumed: +(food.protein * ratio).toFixed(1),
        carbsConsumed: +(food.carbs * ratio).toFixed(1),
        fatConsumed: +(food.fat * ratio).toFixed(1),
      },
      include: { foodItem: true },
    });
    res.status(201).json(log);
  } catch (e) {
    next(e);
  }
});

const UpdateLogSchema = z.object({
  meal: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
  quantity: z.number().positive().optional(),
});

// PUT /api/logs/:id
router.put('/:id', async (req, res, next) => {
  try {
    const body = UpdateLogSchema.parse(req.body);
    const existing = await prisma.foodLog.findUnique({
      where: { id: Number(req.params.id) },
      include: { foodItem: true },
    });
    if (!existing) return res.status(404).json({ error: 'Log not found' });

    const quantity = body.quantity ?? existing.quantity;
    const food = existing.foodItem;
    const ratio = quantity / food.servingSize;

    const log = await prisma.foodLog.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(body.meal ? { meal: body.meal } : {}),
        quantity,
        caloriesConsumed: +(food.calories * ratio).toFixed(1),
        proteinConsumed: +(food.protein * ratio).toFixed(1),
        carbsConsumed: +(food.carbs * ratio).toFixed(1),
        fatConsumed: +(food.fat * ratio).toFixed(1),
      },
      include: { foodItem: true },
    });
    res.json(log);
  } catch (e) {
    next(e);
  }
});

// DELETE /api/logs/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.foodLog.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
