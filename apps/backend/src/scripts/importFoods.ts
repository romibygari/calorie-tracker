/**
 * Food import script.
 * Usage: npx tsx src/scripts/importFoods.ts [path/to/foods.csv]
 * Default path: data/foods.csv
 *
 * CSV format (headers required):
 *   name,brand,calories,protein,carbs,fat,fiber,servingSize,servingUnit
 *
 * JSON format: array of objects with the same fields.
 */
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

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

async function main() {
  const filePath = process.argv[2] ?? path.join(__dirname, '../../data/foods.csv');

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const ext = path.extname(filePath).toLowerCase();

  let rows: unknown[];
  if (ext === '.json') {
    rows = JSON.parse(raw);
  } else {
    rows = parse(raw, { columns: true, skip_empty_lines: true, trim: true });
  }

  let imported = 0;
  const errors: string[] = [];

  const validRows = [];
  for (let i = 0; i < rows.length; i++) {
    const result = FoodRowSchema.safeParse(rows[i]);
    if (result.success) {
      validRows.push(result.data);
    } else {
      errors.push(`Row ${i + 1}: ${result.error.message}`);
    }
  }

  if (validRows.length > 0) {
    const result = await prisma.foodItem.createMany({
      data: validRows,
      skipDuplicates: false,
    });
    imported = result.count;
  }

  console.log(`Import complete: ${imported} items imported, ${errors.length} skipped.`);
  if (errors.length > 0) {
    console.log('Errors:', errors.slice(0, 10));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
