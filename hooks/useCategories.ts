import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import type { Category } from '@/types';

// Default categories (fallback if API fails)
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'default-fixed-essentials', name: 'Fixed/Essentials', color: '#3B82F6', order: 0 },
  { id: 'default-debt-card-payment', name: 'Debt/Card Payment', color: '#EF4444', order: 1 },
  { id: 'default-food', name: 'Food', color: '#10B981', order: 2 },
  { id: 'default-transport', name: 'Transport', color: '#F59E0B', order: 3 },
  { id: 'default-entertainment', name: 'Entertainment', color: '#8B5CF6', order: 4 },
  { id: 'default-health', name: 'Health', color: '#EC4899', order: 5 },
  { id: 'default-other', name: 'Other', color: '#6B7280', order: 6 },
];

const DEFAULT_CATEGORY_ID = 'default-other';

export function useCategories() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          // Fallback to defaults if API fails
          setCategories(DEFAULT_CATEGORIES);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback to defaults if API fails
        setCategories(DEFAULT_CATEGORIES);
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, [session?.user?.id]);

  // Find default category ID from actual categories (prefer "Other" category)
  const defaultCategoryId = useMemo(() => {
    const otherCategory = categories.find(c => c.name.toLowerCase() === 'other');
    return otherCategory?.id || (categories.length > 0 ? categories[categories.length - 1].id : DEFAULT_CATEGORY_ID);
  }, [categories]);

  return {
    categories,
    defaultCategoryId,
    isLoading,
  };
}
