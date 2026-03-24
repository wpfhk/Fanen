'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

/** Toast 메시지 타입 */
type ToastType = 'success' | 'error' | 'info';

/** Toast 아이템 */
interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

/** Toast 타입별 스타일 매핑 */
const TYPE_STYLES: Record<ToastType, string> = {
  success: 'bg-green-600 text-white',
  error: 'bg-danger text-white',
  info: 'bg-primary text-white',
};

/** Toast 타입별 아이콘 */
const TYPE_ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

/** Toast 컨텍스트 값 타입 */
interface ToastContextValue {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** 자동 증가 ID */
let toastId = 0;

/** Toast Provider — layout.tsx에서 래핑 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  /** Toast 추가 — 3초 후 자동 제거 */
  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  /** Toast 수동 제거 */
  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message: string) => addToast('success', message),
    error: (message: string) => addToast('error', message),
    info: (message: string) => addToast('info', message),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast 컨테이너 — 우하단 고정 */}
      <div className="fixed bottom-20 right-4 z-[100] flex flex-col gap-2 md:bottom-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm shadow-lg transition-all ${TYPE_STYLES[t.type]}`}
            role="alert"
          >
            <span className="font-bold">{TYPE_ICONS[t.type]}</span>
            <span>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-2 opacity-70 hover:opacity-100"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Toast 훅 — 컴포넌트에서 toast.success/error/info 호출 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast는 ToastProvider 내부에서 사용해야 합니다');
  }
  return context;
}
