import type { Timestamp } from 'firebase/firestore';

export interface MealOption {
  description: string;
  protein: number;
  carbs: number;
  fats: number;
  other?: string;
}

export interface Meal {
  calories: number;
  options: {
    [optionId: string]: MealOption;
  };
}

export interface Diet {
  id?: string;
  isActive: boolean;
  clientId: string;
  trainerId: string;
  totalCalories: number;
  createdAt: Timestamp;
  meals: {
    [mealId: string]: Meal;
  };
}
