'use client';
/**
 * BinahLogo 컴포넌트
 * 무채색 연결망 SVG 심볼 + "BINAH" 텍스트
 * framer-motion으로 pathLength, scale, letterSpacing 애니메이션
 */
import { motion } from 'framer-motion';
import Link from 'next/link';

// 위성 점 좌표 (중앙 12,12 기준, 반지름 8)
const SATELLITES = [
  { cx: 12, cy: 4 },   // 위 (270° = -90°)
  { cx: 19, cy: 16 },  // 우하 (30°)
  { cx: 5, cy: 16 },   // 좌하 (150°)
];

// 연결선 path d (중앙 → 위성)
const LINES = [
  'M 12 12 L 12 4',
  'M 12 12 L 19 16',
  'M 12 12 L 5 16',
];

export function BinahLogo() {
  return (
    <Link href="/">
      <motion.div
        className="flex items-center gap-2.5 cursor-pointer"
        whileHover="hover"
      >
        {/* SVG 심볼 */}
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className="text-zinc-800 dark:text-zinc-100"
          fill="none"
        >
          {/* 연결선 3개 — pathLength 0→1 애니메이션 */}
          {LINES.map((d, i) => (
            <motion.path
              key={i}
              d={d}
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: i * 0.2, ease: 'easeOut' }}
            />
          ))}

          {/* 중앙 점 */}
          <motion.circle
            cx={12}
            cy={12}
            r={2.5}
            fill="currentColor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* 위성 점 3개 — scale 0→1, opacity 0→1 (delay 0.6s) */}
          {SATELLITES.map((s, i) => (
            <motion.circle
              key={i}
              cx={s.cx}
              cy={s.cy}
              r={2}
              fill="currentColor"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.1, ease: 'backOut' }}
              style={{ originX: `${s.cx}px`, originY: `${s.cy}px` }}
            />
          ))}
        </motion.svg>

        {/* BINAH 텍스트 — hover 시 자간 확장 */}
        <motion.span
          className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100"
          variants={{ hover: { letterSpacing: '0.12em' } }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          BINAH
        </motion.span>

        <span className="text-xs text-zinc-400 hidden sm:block">비나</span>
      </motion.div>
    </Link>
  );
}
