'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { loadSettings, updateSettings, AppSettings } from '@/lib/settings';
import type { Category } from '@/types';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window === 'undefined') {
      return { periodStartDay: 1 };
    }
    return loadSettings();
  });
  const [periodStartDay, setPeriodStartDay] = useState(() => {
    if (typeof window === 'undefined') {
      return '1';
    }
    return settings.periodStartDay.toString();
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Category management state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#6B7280');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryColor, setEditCategoryColor] = useState('');

  useEffect(() => {
    setIsMounted(true);
    
    // Load settings and categories in parallel
    async function loadData() {
      if (!session?.user?.id) return;
      
      setIsLoadingCategories(true);
      
      try {
        // Load both in parallel
        const [settingsRes, categoriesRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/categories'),
        ]);

        // Handle settings
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setSettings({ periodStartDay: data.periodStartDay });
          setPeriodStartDay(data.periodStartDay.toString());
        } else {
          // Fallback to localStorage if API fails
          const current = loadSettings();
          setSettings(current);
          setPeriodStartDay(current.periodStartDay.toString());
        }

        // Handle categories
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to localStorage if API fails
        const current = loadSettings();
        setSettings(current);
        setPeriodStartDay(current.periodStartDay.toString());
      } finally {
        setIsLoadingCategories(false);
        setIsInitialLoad(false);
      }
    }

    loadData();
  }, [session?.user?.id]);

  const handleSave = async () => {
    const day = parseInt(periodStartDay, 10);
    if (day < 1 || day > 31) {
      setSaveMessage('Period start day must be between 1 and 31');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodStartDay: day }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const updated = await response.json();
      setSettings({ periodStartDay: updated.periodStartDay });
      setSaveMessage('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Failed to save settings');
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    }
  };

  const handleReset = async () => {
    setPeriodStartDay('1');
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodStartDay: 1 }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset settings');
      }

      const updated = await response.json();
      setSettings({ periodStartDay: updated.periodStartDay });
      setSaveMessage('Settings reset to default');
    } catch (error) {
      console.error('Error resetting settings:', error);
      setSaveMessage('Failed to reset settings');
    } finally {
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    }
  };

  // Category management functions
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          color: newCategoryColor,
        }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories([...categories, newCategory].sort((a, b) => a.order - b.order));
        setNewCategoryName('');
        setNewCategoryColor('#6B7280');
        setIsAddingCategory(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to create category');
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editCategoryName.trim()) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editCategoryName.trim(),
          color: editCategoryColor,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setCategories(categories.map(c => c.id === id ? updated : c).sort((a, b) => a.order - b.order));
        setEditingCategoryId(null);
        setEditCategoryName('');
        setEditCategoryColor('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone if the category has expenses.')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCategories(categories.filter(c => c.id !== id));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditCategoryName(category.name);
    setEditCategoryColor(category.color || '#6B7280');
  };

  const cancelEditing = () => {
    setEditingCategoryId(null);
    setEditCategoryName('');
    setEditCategoryColor('');
  };

  const userCategories = categories.filter(c => c.userId !== null);
  const globalCategories = categories.filter(c => c.userId === null);

  return (
    <div className="flex min-h-screen bg-accent-50">
      {/* Sidebar - Hidden on mobile */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen py-4 px-4 pb-20 sm:px-6 sm:py-6 lg:py-8 lg:px-8 lg:pb-8">
        <div className="max-w-4xl mx-auto opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards]">
          {isInitialLoad ? (
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-accent-100 rounded-lg w-48 mb-2"></div>
              <div className="h-4 bg-accent-100 rounded-lg w-64 mb-6"></div>
              <div className="h-64 bg-accent-100 rounded-lg"></div>
              <div className="h-96 bg-accent-100 rounded-lg"></div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-accent-900 mb-2">Settings</h1>
                <p className="text-accent-600">Configure your finance tracking preferences</p>
                <div className="h-1 w-24 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full mt-3"></div>
              </div>

          <div className="card mb-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-accent-900 mb-1">Period Configuration</h2>
              <p className="text-sm text-accent-600">
                Set the day when your financial period starts. For example, if you get paid on the 15th,
                set this to 15 to track from the 15th of one month to the 14th of the next.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-accent-700 mb-2">
                  Period Start Day
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={periodStartDay}
                    onChange={(e) => setPeriodStartDay(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave();
                    }}
                    className="input-field w-32"
                  />
                  <span className="text-sm text-accent-600">
                    (Day of month: 1-31)
                  </span>
                </div>
                {isMounted && (
                  <p className="text-xs text-accent-500 mt-2">
                    Current setting: Your periods run from day {settings.periodStartDay} to day {settings.periodStartDay - 1} of the next month
                  </p>
                )}
              </div>

              {saveMessage && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    saveMessage.includes('success') || saveMessage.includes('reset')
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {saveMessage}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary px-6 py-2"
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
                <button
                  onClick={handleReset}
                  className="btn-secondary px-6 py-2"
                >
                  Reset to Default (Day 1)
                </button>
              </div>
            </div>
          </div>

          {/* Category Management */}
          <div className="card mb-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-accent-900 mb-1">Expense Categories</h2>
              <p className="text-sm text-accent-600">
                Manage your expense categories. Add custom categories or use the default ones.
              </p>
            </div>

            {isLoadingCategories ? (
              <div className="space-y-6">
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-accent-100 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Add new category */}
                {isAddingCategory ? (
                  <div className="px-4 py-3 bg-gradient-to-br from-primary-50/50 to-white rounded-lg border-2 border-primary-200">
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={newCategoryColor}
                        onChange={(e) => setNewCategoryColor(e.target.value)}
                        className="w-12 h-12 rounded-lg border-2 border-accent-200 cursor-pointer flex-shrink-0"
                        title="Category color"
                      />
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddCategory();
                          if (e.key === 'Escape') {
                            setIsAddingCategory(false);
                            setNewCategoryName('');
                          }
                        }}
                        placeholder="Category name"
                        className="input-field flex-1 text-sm"
                        autoFocus
                      />
                      <button
                        onClick={handleAddCategory}
                        className="btn-success text-sm px-4 py-2 flex-shrink-0"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingCategory(false);
                          setNewCategoryName('');
                        }}
                        className="btn-secondary text-sm px-3 py-2 flex-shrink-0"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingCategory(true)}
                    className="w-full px-4 py-3 text-sm font-semibold text-primary-600 bg-gradient-to-br from-primary-50 to-white hover:from-primary-100 hover:to-primary-50 rounded-lg border-2 border-primary-200 hover:border-primary-300 transition-all duration-200 flex items-center justify-center gap-2 shadow-soft"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Custom Category
                  </button>
                )}

                {/* All Categories - Combined view */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-accent-900">All Categories</h3>
                    <span className="text-xs text-accent-500">
                      {categories.length} total
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Global categories first (read-only) */}
                    {globalCategories.map((category) => (
                      <div
                        key={category.id}
                        className="px-4 py-3 bg-gradient-to-br from-accent-50/50 to-white rounded-lg border border-accent-200 flex items-center gap-3 group"
                      >
                        <div
                          className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: category.color || '#6B7280' }}
                        />
                        <span className="flex-1 text-sm font-semibold text-accent-800">
                          {category.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-xs font-medium text-accent-600 bg-accent-100 rounded-md">
                            Default
                          </span>
                          <svg className="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                    ))}

                    {/* User categories (editable) */}
                    {userCategories.map((category) => (
                      <div
                        key={category.id}
                        className="px-4 py-3 bg-white rounded-lg border-2 border-accent-200 hover:border-primary-300 transition-all duration-200 flex items-center gap-3 group"
                      >
                        {editingCategoryId === category.id ? (
                          <>
                            <input
                              type="color"
                              value={editCategoryColor}
                              onChange={(e) => setEditCategoryColor(e.target.value)}
                              className="w-12 h-12 rounded-lg border-2 border-primary-300 cursor-pointer flex-shrink-0"
                            />
                            <input
                              type="text"
                              value={editCategoryName}
                              onChange={(e) => setEditCategoryName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdateCategory(category.id);
                                if (e.key === 'Escape') cancelEditing();
                              }}
                              className="input-field flex-1 text-sm border-primary-300 focus:border-primary-400"
                              autoFocus
                            />
                            <button
                              onClick={() => handleUpdateCategory(category.id)}
                              className="btn-success text-sm px-3 py-2 flex-shrink-0"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="btn-secondary text-sm px-3 py-2 flex-shrink-0"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <div
                              className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm"
                              style={{ backgroundColor: category.color || '#6B7280' }}
                            />
                            <span className="flex-1 text-sm font-semibold text-accent-800">
                              {category.name}
                            </span>
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => startEditing(category)}
                                className="px-2.5 py-1.5 text-xs font-medium bg-primary-400 text-white rounded-lg hover:bg-primary-500 active:scale-95 transition-all"
                                title="Edit category"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.id)}
                                className="px-2.5 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 active:scale-95 transition-all"
                                title="Delete category"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    {categories.length === 0 && (
                      <div className="text-center py-8 text-accent-400 text-sm">
                        No categories found. Add your first category above.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-accent-900 mb-1">About Periods</h2>
            </div>
            <div className="space-y-3 text-sm text-accent-700">
              <p>
                <strong className="text-accent-900">Why custom periods?</strong>
              </p>
              <p>
                Many people get paid on a specific day each month (like the 15th). Using custom periods
                allows you to track your finances from payday to payday, which often makes more sense
                than calendar months.
              </p>
              <div className="pt-3 border-t border-accent-200">
                <p className="font-medium text-accent-900 mb-2">Example:</p>
                <ul className="list-disc list-inside space-y-1 text-accent-600">
                  <li>If you set period start day to <strong>15</strong>, your periods will be:</li>
                  <li>Jan 15 - Feb 14, 2026</li>
                  <li>Feb 15 - Mar 14, 2026</li>
                  <li>Mar 15 - Apr 14, 2026</li>
                  <li>And so on...</li>
                </ul>
              </div>
              <div className="pt-3 border-t border-accent-200">
                <p className="text-xs text-accent-500">
                  <strong>Note:</strong> Changing the period start day will affect how your data is organized.
                  Existing data will be migrated automatically to the new period structure.
                </p>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </main>

      {/* Bottom Navigation - Mobile only */}
      <BottomNav />
    </div>
  );
}
