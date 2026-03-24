'use client';
import type { GlobalNewsItem } from '@/lib/mock/mockGlobalNews';
import { CATEGORY_LABELS } from '@/lib/mock/mockGlobalNews';

interface Props {
  item: GlobalNewsItem;
  isSelected: boolean;
  onClick: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  rate: 'bg-blue-100 text-blue-700',
  geopolitics: 'bg-red-100 text-red-700',
  commodity: 'bg-yellow-100 text-yellow-700',
  trade: 'bg-purple-100 text-purple-700',
  tech: 'bg-green-100 text-green-700',
};

export default function GlobalNewsCard({ item, isSelected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 bg-white hover:border-blue-300 dark:bg-slate-800 dark:border-slate-700'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[item.category]}`}>
          {CATEGORY_LABELS[item.category]}
        </span>
        <span className="text-xs text-gray-400">{item.source}</span>
        <span className="text-xs text-gray-400 ml-auto">{item.date}</span>
      </div>
      <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-1 line-clamp-2">{item.title}</p>
      <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2">{item.summary}</p>
    </button>
  );
}
