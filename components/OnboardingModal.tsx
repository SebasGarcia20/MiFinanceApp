'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FlowlyMark from './FlowlyMark';
import { useTranslation } from '@/hooks/useTranslation';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const totalSteps = 2;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    onComplete();
    onClose();
  };

  const goToSettings = () => {
    handleComplete();
    router.push('/settings');
  };

  const goToBuckets = () => {
    handleComplete();
    router.push('/buckets');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-soft-lg max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-accent-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <FlowlyMark size={32} className="text-primary-500" />
            <h2 className="text-xl font-bold text-accent-900">{t('onboarding.welcome')}</h2>
          </div>
          <button
            onClick={handleSkip}
            className="text-accent-400 hover:text-accent-600 transition-colors"
            aria-label="Skip onboarding"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-4">
          <div className="h-1.5 bg-accent-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-primary-300 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <div className="text-xs text-accent-500 mt-2 text-center">
            {t('common.step') || 'Step'} {currentStep} {t('common.of') || 'of'} {totalSteps}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-accent-900 mb-2">{t('onboarding.step1Title')}</h3>
                <p className="text-accent-600 mb-4">
                  {t('onboarding.step1Description')}
                </p>
              </div>

              <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-400 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-accent-900 mb-1">{t('onboarding.whatIsPeriodStartDay')}</p>
                    <p className="text-xs text-accent-600 whitespace-pre-line">
                      {t('onboarding.whatIsPeriodStartDayDescription')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-400 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-accent-900 mb-1">{t('onboarding.examples')}</p>
                    <p className="text-xs text-accent-600 whitespace-pre-line">
                      {t('onboarding.periodExamples')}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={goToSettings}
                className="w-full btn-primary py-3 text-base font-semibold"
              >
                {t('onboarding.goToSettings')}
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-accent-900 mb-2">{t('onboarding.step2Title')}</h3>
                <p className="text-accent-600 mb-4">
                  {t('onboarding.step2Description')}
                </p>
              </div>

              <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-400 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-accent-900 mb-1">{t('onboarding.whatAreBuckets')}</p>
                    <p className="text-xs text-accent-600">
                      {t('onboarding.whatAreBucketsDescription')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-400 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-accent-900 mb-1">{t('onboarding.creditCardSetup')}</p>
                    <p className="text-xs text-accent-600">
                      {t('onboarding.creditCardSetupDescription')}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={goToBuckets}
                className="w-full btn-primary py-3 text-base font-semibold"
              >
                {t('onboarding.goToBuckets')}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-accent-50 border-t border-accent-200 px-6 py-4 flex items-center justify-between rounded-b-2xl">
          <button
            onClick={handleSkip}
            className="text-sm text-accent-500 hover:text-accent-700 font-medium transition-colors"
          >
            {t('onboarding.skipTutorial')}
          </button>
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="btn-secondary text-sm px-4 py-2"
              >
                {t('common.previous')}
              </button>
            )}
            <button
              onClick={handleNext}
              className="btn-primary text-sm px-6 py-2"
            >
              {currentStep === totalSteps ? t('onboarding.getStarted') : t('common.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
