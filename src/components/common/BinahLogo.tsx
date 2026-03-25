'use client';
/**
 * FanenLogo 컴포넌트
 * 틸 컬러 기하학적 허브 심볼 + "파낸" 워드마크
 * framer-motion으로 pathLength, scale 애니메이션
 */
import { motion } from 'framer-motion';
import Link from 'next/link';

// 위성 점 좌표 (중앙 12,12 기준, 반지름 8)
const SATELLITES = [
  { cx: 12, cy: 4 },    // 위 (-90°)
  { cx: 19, cy: 16 },   // 우하 (30°)
  { cx: 5, cy: 16 },    // 좌하 (150°)
];

// 중앙 → 위성 연결선
const LINES = [
  'M 12 12 L 12 4',
  'M 12 12 L 19 16',
  'M 12 12 L 5 16',
];

export function BinahLogo() {
  return (
    <Link href="/">
      <motion.div
        className="flex items-center gap-2 cursor-pointer"
        whileHover="hover"
      >
        {/* 무채색 허브 심볼 */}
        <motion.svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          className="text-zinc-700 dark:text-zinc-300"
          variants={{ hover: { scale: 1.08 } }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{ transformOrigin: 'center' }}
        >
          {/* 외부 pulse 링 */}
          <motion.circle
            cx={12}
            cy={12}
            r={10.5}
            fill="none"
            stroke="#71717a"
            strokeWidth={0.7}
            animate={{ opacity: [0.12, 0.28, 0.12], scale: [1, 1.07, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '12px', originY: '12px' }}
          />

          {/* 연결선 3개 — zinc */}
          {LINES.map((d, i) => (
            <motion.path
              key={i}
              d={d}
              stroke="#52525b"
              strokeWidth={1.6}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, delay: i * 0.15, ease: 'easeOut' }}
            />
          ))}

          {/* 중앙 점 — zinc-800 */}
          <motion.circle
            cx={12}
            cy={12}
            r={2.8}
            fill="#27272a"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'backOut' }}
            style={{ originX: '12px', originY: '12px' }}
          />

          {/* 위성 점 3개 — zinc-500 */}
          {SATELLITES.map((s, i) => (
            <motion.circle
              key={i}
              cx={s.cx}
              cy={s.cy}
              r={2}
              fill="#71717a"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.5 + i * 0.1, ease: 'backOut' }}
              style={{ originX: `${s.cx}px`, originY: `${s.cy}px` }}
            />
          ))}
        </motion.svg>

        {/* 파낸 워드마크 */}
        <div style={{ display: 'inline-block' }}>
          <motion.span
            className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 block leading-tight"
            variants={{ hover: { scale: 1.05 } }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            style={{ transformOrigin: 'left center' }}
          >
            파낸
          </motion.span>
          <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 block leading-tight whitespace-nowrap">
            반디가 찾아주는 투자 기회
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
