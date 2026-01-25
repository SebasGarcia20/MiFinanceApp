import { useState, useEffect } from 'react';
import type { Category } from '@/types';

// Default categories (matches seed data)
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'default-fixed-essentials', name: 'Fixed/Essentials', color: '#3B82F6', order: 0 },
  { id: 'default-debt-card-payment', name: 'Debt/Card Payment', color: '#EF4444', order: 1 },
  { id: 'default-food', name: 'Food', color: '#10B981', order: 2 },
  { id: 'default-transport', name: 'Transport', color: '#F59E0B', order: 3 },
  { id: 'default-entertainment', name: 'Entertainment', color: '#8B5CF6', order: 4 },
  { id: 'default-health', name: 'Health', color: '#EC4899', order: 5 },
  { id: 'default-other', name: 'Other', color: '#6B7280', order: 6 },
];

const CATEGORIES_KEY = 'categories';
const DEFAULT_CATEGORY_ID = 'default-other';

function loadCategories(): Category[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  
  const stored = localStorage.getItem(CATEGORIES_KEY);
  if (!stored) return DEFAULT_CATEGORIES;
  
  try {
    const parsed = JSON.parse(stored) as Category[];
    // Merge with defaults to ensure all defaults exist
    const defaultMap = new Map(DEFAULT_CATEGORIES.map(c => [c.id, c]));
    parsed.forEach(c => defaultMap.set(c.id, c));
    return Array.from(defaultMap.values()).sort((a, b) => a.order - b.order);
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

function saveCategories(categories: Category[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(() => loadCategories());

  useEffect(() => {
    setCategories(loadCategories());
  }, []);

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: `category-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    const updated = [...categories, newCategory].sort((a, b) => a.order - b.order);
    setCategories(updated);
    saveCategories(updated);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    const updated = categories.map(c => c.id === id ? { ...c, ...updates } : c);
    setCategories(updated);
    saveCategories(updated);
  };

  const deleteCategory = (id: string) => {
    // Don't allow deleting default categories
    if (id.startsWith('default-')) return;
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    saveCategories(updated);
  };

  return {
    categories,
    defaultCategoryId: DEFAULT_CATEGORY_ID,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
