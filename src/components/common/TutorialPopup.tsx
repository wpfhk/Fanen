'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/** 튜토리얼 단계 정의 */
export interface TutorialStep {
  title: string;
  description: string;
  emoji: string;
}

/** TutorialPopup 컴포넌트 Props */
export interface TutorialPopupProps {
  /** localStorage 키 식별자 (fanen-tutorial-{pageKey}-skip) */
  pageKey: string;
  /** 팝업 상단 제목 */
  tutorialTitle: string;
  /** 튜토리얼 스텝 배열 */
  steps: TutorialStep[];
}

/** 오늘 날짜를 YYYY-MM-DD 형식으로 반환 */
function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * 탭별 튜토리얼 팝업 컴포넌트
 * - localStorage로 "오늘 하루 보지 않기" 상태 관리
 * - 스텝 기반 튜토리얼 (이전/다음 탐색)
 * - framer-motion 애니메이션 적용
 */
export default function TutorialPopup({ pageKey, tutorialTitle, steps }: TutorialPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const storageKey = `fanen-tutorial-${pageKey}-skip`;

  // 마운트 시 localStorage 확인하여 표시 여부 결정
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    const today = getTodayString();

    // 저장된 날짜가 오늘이면 표시하지 않음
    if (stored === today) return;

    setIsVisible(true);
  }, [storageKey]);

  /** "오늘 하루 보지 않기" 클릭 → 오늘 날짜 저장 후 닫기 */
  function handleSkipToday() {
    localStorage.setItem(storageKey, getTodayString());
    setIsVisible(false);
  }

  /** "닫기" 클릭 → 세션에서만 닫힘 (localStorage 저장 없음) */
  function handleClose() {
    setIsVisible(false);
  }

  /** 이전 스텝으로 이동 */
  function handlePrev() {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }

  /** 다음 스텝으로 이동 */
  function handleNext() {
    setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
  }

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  return (
    <AnimatePresence>
      {isVisible && (
        // 오버레이
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          {/* 모달 (클릭 이벤트 버블링 차단) */}
          <motion.div
            className="relative mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 팝업 제목 */}
            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-zinc-100">
              {tutorialTitle}
            </h2>

            {/* 현재 스텝 콘텐츠 */}
            <div className="mb-5 text-center">
              <span className="mb-3 block text-4xl">{step.emoji}</span>
              <p className="mb-1 text-base font-semibold text-gray-800 dark:text-zinc-200">
                {step.title}
              </p>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-zinc-400">
                {step.description}
              </p>
            </div>

            {/* 스텝 인디케이터 */}
            <div className="mb-5 flex items-center justify-center gap-1.5">
              {steps.map((_, idx) => (
                <span
                  key={idx}
                  className={`block h-2 w-2 rounded-full transition-colors ${
                    idx === currentStep
                      ? 'bg-zinc-700 dark:bg-zinc-300'
                      : 'bg-gray-200 dark:bg-zinc-700'
                  }`}
                />
              ))}
            </div>

            {/* 이전/다음 네비게이션 */}
            {steps.length > 1 && (
              <div className="mb-5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={isFirst}
                  className="text-sm text-zinc-600 disabled:cursor-not-allowed disabled:opacity-30 dark:text-zinc-400"
                >
                  ← 이전
                </button>
                <span className="text-xs text-gray-400 dark:text-zinc-500">
                  {currentStep + 1} / {steps.length}
                </span>
                {!isLast ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="text-sm text-zinc-600 dark:text-zinc-400"
                  >
                    다음 →
                  </button>
                ) : (
                  /* 마지막 스텝: 완료 버튼 (닫기와 동일) */
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-sm font-medium text-teal-600 dark:text-teal-400"
                  >
                    완료 ✓
                  </button>
                )}
              </div>
            )}

            {/* 하단 액션 버튼 */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleSkipToday}
                className="text-xs text-gray-400 underline dark:text-zinc-500"
              >
                오늘 하루 보지 않기
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                닫기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
