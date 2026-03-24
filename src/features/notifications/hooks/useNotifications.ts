import { useState } from 'react';
import { USE_MOCK } from '@/lib/mock';

/** 알림 아이템 타입 */
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'signal' | 'report' | 'system';
  isRead: boolean;
  createdAt: string;
}

/** Mock 알림 데이터 */
const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: '1', title: '삼성전자 매수 신호', message: 'AI가 삼성전자(005930)에 대해 매수 신호를 발생시켰습니다.', type: 'signal', isRead: false, createdAt: new Date().toISOString() },
  { id: '2', title: '월간 리포트 생성 완료', message: '3월 AI 맞춤 리포트가 준비되었습니다.', type: 'report', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', title: '포트폴리오 수익률 알림', message: '포트폴리오 수익률이 목표치 10%를 달성했습니다.', type: 'info', isRead: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: '4', title: '배당금 입금 예정', message: 'SK텔레콤 배당금 입금 예정일: 2026-04-15', type: 'info', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '5', title: '시스템 점검 안내', message: '3/25(화) 02:00~04:00 시스템 점검이 예정되어 있습니다.', type: 'system', isRead: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
];

/** 알림 훅 — Mock 모드에서는 샘플 알림 5건 반환 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    USE_MOCK ? MOCK_NOTIFICATIONS : [],
  );

  /** 알림 읽음 처리 */
  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  }

  /** 모두 읽음 처리 */
  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, unreadCount, markAsRead, markAllAsRead, loading: false };
}
