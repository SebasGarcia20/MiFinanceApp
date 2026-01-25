'use client';

import { useEffect, useRef } from 'react';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LanguageModal({ isOpen, onClose }: LanguageModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-soft-lg border border-accent-200 w-full max-w-md animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-accent-900 mb-1">Language</h2>
            <div className="h-0.5 w-12 bg-primary-400 rounded-full"></div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-accent-700 mb-3">
                Select Language
              </label>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between px-4 py-3 border-2 border-primary-400 rounded-lg bg-primary-50 text-left">
                  <div>
                    <div className="font-medium text-accent-900">English</div>
                    <div className="text-xs text-accent-500">English (US)</div>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-primary-400 border-2 border-primary-400"></div>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 border-2 border-accent-200 rounded-lg hover:bg-accent-50 text-left transition-colors">
                  <div>
                    <div className="font-medium text-accent-700">Español</div>
                    <div className="text-xs text-accent-500">Spanish</div>
                  </div>
                  <div className="w-4 h-4 rounded-full border-2 border-accent-300"></div>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 border-2 border-accent-200 rounded-lg hover:bg-accent-50 text-left transition-colors">
                  <div>
                    <div className="font-medium text-accent-700">Français</div>
                    <div className="text-xs text-accent-500">French</div>
                  </div>
                  <div className="w-4 h-4 rounded-full border-2 border-accent-300"></div>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-accent-200 flex justify-end">
            <button onClick={onClose} className="btn-primary">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
