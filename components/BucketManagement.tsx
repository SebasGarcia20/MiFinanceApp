'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { BucketConfig, BucketType } from '@/types';
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice';

const BUCKET_TYPE_OPTIONS: { value: BucketType; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
];

interface BucketTypeSelectProps {
  value: BucketType;
  onChange: (value: BucketType) => void;
  id?: string;
  className?: string;
}

function BucketTypeSelect({ value, onChange, id, className = '' }: BucketTypeSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const label = BUCKET_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Bucket type"
        className="input-field w-full text-left flex items-center justify-between gap-2 text-base sm:text-sm min-h-[44px] sm:min-h-0"
      >
        <span>{label}</span>
        <svg
          className={`w-5 h-5 flex-shrink-0 text-accent-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1 py-1 bg-white border border-accent-200 rounded-lg shadow-soft-lg overflow-hidden"
        >
          {BUCKET_TYPE_OPTIONS.map((opt) => (
            <li key={opt.value} role="option" aria-selected={value === opt.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 sm:py-2 text-base sm:text-sm min-h-[44px] sm:min-h-0 flex items-center gap-2 transition-colors [touch-action:manipulation] ${
                  value === opt.value
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-accent-800 hover:bg-accent-50 active:bg-accent-100'
                }`}
              >
                <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                  {value === opt.value && (
                    <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                <span>{opt.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface BucketManagementProps {
  buckets: BucketConfig[];
  onAdd: (config: Omit<BucketConfig, 'id' | 'order'> & { order?: number }) => void;
  onUpdate: (id: string, updates: Partial<BucketConfig>) => void;
  onDelete: (id: string) => void;
  onReorder: (configs: BucketConfig[]) => void;
}

export default function BucketManagement({
  buckets,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
}: BucketManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const isTouch = useIsTouchDevice();

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newBuckets = [...buckets];
    const draggedItem = newBuckets[draggedIndex];
    newBuckets.splice(draggedIndex, 1);
    newBuckets.splice(index, 0, draggedItem);

    onReorder(newBuckets);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveUp = useCallback(
    (index: number) => {
      if (index <= 0) return;
      const newBuckets = [...buckets];
      [newBuckets[index - 1], newBuckets[index]] = [newBuckets[index], newBuckets[index - 1]];
      onReorder(newBuckets);
    },
    [buckets, onReorder]
  );

  const moveDown = useCallback(
    (index: number) => {
      if (index >= buckets.length - 1) return;
      const newBuckets = [...buckets];
      [newBuckets[index], newBuckets[index + 1]] = [newBuckets[index + 1], newBuckets[index]];
      onReorder(newBuckets);
    },
    [buckets, onReorder]
  );

  return (
    <div>
      <div className="card mb-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-accent-900">Your Buckets</h2>
          <button
            onClick={() => setIsAdding(true)}
            className="btn-primary w-full sm:w-auto flex items-center justify-center px-4 py-2.5 sm:py-2 text-sm"
          >
            + Add Bucket
          </button>
        </div>

        {isAdding && (
          <div className="mb-4 sm:mb-6">
            <BucketForm
              onSave={(config) => {
                onAdd({
                  ...config,
                  order: buckets.length, // Add at the end
                });
                setIsAdding(false);
              }}
              onCancel={() => setIsAdding(false)}
            />
          </div>
        )}

        <div className="space-y-2 sm:space-y-3">
          {buckets.length === 0 ? (
            <div className="text-center py-10 sm:py-12 text-accent-500 text-sm sm:text-base">
              No buckets configured. Add your first bucket to get started.
            </div>
          ) : (
            buckets.map((bucket, index) => (
              <div
                key={bucket.id}
                draggable={!isTouch}
                onDragStart={!isTouch ? () => handleDragStart(index) : undefined}
                onDragOver={!isTouch ? (e) => handleDragOver(e, index) : undefined}
                onDragEnd={!isTouch ? handleDragEnd : undefined}
                className={`border-2 rounded-xl p-3 sm:p-4 bg-gradient-to-br from-white to-primary-50/30 transition-all duration-200 ${
                  isTouch ? 'border-accent-200' : 'hover:border-primary-300 cursor-move active:scale-[0.99]'
                } ${draggedIndex === index ? 'opacity-50 border-primary-400' : ''}`}
              >
                <BucketRow
                  bucket={bucket}
                  onUpdate={(updates) => onUpdate(bucket.id, updates)}
                  onDelete={() => {
                    try {
                      onDelete(bucket.id);
                    } catch (error) {
                      alert((error as Error).message || 'Cannot delete bucket with existing expenses');
                    }
                  }}
                  orderIndex={index}
                  totalCount={buckets.length}
                  onMoveUp={() => moveUp(index)}
                  onMoveDown={() => moveDown(index)}
                  showMoveButtons={isTouch}
                />
              </div>
            ))
          )}
        </div>

        {buckets.length > 0 && (
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t-2 border-accent-100 text-xs text-accent-500 text-center">
            {isTouch ? 'Use ↑ ↓ to reorder buckets' : 'Drag and drop to reorder buckets'}
          </div>
        )}
      </div>
    </div>
  );
}

interface BucketRowProps {
  bucket: BucketConfig;
  onUpdate: (updates: Partial<BucketConfig>) => void;
  onDelete: () => void;
  orderIndex?: number;
  totalCount?: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  showMoveButtons?: boolean;
}

function BucketRow({ bucket, onUpdate, onDelete, orderIndex = 0, totalCount = 0, onMoveUp, onMoveDown, showMoveButtons }: BucketRowProps) {
  const canMoveUp = orderIndex > 0;
  const canMoveDown = orderIndex < totalCount - 1;
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(bucket.name);
  const [type, setType] = useState<BucketType>(bucket.type);
  const [paymentDay, setPaymentDay] = useState(bucket.paymentDay?.toString() || '');

  const handleSave = () => {
    onUpdate({
      name: name.trim(),
      type,
      paymentDay: type === 'credit_card' && paymentDay ? parseInt(paymentDay, 10) : undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(bucket.name);
    setType(bucket.type);
    setPaymentDay(bucket.paymentDay?.toString() || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-accent-700 mb-1">
              Bucket Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field w-full text-base sm:text-sm"
              placeholder="e.g., Visa Card"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-accent-700 mb-1">
              Type
            </label>
            <BucketTypeSelect value={type} onChange={(v) => setType(v)} />
          </div>
          {type === 'credit_card' && (
            <div>
              <label className="block text-xs font-medium text-accent-700 mb-1">
                Payment Day (1-31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={paymentDay}
                onChange={(e) => setPaymentDay(e.target.value)}
                className="input-field w-full text-base sm:text-sm"
                placeholder="Day"
              />
            </div>
          )}
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <button onClick={handleCancel} className="btn-secondary text-sm px-4 py-2.5 sm:py-2 flex-1 sm:flex-initial">
            ✕ Cancel
          </button>
          <button onClick={handleSave} className="btn-success text-sm px-4 py-2.5 sm:py-2 flex-1 sm:flex-initial">
            ✓ Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Drag handle (desktop) or Move up/down (mobile) */}
        {showMoveButtons ? (
          <div className="flex flex-col flex-shrink-0 gap-0.5" role="group" aria-label="Reorder bucket">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              aria-label="Move up"
              className="p-2 rounded-lg text-accent-500 hover:bg-accent-100 hover:text-primary-500 disabled:opacity-30 disabled:pointer-events-none min-h-[44px] min-w-[44px] flex items-center justify-center [touch-action:manipulation] active:scale-95 transition-transform"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              aria-label="Move down"
              className="p-2 rounded-lg text-accent-500 hover:bg-accent-100 hover:text-primary-500 disabled:opacity-30 disabled:pointer-events-none min-h-[44px] min-w-[44px] flex items-center justify-center [touch-action:manipulation] active:scale-95 transition-transform"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex-shrink-0 text-accent-300 sm:pr-0" aria-hidden>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 6h2v2H8V6zm0 5h2v2H8v-2zm0 5h2v2H8v-2zm6-10h2v2h-2V6zm0 5h2v2h-2v-2zm0 5h2v2h-2v-2z" />
            </svg>
          </div>
        )}
        <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-xl sm:rounded-lg bg-primary-400 text-white flex items-center justify-center font-bold text-base sm:text-sm flex-shrink-0">
          {bucket.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-accent-900 mb-0.5 sm:mb-1 text-base sm:text-sm">{bucket.name}</div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-accent-600">
            <span className={`px-2 py-1 rounded-full ${
              bucket.type === 'cash'
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {bucket.type === 'cash' ? 'Cash' : 'Credit Card'}
            </span>
            {bucket.type === 'credit_card' && bucket.paymentDay && (
              <span className="text-accent-500">
                Payment day: {bucket.paymentDay}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => setIsEditing(true)}
          className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-0 px-4 py-2.5 sm:px-3 sm:py-1.5 text-sm sm:text-xs bg-primary-400 text-white rounded-lg hover:bg-primary-500 active:scale-95 transition-all duration-200 font-medium"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 sm:flex-initial btn-danger text-sm sm:text-xs px-4 sm:px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

interface BucketFormProps {
  onSave: (config: Omit<BucketConfig, 'id' | 'order'>) => void;
  onCancel: () => void;
}

function BucketForm({ onSave, onCancel }: BucketFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<BucketType>('cash');
  const [paymentDay, setPaymentDay] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    
    onSave({
      name: name.trim(),
      type,
      paymentDay: type === 'credit_card' && paymentDay ? parseInt(paymentDay, 10) : undefined,
    });
    
    setName('');
    setType('cash');
    setPaymentDay('');
  };

  return (
    <div className="border-2 border-primary-300 rounded-xl p-4 sm:p-5 bg-primary-50/50">
      <h3 className="font-semibold text-accent-900 mb-3 sm:mb-4 text-base sm:text-sm">Add New Bucket</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-accent-700 mb-1">
            Bucket Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') onCancel();
            }}
            className="input-field w-full text-base sm:text-sm"
            placeholder="e.g., Visa Card"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-accent-700 mb-1">
            Type
          </label>
          <BucketTypeSelect value={type} onChange={(v) => setType(v)} />
        </div>
        {type === 'credit_card' && (
          <div>
            <label className="block text-xs font-medium text-accent-700 mb-1">
              Payment Day (1-31)
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={paymentDay}
              onChange={(e) => setPaymentDay(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') onCancel();
              }}
              className="input-field w-full text-base sm:text-sm"
              placeholder="Day"
            />
          </div>
        )}
      </div>
      <div className="flex flex-col-reverse sm:flex-row gap-2">
        <button onClick={onCancel} className="btn-secondary text-sm px-4 py-2.5 sm:py-2 flex-1 sm:flex-initial">
          ✕ Cancel
        </button>
        <button onClick={handleSave} className="btn-success text-sm px-4 py-2.5 sm:py-2 flex-1 sm:flex-initial">
          ✓ Add Bucket
        </button>
      </div>
    </div>
  );
}
