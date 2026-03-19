import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/analytics/daily?userId=1&date=2026-03-18
router.get('/daily', async (req, res, next) => {
  try {
    const userId = Number(req.query.userId);
    const dateStr = String(req.query.date ?? new Date().toISOString().split('T')[0]);
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const d = new Date(dateStr);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);

    const [logs, user] = await Promise.all([
      prisma.foodLog.findMany({
        where: { userId, logDate: { gte: d, lt: next } },
      }),
      prisma.user.findUnique({ where: { id: userId } }),
    ]);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const totals = logs.reduce(
      (acc, l) => ({
        calories: +(acc.calories + l.caloriesConsumed).toFixed(1),
        protein: +(acc.protein + l.proteinConsumed).toFixed(1),
        carbs: +(acc.carbs + l.carbsConsumed).toFixed(1),
        fat: +(acc.fat + l.fatConsumed).toFixed(1),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    res.json({
      date: dateStr,
      ...totals,
      targets: {
        calories: user.calorieTarget,
        protein: user.proteinTarget,
        carbs: user.carbTarget,
        fat: user.fatTarget,
      },
      percentages: {
        calories: Math.round((totals.calories / user.calorieTarget) * 100),
        protein: Math.round((totals.protein / user.proteinTarget) * 100),
        carbs: Math.round((totals.carbs / user.carbTarget) * 100),
        fat: Math.round((totals.fat / user.fatTarget) * 100),
      },
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/analytics/history?userId=1&days=30
router.get('/history', async (req, res, next) => {
  try {
    const userId = Number(req.query.userId);
    const days = Number(req.query.days ?? 30);
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const logs = await prisma.foodLog.findMany({
      where: { userId, logDate: { gte: startDate, lte: endDate } },
      orderBy: { logDate: 'asc' },
    });

    // Group by date string
    const byDate: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {};
    for (const log of logs) {
      const key = log.logDate.toISOString().split('T')[0];
      if (!byDate[key]) byDate[key] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      byDate[key].calories = +(byDate[key].calories + log.caloriesConsumed).toFixed(1);
      byDate[key].protein = +(byDate[key].protein + log.proteinConsumed).toFixed(1);
      byDate[key].carbs = +(byDate[key].carbs + log.carbsConsumed).toFixed(1);
      byDate[key].fat = +(byDate[key].fat + log.fatConsumed).toFixed(1);
    }

    // Build array for every day in the range (fill zeros for missing days)
    const result = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const key = d.toISOString().split('T')[0];
      result.push({ date: key, ...(byDate[key] ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }) });
    }

    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
