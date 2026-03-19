export interface User {
  id: number;
  name: string;
  calorieTarget: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
}

export interface FoodItem {
  id: number;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize: number;
  servingUnit: string;
  isCustom: boolean;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodLog {
  id: number;
  userId: number;
  foodItemId: number;
  logDate: string;
  meal: MealType;
  quantity: number;
  caloriesConsumed: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  foodItem: FoodItem;
}

export interface DailySummary {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  targets: { calories: number; protein: number; carbs: number; fat: number };
  percentages: { calories: number; protein: number; carbs: number; fat: number };
}

export interface HistoryEntry {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
