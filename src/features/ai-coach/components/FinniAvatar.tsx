/** 핀이 SVG 캐릭터 아바타 컴포넌트 */
export function FinniAvatar({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 몸통 */}
      <rect x="8" y="16" width="32" height="28" rx="8" fill="#3B82F6" />
      {/* 눈 */}
      <circle cx="18" cy="26" r="4" fill="white" />
      <circle cx="30" cy="26" r="4" fill="white" />
      <circle cx="19" cy="27" r="2" fill="#1D4ED8" />
      <circle cx="31" cy="27" r="2" fill="#1D4ED8" />
      {/* 입 */}
      <path d="M18 35 Q24 39 30 35" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* 머리 안테나 */}
      <rect x="22" y="6" width="4" height="10" rx="2" fill="#60A5FA" />
      <circle cx="24" cy="5" r="3" fill="#FBBF24" />
      {/* 팔 */}
      <rect x="2" y="22" width="6" height="12" rx="3" fill="#60A5FA" />
      <rect x="40" y="22" width="6" height="12" rx="3" fill="#60A5FA" />
    </svg>
  );
}
