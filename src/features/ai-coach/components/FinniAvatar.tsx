'use client';

/** 핀이 SVG 캐릭터 아바타 컴포넌트 — mood별 표정 분기 지원 */

interface FinniAvatarProps {
  size?: number;
  mood?: 'default' | 'happy' | 'thinking' | 'excited';
}

export function FinniAvatar({ size = 64, mood = 'default' }: FinniAvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 그림자 */}
      <ellipse cx="32" cy="61" rx="18" ry="4" fill="rgba(0,0,0,0.1)"/>

      {/* 그라데이션 정의 */}
      <defs>
        <linearGradient id="finniBodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60A5FA"/>
          <stop offset="100%" stopColor="#2563EB"/>
        </linearGradient>
      </defs>

      {/* 팔 (몸통 뒤) */}
      <rect x="0" y="26" width="10" height="16" rx="5" fill="#93C5FD"/>
      <rect x="54" y="26" width="10" height="16" rx="5" fill="#93C5FD"/>

      {/* 손 */}
      <circle cx="5" cy="43" r="5" fill="#BFDBFE"/>
      <circle cx="59" cy="43" r="5" fill="#BFDBFE"/>

      {/* 안테나 */}
      <rect x="29" y="6" width="6" height="14" rx="3" fill="#93C5FD"/>
      <circle cx="32" cy="5" r="4" fill="#FBBF24"/>
      <circle cx="34" cy="3" r="1.5" fill="white" opacity="0.8"/>

      {/* 몸통 */}
      <rect x="8" y="18" width="48" height="38" rx="16" fill="url(#finniBodyGrad)"/>

      {/* 배꼽 */}
      <circle cx="32" cy="49" r="3" fill="rgba(255,255,255,0.25)"/>

      {/* 볼터치 */}
      <ellipse cx="14" cy="38" rx="5" ry="3" fill="rgba(251,113,133,0.45)"/>
      <ellipse cx="50" cy="38" rx="5" ry="3" fill="rgba(251,113,133,0.45)"/>

      {/* 눈 (mood별) */}
      {mood === 'default' && (
        <>
          <circle cx="22" cy="32" r="7" fill="white"/>
          <circle cx="42" cy="32" r="7" fill="white"/>
          <circle cx="23" cy="33" r="4" fill="#1D4ED8"/>
          <circle cx="43" cy="33" r="4" fill="#1D4ED8"/>
          <circle cx="25" cy="31" r="1.5" fill="white"/>
          <circle cx="45" cy="31" r="1.5" fill="white"/>
        </>
      )}
      {mood === 'happy' && (
        <>
          {/* 초승달 눈 ^_^ */}
          <path d="M15 36 Q22 27 29 36" stroke="#1D4ED8" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M35 36 Q42 27 49 36" stroke="#1D4ED8" strokeWidth="3" fill="none" strokeLinecap="round"/>
        </>
      )}
      {mood === 'thinking' && (
        <>
          {/* 왼쪽 일반 눈 */}
          <circle cx="22" cy="32" r="7" fill="white"/>
          <circle cx="23" cy="33" r="4" fill="#1D4ED8"/>
          <circle cx="25" cy="31" r="1.5" fill="white"/>
          {/* 오른쪽 찡긋 */}
          <path d="M35 32 Q42 28 49 32" stroke="#1D4ED8" strokeWidth="3" fill="none" strokeLinecap="round"/>
          {/* 생각 점 */}
          <circle cx="50" cy="20" r="2" fill="#93C5FD"/>
          <circle cx="55" cy="15" r="2.5" fill="#93C5FD"/>
          <circle cx="61" cy="10" r="3" fill="#93C5FD"/>
        </>
      )}
      {mood === 'excited' && (
        <>
          {/* 별 눈 */}
          <text x="13" y="39" fontSize="14" fill="#FBBF24">★</text>
          <text x="33" y="39" fontSize="14" fill="#FBBF24">★</text>
        </>
      )}

      {/* 입 (mood별) */}
      {(mood === 'default' || mood === 'thinking') && (
        <path d="M24 44 Q32 50 40 44" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      )}
      {mood === 'happy' && (
        <path d="M22 44 Q32 52 42 44" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      )}
      {mood === 'excited' && (
        <>
          <path d="M21 43 Q32 53 43 43" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          {/* 이빨 */}
          <path d="M26 45 Q32 50 38 45" stroke="none" fill="rgba(255,255,255,0.4)"/>
        </>
      )}
    </svg>
  );
}

export default FinniAvatar;
