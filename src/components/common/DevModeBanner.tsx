'use client';

const DEV_UNLOCK = process.env.NEXT_PUBLIC_DEV_UNLOCK_PRO === 'true';

export default function DevModeBanner() {
  if (!DEV_UNLOCK) return null;

  return (
    <div className="sticky top-0 z-50 bg-yellow-400 text-yellow-900 py-1.5 px-4 text-center text-sm font-medium">
      🔧 개발 모드 — Pro/Premium 기능 모두 접근 가능 (
      <code className="font-mono text-xs">NEXT_PUBLIC_DEV_UNLOCK_PRO=true</code>)
    </div>
  );
}
