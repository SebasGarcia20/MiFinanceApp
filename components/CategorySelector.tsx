'use client';

import { useState, useRef, useEffect } from 'react';
import type { Category } from '@/types';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelect: (categoryId: string) => void;
  defaultCategoryId: string;
}

export default function CategorySelector({
  categories,
  selectedCategoryId,
  onSelect,
  defaultCategoryId,
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId) || 
    categories.find(c => c.id === defaultCategoryId) ||
    categories[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected category chip */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 sm:h-10 flex items-center justify-between gap-2 px-3 py-2 rounded-lg border-2 bg-white hover:border-primary-400 transition-all duration-200 text-sm sm:text-xs shadow-sm"
        style={{
          borderColor: selectedCategory?.color || '#6B7280',
          backgroundColor: selectedCategory?.color ? `${selectedCategory.color}08` : 'white',
        }}
      >
        <div className="flex items-center gap-2">
          {selectedCategory?.color && (
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: selectedCategory.color }}
            />
          )}
          <span className="font-semibold text-accent-800">{selectedCategory?.name || 'Other'}</span>
        </div>
        <svg
          className={`w-3.5 h-3.5 text-accent-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-48 bg-white rounded-lg shadow-soft-lg border border-accent-200 overflow-hidden animate-scale-in">
          <div className="max-h-60 overflow-y-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  onSelect(category.id);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-accent-50 transition-colors ${
                  selectedCategoryId === category.id ? 'bg-primary-50' : ''
                }`}
              >
                {category.color && (
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                )}
                <span className="font-medium text-accent-800">{category.name}</span>
                {selectedCategoryId === category.id && (
                  <svg className="w-3 h-3 text-primary-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
