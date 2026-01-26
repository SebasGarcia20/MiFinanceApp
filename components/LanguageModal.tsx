'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Language } from '@/lib/translations';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LanguageModal({ isOpen, onClose }: LanguageModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { language: currentLanguage, setLanguage, t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(currentLanguage);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedLanguage(currentLanguage);
    }
  }, [isOpen, currentLanguage]);

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

  const handleLanguageSelect = async (lang: Language) => {
    setSelectedLanguage(lang);
    setIsSaving(true);
    try {
      await setLanguage(lang);
      onClose();
    } catch (error) {
      console.error('Error saving language:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const languages = [
    { code: 'es' as Language, name: 'Español', nativeName: 'Spanish' },
    { code: 'en' as Language, name: 'English', nativeName: 'English (US)' },
  ];

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
            <h2 className="text-2xl font-bold text-accent-900 mb-1">{t('profile.language')}</h2>
            <div className="h-0.5 w-12 bg-primary-400 rounded-full"></div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-accent-700 mb-3">
                {t('settings.selectLanguage') || 'Select Language'}
              </label>
              <div className="space-y-2">
                {languages.map((lang) => {
                  const isSelected = selectedLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang.code)}
                      disabled={isSaving}
                      className={`w-full flex items-center justify-between px-4 py-3 border-2 rounded-lg text-left transition-colors ${
                        isSelected
                          ? 'border-primary-400 bg-primary-50'
                          : 'border-accent-200 hover:bg-accent-50'
                      } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div>
                        <div className={`font-medium ${isSelected ? 'text-accent-900' : 'text-accent-700'}`}>
                          {lang.name}
                        </div>
                        <div className="text-xs text-accent-500">{lang.nativeName}</div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          isSelected
                            ? 'bg-primary-400 border-primary-400'
                            : 'border-accent-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-accent-200 flex justify-end">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="btn-primary"
            >
              {isSaving ? t('common.saving') : t('common.done')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
