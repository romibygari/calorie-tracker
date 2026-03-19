import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import multer from 'multer';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const router = Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/foods?search=...&isCustom=true
router.get('/', async (req, res, next) => {
  try {
    const search = String(req.query.search ?? '');
    const isCustom = req.query.isCustom === 'true' ? true : undefined;

    const foods = await prisma.foodItem.findMany({
      where: {
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
        ...(isCustom !== undefined ? { isCustom } : {}),
      },
      orderBy: { name: 'asc' },
      take: 50,
    });
    res.json(foods);
  } catch (e) {
    next(e);
  }
});

// GET /api/foods/:id
router.get('/:id', async (req, res, next) => {
  try {
    const food = await prisma.foodItem.findUnique({ where: { id: Number(req.params.id) } });
    if (!food) return res.status(404).json({ error: 'Food not found' });
    res.json(food);
  } catch (e) {
    next(e);
  }
});

const FoodSchema = z.object({
  name: z.string().min(1),
  brand: z.string().optional(),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  fiber: z.number().nonnegative().default(0),
  servingSize: z.number().positive().default(100),
  servingUnit: z.string().default('g'),
  createdBy: z.number().optional(),
});

// POST /api/foods
router.post('/', async (req, res, next) => {
  try {
    const body = FoodSchema.parse(req.body);
    const food = await prisma.foodItem.create({
      data: { ...body, isCustom: true },
    });
    res.status(201).json(food);
  } catch (e) {
    next(e);
  }
});

// PUT /api/foods/:id
router.put('/:id', async (req, res, next) => {
  try {
    const body = FoodSchema.partial().parse(req.body);
    const food = await prisma.foodItem.update({
      where: { id: Number(req.params.id) },
      data: body,
    });
    res.json(food);
  } catch (e) {
    next(e);
  }
});

// DELETE /api/foods/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.foodItem.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

const FoodRowSchema = z.object({
  name: z.string().min(1),
  brand: z.string().optional(),
  calories: z.coerce.number().nonnegative(),
  protein: z.coerce.number().nonnegative(),
  carbs: z.coerce.number().nonnegative(),
  fat: z.coerce.number().nonnegative(),
  fiber: z.coerce.number().nonnegative().default(0),
  servingSize: z.coerce.number().positive().default(100),
  servingUnit: z.string().default('g'),
});

// POST /api/foods/import  (multipart file upload)
router.post('/import', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const content = req.file.buffer.toString('utf-8');
    const ext = (req.file.originalname.split('.').pop() ?? '').toLowerCase();

    let rows: unknown[];
    if (ext === 'json') {
      rows = JSON.parse(content);
    } else {
      rows = parse(content, { columns: true, skip_empty_lines: true, trim: true });
    }

    const validRows = [];
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const result = FoodRowSchema.safeParse(rows[i]);
      if (result.success) {
        validRows.push(result.data);
      } else {
        errors.push(`Row ${i + 1}: ${result.error.issues[0].message}`);
      }
    }

    const { count } = await prisma.foodItem.createMany({
      data: validRows,
      skipDuplicates: false,
    });

    res.json({ imported: count, skipped: errors.length, errors: errors.slice(0, 10) });
  } catch (e) {
    next(e);
  }
});

export default router;
